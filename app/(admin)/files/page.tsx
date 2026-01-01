import { createClient } from "@/utils/supabase/server";
import { FileItem } from "@/lib/types";
import FilesClient from "./FilesClient";

export default async function FilesPage() {
  const supabase = await createClient();

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <FilesClient initialData={files as FileItem[] || []} />
  );
}
