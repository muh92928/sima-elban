
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {  Plus, 
  Search, 
  Filter, 
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Eye 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FileItem } from "@/lib/types";
import AddFileModal from "@/app/components/dashboard/AddFileModal";
import FileTable from "@/app/components/dashboard/FileTable";
import FilesStats from "@/app/components/dashboard/FilesStats";

interface FilesClientProps {
  initialData: FileItem[];
}

export default function FilesClient({ initialData }: FilesClientProps) {
  const [data, setData] = useState<FileItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());

  const categories = [
    "Dokumentasi", "Laporan", "Regulasi", "SOP", "File Pendukung Lainnya"
 ];

  const refreshData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const { data: fetchedData, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(fetchedData || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;

    setLoading(true);
    try {
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await refreshData();
    } catch (error) {
        console.error("Error deleting file:", error);
        alert("Gagal menghapus file");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (item: FileItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search Filter
    const matchSearch = (
      item.nama.toLowerCase().includes(query) ||
      (item.catatan && item.catatan.toLowerCase().includes(query))
    );
    
    // Category Filter
    const matchCategory = categoryFilter === "all" || item.kategori === categoryFilter;

    // Date Filter matches *Month Created*
    const itemDate = new Date(item.created_at);
    const matchDate = dateFilter 
        ? itemDate.getFullYear() === dateFilter.getFullYear() && itemDate.getMonth() === dateFilter.getMonth()
        : true;

    return matchSearch && matchCategory && matchDate;
  });

  return (
    <div className="space-y-6">
        {/* Modal */}
        <AddFileModal 
            isOpen={isModalOpen} 
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
            }} 
            onSuccess={refreshData} 
            initialData={editingItem}
        />

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20"
              >
                 <FolderOpen className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                Manajemen File
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">Penyimpanan arsip digital dan dokumen penting.</p>
        </div>
        </div>

      </motion.div>

      <FilesStats data={data} />

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
            placeholder="Cari file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
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

         <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
            >
                <Plus size={16} />
                <span className="hidden lg:inline">Upload File</span>
                <span className="lg:hidden">Upload</span>
            </button>
         </div>
      </motion.div>



      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
          <FileTable 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>
    </div>
  );
}
