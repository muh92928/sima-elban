"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Jadwal } from "@/lib/types";
import AddJadwalModal from "@/app/components/dashboard/AddJadwalModal";
import DayDetailsModal from "@/app/components/dashboard/DayDetailsModal";
import JadwalCalendar from "@/app/components/dashboard/JadwalCalendar";

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
  
  // Day Details State
  const [selectedDetailDate, setSelectedDetailDate] = useState<Date | null>(null);

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
        } catch (error) {
            console.error("Error deleting jadwal:", error);
            alert("Gagal menghapus jadwal.");
        }
    }
  };

  // Filter Data Logic (Search Only)
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    return (
      item.nama_kegiatan.toLowerCase().includes(query) ||
      item.lokasi.toLowerCase().includes(query) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(query))
    );
  });

  // Events for selected date
  const selectedDateEvents = selectedDetailDate ? data.filter(item => {
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
            }} 
            onSuccess={() => {
                refreshData();
                // If we authorized from detail view, maybe reopen it? 
                // Creating new usually ends flow, so just refresh is fine.
            }} 
            initialData={editingItem}
            defaultDate={selectedDetailDate ? selectedDetailDate.toLocaleDateString('en-CA') : undefined}
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
                // Open Add Modal, keep date selected
                setIsModalOpen(true);
                setSelectedDetailDate(null); // Close detail view to switch to Add
            }}
        />

      {/* Header & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Jadwal Kegiatan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Agenda dan rencana aktivitas tim.</p>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    setEditingItem(null);
                    setSelectedDetailDate(null);
                    setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={16} />
                Tambah Jadwal
            </button>
            <button 
                onClick={handleRefresh}
                className={`p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors ${refreshing ? "animate-spin" : ""}`}
                title="Refresh Data"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </motion.div>

      {/* Filters */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kegiatan atau lokasi..." 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
        </div>
      </motion.div>

      {/* Content Section - Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
          <JadwalCalendar 
            data={filteredData}
            loading={loading || refreshing}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDateClick={(date: Date) => setSelectedDetailDate(date)}
          />
      </motion.div>
    </div>
  );
}
