"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, UploadCloud, FileText, Tag, AlignLeft, Info, Save, Loader2, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FileItem } from "@/lib/types";

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: FileItem | null;
}

export default function AddFileModal({ isOpen, onClose, onSuccess, initialData }: AddFileModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      nama: "",
      kategori: "Dokumen Umum",
      catatan: "",
      url: "" as string,
      tipe: "" as string,
      ukuran: 0 as number,
  });

  // Populate Form if Editing
  useEffect(() => {
      if (initialData && isOpen) {
          setFormData({
              nama: initialData.nama,
              kategori: initialData.kategori,
              catatan: initialData.catatan || "",
              url: initialData.url,
              tipe: initialData.tipe || "",
              ukuran: initialData.ukuran || 0,
          });
      } else if (isOpen) {
        // Reset if adding new
        setFormData({
            nama: "",
            kategori: "Dokumen Umum",
            catatan: "",
            url: "",
            tipe: "",
            ukuran: 0,
        });
        setFile(null);
      }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const selectedFile = e.target.files[0];
          setFile(selectedFile);
          
          // Auto-fill name if empty
          if (!formData.nama) {
            setFormData(prev => ({ 
                ...prev, 
                nama: selectedFile.name,
                tipe: selectedFile.type,
                ukuran: selectedFile.size
            }));
          } else {
             setFormData(prev => ({ 
                ...prev, 
                tipe: selectedFile.type,
                ukuran: selectedFile.size
            })); 
          }
      }
  };

  const uploadFileToBucket = async (file: File): Promise<string | null> => {
      try {
          setUploading(true);
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('documents')
              .getPublicUrl(filePath);

          return data.publicUrl;
      } catch (error) {
          console.error("Error uploading file:", error);
          alert("Gagal mengupload file ke storage. Pastikan bucket 'documents' sudah dibuat.");
          return null;
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
        alert("Mohon isi Nama File");
        return;
    }

    if (!file && !formData.url) {
        alert("Mohon pilih file yang akan diupload.");
        return;
    }

    setLoading(true);
    try {
      let finalUrl = formData.url;

      // Upload file if selected
      if (file) {
          const uploadedUrl = await uploadFileToBucket(file);
          if (uploadedUrl) {
              finalUrl = uploadedUrl;
          } else {
              setLoading(false);
              return; // Stop if upload failed
          }
      }

      const payload = {
          ...formData,
          url: finalUrl
      };

      let error;
      if (initialData?.id) {
          // UPDATE
          const { error: updateError } = await supabase
              .from("files")
              .update(payload)
              .eq('id', initialData.id);
          error = updateError;
      } else {
          // INSERT
          const { error: insertError } = await supabase.from("files").insert([payload]);
          error = insertError;
      }

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving file record:", error);
      alert("Gagal menyimpan data file.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
      "Dokumen Umum", "Laporan", "Manual Book", "Sertifikat", "Surat Masuk", "Surat Keluar", "Lainnya"
  ];

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
                    <UploadCloud size={24} />
                  </div>
                  {initialData ? 'Edit Data File' : 'Upload File Baru'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Upload Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Pilih File</label>
                    <div className="relative group">
                        <div className="w-full bg-slate-900 border-2 border-dashed border-white/10 rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 transition-colors cursor-pointer group-hover:bg-slate-800/50">
                             <input 
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             <div className="p-3 bg-slate-800 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                             </div>
                             <div className="text-center">
                                 <p className="text-sm font-medium text-white">
                                     {file ? file.name : "Klik atau drag file ke sini"}
                                 </p>
                                 <p className="text-xs text-slate-500 mt-1">
                                     {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, JPG, PNG, XLS (Max 10MB)"}
                                 </p>
                             </div>
                        </div>
                    </div>
                     {/* Existing URL info */}
                     {initialData && !file && (
                        <div className="flex items-center gap-2 mt-2 ml-1">
                            <Paperclip size={12} className="text-slate-500" />
                            <a href={initialData.url} target="_blank" className="text-xs text-indigo-400 hover:underline">
                                File saat ini tersimpan
                            </a>
                        </div>
                     )}
                  </div>

                  {/* Nama File */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Nama File</label>
                    <div className="relative group">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            required
                            value={formData.nama}
                            onChange={e => setFormData({...formData, nama: e.target.value})}
                            placeholder="Contoh: Laporan Bulanan Januari"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Kategori</label>
                    <div className="relative group">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <select
                            required
                            value={formData.kategori}
                            onChange={e => setFormData({...formData, kategori: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                  </div>

                  {/* Catatan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Catatan</label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <textarea 
                            rows={3}
                            value={formData.catatan}
                            onChange={e => setFormData({...formData, catatan: e.target.value})}
                            placeholder="Keterangan tambahan..."
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
                            Simpan File
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
