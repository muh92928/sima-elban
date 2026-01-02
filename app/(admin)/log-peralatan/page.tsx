import { getLogPeralatan, getPeralatanList } from "./actions";
import LogPeralatanClient from "./LogPeralatanClient";

export default async function LogPeralatanPage() {
  const [logs, peralatanList] = await Promise.all([
    getLogPeralatan(),
    getPeralatanList()
  ]);

  return (
    <LogPeralatanClient 
        initialData={logs} 
        initialPeralatanList={peralatanList} 
    />
  );
}
