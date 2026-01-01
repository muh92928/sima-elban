import { createClient } from "@/utils/supabase/server";
import { LogPeralatan, Peralatan } from "@/lib/types";
import LogPeralatanClient from "./LogPeralatanClient";

export default async function LogPeralatanPage() {
  const supabase = await createClient();

  // 1. Fetch Peralatan List for Modals
  const { data: peralatanData } = await supabase
    .from('peralatan')
    .select('*')
    .order('nama', { ascending: true });

  // 2. Fetch Logs
  const { data: logs } = await supabase
    .from('log_peralatan')
    .select('*, peralatan(*)') // Select all log columns and joined peralatan
    .order('tanggal', { ascending: false })
    .order('id', { ascending: false });

  return (
    <LogPeralatanClient 
        initialData={logs as unknown as LogPeralatan[] || []} 
        initialPeralatanList={peralatanData as Peralatan[] || []} 
    />
  );
}
