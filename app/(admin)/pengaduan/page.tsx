import { createClient } from "@/utils/supabase/server";
import { Pengaduan } from "@/lib/types";
import PengaduanClient from "./PengaduanClient";

export default async function PengaduanPage() {
  const supabase = await createClient();

  // 1. Fetch Pengaduan
  const { data: rawPengaduan } = await supabase
    .from('pengaduan')
    .select('*, akun(nama, peran)')
    .order('created_at', { ascending: false });

  // 2. Fetch Peralatan for manual mapping (Robust fallback)
  const { data: peralatanList } = await supabase
    .from('peralatan')
    .select('id, nama');

  const pMap: Record<number, string> = {};
  if (peralatanList) {
      peralatanList.forEach((p: any) => {
          pMap[p.id] = p.nama;
      });
  }

  // 3. Enrich Data
  const pengaduan = (rawPengaduan || []).map((p: any) => ({
      ...p,
      peralatan: { nama: pMap[p.peralatan_id] || "Tidak Diketahui" }
  }));

  return (
    <PengaduanClient initialData={pengaduan as Pengaduan[]} />
  );
}
