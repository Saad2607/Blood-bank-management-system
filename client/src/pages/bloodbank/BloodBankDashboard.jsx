import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import {
  Boxes,
  ClipboardList,
  AlertTriangle,
  Clock,
  PlusCircle,
  FlaskConical,
  ArrowRight,
  ShieldAlert,
  Droplets,
} from 'lucide-react';

const BloodBankDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, reqRes] = await Promise.all([
          api.get('/inventory/summary'),
          api.get('/requests/bloodbank'),
        ]);
        setSummary(sumRes.data.summary);
        setRequests(reqRes.data.data || []);
      } catch (err) {
        console.error('Error fetching blood bank dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading blood bank facility console and stock matrix..." />;
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const emergencyRequests = pendingRequests.filter((r) => r.urgency === 'Emergency');

  // Groups with low stock (< 3 units)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const groupTotalsMap = {};
  summary?.bloodGroupTotals?.forEach((item) => {
    groupTotalsMap[item._id] = item.count;
  });

  const lowStockGroups = bloodGroups.filter((g) => (groupTotalsMap[g] || 0) < 3);

  return (
    <div className="space-y-8">
      {/* Header Facility Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blood-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-500/20 text-blood-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blood-500/30">
            <Droplets className="w-3.5 h-3.5 text-blood-400" />
            <span>Facility Operations Console</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.bloodBank?.name || 'Central Blood Center'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            License: {user?.bloodBank?.licenseNumber || 'BB-MH-2024'} • {user?.bloodBank?.city || 'Mumbai'} • Operating: {user?.bloodBank?.operatingHours || '24/7'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/bloodbank/screening"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-800 hover:bg-slate-100 shadow-sm transition-all"
          >
            <FlaskConical className="w-4 h-4 text-blood-600" />
            <span>Phlebotomy Lab</span>
          </Link>
          <Link
            to="/bloodbank/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-blood-600 hover:bg-blood-700 text-white shadow-sm shadow-blood-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Blood Unit</span>
          </Link>
        </div>
      </div>

      {/* Emergency Urgent Banner */}
      {emergencyRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-600 text-white shadow-md flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <strong>Immediate Emergency Requisition:</strong> You have {emergencyRequests.length} emergency hospital request(s) awaiting uncrossmatched or compatible red cell allocation!
            </div>
          </div>
          <Link
            to="/bloodbank/requests?urgency=Emergency"
            className="text-xs font-bold bg-white text-red-700 px-3.5 py-1.5 rounded-lg shrink-0 hover:bg-red-50"
          >
            Review & Allocate
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Available Stock"
          value={`${summary?.totalAvailableUnits || 0} Units`}
          subtitle="Screened & ready for issue"
          icon={Boxes}
          color="teal"
        />

        <StatCard
          title="Reserved Units"
          value={`${summary?.totalReservedUnits || 0} Units`}
          subtitle="Allocated to hospital orders"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting staff review"
          icon={ClipboardList}
          color="blue"
          badge={pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : null}
        />

        <StatCard
          title="Expiring Within 7 Days"
          value={`${summary?.expiringCount || 0} Units`}
          subtitle="Platelets / Red cells near expiry"
          icon={AlertTriangle}
          color={summary?.expiringCount > 0 ? 'red' : 'teal'}
          badge={summary?.expiringCount > 0 ? 'Urgent Usage' : 'Stock Stable'}
        />
      </div>

      {/* Blood Group Live Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Blood Group Inventory Matrix
            </h3>
            <p className="text-xs text-slate-500">Live units available by ABO & Rh type.</p>
          </div>
          <Link
            to="/bloodbank/inventory"
            className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
          >
            <span>Manage All Units</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodGroups.map((bg) => {
            const count = groupTotalsMap[bg] || 0;
            const isLow = count < 3;
            return (
              <div
                key={bg}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isLow
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BloodBadge bloodGroup={bg} size="sm" />
                <div className="text-2xl font-black text-slate-900 mt-2">{count}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5 text-slate-400">
                  {isLow ? <span className="text-rose-600 font-bold">Low Stock</span> : 'Units'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Hospital Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blood-600" />
            <span>Incoming Hospital Blood Orders</span>
          </h3>
          <Link
            to="/bloodbank/requests"
            className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map((req) => (
                  <tr
                    key={req._id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      req.urgency === 'Emergency' ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {req.requestId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {req.hospital?.name}
                    </td>
                    <td className="py-3 px-4">
                      <div>{req.patientName}</div>
                      <div className="text-[10px] text-slate-400">File: {req.hospitalFileNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <BloodBadge bloodGroup={req.bloodGroup} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium">{req.componentType}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{req.unitsRequested}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.urgency} type="urgency" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/bloodbank/requests?reqId=${req._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blood-600 hover:bg-blood-700 px-3 py-1.5 rounded-lg shadow-xs transition-all"
                      >
                        Review & Allocate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="All Hospital Requests Processed"
            description="There are currently no pending hospital transfusion orders awaiting fulfillment."
          />
        )}
      </div>
    </div>
  );
};

export default BloodBankDashboard;
