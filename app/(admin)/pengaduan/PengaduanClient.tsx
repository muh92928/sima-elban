"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MessageSquareWarning, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Pengaduan } from "@/lib/types";
import AddPengaduanModal from "@/app/components/dashboard/AddPengaduanModal";
import PengaduanTable from "@/app/components/dashboard/PengaduanTable";
import ProcessPengaduanModal from "@/app/components/dashboard/ProcessPengaduanModal";
import PengaduanStats from "@/app/components/dashboard/PengaduanStats";
import Toast, { ToastType } from "@/app/components/Toast";

interface PengaduanClientProps {
  initialData: Pengaduan[];
}

export default function PengaduanClient({ initialData }: PengaduanClientProps) {
  const [data, setData] = useState<Pengaduan[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengaduan | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());

  const [processingItem, setProcessingItem] = useState<Pengaduan | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
      show: false,
      message: "",
      type: "success"
  });

  // Fetch Role Client Side
  useEffect(() => {
      const fetchRole = async () => {
          try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                  setCurrentUserEmail(user.email || "");
                  const { data: akun } = await supabase.from('akun').select('id, peran').eq('email', user.email!).single();
                  
                  if (akun) {
                      const r = (akun.peran || "").toUpperCase().replace(/ /g, '_');
                      setRole(r);
                      setCurrentUserId(akun.id);
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
      
      // 1. Fetch Pengaduan with Akun relation
      const { data: pengaduan, error } = await supabase
        .from('pengaduan')
        .select('*, akun(nama, peran)') 
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 2. Fetch Peralatan (Lookup Map)
      const { data: peralatanList } = await supabase
        .from('peralatan')
        .select('id, nama');
      
      const pMap: Record<number, string> = {};
      if (peralatanList) {
          peralatanList.forEach(p => {
              pMap[p.id] = p.nama;
          });
          setPeralatanMap(pMap);
      }
      
      // Enrich data locally
      const enrichedData = (pengaduan || []).map((p: any) => ({
          ...p,
          peralatan: { nama: pMap[p.peralatan_id] || "Tidak Diketahui" }
      }));

      setData(enrichedData as Pengaduan[]);
    } catch (error) {
      console.error('Error fetching pengaduan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (!initialData || initialData.length === 0) {
          refreshData();
      }
  }, []);

  const handleEdit = (item: Pengaduan) => {
      if (isTechnician) {
          setProcessingItem(item);
      } else {
          if (item.status === "Selesai") {
              setToast({
                  show: true,
                  message: "Pengaduan telah selesai ditangani. Data tersimpan sebagai arsip.",
                  type: "success"
              });
              return;
          }

          if (item.status === "Diproses") {
              setToast({
                  show: true,
                  message: "Pengaduan sedang ditangani oleh teknisi. Data dikunci sementara.",
                  type: "warning"
              });
              return;
          }
          setEditingItem(item);
          setIsModalOpen(true);
      }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pengaduan ini?")) {
        try {
            const { error } = await supabase.from('pengaduan').delete().eq('id', id);
            if (error) throw error;
            refreshData();
        } catch (error) {
            console.error("Error deleting pengaduan:", error);
            alert("Gagal menghapus pengaduan.");
        }
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
    const itemDate = new Date(item.created_at);
    const matchDate = dateFilter 
        ? itemDate.getFullYear() === dateFilter.getFullYear() && itemDate.getMonth() === dateFilter.getMonth()
        : true;

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
        
        {/* Header & Actions */}
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
                 <MessageSquareWarning className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                 Layanan Pengaduan
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">
               Laporkan kerusakan peralatan atau masalah teknis lainnya.
           </p>
        </div>
            
        </motion.div>

        <PengaduanStats data={data} />

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
            placeholder="Cari pengaduan..."
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
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
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

         {canCreate && (
             <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
                >
                    <Plus size={16} />
                    <span className="hidden lg:inline">Buat Pengaduan</span>
                    <span className="lg:hidden">Baru</span>
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

      {/* Toast Notification */}
      <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
