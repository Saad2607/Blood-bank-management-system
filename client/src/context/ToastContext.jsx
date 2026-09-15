import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = '', duration = 4500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, message, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast('success', message, title),
    error: (message, title = 'Error') => addToast('error', message, title),
    warning: (message, title = 'Warning') => addToast('warning', message, title),
    info: (message, title = 'Notification') => addToast('info', message, title),
    remove: removeToast,
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          barColor: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
          barColor: 'bg-red-500',
          badgeBg: 'bg-red-50 text-red-700 border-red-200',
          defaultTitle: 'Attention',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          barColor: 'bg-amber-500',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          defaultTitle: 'Warning',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
          barColor: 'bg-sky-500',
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          defaultTitle: 'Notification',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const config = getToastStyles(t.type);
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 flex items-start p-3.5 gap-3 animate-in fade-in slide-in-from-top-4"
            >
              {/* Left Accent Bar */}
              <div className={`w-1 self-stretch rounded-full shrink-0 ${config.barColor}`} />

              {/* Status Icon */}
              <div className="mt-0.5">{config.icon}</div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-snug break-words">
                  {t.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors shrink-0"
                title="Dismiss"
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

export default ToastContext;
