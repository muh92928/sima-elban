"use client";

import { useState, useEffect, Fragment } from "react";
import { X, Save } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { toast, useToaster } from "react-hot-toast";
import { createPersonel, updatePersonel } from "@/app/(admin)/personel/actions";
import { useLayout } from "@/app/context/LayoutContext";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Award } from "lucide-react";
import { Sertifikat } from "@/lib/types";

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
  const [isSearching, setIsSearching] = useState(false);
  const [nipFound, setNipFound] = useState(false);

  const { setIsModalOpen } = useLayout();
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen, setIsModalOpen]);
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

  const [sertifikats, setSertifikats] = useState<Sertifikat[]>([]);

  const addSertifikat = () => {
    setSertifikats(prev => [
      ...prev, 
      { id: Math.random().toString(36).substr(2, 9), jenis: "", nomor: "", kompetensi: "" }
    ]);
  };

  const removeSertifikat = (id: string) => {
    setSertifikats(prev => prev.filter(s => s.id !== id));
  };

  const updateSertifikat = (id: string, field: keyof Sertifikat, value: string) => {
    setSertifikats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

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

      // Parse sertifikats if available (stored in kompetensiPendidikan as JSON)
      try {
        if (initialData.kompetensiPendidikan && initialData.kompetensiPendidikan.startsWith('[')) {
          setSertifikats(JSON.parse(initialData.kompetensiPendidikan));
        } else {
          // Fallback: If only old single data exists, convert to first item in array
          if (initialData.jenisSertifikat || initialData.noSertifikat || initialData.kompetensiPendidikan) {
            setSertifikats([{
                id: 'legacy',
                jenis: initialData.jenisSertifikat || "",
                nomor: initialData.noSertifikat || "",
                kompetensi: initialData.kompetensiPendidikan || ""
            }]);
          } else {
            setSertifikats([]);
          }
        }
      } catch (e) {
        setSertifikats([]);
      }
    } else {
      setSertifikats([]);
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

  // Auto-fill Nama based on NIP
  useEffect(() => {
    const fetchNameByNIP = async () => {
      // Clear name if NIP is too short or cleared
      if (!formData.nip || formData.nip.length < 18) {
        if (!initialData) { // Only clear if we're in "Add" mode
           setFormData(prev => ({ ...prev, nama: "" }));
        }
        setNipFound(false);
        setIsSearching(false);
        return;
      }

      // Only fetch if it's a new entry (not edit mode)
      if (initialData?.id) return;

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('akun')
          .select('nama')
          .eq('nip', formData.nip)
          .single();

        if (data && data.nama) {
          setFormData(prev => ({ ...prev, nama: data.nama }));
          setNipFound(true);
        } else {
          setNipFound(false);
        }
      } catch (err) {
        setNipFound(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
        fetchNameByNIP();
    }, 500); // Debounce to allow user to finish typing

    return () => clearTimeout(timer);
  }, [formData.nip, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        kompetensiPendidikan: JSON.stringify(sertifikats),
        // Keep single latest for compatibility if needed, or summary
        jenisSertifikat: sertifikats.length > 0 ? sertifikats.map(s => s.jenis).join(", ") : "-",
        noSertifikat: sertifikats.length > 0 ? sertifikats.map(s => s.nomor).join(", ") : "-"
      };

      if (initialData?.id) {
         // Update mode
         const res = await updatePersonel(initialData.id, payload);
         if (!res.success) throw new Error(res.error);
         toast.success("Data personel berhasil diperbarui!");
      } else {
        // Insert mode
        const res = await createPersonel(payload);
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
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
                    
                    {/* NIP & Nama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">NIP</label>
                            {isSearching && (
                                <span className="flex items-center gap-1.5 text-xs text-indigo-400">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Mencari...
                                </span>
                            )}
                            {!isSearching && nipFound && !initialData && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                                    Ditemukan ✓
                                </span>
                            )}
                        </div>
                        <input 
                          name="nip"
                          value={formData.nip}
                          onChange={handleChange}
                          autoComplete="off"
                          className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500 transition-all"
                          placeholder="Nomor Induk Pegawai"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input 
                          required
                          name="nama"
                          value={formData.nama}
                          onChange={handleChange}
                          readOnly={!initialData?.id}
                          className={`w-full px-4 py-2 border border-white/10 rounded-xl outline-none text-white placeholder:text-slate-500 transition-all ${
                            !initialData?.id 
                              ? "bg-slate-800/50 text-slate-400 cursor-not-allowed border-dashed focus:ring-0" 
                              : "bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                          }`}
                          placeholder={!initialData?.id ? "Terisi otomatis via NIP" : "Nama Pegawai"}
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

                    {/* Pendidikan */}
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

                    {/* Dynamic Kompetensi Rows */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <Award size={18} className="text-orange-400" />
                                <h3>Kompetensi</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={addSertifikat}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all border border-indigo-500/20"
                            >
                                <Plus size={14} />
                                Tambah Kompetensi
                            </button>
                        </div>

                        {sertifikats.length === 0 ? (
                            <div className="text-center py-6 bg-slate-800/30 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs italic">
                                Belum ada kompetensi yang ditambahkan.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sertifikats.map((s, idx) => (
                                    <div key={s.id} className="p-4 bg-slate-800/50 border border-white/10 rounded-xl space-y-3 relative group">
                                        <div className="absolute -left-1 top-4 w-1 h-8 bg-orange-500/50 rounded-full" />
                                        
                                        {/* Row 1: Detail Kompetensi (Full Width) */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Detail Kompetensi</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={s.kompetensi}
                                                    onChange={(e) => updateSertifikat(s.id, 'kompetensi', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-900 border border-white/5 rounded-lg text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                    placeholder=""
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeSertifikat(s.id)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Hapus baris ini"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Jenis & Nomor Sertifikat */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Sertifikat</label>
                                                <input 
                                                    value={s.jenis}
                                                    onChange={(e) => updateSertifikat(s.id, 'jenis', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-lg text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                    placeholder=""
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Sertifikat</label>
                                                <input 
                                                    value={s.nomor}
                                                    onChange={(e) => updateSertifikat(s.id, 'nomor', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-lg text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                    placeholder=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
