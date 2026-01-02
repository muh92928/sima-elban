
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found!");
        process.exit(1);
    }

    console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password

    const sql = postgres(connectionString);

    try {
        console.log("Creating table 'personel'...");
        
        await sql`
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
        `;
        
        console.log("Table created.");

        console.log("Enabling RLS...");
        await sql`ALTER TABLE "personel" ENABLE ROW LEVEL SECURITY;`;
        
        console.log("Creating policies...");
        // Permissive policies for now as requested
        await sql`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM pg_catalog.pg_policies 
                    WHERE tablename = 'personel' AND policyname = 'Enable all access for authenticated users'
                ) THEN
                    CREATE POLICY "Enable all access for authenticated users" ON "personel"
                    AS PERMISSIVE FOR ALL
                    TO authenticated
                    USING (true)
                    WITH CHECK (true);
                END IF;
            END $$;
        `;

        console.log("Success! Personel table is ready.");
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        await sql.end();
    }
}

main();
