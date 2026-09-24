import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContextType {
  showToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  showSuccessToast: (title: string, description?: string) => void;
  showErrorToast: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: ToastMessage = { id, title, description, type, timestamp: Date.now() };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3800);
    },
    []
  );

  const showSuccessToast = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'success');
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'error');
    },
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccessToast, showErrorToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 border ${
                isSuccess
                  ? 'bg-emerald-950/95 text-emerald-100 border-emerald-600/50 shadow-emerald-950/50 backdrop-blur-md'
                  : isError
                  ? 'bg-rose-950/95 text-rose-100 border-rose-600/50 shadow-rose-950/50 backdrop-blur-md'
                  : 'bg-zinc-900/95 text-zinc-100 border-zinc-700 shadow-black/60 backdrop-blur-md'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.2]" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400 stroke-[2.2]" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400 stroke-[2.2]" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div
                  className={`text-sm font-semibold tracking-tight ${
                    isSuccess ? 'text-emerald-200' : isError ? 'text-rose-200' : 'text-zinc-100'
                  }`}
                >
                  {toast.title}
                </div>
                {toast.description && (
                  <div
                    className={`mt-1 text-xs leading-relaxed ${
                      isSuccess ? 'text-emerald-300/80' : isError ? 'text-rose-300/80' : 'text-zinc-400'
                    }`}
                  >
                    {toast.description}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-zinc-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md hover:bg-white/10"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
