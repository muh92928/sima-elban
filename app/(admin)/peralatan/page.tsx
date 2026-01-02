import { Suspense } from 'react';
import { Peralatan } from '@/lib/types';
import PeralatanList from './PeralatanList';
import { getPeralatan } from './actions';

export const metadata = {
  title: 'Data Peralatan | SIMA ELBAN',
  description: 'Manajemen Data Peralatan Fasilitas',
};

export const dynamic = 'force-dynamic';

export default async function PeralatanPage() {
  let initialData: Peralatan[] = [];
  let errorMsg: string | null = null;

  try {
    // Strict typing: getPeralatan returns Promise<Peralatan[]>
    initialData = await getPeralatan();
  } catch (error: any) {
    console.error("Error in PeralatanPage:", error);
    errorMsg = error.message || "Unknown database error";
    
    // Check for common connection errors
    if (errorMsg?.includes("ECONNREFUSED")) {
      errorMsg += " (Connection refused - Check DB host/port)";
    } else if (errorMsg?.includes("password authentication failed")) {
      errorMsg += " (Check DB password)";
    } else if (errorMsg?.includes("ENOTFOUND")) {
      errorMsg += " (Check DB hostname)";
    }
  }

  if (errorMsg) {
    return (
        <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-2xl mx-auto text-center">
                <h2 className="text-xl font-bold text-red-500 mb-4">Gagal Mengambil Data</h2>
                <div className="bg-slate-950 p-4 rounded-lg text-left overflow-auto mb-4 border border-red-500/20">
                    <code className="text-red-400 font-mono text-sm block">
                        {errorMsg}
                    </code>
                </div>
                <p className="text-slate-400 text-sm">
                    Mohon cek konfigurasi <strong>DATABASE_URL</strong> di Vercel Environment Variables.
                </p>
                <div className="mt-4 text-xs text-slate-500">
                    Pastikan menggunakan format connection string yang benar (Transaction/Session mode).
                </div>
            </div>
        </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading data...</div>}>
      <PeralatanList initialData={initialData} />
    </Suspense>
  );
}