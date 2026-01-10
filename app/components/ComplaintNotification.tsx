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
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md print:hidden"
        >
            <div className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] p-4 flex items-start gap-4 ring-1 ring-white/10">
                <div className="bg-indigo-500/20 p-3 rounded-full shrink-0">
                     <Bell className="text-indigo-400 animate-pulse" size={24} />
                </div>
                
                <div className="flex-1 pt-1">
                    <h4 className="text-white font-bold text-lg mb-1">Pengaduan Baru!</h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">
                         Terdapat <span className="font-bold text-indigo-400">{newCount} pengaduan</span> dengan status "Baru" yang perlu ditinjau.
                    </p>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleNavigate}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Lihat Pengaduan <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={handleDismiss}
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
