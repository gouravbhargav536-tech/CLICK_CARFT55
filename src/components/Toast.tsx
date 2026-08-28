import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Zap } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
        isSuccess
          ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
          : isError
          ? 'bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-950/50'
          : isWarning
          ? 'bg-amber-950/95 border-amber-500/40 text-amber-100 shadow-amber-950/50'
          : 'bg-blue-950/95 border-blue-500/40 text-blue-100 shadow-blue-950/50'
      }`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold tracking-tight text-white">{toast.title}</h4>
          {toast.latencyMs !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15 shrink-0">
              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              {toast.latencyMs}ms
            </span>
          )}
        </div>
        {toast.description && (
          <p className="text-[11px] leading-relaxed opacity-90 mt-0.5 break-words">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
