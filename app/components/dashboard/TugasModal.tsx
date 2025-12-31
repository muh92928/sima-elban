"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tugas, Akun, Peralatan } from "@/lib/types";

interface TugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teknisiList: Akun[];
  peralatanList: Peralatan[];
  initialData?: Tugas | null; // If provided, we are in EDIT mode
}

export default function TugasModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  teknisiList, 
  peralatanList, 
  initialData 
}: TugasModalProps) {
  const isEdit = !!initialData;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [peralatanId, setPeralatanId] = useState<number | "">("");
  const [status, setStatus] = useState<"PENDING" | "PROSES" | "SELESAI">("PENDING");
  
  // Multi-Select State
  const [selectedNips, setSelectedNips] = useState<string[]>([]);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  // Reset/Init form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setJudul(initialData.judul || "");
        setDeskripsi(initialData.deskripsi || "");
        setPeralatanId(initialData.peralatan_id || "");
        setStatus(initialData.status);
        // Single NIP for edit
        setSelectedNips(initialData.ditugaskan_ke_nip ? [initialData.ditugaskan_ke_nip] : []);
      } else {
        // Add Mode Defaults
        setJudul("");
        setDeskripsi("");
        setPeralatanId("");
        setStatus("PENDING");
        setSelectedNips([]);
      }
      setError(null);
      setIsMultiSelectOpen(false);
    }
  }, [isOpen, initialData]);

  const toggleNipSelection = (nip: string) => {
      // Edit Mode: Single Select Only
      if (initialData) {
          setSelectedNips([nip]);
          setIsMultiSelectOpen(false);
          return;
      }

      // Create Mode: Multi Select
      if (selectedNips.includes(nip)) {
          setSelectedNips(prev => prev.filter(n => n !== nip));
      } else {
          setSelectedNips(prev => [...prev, nip]);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!deskripsi.trim()) {
      setError("Deskripsi wajib diisi.");
      setLoading(false);
      return;
    }
    if (selectedNips.length === 0) {
      setError("Teknisi wajib dipilih minimal satu.");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let currentUserNip = user.user_metadata?.nip;
      
      if (!currentUserNip) {
          const { data: akun } = await supabase.from('akun').select('nip').eq('email', user.email!).single();
          if (akun) currentUserNip = akun.nip;
      }

      if (!currentUserNip) throw new Error("NIP pengguna tidak ditemukan.");

      const basePayload = {
        judul: judul.trim() || null,
        deskripsi: deskripsi.trim(),
        peralatan_id: peralatanId === "" ? null : Number(peralatanId),
        status: status,
      };

      let result;
      if (isEdit && initialData) {
        // UPDATE (Single)
        result = await supabase
          .from("tugas")
          .update({
             ...basePayload,
             ditugaskan_ke_nip: selectedNips[0], // Take first
             diupdate_kapan: new Date().toISOString()
          })
          .eq("id", initialData.id);
      } else {
        // INSERT (Multiple)
        const payloads = selectedNips.map(nip => ({
            ...basePayload,
            ditugaskan_ke_nip: nip,
            dibuat_kapan: new Date().toISOString(),
            dibuat_oleh_nip: currentUserNip,
            sumber: "KANIT"
        }));

        result = await supabase
          .from("tugas")
          .insert(payloads);
      }

      const { error: dbError } = result;
      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving tugas:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan tugas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !loading && onClose()}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-white flex items-center gap-2">
                    {isEdit ? "Edit Tugas" : "Tambah Tugas"}
                  </Dialog.Title>
                  <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Teknisi (Multi-Select) */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {isEdit ? "Teknisi (Edit Data)" : "Pilih Teknisi (Bisa Lebih Dari 1)"} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <div
                          onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                          className="w-full min-h-[48px] bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-left text-white focus:outline-none focus:border-indigo-500 transition-colors flex flex-wrap gap-2 cursor-pointer"
                        >
                           {selectedNips.length === 0 && (
                               <span className="text-slate-500 py-1 pl-1">— Pilih Teknisi —</span>
                           )}
                           
                           {selectedNips.map(nip => {
                               const tech = teknisiList.find(t => t.nip === nip);
                               return (
                                   <div key={nip} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs rounded-lg pl-2 pr-1 py-1 flex items-center gap-1">
                                       <span>{tech?.nama || nip}</span>
                                       <button
                                           type="button" 
                                           onClick={(e) => { e.stopPropagation(); toggleNipSelection(nip); }}
                                           className="hover:bg-indigo-500/30 rounded p-0.5 text-indigo-300 hover:text-white transition-colors"
                                        >
                                           <X size={12} />
                                       </button>
                                   </div>
                               );
                           })}
                        </div>

                         {/* Dropdown Menu */}
                         {isMultiSelectOpen && (
                             <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 p-1">
                                 {teknisiList.length === 0 && (
                                     <div className="p-3 text-center text-xs text-slate-500">Tidak ada data teknisi.</div>
                                 )}
                                 {teknisiList.map(t => {
                                     const isSelected = selectedNips.includes(t.nip);
                                     return (
                                         <div 
                                            key={t.nip}
                                            onClick={() => toggleNipSelection(t.nip)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'}`}
                                         >
                                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-500'}`}>
                                                 {isSelected && <CheckCircle size={10} />}
                                             </div>
                                             <div className="flex-1">
                                                 <div className="text-sm font-medium">{t.nama}</div>
                                                 <div className="text-[10px] opacity-60 font-mono">{t.nip}</div>
                                             </div>
                                         </div>
                                     )
                                 })}
                             </div>
                         )}
                    </div>
                    {/* Overlay to close */}
                    {isMultiSelectOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => setIsMultiSelectOpen(false)} />
                    )}
                  </div>

                  {/* Peralatan (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Peralatan (Opsional)
                    </label>
                    <select
                      value={peralatanId}
                      onChange={(e) => setPeralatanId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                      disabled={loading}
                    >
                      <option value="">— Tidak Ada —</option>
                      {peralatanList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} {p.merk ? `- ${p.merk}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Judul (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Judul Tugas (Opsional)
                    </label>
                    <input
                      type="text"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Contoh: Perbaikan CCTV Gate 1"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      disabled={loading}
                      maxLength={160}
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Deskripsi <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Jelaskan detail pekerjaan..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px]"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Status (Only on Edit) */}
                  {isEdit && (
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                          disabled={loading}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROSES">PROSES</option>
                          <option value="SELESAI">SELESAI</option>
                        </select>
                     </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Simpan
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
