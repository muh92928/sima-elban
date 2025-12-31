"use client";

import React, { useState } from "react";
import { User, Lock, ArrowRight, Eye, EyeOff, Loader2, Briefcase, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [nip, setNip] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { value: 'KEPALA_BANDARA', label: 'Kepala Bandara' },
    { value: 'KASI_TOKPD', label: 'Kasi TOKPD' },
    { value: 'KASI_JASA', label: 'Kasi Jasa' },
    { value: 'KASUBAG_TU', label: 'Kasubag TU' },
    { value: 'KANIT_ELBAN', label: 'Kanit ELBAN' },
    { value: 'TEKNISI_ELBAN', label: 'Teknisi ELBAN' },
    { value: 'UNIT_BANGLAN', label: 'Unit Banglan' },
    { value: 'UNIT_HUMAS', label: 'Unit Humas' },
    { value: 'UNIT_LISTRIK', label: 'Unit Listrik' },
    { value: 'UNIT_ADMIN', label: 'Unit Admin' },
    { value: 'UNIT_A2B', label: 'Unit A2B' },
    { value: 'UNIT_PK', label: 'Unit PK' },
    { value: 'UNIT_AVSEC', label: 'Unit Avsec' },
    { value: 'UNIT_INFORMASI', label: 'Unit Informasi' },
    { value: 'UNIT_TATA_TERMINAL', label: 'Unit Tata Terminal' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok!");
      setIsLoading(false);
      return;
    }

    if (!role) {
      setError("Silakan pilih Peran terlebih dahulu.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Register user to Supabase Auth with Metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nip: nip.trim(),
            full_name: fullName, // Use 'nama' or 'full_name' depending on DB trigger expectation. Usually full_name is standard.
            peran: role // Passing 'peran' to match 'role' selection. Trigger should map this to 'role' or 'peran' column.
          }
        }
      });

      console.log("👉 SIGN UP ATTEMPT RESULT:");
      console.log("DATA:", authData);
      console.log("ERROR:", authError);

      if (authError) throw authError;

      if (authData.user) {
        await supabase.auth.signOut();
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: [25, -25, 25] }}
      transition={{ duration: 4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      className="relative group rounded-3xl transition-all duration-500 hover:shadow-[0_0_50px_0_rgba(6,182,212,0.6)] will-change-transform"
    >
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ring-1 ring-white/5 relative overflow-hidden w-full h-full transition-colors duration-500 group-hover:border-cyan-400/30">
        {/* Glossy gradient overlay */}
        <div className="absolute top-0 -left-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none group-hover:via-cyan-400/10 transition-all duration-700" />

        {/* Header */}
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
             <span className="text-blue-200 text-[10px] font-bold tracking-[0.3em] uppercase">Halaman Registrasi</span>
             <div className="h-[1px] w-8 bg-blue-500/50"></div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3 relative z-10">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-2 rounded-xl text-center flex items-center justify-center gap-2 mb-3 animate-slide-up-fade">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
              {/* NIP Field */}
              <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "100ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  NIP
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BadgeCheck className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
                  </div>
                  <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="NIP Pegawai"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 tracking-wider font-mono shadow-inner"
                  />
              </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "150ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  NAMA LENGKAP
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
                  </div>
                  <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 shadow-inner"
                  />
              </div>
              </div>

              {/* Email Field - Added */}
              <div className="space-y-1 col-span-2 animate-slide-up-fade" style={{ animationDelay: "175ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  EMAIL AKTIF
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
                  </div>
                  <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 shadow-inner"
                  />
              </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1 col-span-2 animate-slide-up-fade" style={{ animationDelay: "200ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  PERAN
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
                  </div>
                  <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 shadow-inner appearance-none cursor-pointer ${
                      role ? "text-white" : "text-slate-600"
                  }`}
                  >
                      <option value="" disabled className="text-slate-600 bg-slate-900">Pilih peran...</option>
                      {roles.map((r) => (
                          <option key={r.value} value={r.value} className="bg-slate-900 text-white">
                              {r.label}
                          </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "250ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  KATA SANDI
              </label>
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

              {/* Confirm Password Field */}
              <div className="space-y-1 animate-slide-up-fade" style={{ animationDelay: "300ms" }}>
              <label className="text-[10px] font-bold text-slate-300 ml-1 tracking-widest flex items-center gap-1.5 opacity-80">
                  KONFIRMASI
              </label>
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={16} />
                  </div>
                  <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl py-2.5 pl-9 pr-12 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:border-slate-600/50 shadow-inner"
                  />
                  <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors p-1"
                  >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
              </div>
              </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full bg-[#003399] hover:bg-[#002b80] text-white py-3.5 rounded-xl font-bold text-xs transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,51,153,0.39)] hover:shadow-[0_6px_20px_rgba(0,51,153,0.23)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-6 animate-slide-up-fade border border-white/10"
            style={{ animationDelay: "350ms" }}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span className="tracking-wider">DAFTAR AKUN</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </>
              )}
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
          </button>

          {/* Back to Login */}
          <div className="text-center pb-2 pt-2 animate-slide-up-fade flex items-center justify-center gap-1.5" style={{ animationDelay: "400ms" }}>
                <span className="text-xs text-slate-500 font-medium">Sudah punya akun?</span>
                <button 
                  type="button" 
                  onClick={onLoginClick}
                  className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors hover:underline decoration-indigo-500/30 underline-offset-4 tracking-wide"
                >
                  Masuk disini
                </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
