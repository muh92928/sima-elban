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
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col items-center text-center gap-2 ring-1 ring-white/5 relative overflow-hidden group w-full max-w-[320px] mx-auto">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                    
                    {/* Close Button (Absolute) */}
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-slate-500 hover:text-white transition-all p-1 rounded-md hover:bg-white/5 z-20"
                    >
                        <X size={14} />
                    </button>

                    {/* Row 1: Bell & Title (Centered) */}
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                         <div className="bg-gradient-to-tr from-indigo-600 to-blue-600 p-1.5 rounded-xl shadow-lg shadow-indigo-500/20">
                              <Bell className="text-white animate-pulse" size={14} />
                         </div>
                         <h4 className="text-white font-black text-xs tracking-tight">
                            Update Pengaduan
                        </h4>
                    </div>
                    
                    {/* Row 2: Description */}
                    <div className="relative z-10">
                        <p className="text-slate-400 text-[10px] font-medium leading-tight">
                             Terdapat <span className="text-white font-bold">{newCount} laporan baru</span>
                        </p>
                    </div>

                    {/* Row 3: Action Button (Centered) */}
                    <div className="relative z-10 w-full mt-1">
                        <button 
                            onClick={handleNavigate}
                            className="bg-white text-slate-950 px-5 py-1.5 rounded-full text-[10px] font-black transition-all hover:bg-indigo-50 flex items-center gap-1.5 mx-auto active:scale-95 shadow-lg"
                        >
                            Tinjau Sekarang
                            <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
