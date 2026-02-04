
"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Calendar,
  ClipboardList,
  ChevronDown,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LogPeralatan, Peralatan } from "@/lib/types";
import AddLogModal from "@/app/components/dashboard/AddLogModal";
import EditLogModal from "@/app/components/dashboard/EditLogModal";
import LogPeralatanTable from "@/app/components/dashboard/LogPeralatanTable";
import LogPeralatanMatrixPrint from "@/app/components/dashboard/LogPeralatanMatrixPrint";

import { notify } from "@/lib/notify";

interface LogPeralatanClientProps {
  initialData: LogPeralatan[];
  initialPeralatanList: Peralatan[];
}

export default function LogPeralatanClient({ initialData, initialPeralatanList }: LogPeralatanClientProps) {
  const [data, setData] = useState<LogPeralatan[]>(initialData);
  const [peralatanList, setPeralatanList] = useState<Peralatan[]>(initialPeralatanList);
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LogPeralatan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportDate, setReportDate] = useState<Date | null>(null);

  // Set default report date on mount
  useEffect(() => {
    // Set to today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setReportDate(today);
  }, []);
  


  const refreshData = async () => {
    try {

      
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
      console.error('Error fetching data:', error);
      notify.error("Gagal memuat data log.");
    } finally {
      setLoading(false);

    }
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
            notify.success("Log berhasil dihapus.");
        } catch (error) {
            console.error("Error deleting log:", error);
            notify.error("Gagal menghapus log.");
        }
    }
  };

  // Helper to compare dates ignoring time and timezone shifts
  const isSameDay = (dateStr: string, targetDate: Date) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return y === targetDate.getFullYear() &&
           m - 1 === targetDate.getMonth() &&
           d === targetDate.getDate();
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
    
    // Status Filter
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    
    // Date Filter (Exact Day for the Table)
    const matchDate = reportDate ? isSameDay(item.tanggal, reportDate) : true;

    return matchSearch && matchStatus && matchDate;
  });

  // Date-only filtered data for Stats (Daily) - Now follows filteredData
  const dailyStatsData = filteredData;

  return (
    <div className="space-y-6 print:space-y-4">


        {/* Modals */}
        <AddLogModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={(msg?: string) => {
                refreshData();
                if (msg) notify.success(msg);
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
                if (msg) notify.success(msg);
            }}
            logData={editingItem}
            peralatanList={peralatanList}
        />

       <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 10mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            font-family: 'Times New Roman', Times, serif;
            background-color: white !important;
          }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          
          /* Matrix Container Adjustments */
          .print-container { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
          
          /* Force Text Color */
          * { color: black !important; text-shadow: none !important; }

          /* Hide UI elements during print */
          .no-print { display: none !important; }
        `}
      </style>

      {/* Header & Actions */}
      {/* Header Section - Minimal Centered Style */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-2 print:hidden mb-6 no-print"
      >
        <h1 className="text-3xl @tablet:text-4xl @pc:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 pb-1">
            Log Peralatan
        </h1>
        
        <p className="text-slate-400 font-medium text-sm @tablet:text-base max-w-2xl leading-relaxed">
            Catatan harian kegiatan, perbaikan, dan pemeliharaan <br className="hidden @tablet:block" />
            Unit Elektronika Fasilitas Bandara
        </p>
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
                             <td>{reportDate ? reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Semua Bulan'}</td>
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
        className="flex flex-col pc:flex-row gap-4 print:hidden no-print"
      >
        {/* Filter Group: Search, Status, Date */}
        <div className="flex flex-col pc:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full pc:flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari log..." 
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
                  <option value="Normal Ops">Normal Ops</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  <option value="Perlu Perawatan">Perlu Perawatan</option>
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
                  {reportDate ? (
                      new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(reportDate)
                  ) : (
                      <span className="text-slate-500">Pilih Tanggal</span>
                  )}
               </button>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <ChevronDown size={14} />
               </div>
               <input 
                   ref={dateInputRef}
                   type="date"
                   value={reportDate ? reportDate.toISOString().slice(0, 10) : ''}
                   onChange={(e) => {
                       if (e.target.value) {
                           const [y, m, d] = e.target.value.split('-').map(Number);
                           setReportDate(new Date(y, m - 1, d));
                       } else {
                           setReportDate(null);
                       }
                   }}
                   className="absolute inset-0 opacity-0 -z-10 pointer-events-none appearance-none"
               />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end whitespace-nowrap pt-2 pc:pt-0">
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus size={16} />
                <span>Tambah Log</span>
            </button>

            <button 
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
                title="Cetak Log"
            >
                <Printer size={18} />
            </button>
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="no-print print:hidden"
      >
          <LogPeralatanTable 
            data={filteredData}
            loading={loading}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
      </motion.div>

      {/* Monthly Matrix View (Print Only) */}
      <div className="hidden print-block print-container">
          <LogPeralatanMatrixPrint 
            logs={data} 
            peralatanList={peralatanList} 
            reportDate={reportDate || new Date()} 
          />
      </div>

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
                 <p className="mb-1">Langgur, {(() => {
                    const d = reportDate || new Date(); 
                    return `${new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()} ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                 })()}</p>
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
