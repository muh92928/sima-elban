"use server";

import { db } from "@/lib/db";
import { tugas, akun, peralatan } from "@/drizzle/schema";
import { desc, eq, and, or, asc, inArray } from "drizzle-orm";
import { Tugas, Akun, Peralatan } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function getTugas(): Promise<{ tasks: Tugas[], currentUser: { nip: string, role: string } | null }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let currentUser = null;
    let userRole = "";
    let userNip = "";

    if (user) {
        // Fetch full user profile from akun table
        // We can use drizzle here too for consistency
        const userAkun = await db.query.akun.findFirst({
            where: eq(akun.email, user.email!)
        });

        if (userAkun) {
            userRole = (userAkun.peran || "").toUpperCase().replace(/ /g, '_');
            userNip = userAkun.nip || "";
            currentUser = { nip: userNip, role: userRole };
        }
    }

    const isKanitOrAdmin = ['KANIT_ELBAN', 'UNIT_ADMIN', 'ADMIN'].includes(userRole);
    const isTeknisi = userRole.includes('TEKNISI');

    let conditions = undefined;

    // Filter logic: If NOT admin AND IS teknisi, filter by NIP
    if (!isKanitOrAdmin && isTeknisi && userNip) {
        conditions = eq(tugas.ditugaskanKeNip, userNip);
    }

    try {
        const data = await db.query.tugas.findMany({
            where: conditions,
            with: {
                peralatan: true,
                akun_dibuatOlehNip: true, // Relations defined in schema.ts
                akun_ditugaskanKeNip: true
            },
            orderBy: [asc(tugas.status), desc(tugas.dibuatKapan)]
        });

        const mappedTasks = data.map((item: any) => ({
            id: item.id,
            judul: item.judul,
            deskripsi: item.deskripsi,
            status: item.status,
            sumber: item.sumber,
            dibuat_kapan: item.dibuatKapan,
            diupdate_kapan: item.diupdateKapan,
            dibuat_oleh_nip: item.dibuatOlehNip,
            ditugaskan_ke_nip: item.ditugaskanKeNip,
            peralatan_id: item.peralatanId,
            
            peralatan: item.peralatan ? {
                id: item.peralatan.id,
                nama: item.peralatan.nama,
                // ... map other needed fields if necessary, or just rely on object structure
                jenis: item.peralatan.jenis
            } : null,
            
            dibuat_oleh: item.akun_dibuatOlehNip ? {
                nama: item.akun_dibuatOlehNip.nama,
                nip: item.akun_dibuatOlehNip.nip
            } : null,

            ditugaskan_ke: item.akun_ditugaskanKeNip ? {
                nama: item.akun_ditugaskanKeNip.nama,
                nip: item.akun_ditugaskanKeNip.nip
            } : null
        })) as unknown as Tugas[];

        return { tasks: mappedTasks, currentUser };

    } catch (error) {
        console.error('[getTugas] Error:', error);
        return { tasks: [], currentUser };
    }
}

export async function getTeknisiList(): Promise<Akun[]> {
    try {
        // Fetch active accounts
        const data = await db.query.akun.findMany({
            where: inArray(akun.status, ['AKTIF', 'approved'])
        });

        // Filter for roles containing 'TEKNISI'
        // Drizzle doesn't have easy regex/string search in 'findMany' without sql operator
        // simple js filter is fine for relatively small user base
        const teknisi = data.filter((a: any) => {
            const r = (a.peran || "").toUpperCase().replace(/ /g, '_');
            return r.includes('TEKNISI');
        });

        return teknisi.map((a: any) => ({
            id: a.id,
            email: a.email,
            nip: a.nip,
            nama: a.nama,
            peran: a.peran,
            status: a.status,
            created_at: a.createdAt
        })) as Akun[];

    } catch (error) {
        console.error('[getTeknisiList] Error:', error);
        return [];
    }
}

export async function getPeralatanList(): Promise<Peralatan[]> {
    try {
        const data = await db.query.peralatan.findMany({
            orderBy: asc(peralatan.nama)
        });
        return data as unknown as Peralatan[];
    } catch (error) {
        return [];
    }
}
