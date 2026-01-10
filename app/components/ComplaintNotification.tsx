"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComplaintNotificationProps {
  userRole: string;
}

export default function ComplaintNotification({ userRole }: ComplaintNotificationProps) {
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
            }
        } catch (err) {
            console.error("Error checking new complaints:", err);
        }
    };

    checkNewComplaints();
  }, [userRole]);

  const handleDismiss = () => {
      setIsVisible(false);
  };

  const handleNavigate = () => {
      router.push("/pengaduan");
      setIsVisible(false);
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
            <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.2)] p-4 flex items-center justify-between gap-4 ring-1 ring-white/10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-indigo-500/20 p-3 rounded-full shrink-0">
                         <Bell className="text-indigo-400 animate-pulse" size={24} />
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-lg inline-block mr-3">Pengaduan Baru!</h4>
                        <span className="text-slate-300 text-sm">
                             Terdapat <span className="font-bold text-indigo-400">{newCount} pengaduan</span> dengan status "Baru" yang perlu ditinjau.
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleNavigate}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                        >
                            Lihat Pengaduan <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg -mr-2"
                >
                    <X size={20} />
                </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
