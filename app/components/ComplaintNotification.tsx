"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComplaintNotificationProps {
  userRole: string;
  onVisibilityChange?: (visible: boolean) => void;
}

export default function ComplaintNotification({ userRole, onVisibilityChange }: ComplaintNotificationProps) {
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
  }, [userRole]);

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
      {isVisible && (
        <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
        >
            <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.2)] p-4 flex flex-col @tablet:flex-row items-start @tablet:items-center justify-between gap-4 ring-1 ring-white/10 relative">
                <div className="flex items-start @tablet:items-center gap-4 flex-1 w-full">
                    <div className="bg-indigo-500/20 p-3 rounded-full shrink-0">
                         <Bell className="text-indigo-400 animate-pulse" size={24} />
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-lg block @tablet:inline-block @tablet:mr-3">Pengaduan Baru!</h4>
                        <span className="text-slate-300 text-sm block @tablet:inline">
                             Terdapat <span className="font-bold text-indigo-400">{newCount} pengaduan</span> dengan status "Baru" yang perlu ditinjau.
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full @tablet:w-auto pl-[3.25rem] @tablet:pl-0">
                    <button 
                        onClick={handleNavigate}
                        className="flex-1 @tablet:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                    >
                        Lihat Pengaduan <ArrowRight size={16} />
                    </button>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg @tablet:relative @tablet:top-auto @tablet:right-auto @tablet:p-2 @tablet:-mr-2"
                >
                    <X size={20} />
                </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
