"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  Pencil,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { LogPeralatan } from "@/lib/types";

interface LogPeralatanTableProps {
  data: LogPeralatan[];
  loading: boolean;
  onEdit: (log: LogPeralatan) => void;
  onDelete: (id: number) => void;
}

const getStatusColor = (status: string) => {
    switch(status) {
        case 'Normal Ops': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
        case 'Perlu Perbaikan': return 'bg-red-500/20 text-red-400 border-red-500/20';
        case 'Perlu Perawatan': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

export default function LogPeralatanTable({ data, loading, onEdit, onDelete }: LogPeralatanTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  /* Removed isMobile state to fix hydration error */

  const columns = useMemo<ColumnDef<LogPeralatan>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        maxSize: 60,
      },
      {
        accessorKey: "peralatan.nama", // Access nested data
        header: "Peralatan",
        cell: (info) => (
            <div className="flex flex-col text-left">
                <span className="font-bold text-white text-xs">{info.row.original.peralatan?.nama || `Peralatan #${info.row.original.peralatan_id}`}</span>
                <span className="text-[10px] text-slate-400">
                    {info.row.original.peralatan?.jenis} 
                    {info.row.original.peralatan?.merk ? ` • ${info.row.original.peralatan?.merk}` : ''}
                </span>
            </div>
        ),
      },
      {
        accessorKey: "tanggal",
        header: "Tanggal",
        cell: (info) => (
            <span className="text-slate-300 text-xs">
                {new Date(info.getValue() as string).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        ),
      },
      {
        accessorKey: "waktu_operasi_aktual",
        header: "Waktu Operasi Aktual",
        cell: (info) => <span className="text-slate-300 font-mono text-xs">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "waktu_operasi_diterapkan",
        header: "Waktu Operasi Diterapkan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "mematikan_terjadwal",
        header: "Periode Mematikan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "periode_kegagalan",
        header: "Periode Kegagalan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(info.getValue() as string)}`}>
                {info.getValue() as string}
            </span>
        ),
      },
      {
        accessorKey: "dokumentasi",
        header: "Dokumentasi",
        cell: (info) => {
            const url = info.getValue() as string | null;
            if (!url) return <span className="text-slate-600 font-bold">-</span>;
            return (
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs text-indigo-300 group"
                >
                    <ImageIcon size={14} className="group-hover:text-indigo-200" />
                    <span className="font-bold">Lihat</span>
                </a>
            );
        },
      },
      {
        id: "aksi",
        header: "Tindakan",
        cell: (info) => (
            <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => onEdit(info.row.original)}
                  className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Edit Log"
                >
                    <Pencil size={16} />
                </button>
                <button 
                  onClick={() => onDelete(info.row.original.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Hapus Log"
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination: { pageSize: 50 } 
    }
  });

  return (
    <>
      {/* Mobile Card View (Visible on < lg, Hidden on >= lg) */}
      <div className="lg:hidden flex flex-col gap-4">
            {loading ? (
                 <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                    <span>Memuat log peralatan...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-12 text-slate-500 italic">
                    Tidak ada log ditemukan untuk tanggal ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((item) => (
                        <motion.article 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                <div>
                                    <h3 className="font-bold text-white leading-tight">
                                        {item.peralatan?.nama || `Peralatan #${item.peralatan_id}`}
                                    </h3>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} • <span className={getStatusColor(item.status).replace('bg-', 'text-').split(' ')[1]}>{item.status}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs bg-black/10 p-2.5 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Waktu Operasi Aktual</span>
                                    <span className="block text-white font-mono">{item.waktu_operasi_aktual}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Waktu Operasi Diterapkan</span>
                                    <span className="block text-white font-mono">{item.waktu_operasi_diterapkan}</span>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-white/5">
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Periode Mematikan</span>
                                    <span className="block text-white font-mono">{item.mematikan_terjadwal}</span>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-white/5">
                                    <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Periode Kegagalan</span>
                                    <span className="block text-white font-mono">{item.periode_kegagalan}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5 border-dashed">
                                <div>
                                    {item.dokumentasi ? (
                                        <a href={item.dokumentasi} target="_blank" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                                            <ImageIcon size={12} /> Lihat Bukti
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-600 font-bold">-</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => onEdit(item)}
                                        className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-500/20"
                                     >
                                        Edit
                                     </button>
                                     <button 
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20"
                                     >
                                        Hapus
                                     </button>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
      </div>

      {/* Desktop Table View (Hidden on < lg, Visible on >= lg) */}
      <div className="hidden lg:block rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl md:overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-center relative z-10 min-w-[1000px]">
                  <thead className="text-xs uppercase bg-black/20 text-slate-300 font-bold tracking-wider">
                      {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                  <th 
                                      key={header.id} 
                                      className="py-4 px-4 border-b border-white/10 first:border-l-0 border-l border-white/5"
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
                                      <span>Memuat log peralatan...</span>
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
                                  className="hover:bg-white/5 transition-colors group"
                              >
                                  {row.getVisibleCells().map(cell => (
                                      <td key={cell.id} className="px-4 py-4 border-white/5 border-l first:border-l-0 align-middle">
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                      </td>
                                  ))}
                              </motion.tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
              <div className="text-xs text-slate-400">
                  Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
              </div>
              <div className="flex gap-2">
                  <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold text-white transition-colors"
                  >
                      Prev
                  </button>
                  <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold text-white transition-colors"
                  >
                      Next
                  </button>
              </div>
          </div>
      </div>
    </>
  );
}
