"use client";

import { useMemo } from "react";
import { Jadwal } from "@/lib/types";
import { 
  Calendar, 
  Sun, 
  Moon,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface JadwalStatsProps {
  data: Jadwal[];
}

export default function JadwalStats({ data }: JadwalStatsProps) {
  const stats = useMemo(() => {
    const total = data.length;
    
    // Filter logic based on user request ('Dinas Pagi', 'Dinas Elban')
    const pagi = data.filter(item => item.nama_kegiatan.toLowerCase().includes('pagi')).length;
    const elban = data.filter(item => item.nama_kegiatan.toLowerCase().includes('elban')).length; // Or 'siang'? Following 'Elban' as requested.
    
    // Others/Etc
    const others = total - pagi - elban;

    return { total, pagi, elban, others };
  }, [data]);

  const cards = [
    {
      title: "Total Jadwal",
      value: stats.total,
      icon: Calendar,
      color: "blue",
      desc: "Semua kegiatan terjadwal"
    },
    {
      title: "Dinas Pagi",
      value: stats.pagi,
      icon: Sun,
      color: "amber",
      desc: "Pengecekan Peralatan"
    },
    {
      title: "Dinas Elban",
      value: stats.elban,
      icon: Moon, // Assuming Elban might be afternoon/night or specific shift
      color: "indigo",
      desc: "Standby di Elban"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden bg-slate-900/50 border border-white/5 p-4 rounded-2xl group hover:bg-slate-800/50 transition-colors"
        >
          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${card.color}-500 blur-2xl rounded-full w-24 h-24 -mr-8 -mt-8`} />
          
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 border border-${card.color}-500/20`}>
              <card.icon size={20} />
            </div>
            <span className={`text-2xl font-black text-white`}>
              {card.value}
            </span>
          </div>
          
          <div>
            <h3 className="text-slate-200 font-bold text-sm">{card.title}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{card.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
