"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { createPersonel, updatePersonel } from "@/app/(admin)/personel/actions";

interface PersonelData {
  id?: string;
  nama: string;
  nip: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jabatan: string | null;
  formasiPendidikan: string | null;
  kompetensiPendidikan: string | null;
  noSertifikat: string | null;
  jenisSertifikat: string | null;
  keterangan: string | null;
}

interface AddPersonelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: PersonelData | null;
}

export default function AddPersonelModal({ isOpen, onClose, onSuccess, initialData }: AddPersonelModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    tempatLahir: "",
    tanggalLahir: "",
    jabatan: "",
    formasiPendidikan: "",
    kompetensiPendidikan: "",
    noSertifikat: "",
    jenisSertifikat: "",
    keterangan: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama || "",
        nip: initialData.nip || "",
        tempatLahir: initialData.tempatLahir || "",
        tanggalLahir: initialData.tanggalLahir || "",
        jabatan: initialData.jabatan || "",
        formasiPendidikan: initialData.formasiPendidikan || "",
        kompetensiPendidikan: initialData.kompetensiPendidikan || "",
        noSertifikat: initialData.noSertifikat || "",
        jenisSertifikat: initialData.jenisSertifikat || "",
        keterangan: initialData.keterangan || ""
      });
    } else {
      setFormData({
        nama: "",
        nip: "",
        tempatLahir: "",
        tanggalLahir: "",
        jabatan: "",
        formasiPendidikan: "",
        kompetensiPendidikan: "",
        noSertifikat: "",
        jenisSertifikat: "",
        keterangan: ""
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
         // Update mode
         const res = await updatePersonel(initialData.id, formData);
         if (!res.success) throw new Error(res.error);
         toast.success("Data personel berhasil diperbarui!");
      } else {
        // Insert mode
        const res = await createPersonel(formData);
         if (!res.success) throw new Error(res.error);
        toast.success("Personel berhasil ditambahkan!");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving personel:", error);
      toast.error(error.message || "Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Data Personel" : "Tambah Personel Baru"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="personelForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nama & NIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
                <input 
                  required
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Nama Pegawai"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">NIP</label>
                <input 
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
            </div>

            {/* Tempat & Tanggal Lahir */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tempat Lahir</label>
                <input 
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Kota Kelahiran"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tanggal Lahir</label>
                <input 
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Jabatan */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Jabatan <span className="text-red-500">*</span></label>
                <input 
                  required
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Contoh: Teknisi Penerbangan Pelaksana"
                />
            </div>

            {/* Pendidikan & Kompetensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Formasi Pendidikan</label>
                <input 
                  name="formasiPendidikan"
                  value={formData.formasiPendidikan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Contoh: D3 Teknik Listrik Bandara"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Kompetensi Pendidikan</label>
                <input 
                  name="kompetensiPendidikan"
                  value={formData.kompetensiPendidikan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Detail Kompetensi"
                />
              </div>
            </div>

            {/* Sertifikat Kompetensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Jenis Sertifikat</label>
                <input 
                  name="jenisSertifikat"
                  value={formData.jenisSertifikat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Contoh: SKP Ahli"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nomor Sertifikat</label>
                <input 
                  name="noSertifikat"
                  value={formData.noSertifikat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Nomor Sertifikat"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Keterangan</label>
              <textarea 
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-white placeholder:text-slate-500"
                placeholder="Keterangan tambahan..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-slate-900/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="personelForm"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
            {initialData ? "Simpan Perubahan" : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
