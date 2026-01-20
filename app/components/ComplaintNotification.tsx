"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComplaintNotificationProps {
  userRole: string;
  onVisibilityChange?: (visible: boolean) => void;
  suppress?: boolean;
}

export default function ComplaintNotification({ userRole, onVisibilityChange, suppress }: ComplaintNotificationProps) {
  const [newCount, setNewCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userRole) return;

    // Check if user is Teknisi or Kanit
    const isTargetRole = 
        userRole.includes("TEKNISI_ELBAN") || 
        userRole.includes("KANIT_ELBAN");

    if (!isTargetRole) return;

    const checkNewComplaints = async () => {
        try {
            // Count complaints with status 'Baru'
            const { count, error } = await supabase
                .from('pengaduan')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Baru');

            if (error) throw error;

            if (count && count > 0) {
                setNewCount(count);
                // Check if we haven't dismissed it in this session?
                // For now, let's show it every time page refreshes/loads as requested "ketika baru saja login"
                setIsVisible(true);
                onVisibilityChange?.(true);
            }
        } catch (err) {
            console.error("Error checking new complaints:", err);
        }
    };

    checkNewComplaints();
  }, [userRole, onVisibilityChange]); // Added onVisibilityChange to dependencies for robustness

  const handleDismiss = () => {
      setIsVisible(false);
      onVisibilityChange?.(false);
  };

  const handleNavigate = () => {
      router.push("/pengaduan");
      setIsVisible(false);
      onVisibilityChange?.(false);
  };

  return (
    <AnimatePresence>
      {(isVisible && !suppress) && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-6 left-0 right-0 z-[100] w-full pointer-events-none"
        >
            <div className="w-full pointer-events-auto">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-[1.5rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] p-3 md:p-4 flex flex-col items-center gap-2.5 ring-1 ring-white/5 relative overflow-hidden group w-full">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    
                    {/* Row 1: Bell & Close (Tiny) */}
                    <div className="flex items-center justify-between w-full relative z-10">
                        <div className="w-6 h-6 invisible" /> {/* Spacer */}
                        
                        <div className="relative">
                            <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                                 <Bell className="text-white animate-pulse" size={16} />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900" />
                        </div>

                        <button 
                            onClick={handleDismiss}
                            className="text-slate-500 hover:text-white transition-all p-1 rounded-md hover:bg-white/5 active:scale-90"
                            title="Tutup"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Row 2: Text (Extra Compact) */}
                    <div className="flex flex-col items-center text-center gap-0.5 relative z-10 w-full px-4">
                        <h4 className="text-white font-black text-sm md:text-base tracking-tight">
                            Update Pengaduan
                        </h4>
                        <p className="text-slate-400 text-[10px] md:text-xs font-medium leading-tight">
                             Terdapat <span className="text-white font-bold">{newCount} laporan baru</span> yang perlu ditinjau segera.
                        </p>
                    </div>

                    {/* Row 3: Action Button (Mini) */}
                    <div className="relative z-10 w-full max-w-[240px] mt-0.5">
                        <button 
                            onClick={handleNavigate}
                            className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all hover:bg-indigo-50 active:scale-95 shadow-md group"
                        >
                            Tinjau Sekarang 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
