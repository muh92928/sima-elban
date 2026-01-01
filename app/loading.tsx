import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black/95">
      <LoadingSpinner label="Memuat aplikasi..." />
    </div>
  );
}
