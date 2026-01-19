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
                        <motion.div whileHover={{ y: -2 }} onClick={() => router.push('/peralatan')} className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl relative overflow-hidden group cursor-pointer h-full flex flex-col justify-center min-h-[160px]">
                            <div className="flex flex-col items-start gap-3 relative z-10 font-bold">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400"><Database size={24} /></div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Aset</div>
                                    <div className="text-5xl font-black text-white tracking-tight">{stats.peralatanTotal} <span className="text-lg font-medium text-slate-500">Unit</span></div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={100} /></div>
                        </motion.div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex flex-col @tablet:flex-row items-center gap-8 @pc:col-span-3">
                        <div className="relative shrink-0">
                            <EquipmentDonut laik={stats.peralatanLaik} rusak={stats.peralatanRusak} />
                            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -z-10" />
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 @tablet:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-sm font-bold text-slate-200">Laik Operasi</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-white">{stats.peralatanLaik} Unit</div>
                                        <div className="text-[10px] font-bold text-emerald-400">{persenLaik}%</div>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${stats.peralatanRusak > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/5"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                        <span className="text-sm font-bold text-slate-200">Tidak Laik</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-white">{stats.peralatanRusak} Unit</div>
                                        <div className="text-[10px] font-bold text-rose-400">{persenRusak}%</div>
                                    </div>
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
                        <motion.div whileHover={{ y: -2 }} onClick={() => router.push('/log-peralatan')} className="bg-slate-900/60 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group cursor-pointer h-full flex flex-col justify-center min-h-[160px]">
                            <div className="flex flex-col items-start gap-3 relative z-10 font-bold">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400"><Activity size={24} /></div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Log Hari Ini</div>
                                    <div className="text-5xl font-black text-white tracking-tight">{stats.logTotalHariIni} <span className="text-lg font-medium text-slate-500">Aktivitas</span></div>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={100} /></div>
                        </motion.div>
                    </div>

                    {/* Donut Chart: Proporsi Status Log */}
                    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-3xl flex flex-col @tablet:flex-row items-center gap-8 @pc:col-span-3">
                        <div className="relative shrink-0">
                            <LogStatusDonut normal={stats.logNormalOps} perawatan={stats.logPerluPerawatan} perbaikan={stats.logPerluPerbaikan} />
                            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10" />
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 @tablet:grid-cols-3 gap-3">
                                {/* Normal Ops */}
                                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Normal Ops</span>
                                    </div>
                                    <div className="text-xl font-black text-emerald-400">{stats.logNormalOps}</div>
                                </div>
                                {/* Perawatan */}
                                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Perawatan</span>
                                    </div>
                                    <div className="text-xl font-black text-amber-400">{stats.logPerluPerawatan}</div>
                                </div>
                                {/* Perbaikan */}
                                <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Perbaikan</span>
                                    </div>
                                    <div className="text-xl font-black text-rose-400">{stats.logPerluPerbaikan}</div>
                                </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 italic text-center @tablet:text-left mt-2 px-1">
                                * Data proporsi status berdasarkan seluruh log yang tercatat hari ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
