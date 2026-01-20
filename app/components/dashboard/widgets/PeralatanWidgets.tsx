"use client";

import { motion } from "framer-motion";
import { Database, CheckCircle, AlertTriangle, ArrowUpRight, Activity, Wrench, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface PeralatanWidgetsProps {
    stats: {
        peralatanTotal: number;
        peralatanLaik: number;
        peralatanRusak: number;
        logTotalHariIni: number;
        logNormalOps: number;
        logPerluPerbaikan: number;
        logPerluPerawatan: number;
    };
    variants: any;
}

export default function PeralatanWidgets({ stats, variants }: PeralatanWidgetsProps) {
    const router = useRouter();

    const persenLaik = stats.peralatanTotal > 0 ? Math.round((stats.peralatanLaik / stats.peralatanTotal) * 100) : 0;
    const persenRusak = stats.peralatanTotal > 0 ? (100 - persenLaik) : 0;

    // SVG Donut Component for 2 segments (Equipment)
    const EquipmentDonut = ({ laik, rusak }: { laik: number, rusak: number }) => {
        const total = laik + rusak;
        const pLaik = total > 0 ? (laik / total) * 100 : 0;
        const pRusak = total > 0 ? (rusak / total) * 100 : 0;
        const radius = 65;
        const circumference = 2 * Math.PI * radius;
        const viewBoxSize = 160;
        const center = viewBoxSize / 2;
        
        // Offsets
        const offsetLaik = circumference - (pLaik / 100) * circumference;
        const offsetRusak = circumference - (pRusak / 100) * circumference;
        
        return (
            <div className="relative flex items-center justify-center w-48 h-48">
                <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    
                    {total > 0 && (
                        <>
                            {/* Rusak Segment (Red) - Rotated to start after Laik */}
                            <motion.circle
                                cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offsetRusak }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-rose-500"
                                strokeLinecap="round"
                                style={{ rotate: `${(pLaik / 100) * 360}deg`, transformOrigin: 'center' }}
                            />
                            {/* Laik Segment (Emerald) */}
                            <motion.circle
                                cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offsetLaik }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-emerald-500"
                                strokeLinecap="round"
                            />
                        </>
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-white leading-none">{pLaik.toFixed(0)}%</span>
                    <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2 bg-white/5 px-2 py-0.5 rounded">Kelaikan</span>
                </div>
            </div>
        );
    };

    // SVG Donut Component for 3 segments (Log Status)
    const LogStatusDonut = ({ normal, perawatan, perbaikan }: { normal: number, perawatan: number, perbaikan: number }) => {
        const total = normal + perawatan + perbaikan;
        const radius = 65;
        const circumference = 2 * Math.PI * radius;
        const viewBoxSize = 160;
        const center = viewBoxSize / 2;

        const pNormal = total > 0 ? (normal / total) * 100 : 0;
        const pPerawatan = total > 0 ? (perawatan / total) * 100 : 0;
        const pPerbaikan = total > 0 ? (perbaikan / total) * 100 : 0;

        const offsetNormal = circumference - (pNormal / 100) * circumference;
        const offsetPerawatan = circumference - (pPerawatan / 100) * circumference;
        const offsetPerbaikan = circumference - (pPerbaikan / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center w-48 h-48">
                <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    
                    {total > 0 && (
                        <>
                            {/* Perbaikan Segment (Red) */}
                            <motion.circle
                                cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offsetPerbaikan }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-rose-500"
                                strokeLinecap="round"
                                style={{ rotate: `${((pNormal + pPerawatan) / 100) * 360}deg`, transformOrigin: 'center' }}
                            />
                            
                            {/* Perawatan Segment (Amber) */}
                            <motion.circle
                                cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offsetPerawatan }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-amber-500"
                                strokeLinecap="round"
                                style={{ rotate: `${(pNormal / 100) * 360}deg`, transformOrigin: 'center' }}
                            />

                            {/* Normal Segment (Emerald) */}
                            <motion.circle
                                cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offsetNormal }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-emerald-500"
                                strokeLinecap="round"
                            />
                        </>
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white leading-none">{total}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2 bg-white/5 px-2 py-0.5 rounded">Log Hari Ini</span>
                </div>
            </div>
        );
    };

    return (
        <motion.section variants={variants} className="space-y-12">
            {/* --- Section 1: Statistik Kondisi Peralatan --- */}
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <ClipboardCheck size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Status Kelaikan Aset</h2>
                        </div>
                    </div>
                    <button onClick={() => router.push('/peralatan')} className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group">
                        Buka Peralatan <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 @pc:grid-cols-4 gap-6">
                    <div className="@pc:col-span-1">
                        <motion.div 
                            whileHover={{ scale: 1.02 }} 
                            onClick={() => router.push('/peralatan')} 
                            className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl relative overflow-hidden group cursor-pointer h-full flex items-center justify-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-white/5 shrink-0">
                                <Database size={20} className="text-blue-400" />
                            </div>
                            
                            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-sm uppercase tracking-wide">
                                <span className="whitespace-nowrap opacity-70">Total Aset:</span>
                                <span>{stats.peralatanTotal} Unit</span>
                            </div>

                            {/* Subtle Glow */}
                            <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-blue-500/10 blur-xl rounded-full" />
                        </motion.div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex flex-col @tablet:flex-row items-center gap-8 @pc:col-span-3">
                        <div className="relative shrink-0">
                            <EquipmentDonut laik={stats.peralatanLaik} rusak={stats.peralatanRusak} />
                            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -z-10" />
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                                {/* Laik Operasi */}
                                <div className="group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-wide">Laik Operasi</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kondisi Normal</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-lg font-black text-white">{stats.peralatanLaik} <span className="text-[10px] text-slate-500">UNIT</span></div>
                                        <div className="inline-flex px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-black text-emerald-400 border border-emerald-500/20">{persenLaik}%</div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>

                                {/* Tidak Laik */}
                                <div className={`group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border overflow-hidden transition-all duration-300 ${stats.peralatanRusak > 0 ? "border-rose-500/30" : "border-white/5 hover:border-rose-500/20"}`}>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover/item:scale-110 ${stats.peralatanRusak > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800/50 border-white/5"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] ${stats.peralatanRusak > 0 ? "bg-rose-500 animate-pulse" : "bg-rose-500/40"}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-wide">Tidak Laik</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Perlu Atensi</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-lg font-black text-white">{stats.peralatanRusak} <span className="text-[10px] text-slate-500">UNIT</span></div>
                                        <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black border ${stats.peralatanRusak > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-white/5 text-slate-500 border-white/5"}`}>{persenRusak}%</div>
                                    </div>
                                    {stats.peralatanRusak > 0 && <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/5" />}
                                </div>
                            </div>
                            {stats.peralatanRusak > 0 && (
                                <button onClick={() => router.push('/peralatan')} className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                                    Lihat {stats.peralatanRusak} Aset Bermasalah <ArrowUpRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Divider Premium */}
            <div className="py-4 px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
            </div>

            {/* --- Section 2: Log Aktivitas Peralatan (Proporsi Donut) --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Aktivitas Log Peralatan</h2>
                        </div>
                    </div>
                    <button onClick={() => router.push('/log-peralatan')} className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group">
                        Buka Log Peralatan <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 @pc:grid-cols-4 gap-6">
                    {/* Scorecard: Total Log Hari Ini */}
                    <div className="@pc:col-span-1">
                        <motion.div 
                            whileHover={{ scale: 1.02 }} 
                            onClick={() => router.push('/log-peralatan')} 
                            className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl relative overflow-hidden group cursor-pointer h-full flex items-center justify-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-white/5 shrink-0">
                                <Activity size={20} className="text-indigo-400" />
                            </div>
                            
                            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-sm uppercase tracking-wide">
                                <span className="whitespace-nowrap opacity-70">Log Hari Ini:</span>
                                <span>{stats.logTotalHariIni} Log</span>
                            </div>

                            {/* Subtle Glow */}
                            <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-indigo-500/10 blur-xl rounded-full" />
                        </motion.div>
                    </div>

                    {/* Donut Chart: Proporsi Status Log */}
                    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex flex-col @tablet:flex-row items-center gap-8 @pc:col-span-3">
                        <div className="relative shrink-0">
                            <LogStatusDonut normal={stats.logNormalOps} perawatan={stats.logPerluPerawatan} perbaikan={stats.logPerluPerbaikan} />
                            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10" />
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                                {/* Normal Ops */}
                                <div className="group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-wide">Normal Ops</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aktivitas Normal</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-lg font-black text-white">{stats.logNormalOps} <span className="text-[10px] text-slate-500">INPUT</span></div>
                                        <div className="inline-flex px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-black text-emerald-400 border border-emerald-500/20">HARIAN</div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>

                                {/* Perawatan */}
                                <div className="group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5 overflow-hidden transition-all duration-300 hover:border-amber-500/30">
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/item:scale-110 transition-transform">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-wide">Perawatan</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pemeliharaan</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-lg font-black text-white">{stats.logPerluPerawatan} <span className="text-[10px] text-slate-500">INPUT</span></div>
                                        <div className="inline-flex px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-black text-amber-400 border border-amber-500/20">HARIAN</div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </div>

                                {/* Perbaikan */}
                                <div className={`group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border overflow-hidden transition-all duration-300 ${stats.logPerluPerbaikan > 0 ? "border-rose-500/30" : "border-white/5 hover:border-rose-500/20"}`}>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover/item:scale-110 ${stats.logPerluPerbaikan > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800/50 border-white/5"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] ${stats.logPerluPerbaikan > 0 ? "bg-rose-500 animate-pulse" : "bg-rose-500/40"}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-wide">Perbaikan</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tindak Lanjut</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-lg font-black text-white">{stats.logPerluPerbaikan} <span className="text-[10px] text-slate-500">INPUT</span></div>
                                        <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black border ${stats.logPerluPerbaikan > 0 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-white/5 text-slate-500 border-white/5"}`}>HARIAN</div>
                                    </div>
                                    {stats.logPerluPerbaikan > 0 && <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/5" />}
                                </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 italic text-center @pc:text-left mt-2 px-1">
                                * Data proporsi status berdasarkan seluruh log yang tercatat hari ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
