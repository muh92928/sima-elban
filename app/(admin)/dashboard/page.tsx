
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Database, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import { CARD_STYLES } from "@/lib/cardStyles";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total: 0,
        laik: 0,
        tidakLaik: 0,
        maintenance: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Akun | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get User
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user?.email) {
                    const { data: akun } = await supabase.from('akun').select('*').eq('email', user.email).single();
                    if (akun) setProfile(akun);
                }

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

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
                <LoadingSpinner label="Memuat dashboard..." />
            </div>
        );
    }

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
            {/* Welcome Section / Profile Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${CARD_STYLES.CONTAINER} ${CARD_STYLES.HEADER}`}
            >
                {/* Glossy Overlay */}
                <div className={CARD_STYLES.GLASS_OVERLAY} />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white mb-2">
                        Selamat Datang, {profile?.nama || user?.user_metadata?.full_name || "Petugas"}
                    </h1>
                    <p className="text-slate-400">Sistem Informasi Manajemen Unit Elektronika Bandara (SIMA ELBAN)</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-5">
                         {/* Role Badge */}
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]">
                            {(profile?.peran || user?.user_metadata?.peran || "").replace(/_/g, " ")}
                         </div>
                         
                         {/* NIP Badge */}
                         {(profile?.nip || user?.user_metadata?.nip) && (
                             <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-400 text-xs font-mono">
                                NIP: {profile?.nip || user?.user_metadata?.nip}
                             </div>
                         )}
                    </div>
                </div>
                
                {/* Decorative Icon */}
                <div className="relative z-10 hidden md:block mr-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
                        <Activity className="text-white" size={40} />
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className={CARD_STYLES.STAT_CARD}
                    >
                         <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
                            <stat.icon size={100} className={stat.color} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-slate-900/50 border border-white/10 ${stat.color}`}>
                                    <stat.icon size={24} className="opacity-100" />
                                </div>
                                <span className={`text-4xl font-bold text-white`}>{loading ? "-" : stat.value}</span>
                            </div>
                            <h3 className="text-slate-400 font-medium">{stat.title}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {/* Quick Actions / Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Can add more cards here if needed */}
            </div>
        </div>
    );
}
