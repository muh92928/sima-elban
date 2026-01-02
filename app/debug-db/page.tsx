import { db } from "@/lib/db";
import { peralatan } from "@/drizzle/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DebugDBPage() {
    let dbStatus = "Checking...";
    let dbError: any = null;
    let itemCount = 0;
    let envCheck = {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
    };

    try {
        // Test 1: Simple Select
        const result = await db.select({ count: sql<number>`count(*)` }).from(peralatan);
        itemCount = Number(result[0]?.count || 0);
        dbStatus = "Connected ✅";
    } catch (error: any) {
        dbStatus = "Failed ❌";
        dbError = error;
    }

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-white font-mono">
            <h1 className="text-2xl font-bold mb-6 text-indigo-400">Database Diagnostic Tool</h1>

            <div className="grid gap-6 max-w-3xl">
                {/* Environment Check */}
                <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Environment Variables</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">NODE_ENV:</span>
                            <span className="font-bold">{envCheck.nodeEnv}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">DATABASE_URL Set:</span>
                            <span className={envCheck.hasDbUrl ? "text-green-400" : "text-red-400"}>
                                {envCheck.hasDbUrl ? "YES" : "NO"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">DATABASE_URL Prefix:</span>
                            <span className="text-slate-300">{envCheck.dbUrlPrefix}</span>
                        </div>
                    </div>
                </div>

                {/* Connection Check */}
                <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                    <h2 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Connection Status</h2>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-slate-400">Status:</div>
                        <div className={`text-xl font-bold ${dbStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                            {dbStatus}
                        </div>
                    </div>

                    {dbStatus.includes('Connected') && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                            <p className="text-green-400">Successfully connected!</p>
                            <p className="mt-2 text-sm">Table 'peralatan' row count: <strong>{itemCount}</strong></p>
                        </div>
                    )}

                    {dbError && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg overflow-x-auto">
                            <p className="text-red-400 font-bold mb-2">Error Details:</p>
                            <pre className="text-xs text-red-300 whitespace-pre-wrap">
                                {dbError.stack || dbError.message || JSON.stringify(dbError, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
