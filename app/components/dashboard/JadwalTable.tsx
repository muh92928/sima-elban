"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
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
  Pencil,
  MapPin,
  Clock
} from "lucide-react";
import { Jadwal } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";

interface JadwalTableProps {
  data: Jadwal[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: Jadwal) => void;
}

export default function JadwalTable({ 
  data, 
  loading, 
  onDelete,
  onEdit 
}: JadwalTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);


  // Columns Definitions
  const columns = useMemo<ColumnDef<Jadwal>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "nama_kegiatan",
        header: "Nama Kegiatan",
        cell: (info) => (
          <span className="font-bold text-indigo-300">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "tanggal",
        header: "Waktu Pelaksanaan",
        cell: (info) => {
            const date = new Date(info.getValue() as string).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            });
            const time = info.row.original.waktu;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-white">{date}</span>
                    <span className="text-xs text-slate-400">{time}</span>
                </div>
            );
        },
      },
      {
        accessorKey: "lokasi",
        header: "Lokasi",
        cell: (info) => (
            <div className="flex items-center justify-center gap-1.5 text-slate-300">
                <MapPin size={14} className="text-indigo-400" />
                <span>{info.getValue() as string}</span>
            </div>
        ),
      },
      {
        accessorKey: "keterangan",
        header: "Keterangan",
        cell: (info) => <span className="text-slate-400 italic text-xs">{info.getValue() as string || "-"}</span>,
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
                    title="Edit Jadwal"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus Jadwal"
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

  return (
    <>
      {/* Mobile Card Render */}
      <div className="flex flex-col gap-4 p-4 min-[820px]:hidden">
            {loading ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                    <span>Memuat jadwal...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada jadwal ditemukan.
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
                            <div className="space-y-1">
                                <h3 className="font-bold text-indigo-300 text-sm">{item.nama_kegiatan}</h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {item.waktu}
                                </p>
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
                             <div className="flex items-center gap-2 text-xs text-slate-300">
                                <MapPin size={14} className="text-indigo-400" />
                                {item.lokasi}
                             </div>
                             {item.keterangan && (
                                 <p className="text-xs text-slate-400 italic mt-1">{item.keterangan}</p>
                             )}
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
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                                    <span>Memuat jadwal...</span>
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Tidak ada jadwal ditemukan.
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
    </div>
    </>
  );
}
