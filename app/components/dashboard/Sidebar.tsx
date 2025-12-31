"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Wrench, 
  ClipboardList, 
  ListTodo, 
  CalendarDays, 
  FolderOpen, 
  UserCheck, 
  MessageSquareWarning, 
  LogOut,
  ChevronRight,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Peralatan", icon: Wrench, href: "/dashboard/peralatan" },
  { name: "Log Peralatan", icon: ClipboardList, href: "/dashboard/log-peralatan" },
  { name: "Tugas", icon: ListTodo, href: "/dashboard/tugas" },
  { name: "Jadwal", icon: CalendarDays, href: "/dashboard/jadwal" },
  { name: "File", icon: FolderOpen, href: "/dashboard/files" },
  { name: "Konfirmasi Akun", icon: UserCheck, href: "/dashboard/konfirmasi-akun" },
  { name: "Pengaduan", icon: MessageSquareWarning, href: "/dashboard/pengaduan" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, onClose, userRole = "" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Removed internal role fetching

  const sidebarVariants = {
    desktop: { x: 0, opacity: 1 },
    mobileClosed: { x: -220, opacity: 1 },
    mobileOpen: { x: 0, opacity: 1 },
  };

  const filteredMenuItems = menuItems.filter(item => {
    const privilegedRoles = ['KANIT_ELBAN', 'TEKNISI_ELBAN'];
    const isPrivileged = privilegedRoles.some(p => userRole.includes(p));
    
    if (isPrivileged) return true;
    return item.name === 'Pengaduan';
  });

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={!isMobile ? "desktop" : isOpen ? "mobileOpen" : "mobileClosed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "circOut" }}
        className="fixed left-0 top-0 h-screen w-[220px] bg-slate-900/60 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 selection:bg-blue-500/30 font-sans print:hidden"
      >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>

          {/* Glow Effects */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-500/10 blur-[80px] pointer-events-none" />
  
        {/* Header Logo */}
        <div className="relative z-10 p-6 flex flex-col items-center border-b border-white/5">
          <div className="relative group mb-4">
              <div className="absolute transition-all duration-500 opacity-50 -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg group-hover:opacity-80"></div>
              <img 
              src="/logo_kemenhub.png" 
              alt="Logo" 
              className="relative w-16 h-16 object-contain drop-shadow-2xl"
              />
          </div>
          <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-[0.15em] font-sans">
              SIMA ELBAN
          </h2>
  
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
  
            return (
              <div
                  key={item.href}
              >
                  <div 
                      onClick={() => {
                        router.push(item.href);
                        onClose(); // Close sidebar on navigate (mobile)
                      }}
                      className={`relative group flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                          isActive 
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 shadow-[0_4px_20px_-8px_rgba(0,51,153,0.5)]" 
                          : "hover:bg-white/5 border border-transparent hover:border-white/5"
                      }`}
                  >
                      {/* Active Indicator */}
                      {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}
  
                      <Icon 
                          size={18} 
                          className={`transition-colors duration-300 ${
                              isActive ? "text-blue-200 drop-shadow-md" : "text-slate-400 group-hover:text-blue-300"
                          }`} 
                      />
                      
                      <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 flex-1 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}>
                          {item.name}
                      </span>
  
                      {isActive && <ChevronRight size={14} className="text-blue-400 opacity-80" />}
  
                      {/* Shimmer Effect on Hover (Non-active) */}
                      {!isActive && (
                          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                      )}
                  </div>
              </div>
            );
          })}
          
          {/* Logout Button (Moved up) */}
          <div className="pt-4 mt-2 border-t border-white/5">
              <button 
                onClick={handleLogout}
                className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <LogOut size={16} className="text-red-400" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-red-200 group-hover:text-red-100 transition-colors">Keluar</span>
                  <span className="text-[9px] text-red-400/60 font-medium tracking-wide">Akhiri Sesi</span>
                </div>
              </button>
          </div>
        </nav>
      </motion.aside>
    </>
  );
}
