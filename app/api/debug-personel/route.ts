import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { personel } from "@/drizzle/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'personel' OR table_name = 'Personel')
    `);
    const data = result;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
  }
}
