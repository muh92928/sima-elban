"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Akun } from "@/lib/types";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { getDashboardStats } from "./actions";

// Widgets
import WelcomeSection from "@/app/components/dashboard/widgets/WelcomeSection";
import PeralatanWidgets from "@/app/components/dashboard/widgets/PeralatanWidgets";
import TugasWidgets from "@/app/components/dashboard/widgets/TugasWidgets";
import PengaduanWidgets from "@/app/components/dashboard/widgets/PengaduanWidgets";
import AkunAlert from "@/app/components/dashboard/widgets/AkunAlert";
import PersonelWidgets from "@/app/components/dashboard/widgets/PersonelWidgets";
import JadwalPresenceWidget from "@/app/components/dashboard/widgets/JadwalPresenceWidget";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        peralatanTotal: 0,
        peralatanLaik: 0,
        peralatanRusak: 0,
        tugasTotal: 0,
        tugasPending: 0,
        tugasSelesai: 0,
        tugasKanitTotal: 0,
        tugasKanitPending: 0,
        tugasKanitProses: 0,
        tugasKanitSelesai: 0,
        tugasLogTotal: 0,
        tugasLogPending: 0,
        tugasLogProses: 0,
        tugasLogSelesai: 0,
        pengaduanBaru: 0,
        pengaduanDiproses: 0,
        pengaduanSelesai: 0,
        jadwalDinas: 0,
        logTotalHariIni: 0,
        logNormalOps: 0,
        logPerluPerbaikan: 0,
        logPerluPerawatan: 0,
        filesTotal: 0,
        filesByCategory: {} as Record<string, number>,
        akunPending: 0,
        personelTotal: 0,
        personelList: [] as any[],
        jadwalList: [] as any[],
        pengaduanList: [] as any[]
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Akun | null>(null);
    const [activeTab, setActiveTab] = useState("aset_log");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user?.email) {
                    const { data: akun } = await supabase.from('akun').select('*').eq('email', user.email).single();
                    if (akun) setProfile(akun);
                }

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                // staggerChildren: 0.1 // Removed as per instruction
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const tabContentVariants: any = {
        hidden: { opacity: 0, x: -10, scale: 0.98, filter: "blur(10px)" },
        show: { 
            opacity: 1, 
            x: 0, 
            scale: 1, 
            filter: "blur(0px)",
            transition: { 
                type: "spring",
                bounce: 0,
                duration: 0.4,
                staggerChildren: 0.1 
            } 
        },
        exit: { 
            opacity: 0, 
            x: 10, 
            scale: 0.98, 
            filter: "blur(10px)",
            transition: { 
                duration: 0.2, 
                ease: "easeIn" 
            } 
        }
    };

    const tabs = [
        { id: "aset_log", label: "Aset & Log", icon: "Database" },
        { id: "tugas_personel", label: "Tugas & Personel", icon: "Users" },
        { id: "operasional", label: "Pengaduan, Jadwal & Files", icon: "Activity" }
    ];



    return (
        <motion.div 
            className="space-y-8 pb-20 relative"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >

            {/* Ambient Background */}
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

            <WelcomeSection user={user} profile={profile} variants={itemVariants} />
            
            <AkunAlert count={stats.akunPending} />

            {/* Premium Tab Navigation */}
            <div className="flex justify-center px-2">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-1 rounded-full flex flex-wrap items-center justify-center gap-1 w-full @tablet:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-2 @tablet:px-8 py-2.5 rounded-full flex items-center justify-center gap-2 text-[10px] @tablet:text-sm font-bold tracking-wide transition-all duration-300 flex-1 @tablet:flex-none
                                ${activeTab === tab.id 
                                    ? "text-white" 
                                    : "text-slate-400 hover:text-slate-200"
                                }
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-lg shadow-indigo-600/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                               {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "aset_log" && (
                        <motion.div 
                            key="aset_log"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                        >
                            <PeralatanWidgets 
                                stats={{
                                    peralatanTotal: stats.peralatanTotal,
                                    peralatanLaik: stats.peralatanLaik,
                                    peralatanRusak: stats.peralatanRusak,
                                    logTotalHariIni: stats.logTotalHariIni,
                                    logNormalOps: stats.logNormalOps,
                                    logPerluPerbaikan: stats.logPerluPerbaikan,
                                    logPerluPerawatan: stats.logPerluPerawatan
                                }} 
                                variants={itemVariants} 
                            />
                        </motion.div>
                    )}

                    {activeTab === "tugas_personel" && (
                        <motion.div 
                            key="tugas_personel"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="space-y-6"
                        >
                            <TugasWidgets stats={stats} variants={itemVariants} />
                            <PersonelWidgets stats={stats} variants={itemVariants} />
                        </motion.div>
                    )}

                    {activeTab === "operasional" && (
                        <motion.div 
                            key="operasional"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                        >
                            <PengaduanWidgets 
                                stats={{
                                    pengaduanBaru: stats.pengaduanBaru,
                                    pengaduanDiproses: stats.pengaduanDiproses,
                                    pengaduanSelesai: stats.pengaduanSelesai,
                                    jadwalDinas: stats.jadwalDinas,
                                    filesTotal: stats.filesTotal,
                                    filesByCategory: stats.filesByCategory,
                                    pengaduanList: stats.pengaduanList
                                }} 
                                variants={itemVariants} 
                            />
                            {profile?.nama && (
                                <div className="mt-8">
                                    <JadwalPresenceWidget 
                                        jadwalList={stats.jadwalList} 
                                        namaUser={profile.nama} 
                                        variants={itemVariants} 
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
