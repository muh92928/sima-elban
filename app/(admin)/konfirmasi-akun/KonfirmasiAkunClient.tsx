"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  UserCheck,
  Calendar,
  ChevronDown
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import AccountTable from "@/app/components/dashboard/AccountTable";
import { notify } from "@/lib/notify";

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

          notify.success(action === 'approve' ? "Akun berhasil disetujui (AKTIF)." : "Akun telah ditolak.");

      } catch (error) {
          console.error("Error updating status:", error);
          notify.error("Gagal memperbarui status akun.");
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
          notify.success("Peran akun berhasil diperbarui.");
      } catch (error) {
           console.error("Error updating role:", error);
           notify.error("Gagal memperbarui peran akun.");
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
      
      return matchTab && matchSearch && matchRole;
  });

  const uniqueRoles = Array.from(new Set(data.map(i => i.peran).filter(Boolean)));
  
  // Count
  const pendingCount = data.filter(i => i.status === 'pending').length;
  const approvedCount = data.filter(i => i.status === 'AKTIF' || i.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header - Minimal Centered Style */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-2 mb-6"
      >
        <h1 className="text-3xl @tablet:text-4xl @pc:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 pb-1">
            Konfirmasi Akun
        </h1>
        <p className="text-slate-400 font-medium text-sm @tablet:text-base max-w-2xl leading-relaxed">
            Persetujuan dan manajemen akun pengguna baru <br className="hidden @tablet:block" />
            Unit Elektronika Fasilitas Bandara
        </p>
      </motion.div>
      
      {/* Tabs - Responsive Segmented Control for Mobile, Tabs for Desktop */}
      <div className="w-full flex p-1 bg-slate-900/50 border border-white/10 rounded-2xl @tablet:bg-transparent @tablet:border-0 @tablet:border-b @tablet:rounded-none @tablet:pb-4 @tablet:p-0 @tablet:gap-4 mb-4">
          <button
              onClick={() => setActiveTab('pending')}
              className={`flex flex-1 @tablet:flex-none items-center justify-center gap-1.5 @tablet:gap-2 px-1.5 @tablet:px-4 py-2.5 @tablet:py-2 rounded-xl @tablet:rounded-lg text-[11px] @tablet:text-sm font-bold @tablet:font-medium transition-all relative ${
                  activeTab === 'pending' 
                  ? 'text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
              <Clock className="shrink-0" size={14} />
              <span className="truncate">Menunggu</span>
              {pendingCount > 0 && (
                  <span className="bg-blue-500 text-white text-[9px] @tablet:text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      {pendingCount}
                  </span>
              )}
              {activeTab === 'pending' && (
                  <motion.div 
                      layoutId="tab-underline" 
                      className="absolute bottom-1 @tablet:bottom-[-17px] left-2 right-2 @tablet:left-0 @tablet:right-0 h-0.5 bg-blue-400 rounded-full" 
                  />
              )}
          </button>

          <button
              onClick={() => setActiveTab('approved')}
              className={`flex flex-1 @tablet:flex-none items-center justify-center gap-1.5 @tablet:gap-2 px-1.5 @tablet:px-4 py-2.5 @tablet:py-2 rounded-xl @tablet:rounded-lg text-[11px] @tablet:text-sm font-bold @tablet:font-medium transition-all relative ${
                  activeTab === 'approved' 
                  ? 'text-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
              <CheckCircle className="shrink-0" size={14} />
              <span className="truncate">Disetujui</span>
              {approvedCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[9px] @tablet:text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      {approvedCount}
                  </span>
              )}
              {activeTab === 'approved' && (
                  <motion.div 
                      layoutId="tab-underline" 
                      className="absolute bottom-1 @tablet:bottom-[-17px] left-2 right-2 @tablet:left-0 @tablet:right-0 h-0.5 bg-emerald-400 rounded-full" 
                  />
              )}
          </button>

          <button
              onClick={() => setActiveTab('rejected')}
              className={`flex flex-1 @tablet:flex-none items-center justify-center gap-1.5 @tablet:gap-2 px-1.5 @tablet:px-4 py-2.5 @tablet:py-2 rounded-xl @tablet:rounded-lg text-[11px] @tablet:text-sm font-bold @tablet:font-medium transition-all relative ${
                  activeTab === 'rejected' 
                  ? 'text-red-400 bg-red-400/10 shadow-lg shadow-red-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
              <XCircle className="shrink-0" size={14} />
              <span className="truncate">Ditolak</span>
              {activeTab === 'rejected' && (
                  <motion.div 
                      layoutId="tab-underline" 
                      className="absolute bottom-1 @tablet:bottom-[-17px] left-2 right-2 @tablet:left-0 @tablet:right-0 h-0.5 bg-red-400 rounded-full" 
                  />
              )}
          </button>
      </div>

      {/* Search & Filter */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col pc:flex-row gap-4"
      >
        {/* Filter Group: Search & Role */}
        <div className="flex flex-col pc:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full pc:flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari Nama, NIP, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
          
          {/* Peran Filter */}
          <div className="w-full pc:flex-1 relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
              <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70 transition-all font-medium"
              >
                  <option value="all">Semua Peran</option>
                  {uniqueRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                  ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={14} />
              </div>
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
