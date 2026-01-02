"use client";

import { useMemo } from "react";
import { Personel } from "@/lib/types";
import { 
  Users, 
  Award, 
  BookOpen, 
  XCircle,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

interface PersonelStatsProps {
  data: Personel[];
}

export default function PersonelStats({ data }: PersonelStatsProps) {
  const stats = useMemo(() => {
    const total = data.length;
    
    // Certificate Logic: Valid if noSertifikat or jenisSertifikat is present/non-empty/non-dash
    const certs = data.filter(item => {
        const hasCertNo = item.noSertifikat && item.noSertifikat !== '-' && item.noSertifikat.length > 2;
        const hasCertType = item.jenisSertifikat && item.jenisSertifikat !== '-' && item.jenisSertifikat.length > 2;
        return hasCertNo || hasCertType;
    }).length;
    const noCerts = total - certs;

    // Competence Logic: Valid if kompetensiPendidikan is present
    const competence = data.filter(item => {
        return item.kompetensiPendidikan && item.kompetensiPendidikan.length > 2 && item.kompetensiPendidikan !== '-';
    }).length;
    const noCompetence = total - competence;

    return { total, certs, noCerts, competence, noCompetence };
  }, [data]);

  const cards = [
    {
      title: "Jumlah Personel",
      value: stats.total,
      suffix: "Orang",
      icon: Users,
      color: "blue",
      desc: "Total personel terdaftar"
    },
    {
      title: "Bersertifikat",
      value: stats.certs,
      suffix: "Orang",
      icon: Award,
      color: "emerald",
      desc: `${Math.round((stats.certs / stats.total) * 100) || 0}% memiliki sertifikat`
    },
    {
      title: "Memiliki Kompetensi",
      value: stats.competence,
      suffix: "Orang",
      icon: GraduationCap,
      color: "purple",
      desc: `${Math.round((stats.competence / stats.total) * 100) || 0}% memenuhi standar`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="flex justify-between items-center mt-0.5">
                 <p className="text-slate-500 text-xs">{card.desc}</p>
                 <span className="text-xs text-slate-600 font-medium">{card.suffix}</span>
            </div>
           
          </div>
        </motion.div>
      ))}

      {/* Detail Mini Cards for Missing Attributes */}
      <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
             className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex justify-between items-center px-6"
           >
                <div className="flex items-center gap-3">
                    <XCircle size={18} className="text-red-400" />
                    <span className="text-red-300 font-medium text-sm">Belum Memiliki Sertifikat</span>
                </div>
                <span className="text-xl font-bold text-white">{stats.noCerts} <span className="text-xs text-slate-500 font-normal">Orang</span></span>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
             className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex justify-between items-center px-6"
           >
                <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-amber-400" />
                    <span className="text-amber-300 font-medium text-sm">Belum Memiliki Kompetensi</span>
                </div>
                <span className="text-xl font-bold text-white">{stats.noCompetence} <span className="text-xs text-slate-500 font-normal">Orang</span></span>
           </motion.div>
      </div>

    </div>
  );
}
