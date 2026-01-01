import { createClient } from "@/utils/supabase/server";
import { Pengaduan } from "@/lib/types";
import PengaduanClient from "./PengaduanClient";

export default async function PengaduanPage() {
  const supabase = await createClient();

  const { data: pengaduan } = await supabase
    .from('pengaduan')
    .select('*, akun(nama, peran), peralatan(nama)')
    .order('created_at', { ascending: false });

  return (
    <PengaduanClient initialData={pengaduan as Pengaduan[] || []} />
  );
}
