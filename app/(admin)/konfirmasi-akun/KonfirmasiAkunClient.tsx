"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  UserCheck
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import AccountTable from "@/app/components/dashboard/AccountTable";
import KonfirmasiAkunStats from "@/app/components/dashboard/KonfirmasiAkunStats";

interface KonfirmasiAkunClientProps {
  initialData: Akun[];
  currentUserRole: string;
}

export default function KonfirmasiAkunClient({ initialData, currentUserRole: initialRole }: KonfirmasiAkunClientProps) {
  const [data, setData] = useState<Akun[]>(initialData);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());
  
  // Tab handling
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const handleStatusUpdate = async (id: string, action: 'approve' | 'reject') => {
      setLoading(true);
      const newStatus = action === 'approve' ? 'AKTIF' : 'rejected';
      
      try {
          const { error } = await supabase
            .from('akun')
            .update({ status: newStatus })
            .eq('id', id);
          
          if (error) throw error;
          
          setData(prev => prev.map(item => 
              item.id === id ? { ...item, status: newStatus as any } : item
          ));

          alert(action === 'approve' ? "Akun berhasil disetujui (AKTIF)." : "Akun telah ditolak.");

      } catch (error) {
          console.error("Error updating status:", error);
          alert("Gagal memperbarui status akun.");
      } finally {
          setLoading(false);
      }
  };

  const handleRoleUpdate = async (id: string, newRole: string) => {
      try {
          const { error } = await supabase
            .from('akun')
            .update({ peran: newRole })
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

  // Filter Data Match Tab + Search + Filter
  const filteredData = data.filter((item) => {
      // Tab Filter
      let matchTab = false;
      if (activeTab === 'pending') matchTab = item.status === 'pending';
      else if (activeTab === 'approved') matchTab = item.status === 'AKTIF' || item.status === 'approved';
      else if (activeTab === 'rejected') matchTab = item.status === 'rejected';
      
      // Search
      const query = searchQuery.toLowerCase();
      const matchSearch = (
          item.nama.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          (item.nip && item.nip.toLowerCase().includes(query))
      );
      
      // Role Filter
      const matchRole = roleFilter === "all" || item.peran === roleFilter || (roleFilter === "UNASSIGNED" && !item.peran);
      
      // Date Filter matches *Month Created*
      const itemDate = new Date(item.created_at);
      const matchDate = dateFilter 
        ? itemDate.getFullYear() === dateFilter.getFullYear() && itemDate.getMonth() === dateFilter.getMonth()
        : true;
      
      return matchTab && matchSearch && matchRole && matchDate;
  });

  const uniqueRoles = Array.from(new Set(data.map(i => i.peran).filter(Boolean)));
  
  // Count
  const pendingCount = data.filter(i => i.status === 'pending').length;
  const approvedCount = data.filter(i => i.status === 'AKTIF' || i.status === 'approved').length;

  return (
    <div className="space-y-6">
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
                 <UserCheck className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                 Konfirmasi Akun
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">
               Persetujuan dan manajemen akun pengguna baru.
           </p>
        </div>
      </motion.div>

      <KonfirmasiAkunStats data={data} />
      
      {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
            <button
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    activeTab === 'pending' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'
                }`}
            >
                <Clock size={16} />
                Menunggu
                {pendingCount > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                {activeTab === 'pending' && <motion.div layoutId="tab-underline" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-blue-400" />}
            </button>
            <button
                onClick={() => setActiveTab('approved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    activeTab === 'approved' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white'
                }`}
            >
                <CheckCircle size={16} />
                Disetujui
                {approvedCount > 0 && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{approvedCount}</span>}
                {activeTab === 'approved' && <motion.div layoutId="tab-underline" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-emerald-400" />}
            </button>
            <button
                onClick={() => setActiveTab('rejected')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    activeTab === 'rejected' ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-white'
                }`}
            >
                <XCircle size={16} />
                Ditolak
                {activeTab === 'rejected' && <motion.div layoutId="tab-underline" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-red-400" />}
            </button>
        </div>

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
            placeholder="Cari Nama, NIP, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Peran</option>
                {uniqueRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
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
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        key={activeTab} // reset animation on tab switch
      >
          <AccountTable 
            data={filteredData}
            loading={loading}
            onApprove={(id) => handleStatusUpdate(id, 'approve')}
            onReject={(id) => handleStatusUpdate(id, 'reject')}
            onUpdateRole={handleRoleUpdate}
          />
      </motion.div>
    </div>
  );
}
