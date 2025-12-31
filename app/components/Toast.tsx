"use client";

import { Transition } from "@headlessui/react";
import { CheckCircle, XCircle, X, AlertTriangle, Info } from "lucide-react";
import { Fragment, useEffect } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  show: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  show, 
  message, 
  type = 'success', 
  onClose,
  duration = 4000 
}: ToastProps) {
  
  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const styles = {
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: XCircle },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: AlertTriangle },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Info },
  };

  const currentStyle = styles[type];
  const Icon = currentStyle.icon;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
       <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`pointer-events-auto w-80 md:w-96 overflow-hidden rounded-xl border ${currentStyle.bg} ${currentStyle.border} bg-slate-900 shadow-2xl ring-1 ring-black ring-opacity-5`}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <Icon className={`h-6 w-6 ${currentStyle.text}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${currentStyle.text} leading-relaxed`}>
                    {message}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button
                    type="button"
                    className={`inline-flex rounded-lg p-1.5 ${currentStyle.text} hover:bg-black/20 focus:outline-none transition-colors`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
    </div>
  );
}
