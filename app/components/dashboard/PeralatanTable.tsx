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
import { TABLE_STYLES } from "@/lib/tableStyles";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

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
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
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
      <div className="flex flex-col gap-4 p-4 min-[820px]:hidden print:hidden">
             {loading ? (
                 <LoadingSpinner label="Memuat peralatan..." />
             ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada data ditemukan.
                </div>
            ) : (
                data.map((item) => {
                    const isLaik = item.status_laik !== "TIDAK LAIK OPERASI";
                    const statusText = isLaik ? "LAIK OPERASI" : "TIDAK LAIK";
                    const kondisi = item.kondisi_persen || 0;

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={item.id}
                            className={TABLE_STYLES.MOBILE_CARD}
                        >   
                            <div className={TABLE_STYLES.MOBILE_CARD_HEADER}>
                                <div>
                                    <h3 className="font-bold text-white text-sm line-clamp-1">{item.nama}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <span className="text-indigo-300 font-medium">{item.jenis}</span>
                                        {item.merk && (
                                            <>
                                                <span>•</span>
                                                <span>{item.merk}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    isLaik
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                    {statusText}
                                </span>
                            </div>
                                
                            <div className="py-2 border-t border-white/5 border-dashed grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Sertifikat</p>
                                    <p className="text-slate-300 font-mono">{item.no_sertifikat || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Instalasi</p>
                                    <p className="text-slate-300 font-mono">{item.tahun_instalasi || "-"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Kondisi</p>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
                                        <div 
                                        className={`h-1.5 rounded-full ${
                                            kondisi >= 90 ? "bg-emerald-500" : 
                                            kondisi >= 70 ? "bg-amber-500" : "bg-red-500"
                                        }`} 
                                        style={{ width: `${kondisi}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-slate-400">{kondisi}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => onEdit(item)}
                                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button 
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })
            )}
      </div>

      {/* Desktop Table Render (Hidden < MD, Visible >= MD, Visible on Print) */}
      <div className={TABLE_STYLES.CONTAINER}>

          <div className={TABLE_STYLES.WRAPPER}>
             <table className={TABLE_STYLES.TABLE}>
                 <thead className={TABLE_STYLES.THEAD}>
                     {table.getHeaderGroups().map(headerGroup => (
                         <tr key={headerGroup.id}>
                             {headerGroup.headers.map(header => (
                                 <th 
                                     key={header.id} 
                                    className={`${TABLE_STYLES.TH} ${
                                        header.id === 'index' ? 'w-[60px]' :
                                        header.id === 'nama' ? 'min-w-[200px]' :
                                        header.id === 'jenis' ? 'min-w-[150px]' :
                                        header.id === 'merk' ? 'min-w-[180px]' :
                                        header.id === 'no_sertifikat' ? 'min-w-[140px]' :
                                        header.id === 'tahun_instalasi' ? 'min-w-[100px]' :
                                        header.id === 'kondisi_persen' ? 'min-w-[80px]' :
                                        header.id === 'status_laik' ? 'min-w-[160px]' :
                                        header.id === 'keterangan' ? 'min-w-[150px]' :
                                        ''
                                    }`}
                                 >
                                    <div className={`flex items-center gap-1 justify-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''}`}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
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
                            <td colSpan={columns.length} className="p-0">
                                <LoadingSpinner label="Memuat peralatan..." />
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
                                    <td key={cell.id} className={TABLE_STYLES.TD}>
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
