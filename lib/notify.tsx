import toast from "react-hot-toast";
import NotificationToast from "@/app/components/ui/NotificationToast";

export const notify = {
  success: (message: string) => {
    toast.custom((t) => <NotificationToast t={t} message={message} type="success" />, {
        duration: 4000,
        position: 'top-center',
    });
  },
  error: (message: string) => {
    toast.custom((t) => <NotificationToast t={t} message={message} type="error" />, {
        duration: 5000,
        position: 'top-center',
    });
  },
  warning: (message: string) => {
    toast.custom((t) => <NotificationToast t={t} message={message} type="warning" />, {
        duration: 6000,
        position: 'top-center',
    });
  },
  info: (message: string) => {
    toast.custom((t) => <NotificationToast t={t} message={message} type="info" />, {
        duration: 4000,
        position: 'top-center',
    });
  },
  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-7xl mx-auto px-4 md:px-8 pointer-events-none flex justify-center`}>
            <div className="pointer-events-auto w-full bg-slate-900/95 backdrop-blur-md border border-yellow-500/30 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ring-1 ring-white/10 relative">
              
              <div className="flex items-start md:items-center gap-4 flex-1 w-full">
                <div className="bg-yellow-500/20 p-3 rounded-full shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg block md:inline-block md:mr-3">Konfirmasi</h4>
                  <span className="text-slate-300 text-sm block md:inline leading-relaxed">
                    {message}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={() => {
                    toast.remove(t.id);
                    resolve(false);
                  }}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold text-sm transition-colors order-1 md:order-2"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    toast.remove(t.id);
                    resolve(true);
                  }}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-red-500/20 order-2 md:order-1"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
        }
      );
    });
  },
};
