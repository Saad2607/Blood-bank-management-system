import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShieldCheck,
  Building2,
  Users,
  Boxes,
  ClipboardList,
  Activity,
  Droplets,
  ArrowRight,
  Calendar,
  HeartPulse,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, invRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/inventory/summary'),
        ]);
        setStats(statsRes.data.stats);
        setInventorySummary(invRes.data.summary);
      } catch (err) {
        console.error('Error loading admin dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading enterprise platform oversight metrics..." />;
  }

  // Prepare chart data for Blood Group distribution
  const chartData = (inventorySummary?.bloodGroupTotals || []).map((item) => ({
    name: item._id,
    units: item.count,
  }));

  // Prepare chart data for Request Fulfillment
  const requestPieData = [
    { name: 'Pending', value: stats?.requests?.pending || 0, color: '#f59e0b' },
    { name: 'Approved', value: stats?.requests?.approved || 0, color: '#10b981' },
    { name: 'Issued', value: stats?.requests?.issued || 0, color: '#6366f1' },
  ];

  return (
    <div className="space-y-8">
      {/* Enterprise Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Super Administrator Console</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pulse Point Governance & Oversight
          </h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            System-wide monitoring of accredited blood banks, partner hospitals, active clinical requisitions, and compliance audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
          >
            <span>View Audit Logs</span>
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-sm transition-all"
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Platform Users"
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.donors || 0} voluntary donors`}
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Certified Blood Banks"
          value={stats?.facilities?.bloodBanks || 0}
          subtitle="Component separation centers"
          icon={Droplets}
          color="red"
        />

        <StatCard
          title="Partner Hospitals"
          value={stats?.facilities?.hospitals || 0}
          subtitle="Clinical transfusion desks"
          icon={Building2}
          color="teal"
        />

        <StatCard
          title="Total Blood Inventory"
          value={`${stats?.inventory?.availableUnits || 0} Units`}
          subtitle="Screened active stock"
          icon={Boxes}
          color="blue"
        />
      </div>

      {/* Super Admin Enterprise Command Consoles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Operational Command &amp; Oversight Consoles</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Real-time cross-facility management</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Console 1: Hospital Orders */}
          <Link
            to="/admin/hospital-orders"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {stats?.requests?.total || 0} Orders
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-blue-600 transition-colors">
                Hospital Blood Orders &amp; Oversight
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Inspect clinical requisitions, urgent/routine deadlines, cold-chain dispatches, and execute administrative overrides.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Access Orders Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Console 2: Global Stock */}
          <Link
            to="/admin/inventory"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {stats?.inventory?.availableUnits || 0} Units
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-purple-600 transition-colors">
                Global Stock &amp; BloodNet Discard Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Multi-center inventory ledger, component breakdowns, expiry countdowns, and Australian BloodNet wastage compliance logs.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Access Inventory Ledger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Console 3: Donors & Collections */}
          <Link
            to="/admin/donors"
            className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {stats?.users?.donors || 0} Donors
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-rose-600 transition-colors">
                Donor Community &amp; Phlebotomy
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Voluntary donor directory, cooldown eligibility, center appointment schedule, and 5-marker pathogen screening logs.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Manage Donors &amp; Bleeds</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Blood Group Stock Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Blood Group Inventory Distribution
              </h3>
              <p className="text-xs text-slate-500">Live units across all blood bank centers.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="units" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Request Fulfillment Ratio */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Transfusion Requisition Status
            </h3>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestPieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {requestPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-xs font-semibold">
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Pending Requests
                </span>
                <span>{stats?.requests?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Approved / Allocated
                </span>
                <span>{stats?.requests?.approved || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 text-indigo-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Issued / Delivered
                </span>
                <span>{stats?.requests?.issued || 0}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">Total Requests: {stats?.requests?.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
