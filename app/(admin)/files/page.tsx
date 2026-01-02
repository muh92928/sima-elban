import { getFiles } from "./actions";
import FilesClient from "./FilesClient";

export default async function FilesPage() {
  const files = await getFiles();

  return (
    <FilesClient initialData={files} />
  );
}
