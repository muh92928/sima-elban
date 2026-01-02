import { getJadwal } from "./actions";
import JadwalClient from "./JadwalClient";

export default async function JadwalPage() {
  const jadwal = await getJadwal();

  return (
    <JadwalClient initialData={jadwal} />
  );
}
