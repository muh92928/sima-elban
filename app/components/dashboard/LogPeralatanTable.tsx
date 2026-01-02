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
  ExternalLink,
  Calendar,
  MapPin
} from "lucide-react";
import { LogPeralatan } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";
import TablePagination from "./TablePagination";

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
            <div className="flex flex-col items-center text-center">
                <span className="font-bold text-white text-xs print:text-black">{info.row.original.peralatan?.nama || `Peralatan #${info.row.original.peralatan_id}`}</span>
                <span className="text-[10px] text-slate-400 print:text-gray-600">
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
            <span className="text-slate-300 text-xs print:text-black">
                {new Date(info.getValue() as string).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        ),
      },
      {
        accessorKey: "waktu_operasi_aktual",
        header: "Waktu Operasi Aktual",
        cell: (info) => <span className="text-slate-300 font-mono text-xs print:text-black">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "waktu_operasi_diterapkan",
        header: "Waktu Operasi Diterapkan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs print:text-black">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "mematikan_terjadwal",
        header: "Periode Mematikan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs print:text-black">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "periode_kegagalan",
        header: "Periode Kegagalan",
        cell: (info) => <span className="text-slate-300 font-mono text-xs print:text-black">{info.getValue() as number}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(info.getValue() as string)} print:bg-transparent print:text-black print:border-none print:p-0`}>
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
      {/* Mobile Card View (Visible on < lg, Hidden on >= lg, Hidden on Print) */}
      <div className="min-[820px]:hidden flex flex-col gap-4 print:hidden">
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
                            className={TABLE_STYLES.MOBILE_CARD}
                        >
                            <div className={TABLE_STYLES.MOBILE_CARD_HEADER}>
                                <div>
                                    <h3 className="font-bold text-white text-sm line-clamp-1">
                                        {item.peralatan?.nama || `Peralatan #${item.peralatan_id}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <Calendar size={12} className="text-indigo-400" />
                                        <span>{new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>
                            
                            <div className="py-2 border-t border-white/5 border-dashed grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Operasi Aktual</p>
                                    <p className="text-xs text-slate-300 font-mono">{item.waktu_operasi_aktual}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Operasi Diterapkan</p>
                                    <p className="text-xs text-slate-300 font-mono">{item.waktu_operasi_diterapkan}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Mematikan</p>
                                    <p className="text-xs text-slate-300 font-mono">{item.mematikan_terjadwal}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Kegagalan</p>
                                    <p className="text-xs text-slate-300 font-mono">{item.periode_kegagalan}</p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                                <div className="mr-auto">
                                    {item.dokumentasi ? (
                                        <a href={item.dokumentasi} target="_blank" className="text-xs font-bold text-indigo-400 hover:text-white hover:underline flex items-center gap-1.5 transition-colors">
                                            <ImageIcon size={14} /> Bukti
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-600 font-medium">-</span>
                                    )}
                                </div>
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
                        </motion.article>
                    ))}
                </div>
            )}
      </div>

      {/* Desktop Table View (Hidden on < lg, Visible on >= lg, Visible on Print) */}
      <div className={TABLE_STYLES.CONTAINER}>
          <div className={TABLE_STYLES.WRAPPER}>
              <table className={TABLE_STYLES.TABLE}>
                  <thead className={TABLE_STYLES.THEAD}>
                      {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                  <th 
                                      key={header.id} 
                                      className={`${TABLE_STYLES.TH} ${(header.id === 'dokumentasi' || header.id === 'aksi') ? 'print:hidden' : ''}`}
                                  >
                                      <div className={`flex items-center gap-1 justify-center ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''}`}>
                                          {flexRender(header.column.columnDef.header, header.getContext())}
                                      </div>
                                  </th>
                              ))}
                          </tr>
                      ))}
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-none">
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
                                  className="hover:bg-white/5 transition-colors group print:text-black print:bg-white"
                              >
                                  {row.getVisibleCells().map(cell => (
                                      <td key={cell.id} className={`${TABLE_STYLES.TD} ${(cell.column.id === 'dokumentasi' || cell.column.id === 'aksi') ? 'print:hidden' : ''}`}>
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
