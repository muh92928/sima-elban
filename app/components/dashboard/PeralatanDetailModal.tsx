"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { X, QrCode, History, Info, CalendarPlus, FileText, Wrench, CheckCircle2, AlertTriangle, AlertOctagon, User, Calendar } from "lucide-react";
import { Peralatan, LogPeralatan, Tugas } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

interface PeralatanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Peralatan | null;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PeralatanDetailModal({ isOpen, onClose, data }: PeralatanDetailModalProps) {
  const [history, setHistory] = useState<(LogPeralatan | Tugas)[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleDesc, setScheduleDesc] = useState("");

  useEffect(() => {
    if (isOpen && data) {
      fetchHistory();
    }
  }, [isOpen, data]);

  const fetchHistory = async () => {
    if (!data) return;
    setLoadingHistory(true);
    try {
        // Fetch Logs
        const { data: logs } = await supabase
            .from('log_peralatan')
            .select('*')
            .eq('peralatan_id', data.id)
            .order('tanggal', { ascending: false })
            .limit(10);

        // Fetch Tugas
        const { data: tasks } = await supabase
            .from('tugas')
            .select('*, dibuat_oleh:akun!fk_tugas_pembuat(nama), ditugaskan_ke:akun!fk_tugas_teknisi(nama)')
            .eq('peralatan_id', data.id)
            .order('dibuat_kapan', { ascending: false })
            .limit(10);

        // Combine and Sort
        const combined = [
            ...(logs || []).map(l => ({ ...l, type: 'LOG' })),
            ...(tasks || []).map(t => ({ ...t, type: 'TUGAS' }))
        ].sort((a, b) => {
            const dateA = new Date(a.type === 'LOG' ? a.tanggal : a.dibuat_kapan).getTime();
            const dateB = new Date(b.type === 'LOG' ? b.tanggal : b.dibuat_kapan).getTime();
            return dateB - dateA;
        });

        setHistory(combined as any);
    } catch (e) {
        console.error("Error fetching history", e);
    } finally {
        setLoadingHistory(false);
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scheduleDate || !scheduleDesc || !data) return;
      
      setScheduling(true);
      try {
          // Insert into Jadwal
          const { error } = await supabase.from('jadwal').insert([{
              nama_kegiatan: `Maintenance: ${data.nama}`,
              tanggal: scheduleDate,
              waktu: '09:00:00', // Default morning
              lokasi: 'Lokasi Peralatan', 
              keterangan: scheduleDesc
          }]);

          if (error) throw error;
          toast.success("Jadwal maintenance berhasil dibuat!");
          setScheduleDate("");
          setScheduleDesc("");
      } catch (e: any) {
          toast.error("Gagal membuat jadwal: " + e.message);
      } finally {
          setScheduling(false);
      }
  };

  if (!data) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#0F172A] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white flex items-center gap-2">
                            <Wrench className="text-indigo-400" size={24} />
                            {data.nama}
                        </Dialog.Title>
                        <p className="text-slate-400 text-sm mt-1">{data.jenis} • {data.merk}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-slate-800/50 p-1 mb-6 border border-white/5">
                        <Tab className={({ selected }) =>
                            classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <Info size={16} /> Detail
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <History size={16} /> Riwayat
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <QrCode size={16} /> QR Code
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <CalendarPlus size={16} /> Maintenance
                            </div>
                        </Tab>
                    </Tab.List>

                    <Tab.Panels>
                        {/* Detail Panel */}
                        <Tab.Panel className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Status Kelaikan</span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${
                                        data.status_laik === 'LAIK OPERASI' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        {data.status_laik === 'LAIK OPERASI' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                        {data.status_laik}
                                    </span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Kondisi Fisik</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    (data.kondisi_persen || 0) >= 80 ? 'bg-emerald-500' : 
                                                    (data.kondisi_persen || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                }`} 
                                                style={{ width: `${data.kondisi_persen || 0}%` }} 
                                            />
                                        </div>
                                        <span className="text-white font-mono font-bold">{data.kondisi_persen}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-xl border border-white/5 divide-y divide-white/5">
                                <div className="p-3 flex justify-between">
                                    <span className="text-slate-400 text-sm">Nomor Sertifikat</span>
                                    <span className="text-white font-medium text-sm">{data.no_sertifikat || '-'}</span>
                                </div>
                                <div className="p-3 flex justify-between">
                                    <span className="text-slate-400 text-sm">Tahun Instalasi</span>
                                    <span className="text-white font-medium text-sm">{data.tahun_instalasi || '-'}</span>
                                </div>
                                <div className="p-3">
                                    <span className="text-slate-400 text-sm block mb-1">Keterangan / Spesifikasi</span>
                                    <p className="text-white text-sm leading-relaxed text-slate-300">
                                        {data.keterangan || "Tidak ada keterangan tambahan."}
                                    </p>
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* History Panel */}
                        <Tab.Panel>
                            {loadingHistory ? (
                                <div className="py-12 flex justify-center">
                                    <LoadingSpinner />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 italic">
                                    Belum ada riwayat tercatat.
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {history.map((item: any, idx) => (
                                        <div key={idx} className="flex gap-4 relative group">
                                            {/* Line */}
                                            {idx !== history.length - 1 && (
                                                <div className="absolute left-[19px] top-8 bottom-[-16px] w-0.5 bg-white/10 group-hover:bg-indigo-500/30 transition-colors" />
                                            )}
                                            
                                            {/* Icon */}
                                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                                item.type === 'LOG' 
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                            }`}>
                                                {item.type === 'LOG' ? <FileText size={18} /> : <Wrench size={18} />}
                                            </div>

                                            {/* Content */}
                                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex-1 hover:bg-slate-800/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                        item.type === 'LOG' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                        {item.type === 'LOG' ? 'LOG HARIAN' : 'TUGAS PERBAIKAN'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(item.type === 'LOG' ? item.tanggal : item.dibuat_kapan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white font-medium mb-1">
                                                    {item.type === 'LOG' ? item.kegiatan : item.judul}
                                                </p>
                                                <p className="text-xs text-slate-400 line-clamp-2">
                                                    {item.type === 'LOG' ? item.keterangan : item.deskripsi}
                                                </p>
                                                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                                    <User size={12} />
                                                    {item.type === 'LOG' ? item.pic : (item.ditugaskan_ke?.nama || "Unassigned")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Tab.Panel>

                        {/* QR Panel */}
                        <Tab.Panel className="flex flex-col items-center justify-center py-8 gap-6">
                            <div className="bg-white p-4 rounded-2xl shadow-2xl">
                                <QRCode 
                                    value={`https://sima-elban.app/peralatan/${data.id}`} 
                                    size={200}
                                    level="H"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <h4 className="text-white font-bold text-lg">{data.nama}</h4>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                    Scan QR Code ini untuk akses cepat ke detail peralatan dan riwayat perbaikan.
                                </p>
                            </div>
                            <button 
                                onClick={() => window.print()}
                                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none gap-2"
                            >
                                <QrCode size={16} /> Print Label QR
                            </button>
                        </Tab.Panel>

                        {/* Schedule Maintenance Panel */}
                        <Tab.Panel>
                            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
                                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3 text-indigo-200 text-sm mb-4">
                                    <CalendarPlus className="shrink-0 mt-0.5" size={18} />
                                    <p>Jadwalkan pemeliharaan berkala untuk alat ini. Jadwal akan otomatis muncul di Kalender Kegiatan.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Tanggal Rencana</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={scheduleDate}
                                        onChange={e => setScheduleDate(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Catatan / Rencana Kegiatan</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={scheduleDesc}
                                        onChange={e => setScheduleDesc(e.target.value)}
                                        placeholder="Contoh: Pengecekan rutin pelumas dan filter..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={scheduling}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {scheduling ? <LoadingSpinner label="Menyimpan..." /> : (
                                        <>
                                            <CalendarPlus size={18} />
                                            Buat Jadwal Maintenance
                                        </>
                                    )}
                                </button>
                            </form>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
