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
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  RefreshCw,
  User,
  ShieldAlert,
  Briefcase,
  Mail,
  BadgeCheck 
} from "lucide-react";
import { Akun } from "@/lib/types";
import { TABLE_STYLES } from "@/lib/tableStyles";
import TablePagination from "./TablePagination";

interface AccountTableProps {
  data: Akun[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateRole: (id: string, newRole: 'admin' | 'user' | 'teknisi') => void;
}

export default function AccountTable({ 
  data, 
  loading, 
  onApprove, 
  onReject,
  onUpdateRole
}: AccountTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);


  const getStatusColor = (status: string) => {
      switch(status) {
          case 'approved': 
          case 'AKTIF':
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
          case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/20';
          default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      }
  };

  const getRoleColor = (role: string) => {
      const r = (role || "").toUpperCase();
      if (r.includes('ADMIN') || r.includes('KANIT')) return 'text-purple-400';
      if (r.includes('TEKNISI')) return 'text-blue-400';
      return 'text-slate-400';
  };

  // Columns Definitions
  const columns = useMemo<ColumnDef<Akun>[]>(
    () => [
      {
        header: "No",
        id: "index",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "nama",
        header: "Identitas",
        cell: (info) => (
          <div className="flex flex-col items-center text-center">
             <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{info.getValue() as string}</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <BadgeCheck size={12} className="text-indigo-400" />
                <span>NIP: {info.row.original.nip || '-'}</span>
             </div>
          </div>
        ),
      },
      {
        accessorKey: "unit_kerja",
        header: "Unit Kerja",
        cell: (info) => (
            <div className="flex items-center gap-1.5 justify-center">
                <Briefcase size={14} className="text-slate-500" />
                <span className="text-slate-300 text-xs">{info.getValue() as string || '-'}</span>
            </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
            <div className="flex items-center gap-1.5 justify-center">
                <Mail size={14} className="text-slate-500" />
                <span className="text-slate-300 text-xs">{info.getValue() as string}</span>
            </div>
        ),
      },
      {
        accessorKey: "peran",
        header: "Peran",
        cell: (info) => {
            const rawValue = (info.getValue() as string || "");
            const getNormalizedRole = (val: string) => {
                const v = val.toUpperCase();
                if (v.includes("KANIT")) return "Kanit Elban";
                if (v.includes("TEKNISI")) return "Teknisi Elban";
                if (v.includes("ADMIN")) return "Admin";
                return "user";
            };
            const displayValue = getNormalizedRole(rawValue);

            return (
              <div className="flex justify-center">
                  <select 
                    title="hak akses"
                    value={displayValue}
                    onChange={(e) => onUpdateRole(info.row.original.id, e.target.value as any)}
                    disabled={info.row.original.status !== 'approved'}
                    className={`bg-slate-900 border border-white/10 rounded-lg text-xs py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${getRoleColor(displayValue)} font-semibold uppercase disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                      <option value="user">User</option>
                      <option value="Teknisi Elban">Teknisi Elban</option>
                      <option value="Kanit Elban">Kanit Elban</option>
                      <option value="Admin">Admin</option>
                  </select>
              </div>
            );
        },
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
        id: "aksi",
        header: "Aksi",
        enableSorting: false,
        cell: (info) => (
            <div className="flex items-center justify-center gap-2">
                {info.row.original.status === 'pending' && (
                    <>
                        <button 
                            onClick={() => onApprove(info.row.original.id)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20"
                            title="Setujui Akun"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                        <button 
                            onClick={() => onReject(info.row.original.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                            title="Tolak Akun"
                        >
                            <XCircle size={16} />
                        </button>
                    </>
                )}
                {info.row.original.status !== 'pending' && (
                    <span className="text-xs text-slate-500 italic">Selesai</span>
                )}
            </div>
        )
      }
    ],
    [onApprove, onReject, onUpdateRole]
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
            {loading ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-indigo-500" size={24} />
                    <span>Memuat data akun...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic">
                    Tidak ada akun ditemukan.
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
                                <div className="p-2 bg-slate-800 rounded-full text-indigo-400 mt-1">
                                    <User size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">{item.nama}</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <BadgeCheck size={12} /> {item.nip}
                                    </p>
                                    <p className="text-xs text-slate-500">{item.email}</p>
                                </div>
                            </div>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/5 border-dashed">
                             <div className="space-y-1">
                                 <p className="text-[10px] text-slate-500 uppercase font-bold">Unit Kerja</p>
                                 <p className="text-xs text-white">{(item as any).unit_kerja || '-'}</p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-[10px] text-slate-500 uppercase font-bold">Peran</p>
                                 <select 
                                    title="Peran"
                                    value={item.role || 'user'}
                                    onChange={(e) => onUpdateRole(item.id, e.target.value as any)}
                                    disabled={item.status !== 'approved'}
                                    className={`bg-slate-800 border border-white/10 rounded text-xs py-1 px-1.5 focus:outline-none w-full ${getRoleColor(item.role || '')} uppercase font-bold disabled:opacity-50`}
                                >
                                    <option value="user">User</option>
                                    <option value="teknisi">Teknisi</option>
                                    <option value="admin">Admin</option>
                                </select>
                             </div>
                        </div>

                        {item.status === 'pending' && (
                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                                <button 
                                    onClick={() => onApprove(item.id)}
                                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={14} /> Setujui
                                </button>
                                <button 
                                    onClick={() => onReject(item.id)}
                                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={14} /> Tolak
                                </button>
                            </div>
                        )}
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
                                      <span>Memuat data akun...</span>
                                  </div>
                              </td>
                          </tr>
                      ) : table.getRowModel().rows.length === 0 ? (
                          <tr>
                              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                                  Belum ada data akun pada status ini.
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
