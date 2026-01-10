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
};
