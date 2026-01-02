'use server';

import { db } from '@/lib/db';
import { personel } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getPersonel() {
    try {
        const data = await db.select().from(personel);
        return data;
    } catch (error) {
        console.error('Error fetching personel:', error);
        return [];
    }
}

export async function createPersonel(data: typeof personel.$inferInsert) {
    try {
        await db.insert(personel).values(data);
        revalidatePath('/personel');
        return { success: true };
    } catch (error) {
        console.error('Error creating personel:', error);
        return { success: false, error: 'Gagal membuat data personel' };
    }
}

export async function updatePersonel(id: string, data: Partial<typeof personel.$inferInsert>) {
    try {
        await db.update(personel).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(personel.id, id));
        revalidatePath('/personel');
        return { success: true };
    } catch (error) {
        console.error('Error updating personel:', error);
        return { success: false, error: 'Gagal mengupdate data personel' };
    }
}

export async function deletePersonel(id: string) {
    try {
        await db.delete(personel).where(eq(personel.id, id));
        revalidatePath('/personel');
        return { success: true };
    } catch (error) {
        console.error('Error deleting personel:', error);
        return { success: false, error: 'Gagal menghapus data personel' };
    }
}
