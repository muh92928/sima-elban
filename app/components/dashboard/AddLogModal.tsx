"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Calendar, Clock, Wrench, FileText, User, Save, Loader2, ChevronDown, Image as ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Peralatan, LogPeralatan } from "@/lib/types";

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLogModal({ isOpen, onClose, onSuccess, initialData }: AddLogModalProps & { initialData?: LogPeralatan | null }) {
  const [loading, setLoading] = useState(false);
  const [peralatanList, setPeralatanList] = useState<Peralatan[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      tanggal: new Date().toISOString().split('T')[0],
      jam: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      peralatan_id: "",
      kegiatan: "",
      keterangan: "",
      pic: "",
      dokumentasi: "" as string, // URL string
  });
  
  const [file, setFile] = useState<File | null>(null);

  // Fetch Peralatan List for Dropdown
  useEffect(() => {
      const fetchPeralatan = async () => {
          const { data } = await supabase.from('peralatan').select('id, nama').order('nama');
          if (data) setPeralatanList(data as Peralatan[]);
      };
      if (isOpen) fetchPeralatan();
  }, [isOpen]);

  // Populate Form if Editing
  useEffect(() => {
      if (initialData && isOpen) {
          setFormData({
              tanggal: initialData.tanggal,
              jam: initialData.jam,
              peralatan_id: initialData.peralatan_id.toString(),
              kegiatan: initialData.kegiatan,
              keterangan: initialData.keterangan || "",
              pic: initialData.pic,
              dokumentasi: initialData.dokumentasi || "",
          });
      } else if (isOpen) {
        // Reset if adding new
        setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            jam: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            peralatan_id: "",
            kegiatan: "",
            keterangan: "",
            pic: "",
            dokumentasi: "",
        });
      }
      setFile(null);
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
      try {
          setUploading(true);
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('log-evidence')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('log-evidence')
              .getPublicUrl(filePath);

          return data.publicUrl;
      } catch (error) {
          console.error("Error uploading image:", error);
          alert("Gagal mengupload gambar. Pastikan bucket 'log-evidence' sudah dibuat dan public.");
          return null;
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.peralatan_id || !formData.kegiatan || !formData.pic) {
        alert("Mohon lengkapi data wajib (Alat, Kegiatan, PIC)");
        return;
    }

    setLoading(true);
    try {
      let dokumentasiUrl = formData.dokumentasi;

      // Upload file if selected
      if (file) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) {
              dokumentasiUrl = uploadedUrl;
          } else {
              setLoading(false);
              return; // Stop if upload failed
          }
      }

      const payload = {
          ...formData,
          peralatan_id: parseInt(formData.peralatan_id),
          dokumentasi: dokumentasiUrl || null
      };

      let error;
      if (initialData?.id) {
          // UPDATE
          const { error: updateError } = await supabase
              .from("log_peralatan")
              .update(payload)
              .eq('id', initialData.id);
          error = updateError;
      } else {
          // INSERT
          const { error: insertError } = await supabase.from("log_peralatan").insert([payload]);
          error = insertError;
      }

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Gagal menyimpan log.");
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
                    <FileText size={24} />
                  </div>
                  {initialData ? 'Edit Log' : 'Tambah Log Baru'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Jam</label>
                        <div className="relative group">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input 
                                type="time"
                                required
                                value={formData.jam}
                                onChange={e => setFormData({...formData, jam: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                      </div>
                  </div>

                  {/* Peralatan Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Nama Peralatan</label>
                    <div className="relative group">
                        <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <select
                            required
                            value={formData.peralatan_id}
                            onChange={e => setFormData({...formData, peralatan_id: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Pilih Peralatan...</option>
                            {peralatanList.map(p => (
                                <option key={p.id} value={p.id}>{p.nama}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Kegiatan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Uraian Kegiatan</label>
                    <textarea 
                        required
                        rows={3}
                        value={formData.kegiatan}
                        onChange={e => setFormData({...formData, kegiatan: e.target.value})}
                        placeholder="Contoh: Perbaikan kabel power yang putus..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  {/* Keterangan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Keterangan (Opsional)</label>
                    <input 
                        type="text"
                        value={formData.keterangan}
                        onChange={e => setFormData({...formData, keterangan: e.target.value})}
                        placeholder="Catatan tambahan..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  
                  {/* Dokumentasi (Upload) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Bukti Dokumentasi (Foto)</label>
                    <div className="relative group">
                        <div className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 flex items-center gap-3">
                             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <ImageIcon size={18} />
                             </div>
                             <div className="flex-1 overflow-hidden">
                                 <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
                                 />
                             </div>
                        </div>
                    </div>
                    {/* Preview or Existing URL */}
                    {(file || formData.dokumentasi) && (
                        <div className="mt-2 flex items-center gap-2">
                             {formData.dokumentasi && !file && (
                                <a href={formData.dokumentasi} target="_blank" rel="noopener" className="text-[10px] text-indigo-400 hover:underline">
                                    Lihat gambar saat ini
                                </a>
                             )}
                             {file && <p className="text-[10px] text-green-400 ml-2">File baru: {file.name}</p>}
                        </div>
                    )}
                  </div>

                  {/* PIC */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">PIC (Teknisi)</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            required
                            value={formData.pic}
                            onChange={e => setFormData({...formData, pic: e.target.value})}
                            placeholder="Nama Teknisi"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
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
                      disabled={loading || uploading}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading || uploading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> 
                            {uploading ? 'Mengupload...' : 'Menyimpan...'}
                          </>
                      ) : (
                          <>
                            <Save size={18} /> 
                            Simpan Log
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
