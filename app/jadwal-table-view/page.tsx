"use client";

import React from "react";

const JadwalTablePenelitian = () => {
  const data = [
    { activity: "1. Observasi lapangan kondisi eksisting Unit ELBAN", months: [true, false, false, false] },
    { activity: "2. Studi dokumentasi arsip & administrasi unit", months: [true, false, false, false] },
    { activity: "3. Studi pustaka landasan teoretis", months: [true, false, false, false] },
    { activity: "4. Identifikasi kebutuhan sistem SIMA-ELBAN", months: [true, false, false, false] },
    
    { activity: "5. Perancangan & pembuatan basis data (Supabase)", months: [false, true, false, false] },
    { activity: "6. Pembuatan tampilan antarmuka (Frontend)", months: [false, true, false, false] },
    { activity: "7. Pembuatan sisi server (Backend)", months: [false, true, false, false] },
    { activity: "8. Proses Deployment sistem", months: [false, true, false, false] },
    
    { activity: "9. Evaluasi sistem oleh teknisi & Kanit ELBAN", months: [false, false, true, false] },
    { activity: "10. Analisis umpan balik (Feedback) pengguna", months: [false, false, true, false] },
    { activity: "11. Perbaikan sistem berdasarkan hasil evaluasi", months: [false, false, true, false] },
    { activity: "12. Pengujian ulang (Validasi Iterasi)", months: [false, false, true, false] },
    
    { activity: "13. Pengujian akhir fungsional sistem (Black Box)", months: [false, false, false, true] },
    { activity: "14. Implementasi sistem di lingkungan Unit ELBAN", months: [false, false, false, true] },
    { activity: "15. Penyusunan & penyelesaian skripsi penelitian", months: [false, false, false, true] },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center py-20 px-8">
      <div className="w-full max-w-5xl bg-white p-12 rounded-[2rem] border-2 border-slate-200 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            JADWAL PELAKSANAAN PENELITIAN
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-300 shadow-md">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th rowSpan={2} className="p-4 border border-slate-700 text-left uppercase tracking-wider text-xs font-black">Kegiatan Penelitian</th>
                <th colSpan={4} className="p-2 border border-slate-700 text-center uppercase tracking-wider text-[10px] font-black">OKTOBER</th>
                <th colSpan={4} className="p-2 border border-slate-700 text-center uppercase tracking-wider text-[10px] font-black">NOVEMBER</th>
                <th colSpan={4} className="p-2 border border-slate-700 text-center uppercase tracking-wider text-[10px] font-black">DESEMBER</th>
                <th colSpan={4} className="p-2 border border-slate-700 text-center uppercase tracking-wider text-[10px] font-black">JANUARI</th>
              </tr>
              <tr className="bg-slate-800 text-white">
                {[...Array(16)].map((_, i) => (
                  <th key={i} className="p-1 border border-slate-700 text-center text-[8px] font-bold w-8">
                    M{(i % 4) + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 border border-slate-200 text-[11px] text-slate-700 font-medium">
                    {row.activity}
                  </td>
                  {[...Array(16)].map((_, wIdx) => {
                    const monthIdx = Math.floor(wIdx / 4);
                    const weekInMonth = wIdx % 4;
                    // Continuous staggering logic: 15 activities across 16 weeks
                    // Each activity gets 1-2 weeks. To keep it simple: activity idx matches week wIdx
                    const shouldMark = idx === wIdx || (idx === 14 && (wIdx === 14 || wIdx === 15));

                    return (
                      <td key={wIdx} className="p-0.5 border border-slate-200 text-center w-8">
                        {shouldMark && (
                          <div className={`h-5 w-full rounded-sm shadow-sm ${
                            monthIdx === 0 ? "bg-blue-500" : 
                            monthIdx === 1 ? "bg-emerald-500" : 
                            monthIdx === 2 ? "bg-amber-500" : 
                            "bg-indigo-500"
                          }`} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-center text-[11px] text-slate-400 font-medium italic">
          <p>* Jadwal disesuaikan dengan metodologi Evolutionary Prototyping.</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /> Persiapan</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> Development</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /> Iterasi</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded" /> Finalisasi</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalTablePenelitian;
