"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import { Menu, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, useToaster } from "react-hot-toast";

import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ComplaintNotification from "@/app/components/ComplaintNotification";
import { LayoutContext } from "@/app/context/LayoutContext";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();

  // Toast Visibility Check
  const { toasts } = useToaster();
  const isToastActive = toasts.some(t => t.visible);
  
  // Complaint Notification Visibility Check
  const [isComplaintVisible, setIsComplaintVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldShowNotification = isComplaintVisible && !isModalOpen;

  // Fetch Role
  useEffect(() => {
    const fetchRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
                router.replace(`/?returnUrl=${returnUrl}`);
                return;
            }
            const { data: akun } = await supabase.from('akun').select('peran').eq('email', user.email!).single();
            const r = (akun?.peran || user.user_metadata?.role || user.user_metadata?.peran || "").toUpperCase().replace(/ /g, '_');
            setRole(r);
        } catch (e) {
            console.error("Layout role fetch error", e);
        } finally {
            setLoading(false);
        }
    };
    fetchRole();
  }, []);

  // Route Protection
  useEffect(() => {
    if (loading) return;
    
    const privilegedRoles = ['KANIT_ELBAN', 'TEKNISI_ELBAN', 'TEKNISI', 'ADMIN'];
    const isPrivileged = privilegedRoles.some(p => role.includes(p));
    
    // Redirect non-privileged users to pengaduan if they try to access other pages
    // Exception: Allow /peralatan for QR code access (Read Only)
    if (!isPrivileged && !pathname.startsWith('/pengaduan') && !pathname.startsWith('/peralatan')) {
        router.replace('/pengaduan');
    }
  }, [loading, role, pathname, router]);

  // Helper to determine loading label
  const getLoadingLabel = () => {
    if (pathname === '/dashboard' || pathname === '/') return "Memuat Dashboard...";
    if (pathname.includes('/peralatan')) return "Memuat Data Peralatan...";
    if (pathname.includes('/log-peralatan')) return "Memuat Log Peralatan...";
    if (pathname.includes('/tugas')) return "Memuat Data Tugas...";
    if (pathname.includes('/jadwal')) return "Memuat Jadwal...";
    if (pathname.includes('/files')) return "Memuat File...";
    if (pathname.includes('/konfirmasi-akun')) return "Memuat Konfirmasi Akun...";
    if (pathname.includes('/pengaduan')) return "Memuat Pengaduan...";
    return "Memuat Halaman...";
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
            <LoadingSpinner label={getLoadingLabel()} />
        </div>
      );
  }

  return (
    <LayoutContext.Provider value={{ isComplaintVisible, setIsComplaintVisible, isModalOpen, setIsModalOpen }}>
        <div 
            style={{ '--sidebar-margin': isSidebarCollapsed ? '5rem' : '13.75rem' } as React.CSSProperties}
            className="min-h-screen w-full bg-[#030712] text-white font-sans selection:bg-indigo-500/30 flex print:block print:bg-white print:text-black"
        >
            {/* Notification Wrapper - Fixed & Centered relative to Content */}
            <div className={`fixed top-24 md:top-6 left-0 right-0 md:left-[var(--sidebar-margin)] z-50 flex justify-center pointer-events-none transition-all duration-300 px-4 md:px-8 print:hidden ${!shouldShowNotification ? 'opacity-0 translate-y-[-20px] pointer-events-none hidden' : 'opacity-100 translate-y-0'}`}>
                <div className="pointer-events-auto w-full max-w-7xl">
                    <ComplaintNotification userRole={role} onVisibilityChange={setIsComplaintVisible} />
                </div>
            </div>

            {/* Sidebar */}
            <div className="print:hidden">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                    userRole={role}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile Header Toggle */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:hidden z-30 print:hidden">
                <div className="flex items-center gap-3">
                    <img 
                        src="/logo_kemenhub.png" 
                        alt="Logo" 
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-sm tracking-widest text-white">SIMA ELBAN</span>
                </div>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <main 
                className={`flex-1 transition-[padding] duration-300 ease-in-out
                    ml-0 md:ml-[var(--sidebar-margin)] 
                    ${(isToastActive || shouldShowNotification) ? 'pt-72 md:pt-32' : 'pt-20 md:pt-8'}
                    print:ml-0 p-4 md:p-8 relative min-h-screen overflow-hidden print:block print:h-auto print:min-h-0 print:p-0 print:overflow-visible`}
            >
                {/* Background Atmosphere */}
                <div className="fixed top-0 transition-[left] duration-300 left-0 md:left-[var(--sidebar-margin)] right-0 h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none print:hidden" />
                <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay print:hidden" />
                
                <div className="relative z-10 max-w-7xl mx-auto print:max-w-none">
                    {children}
                </div>
            </main>

            <Toaster 
                position="top-center"
                containerStyle={{
                    top: 24,
                    left: 0,
                    right: 0,
                    bottom: 'auto',
                }}
                containerClassName="md:!left-[var(--sidebar-margin)]"
                toastOptions={{
                    className: '',
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                        maxWidth: '100%',
                        width: '100%',
                    },
                }}
            />
        </div>
    </LayoutContext.Provider>
  );
}
