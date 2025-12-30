"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Printer, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Peralatan } from "@/lib/types";
import AddPeralatanModal from "@/app/components/dashboard/AddPeralatanModal";

export default function PeralatanPage() {
  const [data, setData] = useState<Peralatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Peralatan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    return (
      item.nama.toLowerCase().includes(query) ||
      (item.merk && item.merk.toLowerCase().includes(query)) ||
      (item.no_sertifikat && item.no_sertifikat.toLowerCase().includes(query)) ||
      (item.jenis && item.jenis.toLowerCase().includes(query))
    );
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
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Arial', sans-serif; }
          .print-hidden { display: none !important; }
          .print-block { display: block !important; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid #000 !important; padding: 4px 6px !important; color: #000 !important; }
          .print-table th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; vertical-align: middle; }
          .print-table td { vertical-align: middle; }
          .print-header-table { width: 100%; margin-bottom: 20px; font-size: 12px; border: none; }
          .print-header-table td { padding: 2px; border: none !important; }
          .print-title { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 20px; text-decoration: underline; line-height: 1.5; }
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
      <div className="hidden print-block text-black mb-4">
        <div className="print-title">
            LAPORAN BULANAN<br/>
            DAFTAR DAN KONDISI PERALATAN<br/>
            KEAMANAN PENERBANGAN
        </div>
        
        <table className="print-header-table text-xs font-bold w-full">
            <tbody>
                <tr>
                    <td className="w-[150px]">BANDAR UDARA</td>
                    <td className="w-[10px]">:</td>
                    <td>KAREL SADSUITUBUN - LANGGUR</td>
                    <td className="text-right">LEMBAR I</td>
                    <td className="w-[10px]">:</td>
                    <td className="w-[250px]">DIREKTORAT KEAMANAN PENERBANGAN</td>
                </tr>
                <tr>
                    <td>Bulan / Tahun</td>
                    <td>:</td>
                    <td>{reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</td>
                    <td className="text-right">LEMBAR II</td>
                    <td>:</td>
                    <td>KANTOR OTORITAS BANDAR UDARA WILAYAH VIII</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="text-right">LEMBAR III</td>
                    <td>:</td>
                    <td>KANTOR UPBU KELAS II KAREL SADSUITUBUN</td>
                </tr>
            </tbody>
        </table>
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
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900/50 border border-white/10 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/5 flex items-center justify-center gap-2 transition-all">
                <Filter size={16} />
                Filter
            </button>
        </div>
      </motion.div>

      {/* Content Section (Table desktop / Cards mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible"
      >
         {/* Glass Gradient Overlay (Hidden on Print & Mobile) */}
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none print:hidden hidden md:block" />

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto print:block print:overflow-visible">
            <table className="w-full text-sm text-left relative z-10 print:text-black print-table">
                <thead className="text-xs uppercase bg-white/5 text-slate-300 font-bold tracking-wider print:bg-[#B4C6E7] print:text-black">
                    {/* Header Row 1 */}
                    <tr>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 text-center w-10 bg-slate-900/30 print:!bg-[#B4C6E7]">No</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7]">Nama Peralatan</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7]">Jenis Peralatan</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7]">Merk / Tipe / S.N</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7]">No Sertifikat</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 text-center bg-slate-900/30 print:!bg-[#B4C6E7]">Tahun Instalasi</th>
                        <th colSpan={2} className="px-6 py-2 border-b border-r border-white/10 text-center bg-slate-900/30 print:!bg-[#B4C6E7]">Kondisi Peralatan</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7]">Keterangan</th>
                        <th rowSpan={2} className="px-6 py-4 border-b border-l border-white/10 text-center bg-slate-900/30 print:hidden">Aksi</th>
                    </tr>
                    {/* Header Row 2 */}
                    <tr>
                        <th className="px-4 py-2 border-b border-r border-white/10 text-center w-16 bg-slate-900/30 print:!bg-[#B4C6E7]">%</th>
                        <th className="px-4 py-2 border-b border-r border-white/10 text-center bg-slate-900/30 print:!bg-[#B4C6E7]">Laik / Tidak Laik Operasi*</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black">
                    {loading ? (
                       <tr>
                         <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                           <div className="flex flex-col items-center gap-3">
                             <RefreshCw className="animate-spin text-indigo-500" size={24} />
                             <span>Memuat data peralatan...</span>
                           </div>
                         </td>
                       </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-slate-500 italic">
                          {data.length === 0 ? "Belum ada data peralatan." : "Pencarian tidak ditemukan."}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="hover:bg-white/5 transition-colors group print:text-black print:bg-white"
                        >
                            <td className="px-6 py-4 text-center text-slate-400 font-mono border-r border-white/5 print:text-black print:border-black">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-white border-r border-white/5 group-hover:text-blue-200 transition-colors print:text-black print:border-black">{item.nama}</td>
                            <td className="px-6 py-4 text-slate-300 border-r border-white/5 print:text-black print:border-black">{item.jenis}</td>
                            <td className="px-6 py-4 text-slate-400 border-r border-white/5 font-mono text-xs print:text-black print:border-black">{item.merk || "-"}</td>
                            <td className="px-6 py-4 text-slate-300 border-r border-white/5 print:text-black print:border-black">
                                {item.no_sertifikat && item.no_sertifikat !== "-" ? (
                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold print:bg-transparent print:text-black print:border-none">
                                        {item.no_sertifikat}
                                    </span>
                                ) : (
                                    <span className="text-slate-500 print:text-black">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 border-r border-white/5 print:text-black print:border-black">{item.tahun_instalasi || "-"}</td>
                            
                            {/* Kondisi % */}
                            <td className="px-4 py-4 text-center border-r border-white/5 font-bold print:text-black print:border-black">
                                <span className={`${
                                    (item.kondisi_persen || 0) >= 90 ? "text-emerald-400 print:text-black" : 
                                    (item.kondisi_persen || 0) >= 70 ? "text-amber-400 print:text-black" : "text-red-400 print:text-black"
                                }`}>
                                    {item.kondisi_persen || 0}%
                                </span>
                            </td>

                            {/* Kondisi Text */}
                            <td className="px-6 py-4 text-center border-r border-white/5 print:text-black print:border-black">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                                    item.status_laik === "TIDAK LAIK OPERASI" 
                                    ? "bg-red-500/10 border-red-500/20 text-red-400 print:bg-transparent print:text-black print:border-none print:p-0" 
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black print:border-none print:p-0"
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full print:hidden ${
                                        item.status_laik === "TIDAK LAIK OPERASI" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                                    }`} />
                                    <span className="text-[10px] font-bold tracking-wide uppercase">{item.status_laik || "UNKNOWN"}</span>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-slate-400 text-xs italic print:text-black print:border-black">
                                {item.keterangan || "-"}
                            </td>
                            
                            {/* Actions Column (Print Hidden) */}
                            <td className="px-6 py-4 text-center border-l border-white/5 print:hidden">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                        title="Edit Data"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Hapus Data"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                      ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
             {loading ? (
                  <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-indigo-500" size={24} />
                       <span>Memuat data...</span>
                  </div>
             ) : filteredData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic">
                      Tidak ada data ditemukan.
                  </div>
             ) : (
                filteredData.map((item) => {
                    const isLaik = item.status_laik !== "TIDAK LAIK OPERASI";
                    const statusColor = isLaik ? "emerald" : "red";
                    const statusText = isLaik ? "LAIK OPERASI" : "TIDAK LAIK";
                    const kondisi = item.kondisi_persen || 0;
                    
                    return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-lg group`}
                    >   
                        {/* Status Indicator Line */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-${statusColor}-500`} />
                        
                        <div className="pl-3 flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white text-lg tracking-tight leading-snug">{item.nama}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-slate-400 border border-white/5 tracking-wider">
                                            {item.jenis}
                                        </span>
                                        {item.merk && (
                                            <span className="text-xs text-slate-500 font-medium">
                                                {item.merk}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status Chip */}
                                <div className={`px-2.5 py-1 rounded-lg border ${
                                    isLaik
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                    <span className="text-[10px] font-bold tracking-wide uppercase">{statusText}</span>
                                </div>
                            </div>
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/5 border-b border-white/5 border-dashed">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Sertifikat</p>
                                    <p className="text-sm text-slate-300 font-mono">{item.no_sertifikat || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Instalasi</p>
                                    <p className="text-sm text-slate-300 font-mono">{item.tahun_instalasi || "-"}</p>
                                </div>
                            </div>

                            {/* Kondisi & Actions */}
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kondisi Alat</p>
                                        <span className={`text-xs font-bold ${loading ? 'text-slate-500' : isLaik ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {kondisi}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                kondisi >= 90 ? "bg-emerald-500" : 
                                                kondisi >= 70 ? "bg-amber-500" : "bg-red-500"
                                            }`}
                                            style={{ width: `${kondisi}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                                    <button 
                                        onClick={() => handleEdit(item)} 
                                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="p-2.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 border border-white/10 text-slate-400 rounded-xl active:scale-95 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    );
                })
             )}
        </div>
        
        {/* Pagination Shadow Footer */}
        <div className="h-2 bg-gradient-to-t from-black/20 to-transparent print:hidden" />
      </motion.div>
    </div>
  );
}
