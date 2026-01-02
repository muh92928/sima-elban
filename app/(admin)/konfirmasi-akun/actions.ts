"use server";

import { db } from "@/lib/db";
import { akun } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { Akun } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function getKonfirmasiAkunData(): Promise<{ accounts: Akun[], currentUserRole: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let currentUserRole = "";

    try {
        if (user?.email) {
            // Fetch role using Drizzle
            const userAkun = await db.query.akun.findFirst({
                where: eq(akun.email, user.email),
                columns: { peran: true }
            });
            
            currentUserRole = (userAkun?.peran || user.user_metadata?.role || "").toUpperCase().replace(/ /g, '_');
        }

        const data = await db.query.akun.findMany({
            orderBy: [desc(akun.createdAt)]
        });

        const mappedAccounts = data.map((item: any) => ({
            id: item.id,
            email: item.email,
            nip: item.nip,
            nama: item.nama,
            peran: item.peran,
            unit_kerja: item.peran, // mapping for legacy support
            status: item.status,
            created_at: item.createdAt
        })) as Akun[];

        return { accounts: mappedAccounts, currentUserRole };

    } catch (error) {
        console.error('[getKonfirmasiAkunData] Error:', error);
        return { accounts: [], currentUserRole: "" };
    }
}
