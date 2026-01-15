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
        let whereCondition = undefined;
        if (!isPrivileged) {
            // If not privileged, only see own complaints
            whereCondition = eq(pengaduan.akunId, userAkun.id);
            console.log("DEBUG RBAC: Filtering by ID", userAkun.id);
        } else {
            console.log("DEBUG RBAC: Showing ALL");
        }

        const data = await db.query.pengaduan.findMany({
            where: whereCondition,
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
