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
  X,
  PanelLeft // Added icon
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Peralatan", icon: Wrench, href: "/peralatan" },
  { name: "Log Peralatan", icon: ClipboardList, href: "/log-peralatan" },
  { name: "Tugas", icon: ListTodo, href: "/tugas" },
  { name: "Jadwal", icon: CalendarDays, href: "/jadwal" },
  { name: "File", icon: FolderOpen, href: "/files" },
  { name: "Konfirmasi Akun", icon: UserCheck, href: "/konfirmasi-akun" },
  { name: "Pengaduan", icon: MessageSquareWarning, href: "/pengaduan" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  userRole = "", 
  isCollapsed = false, 
  onToggleCollapse 
}: SidebarProps) {
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

  // Force expanded state on mobile
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const sidebarVariants = {
    desktop: { 
        x: 0, 
        opacity: 1,
        width: effectiveCollapsed ? 80 : 220 
    },
    mobileClosed: { x: -100, opacity: 0, width: 280, display: "none" }, // Improved mobile closed state
    mobileOpen: { x: 0, opacity: 1, width: 280, display: "flex" }, // Fixed width for mobile drawer
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
        className="fixed left-0 top-0 h-screen bg-slate-900/60 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 selection:bg-blue-500/30 font-sans print:hidden"
      >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white md:hidden z-[60]"
          >
            <X size={20} />
          </button>

          {/* Toggle Button - External Right Edge */}
          {onToggleCollapse && !isMobile && (
             <button
                onClick={onToggleCollapse}
                className="absolute top-6 -right-3 z-50 p-1 bg-slate-800 border border-slate-700/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transform hover:scale-110"
                title={effectiveCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
             >
                 <PanelLeft size={16} className={effectiveCollapsed ? "rotate-180" : ""} />
             </button>
          )}

        {/* Content Wrapper - Clips internal overflows (glows) but allows external button */}
        <div className="relative flex flex-col w-full h-full overflow-hidden">
          {/* Glow Effects */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-500/10 blur-[80px] pointer-events-none" />
  
          {/* Header Logo */}
          <div className={`relative z-10 p-6 flex flex-col items-center border-b border-white/5 transition-all duration-300 ${effectiveCollapsed ? 'px-2' : ''}`}>
            <div className="relative group mb-4">
                <div className="absolute transition-all duration-500 opacity-50 -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg group-hover:opacity-80"></div>
                <img 
                src="/logo_kemenhub.png" 
                alt="Logo" 
                className={`relative object-contain drop-shadow-2xl transition-all duration-300 ${effectiveCollapsed ? 'w-10 h-10' : 'w-16 h-16'}`}
                />
            </div>
            <h2 className={`text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-[0.15em] font-sans whitespace-nowrap overflow-hidden transition-all duration-300 ${effectiveCollapsed ? 'w-0 opacity-0 h-0' : 'w-auto opacity-100 h-auto'}`}>
                SIMA ELBAN
            </h2>
          </div>
    
          {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar overflow-x-hidden">
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
  
            return (
              <div
                  key={item.href}
                  className="relative group"
              >
                  <div 
                      onClick={() => {
                        router.push(item.href);
                        if (isMobile) onClose();
                      }}
                      className={`relative flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3.5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                          isActive 
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 shadow-[0_4px_20px_-8px_rgba(0,51,153,0.5)]" 
                          : "hover:bg-white/5 border border-transparent hover:border-white/5"
                      }`}
                      title={effectiveCollapsed ? item.name : undefined}
                  >
                      {/* Active Indicator */}
                      {isActive && !effectiveCollapsed && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}
  
                      <Icon 
                          size={18} 
                          className={`transition-colors duration-300 shrink-0 ${
                              isActive ? "text-blue-200 drop-shadow-md" : "text-slate-400 group-hover:text-blue-300"
                          }`} 
                      />
                      
                      <span className={`text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      } ${effectiveCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                          {item.name}
                      </span>
  
                      {isActive && !effectiveCollapsed && <ChevronRight size={14} className="text-blue-400 opacity-80 ml-auto" />}
  
                      {/* Shimmer Effect */}
                      {!isActive && (
                          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                      )}
                  </div>
              </div>
            );
          })}
          
          {/* Logout Button */}
          <div className="pt-4 mt-2 border-t border-white/5">
              <button 
                onClick={handleLogout}
                className={`group w-full flex items-center ${effectiveCollapsed ? 'justify-center px-0' : 'justify-start px-4'} gap-3 py-3.5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden hover:bg-red-500/10 border border-transparent hover:border-red-500/10`}
                title={effectiveCollapsed ? "Keluar" : undefined}
              >
                  <LogOut 
                      size={18} 
                      className={`transition-colors duration-300 shrink-0 text-red-400 group-hover:text-red-300`}
                  />
                  
                  <span className={`text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap text-red-400 group-hover:text-red-300 ${effectiveCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      Keluar
                  </span>
              </button>
          </div>
        </nav>
        </div>
      </motion.aside>
    </>
  );
}
