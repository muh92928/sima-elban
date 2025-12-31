export const CARD_STYLES = {
    // Base Card Container
    CONTAINER: "relative rounded-3xl border border-white/[0.1] bg-slate-950/40 backdrop-blur-3xl shadow-2xl shadow-indigo-500/5 transition-all duration-300",
    
    // Interactive Card (Hover effects)
    INTERACTIVE: "hover:border-indigo-500/20 hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer group",

    // Card Header / Title Section
    HEADER: "flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 relative overflow-hidden",
    
    // Card Body / Content Section
    BODY: "p-6 relative z-10",

    // Stat Card Specifics
    STAT_CARD: "p-6 rounded-2xl border backdrop-blur-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border-white/[0.1] bg-slate-950/40",
    
    // Specialized Glass Overlay (for welcome cards etc)
    GLASS_OVERLAY: "absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none",
    
    // Icon Container
    ICON_CONTAINER: "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
};
