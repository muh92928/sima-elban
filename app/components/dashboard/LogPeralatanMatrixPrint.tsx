"use client";

import { LogPeralatan, Peralatan } from "@/lib/types";
import { useMemo } from "react";

interface LogPeralatanMatrixPrintProps {
  logs: LogPeralatan[];
  peralatanList: Peralatan[];
  reportDate: Date;
}

export default function LogPeralatanMatrixPrint({ logs, peralatanList, reportDate }: LogPeralatanMatrixPrintProps) {
  const monthDays = useMemo(() => {
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [reportDate]);

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  const aggregatedData = useMemo(() => {
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth();

    return peralatanList.map((p) => {
      // Filter logs for this specific equipment in the targeted month/year
      const equipmentLogs = logs.filter((l) => {
        const logDate = new Date(l.tanggal);
        return l.peralatan_id === p.id && 
               logDate.getFullYear() === year && 
               logDate.getMonth() === month;
      });

      // Daily status map
      const dailyStatus: Record<number, 'O' | 'X'> = {};
      daysArray.forEach(day => {
        // If there's any log for this day that says 'Normal Ops', mark as O
        // Otherwise, if there's a log but not normal, or no log at all, we'll mark as X?
        // User said: "hijau itu ada alatnya normal dan dalam sehari pernah nyala normal"
        // "merah maka alatnya dalam sehari ga pernah nyala"
        const logsOnDay = equipmentLogs.filter(l => new Date(l.tanggal).getDate() === day);
        
        if (logsOnDay.length > 0) {
            const hasNormal = logsOnDay.some(l => l.status === 'Normal Ops');
            dailyStatus[day] = hasNormal ? 'O' : 'X';
        } else {
            // No log data for this day - standard practice is often X if no record of operation
            // or perhaps based on general equipment state. Let's default to X for safety.
            dailyStatus[day] = 'X';
        }
      });

      // Totals
      const waktuOperasiDiterapkan = equipmentLogs.reduce((acc, l) => acc + (l.waktu_operasi_diterapkan || 0), 0);
      const mematikanTerjadwal = equipmentLogs.reduce((acc, l) => acc + (l.mematikan_terjadwal || 0), 0);
      const periodeKegagalan = equipmentLogs.reduce((acc, l) => acc + (l.periode_kegagalan || 0), 0);

      // Latest description or summary
      const latestLog = equipmentLogs[equipmentLogs.length - 1];
      const keterangan = latestLog ? (latestLog.status === 'Normal Ops' ? 'Normal OPS' : latestLog.keterangan || latestLog.status) : '-';

      return {
        ...p,
        dailyStatus,
        waktuOperasiDiterapkan,
        mematikanTerjadwal,
        periodeKegagalan,
        keterangan
      };
    });
  }, [logs, peralatanList, reportDate, daysArray]);

  return (
    <div className="print-matrix-container w-full overflow-x-auto">
      <table className="print-table w-full border-collapse border border-black text-[9px]">
        <thead>
          <tr className="bg-blue-100">
            <th rowSpan={2} className="border border-black p-1 text-center w-8">NO.</th>
            <th rowSpan={2} className="border border-black p-1 text-center">NAMA PERALATAN</th>
            <th colSpan={31} className="border border-black p-0.5 text-center">TANGGAL</th>
            <th rowSpan={2} className="border border-black p-1 text-center w-16">WAKTU OPERASI YANG DITERAPKAN (JAM)</th>
            <th colSpan={2} className="border border-black p-1 text-center">WAKTU TIDAK BEROPERASI (JAM)</th>
            <th rowSpan={2} className="border border-black p-1 text-center min-w-[100px]">KETERANGAN</th>
          </tr>
          <tr className="bg-blue-100">
            {daysArray.map(day => (
              <th key={day} className="border border-black p-0.5 text-center w-4 h-6">{day}</th>
            ))}
            <th className="border border-black p-1 text-center text-[8px] w-12">PERIODE MEMATIKAN YANG DIJADWALKAN (JAM)</th>
            <th className="border border-black p-1 text-center text-[8px] w-12">PERIODE KEGAGALAN (JAM)</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedData.map((item, idx) => (
            <tr key={item.id}>
              <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-black p-1 font-medium">{item.nama} / {item.merk}</td>
              {daysArray.map(day => {
                const status = item.dailyStatus[day];
                const isDayInMonth = day <= monthDays;
                
                if (!isDayInMonth) {
                    return <td key={day} className="border border-black p-0 bg-gray-200"></td>;
                }

                return (
                  <td 
                    key={day} 
                    className={`border border-black p-0 text-center font-bold text-[10px] h-6 ${
                      status === 'O' ? 'bg-green-500 text-black' : 'bg-red-600 text-black'
                    }`}
                  >
                    {status}
                  </td>
                );
              })}
              <td className="border border-black p-1 text-center font-bold">{item.waktuOperasiDiterapkan}</td>
              <td className="border border-black p-1 text-center">{item.mematikanTerjadwal}</td>
              <td className="border border-black p-1 text-center">{item.periodeKegagalan}</td>
              <td className="border border-black p-1 text-xs">{item.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .print-table th {
            background-color: #B4C6E7 !important;
            -webkit-print-color-adjust: exact;
        }
        .bg-green-500 {
            background-color: #00B050 !important;
            -webkit-print-color-adjust: exact;
        }
        .bg-red-600 {
            background-color: #FF0000 !important;
            -webkit-print-color-adjust: exact;
        }
        @media print {
            .print-table {
                width: 100% !important;
                border-collapse: collapse !important;
            }
            .print-table th, .print-table td {
                border: 0.5pt solid black !important;
            }
        }
      `}</style>
    </div>
  );
}
