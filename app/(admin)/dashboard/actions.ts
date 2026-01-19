'use server';

import { db } from '@/lib/db';
import { peralatan, tugas, pengaduan, jadwal, logPeralatan, files, akun, personel } from '@/drizzle/schema';
import { eq, sql, and, ne, gte, lte, asc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';

export async function getDashboardStats() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        let userRole = "";
        let userNip = "";

        if (user) {
            const { data: userAkun } = await supabase
                .from('akun')
                .select('peran, nip')
                .eq('email', user.email!)
                .single();
            
            if (userAkun) {
                userRole = (userAkun.peran || "").toUpperCase().replace(/ /g, '_');
                userNip = userAkun.nip || "";
            }
        }

        const isKanitOrAdmin = ['KANIT_ELBAN', 'UNIT_ADMIN', 'ADMIN'].includes(userRole);
        const today = new Date().toISOString().split('T')[0];

        // 1. Peralatan
        const peralatanData = await db.select({ 
            statusLaik: peralatan.statusLaik 
        }).from(peralatan);

        // 2. Tugas (Filtered by Role)
        let tugasQuery = db.select({ 
            status: tugas.status,
            sumber: tugas.sumber,
            deskripsi: tugas.deskripsi
        }).from(tugas);

        if (!isKanitOrAdmin && userNip) {
            tugasQuery = tugasQuery.where(eq(tugas.ditugaskanKeNip, userNip)) as any;
        }
        
        const tugasData = await tugasQuery;

        // 3. Pengaduan (Joined for list view + counts)
        const pengaduanData = await db.select({ 
            id: pengaduan.id,
            status: pengaduan.status,
            createdAt: pengaduan.createdAt,
            pengadu: akun.nama,
            peralatan: peralatan.nama,
            deskripsi: pengaduan.deskripsi
        })
        .from(pengaduan)
        .leftJoin(akun, eq(pengaduan.akunId, akun.id))
        .leftJoin(peralatan, eq(pengaduan.peralatanId, peralatan.id))
        .orderBy(sql`${pengaduan.createdAt} desc`);

        // 4. Jadwal (Hari ini)
        const jadwalData = await db.select({
            namaKegiatan: jadwal.namaKegiatan
        }).from(jadwal).where(eq(jadwal.tanggal, today));

        // 5. Counts (Optimized using count())
        const [logCountToday] = await db.select({ count: sql<number>`count(*)` })
            .from(logPeralatan)
            .where(eq(logPeralatan.tanggal, today));

        const logsStatusData = await db.select({ 
            status: logPeralatan.status 
        }).from(logPeralatan)
        .where(eq(logPeralatan.tanggal, today));

        const [akunPendingData] = await db.select({ count: sql<number>`count(*)` }).from(akun).where(eq(akun.status, 'pending'));
        
        // Fetch files for category grouping
        const allFilesData = await db.select({ 
            kategori: files.kategori 
        }).from(files);

        const personelData = await db.select().from(personel).limit(5).orderBy(sql`${personel.createdAt} desc`);

        // NEW: Fetch Schedule for next 7 days for attendance view
        const todayStr = new Date().toISOString().split('T')[0];
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        const next7DaysStr = next7Days.toISOString().split('T')[0];

        const upcomingJadwal = await db.select().from(jadwal)
            .where(and(
                gte(jadwal.tanggal, todayStr),
                lte(jadwal.tanggal, next7DaysStr)
            ))
            .orderBy(asc(jadwal.tanggal));

        // PROCESSING DATA
        const peralatanTotal = peralatanData.length;
        const peralatanLaik = peralatanData.filter(p => p.statusLaik === 'LAIK OPERASI').length;
        const peralatanRusak = peralatanData.filter(p => p.statusLaik === 'TIDAK LAIK OPERASI').length;

        const tugasTotal = tugasData.length;
        const tugasPending = tugasData.filter(t => t.status !== 'SELESAI').length;
        const tugasSelesai = tugasData.filter(t => t.status === 'SELESAI').length;

        // Categorized Tasks (Filtered by Role)
        const isLogTask = (t: any) => {
            const isAutoSource = t.sumber && t.sumber.startsWith('Log Otomatis');
            const isAutoDesc = t.deskripsi && (
                t.deskripsi.includes('Dibuat otomatis dari Log Harian') || 
                t.deskripsi.includes('Dibuat otomatis dari Edit Log') ||
                t.deskripsi.startsWith('Log ')
            );
            return isAutoSource || isAutoDesc;
        };

        const tasksKanitList = tugasData.filter(t => !isLogTask(t));
        const tasksLogList = tugasData.filter(t => isLogTask(t));

        const tugasKanitTotal = tasksKanitList.length;
        const tugasKanitPending = tasksKanitList.filter(t => t.status === 'PENDING').length;
        const tugasKanitProses = tasksKanitList.filter(t => t.status === 'PROSES').length;
        const tugasKanitSelesai = tasksKanitList.filter(t => t.status === 'SELESAI').length;

        const tugasLogTotal = tasksLogList.length;
        const tugasLogPending = tasksLogList.filter(t => t.status === 'PENDING').length;
        const tugasLogProses = tasksLogList.filter(t => t.status === 'PROSES').length;
        const tugasLogSelesai = tasksLogList.filter(t => t.status === 'SELESAI').length;

        const pengaduanBaru = pengaduanData.filter(p => p.status === 'Baru').length;
        const pengaduanDiproses = pengaduanData.filter(p => p.status === 'Diproses').length;
        const pengaduanSelesai = pengaduanData.filter(p => p.status === 'Selesai').length;

        const logTotalHariIni = Number(logCountToday.count);
        const logNormalOps = logsStatusData.filter(l => l.status === 'Normal Ops').length;
        const logPerluPerbaikan = logsStatusData.filter(l => l.status === 'Perlu Perbaikan').length;
        const logPerluPerawatan = logsStatusData.filter(l => l.status === 'Perlu Perawatan').length;

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
            tugasKanitTotal,
            tugasKanitPending,
            tugasKanitProses,
            tugasKanitSelesai,
            tugasLogTotal,
            tugasLogPending,
            tugasLogProses,
            tugasLogSelesai,
            pengaduanBaru,
            pengaduanDiproses,
            pengaduanSelesai,
            pengaduanList: pengaduanData.filter(p => p.status !== 'Selesai').slice(0, 5),
            jadwalDinas,
            logTotalHariIni,
            logNormalOps,
            logPerluPerbaikan,
            logPerluPerawatan,
            filesTotal: allFilesData.length,
            filesByCategory: allFilesData.reduce((acc, f) => {
                const cat = f.kategori || '';
                // Map to specific categories or "File Pendukung Lainnya"
                let targetCat = "File Pendukung Lainnya";
                if (["Dokumentasi", "Laporan", "Regulasi", "SOP"].includes(cat)) {
                    targetCat = cat;
                }
                acc[targetCat] = (acc[targetCat] || 0) + 1;
                return acc;
            }, {
                "Dokumentasi": 0,
                "Laporan": 0,
                "Regulasi": 0,
                "SOP": 0,
                "File Pendukung Lainnya": 0
            } as Record<string, number>),
            akunPending: Number(akunPendingData.count),
            personelTotal: personelData.length, // Placeholder if we only want 5, but usually we want a count
            personelList: personelData,
            jadwalList: upcomingJadwal
        };

    } catch (error) {
        console.error('Error fetching dashboard stats (Server Action):', error);
        return null;
    }
}
