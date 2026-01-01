"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessStateProps {
  mode: "login" | "register";
  onRegisterSuccess: () => void;
  targetPath?: string;
}

export default function SuccessState({ mode, onRegisterSuccess, targetPath }: SuccessStateProps) {
  const router = useRouter();

  // Auto redirect after animation
  useEffect(() => {
    const timer = setTimeout(() => {
        if (mode === "login") {
            router.push(targetPath || "/dashboard");
        } else {
            onRegisterSuccess();
        }
    }, 2500);
    return () => clearTimeout(timer);
  }, [router, mode, onRegisterSuccess, targetPath]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative z-10 w-full max-w-[450px] px-6 text-center"
    >
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ring-1 ring-white/5">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative flex items-center justify-center mx-auto mb-6">
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg/1034px-Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg.png" 
                alt="Ministry of Transportation Logo"
                className="w-20 h-auto object-contain drop-shadow-2xl"
              />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {mode === "login" ? "Akses Diberikan" : "Pendaftaran Berhasil"}
        </h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          {mode === "login" ? (
            <>
              Identitas berhasil diverifikasi.
              <br/>
              Menyiapkan enkripsi sesi aman...
            </>
          ) : (
            <>
              Akun Anda telah dibuat.
              <br/>
              Silakan masuk menggunakan NIP Anda.
            </>
          )}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
            />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
            {mode === "login" ? `MENGALIHKAN KE ${targetPath?.includes('pengaduan') ? 'LAYANAN PENGADUAN' : 'DASHBOARD'}` : "MEMBUKA HALAMAN LOGIN"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
