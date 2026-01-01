import { createClient } from "@/utils/supabase/server";
import PeralatanClient from "./PeralatanClient";

export default async function PeralatanPage() {
  const supabase = await createClient();

  const { data: peralatanData } = await supabase
    .from('peralatan')
    .select('*')
    .order('id', { ascending: true });

  return <PeralatanClient initialData={peralatanData || []} />;
}
