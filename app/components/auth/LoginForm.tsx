"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

export default function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Lookup Email from NIP
      // We assume NIP is stored in 'akun' table and acts as the username
      const { data: userData, error: userError } = await supabase
        .from('akun')
        .select('email, status, nama')
        .eq('nip', nip.trim())
        .single();

      if (userError || !userData) {
        throw new Error("NIP tidak ditemukan. Silakan NIP yang benar atau daftar akun baru.");
      }

      if (userData.status === 'pending') {
         throw new Error(`Halo ${userData.nama}, akun Anda masih menunggu persetujuan Admin.`);
      }

      if (userData.status === 'rejected') {
         throw new Error("Maaf, pendaftaran akun Anda ditolak.");
      }

      const userEmail = userData.email;
      if (!userEmail) {
        // Fallback case if email is missing in table (legacy data)
        throw new Error("Data login korup. Silakan hubungi admin.");
      }

      // 2. Login using the retrieved Email
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (authError) {
        throw authError; // Usually "Invalid login credentials"
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal masuk. Periksa kembali NIP dan sandi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ring-1 ring-white/5 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(0,51,153,0.3)] hover:border-blue-500/20 hover:-translate-y-1 group">
      {/* Glossy gradient overlay */}
      <div className="absolute top-0 -left-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none group-hover:via-blue-400/5 transition-all duration-700" />

      <div className="text-center mb-8 relative z-10">
        <div className="relative inline-flex group/logo mb-4">
            <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover/logo:opacity-100 group-hover/logo:-inset-1 group-hover/logo:duration-200 animate-tilt"></div>
            <div className="relative inline-flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg/1034px-Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg.png" 
                alt="Ministry of Transportation Logo"
                className="w-16 h-auto object-contain drop-shadow-2xl"
              />
            </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-[0.2em] mb-3 drop-shadow-sm font-sans">
          SIMA ELBAN
        </h1>
        <div className="flex items-center justify-center gap-3 opacity-80">
           <div className="h-[1px] w-8 bg-blue-500/50"></div>
           <span className="text-blue-200 text-[10px] font-bold tracking-[0.3em] uppercase">Halaman Login</span>
           <div className="h-[1px] w-8 bg-blue-500/50"></div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 relative z-10 w-full">

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-2 rounded-xl text-center flex items-center justify-center gap-2 animate-slide-up-fade">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {/* NIP Field */}
        <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "100ms" }}>
          <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
            NIP PEGAWAI
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
            </div>
            <input
              type="text"
              required
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP Anda"
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 tracking-wider font-mono shadow-inner"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "200ms" }}>
          <div className="flex justify-between items-center ml-1">
             <label className="text-[10px] font-bold text-slate-300 tracking-widest flex items-center gap-1.5 opacity-80">
              KATA SANDI
            </label>
            <button
              type="button"
              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline decoration-indigo-500/30 underline-offset-2"
            >
              Lupa Kata Sandi?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-12 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full bg-[#003399] hover:bg-[#002b80] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,51,153,0.39)] hover:shadow-[0_6px_20px_rgba(0,51,153,0.23)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-6 animate-slide-up-fade border border-white/10"
          style={{ animationDelay: "300ms" }}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <span className="tracking-wider">MASUK</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </>
            )}
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
        </button>

        {/* Footer Link Integrated */}
        <div className="relative mt-4 animate-slide-up-fade" style={{ animationDelay: "400ms" }}>
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#0b101e] px-3 text-slate-500 uppercase tracking-widest border border-slate-800 rounded-full py-[2px] shadow-sm">Atau</span>
            </div>
        </div>

        <div className="text-center pb-2 pt-2 animate-slide-up-fade flex items-center justify-center gap-1.5" style={{ animationDelay: "500ms" }}>
              <span className="text-xs text-slate-500 font-medium">Belum memiliki akun?</span>
              <button 
                type="button" 
                onClick={onRegisterClick}
                className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors hover:underline decoration-indigo-500/30 underline-offset-4 tracking-wide"
              >
                Daftar Akun Baru
              </button>
        </div>
      </form>
    </div>
  );
}
