"use client";

import { Jadwal, Akun } from "@/lib/types"; // Import Akun
import { useMemo } from "react";

interface JadwalMatrixPrintProps {
  data: Jadwal[];
  month: Date;
  kanitElban?: Akun | null;
  userMap?: Record<string, string>; // Name -> WA
  isPrintMode?: boolean;
}

export default function JadwalMatrixPrint({ data, month, kanitElban, userMap = {}, isPrintMode = true }: JadwalMatrixPrintProps) {
  // 1. Generate Days of Month
  const daysInMonth = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const days = new Date(year, m + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [month]);

  // 2. Parse Data into Matrix
  const matrixData = useMemo(() => {
    const personnelMap = new Map<string, Record<number, { code: string; color: string }>>();
    const knownPersonnel = new Set<string>();

    // Sort data by date first
    const sortedData = [...data].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    sortedData.forEach(item => {
        // Regex to parse "Status - Name"
        // Update regex to include new statuses
        const match = item.nama_kegiatan.match(/^(Dinas Pagi|Dinas Elban|Dinas Luar|Izin|Cuti|Sakit|Tugas Belajar|Standby|Libur)\s-\s(.+)$/i);
        
        let name = "Unassigned";
        let status = item.nama_kegiatan;
        
        if (match) {
            status = match[1]; 
            name = match[2].trim(); 
        } else {
             // If not matching "Status - Name", skip or try to infer? 
             // We'll skip for strictness as per previous logic
             return; 
        }

        knownPersonnel.add(name);
        
        if (!personnelMap.has(name)) {
            personnelMap.set(name, {});
        }
        
        const day = new Date(item.tanggal).getDate();
        
        // Map Status to Code & Color
        let code = "";
        let color = ""; // bg class

        switch(status.toLowerCase()) {
            case 'dinas pagi':
                code = "P";
                color = "bg-sky-400 text-black"; 
                break;
            case 'dinas elban':
            case 'standby elban':
                code = "PS";
                color = "bg-white text-black"; 
                break;
            case 'dinas luar':
                code = "DL";
                color = "bg-orange-400 text-black";
                break;
            case 'izin':
                code = "I";
                color = "bg-emerald-300 text-black";
                break;
            case 'cuti':
                code = "C";
                color = "bg-yellow-300 text-black";
                break;
            case 'sakit':
                code = "S";
                color = "bg-pink-300 text-black";
                break;
            case 'tugas belajar':
                code = "TB";
                color = "bg-indigo-300 text-black";
                break;
            case 'libur':
                 code = "L";
                 color = "bg-red-500";
                 break;
            default:
                code = "?";
                color = "bg-gray-100";
        }
        
        personnelMap.get(name)![day] = { code, color };
    });

    // Convert Map to Array sorted by Name
    return Array.from(knownPersonnel).sort().map(name => ({
        name,
        schedule: personnelMap.get(name)!
    }));
  }, [data]);

  return (
    <div className={`w-full font-sans text-xs @container ${isPrintMode ? 'text-black' : 'text-white'}`}>
        {/* Print Styles */}
        <style type="text/css" media="print">
            {`
            @page { size: landscape; margin: 15mm; }
            body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                font-family: 'Times New Roman', Times, serif !important;
                background-color: white !important;
            }
            .print-table { width: 100%; border-collapse: collapse; font-size: 9px; }
            .print-table th, .print-table td { border: 1px solid #000 !important; padding: 2px 4px !important; color: black !important; }
            .print-table th { background-color: #B4C6E7 !important; font-weight: bold !important; text-align: center; }
            .print-table td { vertical-align: middle; }
            
            /* Legend Colors for Print */
            .bg-sky-400 { background-color: #38bdf8 !important; }
            .bg-white { background-color: white !important; }
            .bg-orange-400 { background-color: #fb923c !important; }
            .bg-emerald-300 { background-color: #6ee7b7 !important; }
            .bg-yellow-300 { background-color: #fde047 !important; }
            .bg-pink-300 { background-color: #f9a8d4 !important; }
            .bg-indigo-300 { background-color: #a5b4fc !important; }

            * { color: black !important; text-shadow: none !important; }
            .no-print { display: none !important; }
            `}
        </style>

        {/* Official Header (Print Only) */}
        <div className="hidden print:block text-black mb-4">
            <div className="text-center font-bold mb-4 uppercase text-sm leading-tight">
                JADWAL DINAS UNIT ELBAN<br/>
                BANDAR UDARA KAREL SADSUITUBUN - LANGGUR
            </div>
            
            <div className="w-full flex justify-between items-start text-[10px] font-bold leading-relaxed mb-2">
                <div className="flex-1">
                    <table className="w-auto border-none">
                        <tbody>
                            <tr>
                                <td className="w-[100px] border-none p-0">BANDAR UDARA</td>
                                <td className="w-[10px] border-none p-0">:</td>
                                <td className="border-none p-0 uppercase">KAREL SADSUITUBUN</td>
                            </tr>
                            <tr>
                                <td className="border-none p-0">BULAN / TAHUN</td>
                                <td className="border-none p-0">:</td>
                                <td className="border-none p-0 uppercase">{month.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex-1 flex flex-col items-end">
                    <table className="w-auto border-none">
                        <tbody>
                            <tr>
                                <td className="text-left w-[80px] border-none p-0">LEMBAR I</td>
                                <td className="text-center w-[10px] border-none p-0">:</td>
                                <td className="text-left w-[200px] border-none p-0">PENERBANGAN</td>
                            </tr>
                            <tr>
                                <td className="border-none p-0">LEMBAR II</td>
                                <td className="border-none p-0">:</td>
                                <td className="border-none p-0 uppercase">KANTOR OTORITAS BANDARA WIL. VIII</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Screen Header (Hidden on Print) */}
        <div className={`text-center font-bold mb-4 print:hidden ${isPrintMode ? '' : 'hidden'}`}>
             <h1 className="text-xl uppercase mb-1">JADWAL DINAS UNIT ELBAN</h1>
             <h2 className="text-sm uppercase">
                BULAN {month.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' }).toUpperCase()}
             </h2>
        </div>

        {/* Matrix Table */}
        <div className={`w-full overflow-x-auto overflow-y-hidden custom-scrollbar ${isPrintMode ? 'mb-8' : 'border border-white/20 rounded-2xl bg-[#0F172A] shadow-2xl mb-6 overflow-hidden'}`}>
            <table className={`w-full border-separate border-spacing-0 text-[10px] min-w-[800px] ${isPrintMode ? 'print-table !border-collapse' : ''}`}>
                <thead>
                    <tr>
                        <th rowSpan={2} className={`${isPrintMode ? 'print:static border border-black text-black' : 'sticky left-0 z-20 border-r border-b border-white/20 text-indigo-200 shadow-[3px_0_10px_rgba(0,0,0,0.4)]'} w-[150px] p-2 text-center uppercase`} style={{ backgroundColor: isPrintMode ? undefined : '#0F172A' }}>Nama</th>
                        <th colSpan={daysInMonth.length} className={`${isPrintMode ? 'border border-black text-black' : 'border-b border-r border-white/20 bg-slate-900/60 text-indigo-300'} p-1 text-center uppercase`}>Tanggal</th>
                    </tr>
                    <tr>
                        {daysInMonth.map(d => (
                            <th key={d} className={`border-b border-r ${isPrintMode ? 'border-black text-black text-[8px] border-t' : 'border-white/10 bg-slate-800/80 text-slate-400'} min-w-[20px] @laptop:min-w-[40px] w-10 text-center`}>{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matrixData.map((person) => (
                        <tr key={person.name} className={isPrintMode ? '' : 'hover:bg-white/5 transition-colors group/row text-slate-300 hover:text-white'}>
                            <td className={`${isPrintMode ? 'print:static border border-black text-black font-bold' : 'sticky left-0 z-10 border-r border-b border-white/20 text-white font-bold opacity-100 shadow-[3px_0_10px_rgba(0,0,0,0.4)]'} p-2 truncate text-center group-hover/row:bg-slate-800/80 transition-colors`} style={{ backgroundColor: isPrintMode ? undefined : '#0F172A' }}>
                                {person.name}
                            </td>
                            {daysInMonth.map(d => {
                                const cell = person.schedule[d];
                                return (
                                    <td 
                                        key={d} 
                                        className={`${isPrintMode ? `border border-black ${cell?.color || ''}` : 'border-b border-r border-white/10'} text-center font-bold p-0 h-8 @laptop:h-10 min-w-[20px] @laptop:min-w-[40px] w-10`}
                                    >
                                        <div className={`w-full h-full flex items-center justify-center ${!isPrintMode ? (cell?.color || 'text-slate-500') : ''} ${!isPrintMode && cell?.color ? 'shadow-inner' : ''} !text-black`}>
                                            {cell?.code || ''}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {matrixData.length === 0 && (
                        <tr>
                            <td colSpan={daysInMonth.length + 1} className="p-4 text-center italic text-gray-500">
                                Tidak ada data jadwal personel yang terdeteksi. Format kegiatan harus "Status - Nama".
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer Info Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 @tablet:grid-cols-2 gap-4 ${isPrintMode ? 'text-[10px] !grid-cols-2' : ''}`}>
            {/* Legend Section */}
            <div className={isPrintMode ? '' : 'bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl'}>
                <div className="flex items-center gap-2 mb-4">
                    <div className={`h-4 w-1 bg-indigo-500 rounded-full ${isPrintMode ? 'hidden' : ''}`}></div>
                    <h4 className={`font-bold uppercase tracking-wider ${isPrintMode ? 'text-black underline italic' : 'text-indigo-100'}`}>Keterangan :</h4>
                </div>
                <div className={`grid ${isPrintMode ? 'grid-cols-3' : 'grid-cols-1 @laptop:grid-cols-3'} gap-3`}>
                    {[
                        { code: 'P', color: 'bg-sky-400', label: 'Dinas Pagi' },
                        { code: 'PS', color: 'bg-white', label: 'Dinas Elban' },
                        { code: 'DL', color: 'bg-orange-400', label: 'Dinas Luar' },
                        { code: 'I', color: 'bg-emerald-300', label: 'Izin' },
                        { code: 'C', color: 'bg-yellow-300', label: 'Cuti' },
                        { code: 'S', color: 'bg-pink-300', label: 'Sakit' },
                        { code: 'TB', color: 'bg-indigo-300', label: 'Tugas Belajar' },
                    ].map((item) => (
                        <div key={item.code} className="flex items-center gap-3 group">
                            <span className={`font-bold w-6 h-6 rounded flex items-center justify-center ${item.color} border border-black/10 text-black text-[9px] shadow-sm group-hover:scale-110 transition-transform`}>
                                {item.code}
                            </span>
                            <span className={isPrintMode ? 'text-[9px]' : 'text-slate-300 font-medium'}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contacts Section */}
            <div className={isPrintMode ? '' : 'bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between'}>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`h-4 w-1 bg-cyan-500 rounded-full ${isPrintMode ? 'hidden' : ''}`}></div>
                        <h4 className={`font-bold uppercase tracking-wider ${isPrintMode ? 'text-black underline italic' : 'text-cyan-100'}`}>Kontak Personel :</h4>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {matrixData.map(p => (
                             <div key={p.name} className={`flex items-center justify-start ${isPrintMode ? 'py-0.5' : 'p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5'}`}>
                                 <div className={`${isPrintMode ? 'w-[200px]' : 'min-w-[150px] @laptop:min-w-[180px]'} shrink-0 flex flex-col justify-center`}>
                                     <span className={`uppercase font-bold text-[10px] ${isPrintMode ? 'text-black leading-none' : 'text-indigo-300'}`}>{p.name}</span>
                                     {!isPrintMode && <span className={`text-[9px] text-slate-500`}>{userMap[p.name] ? 'WhatsApp Active' : 'No Contact'}</span>}
                                 </div>
                                 <span className={`${isPrintMode ? 'text-black text-[10px] font-bold leading-none' : 'font-mono font-bold text-[11px] text-slate-200'}`}>
                                     {userMap[p.name] || '-'}
                                 </span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Signature Section - Moved back to bottom for clear separation */}
        <div className="hidden print:block mt-12 text-black text-[10px]">
            <div className="flex justify-end pr-12">
                <div className="text-center flex flex-col items-center">
                    <p className="mb-1 text-center w-full font-bold">Langgur, {(() => {
                        const d = new Date(); 
                        return `${new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()} ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
                    })()}</p>
                    <p className="font-bold">KANIT ELBAN</p>
                    <div className="h-16 w-32 my-1"></div>
                    <p className="font-bold underline leading-none">{kanitElban?.nama || "ROBBY AMSUN MATURBONGS"}</p>
                    <p className="font-bold">NIP. {kanitElban?.nip || "198712192007121000"}</p>
                </div>
            </div>
        </div>
    </div>
  );
}
