"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Calendar, ClipboardList, User, AlertCircle, CheckCircle2, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tugas } from "@/lib/types";

interface AddTugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Tugas | null;
}

export default function AddTugasModal({ isOpen, onClose, onSuccess, initialData }: AddTugasModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      judul: "",
      deskripsi: "",
      status: "Belum Dikerjakan",
  });

  const [technicians, setTechnicians] = useState<{nip: string, nama: string}[]>([]);
  const [selectedNips, setSelectedNips] = useState<string[]>([]);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  // Fetch Technicians on Mount
  useEffect(() => {
      const fetchTechnicians = async () => {
          const { data } = await supabase
              .from('akun')
              .select('nip, nama')
              .ilike('peran', '%TEKNISI%') 
              .eq('status', 'AKTIF');
          
          if (data) setTechnicians(data);
      };
      fetchTechnicians();
  }, []);

  // Populate Form if Editing
  useEffect(() => {
      if (initialData && isOpen) {
          setFormData({
              judul: initialData.judul || "",
              deskripsi: initialData.deskripsi,
              status: initialData.status,
          });
          // For edit, we only have one assignee
          if (initialData.ditugaskan_ke_nip) {
              setSelectedNips([initialData.ditugaskan_ke_nip]);
          }
      } else if (isOpen) {
        // Reset if adding new
        setFormData({
            judul: "",
            deskripsi: "",
            status: "Belum Dikerjakan",
        });
        setSelectedNips([]);
      }
  }, [initialData, isOpen]);

  const toggleNipSelection = (nip: string) => {
      // If editing, force single selection behavior or disable?
      // Let's ensure if editing, we behave like a radio (single select) or restrict it.
      // But user might want to re-assign.
      // Simplest for Edit: Allow changing, but only 1.
      if (initialData?.id) {
          setSelectedNips([nip]);
          setIsMultiSelectOpen(false); // Close on select for single mode
          return;
      }

      // Create Mode: Multi-select
      if (selectedNips.includes(nip)) {
          setSelectedNips(prev => prev.filter(n => n !== nip));
      } else {
          setSelectedNips(prev => [...prev, nip]);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || selectedNips.length === 0) {
        alert("Mohon lengkapi Judul dan pilih minimal satu Penanggung Jawab");
        return;
    }

    setLoading(true);
    try {
      let error;

      if (initialData?.id) {
          // UPDATE (Single Task)
          // We take the first (and should be only) NIP from selectedNips
          const singleNip = selectedNips[0];
          const payload = { 
              ...formData,
              ditugaskan_ke_nip: singleNip
          };

          const { error: updateError } = await supabase
              .from("tugas")
              .update(payload)
              .eq('id', initialData.id);
          error = updateError;
      } else {
          // INSERT (Potentially Multiple Tasks)
          // Create one task row for EACH selected technician
          const payloads = selectedNips.map(nip => ({
              ...formData,
              ditugaskan_ke_nip: nip,
              dibuat_kapan: new Date().toISOString() // Ensure timestamp
          }));

          const { error: insertError } = await supabase.from("tugas").insert(payloads);
          error = insertError;
      }

      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving tugas:", error);
      alert("Gagal menyimpan tugas.");
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
                    <ClipboardList size={24} />
                  </div>
                  {initialData ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Judul */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Judul Tugas</label>
                    <input 
                        type="text"
                        required
                        value={formData.judul}
                        onChange={e => setFormData({...formData, judul: e.target.value})}
                        placeholder="Contoh: Maintenance Server"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Deskripsi</label>
                    <textarea 
                        rows={3}
                        value={formData.deskripsi}
                        onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                        placeholder="Detail pekerjaan..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>

                   {/* PIC & Status Row */}
                   <div className="grid grid-cols-2 gap-4">
                      {/* Custom Multi Select for PIC */}
                      <div className="space-y-1.5 relative">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">
                            {initialData ? "Penanggung Jawab" : "Pilih Teknisi (Bisa > 1)"}
                        </label>
                        <div className="relative">
                             <button
                                type="button"
                                onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-left text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all flex items-center justify-between"
                             >
                                <div className="flex items-center gap-2 overflow-hidden">
                                     <User size={16} className="text-slate-500 shrink-0" />
                                     <span className="truncate">
                                         {selectedNips.length === 0 
                                            ? "Pilih Teknisi..." 
                                            : selectedNips.length === 1 
                                                ? technicians.find(t => t.nip === selectedNips[0])?.nama || selectedNips[0]
                                                : `${selectedNips.length} Teknisi Dipilih`
                                         }
                                     </span>
                                </div>
                             </button>
                             
                             {/* Dropdown Menu */}
                             {isMultiSelectOpen && (
                                 <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 p-1">
                                     {technicians.map(tech => {
                                         const isSelected = selectedNips.includes(tech.nip);
                                         return (
                                             <div 
                                                key={tech.nip}
                                                onClick={() => toggleNipSelection(tech.nip)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'}`}
                                             >
                                                 <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-500'}`}>
                                                     {isSelected && <CheckCircle2 size={10} />}
                                                 </div>
                                                 <div className="flex-1">
                                                     <div className="text-sm font-medium">{tech.nama}</div>
                                                     <div className="text-[10px] opacity-60 font-mono">{tech.nip}</div>
                                                 </div>
                                             </div>
                                         )
                                     })}
                                     {technicians.length === 0 && (
                                         <div className="p-3 text-center text-xs text-slate-500">
                                             Tidak ada teknisi aktif.
                                         </div>
                                     )}
                                 </div>
                             )}
                        </div>
                        {/* Overlay to close */}
                        {isMultiSelectOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsMultiSelectOpen(false)} />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-1">Status</label>
                        <div className="relative group">
                            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <select
                                required
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                                <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                        </div>
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
                            Simpan Tugas
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
