"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MessageSquareWarning, MapPin, User, AlignLeft, UploadCloud, Save, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Pengaduan } from "@/lib/types";

interface AddPengaduanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Pengaduan | null;
  currentUserId?: string | null;
}

export default function AddPengaduanModal({ isOpen, onClose, onSuccess, initialData, currentUserId }: AddPengaduanModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      peralatan_id: "" as string | number, // Store ID
      deskripsi: "",
      akun_id: "" as string,
      status: "Baru",
      dokumentasi: "" as string | null
  });

  const [peralatanList, setPeralatanList] = useState<{id: number, nama: string}[]>([]);

  // ... (fetchPeralatan)

  // Populate Form if Editing
  useEffect(() => {
      if (initialData && isOpen) {
          setFormData({
              peralatan_id: initialData.peralatan_id || "",
              deskripsi: initialData.deskripsi,
              akun_id: initialData.akun_id || "",
              status: initialData.status,
              dokumentasi: initialData.dokumentasi
          });
          setPreviewUrl(initialData.dokumentasi);
      } else if (isOpen) {
        // Reset
        setFormData({
            peralatan_id: "",
            deskripsi: "",
            akun_id: currentUserId || "", // Auto-fill ID
            status: "Baru",
            dokumentasi: null
        });
        setFile(null);
        setPreviewUrl(null);
      }
  }, [initialData, isOpen, currentUserId]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const selectedFile = e.target.files[0];
          setFile(selectedFile);
          
          // Create preview
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
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('pengaduan-evidence')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('pengaduan-evidence')
              .getPublicUrl(filePath);

          return data.publicUrl;
      } catch (error) {
          console.error("Error uploading image:", error);
          alert("Gagal mengupload bukti gambar. Pastikan bucket 'pengaduan-evidence' sudah dibuat.");
          return null;
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.peralatan_id || !formData.deskripsi) {
        alert("Mohon lengkapi Data Peralatan dan Deskripsi");
        return;
    }

    setLoading(true);
    try {
      let finalUrl = formData.dokumentasi;

      if (file) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) {
              finalUrl = uploadedUrl;
          } else {
              setLoading(false);
              return;
          }
      }

      const payload = {
          peralatan_id: formData.peralatan_id,
          deskripsi: formData.deskripsi,
          status: formData.status,
          dokumentasi: finalUrl,
          akun_id: formData.akun_id // Send ID
      };

      let error;
      if (initialData?.id) {
          // UPDATE
          const { error: updateError } = await supabase
              .from("pengaduan")
              .update(payload)
              .eq('id', initialData.id);
          error = updateError;
      } else {
          // INSERT
          const { error: insertError } = await supabase.from("pengaduan").insert([payload]);
          error = insertError;
      }

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving pengaduan:", error);
      alert("Gagal menyimpan pengaduan.");
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
                    <MessageSquareWarning size={24} />
                  </div>
                  {initialData ? 'Edit Pengaduan' : 'Buat Pengaduan Baru'}
                </Dialog.Title>

                 <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Peralatan Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Peralatan (Sesuai Data Aset)</label>
                    <div className="relative group">
                        <select
                             required
                             value={formData.peralatan_id}
                             onChange={e => setFormData({...formData, peralatan_id: e.target.value})}
                             className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">-- Pilih Peralatan --</option>
                            <option value="99999" className="text-yellow-400 font-bold">Lainnya / Tidak Terdaftar</option>
                            {peralatanList.map((item) => (
                                <option key={item.id} value={item.id}>{item.nama}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <AlignLeft size={16} /> {/* Generic icon */}
                        </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Kronologi / Detail</label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <textarea 
                            rows={3}
                            required
                            value={formData.deskripsi}
                            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                            placeholder="Jelaskan detail permasalahan..."
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                        />
                    </div>
                  </div>

                   {/* Pelapor Removed - Auto handled */ }

                   {/* Status (Only show if editing) */}
                   {initialData && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Status Penanganan</label>
                            <select
                                required
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Baru">Baru</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                        </div>
                   )}

                   {/* Upload Bukti */}
                   <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Bukti Foto (Opsional)</label>
                     <div className="w-full bg-slate-900 border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 transition-colors cursor-pointer relative group/upload">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {previewUrl ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Ganti Foto</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500">
                                <ImageIcon size={24} className="mb-2" />
                                <span className="text-xs">Klik untuk upload foto</span>
                            </div>
                        )}
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
                            Kirim Pengaduan
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
