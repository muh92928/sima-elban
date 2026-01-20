"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MessageSquareWarning, Filter, Calendar, ChevronDown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Pengaduan } from "@/lib/types";
import AddPengaduanModal from "@/app/components/dashboard/AddPengaduanModal";
import PengaduanTable from "@/app/components/dashboard/PengaduanTable";
import ProcessPengaduanModal from "@/app/components/dashboard/ProcessPengaduanModal";
import { notify } from "@/lib/notify";
import { getPengaduan, deletePengaduan } from "./actions"; // Import Server Actions

interface PengaduanClientProps {
  initialData: Pengaduan[];
}

export default function PengaduanClient({ initialData }: PengaduanClientProps) {
  const [data, setData] = useState<Pengaduan[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengaduan | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null); // Start with null to prevent hydration mismatch

  // Set default date filter to current month on mount
  useEffect(() => {
    setDateFilter(new Date());
  }, []);

  const [processingItem, setProcessingItem] = useState<Pengaduan | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{nama?: string, peran?: string, nip?: string} | null>(null);

  // Fetch Role Client Side
  useEffect(() => {
      const fetchRole = async () => {
          try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                  setCurrentUserEmail(user.email || "");
                  const { data: akun } = await supabase.from('akun').select('id, peran, nama, nip').eq('email', user.email).single();
                  
                  if (akun) {
                      const r = (akun.peran || "").toUpperCase().replace(/ /g, '_');
                      setRole(r);
                      setCurrentUserId(akun.id);
                      setUserProfile({ nama: akun.nama, peran: akun.peran, nip: akun.nip });
                  } else {
                      setRole(user.user_metadata?.role || ""); 
                  }
              } else {
                  setRole("");
              }
          } catch (e) {
              console.error("Client role fetch error", e);
              setRole("");
          }
      };
      
      fetchRole();
  }, []);

  const isTechnician = role ? (role.includes("KANIT") || role.includes("TEKNISI")) : false;
  const canCreate = role && !isTechnician;
  const [peralatanMap, setPeralatanMap] = useState<Record<number, string>>({});

  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Use the Secure Server Action (RBAC Enforced)
      const data = await getPengaduan();

      setData(data); // Server action returns already-mapped data
    } catch (error) {
       console.error('Error fetching pengaduan:', error);
       notify.error("Gagal memuat data terbaru.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      // If initialData is empty/missing, fetch from server action
      if (!initialData || initialData.length === 0) {
          refreshData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleEdit = (item: Pengaduan) => {
      if (isTechnician) {
          setProcessingItem(item);
      } else {
          if (item.status === "Selesai") {
              notify.success("Pengaduan telah selesai ditangani. Data tersimpan sebagai arsip.");
              return;
          }

          if (item.status === "Diproses") {
              notify.warning("Pengaduan sedang ditangani oleh teknisi. Data dikunci sementara.");
              return;
          }
          setEditingItem(item);
          setIsModalOpen(true);
      }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm("Apakah Anda yakin ingin menghapus data pengaduan ini?");
    
    if (!confirmed) return;
    
    try {
        setLoading(true);
        await deletePengaduan(id);
        notify.success("Pengaduan berhasil dihapus.");
        await refreshData();
    } catch (error) {
        notify.error("Gagal menghapus pengaduan: " + (error instanceof Error ? error.message : String(error)));
    } finally {
        setLoading(false);
    }
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search Filter
    const matchSearch = (
      (item.peralatan?.nama || "").toLowerCase().includes(query) ||
      item.deskripsi.toLowerCase().includes(query) ||
      (item.akun?.nama || item.pelapor || "").toLowerCase().includes(query)
    );
    
    // Status Filter
    const matchStatus = statusFilter === "all" || item.status === statusFilter;

    // Date Filter matches *Month Created*
    // DEBUG: Disabled date filter to ensure data visibility
    const matchDate = true; 
    /*
    const itemDate = new Date(item.created_at);
    const matchDate = dateFilter 
        ? itemDate.getFullYear() === dateFilter.getFullYear() && itemDate.getMonth() === dateFilter.getMonth()
        : true;
    */

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="space-y-6">
        {/* Modals */}
        <AddPengaduanModal 
            isOpen={isModalOpen} 
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
            }} 
            onSuccess={refreshData} 
            initialData={editingItem}

            currentUserId={currentUserId}
        />

        <ProcessPengaduanModal 
            isOpen={!!processingItem}
            onClose={() => setProcessingItem(null)}
            onSuccess={refreshData}
            data={processingItem}
        />
        
        
        {/* Welcome Banner - Only for Non-Technician Users */}
        {!isTechnician && userProfile && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10 p-6 @tablet:p-8 shadow-2xl backdrop-blur-xl flex flex-col @tablet:flex-row items-start @tablet:items-center justify-between gap-4"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <h1 className="text-2xl @tablet:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white mb-2">
                        Selamat Datang, {userProfile.nama || "Pengadu"}
                    </h1>
                    <p className="text-slate-400 text-sm @tablet:text-base">Sistem Informasi Manajemen Unit Elektronika Bandara (SIMA ELBAN)</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]">
                            {(userProfile.peran || "").replace(/_/g, " ")}
                        </div>
                        {userProfile.nip && (
                            <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-400 text-xs font-mono">
                                NIP: {userProfile.nip}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="relative z-10 hidden @tablet:block">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
                        <MessageSquareWarning className="text-white" size={40} />
                    </div>
                </div>
            </motion.div>
        )}

        {/* Header Section - Minimal Centered Style */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-2 print:hidden mb-6"
        >
            <h1 className="text-3xl @tablet:text-4xl @pc:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 pb-1">
                Layanan Pengaduan
            </h1>
            
            <p className="text-slate-400 font-medium text-sm @tablet:text-base max-w-2xl leading-relaxed">
                Pusat Pelaporan Kerusakan & Kendala Teknis <br className="hidden @tablet:block" />
                Unit Elektronika Fasilitas Bandara
            </p>
        </motion.div>


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
              placeholder="Cari pengaduan..."
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
                  <option value="Baru">Baru</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={14} />
              </div>
          </div>

          {/* Time Filter */}
          <div className="w-full pc:flex-1 self-stretch pc:self-auto relative group">
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
                   className="absolute inset-0 opacity-0 -z-10 pointer-events-none appearance-none"
               />
          </div>
        </div>

         {canCreate && (
             <div className="flex items-center gap-3 justify-end whitespace-nowrap pt-2 pc:pt-0">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={16} />
                    <span>Buat Pengaduan</span>
                </button>
             </div>
         )}
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
          <PengaduanTable 
            data={filteredData}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>


    </div>
  );
}
