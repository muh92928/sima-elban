import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Check if table exists
    const check = await db.execute(sql`
      SELECT to_regclass('public.personel');
    `);
    
    const exists = check[0]?.to_regclass;

    if (exists) {
        return NextResponse.json({ message: "Table personel already exists." });
    }

    // 2. Create Table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "personel" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        "nama" text NOT NULL,
        "nip" text,
        "tempat_lahir" text,
        "tanggal_lahir" date,
        "jabatan" text,
        "formasi_pendidikan" text,
        "kompetensi_pendidikan" text,
        "no_sertifikat" text,
        "jenis_sertifikat" text,
        "keterangan" text
      );
      
      -- Add Policies (Optional, assuming public access for now as per schema)
      ALTER TABLE "personel" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Enable read access for authenticated users" ON "personel"
      AS PERMISSIVE FOR SELECT
      TO public
      USING (auth.role() = 'authenticated');
      
      CREATE POLICY "Enable write access for authenticated users" ON "personel"
      AS PERMISSIVE FOR ALL
      TO public
      USING (auth.role() = 'authenticated');
    `);

    return NextResponse.json({ message: "Table personel created successfully." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
  }
}
