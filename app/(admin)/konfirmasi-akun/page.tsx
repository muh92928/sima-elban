import { createClient } from "@/utils/supabase/server";
import { Akun } from "@/lib/types";
import KonfirmasiAkunClient from "./KonfirmasiAkunClient";

export default async function KonfirmasiAkunPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch current user's role
  let currentUserRole = "";
  if (user?.email) {
      const { data: akun } = await supabase.from('akun').select('peran').eq('email', user.email).single();
      currentUserRole = (akun?.peran || user.user_metadata?.role || "").toUpperCase().replace(/ /g, '_');
  }

  const { data: accounts } = await supabase
    .from('akun')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <KonfirmasiAkunClient 
        initialData={accounts as Akun[] || []} 
        currentUserRole={currentUserRole}
    />
  );
}
