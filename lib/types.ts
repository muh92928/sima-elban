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
  judul: string;
  deskripsi: string;
  pic: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Belum Dikerjakan' | 'Sedang Dikerjakan' | 'Selesai';
  tanggal: string;
  created_at: string;
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
  id: string; // UUID
  email: string;
  nip: string;
  nama: string;
  unit_kerja: string;
  role: 'admin' | 'user' | 'teknisi';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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
