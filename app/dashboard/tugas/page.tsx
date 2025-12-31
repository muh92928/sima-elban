"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import TugasTable from "@/app/components/dashboard/TugasTable";
import TugasModal from "@/app/components/dashboard/TugasModal";
import { motion } from "framer-motion";

export default function TugasPage() {
  const [tasks, setTasks] = useState<Tugas[]>([]);
  const [teknisiList, setTeknisiList] = useState<Akun[]>([]);
  const [peralatanList, setPeralatanList] = useState<Peralatan[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tugas | null>(null);
  
  const [currentUser, setCurrentUser] = useState<{ nip?: string; role?: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get Current User (for Role & NIP Filtering)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Should redirect to login if not handled by middleware

      // Fetch Akun details for role and NIP
      const { data: akun } = await supabase.from('akun').select('*').eq('email', user.email!).single();
      const userRole = (akun?.peran || akun?.role || user.user_metadata?.role || user.user_metadata?.peran || "").toUpperCase().replace(/ /g, '_');
      const userNip = akun?.nip || user.user_metadata?.nip || "";

      setCurrentUser({ nip: userNip, role: userRole });

      // 2. Fetch Teknisi List (for Dropdown)
      const { data: teknisiData } = await supabase
        .from('akun')
        .select('*')
        .select('*')
        .in('status', ['AKTIF', 'approved']); 
        
      const filteredTeknisi = (teknisiData as Akun[] || []).filter(a => {
           // Check 'peran' field first, fallback to 'role' helper or empty
           const r = (a.peran || a.role || "").toUpperCase().replace(/ /g, '_'); 
           return r.includes('TEKNISI'); 
      });
      setTeknisiList(filteredTeknisi);

      // 3. Fetch Peralatan List
      const { data: peralatanData } = await supabase
        .from('peralatan')
        .select('*')
        .order('nama', { ascending: true });
      setPeralatanList(peralatanData as Peralatan[] || []);

      // 4. Fetch Tasks
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

      // If Technician, filter only their tasks? 
      // PHP: if ($isTeknisi && $nipMe !== '') $where = "WHERE t.ditugaskan_ke_nip = ?";
      // But Admin/Kanit sees all.
      // Roles are KANIT_ELBAN, UNIT_ADMIN, TEKNISI_ELBAN.
      
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number | number[]) => {
    const ids = Array.isArray(id) ? id : [id];
    if (!confirm(`Apakah Anda yakin ingin menghapus ${ids.length > 1 ? ids.length + ' ' : ''}tugas ini?`)) return;
    
    try {
        const { error } = await supabase.from('tugas').delete().in('id', ids);
        if (error) throw error;
        // Refresh
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
        fetchData(); // Revert
    }
  };

  const canManage = currentUser?.role === 'KANIT_ELBAN';

  return (
    <div className="space-y-6">
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
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="hidden md:inline">Tambah Tugas</span>
                        <span className="md:hidden">Baru</span>
                    </button>
                )}

                 <button 
                    onClick={fetchData} 
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
        </div>

        {/* Notifikasi / Stats Area (Optional - maybe later) */}

        {/* Table */}
        <TugasTable 
            data={tasks} 
            loading={loading}
            onEdit={(item) => setEditingItem(item)}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            currentUserNip={currentUser?.nip}
            isKanitOrAdmin={canManage}
        />

        {/* Modals */}
        <TugasModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={fetchData}
            teknisiList={teknisiList}
            peralatanList={peralatanList}
        />
        
        {editingItem && (
            <TugasModal 
                isOpen={!!editingItem} 
                onClose={() => setEditingItem(null)} 
                onSuccess={fetchData}
                teknisiList={teknisiList}
                peralatanList={peralatanList}
                initialData={editingItem}
            />
        )}
    </div>
  );
}
