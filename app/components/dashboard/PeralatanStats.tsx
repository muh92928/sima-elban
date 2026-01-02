"use client";

import { motion } from "framer-motion";
import { Wrench, CheckCircle2, Box, AlertTriangle, Activity } from "lucide-react";
import { Peralatan } from "@/lib/types";

interface PeralatanStatsProps {
  data: Peralatan[];
}

export default function PeralatanStats({ data }: PeralatanStatsProps) {
  const totalAssets = data.length;
  const goodCondition = data.filter(item => item.status_laik === 'LAIK OPERASI').length;
  // Assuming 'TIDAK LAIK OPERASI' or other statuses indicate maintenance/bad
  const maintenanceNeeded = data.filter(item => item.status_laik !== 'LAIK OPERASI').length;
  
  const goodPercentage = totalAssets > 0 ? Math.round((goodCondition / totalAssets) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Aset */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box size={80} className="text-blue-500" />
        </div>
        <div className="flex flex-col gap-1 z-10 relative">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Aset</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{totalAssets}</span>
                <span className="text-xs text-slate-500 font-medium">Unit</span>
            </div>
            <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                <Activity size={12} />
                <span>Terdaftar dalam sistem</span>
            </div>
        </div>
      </motion.div>

      {/* Kondisi Baik */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={80} className="text-emerald-500" />
        </div>
        <div className="flex flex-col gap-1 z-10 relative">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Kondisi Prima</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{goodCondition}</span>
                <span className="text-xs text-slate-500 font-medium">Unit</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Siap Operasi (Laik)</span>
            </div>
        </div>
      </motion.div>

      {/* Perlu Perbaikan */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={80} className="text-amber-500" />
        </div>
        <div className="flex flex-col gap-1 z-10 relative">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Perlu Perhatian</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{maintenanceNeeded}</span>
                <span className="text-xs text-slate-500 font-medium">Unit</span>
            </div>
            <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                <Wrench size={12} />
                <span>Tidak Laik / Rusak</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
