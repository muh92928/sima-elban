"use client";

import { motion } from "framer-motion";
import { Users, User, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PersonelWidgetsProps {
    stats: {
        personelTotal: number;
    };
    variants: any;
}

export default function PersonelWidgets({ stats, variants }: PersonelWidgetsProps) {
    const router = useRouter();

    return (
        <motion.section variants={variants} className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Data Personel</h2>
                    <p className="text-sm text-slate-400">Total pegawai dan teknisi terdaftar</p>
                </div>
                <button 
                    onClick={() => router.push('/personel')}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    Lihat Data <ArrowUpRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                    whileHover={{ y: -2 }}
                    onClick={() => router.push('/personel')}
                    className={`
                        bg-slate-900/60 backdrop-blur-sm border border-white/5 p-5 rounded-2xl 
                        relative overflow-hidden group cursor-pointer transition-all duration-300
                        hover:border-blue-500/50 flex items-center gap-5
                    `}
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>

                    <div>
                        <div className="text-3xl font-bold text-white tracking-tight">{stats.personelTotal}</div>
                        <div className="text-sm font-medium text-slate-300">Total Personel</div>
                        <div className="text-xs text-slate-500">Pegawai & Teknisi</div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}
