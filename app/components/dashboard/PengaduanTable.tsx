"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  Pencil,
  MapPin,
  ExternalLink,
  ImageIcon
} from "lucide-react";
import { Pengaduan } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";
import TablePagination from "./TablePagination";

interface PengaduanTableProps {
  data: Pengaduan[];
  onDelete: (id: number) => void;
  onEdit: (item: Pengaduan) => void;
}

export default function PengaduanTable({ 
  data, 
  onDelete,
  onEdit 
}: PengaduanTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);


  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Selesai': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
          case 'Diproses': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
          case 'Baru': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
          default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      }
  };

  // Columns Definitions
  const columns = useMemo<ColumnDef<Pengaduan>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "peralatan.nama", // Access nested data
        header: "Peralatan",
        cell: (info) => (
          <div className="flex flex-col text-left">
              <span className="font-bold text-white text-sm line-clamp-2">
                  {info.getValue() as string || "Peralatan Tidak Diketahui"}
              </span>
          </div>
        ),
      },
      {
        header: "Nama Pengadu",
        id: "pengadu", // Custom ID since we access multiple fields
        accessorFn: (row) => row.akun?.nama || row.pelapor || "Unknown",
        cell: (info) => (
            <div className="flex flex-col">
              <span className="text-slate-300 text-xs font-semibold text-left">{info.getValue() as string}</span>
            </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <div className="flex justify-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(info.getValue() as string)}`}>
                {info.getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "dokumentasi",
        header: "Bukti Pengadu",
        cell: (info) => {
            const url = info.getValue() as string;
            return url ? (
                <div className="flex justify-center">
                    <a 
                        href={url} 
                        target="_blank" 
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-indigo-400 hover:text-white hover:bg-slate-700 transition-colors text-xs border border-white/5"
                    >
                        <ImageIcon size={14} /> Lihat
                        <ExternalLink size={10} />
                    </a>
                </div>
            ) : <span className="text-slate-600 text-xs">-</span>;
        },
      },
      {
        accessorKey: "bukti_petugas", // New Column
        header: "Bukti Petugas",
        cell: (info) => {
            const url = info.getValue() as string;
            return url ? (
                <div className="flex justify-center">
                    <a 
                        href={url} 
                        target="_blank" 
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-emerald-400 hover:text-white hover:bg-slate-700 transition-colors text-xs border border-white/5"
                    >
                        <ImageIcon size={14} /> Lihat
                        <ExternalLink size={10} />
                    </a>
                </div>
            ) : <span className="text-slate-600 text-xs italic">Belum ada</span>;
        },
      },
      {
        accessorKey: "created_at",
        header: "Tanggal",
        cell: (info) => (
             <span className="text-slate-400 text-xs text-center block">
                 {new Date(info.getValue() as string).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                 })}
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
                    title="Proses / Edit"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus"
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination: { pageSize: 10 }
    }
  });

  return (
    <>
      {/* Mobile Card Render */}
      <div className="flex flex-col gap-4 p-4 min-[820px]:hidden">
            {data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Belum ada pengaduan.
                </div>
            ) : (
                data.map((item) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        className={TABLE_STYLES.MOBILE_CARD}
                    >   
                        <div className={TABLE_STYLES.MOBILE_CARD_HEADER}>
                            <div>
                                <h3 className="font-bold text-white text-sm line-clamp-1">{item.peralatan?.nama || "Peralatan Tidak Diketahui"}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <span className="text-indigo-300 font-medium">{item.pelapor}</span>
                                    <span>•</span>
                                    <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                                </div>
                            </div>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                        </div>
                        
                        <div className="py-2 border-t border-white/5 border-dashed space-y-2">
                             <p className="text-xs text-slate-300 line-clamp-3">{item.deskripsi}</p>
                        </div>

                        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                            {item.dokumentasi ? (
                                <a href={item.dokumentasi} target="_blank" className="text-xs text-indigo-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                                    <ImageIcon size={14} /> Lihat Bukti
                                </a>
                            ) : (
                                <span className="text-xs text-slate-600 font-medium">-</span>
                            )}

                            <div className="flex items-center gap-2">
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
                        </div>
                    </motion.div>
                ))
            )}
      </div>

      {/* Desktop Table Render */}
    <div className={TABLE_STYLES.CONTAINER}>
         <div className={TABLE_STYLES.WRAPPER}>
            <table className={TABLE_STYLES.TABLE}>
                <thead className={TABLE_STYLES.THEAD}>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    className={TABLE_STYLES.TH}
                                >
                                    <div className={`flex items-center gap-1 justify-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''}`}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-white/5">
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Belum ada pengaduan.
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <motion.tr 
                                key={row.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-white/5 transition-colors group"
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
         <TablePagination table={table} />
    </div>
    </>
  );
}
