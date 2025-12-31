
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Peralatan | SIMA ELBAN",
  description: "Log kegiatan harian dan pemeliharaan peralatan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
