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
  Pencil
} from "lucide-react";
import { Tugas } from "@/lib/types";

interface TugasTableProps {
  data: Tugas[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: Tugas) => void;
}

const getPriorityColor = (prioritas: string) => {
    switch(prioritas) {
        case 'Tinggi': return 'bg-red-500/20 text-red-400 border-red-500/20';
        case 'Sedang': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'Selesai': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
        case 'Sedang Dikerjakan': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

export default function TugasTable({ 
  data, 
  loading, 
  onDelete,
  onEdit 
}: TugasTableProps) {
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
  const columns = useMemo<ColumnDef<Tugas>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "judul",
        header: "Judul Tugas",
        cell: (info) => (
          <div className="flex flex-col text-left">
            <span className="font-bold text-indigo-300">{info.getValue() as string}</span>
            <span className="text-xs text-slate-500">{new Date(info.row.original.desc).toLocaleDateString("id-ID") ? "" : ""}</span>
          </div>
        ),
      },
      {
        accessorKey: "deskripsi",
        header: "Deskripsi",
        cell: (info) => <span className="text-slate-300 whitespace-pre-wrap text-left text-xs line-clamp-2">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "prioritas",
        header: "Prioritas",
        cell: (info) => (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(info.getValue() as string)}`}>
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(info.getValue() as string)}`}>
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "tanggal",
        header: "Tenggat Waktu",
        cell: (info) => (
            <span className="text-slate-300 text-xs">
                {new Date(info.getValue() as string).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        ),
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
                    title="Edit Tugas"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus Tugas"
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
                    <span>Memuat tugas...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada tugas ditemukan.
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
                            <div className="space-y-1">
                                <div className="flex gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(item.prioritas)}`}>
                                        {item.prioritas}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-indigo-300 text-sm">{item.judul}</h3>
                                <p className="text-xs text-slate-400">
                                    Tenggat: {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
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
                             <p className="text-sm text-slate-200">{item.deskripsi}</p>
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
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative">
         <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left relative z-10 min-w-[1000px]">
                <thead className="text-xs uppercase bg-white/5 text-slate-300 font-bold tracking-wider">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    className="py-4 px-4 border-b border-white/10 bg-slate-900/30 text-center"
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
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                                    <span>Memuat tugas...</span>
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Tidak ada tugas ditemukan.
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
                                    <td key={cell.id} className="px-4 py-4 border-white/5 border-r last:border-r-0 break-words whitespace-normal text-xs lg:text-sm text-center align-top">
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
