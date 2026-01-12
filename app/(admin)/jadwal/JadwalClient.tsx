
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  CalendarDays,
  Printer
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Jadwal, Akun } from "@/lib/types"; // Import Akun
import AddJadwalModal from "@/app/components/dashboard/AddJadwalModal";
import DayDetailsModal from "@/app/components/dashboard/DayDetailsModal";
import JadwalCalendar from "@/app/components/dashboard/JadwalCalendar";
import JadwalMatrixPrint from "@/app/components/dashboard/JadwalMatrixPrint";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import JadwalStats from "@/app/components/dashboard/JadwalStats";
import { notify } from "@/lib/notify";

interface JadwalClientProps {
  initialData: Jadwal[];
}

export default function JadwalClient({ initialData }: JadwalClientProps) {
  const [data, setData] = useState<Jadwal[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jadwal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [kanitElban, setKanitElban] = useState<Akun | null>(null); 
  const [userMap, setUserMap] = useState<Record<string, string>>({}); // Name -> WA Number map
  
  // Day Details State
  const [selectedDetailDate, setSelectedDetailDate] = useState<Date | null>(null);
  const [addModalDate, setAddModalDate] = useState<string | undefined>(undefined);

  // Fetch Kanit & All Users for Phone Mapping
  const fetchJadwalAuxData = async () => {
      try {
          // 1. Fetch Kanit
          const { data: kanitData } = await supabase
            .from('akun')
            .select('*')
            .eq('peran', 'KANIT_ELBAN')
            .limit(1);
          
          if (kanitData && kanitData.length > 0) {
              setKanitElban(kanitData[0] as Akun);
          }

          // 2. Fetch All Users for Phone Mapping
          const { data: allUsers } = await supabase
            .from('akun')
            .select('nama, no_wa');
            
          if (allUsers) {
              const map: Record<string, string> = {};
              allUsers.forEach((u: any) => {
                  if (u.nama && u.no_wa) {
                      map[u.nama] = u.no_wa;
                  }
              });
              setUserMap(map);
          }

      } catch (err) {
          console.error("Error fetching aux data:", err);
      }
  };

  useEffect(() => {
      fetchJadwalAuxData();
  }, []);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const { data: jadwal, error } = await supabase
        .from('jadwal')
        .select('*')
        .order('tanggal', { ascending: true })
        .order('waktu', { ascending: true });

      if (error) throw error;
      
      setData(jadwal as Jadwal[] || []);
      fetchJadwalAuxData(); 
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleEdit = (item: Jadwal) => {
      setEditingItem(item);
      setIsModalOpen(true);
      setSelectedDetailDate(null); // Close detail if open
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
        try {
            const { error } = await supabase.from('jadwal').delete().eq('id', id);
            if (error) throw error;
            refreshData();
            notify.success("Jadwal berhasil dihapus");
        } catch (error) {
            console.error("Error deleting jadwal:", error);
            notify.error(`Gagal menghapus jadwal: ${error.message}`);
        }
    }
  };

  // Filter Logic
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Set default date filter on mount
  useEffect(() => {
    setDateFilter(new Date());
  }, []);

  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Search
    const matchSearch = (
      item.nama_kegiatan.toLowerCase().includes(query) ||
      item.lokasi.toLowerCase().includes(query) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(query))
    );

    // Location Filter (Example)
    const matchFilter = filterType === "all" || item.lokasi === filterType;

    // Date Filter matches *Month*
    const itemDate = new Date(item.tanggal);
    const matchDate = dateFilter 
        ? itemDate.getFullYear() === dateFilter.getFullYear() && itemDate.getMonth() === dateFilter.getMonth()
        : true;
    
    return matchSearch && matchFilter && matchDate;
  });

  const uniqueLocations = Array.from(new Set(data.map(i => i.lokasi).filter(Boolean)));
  
  // Events for selected date (derived from filteredData or original data? Usually filtered to match view)
  // But if we filtering by Month, we should use filteredData for consistency?
  // Actually, standard behavior is calendar shows what fits filter.
  // The 'selectedDateEvents' depends on 'selectedDetailDate'.
  const selectedDateEvents = selectedDetailDate ? data.filter(item => { // Keeping original data for details to avoid confusing misses if filter is active
      const d = new Date(item.tanggal);
      return d.toDateString() === selectedDetailDate.toDateString();
  }) : [];

  return (
    <div className="space-y-6">
        {/* Modal Add/Edit */}
        <AddJadwalModal 
            isOpen={isModalOpen} 
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                setAddModalDate(undefined);
            }} 
            onSuccess={() => {
                refreshData();
            }} 
            initialData={editingItem}
            defaultDate={addModalDate}
        />

        {/* Modal Day Details */}
        <DayDetailsModal 
            isOpen={!!selectedDetailDate}
            onClose={() => setSelectedDetailDate(null)}
            date={selectedDetailDate}
            events={selectedDateEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => {
                if (selectedDetailDate) {
                    setAddModalDate(selectedDetailDate.toLocaleDateString('en-CA'));
                }
                setIsModalOpen(true);
                setSelectedDetailDate(null); 
            }}
        />

      <style media="print">{`
        .no-print { display: none !important; }
      `}</style>

      <div className="space-y-6 print:hidden no-print">
      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20"
              >
                 <CalendarDays className="text-blue-400" size={26} />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] pb-1">
                Jadwal Kegiatan
              </h1>
           </div>
           <p className="text-slate-400 font-medium text-base">Agenda dan rencana aktivitas tim.</p>
        </div>

      </motion.div>
      
      <JadwalStats data={data} />

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
            placeholder="Cari kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        
        <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-slate-900/70"
            >
                <option value="all">Semua Lokasi</option>
                {uniqueLocations.map(l => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                 <input 
                     type="month"
                     value={dateFilter ? dateFilter.toISOString().slice(0, 7) : ''}
                     onChange={(e) => {
                         if (e.target.value) {
                             setDateFilter(new Date(e.target.value + "-01"));
                         } else {
                             setDateFilter(null);
                         }
                     }}
                     className="w-full md:w-auto h-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                 />
             </div>
         </div>

         <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
            <button 
                onClick={() => {
                    setEditingItem(null);
                    setSelectedDetailDate(null);
                    setAddModalDate(undefined);
                    setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={16} />
                <span className="hidden lg:inline">Tambah Jadwal</span>
                <span className="lg:hidden">Baru</span>
            </button>

             <button
                onClick={() => window.print()}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
                title="Cetak Jadwal"
            >
                <Printer size={18} />
            </button>
        </div>
      </motion.div>
      </div>



      {/* Content Section - Calendar View (Screen Only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="print:hidden" 
      >
          <JadwalCalendar 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDateClick={(date: Date) => setSelectedDetailDate(date)}
          />
      </motion.div>

      {/* PRINT VIEW - MATRIX LAYOUT */}
      <div className="hidden print:block w-full h-full">
         <JadwalMatrixPrint 
            data={filteredData} 
            month={dateFilter || new Date()} 
            kanitElban={kanitElban}
            userMap={userMap}
         />
      </div>
    </div>
  );
}
