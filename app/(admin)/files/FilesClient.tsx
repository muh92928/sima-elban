
"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {  Plus, 
  Search, 
  Filter, 
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  ChevronDown,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FileItem } from "@/lib/types";
import AddFileModal from "@/app/components/dashboard/AddFileModal";
import FileTable from "@/app/components/dashboard/FileTable";
import { notify } from "@/lib/notify";

interface FilesClientProps {
  initialData: FileItem[];
}

export default function FilesClient({ initialData }: FilesClientProps) {
  const [data, setData] = useState<FileItem[]>(initialData);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  useEffect(() => {
    setDateFilter(new Date());
  }, []);

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
        notify.success("File berhasil dihapus");
    } catch (error) {
        console.error("Error deleting file:", error);
        notify.error("Gagal menghapus file");
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

      {/* Header Section - Minimal Centered Style */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-2 print:hidden mb-6"
      >
        <h1 className="text-3xl @tablet:text-4xl @pc:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 pb-1">
            Manajemen File
        </h1>
        
        <p className="text-slate-400 font-medium text-sm @tablet:text-base max-w-2xl leading-relaxed">
            Pusat Penyimpanan Dokumen & Arsip Digital <br className="hidden @tablet:block" />
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
        {/* Filter Group: Search, Category, Date */}
        <div className="flex flex-col pc:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full pc:flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
          
          {/* Category Filter */}
          <div className="w-full pc:flex-1 relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
              <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70 transition-all font-medium"
              >
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={14} />
              </div>
          </div>

          {/* Date Filter */}
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

         {/* Action Buttons */}
         <div className="flex items-center gap-3 justify-end whitespace-nowrap pt-2 pc:pt-0">
             <button 
                onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus size={16} />
                <span>Upload File</span>
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
