"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tugas } from "@/lib/types";
import AddTugasModal from "@/app/components/dashboard/AddTugasModal";
import TugasTable from "@/app/components/dashboard/TugasTable";

export default function TugasPage() {
  const [data, setData] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tugas | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: tugas, error } = await supabase
        .from('tugas')
        .select('*')
        .order('tanggal', { ascending: true }); // By date ascending (nearest deadline first)

      if (error) throw error;
      
      setData(tugas as Tugas[] || []);
    } catch (error) {
      console.error('Error fetching tugas:', error);
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

  const handleEdit = (item: Tugas) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
        try {
            const { error } = await supabase.from('tugas').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error deleting tugas:", error);
            alert("Gagal menghapus tugas.");
        }
    }
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search Filter
    const matchSearch = (
      item.judul.toLowerCase().includes(query) ||
      item.deskripsi?.toLowerCase().includes(query) ||
      item.pic.toLowerCase().includes(query)
    );
    
    // Status Filter
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    
    // Priority Filter
    const matchPriority = priorityFilter === "all" || item.prioritas === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
        {/* Modal */}
        <AddTugasModal 
            isOpen={isModalOpen} 
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
            }} 
            onSuccess={fetchData} 
            initialData={editingItem}
        />

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Daftar Tugas
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manajemen tugas dan monitoring pekerjaan tim.</p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={16} />
                Buat Tugas
            </button>
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </motion.div>

      {/* Flters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <div className="relative md:col-span-2 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tugas, deskripsi, atau PIC..." 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
        </div>
        
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
            <option value="all">Semua Status</option>
            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Selesai">Selesai</option>
        </select>

        <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
        </select>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
          <TugasTable 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>
    </div>
  );
}
