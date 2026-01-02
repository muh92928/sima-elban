"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { CARD_STYLES } from "@/lib/cardStyles";
import { Akun } from "@/lib/types";

interface WelcomeSectionProps {
    user: any;
    profile: Akun | null;
    variants: any;
}

export default function WelcomeSection({ user, profile, variants }: WelcomeSectionProps) {
    return (
        <motion.div 
            variants={variants}
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
    );
}
