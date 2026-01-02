"use client";

import { useMemo } from "react";
import { Pengaduan } from "@/lib/types";
import { 
  Inbox, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface PengaduanStatsProps {
  data: Pengaduan[];
}

export default function PengaduanStats({ data }: PengaduanStatsProps) {
  const stats = useMemo(() => {
    const total = data.length;
    
    const baru = data.filter(item => item.status === 'Baru').length;
    const diproses = data.filter(item => item.status === 'Diproses').length;
    const selesai = data.filter(item => item.status === 'Selesai').length;

    return { total, baru, diproses, selesai };
  }, [data]);

  const cards = [
    {
      title: "Baru Masuk",
      value: stats.baru,
      icon: Inbox,
      color: "blue",
      desc: "Menunggu respons"
    },
    {
      title: "Sedang Diproses",
      value: stats.diproses,
      icon: Loader2,
      color: "amber",
      desc: "Dalam pengerjaan"
    },
    {
      title: "Selesai",
      value: stats.selesai,
      icon: CheckCircle2,
      color: "emerald",
      desc: "Telah ditangani"
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
