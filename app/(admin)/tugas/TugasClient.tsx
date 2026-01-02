
"use client";

import { useEffect, useState } from "react";
import { Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ListTodo
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import TugasTable from "@/app/components/dashboard/TugasTable";
import TugasModal from "@/app/components/dashboard/TugasModal";
import TugasStats from "@/app/components/dashboard/TugasStats";

interface TugasClientProps {
  initialTasks: Tugas[];
  initialTeknisiList: Akun[];
  initialPeralatanList: Peralatan[];
  currentUser: { nip?: string; role?: string } | null;
}

export default function TugasClient({ 
  initialTasks, 
  initialTeknisiList, 
  initialPeralatanList,
  currentUser 
}: TugasClientProps) {
  const [tasks, setTasks] = useState<Tugas[]>(initialTasks);
  const [teknisiList, setTeknisiList] = useState<Akun[]>(initialTeknisiList);
  const [peralatanList, setPeralatanList] = useState<Peralatan[]>(initialPeralatanList);
  
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tugas | null>(null);
  
  const refreshData = async () => {
    try {
      setLoading(true);

      // Re-fetch everything to be safe, or just tasks? Just tasks usually.
      // But let's re-fetch lists too if they might change.
      // For now, focusing on tasks is enough for "Refresh Data".
      
      let query = supabase
        .from('tugas')
        .select(`
            *,
            peralatan (*),
            dibuat_oleh:akun!fk_tugas_pembuat (nama, nip),
            ditugaskan_ke:akun!fk_tugas_teknisi (nama, nip)
        `)
        .order('status', { ascending: true }) // PENDING first
        .order('dibuat_kapan', { ascending: false });

      // Apply same filtering logic as server
      const userRole = currentUser?.role || "";
      const userNip = currentUser?.nip || "";
      const canManage = userRole === 'KANIT_ELBAN';
      const isKanitOrAdmin = ['KANIT_ELBAN', 'UNIT_ADMIN', 'ADMIN'].includes(userRole);
      
      if (!isKanitOrAdmin && userRole.includes('TEKNISI')) {
          if (userNip) {
            query = query.eq('ditugaskan_ke_nip', userNip);
          }
      }

      const { data: tasksData, error } = await query;
      if (error) throw error;
      
      setTasks(tasksData as unknown as Tugas[] || []);

    } catch (err) {
      console.error("Error fetching tugas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleDelete = async (id: number | number[]) => {
    const ids = Array.isArray(id) ? id : [id];
    if (!confirm(`Apakah Anda yakin ingin menghapus ${ids.length > 1 ? ids.length + ' ' : ''}tugas ini?`)) return;
    
    try {
        const { error } = await supabase.from('tugas').delete().in('id', ids);
        if (error) throw error;
        // Refresh locally or refetch
        setTasks(prev => prev.filter(t => !ids.includes(t.id)));
    } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
    }
  };

  const handleStatusChange = async (id: number | number[], newStatus: 'PENDING' | 'PROSES' | 'SELESAI') => {
    const ids = Array.isArray(id) ? id : [id];
    try {
        // Optimistic update
        setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: newStatus } : t));

        const { error } = await supabase
            .from('tugas')
            .update({ status: newStatus, diupdate_kapan: new Date().toISOString() })
            .in('id', ids);
        
        if (error) throw error;
    } catch (err: any) {
        alert("Gagal update status: " + err.message);
        refreshData(); // Revert
    }
  };

  const canManage = currentUser?.role === 'KANIT_ELBAN';
  
  // Robust filtering: Check 'sumber' OR 'deskripsi' for various log-generated patterns
  const isLogTask = (t: Tugas) => {
      const isAutoSource = t.sumber && t.sumber.startsWith('Log Otomatis');
      const isAutoDesc = t.deskripsi && (
          t.deskripsi.includes('Dibuat otomatis dari Log Harian') || 
          t.deskripsi.includes('Dibuat otomatis dari Edit Log') ||
          t.deskripsi.startsWith('Log ') // Catch new format "Log 31 Dec..."
      );
      return isAutoSource || isAutoDesc;
  };

  // Filters for Manual Tasks
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());

  // Filters for Log Tasks
  const [searchQueryLog, setSearchQueryLog] = useState("");
  const [statusFilterLog, setStatusFilterLog] = useState("all");
  const [dateFilterLog, setDateFilterLog] = useState<Date | null>(new Date());

  const filterFunction = (taskList: Tugas[], queryStr: string, statusStr: string, dateObj: Date | null) => {
      return taskList.filter(item => {
          // Search
          const query = queryStr.toLowerCase();
          const matchSearch = (
              item.judul?.toLowerCase().includes(query) ||
              (item.deskripsi && item.deskripsi.toLowerCase().includes(query))
          );
          
          // Status Filter
          const matchStatus = statusStr === "all" || item.status === statusStr;

          // Date Filter matches *Month Created*
          const itemDate = new Date(item.dibuat_kapan);
          const matchDate = dateObj 
             ? itemDate.getFullYear() === dateObj.getFullYear() && itemDate.getMonth() === dateObj.getMonth()
             : true;

          return matchSearch && matchStatus && matchDate;
      });
  };

  const manualTasks = filterFunction(tasks.filter(t => !isLogTask(t)), searchQuery, statusFilter, dateFilter);
  const logTasks = filterFunction(tasks.filter(t => isLogTask(t)), searchQueryLog, statusFilterLog, dateFilterLog);

  return (
    <div className="space-y-8">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20"
              >
                 <ListTodo className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                  Manajemen Tugas
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">
               Kelola penugasan teknisi dan perbaikan peralatan.
           </p>
        </div>
            
            <div className="flex items-center gap-3">
                {canManage && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span className="hidden lg:inline">Tambah Tugas</span>
                        <span className="lg:hidden">Baru</span>
                    </button>
                )}

 
            </div>
        </motion.div>

        <TugasStats data={tasks} />

        {/* Manual Tasks Table (Kanit Only) */}
      {/* Search & Filter */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative w-full md:flex-1 md:max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
            </select>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                 <input 
                     type="month"
                     value={dateFilter ? dateFilter.toISOString().slice(0, 7) : ''}
                     onChange={(e) => {
                         if (e.target.value) {
                             setDateFilter(new Date(e.target.value + "-01"));
                         }
                     }}
                     className="w-full md:w-auto h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                 />
             </div>
         </div>

         {/* Action Button Moved Here */}
         {canManage && (
            <div className="ml-auto w-full md:w-auto flex justify-end">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
                >
                    <Plus size={16} />
                    <span className="hidden lg:inline">Tambah Tugas</span>
                    <span className="lg:hidden">Baru</span>
                </button>
            </div>
         )}
      </motion.div>

        {/* Manual Tasks Table (Kanit Only) */}
        <div className="space-y-4">
            <TugasTable 
                title="Tugas Kanit Elban"
                data={manualTasks} 
                loading={loading}
                onEdit={(item) => setEditingItem(item)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                currentUserNip={currentUser?.nip}
                isKanitOrAdmin={canManage}
            />
        </div>

        {/* Log Generated Tasks Table */}
      {/* Search & Filter Log Tasks */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col md:flex-row gap-3 pt-6 border-t border-white/5"
      >
        <div className="relative w-full md:flex-1 md:max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari tugas log..."
            value={searchQueryLog}
            onChange={(e) => setSearchQueryLog(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
                value={statusFilterLog}
                onChange={(e) => setStatusFilterLog(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
            </select>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                 <input 
                     type="month"
                     value={dateFilterLog ? dateFilterLog.toISOString().slice(0, 7) : ''}
                     onChange={(e) => {
                         if (e.target.value) {
                             setDateFilterLog(new Date(e.target.value + "-01"));
                         }
                     }}
                     className="w-full md:w-auto h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                 />
             </div>
         </div>
      </motion.div>

        <div className="space-y-4">
             <TugasTable 
                title="Tugas dari Log Peralatan"
                data={logTasks} 
                loading={loading}
                onEdit={(item) => setEditingItem(item)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                currentUserNip={currentUser?.nip}
                isKanitOrAdmin={canManage}
            />
        </div>

        {/* Modals */}
        <TugasModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={refreshData}
            teknisiList={teknisiList}
            peralatanList={peralatanList}
        />
        
        {editingItem && (
            <TugasModal 
                isOpen={!!editingItem} 
                onClose={() => setEditingItem(null)} 
                onSuccess={refreshData}
                teknisiList={teknisiList}
                peralatanList={peralatanList}
                initialData={editingItem}
            />
        )}
    </div>
  );
}
