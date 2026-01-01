import { createClient } from "@/utils/supabase/server";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import TugasClient from "./TugasClient";

export default async function TugasPage() {
  const supabase = await createClient();

  // 1. Get Current User (for Role & NIP Filtering)
  const { data: { user } } = await supabase.auth.getUser();
  
  let currentUser = null;
  let userRole = "";
  let userNip = "";

  if (user) {
    const { data: akun } = await supabase.from('akun').select('*').eq('email', user.email!).single();
    if (akun) {
        userRole = (akun.peran || akun.role || user.user_metadata?.role || user.user_metadata?.peran || "").toUpperCase().replace(/ /g, '_');
        userNip = akun.nip || user.user_metadata?.nip || "";
        currentUser = { nip: userNip, role: userRole };
    }
  }

  // 2. Fetch Teknisi List
  const { data: teknisiData } = await supabase
    .from('akun')
    .select('*')
    .in('status', ['AKTIF', 'approved']);
    
  const filteredTeknisi = (teknisiData as Akun[] || []).filter(a => {
       const r = (a.peran || a.role || "").toUpperCase().replace(/ /g, '_'); 
       return r.includes('TEKNISI'); 
  });

  // 3. Fetch Peralatan List
  const { data: peralatanData } = await supabase
    .from('peralatan')
    .select('*')
    .order('nama', { ascending: true });

  // 4. Fetch Tasks
  let query = supabase
    .from('tugas')
    .select(`
        *,
        peralatan (*),
        dibuat_oleh:akun!fk_tugas_pembuat (nama, nip),
        ditugaskan_ke:akun!fk_tugas_teknisi (nama, nip)
    `)
    .order('status', { ascending: true }) // PENDING first
    .order('dibuat_kapan', { ascending: false });

  const isKanitOrAdmin = ['KANIT_ELBAN', 'UNIT_ADMIN', 'ADMIN'].includes(userRole);
  
  if (!isKanitOrAdmin && userRole.includes('TEKNISI')) {
      if (userNip) {
        query = query.eq('ditugaskan_ke_nip', userNip);
      }
  }

  const { data: tasksData } = await query;

  return (
    <TugasClient 
        initialTasks={tasksData as unknown as Tugas[] || []} 
        initialTeknisiList={filteredTeknisi}
        initialPeralatanList={peralatanData as Peralatan[] || []}
        currentUser={currentUser}
    />
  );
}
