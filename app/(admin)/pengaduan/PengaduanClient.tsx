"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Pengaduan } from "@/lib/types";
import AddPengaduanModal from "@/app/components/dashboard/AddPengaduanModal";
import PengaduanTable from "@/app/components/dashboard/PengaduanTable";
import ProcessPengaduanModalHelpers from "@/app/components/dashboard/ProcessPengaduanModal";
import Toast, { ToastType } from "@/app/components/Toast";

interface PengaduanClientProps {
  initialData: Pengaduan[];
}

export default function PengaduanClient({ initialData }: PengaduanClientProps) {
  const [data, setData] = useState<Pengaduan[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengaduan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
                      // Fallback
                      setRole(user.user_metadata?.role || ""); 
                  }
              } else {
                  setRole(""); // Guest?
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

  // ... (existing useEffects)

  const refreshData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Fetch Pengaduan with Akun relation
      const { data: pengaduan, error } = await supabase
        .from('pengaduan')
        .select('*, akun(nama, peran)') 
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 2. Fetch Peralatan (Lookup Map) - Robust fallback for joins
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
      // Only refresh if no initial data
      if (!initialData || initialData.length === 0) {
          refreshData();
      }
      // Always fetch role
  }, []);

  const handleRefresh = () => {
    refreshData();
  };

  const handleEdit = (item: Pengaduan) => {
      if (isTechnician) {
          setProcessingItem(item);
      } else {
          // User: Only allow editing if they reported it? Or general edit? 
          // For now allow editing if it matches name (imperfect) or just open modal and let them see.
          // Better: Only allow editing if status is "Baru".
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
    if (!isTechnician) {
       // Optional: Check ownership logic if needed, but for now simple confirmation
    }
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

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
        {/* Modal User (Add/Edit) */}
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

        {/* Modal Technician (Process) */}
        <ProcessPengaduanModalHelpers
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
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Layanan Pengaduan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Laporan kerusakan dan keluhan pengguna.</p>
        </div>

        <div className="flex items-center gap-3">
            {canCreate && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={16} />
                    Buat Pengaduan
                </button>
            )}
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </motion.div>

      {/* Filters */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengaduan, pelapor..." 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
            >
                <option value="all">Semua Status</option>
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
            </select>
        </div>
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

// Lazy import or simple wrapper to avoid circular dependency issues if any

