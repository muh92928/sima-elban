"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import AccountTable from "@/app/components/dashboard/AccountTable";

export default function KonfirmasiAkunPage() {
  const [data, setData] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchData = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
      try {
          const { error } = await supabase
            .from('akun')
            .update({ status: newStatus })
            .eq('id', id);
          
          if (error) throw error;
          
          // Refresh local state without refetching all
          setData(prev => prev.map(item => 
              item.id === id ? { ...item, status: newStatus } : item
          ));

          alert(newStatus === 'approved' ? "Akun berhasil disetujui." : "Akun telah ditolak.");

      } catch (error) {
          console.error("Error updating status:", error);
          alert("Gagal memperbarui status akun.");
      }
  };

  const handleRoleUpdate = async (id: string, newRole: 'admin' | 'user' | 'teknisi') => {
      try {
          const { error } = await supabase
            .from('akun')
            .update({ role: newRole })
            .eq('id', id);

          if (error) throw error;

          setData(prev => prev.map(item => 
              item.id === id ? { ...item, role: newRole } : item
          ));
          
      } catch (error) {
           console.error("Error updating role:", error);
           alert("Gagal memperbarui role akun.");
      }
  };

  // Filter Data Match Tab
  const filteredData = data.filter((item) => item.status === activeTab);

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
            onApprove={(id) => handleStatusUpdate(id, 'approved')}
            onReject={(id) => handleStatusUpdate(id, 'rejected')}
            onUpdateRole={handleRoleUpdate}
          />
      </motion.div>
    </div>
  );
}
