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
