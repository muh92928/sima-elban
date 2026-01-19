"use client";

import { motion } from "framer-motion";
import { Users, User, ArrowUpRight, MapPin, Briefcase, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface PersonelWidgetsProps {
    stats: {
        personelTotal: number;
        personelList?: any[];
    };
    variants: any;
}

export default function PersonelWidgets({ stats, variants }: PersonelWidgetsProps) {
    const router = useRouter();
    const personel = stats.personelList || [];

    return (
        <motion.section variants={variants} className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Data Personel</h2>
                    </div>
                </div>
                <button 
                    onClick={() => router.push('/personel')}
                    className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group"
                >
                    Lihat Semua <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {personel.length > 0 ? (
                    personel.map((p, idx) => (
                        <motion.div 
                            key={p.id}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 flex flex-col @tablet:flex-row @tablet:items-center gap-6"
                        >
                            <div className="flex items-center gap-4 min-w-[300px]">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                                    <User size={28} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                                        {p.nama}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full w-fit mt-1">
                                        NIP: {p.nip || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 @tablet:grid-cols-2 gap-4 border-t @tablet:border-t-0 @tablet:border-l border-white/5 pt-4 @tablet:pt-0 @tablet:pl-6">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="p-2 rounded-lg bg-white/5 text-slate-400">
                                        <Briefcase size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Jabatan</p>
                                        <p className="font-medium">{p.jabatan || 'Personel'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="p-2 rounded-lg bg-white/5 text-slate-500">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Tempat, Tgl Lahir</p>
                                        <p className="font-medium text-slate-300">
                                            {p.tempatLahir ? `${p.tempatLahir}, ` : ''}
                                            {p.tanggalLahir ? new Date(p.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background glow */}
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Users className="mx-auto text-slate-600 mb-3 opacity-20" size={48} />
                        <p className="text-slate-500 font-medium">Belum ada data personel terdaftar</p>
                    </div>
                )}
            </div>
        </motion.section>
    );
}
