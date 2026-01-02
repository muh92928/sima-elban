import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tableCheck = await db.execute(sql`SELECT 1 as connected`);

    // Check columns
    const columnsCheck = []; // skip for now

    return NextResponse.json({
      tableExists: tableCheck,
      columns: columnsCheck
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
  }
}
