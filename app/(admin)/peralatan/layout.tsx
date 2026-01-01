
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Peralatan | SIMA ELBAN",
  description: "Daftar inventaris dan status kelaikan peralatan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
