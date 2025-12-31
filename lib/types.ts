export interface Peralatan {
  id: number;
  nama: string;
  jenis: string;
  merk: string | null;
  no_sertifikat: string | null;
  tahun_instalasi: number | null;
  kondisi_persen: number | null;
  status_laik: 'LAIK OPERASI' | 'TIDAK LAIK OPERASI' | null;
  keterangan: string | null;
  created_at: string;
}

export interface LogPeralatan {
  id: number;
  tanggal: string;
  // jam: string; // Removed as per new schema (using date only usually, or if needed keep it but it seems unused in PHP)
  peralatan_id: number;
  peralatan?: Peralatan;
  // kegiatan: string; // Replaced by detailed fields? Or keep as general note? PHP doesn't have 'kegiatan' explicitly, it has specific metrics.
  // The PHP code uses specific metrics. I will keep 'keterangan' as general note if needed, but the core data is now the metrics.
  
  waktu_operasi_aktual: number;
  waktu_operasi_diterapkan: number;
  mematikan_terjadwal: number;
  periode_kegagalan: number;
  status: 'Normal Ops' | 'Perlu Perbaikan' | 'Perlu Perawatan';
  
  keterangan: string | null;
  dokumentasi: string | null;
  pic: string; // PHP doesn't explicitly have PIC column in the INSERTs shown, but it might be useful. I'll keep it optional or default.
  // Actually PHP code doesn't show inserting PIC. I will keep it for now as it's good practice, but might need to be nullable or auto-filled.
  
  created_at: string;
  diupdate_kapan?: string;
}

export interface Tugas {
  id: number;
  peralatan_id: number | null;
  judul: string | null;
  deskripsi: string;
  status: 'PENDING' | 'PROSES' | 'SELESAI';
  sumber: string | null;
  dibuat_kapan: string;
  diupdate_kapan: string | null;
  dibuat_oleh_nip: string;
  ditugaskan_ke_nip: string;

  // Relations (Fetched via Joins)
  peralatan?: Peralatan;
  dibuat_oleh?: Akun;
  ditugaskan_ke?: Akun;
}

export interface Jadwal {
  id: number;
  nama_kegiatan: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  keterangan: string | null;
  created_at: string;
}

export interface FileItem {
  id: number;
  nama: string;
  kategori: string;
  catatan: string | null;
  url: string;
  tipe: string | null;
  ukuran: number | null;
  created_at: string;
}

export interface Akun {
  id: string;
  email: string;
  nip: string;
  nama: string;
  peran: string; // Renamed from unit_kerja
  unit_kerja?: string; // Legacy support
  status: 'AKTIF' | 'NONAKTIF' | 'pending' | 'approved';
  created_at: string;
  role?: string; // Optional helper
}

export interface Pengaduan {
  id: number;
  judul: string;
  deskripsi: string;
  pelapor: string;
  lokasi: string;
  status: 'Baru' | 'Diproses' | 'Selesai';
  dokumentasi: string | null;
  created_at: string;
}
