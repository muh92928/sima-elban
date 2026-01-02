"use client";

import { useMemo } from "react";
import { Akun } from "@/lib/types";
import { 
  UserPlus, 
  UserCheck, 
  UserX,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

interface KonfirmasiAkunStatsProps {
  data: Akun[];
}

export default function KonfirmasiAkunStats({ data }: KonfirmasiAkunStatsProps) {
  const stats = useMemo(() => {
    const total = data.length;
    
    const pending = data.filter(item => item.status === 'pending').length;
    const approved = data.filter(item => item.status === 'approved').length;
    const rejected = data.filter(item => item.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }, [data]);

  const cards = [
    {
      title: "Menunggu Konfirmasi",
      value: stats.pending,
      icon: UserPlus,
      color: "amber",
      desc: "User baru mendaftar"
    },
    {
      title: "Disetujui",
      value: stats.approved,
      icon: UserCheck,
      color: "emerald",
      desc: "Akun aktif"
    },
    {
      title: "Ditolak",
      value: stats.rejected,
      icon: UserX,
      color: "red",
      desc: "Permintaan ditolak"
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
