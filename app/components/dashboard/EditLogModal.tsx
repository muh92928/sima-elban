"use client";

import { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LogPeralatan, Peralatan } from "@/lib/types";

interface EditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  logData: LogPeralatan | null; // Data to edit
  peralatanList: Peralatan[]; // Needed to change equipment if allowed, or just display
}

const STATUS_OPTIONS: ('Normal Ops' | 'Perlu Perbaikan' | 'Perlu Perawatan')[] = [
  'Normal Ops', 'Perlu Perbaikan', 'Perlu Perawatan'
];

export default function EditLogModal({ isOpen, onClose, onSuccess, logData, peralatanList }: EditLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    tanggal: string;
    peralatan_id: number;
    waktu_operasi_aktual: number;
    waktu_operasi_diterapkan: number;
    mematikan_terjadwal: number;
    periode_kegagalan: number;
    status: 'Normal Ops' | 'Perlu Perbaikan' | 'Perlu Perawatan';
  }>({
    tanggal: '',
    peralatan_id: 0,
    waktu_operasi_aktual: 0,
    waktu_operasi_diterapkan: 0,
    mematikan_terjadwal: 0,
    periode_kegagalan: 0,
    status: 'Normal Ops',
  });

  // Initialize form when logData changes
  useEffect(() => {
    if (logData) {
      setFormData({
        tanggal: logData.tanggal,
        peralatan_id: logData.peralatan_id,
        waktu_operasi_aktual: logData.waktu_operasi_aktual,
        waktu_operasi_diterapkan: logData.waktu_operasi_diterapkan,
        mematikan_terjadwal: logData.mematikan_terjadwal,
        periode_kegagalan: logData.periode_kegagalan,
        status: logData.status,
      });
    }
  }, [logData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logData) return;
    
    setLoading(true);
    setError(null);

    try {
      // Logic from PHP: "hindari duplikat peralatan_id + tanggal (selain id ini)"
      // Check duplicate
      const { data: duplicate } = await supabase
        .from('log_peralatan')
        .select('id')
        .eq('peralatan_id', formData.peralatan_id)
        .eq('tanggal', formData.tanggal)
        .neq('id', logData.id)
        .single();
      
      if (duplicate) {
        throw new Error("Log untuk peralatan dan tanggal tersebut sudah ada.");
      }

      const { error: updateError } = await supabase
        .from('log_peralatan')
        .update({
          peralatan_id: formData.peralatan_id,
          tanggal: formData.tanggal,
          waktu_operasi_aktual: formData.waktu_operasi_aktual,
          waktu_operasi_diterapkan: formData.waktu_operasi_diterapkan,
          mematikan_terjadwal: formData.mematikan_terjadwal,
          periode_kegagalan: formData.periode_kegagalan,
          status: formData.status,
          diupdate_kapan: new Date().toISOString(),
        })
        .eq('id', logData.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mengupdate data.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-white">
                    Edit Log Peralatan
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peralatan *</label>
                          <select 
                            required
                            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                            value={formData.peralatan_id}
                            onChange={(e) => setFormData({...formData, peralatan_id: Number(e.target.value)})}
                          >
                            <option value={0} disabled>Pilih Peralatan</option>
                            {peralatanList.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nama} {p.merk ? `(${p.merk})` : ''} - {p.jenis}
                                </option>
                            ))}
                          </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal *</label>
                          <input
                              type="date"
                              required
                              value={formData.tanggal}
                              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">WO Aktual</label>
                          <input type="number" min="0" required
                              value={formData.waktu_operasi_aktual}
                              onChange={(e) => setFormData({...formData, waktu_operasi_aktual: Number(e.target.value)})}
                              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">WO Diterapkan</label>
                          <input type="number" min="0" required
                              value={formData.waktu_operasi_diterapkan}
                              onChange={(e) => setFormData({...formData, waktu_operasi_diterapkan: Number(e.target.value)})}
                              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mematikan Terjadwal</label>
                          <input type="number" min="0" required
                              value={formData.mematikan_terjadwal}
                              onChange={(e) => setFormData({...formData, mematikan_terjadwal: Number(e.target.value)})}
                              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Periode Kegagalan</label>
                          <input type="number" min="0" required
                              value={formData.periode_kegagalan}
                              onChange={(e) => setFormData({...formData, periode_kegagalan: Number(e.target.value)})}
                              className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                          <select 
                            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                          >
                              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                      </div>

                      <p className="text-xs text-slate-500 md:col-span-2 italic">
                        * Dokumentasi tidak dapat diubah di sini (upload hanya tersedia saat tambah data).
                      </p>
                   </div>

                   <div className="flex justify-end pt-4 border-t border-white/10 gap-3">
                       <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-slate-400 hover:text-white font-semibold text-sm transition-colors"
                       >
                          Batal
                       </button>
                       <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                       >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          Simpan Perubahan
                       </button>
                   </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
