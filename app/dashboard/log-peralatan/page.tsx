"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Printer, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LogPeralatan } from "@/lib/types";
import AddLogModal from "@/app/components/dashboard/AddLogModal";
import LogPeralatanTable from "@/app/components/dashboard/LogPeralatanTable";

export default function LogPeralatanPage() {
  const [data, setData] = useState<LogPeralatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LogPeralatan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDate, setReportDate] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch logs joined with peralatan
      const { data: logs, error } = await supabase
        .from('log_peralatan')
        .select('*, peralatan(nama)')
        .order('tanggal', { ascending: false })
        .order('jam', { ascending: false });

      if (error) throw error;
      
      setData(logs as unknown as LogPeralatan[] || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
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

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (item: LogPeralatan) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus log ini?")) {
        try {
            const { error } = await supabase.from('log_peralatan').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error deleting log:", error);
            alert("Gagal menghapus log.");
        }
    }
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search Filter
    const matchSearch = (
      (item.peralatan?.nama && item.peralatan.nama.toLowerCase().includes(query)) ||
      item.kegiatan.toLowerCase().includes(query) ||
      (item.pic && item.pic.toLowerCase().includes(query))
    );
    
    // Date Filter (Year & Month)
    const itemDate = new Date(item.tanggal);
    const matchDate = 
        itemDate.getFullYear() === reportDate.getFullYear() &&
        itemDate.getMonth() === reportDate.getMonth();

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6 print:space-y-4">
        {/* Modal */}
        <AddLogModal 
            isOpen={isModalOpen} 
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
            }} 
            onSuccess={fetchData} 
            initialData={editingItem}
        />

      <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 15mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            font-family: 'Arial', sans-serif;
            background-color: white !important;
          }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px 6px !important; color: #black !important; }
          .print-table th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; vertical-align: middle; }
          .print-table td { vertical-align: top; color: black !important; }
          
          /* Force Text Color */
          * { color: black !important; text-shadow: none !important; }
        `}
      </style>

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Log Peralatan</h1>
          <p className="text-slate-400 text-sm mt-1">Catatan kegiatan, perbaikan, dan pemeliharaan.</p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={16} />
                Tambah Log
            </button>
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Log"
            >
                <RefreshCw size={18} />
            </button>
            <button 
                onClick={handlePrint}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                title="Cetak Log"
            >
                <Printer size={18} />
            </button>
        </div>
      </motion.div>

       {/* Print Header (Simple) */}
       <div className="hidden print-block text-black mb-6">
            <h2 className="text-center font-bold text-lg underline mb-1">LOG KEGIATAN HARIAN</h2>
            <p className="text-center text-sm font-bold mb-4">
                PERIODE: {reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
       </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3 print:hidden"
      >
        <div className="relative w-full md:flex-1 md:max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alat, kegiatan, atau PIC..." 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
                <input 
                    type="month"
                    value={reportDate.toISOString().slice(0, 7)}
                    onChange={(e) => {
                        if (e.target.value) {
                            setReportDate(new Date(e.target.value + "-01"));
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
        className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible"
      >
          <LogPeralatanTable 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>
    </div>
  );
}
