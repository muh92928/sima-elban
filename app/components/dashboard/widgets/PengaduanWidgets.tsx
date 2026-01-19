"use client";

import { motion } from "framer-motion";
import { MessageSquareWarning, ArrowUpRight, CalendarDays, FolderOpen, Activity, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PengaduanWidgetsProps {
    stats: {
        pengaduanBaru: number;
        pengaduanDiproses: number;
        pengaduanSelesai: number;
        jadwalDinas: number;
        filesTotal: number;
        filesByCategory: Record<string, number>;
        pengaduanList: any[];
    };
    variants: any;
}

export default function PengaduanWidgets({ stats, variants }: PengaduanWidgetsProps) {
    const router = useRouter();

    const requestedOrder = ["Dokumentasi", "Laporan", "Regulasi", "SOP", "File Pendukung Lainnya"];
    const fileCategories = requestedOrder.map(cat => [cat, stats.filesByCategory[cat] || 0]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Baru': return "bg-pink-500/10 text-pink-400 border-pink-500/20";
            case 'Diproses': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case 'Selesai': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-white/5";
        }
    };

    return (
        <motion.section variants={variants} className="flex flex-col gap-8">
            
            {/* Top: Pengaduan Stats */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-lg shadow-pink-500/10">
                            <MessageSquareWarning size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Laporan Pengaduan</h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/pengaduan')}
                        className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group"
                    >
                        Buka Pengaduan <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>

                {/* Latest Reports List - Card Based */}
                <div className="space-y-3">
                    {stats.pengaduanList.length > 0 ? (
                        stats.pengaduanList.map((item) => (
                            <motion.div 
                                key={item.id} 
                                whileHover={{ x: 4 }}
                                onClick={() => router.push('/pengaduan')}
                                className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4 cursor-pointer hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <MessageSquareWarning size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-bold text-white uppercase truncate group-hover:text-pink-400 transition-colors mb-1">
                                            {item.pengadu || "User"}
                                        </div>
                                        <div className="flex items-baseline gap-1.5 truncate mb-1.5 @tablet:mb-0">
                                            <span className="text-[10px] text-slate-500 font-medium">Melaporkan</span>
                                            <span className="text-[10px] text-pink-400/90 font-black uppercase tracking-tight">{item.peralatan || "Umum"}</span>
                                        </div>
                                        {/* Date for HP (<= 430px) */}
                                        <div className="flex @tablet:hidden items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            <span className="mx-1">•</span>
                                            {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0 self-center @tablet:self-auto">
                                    {/* Date for Tablet & PC (> 430px) */}
                                    <div className="hidden @tablet:block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        <span className="mx-1 text-slate-700">•</span>
                                        {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-slate-500 text-sm">Belum ada laporan pengaduan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Files by Category */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                            <FolderOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Arsip File per Kategori</h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/files')}
                        className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group"
                    >
                        Buka Semua File <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 @tablet:grid-cols-2 @pc:grid-cols-5 gap-4">
                    {fileCategories.length > 0 ? (
                        fileCategories.map(([category, count]) => (
                            <motion.div 
                                key={category}
                                whileHover={{ y: -4 }}
                                onClick={() => router.push(`/files?category=${category}`)}
                                className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group"
                            >
                                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                    <FolderOpen size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-2xl font-black text-white leading-none mb-1">{count}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{category}</div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-slate-500 text-sm">Belum ada file terarsip</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.section>
    );
}
