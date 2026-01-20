import { getJadwal, getCurrentUser } from "./actions";
import JadwalClient from "./JadwalClient";

export default async function JadwalPage() {
  const jadwal = await getJadwal();
  const user = await getCurrentUser();

  return (
    <JadwalClient initialData={jadwal} user={user} />
  );
}
