
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const peralatanData = [
  { nama: "X-Ray Bagasi/ SMITH/ H-SCAN 100100T", jenis: "X-RAY", merk: "X-Ray Bagasi/ SMITH/ H-SCAN 100100T", no_sertifikat: "S/XR-B.0083/DKP/XII/2015", tahun_instalasi: 2023, kondisi_persen: 90, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "X-Ray Cabin/ SMITH/ HI-SCAN 6040i", jenis: "X-RAY", merk: "X-Ray Cabin/ SMITH/ HI-SCAN 6040i", no_sertifikat: "S/XR-C.B075/DKP/C/2015", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "TIDAK LAIK OPERASI", keterangan: "Modul XRC rusak" },
  { nama: "X-Ray Cabin/ SMITH/ HI-SCAN 6040i", jenis: "X-RAY", merk: "X-Ray Cabin/ SMITH/ HI-SCAN 6040i", no_sertifikat: "S/XR-C.B080/DKP/lX/2016", tahun_instalasi: 2016, kondisi_persen: 20, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "X-Ray Cargo/ SMITH/ H-SCAN 100100T", jenis: "X-RAY", merk: "X-Ray Cargo/ SMITH/ H-SCAN 100100T", no_sertifikat: "-", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "WTMD SCP 1/ GARRETT/ PD 6500i", jenis: "WTMD", merk: "WTMD SCP 1/ GARRETT/ PD 6500i", no_sertifikat: "S/WTMD.0171/DKP/XII/2015", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "WTMD SCP 2/ GARRETT/ PD 6500i", jenis: "WTMD", merk: "WTMD SCP 2/ GARRETT/ PD 6500i", no_sertifikat: "S/WTMD.0147/DKP/X/2015", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "WTMD/ GARRETT/ PD 6500i", jenis: "WTMD", merk: "WTMD/ GARRETT/ PD 6500i", no_sertifikat: "-", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  ...Array(7).fill({ nama: "HHMD/ GARRETT/ 1165180", jenis: "HHMD", merk: "HHMD/ GARRETT/ 1165180", no_sertifikat: "-", tahun_instalasi: 2022, kondisi_persen: 80, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(2).fill({ nama: "HHMD/ EIA/ PD 140", jenis: "HHMD", merk: "HHMD/ EIA/ PD 140", no_sertifikat: "-", tahun_instalasi: 2020, kondisi_persen: 60, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(2).fill({ nama: "HHMD/ KRISBOW/ 10154915", jenis: "HHMD", merk: "HHMD/ KRISBOW/ 10154915", no_sertifikat: "-", tahun_instalasi: 2022, kondisi_persen: 80, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(4).fill({ nama: "HHMD/ CEIA/ PD140E", jenis: "HHMD", merk: "HHMD/ CEIA/ PD140E", no_sertifikat: "-", tahun_instalasi: 2024, kondisi_persen: 100, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(8).fill({ nama: "CCTV/ AVIGLION/ H5SL DOME IR CAMERA", jenis: "CCTV", merk: "CCTV/ AVIGLION/ H5SL DOME IR CAMERA", no_sertifikat: "-", tahun_instalasi: 2022, kondisi_persen: 80, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(2).fill({ nama: "CCTV/ AVIGLION/ H5A FISHEYE CAMERA", jenis: "CCTV", merk: "CCTV/ AVIGLION/ H5A FISHEYE CAMERA", no_sertifikat: "-", tahun_instalasi: 2022, kondisi_persen: 80, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(3).fill({ nama: "CCTV/ BOSCH/ NBN-733V-IP", jenis: "CCTV", merk: "CCTV/ BOSCH/ NBN-733V-IP", no_sertifikat: "S/CCTV.0021/DKP/V/2015", tahun_instalasi: 2015, kondisi_persen: 10, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  { nama: "FIDS", jenis: "PIDS", merk: "FIDS", no_sertifikat: "-", tahun_instalasi: 2019, kondisi_persen: 50, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "FIDS", jenis: "PIDS", merk: "FIDS", no_sertifikat: "-", tahun_instalasi: 2020, kondisi_persen: 60, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  { nama: "PAS", jenis: "LAINNYA", merk: "PAS", no_sertifikat: "-", tahun_instalasi: 2020, kondisi_persen: 60, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  ...Array(17).fill({ nama: "PABX/ PANASONIC/ KX-TS505MXW", jenis: "LAINNYA", merk: "PABX/ PANASONIC/ KX-TS505MXW", no_sertifikat: "-", tahun_instalasi: 2022, kondisi_persen: 80, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(3).fill({ nama: "HT/ MOTOROLA/ GP328", jenis: "LAINNYA", merk: "HT/ MOTOROLA/ GP328", no_sertifikat: "-", tahun_instalasi: 2016, kondisi_persen: 20, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(2).fill({ nama: "HT/ MOTOROLA/ CP 1660", jenis: "LAINNYA", merk: "HT/ MOTOROLA/ CP 1660", no_sertifikat: "-", tahun_instalasi: 2016, kondisi_persen: 20, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  ...Array(2).fill({ nama: "HT/ LUPAX/ T-1088", jenis: "LAINNYA", merk: "HT/ LUPAX/ T-1088", no_sertifikat: "-", tahun_instalasi: 2016, kondisi_persen: 20, status_laik: "TIDAK LAIK OPERASI", keterangan: "Rusak" }),
  ...Array(8).fill({ nama: "HT/ ICOM/ IC-V88", jenis: "LAINNYA", merk: "HT/ ICOM/ IC-V88", no_sertifikat: "-", tahun_instalasi: 2023, kondisi_persen: 90, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
  { nama: "Videotron", jenis: "LAINNYA", merk: "Videotron", no_sertifikat: "-", tahun_instalasi: 2023, kondisi_persen: 90, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" },
  ...Array(2).fill({ nama: "Digital Signage", jenis: "LAINNYA", merk: "Digital Signage", no_sertifikat: "-", tahun_instalasi: 2023, kondisi_persen: 90, status_laik: "LAIK OPERASI", keterangan: "Normal Ops" }),
];

async function seed() {
  console.log("Starting seed...");
  const { data, error } = await supabase
    .from('peralatan')
    .insert(peralatanData);

  if (error) {
    console.error("Error seeding data:", error);
  } else {
    console.log("Successfully seeded peralatan data!");
  }
}

seed();
