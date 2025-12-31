export const TABLE_STYLES = {
    // Main Container (Desktop)
    CONTAINER: "hidden min-[820px]:block print:block rounded-3xl border border-white/[0.1] bg-slate-950/40 backdrop-blur-3xl min-[820px]:overflow-hidden shadow-2xl shadow-indigo-500/5 relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible",
    
    // Scroll Wrapper
    WRAPPER: "overflow-x-auto print:block print:overflow-visible custom-scrollbar",
    
    // Table Element
    TABLE: "w-full text-sm text-center relative z-10 print:text-black print-table min-w-[820px] print:min-w-0 print:w-full print:border-collapse",
    
    // Table Header Group (thead)
    THEAD: "text-[11px] uppercase text-slate-400 font-bold tracking-wider print:bg-[#B4C6E7] print:text-black",
    
    // Table Header Cell (th)
    TH: "px-6 py-4 border-b border-r last:border-r-0 border-white/[0.05] bg-slate-900/50 print:border print:border-black print:first:border-l print:py-2 print:px-2 print:!bg-[#B4C6E7]",
    
    // Table Body Cell (td)
    TD: "px-6 py-4 border-white/[0.05] border-r last:border-r-0 border-b last:border-b-0 break-words whitespace-normal text-xs lg:text-[13px] font-medium text-slate-300 text-center align-middle print:border print:border-black print:first:border-l print:py-2 print:px-2",
    
    // Loading/Empty State Row
    STATE_ROW: "px-6 py-16 text-center text-slate-500 italic",
    
    // Mobile Card (Container)
    MOBILE_CARD: "relative overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/40 backdrop-blur-sm p-6 shadow-lg group flex flex-col gap-4 hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300",
    
    // Mobile Card Header
    MOBILE_CARD_HEADER: "pl-0 flex justify-between items-start border-b border-white/[0.1] pb-4",
};
