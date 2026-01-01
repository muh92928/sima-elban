"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ShieldAlert } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import AccountTable from "@/app/components/dashboard/AccountTable";

interface KonfirmasiAkunClientProps {
  initialData: Akun[];
  currentUserRole: string;
}

export default function KonfirmasiAkunClient({ initialData, currentUserRole: initialRole }: KonfirmasiAkunClientProps) {
  const [data, setData] = useState<Akun[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const [role, setRole] = useState(initialRole || "");
  const [accessDenied, setAccessDenied] = useState(false);

  // Fetch Role Client Side (Backup/Consistency)
  useEffect(() => {
      const fetchRole = async () => {
          try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                  const { data: akun } = await supabase.from('akun').select('peran').eq('email', user.email!).single();
                  const r = (akun?.peran || user.user_metadata?.role || user.user_metadata?.peran || "").toUpperCase().replace(/ /g, '_');
                  setRole(r);

                  // Validate Access after fetching
                  const allowed = r.includes("KANIT_ELBAN") || r.includes("TEKNISI_ELBAN") || r.includes("TEKNISI") || r.includes("ADMIN");
                  if (!allowed) {
                      setAccessDenied(true);
                  }
              }
          } catch (e) {
              console.error("Client role fetch error", e);
          }
      };
      
      // Always fetch on mount to ensure consistency
      fetchRole();
  }, []);

  // Use accessDenied state instead of calculating derived hasAccess on every render
  if (accessDenied) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
              <div className="p-4 bg-red-500/10 rounded-full text-red-400">
                  <ShieldAlert size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white">Akses Ditolak</h2>
              <p className="text-slate-400 max-w-md">
                  Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk Kanit Elban dan Teknisi Elban.
              </p>
          </div>
      );
  }

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const { data: accounts, error } = await supabase
        .from('akun')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setData(accounts as Akun[] || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleStatusUpdate = async (id: string, action: 'approve' | 'reject') => {
      const newStatus = action === 'approve' ? 'AKTIF' : 'rejected';
      
      try {
          const { error } = await supabase
            .from('akun')
            .update({ status: newStatus })
            .eq('id', id);
          
          if (error) throw error;
          
          // Refresh local state without refetching all
          setData(prev => prev.map(item => 
              item.id === id ? { ...item, status: newStatus as any } : item
          ));

          alert(action === 'approve' ? "Akun berhasil disetujui (AKTIF)." : "Akun telah ditolak.");

      } catch (error) {
          console.error("Error updating status:", error);
          alert("Gagal memperbarui status akun.");
      }
  };

  const handleRoleUpdate = async (id: string, newRole: string) => {
      try {
          const { error } = await supabase
            .from('akun')
            .update({ peran: newRole }) // Updated to use correct DB column 'peran'
            .eq('id', id);

          if (error) throw error;

          setData(prev => prev.map(item => 
              item.id === id ? { ...item, peran: newRole } : item
          ));
          
      } catch (error) {
           console.error("Error updating role:", error);
           alert("Gagal memperbarui peran akun.");
      }
  };

  // Filter Data Match Tab
  const filteredData = data.filter((item) => {
      if (activeTab === 'pending') return item.status === 'pending';
      if (activeTab === 'approved') return item.status === 'AKTIF' || item.status === 'approved'; // Handle both for backward compat
      if (activeTab === 'rejected') return item.status === 'rejected';
      return false;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Konfirmasi Akun
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola persetujuan pendaftaran dan hak akses pengguna.</p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/50 border border-white/10 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pending' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Menunggu ({data.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'approved' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Disetujui
          </button>
          <button
             onClick={() => setActiveTab('rejected')}
             className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                 activeTab === 'rejected' 
                 ? 'bg-red-600 text-white shadow-lg' 
                 : 'text-slate-400 hover:text-white hover:bg-white/5'
             }`}
           >
             Ditolak
           </button>
      </div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        key={activeTab} // reset animation on tab switch
      >
          <AccountTable 
            data={filteredData}
            loading={loading || refreshing}
            onApprove={(id) => handleStatusUpdate(id, 'approve')}
            onReject={(id) => handleStatusUpdate(id, 'reject')}
            onUpdateRole={handleRoleUpdate}
          />
      </motion.div>
    </div>
  );
}
