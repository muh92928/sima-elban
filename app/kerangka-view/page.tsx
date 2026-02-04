"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

const KerangkaScreenshot = () => {
  const steps = [
    { 
      tag: "KONDISI EKSISTING", 
      text: "Pengelolaan aktivitas Unit ELBAN masih manual dan belum terintegrasi", 
      type: "terminator"
    },
    { 
      tag: "PERMASALAHAN", 
      text: "Belum tersedianya sistem informasi manajemen unit yang terintegrasi dan terdokumentasi", 
      type: "process"
    },
    { 
      tag: "SOLUSI", 
      text: "Pengembangan Sistem Informasi Manajemen Unit Elektronika Bandara (SIMA-ELBAN) berbasis web", 
      type: "process"
    },
    { 
      tag: "METODE PENELITIAN", 
      text: "Research and Development (R&D)", 
      type: "process"
    },
    { 
      tag: "MODEL PENGEMBANGAN", 
      text: "Evolutionary Prototyping", 
      type: "process"
    },
    { 
      tag: "PROSES PENGEMBANGAN SISTEM", 
      text: "Analisis → Prototipe → Validasi → Iterasi", 
      type: "process"
    },
    { 
      tag: "OUTPUT SISTEM", 
      text: "SIMA-ELBAN berbasis web yang terintegrasi dan siap digunakan", 
      type: "input"
    },
    { 
      tag: "HASIL YANG DIHARAPKAN", 
      text: "Pengelolaan aktivitas Unit ELBAN lebih terintegrasi dan terdokumentasi", 
      type: "terminator"
    }
  ];

  const getShapeClass = (type: string) => {
    switch(type) {
      case 'terminator': return "rounded-full border-blue-500 bg-blue-50";
      case 'input': return "skew-x-[-12deg] border-blue-500 bg-blue-50/50";
      case 'process': return "border-slate-300 bg-white shadow-sm";
      default: return "border-slate-300 bg-white";
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 flex items-center justify-center py-20 px-8">
      {/* Container Card */}
      <div className="w-full max-w-3xl bg-white p-16 rounded-[2rem] shadow-xl flex flex-col items-center">
        <h1 className="text-3xl font-black text-slate-800 mb-14 tracking-widest text-center uppercase border-b-4 border-blue-500 pb-2">
          KERANGKA PEMIKIRAN PENELITIAN
        </h1>

        <div className="flex flex-col items-center gap-4 w-full">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`relative flex items-center justify-center w-full min-h-[70px] border-2 transition-all ${getShapeClass(step.type)}`}>
                {/* Text Content */}
                <div className={`${step.type === 'input' ? 'skew-x-[12deg]' : ''} py-3 px-10 text-center`}>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{step.tag}</p>
                  <p className="text-sm font-bold text-slate-700 max-w-md">({step.text})</p>
                </div>
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex flex-col items-center py-1">
                    <ArrowDown className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KerangkaScreenshot;
