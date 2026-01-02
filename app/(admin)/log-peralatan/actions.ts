"use server";

import { db } from "@/lib/db";
import { logPeralatan, peralatan } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { LogPeralatan } from "@/lib/types";

export async function getLogPeralatan(): Promise<LogPeralatan[]> {
    try {
        const data = await db.query.logPeralatan.findMany({
            with: {
                peralatan: true
            },
            orderBy: [desc(logPeralatan.tanggal), desc(logPeralatan.id)]
        });

        // Map if necessary, but Drizzle's query builder with 'with' relations 
        // usually matches well if types are aligned. 
        // However, based on schema.ts coverage, fields are camelCase in the returned object 
        // (e.g. peralatanId, waktuOperasiAktual).
        // We need to check if LogPeralatan type expects snake_case or camelCase.
        // Assuming the type matches the schema or we map it.
        // Let's assume types.ts definitions match the DB columns (snake_case) or are camelCase.
        // I will wait to see types.ts to confirm mapping logic.
        // For now, I'll return 'any' mapped to LogPeralatan to be safe, 
        // or just return data if keys match.
        
        // Manual mapping to ensure frontend compatibility if types use snake_case
        return data.map((item: any) => ({
            id: item.id,
            created_at: item.createdAt,
            tanggal: item.tanggal,
            jam: item.jam,
            peralatan_id: item.peralatanId,
            kegiatan: item.kegiatan,
            keterangan: item.keterangan,
            pic: item.pic,
            dokumentasi: item.dokumentasi,
            waktu_operasi_aktual: item.waktuOperasiAktual,
            waktu_operasi_diterapkan: item.waktuOperasiDiterapkan,
            mematikan_terjadwal: item.mematikanTerjadwal,
            periode_kegagalan: item.periodeKegagalan,
            status: item.status,
            diupdate_kapan: item.diupdateKapan,
            peralatan: item.peralatan ? {
                id: item.peralatan.id,
                nama: item.peralatan.nama,
                jenis: item.peralatan.jenis,
                merk: item.peralatan.merk,
                no_sertifikat: item.peralatan.noSertifikat,
                tahun_instalasi: item.peralatan.tahunInstalasi,
                kondisi_persen: item.peralatan.kondisiPersen,
                status_laik: item.peralatan.statusLaik,
                keterangan: item.peralatan.keterangan,
                created_at: item.peralatan.createdAt
            } : null // Handle potential null relation
        })) as unknown as LogPeralatan[];
    } catch (error) {
        console.error('[getLogPeralatan] Error:', error);
        throw error;
    }
}

export async function getPeralatanList(): Promise<any[]> {
    try {
        const data = await db.query.peralatan.findMany({
            orderBy: (peralatan, { asc }) => [asc(peralatan.nama)]
        });
        
        // Map to ensure camelCase/snake_case compatibility if needed
        return data.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            jenis: item.jenis,
            merk: item.merk,
            no_sertifikat: item.noSertifikat,
            tahun_instalasi: item.tahunInstalasi,
            kondisi_persen: item.kondisiPersen,
            status_laik: item.statusLaik,
            keterangan: item.keterangan,
            created_at: item.createdAt
        }));
    } catch (error) {
        console.error('[getPeralatanList] Error:', error);
        return [];
    }
}
