"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Peralatan } from "@/lib/types";

interface AddPeralatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Peralatan | null; // Optional prop for editing
}

export default function AddPeralatanModal({ isOpen, onClose, onSuccess, initialData }: AddPeralatanModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    merk: "",
    no_sertifikat: "-",
    tahun_instalasi: new Date().getFullYear(),
    kondisi_persen: 100,
    status_laik: "LAIK OPERASI",
    keterangan: "-"
  });

  // Populate form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData({
                nama: initialData.nama,
                jenis: initialData.jenis,
                merk: initialData.merk || "",
                no_sertifikat: initialData.no_sertifikat || "-",
                tahun_instalasi: initialData.tahun_instalasi || new Date().getFullYear(),
                kondisi_persen: initialData.kondisi_persen || 100,
                status_laik: initialData.status_laik || "LAIK OPERASI",
                keterangan: initialData.keterangan || "-"
            });
        } else {
            // Reset to default if adding new
            setFormData({
                nama: "",
                jenis: "",
                merk: "",
                no_sertifikat: "-",
                tahun_instalasi: new Date().getFullYear(),
                kondisi_persen: 100,
                status_laik: "LAIK OPERASI",
                keterangan: "-"
            });
        }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tahun_instalasi' || name === 'kondisi_persen' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        // UPDATE existing record
        const { error } = await supabase
            .from('peralatan')
            .update({
                nama: formData.nama,
                jenis: formData.jenis,
                merk: formData.merk,
                no_sertifikat: formData.no_sertifikat,
                tahun_instalasi: formData.tahun_instalasi,
                kondisi_persen: formData.kondisi_persen,
                status_laik: formData.status_laik,
                keterangan: formData.keterangan
            })
            .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // INSERT new record
        const { error } = await supabase.from('peralatan').insert([
            {
            nama: formData.nama,
            jenis: formData.jenis,
            merk: formData.merk,
            no_sertifikat: formData.no_sertifikat,
            tahun_instalasi: formData.tahun_instalasi,
            kondisi_persen: formData.kondisi_persen,
            status_laik: formData.status_laik,
            keterangan: formData.keterangan
            }
        ]);

        if (error) throw error;
      }
      
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Error saving peralatan:", error);
      alert("Gagal menyimpan data peralatan. Cek konsol untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center pl-0 md:pl-[250px] pointer-events-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white">{initialData ? "Edit Data Peralatan" : "Tambah Data Peralatan"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Nama Peralatan</label>
                  <input required name="nama" value={formData.nama} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Contoh: X-Ray Scanner" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Jenis Peralatan</label>
                  <input required name="jenis" value={formData.jenis} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Contoh: Keamanan" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-slate-400">Merk / Tipe / S.N</label>
                  <input name="merk" value={formData.merk} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Merk / Tipe / Serial Number" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">No. Sertifikat</label>
                    <input name="no_sertifikat" value={formData.no_sertifikat} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Tahun Instalasi</label>
                    <input type="number" name="tahun_instalasi" value={formData.tahun_instalasi} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Kondisi (%)</label>
                    <input type="number" min="0" max="100" name="kondisi_persen" value={formData.kondisi_persen} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Status Kelaikan</label>
                    <select name="status_laik" value={formData.status_laik} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none">
                        <option value="LAIK OPERASI">LAIK OPERASI</option>
                        <option value="TIDAK LAIK OPERASI">TIDAK LAIK OPERASI</option>
                    </select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-slate-400">Keterangan</label>
                    <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none" />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 custom-scrollbar">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium">
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {initialData ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
