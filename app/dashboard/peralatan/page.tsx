"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Printer, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Peralatan } from "@/lib/types";
import AddPeralatanModal from "@/app/components/dashboard/AddPeralatanModal";
import PeralatanTable from "@/app/components/dashboard/PeralatanTable";

export default function PeralatanPage() {
  const [data, setData] = useState<Peralatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Peralatan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportDate, setReportDate] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: peralatanData, error } = await supabase
        .from('peralatan')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setData(peralatanData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleEdit = (item: Peralatan) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data peralatan ini?")) {
        try {
            const { error } = await supabase.from('peralatan').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Gagal menghapus data.");
        }
    }
  };

  // Filter Data Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchSearch = (
      item.nama.toLowerCase().includes(query) ||
      (item.merk && item.merk.toLowerCase().includes(query)) ||
      (item.no_sertifikat && item.no_sertifikat.toLowerCase().includes(query)) ||
      (item.jenis && item.jenis.toLowerCase().includes(query))
    );
    
    const matchStatus = statusFilter === "all" || item.status_laik === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 print:space-y-4">
        {/* Modal */}
        <AddPeralatanModal 
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
          @page { size: landscape; margin: 20mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            font-family: 'Arial', sans-serif;
            background-color: white !important;
          }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          
          /* Main Container - remove extra padding since page margin handles it */
          .print-container {
             padding: 0 !important;
             margin: 0 !important; 
          }

          /* Table Styles */
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px 6px !important; color: #000 !important; }
          .print-table th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; vertical-align: middle; }
          .print-table td { vertical-align: middle; text-align: center !important; }
          
          /* Hide Only Aksi Column (10) - Keterangan (9) is visible now */
          .print-table th:nth-child(10), .print-table td:nth-child(10) {
            display: none !important;
          }

          /* Header Styles */
          .print-header-table { width: 100%; margin-bottom: 20px; font-size: 12px; border: none; }
          .print-header-table td { padding: 4px 2px; border: none !important; vertical-align: top; }
          .print-title { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 30px; text-decoration: underline; line-height: 1.5; }
          
          /* Force Text Colors */
          * { color: black !important; text-shadow: none !important; }
          
          /* Specific Overrides for Chips/Badges to remove background in print */
          .print-table span, .print-table div { 
            background: transparent !important; 
            border: none !important;
            padding: 0 !important;
          }
        `}
      </style>

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Peralatan</h1>
          <p className="text-slate-400 text-sm mt-1">Inventarisasi dan status kelaikan peralatan.</p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={16} />
                Tambah Alat
            </button>
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
            <button 
                onClick={handlePrint}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                title="Cetak Data"
            >
                <Printer size={18} />
            </button>
        </div>
      </motion.div>

      {/* Print Only Header (Official Format) */}
      <div className="hidden print-block text-black mb-4 print-container">
        <div className="print-title">
            LAPORAN BULANAN<br/>
            DAFTAR DAN KONDISI PERALATAN<br/>
            KEAMANAN PENERBANGAN
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

            {/* Right Side Info (Strict Alignment) */}
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
                placeholder="Cari nama alat, merk, atau nomor seri..." 
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
            
            {/* Status Filter Dropdown */}
            <div className="relative flex-1 md:flex-none">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer appearance-none"
                >
                    <option value="all">Semua Status</option>
                    <option value="LAIK OPERASI">Laik Operasi</option>
                    <option value="TIDAK LAIK OPERASI">Tidak Laik</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
        </div>
      </motion.div>

      {/* Content Section (Table desktop / Cards mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible"
      >
          <PeralatanTable 
            data={filteredData}
            loading={loading || refreshing}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
      </motion.div>

      {/* Print Footer (Notes & Signatures) */}
      <div className="hidden print-block mt-4 text-black text-[10px]">
        {/* Catatan Section */}
        <div className="mb-8 pl-2 w-full">
            <div className="font-bold mb-1 underline">CATATAN :</div>
            <table className="w-full text-[10px]">
                <tbody>
                    <tr>
                        <td className="w-[100px] align-top">Kondisi (%)</td>
                        <td className="w-[10px] align-top">=</td>
                        <td>(1 - peralatan dlm tahun / N) X 100%</td>
                    </tr>
                    <tr>
                        <td className="align-top">N (usia teknis)</td>
                        <td className="align-top">=</td>
                        <td>berdasar antara 10 - 15 tahun (atau mengikuti ketentuan pabrikan)</td>
                    </tr>
                    <tr>
                        <td className="align-top">*</td>
                        <td className="align-top">=</td>
                        <td>tulis sesuai kondisi / L (laik), TL (Tidak Laik)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Signatures */}
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
                <p className="mb-1">Langgur, {reportDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
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
