"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MoreHorizontal, 
  Pencil, 
  Search, 
  Trash2, 
  User, 
  Wrench 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Tugas, Akun, Peralatan } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import TablePagination from "./TablePagination";

interface TugasTableProps {
  data: Tugas[];
  loading: boolean;
  onEdit: (item: Tugas) => void;
  onDelete: (id: number | number[]) => void;
  onStatusChange: (id: number | number[], status: 'PENDING' | 'PROSES' | 'SELESAI') => void;
  currentUserNip?: string;
  isKanitOrAdmin: boolean;
  title?: string;
}

export default function TugasTable({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onStatusChange,
  currentUserNip,
  isKanitOrAdmin,
  title,
}: TugasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Group Data Logic
  const groupedData = useMemo(() => {
     if (!data) return [];
     
     // Extend type for internal use
     type GroupedTugas = Tugas & {
         ids: number[];
         assignees: { nama: string | null; nip: string }[];
         isGroup: boolean;
     };

     const groups: Record<string, GroupedTugas> = {};
     
     data.forEach(task => {
         // Group key: Title + Description + Equipment + Time (up to minute)
         // Ignore seconds/ms to group batch creations effectively
         const timeKey = task.dibuat_kapan ? task.dibuat_kapan.substring(0, 16) : 'unknown';
         const key = `${task.judul || ''}|${task.deskripsi}|${task.peralatan_id}|${timeKey}|${task.status}`;

         if (!groups[key]) {
             groups[key] = { 
                 ...task, 
                 ids: [], 
                 assignees: [],
                 isGroup: false 
             };
         }
         
         groups[key].ids.push(task.id);
         
         const assignee = task.ditugaskan_ke 
             ? { nama: task.ditugaskan_ke.nama, nip: task.ditugaskan_ke.nip }
             : { nama: task.ditugaskan_ke_nip, nip: task.ditugaskan_ke_nip };
             
         // Avoid invalid assignees if any
         if (assignee.nip) {
             groups[key].assignees.push(assignee);
         }
         
         groups[key].isGroup = groups[key].ids.length > 1;
     });

     return Object.values(groups);
  }, [data]);

  // Define Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => {
      const cols: ColumnDef<any>[] = [
        {
          header: "No",
          id: "index",
          size: 60,
          cell: (info) => <div className="text-center">{info.row.index + 1}</div>,
          enableSorting: false,
        },
        {
          accessorKey: "peralatan.nama",
          header: "Peralatan",
          size: 200,
          cell: (info) => {
              const p = info.row.original.peralatan;
              if (!p) return <span className="text-slate-500 text-xs italic">Tanpa Peralatan</span>;
              return (
                  <div className="flex flex-col items-center">
                      <span className="font-bold text-white text-sm text-center">{p.nama}</span>
                      <span className="text-xs text-slate-400">{p.merk || "-"}</span>
                  </div>
              )
          }
        },
        {
          header: "Judul / Deskripsi",
          accessorKey: "deskripsi",
          size: 400,
          cell: (info) => {
              const t = info.row.original;
              const hasDescription = t.deskripsi && t.deskripsi !== '-';
              
              return (
                  <div className="max-w-[400px] mx-auto text-center flex flex-col justify-center">
                      {t.judul && <div className={`font-bold text-white ${hasDescription ? 'mb-1' : ''}`}>{t.judul}</div>}
                      {hasDescription && (
                        <div className="text-xs text-slate-300 line-clamp-2" title={t.deskripsi}>
                            {t.deskripsi}
                        </div>
                      )}
                  </div>
              );
          }
        },
        {
          header: "Ditugaskan Ke",
          accessorKey: "ditugaskan_ke",
          size: 250, 
          cell: (info) => {
              const assignees = info.row.original.assignees as { nama: string; nip: string }[];
              if (!assignees || assignees.length === 0) return <span className="text-slate-500 text-xs italic">Belum ditugaskan</span>;
              
              // Predefined premium colors for avatars
              const colors = [
                { bg: 'bg-blue-500', text: 'text-blue-100', pillBg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { bg: 'bg-emerald-500', text: 'text-emerald-100', pillBg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                { bg: 'bg-violet-500', text: 'text-violet-100', pillBg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                { bg: 'bg-amber-500', text: 'text-amber-100', pillBg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                { bg: 'bg-rose-500', text: 'text-rose-100', pillBg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                { bg: 'bg-cyan-500', text: 'text-cyan-100', pillBg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
              ];

              return (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                       {assignees.map((u, i) => {
                           // Get initials
                           const name = u.nama || u.nip;
                           const nameParts = name.split(' ');
                           const initials = nameParts.length > 1 
                                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                                : nameParts[0].substring(0, 2).toUpperCase();

                           // Deterministic color selection based on name char code sum
                           const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                           const color = colors[charCodeSum % colors.length];

                           return (
                               <div 
                                    key={i} 
                                    className={`flex items-center gap-2 ${color.pillBg} ${color.border} border pl-1 pr-3 py-1 rounded-full group hover:bg-opacity-20 transition-all cursor-default shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                                >
                                    <div className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center text-[9px] font-bold text-white shadow-inner`}>
                                        {initials}
                                    </div>
                                    <span className={`${color.text} text-[11px] font-medium max-w-[100px] truncate`}>
                                        {name}
                                    </span>
                               </div>
                           );
                       })}
                  </div>
              )
          }
        },
        {
          header: "Status",
          accessorKey: "status",
          size: 150,
          cell: (info) => {
               const s = info.getValue() as string;
               const row = info.row.original;
               const color = 
                  s === 'SELESAI' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  s === 'PROSES' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-pink-500/10 text-pink-400 border-pink-500/20';
               
               // Check if current user is one of the assignees
               const isAssigned = row.assignees.some((a: { nip: string }) => a.nip === currentUserNip);
               const canChangeStatus = isAssigned || isKanitOrAdmin;
               
               if (canChangeStatus && !isKanitOrAdmin && isAssigned) {
                   return (
                      <select 
                          value={s} 
                          onChange={(e) => {
                              onStatusChange(row.ids, e.target.value as any);
                          }}
                          className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border outline-none cursor-pointer ${color} bg-transparent text-center`}
                      >
                          <option value="PENDING" className="bg-slate-900 text-pink-400">PENDING</option>
                          <option value="PROSES" className="bg-slate-900 text-amber-400">PROSES</option>
                          <option value="SELESAI" className="bg-slate-900 text-emerald-400">SELESAI</option>
                      </select>
                   );
               }

               return (
                  <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase ${color} inline-block min-w-[80px]`}>
                      {s}
                  </span>
               );
          }
        },
        {
          header: "Dibuat",
          accessorKey: "dibuat_kapan",
          size: 150,
          cell: (info) => {
              const d = new Date(info.getValue() as string);
              return (
                  <div className="text-xs text-slate-400 text-center">
                      {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </div>
              )
          }
        }
      ];

      if (isKanitOrAdmin) {
        cols.push({
          id: "aksi",
          header: "Aksi",
          size: 100,
          cell: (info) => {
              const item = info.row.original;  
              return (
                  <div className="flex items-center justify-center gap-2">
                       {/* Edit only visible if single item? Or allow editing 'template' but applies to single? */}
                       {/* Editing a group is tricky. Let's hide Edit for groups > 1 for safety, or allow it but know it references just one ID? */}
                       {/* Actually, editing the representative record (ID) is fine, but it will split the group if content changes. */}
                      <button 
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit"
                      >
                          <Pencil size={16} />
                      </button>
                      <button 
                          onClick={() => onDelete(item.ids)} // Pass array of IDs
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              );
          }
        });
      }

      return cols;
    },
    [currentUserNip, isKanitOrAdmin, onEdit, onDelete, onStatusChange]
  );

  const table = useReactTable({
    data: groupedData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">

        
        {/* Mobile View (Cards) */}
        <div className="min-[820px]:hidden grid grid-cols-1 gap-4">
            {loading ? (
                <LoadingSpinner label="Memuat tugas..." />
            ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                    const t = row.original;
                    const statusColor = 
                        t.status === 'SELESAI' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        t.status === 'PROSES' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-pink-400 bg-pink-500/10 border-pink-500/20';
                    
                    return (
                        <motion.div
                            key={row.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={TABLE_STYLES.MOBILE_CARD}
                        >
                            <div className={TABLE_STYLES.MOBILE_CARD_HEADER}>
                                <div>
                                    <h3 className="font-bold text-white leading-snug mb-1 text-sm">
                                        {t.judul || `Tugas #${t.id}`}
                                    </h3>
                                    <div className="text-xs text-slate-400">
                                        {new Date(t.dibuat_kapan).toLocaleDateString("id-ID", { dateStyle: 'long' })}
                                    </div>
                                </div>
                               
                                {/* Status Badge mobile */}
                               {(!isKanitOrAdmin && t.assignees.some((a: { nama: string | null; nip: string }) => a.nip === currentUserNip)) ? (
                                    <select 
                                        value={t.status} 
                                        onChange={(e) => onStatusChange(t.id, e.target.value as 'PENDING' | 'PROSES' | 'SELESAI')}
                                        className={`text-[10px] font-bold uppercase rounded px-2 py-1 bg-slate-900 border focus:outline-none cursor-pointer ${
                                            t.status === 'SELESAI' ? 'text-emerald-400 border-emerald-500/20' : 
                                            t.status === 'PROSES' ? 'text-amber-400 border-amber-500/20' : 
                                            'text-pink-400 border-pink-500/20'
                                        }`}
                                    >
                                        <option value="BELUM_DIKERJAKAN" className="bg-slate-900 text-pink-400">BELUM</option>
                                        <option value="PROSES" className="bg-slate-900 text-amber-400">PROSES</option>
                                        <option value="SELESAI" className="bg-slate-900 text-emerald-400">SELESAI</option>
                                    </select>
                               ) : (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                        {t.status}
                                    </span>
                               )}
                            </div>

                            <div className="py-2 border-t border-white/5 border-dashed grid grid-cols-2 gap-3 text-xs">
                                 <div className="col-span-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Deskripsi</span>
                                    <p className="text-slate-300 leading-relaxed max-h-20 overflow-y-auto">{t.deskripsi}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Peralatan</span>
                                    {t.peralatan ? (
                                        <span className="text-indigo-300 font-medium font-mono">{t.peralatan.nama}</span>
                                    ) : (
                                        <span className="text-slate-500 italic">-</span>
                                    )}
                                </div>
                                 <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Ditugaskan Ke</span>
                                    <div className="flex flex-wrap gap-1">
                                        {t.assignees.map((u: { nama: string | null; nip: string }, i: number) => (
                                            <span key={i} className="bg-white/5 px-1.5 py-0.5 rounded text-slate-300 border border-white/5">
                                                {u.nama || u.nip}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {isKanitOrAdmin && (
                                 <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => onEdit(t)} 
                                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(t.ids)} 
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )
                })
            ) : (
               <div className="text-center py-12 text-slate-500 italic">
                   Belum ada tugas.
               </div>
            )}
        </div>

        {/* Desktop Table */}
        <div className={TABLE_STYLES.CONTAINER}>
             {/* Optional Title */}
              {title && (
                <div className="px-6 py-4 border-b border-white/5 bg-slate-900/50">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                      {title}
                   </h3>
                </div>
              )}
              <div className={TABLE_STYLES.WRAPPER}>
                <table className={`${TABLE_STYLES.TABLE} table-fixed`}>
                     <thead className={TABLE_STYLES.THEAD}>
                         {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className={TABLE_STYLES.TH}
                                        style={{ width: header.getSize() }}
                                    >
                                         {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                     </thead>
                      <tbody className="divide-y divide-white/5">
                        {loading ? (
                             <tr>
                                 <td colSpan={columns.length} className="p-0">
                                     <LoadingSpinner label="Memuat tugas..." />
                                 </td>
                             </tr>
                        ) : groupedData.length === 0 ? (
                             <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">Belum ada tugas.</td></tr>
                        ) : (
                             table.getRowModel().rows.map(row => (
                                <motion.tr 
                                    key={row.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                     {row.getVisibleCells().map(cell => (
                                        <td 
                                            key={cell.id} 
                                            className={TABLE_STYLES.TD}
                                            style={{ width: cell.column.getSize() }}
                                        >
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
    </div>
  );
}
