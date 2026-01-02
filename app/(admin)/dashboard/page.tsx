"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    Activity, 
    AlertTriangle, 
    CheckCircle, 
    Database, 
    ListTodo, 
    CalendarDays, 
    FolderOpen, 
    UserCheck, 
    MessageSquareWarning,
    ClipboardList,
    Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import { CARD_STYLES } from "@/lib/cardStyles";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { getDashboardStats } from "./actions";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        // Peralatan
        peralatanTotal: 0,
        peralatanLaik: 0,
        peralatanRusak: 0,
        
        // Tugas
        tugasTotal: 0,
        tugasPending: 0,
        tugasSelesai: 0,

        // Pengaduan
        pengaduanBaru: 0,
        pengaduanDiproses: 0,

        // Lainnya
        jadwalDinas: 0,
        logTotal: 0,
        filesTotal: 0,
        akunPending: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Akun | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get User (Auth still client side for now context)
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user?.email) {
                    const { data: akun } = await supabase.from('akun').select('*').eq('email', user.email).single();
                    if (akun) setProfile(akun);
                }

                // Call Server Action
                const data = await getDashboardStats();
                
                if (data) {
                    setStats(data);
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

    // Calculate percentages
    const persenLaik = stats.peralatanTotal > 0 ? Math.round((stats.peralatanLaik / stats.peralatanTotal) * 100) : 0;
    const persenRusak = stats.peralatanTotal > 0 ? (100 - persenLaik) : 0;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="space-y-10 pb-20 relative"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Ambient Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        x: [0, 50, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" 
                />
            </div>

            {/* Welcome Section - RESTORED ORIGINAL */}
            <motion.div 
                variants={itemVariants}
                className={`${CARD_STYLES.CONTAINER} ${CARD_STYLES.HEADER}`}
            >
                <div className={CARD_STYLES.GLASS_OVERLAY} />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white mb-2">
                        Selamat Datang, {profile?.nama || user?.user_metadata?.full_name || "Petugas"}
                    </h1>
                    <p className="text-slate-400">Sistem Informasi Manajemen Unit Elektronika Bandara (SIMA ELBAN)</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-5">
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]">
                            {(profile?.peran || user?.user_metadata?.peran || "").replace(/_/g, " ")}
                         </div>
                         {(profile?.nip || user?.user_metadata?.nip) && (
                             <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-400 text-xs font-mono">
                                NIP: {profile?.nip || user?.user_metadata?.nip}
                             </div>
                         )}
                    </div>
                </div>
                
                <div className="relative z-10 hidden md:block mr-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
                        <Activity className="text-white" size={40} />
                    </div>
                </div>
            </motion.div>

            {/* WIDGETS AREA - STANDARDIZED LAYOUT */}
            <div className="space-y-10">
                
                {/* 1. PERALATAN */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-4 pl-1 border-l-4 border-blue-500">
                        <h2 className="text-xl font-bold text-slate-200 tracking-wide">Halaman Peralatan</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Total Aset */}
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => router.push('/peralatan')}
                            className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Database size={100} className="text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-blue-500/20 w-fit rounded-xl text-blue-400 mb-4">
                                    <Database size={24} />
                                </div>
                                <div className="text-5xl font-black text-white mb-1">{stats.peralatanTotal}</div>
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Aset</div>
                                <div className="mt-4 h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500 w-full" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Laik Operasi */}
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => router.push('/peralatan')}
                            className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle size={100} className="text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-emerald-500/20 w-fit rounded-xl text-emerald-400 mb-4">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="text-5xl font-black text-white mb-1">{stats.peralatanLaik}</div>
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Laik Operasi</div>
                                <div className="mt-4 h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${persenLaik}%` }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-emerald-500" 
                                     />
                                </div>
                            </div>
                        </motion.div>

                        {/* Tidak Laik */}
                        <motion.div 
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => router.push('/peralatan')}
                            className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle size={100} className="text-rose-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="p-3 bg-rose-500/20 w-fit rounded-xl text-rose-400 mb-4">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="text-5xl font-black text-white mb-1">{stats.peralatanRusak}</div>
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Tidak Laik</div>
                                <div className="mt-4 h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${persenRusak}%` }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-rose-500" 
                                     />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* 2. TUGAS */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center gap-3 mb-4 pl-1 border-l-4 border-indigo-500">
                        <h2 className="text-xl font-bold text-slate-200 tracking-wide">Halaman Tugas</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[
                             { label: "Total Tugas", value: stats.tugasTotal, icon: ListTodo, color: "text-indigo-400", bg: "bg-indigo-500/20", progress: "bg-indigo-500" },
                             { label: "Menunggu / Proses", value: stats.tugasPending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", progress: "bg-amber-500" },
                             { label: "Selesai", value: stats.tugasSelesai, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20", progress: "bg-emerald-500" },
                         ].map((item, idx) => (
                             <motion.div 
                                 key={idx}
                                 whileHover={{ y: -5, scale: 1.02 }}
                                 onClick={() => router.push('/tugas')}
                                 className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                             >
                                 <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
                                    <item.icon size={100} />
                                 </div>
                                 <div className="relative z-10">
                                     <div className={`p-3 w-fit rounded-xl mb-4 ${item.bg} ${item.color}`}>
                                         <item.icon size={24} />
                                     </div>
                                     <div className="text-5xl font-black text-white mb-1">{item.value}</div>
                                     <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">{item.label}</div>
                                     <div className="mt-4 h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                        <div className={`h-full w-full ${item.progress}`} />
                                     </div>
                                 </div>
                             </motion.div>
                         ))}
                    </div>
                </motion.section>

                {/* 3. PENGADUAN & LAINNYA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pengaduan Column (Span 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 mb-4 pl-1 border-l-4 border-pink-500">
                            <h2 className="text-xl font-bold text-slate-200 tracking-wide">Halaman Pengaduan</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <motion.div 
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => router.push('/pengaduan')}
                                className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                             >
                                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquareWarning size={100} className="text-pink-500" />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="p-3 bg-pink-500/20 w-fit rounded-xl text-pink-400 mb-4">
                                         <MessageSquareWarning size={24} />
                                     </div>
                                     <div className="text-5xl font-black text-white mb-1">{stats.pengaduanBaru}</div>
                                     <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Pengaduan Baru</div>
                                     {stats.pengaduanBaru > 0 && (
                                         <div className="mt-4 flex items-center gap-2 text-xs font-bold text-pink-400 animate-pulse">
                                             <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                             Perlu Respon
                                         </div>
                                     )}
                                 </div>
                             </motion.div>

                             <motion.div 
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => router.push('/pengaduan')}
                                className="bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg"
                             >
                                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity size={100} className="text-purple-500" />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="p-3 bg-purple-500/20 w-fit rounded-xl text-purple-400 mb-4">
                                         <Activity size={24} />
                                     </div>
                                     <div className="text-5xl font-black text-white mb-1">{stats.pengaduanDiproses}</div>
                                     <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Sedang Diproses</div>
                                 </div>
                             </motion.div>
                        </div>
                    </div>

                    {/* Lainnya Column (Span 1) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4 pl-1 border-l-4 border-teal-500">
                            <h2 className="text-xl font-bold text-slate-200 tracking-wide">Ringkasan</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: "Jadwal Dinas", value: stats.jadwalDinas, icon: CalendarDays, color: "text-teal-400", bg: "bg-teal-500/10", route: '/jadwal' },
                                { label: "Log Peralatan", value: stats.logTotal, icon: ClipboardList, color: "text-slate-400", bg: "bg-slate-500/10", route: '/log-peralatan' },
                                { label: "Total File", value: stats.filesTotal, icon: FolderOpen, color: "text-cyan-400", bg: "bg-cyan-500/10", route: '/files' }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ x: 5 }}
                                    onClick={() => router.push(item.route)}
                                    className="bg-slate-800/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-slate-300 font-bold text-sm">{item.label}</span>
                                    </div>
                                    <span className={`text-xl font-black ${item.color.replace('400', '200')}`}>{item.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. KONFIRMASI AKUN ALERT */}
                {stats.akunPending > 0 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => router.push('/konfirmasi-akun')}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-[2rem] p-6 shadow-xl shadow-orange-900/20 relative overflow-hidden cursor-pointer flex items-center justify-between"
                     >
                         <div className="flex items-center gap-6 relative z-10">
                             <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                                 <UserCheck size={32} className="text-white" />
                             </div>
                             <div>
                                 <div className="text-white text-xl font-bold">Persetujuan Akun Diperlukan</div>
                                 <div className="text-orange-100 text-sm">Ada <span className="font-black bg-white/20 px-2 py-0.5 rounded text-white">{stats.akunPending}</span> pengguna baru menunggu konfirmasi.</div>
                             </div>
                         </div>
                         <div className="hidden md:block">
                             <button className="btn bg-white text-orange-600 hover:bg-orange-50 border-none font-bold shadow-lg">Lihat Detail</button>
                         </div>
                     </motion.div>
                )}
            </div>
        </motion.div>
    );
}
