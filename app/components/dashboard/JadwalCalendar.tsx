"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from "lucide-react";
import { Jadwal } from "@/lib/types";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface JadwalCalendarProps {
  data: Jadwal[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: Jadwal) => void;
  onDateClick: (date: Date) => void;
}

export default function JadwalCalendar({ 
  data, 
  loading, 
  onDelete,
  onEdit,
  onDateClick
}: JadwalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get days in month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day of week for 1st of month (0 = Sunday, 1 = Monday, ...)
    const startDay = firstDayOfMonth.getDay(); // 0-6
    
    // Total days in month
    const totalDays = lastDayOfMonth.getDate();

    // Generate padding days for previous month
    const paddingDays = Array.from({ length: startDay }, (_, i) => {
        const d = new Date(year, month, 0 - (startDay - 1 - i));
        return { date: d, isCurrentMonth: false };
    });

    // Generate days for current month
    const days = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return { date: d, isCurrentMonth: true };
    });

    // Generate padding for next month to complete the grid (optional, but looks better)
    const totalSlots = paddingDays.length + days.length;
    const remainingSlots = 42 - totalSlots; // 6 rows * 7 cols = 42
    const nextPaddingDays = Array.from({ length: remainingSlots > 0 ? remainingSlots : 0 }, (_, i) => {
        const d = new Date(year, month + 1, i + 1);
        return { date: d, isCurrentMonth: false };
    });

    return [...paddingDays, ...days, ...nextPaddingDays];
  }, [currentDate]);

  // Group data by date string (YYYY-MM-DD)
  const groupedData = useMemo(() => {
    const groups: Record<string, Jadwal[]> = {};
    data.forEach(item => {
        // item.tanggal is typically YYYY-MM-DD string
        const dateKey = item.tanggal.split('T')[0]; 
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(item);
    });
    // Sort each group by time
    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => (a.waktu || '').localeCompare(b.waktu || ''));
    });
    return groups;
  }, [data]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const toToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Colors for avatars (reused logic)
  const getAvatarColor = (name: string) => {
     const colors = [
        { bg: 'bg-blue-500', text: 'text-blue-100', border: 'border-blue-500/30', soft: 'bg-blue-500/10' },
        { bg: 'bg-emerald-500', text: 'text-emerald-100', border: 'border-emerald-500/30', soft: 'bg-emerald-500/10' },
        { bg: 'bg-violet-500', text: 'text-violet-100', border: 'border-violet-500/30', soft: 'bg-violet-500/10' },
        { bg: 'bg-amber-500', text: 'text-amber-100', border: 'border-amber-500/30', soft: 'bg-amber-500/10' },
        { bg: 'bg-rose-500', text: 'text-rose-100', border: 'border-rose-500/30', soft: 'bg-rose-500/10' },
     ];
     const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     return colors[sum % colors.length];
  };

  if (loading) {
      return (
          <div className="w-full h-[500px] flex items-center justify-center rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
              <LoadingSpinner label="Memuat kalender..." />
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Calendar Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                    <CalendarIcon className="text-indigo-400" size={24} />
                    {monthName}
                 </h2>
                 <button 
                    onClick={toToday}
                    className="text-xs px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                 >
                    Hari Ini
                 </button>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={prevMonth}
                    className="p-2 rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-white transition-all active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-white transition-all active:scale-95"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-indigo-500/5">
            {/* Week Headers */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-slate-900/50">
                {weekDays.map((day, i) => (
                    <div key={i} className="py-3 text-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-900/20">
                {calendarData.map((cell, index) => {
                    const dateStr = cell.date.toLocaleDateString("en-CA"); // YYYY-MM-DD
                    const items = groupedData[dateStr] || [];
                    const isToday = new Date().toLocaleDateString("en-CA") === dateStr;
                    
                    return (
                        <div 
                            key={index} 
                            onClick={() => onDateClick(cell.date)} 
                            className={`
                                min-h-[140px] p-2 border-b border-r border-white/5 relative group transition-colors
                                ${!cell.isCurrentMonth ? 'bg-slate-950/50 text-slate-600' : 'hover:bg-white/[0.02]'}
                                ${isToday ? 'bg-indigo-500/5' : ''}
                            `}
                        >
                            {/* Date Number */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`
                                    text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'}
                                    ${!cell.isCurrentMonth ? 'opacity-30' : ''}
                                `}>
                                    {cell.date.getDate()}
                                </span>
                                {isToday && <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full">Hari Ini</span>}
                            </div>

                            {/* Events List */}
                            <div className="flex flex-col gap-1.5">
                                <AnimatePresence>
                                    {items.map((item) => {
                                        // Check for Personnel Status format: "Status - Name"
                                        const statusMatches = item.nama_kegiatan.match(/^(Dinas Pagi|Dinas Elban|Dinas Luar|Izin|Cuti|Sakit|Tugas Belajar)\s-\s(.+)$/);
                                        
                                        let shortName = item.nama_kegiatan;
                                        let dotColor = "bg-slate-500";
                                        
                                        if (statusMatches) {
                                            const [_, status, fullName] = statusMatches;
                                            shortName = fullName;
                                            
                                            // Status Color Map (Backgrounds for Dots)
                                            const statusColors: Record<string, string> = {
                                                "Dinas Pagi": "bg-emerald-500",
                                                "Dinas Elban": "bg-blue-500",
                                                "Dinas Luar": "bg-cyan-500",
                                                "Izin": "bg-yellow-500",
                                                "Cuti": "bg-orange-500",
                                                "Sakit": "bg-red-500",
                                                "Tugas Belajar": "bg-indigo-500",
                                            };
                                            dotColor = statusColors[status] || "bg-emerald-500";
                                        } 
                                        
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 mb-1 group/item cursor-pointer"
                                                title={item.nama_kegiatan} // Tooltip full text
                                                onClick={(e) => {
                                                    // Pass click to parent cell handler if possible, otherwise just stop propagation?
                                                    // Actually, if we stop propagation, the "Day Detail" won't open.
                                                    // The user wants "Day Detail" on click.
                                                    // So we should NOT stop propagation here, or call the same handler.
                                                    // For simple visuals, just letting the click bubble up to the cell div is best.
                                                    // But we previously had specific edit actions.
                                                    // Now the "Edit" is inside the DayDetailModal. 
                                                    // So we just let it bubble up!
                                                }}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor} shadow-[0_0_4px_rgba(0,0,0,0.5)]`} /> 
                                                <span className="text-[10px] font-medium text-slate-400 truncate group-hover/item:text-white transition-colors">
                                                    {shortName}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                            
                            {/* Hover Add Indicador (Desktop) */}
                            {/* Removed redundant plus button since whole cell opens detail */}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
