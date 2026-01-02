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
import { toast } from "react-hot-toast";
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
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date()); // Visual only for now, or match DOB?
  
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
            toast.success("Personel berhasil dihapus");
            router.refresh();
            setPersonelData(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error(result.error || "Gagal menghapus");
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
    <div className="space-y-6 pb-20">
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

      {/* Stats Widget */}
      <PersonelStats data={personelData} />

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
            placeholder="Cari Nama, NIP, atau Jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
         <div className="w-full md:w-auto relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <select 
                value={jabatanFilter}
                onChange={(e) => setJabatanFilter(e.target.value)}
                className="w-full md:w-48 bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Jabatan</option>
                {/* Dynamically Generate Jabatan Options */}
                {uniqueJabatan.map(jab => (
                   <option key={jab} value={jab || ''}>{jab}</option>
                ))}
            </select>
         </div>

         {/* Actions Moved Here */}
         <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
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
    </div>
  );
}
