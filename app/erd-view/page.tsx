"use client";

import React from "react";
import { 
  UserCircle, 
  Wrench, 
  ClipboardList, 
  ListTodo, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquareWarning,
  Key,
  Link as LinkIcon,
  ArrowRight,
  Database
} from "lucide-react";

const TableCard = ({ title, icon: Icon, columns, color, position }: any) => (
  <div 
    className="absolute bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden flex flex-col w-[210px] z-20 ring-1 ring-black/5"
    style={{ left: position.x, top: position.y }}
  >
    <div className={`p-3 ${color} flex items-center gap-2 border-b border-white/20 shadow-sm`}>
      <div className="p-1.5 bg-white/30 rounded-lg">
        <Icon size={16} className="text-slate-800" />
      </div>
      <span className="font-bold text-[11px] tracking-tight text-slate-800">{title}</span>
    </div>
    <div className="p-3 flex flex-col gap-1.5 bg-gradient-to-b from-white/10 to-transparent">
      {columns.map((col: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between group/row">
          <div className="flex items-center gap-2 overflow-hidden">
            {col.isPk ? (
              <div className="p-0.5 bg-amber-100 rounded shadow-sm shrink-0">
                <Key size={10} className="text-amber-600 fill-amber-600" />
              </div>
            ) : col.isFk ? (
              <div className="p-0.5 bg-blue-100 rounded shadow-sm shrink-0">
                <LinkIcon size={10} className="text-blue-600" />
              </div>
            ) : (
              <div className="w-[14px]" />
            )}
            <span className={`text-[10px] ${col.isPk || col.isFk ? 'font-bold text-slate-800' : 'text-slate-600'} truncate group-hover/row:text-slate-900 transition-colors`}>
              {col.name}
            </span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0 transition-opacity group-hover/row:opacity-60 bg-slate-50 px-1 rounded border border-slate-100 italic">
            {col.type}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ConnectionLine = ({ from, to, label }: { from: {x: number, y: number}, to: {x: number, y: number}, label?: string }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);
  const isMany = label?.includes("N") && !label?.includes("(NIP)");

  return (
    <div 
      className="absolute h-[2px] bg-slate-400 origin-left z-30 flex items-center justify-center pointer-events-none"
      style={{ 
        left: from.x, 
        top: from.y, 
        width: length, 
        transform: `rotate(${angle}deg)`,
      }}
    >
        {/* Destination Marker (Symbols) */}
        <div 
          className="absolute right-0 flex items-center justify-end"
        >
            {isMany ? (
                /* Crow's Foot - Vertex is on the line, prongs touch the table edge */
                <div className="relative flex items-center justify-end w-5">
                    {/* Top Prong - meet at left, spread to right */}
                    <div className="absolute w-5 h-[2px] bg-slate-400 rounded-full rotate-[-30deg] origin-left left-0" />
                    {/* Bottom Prong - meet at left, spread to right */}
                    <div className="absolute w-5 h-[2px] bg-slate-400 rounded-full rotate-[30deg] origin-left left-0" />
                    {/* Center Prong */}
                    <div className="absolute w-4 h-[2px] bg-slate-400 rounded-full left-0" />
                </div>
            ) : (
                /* 1:1 Marker (Vertical Bar) at the very edge */
                <div className="w-[2px] h-4 bg-slate-400 rounded-full" />
            )}
        </div>

        {/* Label Badge */}
        {label && (
            <div 
                className="bg-white/95 px-2 py-0.5 border border-slate-200 rounded-md text-[10px] font-black text-slate-700 shadow-sm whitespace-nowrap"
                style={{ transform: `rotate(${-angle}deg)` }}
            >
                {label}
            </div>
        )}
    </div>
  );
};

const ERDView = () => {
    // OPTIMIZED GRID SPACING - ENHANCED FOR CLARITY
    const C1 = 60;   // Left Column
    const C2 = 400;  // Center Column
    const C3 = 740;  // Right Column
    
    const R1 = 50;   // Top Row
    const R2 = 360;  // Middle Row (Shifted down for space)
    const R3 = 670;  // Bottom Row (Shifted down for space)

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-8 overflow-auto selection:bg-blue-100">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-[1100px] z-10 my-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12">
                    
                    {/* Simplified Header */}
                    <div className="flex flex-col items-center mb-16 relative">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-center">
                            ENTITY RELATIONSHIP DIAGRAM (ERD)
                        </h1>
                    </div>

                    <div className="relative w-full h-[880px] rounded-3xl bg-slate-50/50 border border-slate-200/50 p-6 pointer-events-none sm:pointer-events-auto">
                        {/* RELATIONSHIP LINES - FINAL PRECISION ALIGNMENT */}
                        
                        {/* Personel (C1) <-> Akun (C2) (1:1) - Horizontal edge to edge */}
                        <ConnectionLine from={{x: C1+210, y: R1+75}} to={{x: C2, y: R1+75}} label="1 : 1 (NIP)" />
                        
                        {/* Akun (C2) <-> Tugas (C1) (1:N) - Left to Right */}
                        <ConnectionLine from={{x: C2, y: R1+160}} to={{x: C1+210, y: R2+40}} label="1 : N" />
                        
                        {/* Akun (C2) <-> Pengaduan (C3) (1:N) - Right to Left */}
                        <ConnectionLine from={{x: C2+210, y: R1+160}} to={{x: C3, y: R2+40}} label="1 : N" />
                        
                        {/* Peralatan (C2) <-> Tugas (C1) (1:N) - Left to Right */}
                        <ConnectionLine from={{x: C2, y: R2+100}} to={{x: C1+210, y: R2+100}} label="1 : N" />
                        
                        {/* Peralatan (C2) <-> Pengaduan (C3) (1:N) - Right to Left */}
                        <ConnectionLine from={{x: C2+210, y: R2+100}} to={{x: C3, y: R2+100}} label="1 : N" />
                        
                        {/* Peralatan (C2) <-> Log Performance (C2) (1:N) - Vertical Bottom to Top */}
                        {/* Table height is ~198px. R2(360) + 198 = 558. R3 = 670. Gap = 112px. */}
                        <ConnectionLine from={{x: C2+105, y: R2+198}} to={{x: C2+105, y: R3}} label="1 : N" />

                        {/* COL 1: Left */}
                        <TableCard title="Personel (Biodata)" icon={Users} color="bg-gradient-to-br from-indigo-100 to-indigo-50" position={{x:C1, y:R1}} columns={[
                            {name:"id", type:"uuid", isPk:true},
                            {name:"nip", type:"text"},
                            {name:"nama", type:"text"},
                            {name:"jabatan", type:"text"},
                            {name:"no_sertifikat", type:"text"},
                            {name:"jenis_sertifikat", type:"text"}
                        ]} />

                        <TableCard title="Manajemen Tugas" icon={ListTodo} color="bg-gradient-to-br from-amber-100 to-amber-50" position={{x:C1, y:R2}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"peralatan_id", type:"int8", isFk:true},
                            {name:"dibuat_oleh_nip", type:"text", isFk:true},
                            {name:"ditugaskan_ke_nip", type:"text", isFk:true},
                            {name:"judul", type:"text"},
                            {name:"status", type:"enum"}
                        ]} />

                        <TableCard title="Jadwal (Duty Roster)" icon={Calendar} color="bg-gradient-to-br from-cyan-100 to-cyan-50" position={{x:C1, y:R3}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"nama_kegiatan", type:"text"},
                            {name:"tanggal", type:"date"},
                            {name:"waktu", type:"time"},
                            {name:"lokasi", type:"text"}
                        ]} />

                        {/* COL 2: Center */}
                        <TableCard title="Akun (Auth & Security)" icon={UserCircle} color="bg-gradient-to-br from-blue-100 to-blue-50" position={{x:C2, y:R1}} columns={[
                            {name:"id", type:"uuid", isPk:true},
                            {name:"nip", type:"text"},
                            {name:"nama", type:"text"},
                            {name:"email", type:"text"},
                            {name:"peran", type:"enum"},
                            {name:"status", type:"text"}
                        ]} />

                        <TableCard title="Peralatan ELBAN" icon={Wrench} color="bg-gradient-to-br from-emerald-100 to-emerald-50" position={{x:C2, y:R2}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"nama", type:"text"},
                            {name:"jenis", type:"text"},
                            {name:"no_sertifikat", type:"text"},
                            {name:"status_laik", type:"enum"},
                            {name:"kondisi_persen", type:"int4"}
                        ]} />

                        <TableCard title="Log Performance" icon={ClipboardList} color="bg-gradient-to-br from-slate-200 to-slate-100" position={{x:C2, y:R3}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"peralatan_id", type:"int8", isFk:true},
                            {name:"tanggal", type:"date"},
                            {name:"waktu_operasi", type:"int4"},
                            {name:"status", type:"enum"}
                        ]} />

                        {/* COL 3: Right */}
                        <TableCard title="Digital Archives" icon={FileText} color="bg-gradient-to-br from-teal-100 to-teal-50" position={{x:C3, y:R1}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"nama", type:"text"},
                            {name:"kategori", type:"text"},
                            {name:"url", type:"text"},
                            {name:"ukuran", type:"int8"}
                        ]} />

                        <TableCard title="Pengaduan Unit" icon={MessageSquareWarning} color="bg-gradient-to-br from-rose-100 to-rose-50" position={{x:C3, y:R2}} columns={[
                            {name:"id", type:"int8", isPk:true},
                            {name:"akun_id", type:"uuid", isFk:true},
                            {name:"peralatan_id", type:"int8", isFk:true},
                            {name:"deskripsi", type:"text"},
                            {name:"status", type:"enum"}
                        ]} />
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap items-center justify-center w-full gap-10 border-t border-slate-200 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl shadow-sm group hover:rotate-12 transition-transform">
                                <Key size={16} className="text-amber-600 fill-amber-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 uppercase leading-none">PK</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1">Primary Key</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl shadow-sm group hover:rotate-12 transition-transform">
                                <LinkIcon size={16} className="text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 uppercase leading-none">FK</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1">Foreign Key</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-10 text-[11px] font-bold text-slate-500">
                           {/* 1:1 Legend */}
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-[2px] bg-slate-300 rounded-full" />
                               <span className="text-slate-700">1 : 1 <span className="text-slate-400 ml-1">(ONE TO ONE)</span></span>
                           </div>

                           {/* 1:N Legend */}
                           <div className="flex items-center gap-3">
                               <div className="relative flex items-center w-14">
                                   <div className="w-8 h-[2px] bg-slate-400 rounded-full" />
                                   {/* Crow's Foot Symbol - Matches main diagram exactly */}
                                   <div className="relative flex items-center ml-[-2px]">
                                       <div className="absolute w-4 h-[2px] bg-slate-400 rounded-full rotate-[30deg] origin-left" />
                                       <div className="absolute w-4 h-[2px] bg-slate-400 rounded-full -rotate-[30deg] origin-left" />
                                       <div className="absolute w-3 h-[2px] bg-slate-400 rounded-full" />
                                   </div>
                               </div>
                               <span className="text-slate-700 font-black ml-2">1 : N <span className="text-slate-400 ml-1 font-bold">(ONE TO MANY)</span></span>
                           </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs font-medium tracking-wide">
                        Sistem Informasi Manajemen Unit Elektronika Bandara &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ERDView;
