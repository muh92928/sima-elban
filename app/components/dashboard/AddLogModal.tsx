"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Upload, Search, Save, CheckSquare, Square, FileImage, Image as ImageIcon, CheckCircle, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Peralatan } from "@/lib/types";

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  peralatanList: Peralatan[];
}

interface LogMetrics {
  waktu_operasi_aktual: number | string;
  waktu_operasi_diterapkan: number | string;
  mematikan_terjadwal: number | string;
  periode_kegagalan: number | string;
  status: 'Normal Ops' | 'Perlu Perbaikan' | 'Perlu Perawatan';
}

const STATUS_OPTIONS: ('Normal Ops' | 'Perlu Perbaikan' | 'Perlu Perawatan')[] = [
  'Normal Ops', 'Perlu Perbaikan', 'Perlu Perawatan'
];

export default function AddLogModal({ isOpen, onClose, onSuccess, peralatanList }: AddLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [picName, setPicName] = useState<string>("");
  const [currentUserNip, setCurrentUserNip] = useState<string>("");

  // UI State: Collapsed Groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Per-item Files
  const [itemFiles, setItemFiles] = useState<Record<number, File>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: akun } = await supabase.from('akun').select('nama, nip').eq('email', user.email).single();
        if (akun) {
           setPicName(akun.nama);
           setCurrentUserNip(akun.nip);
        }
        else setPicName(user.user_metadata?.name || user.email?.split('@')[0] || "Admin");
      }
    };
    if (isOpen) fetchUser();
  }, [isOpen]);

  // Global Metrics (Default)
  const [globalMetrics, setGlobalMetrics] = useState<LogMetrics>({
    waktu_operasi_aktual: 0,
    waktu_operasi_diterapkan: 0,
    mematikan_terjadwal: 0,
    periode_kegagalan: 0,
    status: 'Normal Ops',
  });

  // Manual Overrides
  const [manualOverrides, setManualOverrides] = useState<Record<number, LogMetrics>>({});
  
  // "Use Global" tracking
  const [useGlobalSettings, setUseGlobalSettings] = useState<Set<number>>(new Set());

  // Grouping Logic
  const groupedPeralatan = useMemo(() => {
    const groups: Record<string, Peralatan[]> = {};
    const lowerQuery = searchQuery.toLowerCase();

    // First filter
    const filtered = peralatanList.filter(p => 
      p.nama.toLowerCase().includes(lowerQuery) || 
      p.jenis.toLowerCase().includes(lowerQuery) ||
      (p.merk && p.merk.toLowerCase().includes(lowerQuery))
    );

    // Then group
    filtered.forEach(p => {
        if (!groups[p.jenis]) groups[p.jenis] = [];
        groups[p.jenis].push(p);
    });

    // Sort keys mostly alphabetical but prioritize common ones if needed
    return Object.keys(groups).sort().reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
    }, {} as Record<string, Peralatan[]>);
  }, [peralatanList, searchQuery]);

  // Initialize selection for new items
  // Note: We don't auto-select anymore to avoid overwhelming the user, unless requested?
  // User asked for ease of use. "Select All" buttons are better than auto-select all 72 items.

  const handleClose = () => {
    setLoading(false);
    setError(null);
    setSelectedIds(new Set());
    setManualOverrides({});
    setUseGlobalSettings(new Set());
    setItemFiles({});
    setCollapsedGroups(new Set());
    onClose();
  };

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
      const nextGlobals = new Set(useGlobalSettings);
      nextGlobals.delete(id);
      setUseGlobalSettings(nextGlobals);
    } else {
      next.add(id);
      const nextGlobals = new Set(useGlobalSettings);
      nextGlobals.add(id);
      setUseGlobalSettings(nextGlobals);
    }
    setSelectedIds(next);
  };

  const toggleGlobalSetting = (id: number) => {
    const next = new Set(useGlobalSettings);
    if (next.has(id)) {
      next.delete(id);
      setManualOverrides(prev => ({
        ...prev,
        [id]: { ...globalMetrics }
      }));
    } else {
      next.add(id);
    }
    setUseGlobalSettings(next);
  };

  const updateManualMetric = (id: number, field: keyof LogMetrics, value: any) => {
    setManualOverrides(prev => ({
      ...prev,
      [id]: {
        ...prev[id] || { ...globalMetrics },
        [field]: value
      }
    }));
  };

  const updateItemFile = (id: number, file: File | null) => {
    const next = { ...itemFiles };
    if (file) {
      next[id] = file;
    } else {
      delete next[id];
    }
    setItemFiles(next);
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    const allIds = Object.values(groupedPeralatan).flat().map(p => p.id);
    const allSelected = allIds.every(id => selectedIds.has(id));

    if (allSelected) {
        setSelectedIds(new Set());
        setUseGlobalSettings(new Set()); // Clear globals too just in case
    } else {
        const nextSelected = new Set(allIds);
        const nextGlobals = new Set(allIds); // Default to global for all
        setSelectedIds(nextSelected);
        setUseGlobalSettings(nextGlobals);
    }
  };

  const toggleGroupSelection = (groupName: string) => {
      const groupItems = groupedPeralatan[groupName];
      const allIds = groupItems.map(p => p.id);
      const allSelected = allIds.every(id => selectedIds.has(id));
      
      const nextSelected = new Set(selectedIds);
      const nextGlobals = new Set(useGlobalSettings);

      if (allSelected) {
          allIds.forEach(id => {
              nextSelected.delete(id);
              nextGlobals.delete(id);
          });
      } else {
          allIds.forEach(id => {
              nextSelected.add(id);
              nextGlobals.add(id); // Default to global
          });
      }
      setSelectedIds(nextSelected);
      setUseGlobalSettings(nextGlobals);
  };

  const toggleGroupCollapse = (groupName: string) => {
      const next = new Set(collapsedGroups);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      setCollapsedGroups(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedIds.size === 0) throw new Error("Pilih minimal satu peralatan.");
      
      const rowsToInsert = [];

      for (const id of Array.from(selectedIds)) {
        const isGlobal = useGlobalSettings.has(id);
        const metrics = isGlobal ? globalMetrics : manualOverrides[id];
        const finalMetrics = metrics || globalMetrics;
        
        let dokumentasiUrl = null;
        const file = itemFiles[id];
        
        if (file) {
             const fileExt = file.name.split('.').pop();
             const fileName = `log_${id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
             
             const { error: uploadError } = await supabase.storage
               .from('files')
               .upload(`log_peralatan/${fileName}`, file);

             if (uploadError) throw new Error(`Gagal upload untuk peralatan #${id}: ` + uploadError.message);
             
             const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(`log_peralatan/${fileName}`);
             dokumentasiUrl = publicUrl;
        }

        rowsToInsert.push({
          peralatan_id: id,
          tanggal: tanggal,
          waktu_operasi_aktual: finalMetrics.waktu_operasi_aktual === '' ? 0 : Number(finalMetrics.waktu_operasi_aktual),
          waktu_operasi_diterapkan: finalMetrics.waktu_operasi_diterapkan === '' ? 0 : Number(finalMetrics.waktu_operasi_diterapkan),
          mematikan_terjadwal: finalMetrics.mematikan_terjadwal === '' ? 0 : Number(finalMetrics.mematikan_terjadwal),
          periode_kegagalan: finalMetrics.periode_kegagalan === '' ? 0 : Number(finalMetrics.periode_kegagalan),
          status: finalMetrics.status,
          dokumentasi: dokumentasiUrl,
          jam: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          kegiatan: 'Laporan Harian',
          pic: picName || 'Admin Teknis',
        });
      }

      const { error: insertError } = await supabase
        .from('log_peralatan')
        .insert(rowsToInsert);

      if (insertError) throw insertError;

      // --- AUTOMATIC TASK CREATION LOGIC ---
      // Check if any inserted row has a status needing attention
      const logsNeedingAction = rowsToInsert.filter(row => 
          row.status === 'Perlu Perbaikan' || row.status === 'Perlu Perawatan'
      );

      if (logsNeedingAction.length > 0) {
          // 1. Find ALL Technicians to assign (Broadcast)
          // We search for 'TEKNISI_ELBAN' specifically.
          const { data: technicians } = await supabase
              .from('akun')
              .select('nip, nama, status')
              .eq('peran', 'TEKNISI_ELBAN');

          // 2. Ensure we have a creator NIP (dibuat_oleh)
          let creatorNip = currentUserNip;
          if (!creatorNip) {
              // Try to find an admin to attribute to if current user has no NIP profile
              const { data: admins } = await supabase.from('akun').select('nip').eq('peran', 'UNIT_ADMIN').limit(1);
              creatorNip = admins?.[0]?.nip || "";
          }

          if (technicians && technicians.length > 0 && creatorNip) {
              // Create a task for EACH technician for EACH log (Broadcast)
              const tasksToCreate = logsNeedingAction.flatMap(log => 
                  technicians.map(tech => ({
                      peralatan_id: log.peralatan_id,
                      judul: `${log.status}`,
                      deskripsi: '-',
                      status: 'PENDING',
                      sumber: 'Log Otomatis',
                      dibuat_kapan: new Date().toISOString(),
                      dibuat_oleh_nip: creatorNip,
                      ditugaskan_ke_nip: tech.nip
                  }))
              );

              const { error: taskError } = await supabase.from('tugas').insert(tasksToCreate);
              if (taskError) {
                  console.error("Gagal membuat tugas otomatis:", taskError);
                  alert(`Info: Log tersimpan, tapi gagal membuat tugas otomatis: ${taskError.message}`);
              }
          } else {
             console.warn("Skipping auto-task creation: No technician or creator NIP found.");
             alert(`Info: Log tersimpan, tapi Tugas Otomatis GAGAL dibuat. \n\nDiagnosa:\n- Teknisi (TEKNISI_ELBAN) ditemukan: ${technicians && technicians.length > 0 ? 'YA (' + technicians.length + ' orang)' : 'TIDAK'}\n- Creator NIP ditemukan: ${creatorNip ? 'YA (' + creatorNip + ')' : 'TIDAK'}\n\nPastikan ada akun dengan peran 'TEKNISI_ELBAN' dan akun Anda memiliki NIP.`);
          }
      }
      // -------------------------------------

      onSuccess();
      handleClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
          <div className="flex min-h-full items-center justify-center p-2 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[95vw] h-[95vh] flex flex-col transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                       <Save className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <Dialog.Title as="h3" className="text-lg font-bold text-white">Input Log Harian</Dialog.Title>
                        <p className="text-xs text-slate-400">Pilih peralatan per kategori dan isi detailnya.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-indigo-300 font-bold text-xs">
                        {selectedIds.size} Item Dipilih
                      </div>
                      <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X size={20} />
                      </button>
                  </div>
                </div>

                {error && (
                  <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                    <X size={14} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                  
                  {/* Scrollable Content Wrapper */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                      
                      {/* Top Panel: Compact Global Settings & Date */}
                      <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 bg-slate-900 border-b border-white/5">
                          {/* Date */}
                          <div className="lg:col-span-1">
                              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Tanggal</label>
                              <input
                                  type="date"
                                  required
                                  value={tanggal}
                                  onChange={(e) => setTanggal(e.target.value)}
                                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                          </div>

                          {/* Filter & Global Values */}
                          <div className="lg:col-span-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3 flex flex-col justify-center">
                               <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"/> Nilai Metrik Default (Global)
                                    </h4>
                                    <span className="text-[10px] text-slate-500 italic">Otomatis terisi jika "Pakai Default" dicentang</span>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-2">
                                    {[
                                        { label: "Waktu Operasi Aktual", key: "waktu_operasi_aktual", type: "number" },
                                        { label: "Waktu Operasi Diterapkan", key: "waktu_operasi_diterapkan", type: "number" },
                                        { label: "Periode Mematikan", key: "mematikan_terjadwal", type: "number" },
                                        { label: "Periode Kegagalan", key: "periode_kegagalan", type: "number" },
                                        { label: "Status Operasi", key: "status", type: "select" }
                                    ].map((field: any) => (
                                        <div key={field.key} className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase font-bold px-1 truncate block" title={field.label}>{field.label}</label>
                                            {field.type === 'select' ? (
                                                <select 
                                                    className="w-full h-10 sm:h-8 bg-slate-900 border border-indigo-500/30 rounded px-3 sm:px-2 text-sm sm:text-xs text-white focus:outline-none focus:border-indigo-400"
                                                    value={(globalMetrics as any)[field.key]}
                                                    onChange={e => setGlobalMetrics({...globalMetrics, [field.key]: e.target.value})}
                                                >
                                                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input 
                                                    type="number" min="0" placeholder="0"
                                                    className="w-full h-10 sm:h-8 bg-slate-900 border border-indigo-500/30 rounded px-3 sm:px-2 text-sm sm:text-xs text-white focus:outline-none focus:border-indigo-400"
                                                    value={(globalMetrics as any)[field.key]}
                                                    onChange={e => setGlobalMetrics({...globalMetrics, [field.key]: e.target.value})}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                          </div>
                      </div>

                      {/* Toolbar: Search & Select All */}
                      <div className="px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/95 backdrop-blur sticky top-0 z-20 border-b border-white/5 shadow-sm">
                         <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                              type="text"
                              placeholder="Cari peralatan atau jenis..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 sm:py-2 text-sm sm:text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                         </div>
                         <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors whitespace-nowrap"
                         >
                            <CheckSquare size={14} />
                            {Object.values(groupedPeralatan).flat().every(p => selectedIds.has(p.id)) ? "Batal Semua" : "Pilih Semua"}
                         </button>
                      </div>

                      {/* Main List Area - Grouped */}
                      <div className="p-4">
                          {Object.keys(groupedPeralatan).length === 0 ? (
                              <div className="text-center py-12 text-slate-500 italic">
                                 <Search size={48} className="mx-auto mb-2 opacity-20" />
                                 Tidak ada data yang cocok.
                              </div>
                          ) : (
                              <div className="space-y-6">
                                  {Object.entries(groupedPeralatan).map(([groupName, items]) => {
                                      const isCollapsed = collapsedGroups.has(groupName);
                                      const allGroupSelected = items.every(i => selectedIds.has(i.id));
                                      const someGroupSelected = items.some(i => selectedIds.has(i.id));

                                      return (
                                          <div key={groupName} className="space-y-2">
                                              {/* Group Header */}
                                              <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                  <div 
                                                    className="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors"
                                                    onClick={() => toggleGroupCollapse(groupName)}
                                                  >
                                                      {isCollapsed ? <ChevronRight size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                                      <h5 className="font-bold text-sm text-indigo-300 uppercase tracking-wider">{groupName} <span className="text-slate-500 text-xs normal-case font-normal">({items.length} unit)</span></h5>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <button
                                                          type="button"
                                                          onClick={() => toggleGroupSelection(groupName)}
                                                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                                                      >
                                                          {allGroupSelected ? "Batal Semua" : "Pilih Grup"}
                                                      </button>
                                                  </div>
                                              </div>

                                              {/* Group Items */}
                                              {!isCollapsed && (
                                                  <div className="grid grid-cols-1 gap-2">
                                                      {items.map(item => {
                                                          const isSelected = selectedIds.has(item.id);
                                                          const isGlobal = useGlobalSettings.has(item.id);
                                                          const displayMetrics = isGlobal ? globalMetrics : (manualOverrides[item.id] || globalMetrics);
                                                          const currentFile = itemFiles[item.id];

                                                          return (
                                                              <div 
                                                                  key={item.id}
                                                                  className={`rounded-lg border transition-all ${isSelected 
                                                                      ? 'bg-slate-900/80 border-indigo-500/40 shadow-md shadow-indigo-900/10' 
                                                                      : 'bg-slate-900/20 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                                                                  }`}
                                                              >
                                                                  {/* Item Header / Summary */}
                                                                  <div 
                                                                      className={`p-2.5 flex items-center justify-between cursor-pointer ${isSelected ? 'border-b border-indigo-500/10' : ''}`}
                                                                      onClick={() => toggleSelection(item.id)}
                                                                  >
                                                                      <div className="flex items-center gap-3">
                                                                           <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-800 border-slate-600'}`}>
                                                                                {isSelected && <CheckSquare size={10} className="text-white" />}
                                                                           </div>
                                                                           <div>
                                                                               <div className="font-bold text-xs text-white">{item.nama}</div>
                                                                               <div className="text-[10px] text-slate-500">{item.merk || '-'}</div>
                                                                           </div>
                                                                      </div>

                                                                      {isSelected && (
                                                                          <label 
                                                                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/50 hover:bg-slate-950 border border-white/5 transition-colors cursor-pointer"
                                                                              onClick={(e) => e.stopPropagation()}
                                                                          >
                                                                              <input 
                                                                                  type="checkbox" 
                                                                                  className="rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-0 w-3 h-3"
                                                                                  checked={isGlobal}
                                                                                  onChange={() => toggleGlobalSetting(item.id)}
                                                                              />
                                                                              <span className="text-[10px] font-medium text-slate-400">Default Group</span>
                                                                          </label>
                                                                      )}
                                                                  </div>

                                                                  {/* Expanded Edit Form */}
                                                                  {isSelected && (
                                                                      <div className="p-3 sm:p-2.5 bg-black/20 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-3 animate-slide-down">
                                                                          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-2">
                                                                               {[
                                                                                    { ph: "0", label: "Waktu Operasi Aktual", key: "waktu_operasi_aktual", type: "text" },
                                                                                    { ph: "0", label: "Waktu Operasi Diterapkan", key: "waktu_operasi_diterapkan", type: "text" },
                                                                                    { ph: "0", label: "Periode Mematikan", key: "mematikan_terjadwal", type: "text" },
                                                                                    { ph: "0", label: "Periode Kegagalan", key: "periode_kegagalan", type: "text" },
                                                                                    { ph: "Normal", label: "Status Operasi", key: "status", type: "select" }
                                                                               ].map((f: any) => (
                                                                                   <div key={f.key} className="space-y-1">
                                                                                       <label className="text-[10px] text-slate-500 uppercase font-bold px-1 truncate block" title={f.label}>{f.label}</label>
                                                                                       {f.type === 'select' ? (
                                                                                           <select 
                                                                                                disabled={isGlobal}
                                                                                                className={`w-full rounded px-3 sm:px-2 py-2.5 sm:py-1.5 text-sm sm:text-[10px] focus:outline-none border ${isGlobal ? 'bg-slate-800/50 text-slate-500 border-transparent cursor-not-allowed' : 'bg-slate-900/80 text-white border-slate-700 focus:border-indigo-500'}`}
                                                                                                value={(displayMetrics as any)[f.key]}
                                                                                                onChange={(e) => updateManualMetric(item.id, f.key as any, e.target.value)}
                                                                                           >
                                                                                               {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                                           </select>
                                                                                       ) : (
                                                                                           <input 
                                                                                                type="number" placeholder={f.ph}
                                                                                                disabled={isGlobal}
                                                                                                className={`w-full rounded px-3 sm:px-2 py-2.5 sm:py-1.5 text-sm sm:text-[10px] focus:outline-none border ${isGlobal ? 'bg-slate-800/50 text-slate-500 border-transparent cursor-not-allowed' : 'bg-slate-900/80 text-white border-slate-700 focus:border-indigo-500'}`}
                                                                                                value={(displayMetrics as any)[f.key]}
                                                                                                onChange={(e) => updateManualMetric(item.id, f.key as any, e.target.value)}
                                                                                           />
                                                                                       )}
                                                                                   </div>
                                                                               ))}
                                                                          </div>
                                                                          <div className="md:col-span-4 border-l border-white/5 md:pl-2 pt-2 md:pt-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="file"
                                                                                        id={`file-${item.id}`}
                                                                                        accept="image/*"
                                                                                        onChange={(e) => updateItemFile(item.id, e.target.files?.[0] || null)}
                                                                                        className="hidden"
                                                                                    />
                                                                                    <label 
                                                                                        htmlFor={`file-${item.id}`}
                                                                                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded border border-dashed cursor-pointer transition-colors text-[10px] ${currentFile ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-400'}`}
                                                                                    >
                                                                                        {currentFile ? (
                                                                                            <>
                                                                                                <FileImage size={12} />
                                                                                                <span className="truncate max-w-[80px]">{currentFile.name}</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Upload size={12} />
                                                                                                <span>Upload Bukti</span>
                                                                                            </>
                                                                                        )}
                                                                                    </label>
                                                                                    {currentFile && (
                                                                                        <button type="button" onClick={() => updateItemFile(item.id, null)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                                                                                            <X size={12} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                          </div>
                                                                      </div>
                                                                  )}
                                                              </div>
                                                          );
                                                      })}
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur flex justify-between items-center z-10">
                      <div className="text-xs text-slate-400">
                          <strong className="text-white">{selectedIds.size}</strong> peralatan siap disimpan.
                      </div>
                      <button
                        type="submit"
                        disabled={loading || selectedIds.size === 0}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                         {loading ? "Memproses..." : "SIMPAN SEMUA LOG"}
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
