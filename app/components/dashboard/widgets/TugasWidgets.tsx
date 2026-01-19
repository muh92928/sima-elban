"use client";

import { motion } from "framer-motion";
import { ListTodo, Clock, CheckCircle, ArrowUpRight, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface TugasWidgetsProps {
    stats: {
        tugasKanitTotal: number;
        tugasKanitPending: number;
        tugasKanitProses: number;
        tugasKanitSelesai: number;
        tugasLogTotal: number;
        tugasLogPending: number;
        tugasLogProses: number;
        tugasLogSelesai: number;
    };
    variants: any;
}

export default function TugasWidgets({ stats, variants }: TugasWidgetsProps) {
    const router = useRouter();

    const sections = [
        {
            title: "Tugas Kanit Elban",
            icon: ListTodo,
            color: "indigo",
            items: [
                { label: "Total Tugas", value: stats.tugasKanitTotal, icon: ListTodo, color: "indigo", sub: "Penugasan" },
                { label: "Pending", value: stats.tugasKanitPending, icon: Clock, color: "amber", sub: "Menunggu" },
                { label: "Proses", value: stats.tugasKanitProses, icon: Clock, color: "blue", sub: "Dikerjakan" },
                { label: "Selesai", value: stats.tugasKanitSelesai, icon: CheckCircle, color: "emerald", sub: "Rampung" },
            ]
        },
        {
            title: "Tugas Log Peralatan",
            icon: Activity,
            color: "rose",
            items: [
                { label: "Total Tugas", value: stats.tugasLogTotal, icon: Activity, color: "rose", sub: "Tindak Lanjut" },
                { label: "Pending", value: stats.tugasLogPending, icon: Clock, color: "amber", sub: "Menunggu" },
                { label: "Proses", value: stats.tugasLogProses, icon: Clock, color: "blue", sub: "Dikerjakan" },
                { label: "Selesai", value: stats.tugasLogSelesai, icon: CheckCircle, color: "emerald", sub: "Rampung" },
            ]
        }
    ];

    const getColorClass = (color: string, type: 'bg' | 'text' | 'border' | 'ring') => {
        const map: any = {
            indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'group-hover:border-indigo-500/50', ring: 'shadow-indigo-500/20' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'group-hover:border-amber-500/50', ring: 'shadow-amber-500/20' },
            emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/50', ring: 'shadow-emerald-500/20' },
            rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'group-hover:border-rose-500/50', ring: 'shadow-rose-500/20' },
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/50', ring: 'shadow-blue-500/20' },
        };
        return map[color][type];
    };

    return (
        <motion.section variants={variants} className="space-y-10">
            {sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getColorClass(section.color, 'bg')} ${getColorClass(section.color, 'text')} border ${getColorClass(section.color, 'border')}`}>
                                <section.icon size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{section.title}</h2>
                        </div>
                        <button 
                            onClick={() => router.push('/tugas')}
                            className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group"
                        >
                            Buka Tugas <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 @tablet:grid-cols-2 @pc:grid-cols-4 gap-4">
                        {section.items.map((item, idx) => (
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
                </div>
            ))}
        </motion.section>
    );
}
