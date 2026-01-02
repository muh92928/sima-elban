"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import TugasTable from "@/app/components/dashboard/TugasTable";
import TugasModal from "@/app/components/dashboard/TugasModal";

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

  const manualTasks = tasks.filter(t => !isLogTask(t));
  const logTasks = tasks.filter(t => isLogTask(t));

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Manajemen Tugas
                </h1>
                <p className="text-slate-400 text-sm mt-1">
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

                 <button 
                    onClick={handleRefresh} 
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
        </div>

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
