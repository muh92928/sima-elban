
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, 
  Search, 
  Filter, 
  Printer, 
  Wrench
} from "lucide-react";
import { Peralatan } from "@/lib/types";
import AddPeralatanModal from "@/app/components/dashboard/AddPeralatanModal";
import PeralatanTable from "@/app/components/dashboard/PeralatanTable";
import PeralatanStats from "@/app/components/dashboard/PeralatanStats";
import PeralatanDetailModal from "@/app/components/dashboard/PeralatanDetailModal";
import { useRouter } from "next/navigation";
import { deletePeralatan } from "./actions";
import { toast } from "react-hot-toast";

interface PeralatanListProps {
  initialData: any[];
}

export default function PeralatanList({ initialData }: PeralatanListProps) {
  const router = useRouter();
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<Peralatan | null>(null);
  const [selectedItem, setSelectedItem] = useState<Peralatan | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportDate, setReportDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sync initialData
  useEffect(() => {
    setData(initialData);
    setReportDate(new Date());
    setMounted(true);
  }, [initialData]);

  // Function to re-fetch data (used for Refresh button & after mutations)
  const refreshData = async () => {
    setRefreshing(true);
    router.refresh(); 
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Peralatan) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item: Peralatan) => {
      setSelectedItem(item);
      setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
        setLoading(true);
        const res = await deletePeralatan(id);
        if (res.success) {
            toast.success("Data berhasil dihapus");
            refreshData();
        } else {
            toast.error("Gagal menghapus: " + res.error);
        }
        setLoading(false);
    }
  };

  // Filter Logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.merk?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check both snake_case and camelCase just in case, but data should be mapped to snake_case now
    const status = item.status_laik;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      
      {/* Print Specific Styles */}
      <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 15mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            font-family: 'Times New Roman', Times, serif;
            background-color: white !important;
          }
          .no-print { display: none !important; }
          .print-block { display: block !important; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px 6px !important; color: black !important; }
          .print-table th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; vertical-align: middle; }
          .print-table td { vertical-align: top; color: black !important; }
          
          /* Force Text Color */
          * { color: black !important; text-shadow: none !important; }
        `}
      </style>



      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden"
      >
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20"
              >
                 <Wrench className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                Data Peralatan
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">Manajemen inventaris dan status peralatan Unit Elektronika Bandara</p>
        </div>

      </motion.div>

      {/* Stats Widget */}
      <div className="print:hidden">
         <PeralatanStats data={data} />
      </div>

       {/* Print Only Header (Official Format) */}
       <div className="hidden print-block text-black mb-4 print-container">
         <div className="print-title text-center font-bold mb-4">
             DAFTAR PERALATAN FASILITAS KEAMANAN PENERBANGAN<br/>
             BANDAR UDARA KAREL SADSUITUBUN - LANGGUR
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
                             <td>{mounted && reportDate ? reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}</td>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Cari peralatan..."
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
                <option value="LAIK OPERASI">Laik Operasi</option>
                <option value="TIDAK LAIK OPERASI">Tidak Laik</option>
            </select>
        </div>
        {/* Date Filter */}
         <div className="flex gap-3 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                 <input 
                     type="month"
                     value={reportDate ? reportDate.toISOString().slice(0, 7) : ''}
                     onChange={(e) => {
                         if (e.target.value) {
                             setReportDate(new Date(e.target.value + "-01"));
                         }
                     }}
                     className="w-full md:w-auto h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                 />
             </div>
         </div>

         {/* Action Buttons moved here */}
        <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
            <button 
                onClick={handleAdd}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
            >
                <Plus size={16} />
                <span className="hidden lg:inline">Tambah Peralatan</span>
                <span className="lg:hidden">Baru</span>
            </button>
            <button 
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                title="Cetak Laporan"
            >
                <Printer size={18} />
            </button>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PeralatanTable 
            data={filteredData} 
            loading={loading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onView={handleView}
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
                 <p className="mb-1">Langgur, {mounted && reportDate ? `${new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0).getDate()} ${reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` : '...'}</p>
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

      {/* Modals */}
      <AddPeralatanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        initialData={editingItem}
      />
      
      <PeralatanDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={selectedItem}
      />
    </div>
  );
}
