"use client";

import { useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans selection:bg-indigo-500/30 flex print:bg-white print:text-black">
        {/* Sidebar */}
        <div className="print:hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile Header Toggle */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:hidden z-30 print:hidden">
            <div className="flex items-center gap-3">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg/1034px-Logo_of_the_Ministry_of_Transportation_of_the_Republic_of_Indonesia.svg.png" 
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
        <main className="flex-1 ml-0 md:ml-[220px] print:ml-0 p-4 md:p-8 pt-20 md:pt-8 relative min-h-screen overflow-hidden print:p-0 print:overflow-visible">
            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 md:left-[220px] right-0 h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none print:hidden" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay print:hidden" />
            
            {/* Scrollable Content */}
            <div className="relative z-10 max-w-7xl mx-auto print:max-w-none">
                {children}
            </div>
        </main>
    </div>
  );
}
