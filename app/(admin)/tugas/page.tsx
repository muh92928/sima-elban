import { getTugas, getTeknisiList, getPeralatanList } from "./actions";
import TugasClient from "./TugasClient";

export default async function TugasPage() {
  const [
    { tasks, currentUser },
    teknisiList,
    peralatanList
  ] = await Promise.all([
    getTugas(),
    getTeknisiList(),
    getPeralatanList()
  ]);

  return (
    <TugasClient 
        initialTasks={tasks} 
        initialTeknisiList={teknisiList}
        initialPeralatanList={peralatanList}
        currentUser={currentUser}
    />
  );
}
