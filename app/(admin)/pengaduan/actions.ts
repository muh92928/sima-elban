"use server";

import { db } from "@/lib/db";
import { pengaduan, peralatan, akun } from "@/drizzle/schema";
import { desc, eq, or, and } from "drizzle-orm";
import { Pengaduan } from "@/lib/types";

import { createClient } from "@/utils/supabase/server";

export async function getPengaduan(): Promise<Pengaduan[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        // Fetch user role cheaply to decide permission
        const { data: userAkun } = await supabase
            .from('akun')
            .select('id, peran')
            .eq('email', user.email!)
            .single();

        if (!userAkun) return [];

        const userRole = (userAkun.peran || "").toUpperCase().replace(/ /g, '_');
        const isPrivileged = userRole === 'KANIT_ELBAN' || userRole.includes('TEKNISI');

        console.log("DEBUG RBAC Pengaduan:", {
            email: user.email,
            role: userRole,
            isPrivileged,
            myId: userAkun.id
        });

        // Conditional query
        let query = db.select({
            id: pengaduan.id,
            deskripsi: pengaduan.deskripsi,
            status: pengaduan.status,
            dokumentasi: pengaduan.dokumentasi,
            buktiPetugas: pengaduan.buktiPetugas,
            createdAt: pengaduan.createdAt,
            peralatanId: pengaduan.peralatanId,
            akunId: pengaduan.akunId,
            // Joined fields
            peralatanNama: peralatan.nama,
            akunNama: akun.nama,
            akunPeran: akun.peran,
        })
        .from(pengaduan)
        .leftJoin(peralatan, eq(pengaduan.peralatanId, peralatan.id))
        .leftJoin(akun, eq(pengaduan.akunId, akun.id))
        .orderBy(desc(pengaduan.createdAt));

        if (!isPrivileged) {
             console.log("DEBUG RBAC: Applying Filter ID =", userAkun.id);
             query.where(eq(pengaduan.akunId, userAkun.id));
        } else {
             console.log("DEBUG RBAC: No Filter (Privileged)");
        }

        const rawData = await query;

        // Map to Pengaduan interface
        return rawData.map((item: any) => ({
            id: item.id,
            peralatan_id: item.peralatanId,
            peralatan: item.peralatanNama ? { nama: item.peralatanNama } : { nama: "Tidak Diketahui" },
            
            akun_id: item.akunId,
            akun: item.akunNama ? { 
                nama: item.akunNama, 
                peran: item.akunPeran 
            } : null,
            
            deskripsi: item.deskripsi,
            status: item.status,
            dokumentasi: item.dokumentasi,
            bukti_petugas: item.buktiPetugas,
            created_at: item.createdAt,
            pelapor: item.akunNama || null
        })) as unknown as Pengaduan[];



    } catch (error) {
        console.error('[getPengaduan] Error:', error);
        return [];
    }
}
