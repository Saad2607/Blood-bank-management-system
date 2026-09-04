import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'red', badge }) => {
  const colorSchemes = {
    red: {
      bg: 'bg-blood-50',
      iconBg: 'bg-blood-100 text-blood-700',
      border: 'border-blood-100',
      badge: 'bg-blood-100 text-blood-800',
    },
    teal: {
      bg: 'bg-medical-50',
      iconBg: 'bg-medical-100 text-medical-700',
      border: 'border-medical-100',
      badge: 'bg-medical-100 text-medical-800',
    },
    blue: {
      bg: 'bg-sky-50',
      iconBg: 'bg-sky-100 text-sky-700',
      border: 'border-sky-100',
      badge: 'bg-sky-100 text-sky-800',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-700',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-800',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100 text-purple-700',
      border: 'border-purple-100',
      badge: 'bg-purple-100 text-purple-800',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.red;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${scheme.badge}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
