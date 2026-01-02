"use client";

import { motion } from "framer-motion";
import { Database, CheckCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PeralatanWidgetsProps {
    stats: {
        peralatanTotal: number;
        peralatanLaik: number;
        peralatanRusak: number;
        logTotal: number;
    };
    variants: any;
}

export default function PeralatanWidgets({ stats, variants }: PeralatanWidgetsProps) {
    const router = useRouter();

    // Calculate percentages
    const persenLaik = stats.peralatanTotal > 0 ? Math.round((stats.peralatanLaik / stats.peralatanTotal) * 100) : 0;
    const persenRusak = stats.peralatanTotal > 0 ? (100 - persenLaik) : 0;

    const cards = [
        {
            label: "Total Aset",
            value: stats.peralatanTotal,
            icon: Database,
            color: "blue",
            sub: "Seluruh Unit Terdaftar",
            percent: 100
        },
        {
            label: "Laik Operasi",
            value: stats.peralatanLaik,
            icon: CheckCircle,
            color: "emerald",
            sub: "Kondisi Baik",
            percent: persenLaik
        },
        {
            label: "Tidak Laik",
            value: stats.peralatanRusak,
            icon: AlertTriangle,
            color: "rose",
            sub: "Perlu Perbaikan",
            percent: persenRusak
        }
    ];

    const getColorClass = (color: string, type: 'bg' | 'text' | 'border' | 'bar') => {
        const map: any = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/50', bar: 'bg-blue-500' },
            emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/50', bar: 'bg-emerald-500' },
            rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'group-hover:border-rose-500/50', bar: 'bg-rose-500' },
        };
        return map[color][type];
    };

    return (
        <motion.section variants={variants} className="space-y-8">
            {/* Top: Stats Cards */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Statistik Peralatan</h2>
                        <p className="text-sm text-slate-400">Ringkasan kondisi aset unit elektronika</p>
                    </div>
                    <button 
                        onClick={() => router.push('/peralatan')}
                        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        Lihat Data <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cards.map((item, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -2 }}
                            onClick={() => router.push('/peralatan')}
                            className={`
                                bg-slate-900/60 backdrop-blur-sm border border-white/5 p-5 rounded-2xl 
                                relative overflow-hidden group cursor-pointer transition-all duration-300
                                ${getColorClass(item.color, 'border')}
                            `}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl ${getColorClass(item.color, 'bg')} ${getColorClass(item.color, 'text')}`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                                    {item.percent}%
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <div className="text-3xl font-bold text-white mb-1 tracking-tight">{item.value}</div>
                                <div className="text-sm font-medium text-slate-300">{item.label}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.percent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${getColorClass(item.color, 'bar')}`} 
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom: Log Summary */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Log Aktivitas</h2>
                        <p className="text-sm text-slate-400">Pencatatan harian</p>
                    </div>
                </div>

                <motion.div 
                    whileHover={{ y: -2 }}
                    onClick={() => router.push('/log-peralatan')}
                    className="
                        bg-slate-900/60 backdrop-blur-sm border border-indigo-500/20 p-5 rounded-2xl 
                        relative overflow-hidden group cursor-pointer transition-all duration-300
                        hover:bg-indigo-500/5 flex items-center justify-between px-8 py-6
                    "
                >
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
                             <Database size={32} />
                        </div>
                        <div>
                             <div className="text-4xl font-black text-white mb-1">{stats.logTotal}</div>
                             <div className="text-sm font-bold text-slate-300">Total Log Tercatat</div>
                             <div className="text-xs text-slate-500">Seluruh riwayat pemeliharaan</div>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2 text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Buka Log <ArrowUpRight size={16} />
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}
