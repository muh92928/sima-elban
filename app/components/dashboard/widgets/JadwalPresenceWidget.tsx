"use client";

import { motion } from "framer-motion";
import { CalendarDays, ArrowUpRight, CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface JadwalPresenceWidgetProps {
    jadwalList: any[];
    namaUser: string;
    variants: any;
}

export default function JadwalPresenceWidget({ jadwalList, namaUser, variants }: JadwalPresenceWidgetProps) {
    const router = useRouter();

    const presenceDays = useMemo(() => {
        // 1. Generate next 7 days starting from today
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }

        // 2. Map schedule to these days for the specific user
        return days.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            
            // Find schedule for this day
            // Pattern in nama_kegiatan is "Status - Name"
            const userSchedule = jadwalList.find(j => {
                const jDate = new Date(j.tanggal).toISOString().split('T')[0];
                if (jDate !== dateStr) return false;
                
                const match = j.namaKegiatan.match(/^(.+)\s-\s(.+)$/i);
                if (match) {
                    const name = match[2].trim().toLowerCase();
                    return name === namaUser.toLowerCase();
                }
                return false;
            });

            let status = "Libur / Tidak Ada Data";
            let type = "unknown";
            let code = "L";

            if (userSchedule) {
                const match = userSchedule.namaKegiatan.match(/^(.+)\s-\s(.+)$/i);
                if (match) {
                    status = match[1].trim();
                }
                
                const sLower = status.toLowerCase();
                if (sLower.includes('pagi') || sLower.includes('elban')) {
                    type = "work";
                    code = sLower.includes('pagi') ? "P" : "PS";
                } else if (sLower.includes('luar') || sLower.includes('belajar')) {
                    type = "duty";
                    code = sLower.includes('luar') ? "DL" : "TB";
                } else if (sLower.includes('izin') || sLower.includes('cuti') || sLower.includes('sakit')) {
                    type = "leave";
                    code = sLower.includes('izin') ? "I" : (sLower.includes('cuti') ? "C" : "S");
                } else if (sLower.includes('standby')) {
                    type = "standby";
                    code = "ST";
                } else if (sLower.includes('libur')) {
                    type = "off";
                    code = "L";
                }
            }

            return {
                date: day,
                dateLabel: day.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
                isToday: idx === 0,
                status,
                type,
                code
            };
        });
    }, [jadwalList, namaUser]);

    const getStatusStyles = (type: string) => {
        switch (type) {
            case 'work': return "bg-sky-500/10 text-sky-400 border-sky-500/20";
            case 'duty': return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case 'leave': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case 'standby': return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            case 'off': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-white/5";
        }
    };

    return (
        <motion.section variants={variants} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/10">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Jadwal Dinas 7 Hari kedepan</h2>
                    </div>
                </div>
                <button 
                    onClick={() => router.push('/jadwal')}
                    className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group"
                >
                    Lihat Matriks <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-2 @tablet:grid-cols-4 @pc:grid-cols-7 gap-3">
                {presenceDays.map((day, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        className={`
                            relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 text-center
                            ${day.isToday ? 'bg-white/10 ring-2 ring-teal-500/50 border-teal-500/30' : 'bg-slate-900/40 border-white/5'}
                        `}
                    >
                        {day.isToday && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-500 text-[9px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Hari Ini
                            </span>
                        )}
                        
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {day.dateLabel}
                        </div>

                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border
                            ${getStatusStyles(day.type)}
                        `}>
                            {day.code}
                        </div>

                        <div className="space-y-0.5">
                            <div className="text-[10px] font-medium text-slate-300 leading-tight">
                                {day.status}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
