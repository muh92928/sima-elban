"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotificationToastProps {
  t: any; // toast object from react-hot-toast
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function NotificationToast({ t, message, type = 'success' }: NotificationToastProps) {
  
  const config = {
      success: {
          icon: CheckCircle,
          color: "text-emerald-400",
          itemBg: "bg-emerald-500/20",
          title: "Berhasil!",
          shadow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
          border: "border-emerald-500/30",
          ring: "ring-emerald-500/10"
      },
      error: {
          icon: XCircle,
          color: "text-red-400",
          itemBg: "bg-red-500/20",
          title: "Gagal!",
          shadow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]",
          border: "border-red-500/30",
          ring: "ring-red-500/10"
      },
      warning: {
          icon: AlertTriangle,
          color: "text-amber-400",
          itemBg: "bg-amber-500/20",
          title: "Peringatan!",
          shadow: "shadow-[0_0_30px_rgba(245,158,11,0.2)]",
          border: "border-amber-500/30",
          ring: "ring-amber-500/10"
      },
      info: {
          icon: Info,
          color: "text-blue-400",
          itemBg: "bg-blue-500/20",
          title: "Informasi",
          shadow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
          border: "border-blue-500/30",
          ring: "ring-blue-500/10"
      }
  };

  const style = config[type];
  const Icon = style.icon;

  return (
    <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-7xl mx-auto px-4 md:px-8 pointer-events-none flex justify-center`}
    >
        <div className={`pointer-events-auto w-full bg-slate-900/95 backdrop-blur-md border ${style.border} rounded-2xl ${style.shadow} p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ring-1 ring-white/10 relative`}>
            
            <div className="flex items-start md:items-center gap-4 flex-1 w-full">
                <div className={`${style.itemBg} p-3 rounded-full shrink-0`}>
                        <Icon className={`${style.color}`} size={24} />
                </div>
                
                <div className="flex-1">
                    <h4 className="text-white font-bold text-lg block md:inline-block md:mr-3">{style.title}</h4>
                    <span className="text-slate-300 text-sm block md:inline leading-relaxed">
                            {message}
                    </span>
                </div>
            </div>

            <button 
                onClick={() => toast.dismiss(t.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg md:relative md:top-auto md:right-auto md:p-2 md:-mr-2"
            >
                <X size={20} />
            </button>
        </div>
    </motion.div>
  );
}
