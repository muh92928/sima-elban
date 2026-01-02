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
  // Strict typing: getPeralatan returns Promise<Peralatan[]>
  const initialData = await getPeralatan();

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading data...</div>}>
      <PeralatanList initialData={initialData} />
    </Suspense>
  );
}