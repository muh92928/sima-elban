"use server";

import { db } from "@/lib/db";
import { jadwal } from "@/drizzle/schema";
import { asc } from "drizzle-orm";
import { Jadwal } from "@/lib/types";

export async function getJadwal(): Promise<Jadwal[]> {
    try {
        const data = await db.query.jadwal.findMany({
            orderBy: [asc(jadwal.tanggal), asc(jadwal.waktu)]
        });

        // Map to Jadwal interface (snake_case)
        return data.map((item: any) => ({
            id: item.id,
            nama_kegiatan: item.namaKegiatan,
            tanggal: item.tanggal,
            waktu: item.waktu,
            lokasi: item.lokasi,
            keterangan: item.keterangan,
            created_at: item.createdAt
        })) as unknown as Jadwal[];

    } catch (error) {
        console.error('[getJadwal] Error:', error);
        return [];
    }
}
