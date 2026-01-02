"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  User,
  GraduationCap,
  Award,
  Calendar,
  RefreshCw,
  Trash2, 
  Edit,
  Printer
} from "lucide-react";
import { toast } from "react-hot-toast";
import AddPersonelModal from "@/app/components/dashboard/AddPersonelModal";
import { deletePersonel } from "./actions";
import { useRouter } from "next/navigation";

interface Personel {
  id: string;
  nama: string;
  nip: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jabatan: string | null;
  formasiPendidikan: string | null;
  kompetensiPendidikan: string | null;
  noSertifikat: string | null;
  jenisSertifikat: string | null;
  keterangan: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PersonelClientProps {
  initialData: Personel[];
}

export default function PersonelClient({ initialData }: PersonelClientProps) {
  const router = useRouter();
  const [personelData, setPersonelData] = useState<Personel[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Personel | null>(null);

  const handleEdit = (item: Personel) => {
    // Map nulls back to compatible types if necessary for the modal
    // Assuming the modal expects specific types, but typically objects are fine
    // We might need to map snake_case to whatever the modal expects if the modal uses old types
    // But let's pass the item directly first
    setEditingItem(item as any); 
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data personel ini?")) {
        setLoading(true);
        const result = await deletePersonel(id);
        if (result.success) {
            toast.success("Personel berhasil dihapus");
            router.refresh();
            // Optimistic update
            setPersonelData(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error(result.error || "Gagal menghapus");
        }
        setLoading(false);
    }
  };

  const filteredData = personelData.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nip && item.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.jabatan && item.jabatan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      <AddPersonelModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
        }}
        onSuccess={() => {
            router.refresh();
            // We rely on router.refresh() to fetch new data, but for smoother UX usually we'd want to fetch or receive new data
            // For now, simple refresh is enough
        }}
        initialData={editingItem}
      />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <User className="text-indigo-500" size={32} />
             Data Personel
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-11">
             Manajemen data personel unit elektronika bandara.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-sm h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20 gap-2 rounded-xl flex items-center whitespace-nowrap"
            >
                <Plus size={16} />
                <span className="hidden lg:inline">Tambah Personel</span>
                <span className="lg:hidden">Baru</span>
            </button>
            <button 
                onClick={() => router.refresh()}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari Nama, NIP, atau Jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Glassmorphism Table */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="bg-slate-800/80 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="p-5 font-bold text-center w-14">No</th>
                <th className="p-5 font-bold">Personel Info</th>
                <th className="p-5 font-bold">Jabatan & Pendidikan</th>
                <th className="p-5 font-bold">Kompetensi</th>
                <th className="p-5 font-bold">Keterangan</th>
                <th className="p-5 font-bold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                       <User size={48} className="mb-4 opacity-20" />
                       <p>Belum ada data personel ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-5 text-center font-medium text-slate-500 group-hover:text-white transition-colors">
                        {index + 1}
                     </td>
                     <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {item.nama.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-white text-base">{item.nama}</div>
                                <div className="text-xs text-indigo-300 font-mono mt-0.5 flex items-center gap-2">
                                   NIP. {item.nip || "-"}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {item.tempatLahir}, {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString("id-ID") : "-"}
                                </div>
                            </div>
                        </div>
                     </td>
                     <td className="p-5">
                         <div className="flex flex-col gap-2">
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs font-bold w-fit">
                                {item.jabatan || "-"}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <GraduationCap size={14} className="text-slate-500" />
                                <span>{item.formasiPendidikan || "-"}</span>
                            </div>
                         </div>
                     </td>
                     <td className="p-5">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-orange-300 text-xs font-medium">
                                <Award size={14} />
                                {item.jenisSertifikat || "-"}
                            </div>
                            {item.noSertifikat && (
                                <div className="text-[10px] text-slate-500 font-mono bg-black/20 px-2 py-0.5 rounded w-fit">
                                   No: {item.noSertifikat}
                                </div>
                            )}
                            {item.kompetensiPendidikan && (
                                <div className="text-xs text-slate-400 italic">
                                    "{item.kompetensiPendidikan}"
                                </div>
                            )}
                        </div>
                     </td>
                     <td className="p-5 text-slate-500">
                         {item.keterangan || "-"}
                     </td>
                     <td className="p-5">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg transition-colors"
                                title="Hapus"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
