import { db } from "../lib/db";
import { personel } from "../drizzle/schema";

async function main() {
  console.log("Checking personel table...");
  try {
    const data = await db.select().from(personel).limit(1);
    console.log("Success! Data:", data);
  } catch (error) {
    console.error("Error querying personel:", error);
  }
  process.exit(0);
}

main();
