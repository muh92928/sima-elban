"use server";

import { db } from "@/lib/db";
import { pengaduan, peralatan, akun } from "@/drizzle/schema";
import { desc, eq, or, and, inArray } from "drizzle-orm";
import { Pengaduan } from "@/lib/types";

import { createClient } from "@/utils/supabase/server";

export async function getPengaduan(): Promise<Pengaduan[]> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        // Collect all potential Account IDs for this user
        // 1. Check by Auth ID (PK)
        const { data: byId } = await supabase
            .from('akun')
            .select('id, peran')
            .eq('id', user.id);

        // 2. Check by Email
        const { data: byEmail } = await supabase
            .from('akun')
            .select('id, peran')
            .eq('email', user.email!);

        const allAccounts = [ ...(byId || []), ...(byEmail || []) ];
        
        // Deduplicate by ID
        const uniqueAccounts = Array.from(new Map(allAccounts.map(item => [item.id, item])).values());

        if (uniqueAccounts.length === 0) {
            console.error("DEBUG RBAC: User Akun NOT FOUND for Auth ID/Email", user.id, user.email);
            return [];
        }


        const accountIds = uniqueAccounts.map(a => a.id);
        const roles = uniqueAccounts.map(a => (a.peran || "").toUpperCase().replace(/ /g, '_'));
        const isPrivileged = roles.some(r => r === 'KANIT_ELBAN' || r.includes('TEKNISI'));

        let whereClause = undefined;
        if (!isPrivileged) {
             whereClause = inArray(pengaduan.akunId, accountIds);
        }

        // Use Drizzle Query API
        const data = await db.query.pengaduan.findMany({
            where: whereClause,
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

export async function deletePengaduan(id: number) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");
        
        await db.delete(pengaduan).where(eq(pengaduan.id, id));
        return { success: true };
    } catch (error) {
        console.error('[deletePengaduan] Error:', error);
        throw error;
    }
}

export async function savePengaduan(id: number | null, data: {
    peralatan_id?: number | null;
    deskripsi?: string;
    status?: string;
    dokumentasi?: string | null;
    bukti_petugas?: string | null;
    akun_id?: string | null;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const payload: any = {
            peralatanId: data.peralatan_id,
            deskripsi: data.deskripsi,
            status: data.status,
            dokumentasi: data.dokumentasi,
            buktiPetugas: data.bukti_petugas,
            akunId: data.akun_id
        };

        if (id) {
            // Update
            await db.update(pengaduan).set(payload).where(eq(pengaduan.id, id));
        } else {
            // Create
            await db.insert(pengaduan).values(payload);
        }

        return { success: true };
    } catch (error) {
        console.error('[savePengaduan] Error:', error);
        throw error;
    }
}
// Removed helper function as logic is now consolidated above

