import React from 'react';
import { HeartPulse, ShieldCheck, Activity, Users, Building2, Droplets } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider mb-4">
          <HeartPulse className="w-4 h-4 text-blood-600" />
          <span>About Pulse Point</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Modernizing Blood Supply Chains for Clinical Safety
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          Pulse Point is an enterprise-grade full-stack MERN platform architected to eliminate blood shortages, prevent incompatible transfusions, and connect voluntary donors directly to patient bedsides.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center font-bold mb-4">
            <Droplets className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Unit-Level Traceability</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every blood bag is tracked with a unique alphanumeric unit ID (`PPU-YYYY-XXXXX`), precise storage rack coordinates, temperature logs, and component shelf-life timers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Immunohematology Rules</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automated red cell and plasma compatibility engines ensure that emergency trauma and routine requests match compatible ABO and Rh factors before dispatch.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Role-Based Governance</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict separation of concerns across Super Admins, Blood Bank Technicians, Hospital Transfusion Liaisons, and Voluntary Donors with automated audit trails.
          </p>
        </div>
      </div>

      {/* Sandbox Disclosure */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <h3 className="font-bold text-sm text-amber-900 mb-1 flex items-center gap-2">
          <span>Operational Disclosure for Evaluators</span>
        </h3>
        <p className="text-xs text-amber-800 leading-relaxed">
          Pulse Point is designed for production deployment on <strong>Vercel</strong> and <strong>Render</strong> using <strong>MongoDB Atlas</strong>. For practical evaluation and educational demonstration, laboratory screening tests (e.g. viral ELISA assays) and cold-chain temperature logs are simulated workflows. No real medical emergency dispatch services are connected without formal hospital IT integrations.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
