"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Calendar, Clock, MapPin, AlignLeft, Info, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Jadwal } from "@/lib/types";

interface AddJadwalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Jadwal | null;
}

export default function AddJadwalModal({ isOpen, onClose, onSuccess, initialData }: AddJadwalModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      nama_kegiatan: "",
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      lokasi: "",
      keterangan: "",
  });

  // Populate Form if Editing
  useEffect(() => {
      if (initialData && isOpen) {
          setFormData({
              nama_kegiatan: initialData.nama_kegiatan,
              tanggal: initialData.tanggal,
              waktu: initialData.waktu,
              lokasi: initialData.lokasi,
              keterangan: initialData.keterangan || "",
          });
      } else if (isOpen) {
        // Reset if adding new
        setFormData({
            nama_kegiatan: "",
            tanggal: new Date().toISOString().split('T')[0],
            waktu: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            lokasi: "",
            keterangan: "",
        });
      }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kegiatan || !formData.lokasi) {
        alert("Mohon lengkapi Nama Kegiatan dan Lokasi");
        return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      let error;

      if (initialData?.id) {
          // UPDATE
          const { error: updateError } = await supabase
              .from("jadwal")
              .update(payload)
              .eq('id', initialData.id);
          error = updateError;
      } else {
          // INSERT
          const { error: insertError } = await supabase.from("jadwal").insert([payload]);
          error = insertError;
      }

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving jadwal:", error);
      alert("Gagal menyimpan jadwal.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#0F172A] border border-white/10 p-6 shadow-2xl transition-all relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>

                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white mb-6 flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Calendar size={24} />
                  </div>
                  {initialData ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Kegiatan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Nama Kegiatan</label>
                    <div className="relative group">
                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            required
                            value={formData.nama_kegiatan}
                            onChange={e => setFormData({...formData, nama_kegiatan: e.target.value})}
                            placeholder="Contoh: Rapat Koordinasi"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Tanggal</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input 
                                type="date"
                                required
                                value={formData.tanggal}
                                onChange={e => setFormData({...formData, tanggal: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Waktu</label>
                        <div className="relative group">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input 
                                type="time"
                                required
                                value={formData.waktu}
                                onChange={e => setFormData({...formData, waktu: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                      </div>
                  </div>

                  {/* Lokasi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Lokasi</label>
                    <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            required
                            value={formData.lokasi}
                            onChange={e => setFormData({...formData, lokasi: e.target.value})}
                            placeholder="Contoh: Ruang Rapat Utama"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Keterangan</label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <textarea 
                            rows={3}
                            value={formData.keterangan}
                            onChange={e => setFormData({...formData, keterangan: e.target.value})}
                            placeholder="Detail tambahan..."
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                        />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4 mt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> 
                            Menyimpan...
                          </>
                      ) : (
                          <>
                            <Save size={18} /> 
                            Simpan Jadwal
                          </>
                      )}
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
