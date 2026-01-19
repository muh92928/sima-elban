"use client";

import { useMemo } from "react";
import { Tugas } from "@/lib/types";
import { 
  ClipboardList, 
  UserCheck, 
  Settings,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface TugasStatsProps {
  data: Tugas[];
  type?: 'kanit' | 'log';
}

export default function TugasStats({ data, type }: TugasStatsProps) {
  const isLogTask = (t: Tugas) => {
    const isAutoSource = t.sumber && t.sumber.startsWith('Log Otomatis');
    const isAutoDesc = t.deskripsi && (
        t.deskripsi.includes('Dibuat otomatis dari Log Harian') || 
        t.deskripsi.includes('Dibuat otomatis dari Edit Log') ||
        t.deskripsi.startsWith('Log ')
    );
    return isAutoSource || isAutoDesc;
  };

  const calculateStats = (tasks: Tugas[]) => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      proses: tasks.filter(t => t.status === 'PROSES').length,
      selesai: tasks.filter(t => t.status === 'SELESAI').length,
    };
  };

  const tasksKanit = data.filter(t => !isLogTask(t));
  const tasksLog = data.filter(t => isLogTask(t));

  let sections = [
    { 
      title: "Tugas Kanit Elban", 
      color: "indigo",
      stats: calculateStats(tasksKanit),
      show: !type || type === 'kanit'
    },
    { 
      title: "Tugas Log Peralatan", 
      color: "rose",
      stats: calculateStats(tasksLog),
      show: !type || type === 'log'
    }
  ].filter(s => s.show);

  const getColorClass = (color: string) => {
      const map: any = {
          indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
      return map[color];
  };

  return (
    <div className={`space-y-8 ${!type ? 'mb-8' : ''}`}>
      {sections.map((section, sIdx) => {
        const cards = [
          { title: "Total", value: section.stats.total, icon: ClipboardList, color: section.color, desc: "Seluruh tugas" },
          { title: "Pending", value: section.stats.pending, icon: AlertCircle, color: "amber", desc: "Belum mulai" },
          { title: "Proses", value: section.stats.proses, icon: Settings, color: "blue", desc: "Sedang jalan" },
          { title: "Selesai", value: section.stats.selesai, icon: UserCheck, color: "emerald", desc: "Sudah rampung" },
        ];

        return (
          <div key={sIdx} className="space-y-3">
             <div className="flex items-center gap-2 px-1">
                <div className={`w-1.5 h-6 rounded-full ${section.color === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{section.title}</h3>
             </div>
             <div className="grid grid-cols-1 @tablet:grid-cols-2 @pc:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (sIdx * 4 + index) * 0.05 }}
                    className="relative overflow-hidden bg-slate-900/40 border border-white/5 p-4 rounded-xl group hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${getColorClass(card.color || 'indigo')} border`}>
                        <card.icon size={18} />
                      </div>
                      <span className="text-2xl font-black text-white">
                        {card.value}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-slate-200 font-bold text-xs">{card.title}</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">{card.desc}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
