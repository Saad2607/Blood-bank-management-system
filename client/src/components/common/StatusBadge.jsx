import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  const normalized = status?.toLowerCase() || '';

  // Urgency Type
  if (type === 'urgency') {
    switch (normalized) {
      case 'emergency':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Emergency
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Urgent
          </span>
        );
      case 'routine':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Routine
          </span>
        );
    }
  }

  // Request / Item Status
  switch (normalized) {
    case 'approved':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Approved
        </span>
      );
    case 'issued':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Issued
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          Delivered
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pending
        </span>
      );
    case 'rejected':
    case 'discarded':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          {status}
        </span>
      );
    case 'available':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Available
        </span>
      );
    case 'reserved':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          Reserved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
          {status || 'Unknown'}
        </span>
      );
  }
};

export default StatusBadge;
