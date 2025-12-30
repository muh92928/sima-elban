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
import { motion } from "framer-motion";
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Pencil
} from "lucide-react";
import { LogPeralatan } from "@/lib/types";

interface LogPeralatanTableProps {
  data: LogPeralatan[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: LogPeralatan) => void;
}

export default function LogPeralatanTable({ 
  data, 
  loading, 
  onDelete,
  onEdit 
}: LogPeralatanTableProps) {
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
  const columns = useMemo<ColumnDef<LogPeralatan>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "tanggal",
        header: "Tanggal / Jam",
        cell: (info) => {
            const date = new Date(info.getValue() as string).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            });
            const time = info.row.original.jam;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-white">{date}</span>
                    <span className="text-xs text-slate-400">{time}</span>
                </div>
            );
        },
      },
      {
        accessorKey: "peralatan.nama",
        header: "Nama Peralatan",
        cell: (info) => (
          <span className="font-medium text-indigo-300">
            {info.getValue() as string || "-"}
          </span>
        ),
      },
      {
        accessorKey: "kegiatan",
        header: "Kegiatan",
        cell: (info) => <span className="text-slate-300 whitespace-pre-wrap text-left">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "dokumentasi",
        header: "Dokumentasi",
        cell: (info) => {
            const url = info.getValue() as string;
            if (!url) return <span className="text-slate-500 text-xs">-</span>;
            return (
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors border border-indigo-500/20"
                >
                    <ImageIcon size={14} />
                    Lihat Foto
                </a>
            );
        },
      },
      {
        accessorKey: "keterangan",
        header: "Keterangan",
        cell: (info) => <span className="text-slate-400 italic text-xs">{info.getValue() as string || "-"}</span>,
      },
      {
        accessorKey: "pic",
        header: "PIC",
        cell: (info) => (
          <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 text-xs text-slate-300">
            {info.getValue() as string}
          </span>
        ),
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
                    title="Edit Log"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus Log"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        )
      }
    ],
    [onDelete, onEdit]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Mobile Card Render
  if (isMobile) {
    return (
        <div className="flex flex-col gap-4 p-4">
            {loading ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                    <span>Memuat log...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada log ditemukan.
                </div>
            ) : (
                data.map((item) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 p-4"
                    >   
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">
                                    {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {item.jam}
                                </p>
                                <h3 className="font-bold text-indigo-300 text-sm">{item.peralatan?.nama || "Unknown Device"}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onEdit(item)}
                                    className="p-2 text-indigo-400 bg-indigo-500/10 rounded-lg"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={() => onDelete(item.id)} 
                                    className="p-2 text-red-400 bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="py-2 border-t border-white/5 border-dashed space-y-2">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kegiatan</p>
                                <p className="text-sm text-slate-200">{item.kegiatan}</p>
                            </div>
                            
                            {item.dokumentasi && (
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Dokumentasi</p>
                                    <a 
                                        href={item.dokumentasi}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-indigo-400 text-xs hover:underline"
                                    >
                                        <ExternalLink size={12} />
                                        Lihat Foto Bukti
                                    </a>
                                </div>
                            )}

                            {item.keterangan && (
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Keterangan</p>
                                    <p className="text-xs text-slate-400 italic">{item.keterangan}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">PIC:</span>
                                <span className="text-xs text-white bg-slate-800 px-2 py-0.5 rounded">{item.pic}</span>
                             </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
  }

  // Desktop Table Render
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:overflow-visible">
         <div className="hidden md:block overflow-x-auto print:block print:overflow-visible custom-scrollbar">
            <table className="w-full text-sm text-left relative z-10 print:text-black print-table min-w-[1000px]">
                <thead className="text-xs uppercase bg-white/5 text-slate-300 font-bold tracking-wider print:bg-[#B4C6E7] print:text-black">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    className="py-4 px-4 border-b border-white/10 bg-slate-900/30 print:!bg-[#B4C6E7] text-center"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className={`flex items-center gap-1 justify-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''}`}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                                    <span>Memuat log...</span>
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Tidak ada log ditemukan.
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
                                    <td key={cell.id} className="px-4 py-4 border-white/5 print:text-black print:border-black border-r last:border-r-0 break-words whitespace-normal text-xs lg:text-sm text-center align-top">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
    </div>
  );
}
