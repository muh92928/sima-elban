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

interface TugasTableProps {
  data: Tugas[];
  loading: boolean;
  onEdit: (item: Tugas) => void;
  onDelete: (id: number | number[]) => void;
  onStatusChange: (id: number | number[], status: 'PENDING' | 'PROSES' | 'SELESAI') => void;
  currentUserNip?: string;
  isKanitOrAdmin: boolean;
}

export default function TugasTable({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onStatusChange,
  currentUserNip,
  isKanitOrAdmin,
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
          cell: (info) => info.row.index + 1,
          enableSorting: false,
        },
        {
          accessorKey: "peralatan.nama",
          header: "Peralatan",
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
          cell: (info) => {
              const t = info.row.original;
              return (
                  <div className="max-w-[300px] mx-auto text-center">
                      {t.judul && <div className="font-bold text-white mb-1">{t.judul}</div>}
                      <div className="text-xs text-slate-300">{t.deskripsi}</div>
                  </div>
              );
          }
        },
        {
          header: "Ditugaskan Ke",
          accessorKey: "ditugaskan_ke", 
          cell: (info) => {
              const assignees = info.row.original.assignees as { nama: string; nip: string }[];
              if (!assignees || assignees.length === 0) return <span className="text-slate-500 text-xs">-</span>;
              
              return (
                  <div className="flex flex-wrap justify-center gap-1 max-w-[200px] mx-auto">
                       {assignees.map((u, i) => (
                           <div key={i} className="flex items-center gap-1 bg-slate-800/80 border border-white/5 px-2 py-1 rounded-lg">
                                <span className={`font-bold text-indigo-200 text-xs whitespace-nowrap`}>
                                    {u.nama || u.nip}
                                </span>
                           </div>
                       ))}
                  </div>
              )
          }
        },
        {
          header: "Status",
          accessorKey: "status",
          cell: (info) => {
               const s = info.getValue() as string;
               const row = info.row.original;
               const color = 
                  s === 'SELESAI' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  s === 'PROSES' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-pink-500/10 text-pink-400 border-pink-500/20';
               
               // Check if current user is one of the assignees
               const isAssigned = row.assignees.some((a: any) => a.nip === currentUserNip);
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
        {/* Toolbar */}
        <div className="flex md:items-center justify-between gap-4 flex-col md:flex-row">
            <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-0 sm:text-sm transition-colors"
                    placeholder="Cari tugas..."
                />
            </div>
            {/* Additional filters can go here */}
        </div>
        
        {/* Mobile View (Cards) */}
        <div className="md:hidden grid grid-cols-1 gap-4">
            {table.getRowModel().rows.map(row => {
                const t = row.original;
                const statusColor = 
                    t.status === 'SELESAI' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    t.status === 'PROSES' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                    'text-pink-400 bg-pink-500/10 border-pink-500/20';
                
                return (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white leading-snug mb-1">
                                    {t.judul || `Tugas #${t.id}`}
                                </h3>
                                <div className="text-xs text-slate-400">
                                    {new Date(t.dibuat_kapan).toLocaleDateString("id-ID", { dateStyle: 'long' })}
                                </div>
                            </div>
                           
                            {/* Status Badge mobile */}
                           {(!isKanitOrAdmin && t.assignees.some((a:any) => a.nip === currentUserNip)) ? (
                                <select 
                                    value={t.status} 
                                    onChange={(e) => t.ids.forEach((id: number) => onStatusChange(id, e.target.value as any))}
                                    className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border outline-none cursor-pointer ${statusColor} bg-transparent`}
                                >
                                    <option value="PENDING" className="bg-slate-900 text-pink-400">PENDING</option>
                                    <option value="PROSES" className="bg-slate-900 text-amber-400">PROSES</option>
                                    <option value="SELESAI" className="bg-slate-900 text-emerald-400">SELESAI</option>
                                </select>
                           ) : (
                                <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase ${statusColor}`}>
                                    {t.status}
                                </span>
                           )}
                        </div>

                        <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2 text-sm">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Peralatan</span>
                                {t.peralatan ? (
                                    <span className="text-indigo-300 font-medium">{t.peralatan.nama}</span>
                                ) : (
                                    <span className="text-slate-500 italic">-</span>
                                )}
                            </div>
                             <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Ditugaskan Ke</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {t.assignees.map((u: any, i: number) => (
                                        <span key={i} className="text-xs bg-white/5 px-2 py-0.5 rounded text-white border border-white/5">
                                            {u.nama || u.nip}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Deskripsi</span>
                                <p className="text-slate-300 leading-relaxed text-xs">{t.deskripsi}</p>
                            </div>
                        </div>

                        {isKanitOrAdmin && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-white/5 text-sm">
                                <button 
                                    onClick={() => onEdit(t)} 
                                    className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold hover:bg-indigo-500/20"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => onDelete(t.ids)} 
                                    className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg font-bold hover:bg-red-500/20"
                                >
                                    Hapus
                                </button>
                            </div>
                        )}
                    </motion.div>
                )
            })}
             {!data.length && (
                <div className="text-center py-12 text-slate-500 italic">
                    Belum ada tugas.
                </div>
            )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                     <thead className="text-xs uppercase bg-white/5 text-slate-300 font-bold tracking-wider">
                         {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-4 border-b border-white/10 bg-slate-900/30 text-center">
                                         {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                             <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
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
                                        <td key={cell.id} className="px-6 py-4 border-white/5 align-middle text-center">
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
    </div>
  );
}
