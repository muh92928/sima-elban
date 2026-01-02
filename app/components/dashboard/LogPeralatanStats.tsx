"use client";

import { useMemo } from "react";
import { LogPeralatan } from "@/lib/types";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Wrench,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

interface LogPeralatanStatsProps {
  data: LogPeralatan[];
}

export default function LogPeralatanStats({ data }: LogPeralatanStatsProps) {
  const stats = useMemo(() => {
    const total = data.length;
    const normal = data.filter(item => item.status === 'Normal Ops').length;
    const perbaikan = data.filter(item => item.status === 'Perlu Perbaikan').length;
    const perawatan = data.filter(item => item.status === 'Perlu Perawatan').length;

    return { total, normal, perbaikan, perawatan };
  }, [data]);

  const cards = [
    {
      title: "Total Log",
      value: stats.total,
      icon: Activity,
      color: "blue",
      description: "Total catatan log"
    },
    {
      title: "Normal Ops",
      value: stats.normal,
      icon: ClipboardCheck,
      color: "emerald",
      description: "Operasional normal"
    },
    {
      title: "Perlu Perawatan",
      value: stats.perawatan,
      icon: Wrench,
      color: "amber",
      description: "Jadwal maintenance"
    },
    {
      title: "Perlu Perbaikan",
      value: stats.perbaikan,
      icon: AlertTriangle,
      color: "red",
      description: "Kerusakan dilaporkan"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <p className="text-slate-500 text-xs mt-0.5">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
