import { getKonfirmasiAkunData } from "./actions";
import KonfirmasiAkunClient from "./KonfirmasiAkunClient";

export default async function KonfirmasiAkunPage() {
  const { accounts, currentUserRole } = await getKonfirmasiAkunData();

  return (
    <KonfirmasiAkunClient 
        initialData={accounts} 
        currentUserRole={currentUserRole}
    />
  );
}
