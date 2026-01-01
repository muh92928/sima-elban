"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Calendar, Clock, MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { Jadwal } from "@/lib/types";

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Jadwal[];
  onEdit: (item: Jadwal) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export default function DayDetailsModal({ 
  isOpen, 
  onClose, 
  date, 
  events,
  onEdit,
  onDelete,
  onAdd
}: DayDetailsModalProps) {
  if (!date) return null;

  const dateStr = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 print:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#0F172A] border border-white/10 p-6 text-left align-middle shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">
                            {date.getDate()}
                        </h3>
                        <p className="text-indigo-400 font-medium">
                            {date.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-slate-500 text-sm mt-1 capitalize">
                            {date.toLocaleDateString("id-ID", { weekday: 'long' })}
                        </p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {events.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 italic border-2 border-dashed border-white/5 rounded-2xl">
                            Tidak ada kegiatan hari ini.
                        </div>
                    ) : (
                        events.map((item) => {
                             // Check for Personnel Status format
                             const statusMatches = item.nama_kegiatan.match(/^(Dinas Pagi|Dinas Elban|Dinas Luar|Izin|Cuti|Sakit|Tugas Belajar)\s-\s(.+)$/);
                             let isPersonnel = false;
                             let statusColor = { bg: "bg-slate-800", text: "text-white", border: "border-white/10" };
                             
                             if (statusMatches) {
                                isPersonnel = true;
                                const status = statusMatches[1];
                                const statusColors: Record<string, any> = {
                                    "Dinas Pagi": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
                                    "Dinas Elban": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
                                    "Dinas Luar": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
                                    "Izin": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
                                    "Cuti": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
                                    "Sakit": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
                                    "Tugas Belajar": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
                                };
                                statusColor = statusColors[status] || statusColor;
                             }

                            return (
                                <div 
                                    key={item.id} 
                                    className={`
                                        group relative p-4 rounded-xl border transition-all hover:bg-white/[0.02]
                                        ${isPersonnel ? `${statusColor.bg} ${statusColor.border}` : 'bg-slate-900/50 border-white/10'}
                                    `}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <h4 className={`font-semibold text-sm ${isPersonnel ? statusColor.text : 'text-white'}`}>
                                                {item.nama_kegiatan}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-indigo-400" />
                                                    <span>{item.waktu?.slice(0, 5)} WIB</span>
                                                </div>
                                                {item.lokasi && item.lokasi !== '-' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-slate-500" />
                                                        <span className="truncate max-w-[150px]">{item.lokasi}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.keterangan && (
                                                <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                                                    "{item.keterangan}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Actions (Always visible on mobile/modal) */}
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onEdit(item)}
                                            className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors text-xs flex items-center gap-1"
                                        >
                                            <Pencil size={12} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-xs flex items-center gap-1 ml-auto"
                                        >
                                            <Trash2 size={12} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <button
                        onClick={onAdd}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Tambah Jadwal
                    </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
