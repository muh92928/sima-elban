"use client";

import { motion } from "framer-motion";
import { ListTodo, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TugasWidgetsProps {
    stats: {
        tugasTotal: number;
        tugasPending: number;
        tugasSelesai: number;
    };
    variants: any;
}

export default function TugasWidgets({ stats, variants }: TugasWidgetsProps) {
    const router = useRouter();

    const statsList = [
        { label: "Sedang Proses", value: stats.tugasPending, icon: Clock, color: "amber", sub: "Perlu Tindakan" },
        { label: "Selesai", value: stats.tugasSelesai, icon: CheckCircle, color: "emerald", sub: "Tugas Rampung" },
    ];

    const getColorClass = (color: string, type: 'bg' | 'text' | 'border' | 'ring') => {
        const map: any = {
            indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'group-hover:border-indigo-500/50', ring: 'shadow-indigo-500/20' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'group-hover:border-amber-500/50', ring: 'shadow-amber-500/20' },
            emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/50', ring: 'shadow-emerald-500/20' },
        };
        return map[color][type];
    };

    return (
        <motion.section variants={variants} className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Monitoring Tugas</h2>
                    <p className="text-sm text-slate-400">Pemantauan tiket perbaikan dan perawatan</p>
                </div>
                <button 
                    onClick={() => router.push('/tugas')}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    Lihat Data <ArrowUpRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsList.map((item, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -2 }}
                            onClick={() => router.push('/tugas')}
                            className={`
                                bg-slate-900/60 backdrop-blur-sm border border-white/5 p-5 rounded-2xl 
                                relative overflow-hidden group cursor-pointer transition-all duration-300 flex items-center gap-5
                                ${getColorClass(item.color, 'border')}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                                ${getColorClass(item.color, 'bg')} ${getColorClass(item.color, 'text')}
                            `}>
                                <item.icon size={24} />
                            </div>

                            <div>
                                <div className="text-3xl font-bold text-white tracking-tight">{item.value}</div>
                                <div className="text-sm font-medium text-slate-300">{item.label}</div>
                                <div className="text-xs text-slate-500">{item.sub}</div>
                            </div>

                            {/* Decorative glow */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none bg-current ${getColorClass(item.color, 'text')}`} />
                        </motion.div>
                    ))}
            </div>
        </motion.section>
    );
}
