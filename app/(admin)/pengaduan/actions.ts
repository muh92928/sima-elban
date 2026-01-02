"use server";

import { db } from "@/lib/db";
import { pengaduan, peralatan, akun } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { Pengaduan } from "@/lib/types";

export async function getPengaduan(): Promise<Pengaduan[]> {
    try {
        const data = await db.query.pengaduan.findMany({
            with: {
                peralatan: true,
                akun: true
            },
            orderBy: [desc(pengaduan.createdAt)]
        });

        // Map to Pengaduan interface
        return data.map((item: any) => ({
            id: item.id,
            peralatan_id: item.peralatanId,
            peralatan: item.peralatan ? { nama: item.peralatan.nama } : { nama: "Tidak Diketahui" },
            
            akun_id: item.akunId,
            akun: item.akun ? { 
                nama: item.akun.nama, 
                peran: item.akun.peran 
            } : null,
            
            deskripsi: item.deskripsi,
            status: item.status,
            dokumentasi: item.dokumentasi,
            bukti_petugas: item.buktiPetugas,
            created_at: item.createdAt,
            // Legacy support if needed, but 'pelapor' usually comes from akun.nama
            pelapor: item.akun?.nama || null
        })) as unknown as Pengaduan[];

    } catch (error) {
        console.error('[getPengaduan] Error:', error);
        return [];
    }
}
