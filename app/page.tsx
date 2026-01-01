"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import SuccessState from "./components/auth/SuccessState";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "register" | "success">("login");
  const [successMode, setSuccessMode] = useState<"login" | "register">("login");
  const [redirectPath, setRedirectPath] = useState("/dashboard"); // Default
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030712] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden selection:text-white">
      {/* Dynamic Background with Grid */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        {/* Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 mixed-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 mixed-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 mixed-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#030712_100%] opacity-80"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-4 py-8">
        <AnimatePresence mode="wait">
            {view === "success" ? (
            <SuccessState 
                key="success" 
                mode={successMode}
                targetPath={redirectPath}
                onRegisterSuccess={() => setView("login")}
            />
            ) : (
            <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.98, x: view === "login" ? -20 : 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: view === "login" ? 20 : -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full transition-all duration-500 ${view === "register" ? "max-w-[600px]" : "max-w-[350px]"}`}
            >
                {view === "login" ? (
                <LoginForm 
                    onSuccess={(path) => {
                        if (path) setRedirectPath(path);
                        setSuccessMode("login");
                        setView("success");
                    }} 
                    onRegisterClick={() => setView("register")}
                />
                ) : (
                <RegisterForm 
                    onSuccess={() => {
                        setSuccessMode("register");
                        setView("success");
                    }}
                    onLoginClick={() => setView("login")}
                />
                )}
            </motion.div>
            )}
        </AnimatePresence>

        {/* Credit Section */}
        <div className="relative z-10 mt-8 pointer-events-none animate-slide-up-fade" style={{ animationDelay: "600ms" }}>
            <div className="px-5 py-2.5 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-md shadow-2xl flex items-center gap-2.5 ring-1 ring-white/5">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-clip-text text-transparent uppercase tracking-[0.3em] shadow-sm">
                    SIMA-ELBAN SECURITY SYSTEM
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}
