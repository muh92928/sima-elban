"use client";

import { Jadwal, Akun } from "@/lib/types"; // Import Akun
import { useMemo } from "react";

interface JadwalMatrixPrintProps {
  data: Jadwal[];
  month: Date;
  kanitElban?: Akun | null;
  userMap?: Record<string, string>; // Name -> WA
}

export default function JadwalMatrixPrint({ data, month, kanitElban, userMap = {} }: JadwalMatrixPrintProps) {
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
                color = "bg-sky-200"; 
                break;
            case 'dinas elban':
            case 'standby elban':
                code = "PS";
                color = "bg-white"; 
                break;
            case 'dinas luar':
                code = "DL";
                color = "bg-orange-400";
                break;
            case 'izin':
                code = "I";
                color = "bg-emerald-300";
                break;
            case 'cuti':
                code = "C";
                color = "bg-yellow-300";
                break;
            case 'sakit':
                code = "S";
                color = "bg-pink-300";
                break;
            case 'tugas belajar':
                code = "TB";
                color = "bg-indigo-300";
                break;
            case 'libur':
                 code = "L";
                 color = "bg-red-500 text-white";
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
    <div className="w-full font-sans text-xs text-black">
        {/* Header Title */}
        <div className="text-center font-bold mb-4">
             <h1 className="text-xl uppercase mb-1">JADWAL DINAS UNIT ELBAN</h1>
             <h2 className="text-sm uppercase">
                BULAN {month.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' }).toUpperCase()}
             </h2>
        </div>

        {/* Matrix Table */}
        <div className="w-full overflow-hidden border border-black mb-4">
            <table className="w-full border-collapse text-[10px]">
                <thead>
                    <tr>
                        <th rowSpan={2} className="border border-black bg-cyan-200 w-[150px] p-2 text-left uppercase">Nama</th>
                        <th colSpan={daysInMonth.length} className="border border-black bg-cyan-200 p-1 text-center uppercase">Tanggal</th>
                    </tr>
                    <tr>
                        {daysInMonth.map(d => (
                            <th key={d} className="border border-black bg-slate-50 w-6 text-center">{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {matrixData.map((person) => (
                        <tr key={person.name}>
                            <td className="border border-black p-1 font-bold truncate">{person.name}</td>
                            {daysInMonth.map(d => {
                                const cell = person.schedule[d];
                                return (
                                    <td 
                                        key={d} 
                                        className={`border border-black text-center font-bold p-1 h-6 ${cell?.color || ''}`}
                                    >
                                        {cell?.code || ''}
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

        {/* Footer: Legend & Contacts */}
        <div className="flex justify-between items-start text-[10px]">
            {/* Legend */}
            <div>
                <h4 className="font-bold mb-1 underline italic">Keterangan:</h4>
                <div className="grid grid-cols-1 gap-1">
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-sky-200 text-center border border-black/50 px-1">P</span> <span>: Dinas Pagi</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 text-center border border-black/50 px-1">PS</span> <span>: Dinas Elban</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-orange-400 text-center border border-black/50 px-1">DL</span> <span>: Dinas Luar</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-emerald-300 text-center border border-black/50 px-1">I</span> <span>: Izin</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-yellow-300 text-center border border-black/50 px-1">C</span> <span>: Cuti</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-pink-300 text-center border border-black/50 px-1">S</span> <span>: Sakit</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold w-6 bg-indigo-300 text-center border border-black/50 px-1">TB</span> <span>: Tugas Belajar</span>
                     </div>
                </div>
            </div>

            {/* Contacts & Signatures */}
            <div className="flex gap-16">
                 {/* Contacts List */}
                 <div>
                    <h4 className="font-bold mb-1 invisible">Contact</h4>
                    <ul className="space-y-0.5">
                        {matrixData.map(p => (
                             <li key={p.name} className="flex gap-2">
                                 <span className="uppercase">{p.name}</span>
                                 <span>: {userMap[p.name] ? `${userMap[p.name]}` : '62 8xx-xxxx-xxxx'}</span>
                             </li>
                        ))}
                    </ul>
                 </div>

                 {/* Signature */}
                 <div className="text-center">
                      <p className="mb-4 font-bold">KANIT ELBAN</p>
                      
                      {/* Signature Image Placeholder/Spacer */}
                      <div className="h-12 w-full"></div> 

                      <p className="font-bold underline uppercase">{kanitElban?.nama || "BELUM ADA DATA"}</p>
                      <p>NIP. {kanitElban?.nip || "-"}</p>
                 </div>
            </div>
        </div>
    </div>
  );
}
