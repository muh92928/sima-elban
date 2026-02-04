
"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  X,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import TugasTable from "@/app/components/dashboard/TugasTable";
import TugasModal from "@/app/components/dashboard/TugasModal";
import { notify } from "@/lib/notify";
import { useSearchParams, useRouter } from "next/navigation";

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
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dateInputLogRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [defaultTaskValues, setDefaultTaskValues] = useState<{ equipmentId?: number; judul?: string; deskripsi?: string } | undefined>(undefined);

  // Check for deep link "create" action
  useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'create') {
          const eqId = searchParams.get('equipmentId');
          const eqName = searchParams.get('equipmentName');
          
          if (eqId) {
              setDefaultTaskValues({
                  equipmentId: Number(eqId),
                  judul: eqName ? `Maintenance: ${eqName}` : undefined,
                  deskripsi: "Jadwal pemeliharaan berkala otomatis."
              });
          }
          setIsAddModalOpen(true);
          // Optional: Clean URL
          // router.replace('/tugas', { scroll: false }); 
      }
  }, [searchParams]);
  
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
      const userRole = effectiveRole || "";
      const userNip = effectiveNip || "";
      const isKanitOrAdmin = ['KANIT_ELBAN', 'UNIT_ADMIN', 'ADMIN'].includes(userRole);
      
      if (!isKanitOrAdmin) {
          if (userNip) {
            query = query.eq('ditugaskan_ke_nip', userNip);
          } else {
             // If no role/nip, ideally we should show nothing
             setTasks([]);
             setLoading(false);
             return;
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
        notify.success("Tugas berhasil dihapus");
    } catch (err: any) {
        notify.error("Gagal menghapus: " + err.message);
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
        // notify.success("Status diperbarui"); // Optional: clean UI means maybe no toast for quick status updates? Or yes? User wants standardization.
        // Let's add success toast for clarity since it's an important action.
        notify.success("Status tugas diperbarui");
    } catch (err: any) {
        notify.error("Gagal update status: " + err.message);
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

  // State for user role fallback if server action fails to populate it
  const [localUserRole, setLocalUserRole] = useState<string | null>(currentUser?.role || null);
  const [localUserNip, setLocalUserNip] = useState<string | null>(currentUser?.nip || null);

  useEffect(() => {
     // If currentUser prop is missing role, try to fetch it client-side
     if (!currentUser?.role) {
         const fetchUser = async () => {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 const { data: akun } = await supabase
                    .from('akun')
                    .select('peran, nip')
                    .eq('email', user.email!)
                    .single();
                 
                 if (akun) {
                     setLocalUserRole((akun.peran || "").toUpperCase().replace(/ /g, '_'));
                     setLocalUserNip(akun.nip);
                 }
             }
         };
         fetchUser();
     }
  }, [currentUser]);

  const effectiveRole = currentUser?.role || localUserRole;
  const effectiveNip = currentUser?.nip || localUserNip;
  const isKanitOrAdmin = effectiveRole?.includes('KANIT') || effectiveRole?.includes('ADMIN');
  // Only allow "Manage" buttons for Kanit/Admin
  // const canManage = isKanitOrAdmin; // This line is already defined above, so commenting out to avoid redeclaration.
  
  // Filters for Manual Tasks
  // Filters for Manual Tasks
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Filters for Log Tasks
  const [searchQueryLog, setSearchQueryLog] = useState("");
  const [statusFilterLog, setStatusFilterLog] = useState("all");
  const [dateFilterLog, setDateFilterLog] = useState<Date | null>(null);

  // No default month filter to show "Total Tugas" by default
  useEffect(() => {
    // setDateFilter(null);
    // setDateFilterLog(null);
  }, []);

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
        {/* Header Section - Minimal Centered Style */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-2 mb-6"
        >
            <h1 className="text-3xl @tablet:text-4xl @pc:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 pb-1">
                Manajemen Tugas
            </h1>
            
            <p className="text-slate-400 font-medium text-sm @tablet:text-base max-w-2xl leading-relaxed">
                Kelola instruksi penugasan teknisi dan tindak lanjut perbaikan <br className="hidden @tablet:block" />
                Unit Elektronika Fasilitas Bandara
            </p>


        </motion.div>




        {/* Manual Tasks Table (Kanit Only) */}
      {/* Search & Filter */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col pc:flex-row gap-4"
      >
        {/* Filter Group: Search, Status, Time */}
        <div className="flex flex-col pc:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full pc:flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
          
          {/* Status Filter */}
          <div className="w-full pc:flex-1 relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
              <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70 transition-all font-medium"
              >
                  <option value="all">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROSES">Diproses</option>
                  <option value="SELESAI">Selesai</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={14} />
              </div>
          </div>

          {/* Time Filter */}
          <div className="w-full pc:flex-1 self-stretch pc:self-auto">
               <div className="relative group h-full">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-400 transition-colors z-10" size={18} />
                   <button 
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="w-full h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center group-hover:bg-slate-900/70 font-medium"
                   >
                      {dateFilter ? (
                          new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(dateFilter)
                      ) : (
                          <span className="text-slate-500">Semua Waktu</span>
                      )}
                   </button>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <ChevronDown size={14} />
                   </div>
                   <input 
                       ref={dateInputRef}
                       type="month"
                       value={dateFilter ? dateFilter.toISOString().slice(0, 7) : ''}
                       onChange={(e) => {
                           if (e.target.value) {
                               setDateFilter(new Date(e.target.value + "-01"));
                           } else {
                               setDateFilter(null);
                           }
                       }}
                       className="absolute inset-0 opacity-0 -z-10 pointer-events-none"
                   />
               </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end whitespace-nowrap pt-2 pc:pt-0">
            {canManage && (
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={16} />
                    <span>Tambah Tugas</span>
                </button>
            )}
        </div>
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
                currentUserNip={effectiveNip}
                userRole={effectiveRole}
                isKanitOrAdmin={canManage}
            />
        </div>


       {/* Filter Group Log Tasks: Search, Status, Time */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col pc:flex-row gap-4 pt-6 border-t border-white/5"
      >
        <div className="flex flex-col pc:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full pc:flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari tugas log..."
              value={searchQueryLog}
              onChange={(e) => setSearchQueryLog(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
          
          {/* Status Filter */}
          <div className="w-full pc:flex-1 relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
              <select 
                  value={statusFilterLog}
                  onChange={(e) => setStatusFilterLog(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70 transition-all font-medium"
              >
                  <option value="all">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROSES">Diproses</option>
                  <option value="SELESAI">Selesai</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={14} />
              </div>
          </div>

          {/* Time Filter */}
          <div className="w-full pc:flex-1 self-stretch pc:self-auto">
               <div className="relative group h-full">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-400 transition-colors z-10" size={18} />
                   <button 
                      onClick={() => dateInputLogRef.current?.showPicker()}
                      className="w-full h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center group-hover:bg-slate-900/70 font-medium"
                   >
                      {dateFilterLog ? (
                          new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(dateFilterLog)
                      ) : (
                          <span className="text-slate-500">Semua Waktu</span>
                      )}
                   </button>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <ChevronDown size={14} />
                   </div>
                   <input 
                       ref={dateInputLogRef}
                       type="month"
                       value={dateFilterLog ? dateFilterLog.toISOString().slice(0, 7) : ''}
                       onChange={(e) => {
                           if (e.target.value) {
                               setDateFilterLog(new Date(e.target.value + "-01"));
                           } else {
                               setDateFilterLog(null);
                           }
                       }}
                       className="absolute inset-0 opacity-0 -z-10 pointer-events-none"
                   />
               </div>
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
                currentUserNip={effectiveNip}
                userRole={effectiveRole}
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
            defaultValues={defaultTaskValues}
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
