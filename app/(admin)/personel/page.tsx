import { Metadata } from 'next';
import PersonelClient from './PersonelClient';
import { getPersonel } from './actions';

export const metadata: Metadata = {
  title: 'Data Personel | SIMA ELBAN',
  description: 'Manajemen Data Personel Unit Elektronika Bandara',
};

export default async function PersonelPage() {
  const data = await getPersonel();
  return <PersonelClient initialData={data} />;
}
