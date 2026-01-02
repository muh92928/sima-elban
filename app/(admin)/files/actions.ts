"use server";

import { db } from "@/lib/db";
import { files } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { FileItem } from "@/lib/types";

export async function getFiles(): Promise<FileItem[]> {
    try {
        const data = await db.query.files.findMany({
            orderBy: [desc(files.createdAt)]
        });

        // Map to FileItem interface
        return data.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            kategori: item.kategori,
            catatan: item.catatan,
            url: item.url,
            tipe: item.tipe,
            ukuran: item.ukuran,
            created_at: item.createdAt
        })) as unknown as FileItem[];

    } catch (error) {
        console.error('[getFiles] Error:', error);
        return [];
    }
}
