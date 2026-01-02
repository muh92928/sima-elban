'use server';

import { db } from '@/lib/db';
import { peralatan, tugas, pengaduan, jadwal, logPeralatan, files, akun, personel } from '@/drizzle/schema';
import { eq, sql, and, ne } from 'drizzle-orm';

export async function getDashboardStats() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Peralatan
        const peralatanData = await db.select({ 
            statusLaik: peralatan.statusLaik 
        }).from(peralatan);

        // 2. Tugas
        const tugasData = await db.select({ 
            status: tugas.status 
        }).from(tugas);

        // 3. Pengaduan
        const pengaduanData = await db.select({ 
            status: pengaduan.status 
        }).from(pengaduan);

        // 4. Jadwal (Hari ini)
        const jadwalData = await db.select({
            namaKegiatan: jadwal.namaKegiatan
        }).from(jadwal).where(eq(jadwal.tanggal, today));

        // 5. Counts (Optimized using count())
        const [logCount] = await db.select({ count: sql<number>`count(*)` }).from(logPeralatan);
        const [filesCount] = await db.select({ count: sql<number>`count(*)` }).from(files);
        const [akunPendingData] = await db.select({ count: sql<number>`count(*)` }).from(akun).where(eq(akun.status, 'pending'));
        // PROCESSING DATA
        const peralatanTotal = peralatanData.length;
        const peralatanLaik = peralatanData.filter(p => p.statusLaik === 'LAIK OPERASI').length;
        const peralatanRusak = peralatanData.filter(p => p.statusLaik === 'TIDAK LAIK OPERASI').length;

        const tugasTotal = tugasData.length;
        const tugasPending = tugasData.filter(t => t.status !== 'SELESAI').length;
        const tugasSelesai = tugasData.filter(t => t.status === 'SELESAI').length;

        const pengaduanBaru = pengaduanData.filter(p => p.status === 'Baru').length;
        const pengaduanDiproses = pengaduanData.filter(p => p.status === 'Diproses').length;

        // Logic unik dari code lama: (Dinas count + Total today)
        const dinasCount = jadwalData.filter(j => j.namaKegiatan === 'DINAS' || j.namaKegiatan === 'Dinas').length;
        const jadwalDinas = dinasCount + jadwalData.length;

        return {
            peralatanTotal,
            peralatanLaik,
            peralatanRusak,
            tugasTotal,
            tugasPending,
            tugasSelesai,
            pengaduanBaru,
            pengaduanDiproses,
            jadwalDinas,
            logTotal: Number(logCount.count),
            filesTotal: Number(filesCount.count),
            akunPending: Number(akunPendingData.count)
        };

    } catch (error) {
        console.error('Error fetching dashboard stats (Server Action):', error);
        return null;
    }
}
