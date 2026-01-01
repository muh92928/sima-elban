"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Wrench, Save, Loader2, ImageIcon, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Pengaduan } from "@/lib/types";

interface ProcessPengaduanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: Pengaduan | null;
}

export default function ProcessPengaduanModal({ isOpen, onClose, onSuccess, data }: ProcessPengaduanModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'Baru' | 'Diproses' | 'Selesai'>('Baru');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && data) {
        setStatus(data.status);
        setPreviewUrl(data.bukti_petugas || null);
    } else {
        setFile(null);
        setPreviewUrl(null);
    }
  }, [isOpen, data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const selectedFile = e.target.files[0];
          setFile(selectedFile);
          
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
      }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
      try {
          setUploading(true);
          const fileExt = file.name.split('.').pop();
          const fileName = `petugas-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
              .from('pengaduan-evidence')
              .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('pengaduan-evidence')
              .getPublicUrl(fileName);

          return data.publicUrl;
      } catch (error) {
          console.error("Error uploading image:", error);
          alert("Gagal mengupload bukti petugas.");
          return null;
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setLoading(true);
    try {
      let finalUrl = data.bukti_petugas;

      if (file) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) {
              finalUrl = uploadedUrl;
          } else {
              setLoading(false);
              return;
          }
      }

      const { error } = await supabase
          .from("pengaduan")
          .update({ 
              status: status,
              bukti_petugas: finalUrl
          })
          .eq('id', data.id);

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating pengaduan:", error);
      alert("Gagal memperbarui pengaduan.");
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0F172A] border border-white/10 p-6 shadow-2xl transition-all relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>

                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Wrench size={24} />
                  </div>
                  <div>
                      Proses Pengaduan
                      <span className="block text-xs font-normal text-slate-400 mt-1">
                          ID: #{data?.id}
                      </span>
                  </div>
                </Dialog.Title>

                <div className="mb-6 bg-slate-800/50 rounded-xl p-4 border border-white/5 space-y-2">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Peralatan</span>
                        <p className="text-white font-medium">{data?.peralatan?.nama || "Tidak Diketahui"}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Keluhan</span>
                        <p className="text-slate-300 text-sm line-clamp-3">{data?.deskripsi}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Status Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300">Update Status</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Baru', 'Diproses', 'Selesai'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s as any)}
                                className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${
                                    status === s 
                                    ? s === 'Selesai' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                      : s === 'Diproses' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                      : 'bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-500/20'
                                    : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Evidence Upload (Required if Selesai) */}
                  <div className={`space-y-3 transition-all ${status === 'Selesai' ? 'opacity-100' : 'opacity-50'}`}>
                     <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                        Bukti Penyelesaian (Petugas)
                        {status === 'Selesai' && <span className="text-xs text-emerald-400 font-normal">*Disarankan</span>}
                     </label>
                     
                     <div className="w-full bg-slate-900 border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 transition-colors cursor-pointer relative group/upload">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {previewUrl ? (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Ganti Bukti</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500 py-4">
                                <UploadCloud size={32} className="mb-2 text-slate-600" />
                                <span className="text-xs font-medium">Upload Foto Bukti Perbaikan</span>
                            </div>
                        )}
                     </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex gap-3">
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
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || uploading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={18} />
                        )}
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

function UploadCloud({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    )
}
