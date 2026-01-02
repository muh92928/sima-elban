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
  User,
  GraduationCap,
  Award
} from "lucide-react";
import { Personel } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import TablePagination from "./TablePagination";

interface PersonelTableProps {
  data: Personel[];
  loading: boolean;
  onEdit: (item: Personel) => void;
  onDelete: (id: string) => void;
}

export default function PersonelTable({ 
  data, 
  loading, 
  onEdit, 
  onDelete 
}: PersonelTableProps) {
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
  const columns = useMemo<ColumnDef<Personel>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
        size: 50,
      },
      {
        accessorKey: "nama",
        header: "Nama Personel",
        cell: (info) => {
            const item = info.row.original;
            return (
                <div className="flex items-center gap-3 text-left min-w-[200px]">
                    <div className="w-9 h-9 min-w-[2.25rem] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {item.nama.charAt(0)}
                    </div>
                    <div className="font-bold text-white text-sm">{item.nama}</div>
                </div>
            );
        },
      },
      {
        accessorKey: "nip",
        header: () => <div className="text-center">NIP</div>,
        cell: (info) => (
            <div className="text-indigo-300 font-mono text-xs text-center">
                {info.getValue() as string || "-"}
            </div>
        )
      },
      {
        id: "ttl",
        header: () => <div className="text-center">Tempat, Tanggal Lahir</div>,
        cell: (info) => {
            const item = info.row.original;
            if (!item.tempatLahir && !item.tanggalLahir) return <div className="text-slate-500 text-xs text-center">-</div>;
            return (
                <div className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
                    <span>
                    <span>
                        {[
                            item.tempatLahir?.replace(/,$/, ''),
                            item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : null
                        ].filter(Boolean).join(", ")}
                    </span>
                    </span>
                </div>
            );
        },
      },
      {
        accessorKey: "jabatan",
        header: () => <div className="text-center">Jabatan</div>,
        cell: (info) => {
            const val = info.getValue() as string;
            return (
                <div className="flex justify-center">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap">
                        {val || "-"}
                    </span>
                </div>
            );
        },
      },
      {
        accessorKey: "formasiPendidikan",
        header: () => <div className="text-center">Pendidikan</div>,
        cell: (info) => (
            <div className="text-xs text-slate-400 whitespace-nowrap text-center">
                <span>{info.getValue() as string || "-"}</span>
            </div>
        )
      },
      {
        id: "sertifikat",
        header: () => <div className="text-center">Sertifikat</div>,
        cell: (info) => {
            const item = info.row.original;
            return (
                <div className="flex flex-col gap-0.5 items-center justify-center min-w-[150px]">
                    <div className="text-orange-300 text-xs font-medium text-center">
                        {item.jenisSertifikat || "-"}
                    </div>
                    {item.noSertifikat && (
                        <div className="text-[10px] text-slate-500 font-mono text-center">
                           {item.noSertifikat}
                        </div>
                    )}
                </div>
            );
        },
      },
      {
        accessorKey: "kompetensiPendidikan",
        header: () => <div className="text-center">Kompetensi</div>,
        cell: (info) => (
            <div className="flex justify-center">
                <span className="text-slate-400 text-xs italic block text-center max-w-[200px] truncate" title={info.getValue() as string}>
                    {info.getValue() as string || "-"}
                </span>
            </div>
        )
      },
      {
        accessorKey: "keterangan",
        header: () => <div className="text-center">Keterangan</div>,
        cell: (info) => (
            <div className="flex justify-center">
                <span className="text-slate-500 text-xs block text-center max-w-[150px] truncate">
                    {info.getValue() as string || "-"}
                </span>
            </div>
        )
      },
      {
        id: "aksi",
        header: "Aksi",
        enableSorting: false,
        size: 80,
        cell: (info) => (
            <div className="flex items-center justify-center gap-1">
                <button 
                    onClick={() => onEdit(info.row.original)}
                    className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded transition-colors"
                    title="Edit"
                >
                    <Pencil size={14} />
                </button>
                <button 
                    onClick={() => onDelete(info.row.original.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                    title="Hapus"
                >
                    <Trash2 size={14} />
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination: { pageSize: 50 } 
    }
  });

  return (
    <>
      {/* Mobile Card Render (Visible < MD, Hidden >= MD, Hidden on Print) */}
      <div className="flex flex-col gap-4 p-4 min-[820px]:hidden print:hidden">
             {loading ? (
                 <LoadingSpinner label="Memuat personel..." />
             ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    <div className="flex flex-col items-center justify-center">
                       <User size={48} className="mb-4 opacity-20" />
                       <p>Tidak ada data personel ditemukan.</p>
                    </div>
                </div>
            ) : (
                data.map((item) => {
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={item.id}
                            className={TABLE_STYLES.MOBILE_CARD}
                        >   
                            <div className={TABLE_STYLES.MOBILE_CARD_HEADER}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {item.nama.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm line-clamp-1">{item.nama}</h3>
                                        <div className="text-xs text-indigo-300 font-mono mt-0.5">
                                           NIP. {item.nip || "-"}
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {item.jabatan || "-"}
                                </span>
                            </div>
                                
                            <div className="py-2 border-t border-white/5 border-dashed grid grid-cols-1 gap-3 text-xs">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Pendidikan</p>
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        <GraduationCap size={14} className="text-slate-500" />
                                        <span>{item.formasiPendidikan || "-"}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Sertifikat</p>
                                    <div className="flex items-center gap-1.5 text-orange-300 font-medium">
                                        <Award size={14} />
                                        {item.jenisSertifikat || "-"}
                                    </div>
                                    {item.noSertifikat && (
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                                           No: {item.noSertifikat}
                                        </div>
                                    )}
                                </div>
                                {item.keterangan && (
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Keterangan</p>
                                        <p className="text-slate-400 italic">{item.keterangan}</p>
                                    </div>
                                )}
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
                                        header.id === 'nama' ? 'min-w-[250px]' :
                                        header.id === 'jabatan_pendidikan' ? 'min-w-[200px]' :
                                        header.id === 'kompetensi' ? 'min-w-[200px]' :
                                        header.id === 'keterangan' ? 'min-w-[150px]' :
                                        ''
                                    } ${header.id === 'aksi' ? 'print:hidden' : ''}`}
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
                                <LoadingSpinner label="Memuat personel..." />
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                <div className="flex flex-col items-center justify-center">
                                   <User size={48} className="mb-4 opacity-20" />
                                   <p>Tidak ada data personel ditemukan.</p>
                                </div>
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
                                    <td key={cell.id} className={`${TABLE_STYLES.TD} ${cell.column.id === 'aksi' ? 'print:hidden' : ''}`}>
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
