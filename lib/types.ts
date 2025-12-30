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
  jam: string;
  peralatan_id: number;
  peralatan?: Peralatan;
  kegiatan: string;
  keterangan: string | null;
  dokumentasi: string | null;
  pic: string;
  created_at: string;
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
