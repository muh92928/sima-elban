"use client";

import { useEffect, useState } from "react";
import { count } from "console";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Wrench, ArrowRight, Database } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total: 0,
        laik: 0,
        tidakLaik: 0,
        maintenance: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get User
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                // Get Stats
                const { data, error } = await supabase.from('peralatan').select('status_laik');
                if (error) throw error;

                if (data) {
                    const total = data.length;
                    const laik = data.filter(item => item.status_laik === 'LAIK OPERASI').length;
                    const tidakLaik = data.filter(item => item.status_laik === 'TIDAK LAIK OPERASI').length;
                    
                    setStats({ total, laik, tidakLaik, maintenance: 0 });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { 
            title: "Total Peralatan", 
            value: stats.total, 
            icon: Database, 
            color: "text-blue-400", 
            bg: "bg-blue-500/10", 
            border: "border-blue-500/20" 
        },
        { 
            title: "Laik Operasi", 
            value: stats.laik, 
            icon: CheckCircle, 
            color: "text-emerald-400", 
            bg: "bg-emerald-500/10", 
            border: "border-emerald-500/20" 
        },
        { 
            title: "Tidak Laik", 
            value: stats.tidakLaik, 
            icon: AlertTriangle, 
            color: "text-red-400", 
            bg: "bg-red-500/10", 
            border: "border-red-500/20" 
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
                    Selamat Datang, {user?.user_metadata?.full_name || "Petugas"}
                </h1>
                <p className="text-slate-400">Ringkasan status peralatan dan aktivitas terbaru.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                                <span className={`text-4xl font-bold text-white`}>{loading ? "-" : stat.value}</span>
                            </div>
                            <h3 className="text-slate-300 font-medium text-sm">{stat.title}</h3>
                        </div>
                        {/* Decorative Gradient */}
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 ${stat.bg.replace('/10', '/50')}`} />
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-sm shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Activity className="text-indigo-400" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Manajemen Peralatan</h3>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Akses database lengkap peralatan, kelola inventaris, update status kelaikan, dan cetak laporan bulanan.
                    </p>
                    <Link href="/dashboard/peralatan">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all group shadow-lg shadow-indigo-500/20">
                            Buka Data Peralatan
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-sm shadow-xl"
                >
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Wrench className="text-amber-400" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Log Aktivitas</h3>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                         Pantau riwayat perbaikan, jadwal maintenance rutin, dan catatan aktivitas teknis harian.
                    </p>
                    <Link href="/dashboard/log-peralatan">
                         <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all group hover:border-white/20">
                            Lihat Log Aktivitas
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
