"use client";

import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();

  const getLoadingLabel = () => {
    if (pathname === '/dashboard' || pathname === '/') return "Memuat Dashboard...";
    if (pathname.includes('/peralatan')) return "Memuat Data Peralatan...";
    if (pathname.includes('/log-peralatan')) return "Memuat Log Peralatan...";
    if (pathname.includes('/tugas')) return "Memuat Data Tugas...";
    if (pathname.includes('/jadwal')) return "Memuat Jadwal...";
    if (pathname.includes('/files')) return "Memuat File...";
    if (pathname.includes('/konfirmasi-akun')) return "Memuat Konfirmasi Akun...";
    if (pathname.includes('/pengaduan')) return "Memuat Pengaduan...";
    return "Memuat Halaman...";
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
      <LoadingSpinner label={getLoadingLabel()} />
    </div>
  );
}
