import { getPengaduan } from "./actions";
import PengaduanClient from "./PengaduanClient";

export default async function PengaduanPage() {
  const pengaduan = await getPengaduan();

  return (
    <PengaduanClient initialData={pengaduan} />
  );
}
