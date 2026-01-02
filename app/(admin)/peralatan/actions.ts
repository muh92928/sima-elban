"use server";

import { db } from "@/lib/db";
import { peralatan } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Peralatan } from "@/lib/types";

export async function getPeralatan(): Promise<Peralatan[]> {
    try {
        const data = await db.select().from(peralatan).orderBy(desc(peralatan.createdAt));
        
        // Map Drizzle camelCase to snake_case for frontend compatibility
        return data.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            jenis: item.jenis,
            merk: item.merk,
            no_sertifikat: item.noSertifikat,
            tahun_instalasi: item.tahunInstalasi,
            kondisi_persen: item.kondisiPersen,
            status_laik: item.statusLaik as 'LAIK OPERASI' | 'TIDAK LAIK OPERASI' | null,
            keterangan: item.keterangan,
            created_at: item.createdAt
        }));
    } catch (error) {
        console.error('Error fetching peralatan:', error);
        return [];
    }
}

export async function createPeralatan(data: any) {
    try {
        await db.insert(peralatan).values({
            ...data,
            // Maps incoming snake_case/mixed keys to schema keys
            nama: data.nama,
            jenis: data.jenis,
            merk: data.merk,
            noSertifikat: data.noSertifikat || data.no_sertifikat,
            tahunInstalasi: data.tahunInstalasi || data.tahun_instalasi,
            kondisiPersen: data.kondisiPersen || data.kondisi_persen,
            statusLaik: data.statusLaik || data.status_laik,
            keterangan: data.keterangan
        });
        revalidatePath('/peralatan');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePeralatan(id: number, data: any) {
    try {
        await db.update(peralatan)
            .set({
                nama: data.nama,
                jenis: data.jenis,
                merk: data.merk,
                noSertifikat: data.noSertifikat || data.no_sertifikat,
                tahunInstalasi: data.tahunInstalasi || data.tahun_instalasi,
                kondisiPersen: data.kondisiPersen || data.kondisi_persen,
                statusLaik: data.statusLaik || data.status_laik,
                keterangan: data.keterangan
            })
            .where(eq(peralatan.id, id));
        revalidatePath('/peralatan');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePeralatan(id: number) {
    try {
        await db.delete(peralatan).where(eq(peralatan.id, id));
        revalidatePath('/peralatan');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
