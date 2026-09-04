import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests/hospital');
        setRequests(res.data.data || []);
      } catch (err) {
        console.error('Error fetching hospital requests:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading hospital clinical requests and transfusion records..." />;
  }

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'approved').length;
  const issuedRequests = requests.filter((r) => r.status === 'issued').length;
  const emergencyRequests = requests.filter(
    (r) => r.urgency === 'Emergency' && r.status !== 'issued'
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-medical-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-medical-200 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-medical-400" />
            <span>Hospital Transfusion Management Console</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.hospital?.name || 'Hospital Department'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Registered Facility • {user?.hospital?.city || 'Mumbai'} • Reg No: {user?.hospital?.registrationNumber || 'HOSP-2024'}
          </p>
        </div>

        <Link
          to="/hospital/new-request"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-blood-600 hover:bg-blood-700 text-white shadow-md shadow-blood-600/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Blood Request</span>
        </Link>
      </div>

      {/* Emergency Alert Banner */}
      {emergencyRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs">
              <strong>Emergency Transfusion Alert:</strong> You have {emergencyRequests.length} active emergency trauma/surgery request(s) awaiting fulfillment.
            </div>
          </div>
          <Link
            to="/hospital/requests?urgency=Emergency"
            className="text-xs font-bold text-red-700 hover:underline shrink-0"
          >
            Track Immediate Status &rarr;
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Blood Requests"
          value={totalRequests}
          subtitle="Lifetime hospital orders"
          icon={ClipboardList}
          color="blue"
        />

        <StatCard
          title="Pending Review"
          value={pendingRequests}
          subtitle="Cross-matching in progress"
          icon={Clock}
          color="amber"
          badge={pendingRequests > 0 ? 'Action Required' : null}
        />

        <StatCard
          title="Approved & Allocated"
          value={approvedRequests}
          subtitle="Units reserved at blood bank"
          icon={CheckCircle2}
          color="teal"
        />

        <StatCard
          title="Dispatched / Issued"
          value={issuedRequests}
          subtitle="Received for transfusion"
          icon={PackageCheck}
          color="purple"
        />
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blood-600" />
            <span>Recent Blood Requests</span>
          </h3>
          <Link
            to="/hospital/requests"
            className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Blood Bank</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {req.requestId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.patientName}</div>
                      <div className="text-[11px] text-slate-400">File: {req.hospitalFileNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <BloodBadge bloodGroup={req.bloodGroup} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium">{req.componentType}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{req.unitsRequested}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.urgency} type="urgency" />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {req.bloodBank?.name}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No Blood Requests Submitted"
            description="Submit an urgent or routine blood request for your hospitalized patients."
            actionText="Create Blood Request"
            onAction={() => (window.location.href = '/hospital/new-request')}
          />
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
