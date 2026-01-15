import { Metadata } from "next";
import { getPengaduan } from "./actions";
import PengaduanClient from "./PengaduanClient";

export const metadata: Metadata = {
  title: "Pengaduan | SIMA ELBAN",
};

export const dynamic = 'force-dynamic';

export default async function PengaduanPage() {
  const pengaduan = await getPengaduan();

  return (
    <PengaduanClient initialData={pengaduan} />
  );
}
