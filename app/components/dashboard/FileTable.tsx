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
  FileText,
  Download,
  Eye,
  File
} from "lucide-react";
import { FileItem } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";

interface FileTableProps {
  data: FileItem[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (item: FileItem) => void;
}

const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileTable({ 
  data, 
  loading, 
  onDelete,
  onEdit 
}: FileTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);


  // Columns Definitions
  const columns = useMemo<ColumnDef<FileItem>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "nama",
        header: "Nama File",
        cell: (info) => (
          <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                  <FileText size={18} />
              </div>
              <div className="flex flex-col text-left">
                  <a href={info.row.original.url} target="_blank" className="font-bold text-indigo-300 hover:text-indigo-200 hover:underline">
                    {info.getValue() as string}
                  </a>
                  <span className="text-xs text-slate-500">{new Date(info.row.original.created_at).toLocaleDateString("id-ID")}</span>
              </div>
          </div>
        ),
      },
      {
        accessorKey: "kategori",
        header: "Kategori",
        cell: (info) => (
            <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 text-xs text-slate-300">
              {info.getValue() as string}
            </span>
        ),
      },
      {
        accessorKey: "ukuran",
        header: "Ukuran",
        cell: (info) => <span className="text-slate-400 text-xs">{formatFileSize(info.getValue() as number)}</span>,
      },
      {
        accessorKey: "catatan",
        header: "Catatan",
        cell: (info) => <span className="text-slate-400 italic text-xs line-clamp-2 text-left">{info.getValue() as string || "-"}</span>,
      },
      {
        id: "aksi",
        header: "Aksi",
        enableSorting: false,
        cell: (info) => (
            <div className="flex items-center justify-center gap-2">
                 <a 
                    href={info.row.original.url} 
                    target="_blank" 
                    download
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                    title="Download / View"
                >
                    <Download size={16} />
                </a>
                <button 
                    onClick={() => onEdit(info.row.original)}
                    className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors"
                    title="Edit File"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Hapus File"
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
                    <span>Memuat file...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada file ditemukan.
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
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 mt-1">
                                    <File size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-indigo-300 text-sm line-clamp-1 break-all">{item.nama}</h3>
                                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                        <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                                        <span>•</span>
                                        <span>{formatFileSize(item.ukuran)}</span>
                                    </div>
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[10px] text-slate-300 uppercase tracking-wide">
                                        {item.kategori}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {item.catatan && (
                             <div className="py-2 border-t border-white/5 border-dashed">
                                 <p className="text-xs text-slate-400 italic">{item.catatan}</p>
                             </div>
                        )}

                        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                             <a 
                                href={item.url} 
                                target="_blank"
                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                            >
                                <Download size={14} />
                            </a>
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
                                    <span>Memuat file...</span>
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                Tidak ada file ditemukan.
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
