"use client";

import React from "react";
import { Calendar, Search, Code, CheckCircle, FileText, ChevronRight } from "lucide-react";

const JadwalPenelitianView = () => {
    const timeline = [
        {
            month: "Oktober",
            phase: "PENGUMPULAN DATA & IDENTIFIKASI",
            icon: Search,
            color: "blue",
            activities: [
                "Observasi lapangan kondisi eksisting Unit ELBAN",
                "Studi dokumentasi arsip & administrasi unit",
                "Studi pustaka landasan teoretis",
                "Identifikasi kebutuhan sistem SIMA-ELBAN"
            ]
        },
        {
            month: "November",
            phase: "DESIGN & DEVELOPMENT",
            icon: Code,
            color: "emerald",
            activities: [
                "Perancangan & pembuatan basis data (Supabase)",
                "Pengembangan antarmuka pengguna (Frontend)",
                "Pengembangan sisi server (Backend)",
                "Deployment sistem ke lingkungan web (Vercel)"
            ]
        },
        {
            month: "Desember",
            phase: "VALIDATION & ITERATION",
            icon: CheckCircle,
            color: "amber",
            activities: [
                "Evaluasi sistem oleh pengguna (Teknisi & Kanit)",
                "Analisis umpan balik (Feedback) pengguna",
                "Perbaikan & penyempurnaan sistem",
                "Pengujian ulang hasil iterasi"
            ]
        },
        {
            month: "Januari",
            phase: "FINAL TESTING & REPORTING",
            icon: FileText,
            color: "indigo",
            activities: [
                "Pengujian akhir fungsi sistem secara menyeluruh",
                "Implementasi sistem SIMA-ELBAN di Unit ELBAN",
                "Penyusunan & penyelesaian laporan skripsi",
                "Finalisasi dokumentasi hasil penelitian"
            ]
        }
    ];

    return (
        <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center py-20 px-8">
            <div className="w-full max-w-5xl bg-white p-12 rounded-[2.5rem] border-2 border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between mb-12 border-b-2 border-slate-100 pb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                            Jadwal Pelaksanaan Penelitian
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Sistem Informasi Manajemen Unit Elektronika Bandara (SIMA-ELBAN)
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Durasi</p>
                            <p className="text-xl font-bold text-slate-800">4 Bulan</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block" />

                    {timeline.map((item, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center">
                            {/* Month Header */}
                            <div className={`mb-6 px-6 py-2 rounded-full border-2 bg-white font-black text-sm uppercase tracking-widest
                                ${item.color === 'blue' ? 'border-blue-500 text-blue-600 shadow-blue-100 shadow-lg' : 
                                  item.color === 'emerald' ? 'border-emerald-500 text-emerald-600 shadow-emerald-100 shadow-lg' : 
                                  item.color === 'amber' ? 'border-amber-500 text-amber-600 shadow-amber-100 shadow-lg' : 
                                  'border-indigo-500 text-indigo-600 shadow-indigo-100 shadow-lg'}`}>
                                {item.month}
                            </div>

                            {/* Main Card */}
                            <div className="w-full bg-slate-50/50 rounded-[2rem] p-6 border border-slate-200 hover:border-blue-400 transition-all hover:bg-white hover:shadow-xl group min-h-[300px]">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                                    ${item.color === 'blue' ? 'bg-blue-600 text-white' : 
                                      item.color === 'emerald' ? 'bg-emerald-600 text-white' : 
                                      item.color === 'amber' ? 'bg-amber-600 text-white' : 
                                      'bg-indigo-600 text-white'}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] mb-2 leading-tight">
                                    {item.phase}
                                </h3>

                                <div className="space-y-3">
                                    {item.activities.map((act, i) => (
                                        <div key={i} className="flex gap-2">
                                            <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 ${
                                                item.color === 'blue' ? 'text-blue-500' : 
                                                item.color === 'emerald' ? 'text-emerald-500' : 
                                                item.color === 'amber' ? 'text-amber-500' : 
                                                'text-indigo-500'
                                            }`} />
                                            <p className="text-[11px] font-semibold text-slate-600 leading-normal">
                                                {act}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-[11px] text-slate-500 font-medium italic text-center">
                        * Penelitian dilaksanakan secara iteratif dan bertahap menggunakan model Evolutionary Prototyping (R&D).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JadwalPenelitianView;
