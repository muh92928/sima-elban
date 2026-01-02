"use client";

import { motion } from "framer-motion";
import { MessageSquareWarning, ArrowUpRight, CalendarDays, ClipboardList, FolderOpen, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface PengaduanWidgetsProps {
    stats: {
        pengaduanBaru: number;
        pengaduanDiproses: number;
        jadwalDinas: number;
        logTotal: number;
        filesTotal: number;
    };
    variants: any;
}

export default function PengaduanWidgets({ stats, variants }: PengaduanWidgetsProps) {
    const router = useRouter();

    const quickLinks = [
        { label: "Jadwal Dinas", value: stats.jadwalDinas, icon: CalendarDays, route: '/jadwal', color: 'text-teal-400', bg: 'bg-teal-500/10' },
        { label: "Log Harian", value: stats.logTotal, icon: ClipboardList, route: '/log-peralatan', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: "Arsip File", value: stats.filesTotal, icon: FolderOpen, route: '/files', color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
    ];

    return (
        <motion.section variants={variants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Pengaduan Stats */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Laporan Pengaduan</h2>
                        <p className="text-sm text-slate-400">Status keluhan dari unit lain</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     {/* Card Pengaduan Baru */}
                    <div 
                        onClick={() => router.push('/pengaduan')}
                        className="bg-slate-900/60 border border-pink-500/20 p-5 rounded-2xl cursor-pointer hover:bg-pink-500/5 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                                <MessageSquareWarning size={20} />
                            </div>
                            {stats.pengaduanBaru > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                            )}
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.pengaduanBaru}</div>
                        <div className="text-sm text-slate-400">Laporan Baru</div>
                    </div>

                    {/* Card Diproses */}
                    <div 
                         onClick={() => router.push('/pengaduan')}
                         className="bg-slate-900/60 border border-purple-500/20 p-5 rounded-2xl cursor-pointer hover:bg-purple-500/5 transition-all"
                    >
                         <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.pengaduanDiproses}</div>
                        <div className="text-sm text-slate-400">Sedang Diproses</div>
                    </div>
                </div>
            </div>

            {/* Right: Quick Access Menu */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Akses Cepat</h2>
                        <p className="text-sm text-slate-400">Menu operasional harian</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {quickLinks.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => router.push(item.route)}
                            className="bg-slate-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-200 text-sm">{item.label}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-white text-lg">{item.value}</span>
                                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </motion.section>
    );
}
