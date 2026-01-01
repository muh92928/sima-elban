import { createClient } from "@/utils/supabase/server";
import { Jadwal } from "@/lib/types";
import JadwalClient from "./JadwalClient";

export default async function JadwalPage() {
  const supabase = await createClient();

  const { data: jadwal } = await supabase
    .from('jadwal')
    .select('*')
    .order('tanggal', { ascending: true })
    .order('waktu', { ascending: true });

  return (
    <JadwalClient initialData={jadwal as Jadwal[] || []} />
  );
}
