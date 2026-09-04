import React from 'react';
import { HeartPulse } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-2xl bg-blood-50 border border-blood-200 flex items-center justify-center text-blood-600 shadow-sm animate-bounce">
        <HeartPulse className="w-7 h-7 animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      {Icon && (
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blood-600 hover:bg-blood-700 rounded-lg shadow-sm transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
