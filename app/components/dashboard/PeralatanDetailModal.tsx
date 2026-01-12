"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { X, QrCode, History, Info, CalendarPlus, FileText, Wrench, CheckCircle2, AlertTriangle, AlertOctagon, User, Calendar } from "lucide-react";
import { Peralatan, LogPeralatan, Tugas } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { toast, useToaster } from "react-hot-toast";
import { useLayout } from "@/app/context/LayoutContext";
import { useRouter } from "next/navigation";
 
interface PeralatanDetailModalProps {
   isOpen: boolean;
  onClose: () => void;
  data: Peralatan | null;
  userRole?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PeralatanDetailModal({ isOpen, onClose, data, userRole = "" }: PeralatanDetailModalProps) {
  const { isComplaintVisible } = useLayout();
  const { toasts } = useToaster();
  const isToastActive = toasts.some(t => t.visible);
  
  const shouldShift = isComplaintVisible || isToastActive;

  const [history, setHistory] = useState<(LogPeralatan | Tugas)[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const router = useRouter(); 

  // Derived Permission
  const isKanitElban = userRole.includes("KANIT_ELBAN");

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

  const handleNavigateToTask = () => {
      if (!data) return;
      router.push(`/tugas?action=create&equipmentId=${data.id}&equipmentName=${encodeURIComponent(data.nama)}`);
  };

  if (!data) return null;

  return (
    <>

    {isOpen && (
      <>
        <style type="text/css" media="print">
            {`
                @media print {
                    @page { size: portrait; margin: 0; }
                    body { visibility: hidden; background: white; }
                    .qr-print-area { 
                        visibility: visible; 
                        position: fixed; 
                        top: 0; 
                        left: 0; 
                        width: 100vw; 
                        height: 100vh; 
                        display: flex !important; 
                        align-items: center; 
                        justify-content: center; 
                        background: white; 
                        z-index: 99999;
                    }
                    .qr-print-content {
                        visibility: visible;
                        display: flex !important;
                        flex-direction: column;
                        align-items: center;
                        border: 2px solid black;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                    }
                    .qr-print-content * { visibility: visible; }
                    
                    /* Hide other print elements from parent */
                    .print-block, .print-container { display: none !important; }
                }
            `}
        </style>
        
        {/* Printable Area - Only Visible in Print */}
        <div className="qr-print-area hidden">
            <div className="qr-print-content gap-4">
                <div className="flex items-center gap-2 mb-2">
                    <img src="/logo_kemenhub.png" className="w-10 h-10 object-contain" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase leading-tight">Direktorat Jenderal Perhubungan Udara</p>
                        <p className="text-[12px] font-black uppercase leading-tight">Bandara Karel Sadsuitubun</p>
                    </div>
                </div>
                
                <QRCode value={`https://sima-elban.vercel.app/peralatan?id=${data.id}`} size={250} />
                
                <div className="mt-4">
                    <h2 className="text-3xl font-black text-black mb-2 text-center leading-tight">{data.nama}</h2>
                    <div className="border-t-2 border-black w-full my-2"></div>
                    <p className="text-black font-bold text-lg">Tahun Instalasi: {data.tahun_instalasi || '-'}</p>
                </div>
            </div>
        </div>
      </>
    )}

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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className={`fixed inset-0 overflow-y-auto transition-[padding] duration-300 ease-in-out ${shouldShift ? 'pt-72 md:pt-32' : ''}`}>
          <div className={`flex min-h-full justify-center p-4 text-center ${shouldShift ? 'items-start' : 'items-center'}`}>
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
                    <Tab.List className="flex space-x-1 rounded-xl bg-slate-800/50 p-1 mb-6 border border-white/5 overflow-x-auto">
                        <Tab className={({ selected }) =>
                            classNames('w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <Info size={16} /> Detail
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <History size={16} /> Riwayat
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap',
                            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/[0.12] hover:text-white')
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <QrCode size={16} /> QR Code
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            classNames('w-full min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 transition-all whitespace-nowrap',
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
                                    value={`https://sima-elban.vercel.app/peralatan?id=${data.id}`} 
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
                            {isKanitElban ? (
                                <div className="space-y-6 text-center py-6">
                                    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                                            <CalendarPlus size={32} className="text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Jadwalkan Pemeliharaan</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                                            Buat tugas maintenance baru untuk <b>{data.nama}</b>. Tugas akan otomatis masuk ke kategori "Tugas Kanit Elban" dan kalender kegiatan.
                                        </p>
                                        
                                        <button 
                                            onClick={handleNavigateToTask}
                                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <ListTodo size={18} />
                                            Buat Jadwal via Tugas
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Fitur ini khusus untuk peran KANIT ELBAN.
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                                        <AlertOctagon className="text-slate-500" size={24} />
                                    </div>
                                    <h4 className="text-slate-300 font-bold">Akses Dibatasi</h4>
                                    <p className="text-slate-500 text-sm max-w-xs">
                                        Fitur penjadwalan maintenance hanya tersedia untuk KANIT ELBAN.
                                    </p>
                                </div>
                            )}
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </>
  );
}
