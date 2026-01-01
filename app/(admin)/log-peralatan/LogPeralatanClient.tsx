"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Printer, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LogPeralatan, Peralatan } from "@/lib/types";
import AddLogModal from "@/app/components/dashboard/AddLogModal";
import EditLogModal from "@/app/components/dashboard/EditLogModal";
import LogPeralatanTable from "@/app/components/dashboard/LogPeralatanTable";
import Toast, { ToastType } from "@/app/components/Toast";

interface LogPeralatanClientProps {
  initialData: LogPeralatan[];
  initialPeralatanList: Peralatan[];
}

export default function LogPeralatanClient({ initialData, initialPeralatanList }: LogPeralatanClientProps) {
  const [data, setData] = useState<LogPeralatan[]>(initialData);
  const [peralatanList, setPeralatanList] = useState<Peralatan[]>(initialPeralatanList);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LogPeralatan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDate, setReportDate] = useState(new Date());
  
  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
      show: false,
      message: '',
      type: 'success'
  });

  const showToast = (message: string, type: ToastType = 'success') => {
      setToast({ show: true, message, type });
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Fetch Peralatan List for Modals
      const { data: peralatanData, error: peralatanError } = await supabase
        .from('peralatan')
        .select('*')
        .order('nama', { ascending: true });
        
      if (peralatanError) throw peralatanError;
      setPeralatanList(peralatanData as Peralatan[] || []);

      // 2. Fetch Logs
      const { data: logs, error: logsError } = await supabase
        .from('log_peralatan')
        .select('*, peralatan(*)') // Select all log columns and joined peralatan
        .order('tanggal', { ascending: false })
        .order('id', { ascending: false });

      if (logsError) throw logsError;
      
      setData(logs as unknown as LogPeralatan[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast("Gagal memuat data log.", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (item: LogPeralatan) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus log ini?")) {
        try {
            const { error } = await supabase.from('log_peralatan').delete().eq('id', id);
            if (error) throw error;
            refreshData();
            showToast("Log berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting log:", error);
            showToast("Gagal menghapus log.", 'error');
        }
    }
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search Filter
    const matchSearch = (
      (item.peralatan?.nama && item.peralatan.nama.toLowerCase().includes(query)) ||
      (item.peralatan?.jenis && item.peralatan.jenis.toLowerCase().includes(query)) ||
      (item.status && item.status.toLowerCase().includes(query))
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
        <Toast 
            show={toast.show} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />

        {/* Modals */}
        <AddLogModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={(msg?: string) => {
                refreshData();
                if (msg) showToast(msg, 'success');
            }} 
            peralatanList={peralatanList}
        />

        <EditLogModal 
            isOpen={isEditModalOpen}
            onClose={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
            }}
            onSuccess={(msg?: string) => {
                refreshData();
                if (msg) showToast(msg, 'success');
            }}
            logData={editingItem}
            peralatanList={peralatanList}
        />

       <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 20mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            font-family: 'Times New Roman', Times, serif;
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
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
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

       {/* Print Only Header (Official Format) */}
       <div className="hidden print-block text-black mb-4 print-container">
         <div className="print-title text-center font-bold mb-4">
             LAPORAN BULANAN<br/>
             LAPORAN UNJUK HASIL / PERFORMANCE<br/>
             PERALATAN KEAMANAN PENERBANGAN
         </div>
         
         <div className="w-full flex justify-between items-start text-xs font-bold leading-relaxed">
             {/* Left Side Info */}
             <div className="flex-1">
                 <table className="print-header-table w-auto">
                     <tbody>
                         <tr>
                             <td className="w-[120px]">BANDAR UDARA</td>
                             <td className="w-[10px]">:</td>
                             <td>KAREL SADSUITUBUN - LANGGUR</td>
                         </tr>
                         <tr>
                             <td>Bulan / Tahun</td>
                             <td>:</td>
                             <td>{reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>

             {/* Right Side Info */}
             <div className="flex-1 flex flex-col items-end">
                  <table className="print-header-table w-auto" style={{ width: 'auto' }}>
                     <tbody>
                         <tr>
                             <td className="text-left w-[80px]">LEMBAR I</td>
                             <td className="text-center w-[10px]">:</td>
                             <td className="text-left w-[300px]">DIREKTORAT KEAMANAN PENERBANGAN</td>
                         </tr>
                         <tr>
                             <td className="text-left">LEMBAR II</td>
                             <td className="text-center">:</td>
                             <td className="text-left">KANTOR OTORITAS BANDAR UDARA WILAYAH VIII</td>
                         </tr>
                         <tr>
                             <td className="text-left">LEMBAR III</td>
                             <td className="text-center">:</td>
                             <td className="text-left">KANTOR UPBU KELAS II KAREL SADSUITUBUN</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
         </div>
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
                placeholder="Cari alat (nama/jenis) atau status..." 
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
      >
          <LogPeralatanTable 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>

       {/* Print Footer (Signatures) */}
       <div className="hidden print-block mt-8 text-black text-xs">
         <div className="flex justify-between px-10 items-start">
             {/* Left Box */}
             <div className="text-center flex flex-col items-center">
                 <p className="mb-1">Mengetahui,</p>
                 <p className="font-bold">KEPALA SEKSI TOKPD</p>
                 <p className="font-bold mb-20">UPBU KAREL SADSUITUBUN</p>
                 <p className="font-bold underline leading-none">ROBERTUS FABUMASSE, ST</p>
                 <p>NIP. 19821210 200812 1 001</p>
             </div>

             {/* Right Box */}
             <div className="text-center flex flex-col items-center">
                 <p className="mb-1">Langgur, {new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0).getDate()} {reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                 <p className="font-bold">PIC PELAPORAN</p>
                 <div className="relative h-20 w-32 flex items-center justify-center my-1">
                     <img 
                          src="/signature-pic.png" 
                          alt="Signature" 
                          className="h-full w-full object-contain filter contrast-125"
                      />
                 </div>
                 <p className="font-bold underline leading-none">MUH. FARHAN A.Md.T</p>
                 <p>NIP. 19990517 202210 1 001</p>
             </div>
         </div>
       </div>
    </div>
  );
}
