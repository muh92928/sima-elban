"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Printer,
  User,
  Filter,
  Users
} from "lucide-react";
import { notify } from "@/lib/notify";
import AddPersonelModal from "@/app/components/dashboard/AddPersonelModal";
import PersonelTable from "@/app/components/dashboard/PersonelTable";
import PersonelStats from "@/app/components/dashboard/PersonelStats";
import { deletePersonel } from "./actions";
import { useRouter } from "next/navigation";
import { Personel } from "@/lib/types";

interface PersonelClientProps {
  initialData: Personel[];
}

export default function PersonelClient({ initialData }: PersonelClientProps) {
  const router = useRouter();
  const [personelData, setPersonelData] = useState<Personel[]>(initialData);
  const [loading, setLoading] = useState(false);
  
  // State for Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [jabatanFilter, setJabatanFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingItem, setEditingItem] = useState<Personel | null>(null);

  const handleEdit = (item: Personel) => {
    setEditingItem(item); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data personel ini?")) {
        setLoading(true);
        const result = await deletePersonel(id);
        if (result.success) {
            notify.success("Personel berhasil dihapus");
            router.refresh();
            setPersonelData(prev => prev.filter(p => p.id !== id));
        } else {
            notify.error(result.error || "Gagal menghapus");
        }
        setLoading(false);
    }
  };

  const filteredData = personelData.filter((item) => {
    // Search
    const query = searchTerm.toLowerCase();
    const matchesSearch = item.nama.toLowerCase().includes(query) ||
    (item.nip && item.nip.toLowerCase().includes(query)) ||
    (item.jabatan && item.jabatan.toLowerCase().includes(query));

    // Jabatan Filter
    const matchesJabatan = jabatanFilter === "all" || item.jabatan === jabatanFilter;
    
    // Date Filter (Visual consistency, or filter by created_at if available? Personel usually static. 
    // We'll just return true for date to keep standardization visual without hiding data unexpectedly)
    
    return matchesSearch && matchesJabatan;
  });

  const uniqueJabatan = Array.from(new Set(personelData.map(item => item.jabatan).filter(Boolean)));

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      <AddPersonelModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
        }}
        onSuccess={() => {
            router.refresh();
        }}
        initialData={editingItem || undefined}
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
          /* Target standard tables */
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #000 !important; padding: 4px 6px !important; color: black !important; }
          th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; vertical-align: middle; }
          td { vertical-align: top; }
          
          /* Force Text Color */
          * { color: black !important; text-shadow: none !important; }
        `}
      </style>

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col @tablet:flex-row @tablet:items-center justify-between gap-4 print:hidden"
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
                 <Users className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                Data Personel
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">Manajemen data anggota dan pegawai.</p>
        </div>
        </div>
      </motion.div>

       {/* Print Only Header (Official Format) */}
       <div className="hidden print-block text-black mb-4 print-container">
         <div className="print-title text-center font-bold mb-4">
             DATA PERSONEL TEKNISI PENERBANGAN<br/>
             UPBU KELAS II KAREL SADSUITUBUN - LANGGUR
         </div>
         
         <div className="w-full flex justify-between items-start text-xs font-bold leading-relaxed">
             {/* Left Side Info */}
             <div className="flex-1">
                 <table className="print-header-table w-auto border-none" style={{ border: 'none' }}>
                     <tbody>
                         <tr style={{ border: 'none' }}>
                             <td className="w-[120px] border-none !border-0 pl-0">BANDAR UDARA</td>
                             <td className="w-[10px] border-none !border-0">:</td>
                             <td className="border-none !border-0">KAREL SADSUITUBUN - LANGGUR</td>
                         </tr>
                         <tr>
                             <td className="border-none !border-0 pl-0">Tanggal Laporan</td>
                             <td className="border-none !border-0">:</td>
                             <td className="border-none !border-0">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>

             {/* Right Side Info */}
             <div className="flex-1 flex flex-col items-end">
                  <table className="print-header-table w-auto border-none" style={{ width: 'auto', border: 'none' }}>
                     <tbody>
                         <tr>
                             <td className="text-left w-[80px] border-none !border-0">LEMBAR I</td>
                             <td className="text-center w-[10px] border-none !border-0">:</td>
                             <td className="text-left w-[300px] border-none !border-0">DIREKTORAT KEAMANAN PENERBANGAN</td>
                         </tr>
                         <tr>
                             <td className="text-left border-none !border-0">LEMBAR II</td>
                             <td className="text-center border-none !border-0">:</td>
                             <td className="text-left border-none !border-0">KANTOR OTORITAS BANDAR UDARA WILAYAH VIII</td>
                         </tr>
                         <tr>
                             <td className="text-left border-none !border-0">LEMBAR III</td>
                             <td className="text-center border-none !border-0">:</td>
                             <td className="text-left border-none !border-0">KANTOR UPBU KELAS II KAREL SADSUITUBUN</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
         </div>
       </div>

      {/* Stats Widget */}
      <div className="print:hidden">
          <PersonelStats data={personelData} />
      </div>

      {/* Search & Filter */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col @tablet:flex-row gap-3 print:hidden"
      >
        <div className="relative w-full @tablet:flex-1 @tablet:max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari Nama, NIP, atau Jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
         <div className="w-full @tablet:w-auto relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <select 
                value={jabatanFilter}
                onChange={(e) => setJabatanFilter(e.target.value)}
                className="w-full @tablet:w-48 bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Jabatan</option>
                {/* Dynamically Generate Jabatan Options */}
                {uniqueJabatan.map(jab => (
                   <option key={jab} value={jab || ''}>{jab}</option>
                ))}
            </select>
         </div>

         {/* Actions Moved Here */}
         <div className="flex items-center gap-3 ml-auto w-full @tablet:w-auto justify-end">
             <button 
                onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
            >
                <Plus size={16} />
                <span className="hidden lg:inline">Tambah Personel</span>
                <span className="lg:hidden">Baru</span>
            </button>
            <button 
                onClick={() => window.print()}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                title="Cetak Data"
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
      >
          <PersonelTable 
            data={filteredData} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
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
                 <p className="mb-1">Langgur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 <p className="font-bold">PIC ADMINISTRASI</p> 
                 {/* Changed to PIC ADMINISTRASI for Personel? Or keep PIC PELAPORAN? User said same format. I'll keep generic/similar but "PIC" is safer than "PIC PELAPORAN" if it's personel data. Or maybe "PENGELOLA KEPEGAWAIAN"? */}
                 {/* I will use PIC KEPEGAWAIAN or similar. But user said "format yang sama". */}
                 <div className="relative h-20 w-32 flex items-center justify-center my-1">
                      {/* Signature placeholder or same sig? I'll use same sig for consistency if requested. */}
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
