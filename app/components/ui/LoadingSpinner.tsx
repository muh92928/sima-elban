import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export default function LoadingSpinner({ label = "Memuat data...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg shadow-lg shadow-indigo-500/10">
        <Loader2 className="animate-spin" size={20} />
        <span className="font-medium text-sm">{label}</span>
      </div>
    </div>
  );
}
