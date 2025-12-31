"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  Search
} from "lucide-react";
import { Peralatan } from "@/lib/types";

interface PeralatanTableProps {
  data: Peralatan[];
  loading: boolean;
  onEdit: (item: Peralatan) => void;
  onDelete: (id: number) => void;
}

export default function PeralatanTable({ 
  data, 
  loading, 
  onEdit, 
  onDelete 
}: PeralatanTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check Mobile View
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Columns Definitions
  const columns = useMemo<ColumnDef<Peralatan>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "nama",
        header: "Nama Peralatan",
        cell: (info) => (
          <span className="font-medium text-white group-hover:text-blue-200 transition-colors">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "jenis",
        header: "Jenis Peralatan",
        cell: (info) => <span className="text-slate-300">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "merk",
        header: "Merk / Tipe / S.N",
        cell: (info) => (
          <span className="text-slate-400 font-mono text-xs">
            {info.getValue() as string || "-"}
          </span>
        ),
      },
      {
        accessorKey: "no_sertifikat",
        header: "No Sertifikat",
        cell: (info) => {
          const val = info.getValue() as string;
          return val && val !== "-" ? (
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold print:bg-transparent print:text-black print:border-none">
              {val}
            </span>
          ) : (
            <span className="text-slate-500 print:text-black">-</span>
          );
        },
      },
      {
        accessorKey: "tahun_instalasi",
        header: "Tahun Instalasi",
        cell: (info) => (
          <span className="text-center block text-slate-400">
            {info.getValue() as number || "-"}
          </span>
        ),
      },
      {
        accessorKey: "kondisi_persen",
        header: "Kondisi",
        cell: (info) => {
           const val = info.getValue() as number || 0;
           let color = "text-red-400";
           if (val >= 90) color = "text-emerald-400";
           else if (val >= 70) color = "text-amber-400";
           
           return <span className={`font-bold ${color}`}>{val}%</span>;
        }
      },
      {
        accessorKey: "status_laik",
        header: "Status Laik",
        cell: (info) => {
            const val = info.getValue() as string;
            const isLaik = val !== "TIDAK LAIK OPERASI";
            return (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    !isLaik
                    ? "bg-red-500/10 border-red-500/20 text-red-400 print:bg-transparent print:text-black print:border-none print:p-0" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black print:border-none print:p-0"
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full print:hidden ${
                         !isLaik ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                    }`} />
                    <span className="text-[10px] font-bold tracking-wide uppercase">
                        {val || "UNKNOWN"}
                    </span>
              </div>
            );
        }
      },
      {
        accessorKey: "keterangan",
        header: "Keterangan",
        cell: (info) => (
            <span className="text-slate-400 text-xs italic">
                {info.getValue() as string || "-"}
            </span>
        )
      },
      {
        id: "aksi",
        header: "Aksi",
        enableSorting: false,
        cell: (info) => (
            <div className="flex items-center justify-center gap-2">
                <button 
                    onClick={() => onEdit(info.row.original)}
                    className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        )
      }
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Mobile Card Render (Visible < MD, Hidden >= MD, Hidden on Print) */}
      <div className="flex flex-col gap-4 p-4 md:hidden print:hidden">
            {loading ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                    <span>Memuat data...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada data ditemukan.
                </div>
            ) : (
                data.map((item) => {
                    const isLaik = item.status_laik !== "TIDAK LAIK OPERASI";
                    const statusColor = isLaik ? "emerald" : "red";
                    const statusText = isLaik ? "LAIK OPERASI" : "TIDAK LAIK";
                    const kondisi = item.kondisi_persen || 0;

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={item.id}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-lg group"
                        >   
                            {/* Status Indicator Line */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full bg-${statusColor}-500`} />
                            
                            <div className="pl-3 flex flex-col gap-4">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white text-lg tracking-tight leading-snug mb-1">{item.nama}</h3>
                                        
                                        {/* Type Badge */}
                                        <div className="mb-1.5">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider">
                                                {item.jenis}
                                            </span>
                                        </div>

                                        {/* Merk / SN */}
                                        {item.merk && (
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                                {item.merk}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Status Chip */}
                                    <div className={`px-2.5 py-1 rounded-lg border ${
                                        isLaik
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}>
                                        <span className="text-[10px] font-bold tracking-wide uppercase">{statusText}</span>
                                    </div>
                                </div>
                                
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/5 border-b border-white/5 border-dashed">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Sertifikat</p>
                                        <p className="text-sm text-slate-300 font-mono">{item.no_sertifikat || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Instalasi</p>
                                        <p className="text-sm text-slate-300 font-mono">{item.tahun_instalasi || "-"}</p>
                                    </div>
                                </div>

                                {/* Keterangan */}
                                <div className="py-2 border-b border-white/5 border-dashed">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Keterangan</p>
                                    <p className="text-sm text-slate-400 italic leading-relaxed">
                                        {item.keterangan || "-"}
                                    </p>
                                </div>

                                {/* Kondisi & Actions */}
                                <div className="flex items-end justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kondisi Alat</p>
                                            <span className={`text-xs font-bold ${loading ? 'text-slate-500' : isLaik ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {kondisi}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    kondisi >= 90 ? "bg-emerald-500" : 
                                                    kondisi >= 70 ? "bg-amber-500" : "bg-red-500"
                                                }`}
                                                style={{ width: `${kondisi}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                                        <button 
                                            onClick={() => onEdit(item)} 
                                            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)} 
                                            className="p-2.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 border border-white/10 text-slate-400 rounded-xl active:scale-95 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            )}
      </div>

      {/* Desktop Table Render (Hidden < MD, Visible >= MD, Visible on Print) */}
      <div className="hidden md:block print:block rounded-2xl bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible">

          <div className="hidden md:block overflow-x-auto print:block print:overflow-visible custom-scrollbar">
             <table className="w-full text-sm text-center relative z-10 print:text-black print-table min-w-[1200px]">
                 <thead className="text-xs uppercase bg-slate-900/30 text-slate-300 font-bold tracking-wider print:bg-[#B4C6E7] print:text-black">
                     {table.getHeaderGroups().map(headerGroup => (
                         <tr key={headerGroup.id}>
                             {headerGroup.headers.map(header => (
                                 <th 
                                     key={header.id} 
                                     className={`px-6 py-4 border-b border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7] ${
                                         header.id === 'index' ? 'w-[60px] px-4 text-center' :
                                         header.id === 'nama' ? 'min-w-[200px] px-4 text-center' :
                                         header.id === 'jenis' ? 'min-w-[150px] px-4 text-center' :
                                         header.id === 'merk' ? 'min-w-[180px] px-4 text-center' :
                                         header.id === 'no_sertifikat' ? 'min-w-[140px] px-4 text-center' :
                                         header.id === 'tahun_instalasi' ? 'min-w-[100px] px-4 text-center' :
                                         header.id === 'kondisi_persen' ? 'min-w-[80px] px-4 text-center' :
                                         header.id === 'status_laik' ? 'min-w-[160px] px-4 text-center' :
                                         header.id === 'keterangan' ? 'min-w-[150px] px-4 text-center' :
                                         'px-6 py-4 text-center'
                                     }`}
                                     onClick={header.column.getToggleSortingHandler()}
                                 >
                                    <div className={`flex items-center gap-1 justify-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''}`}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {/* Sort Icons */}
                                        {{
                                            asc: <ChevronUp size={12} />,
                                            desc: <ChevronDown size={12} />,
                                        }[header.column.getIsSorted() as string] ?? (
                                            header.column.getCanSort() ? <ChevronsUpDown size={12} className="text-slate-600" /> : null
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                                    <span>Memuat data peralatan...</span>
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Tidak ada data ditemukan.
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <motion.tr 
                                key={row.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-white/5 transition-colors group print:text-black print:bg-white"
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 border-white/5 print:text-black print:border-black break-words whitespace-normal text-xs lg:text-sm text-center align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
         <div className="h-2 bg-gradient-to-t from-black/20 to-transparent print:hidden" />
      </div>
    </>
  );
}
