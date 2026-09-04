import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { ClipboardList, PlusCircle, Eye, Building2, AlertCircle } from 'lucide-react';

const RequestTrackerPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/hospital', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          urgency: urgencyFilter !== 'All' ? urgencyFilter : undefined,
        },
      });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error loading requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Transfusion Requisition Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time fulfillment, cross-matching, and issuance status of blood orders.
          </p>
        </div>

        <Link
          to="/hospital/new-request"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Requisition</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved & Reserved</option>
            <option value="issued">Issued / Dispatched</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
            Urgency Level
          </label>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Urgencies</option>
            <option value="Emergency">Emergency</option>
            <option value="Urgent">Urgent</option>
            <option value="Routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner message="Fetching hospital requisitions..." />
      ) : requests.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Blood Bank</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {req.requestId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.patientName}</div>
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
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {req.bloodBank?.name}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blood-600 hover:text-blood-700 bg-blood-50 hover:bg-blood-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No Matching Blood Requests Found"
          description="Try clearing filters or create a new transfusion requisition."
        />
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                  {selectedRequest.requestId}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRequest.patientName} ({selectedRequest.patientAge}y, {selectedRequest.patientGender})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Blood Group</span>
                <BloodBadge bloodGroup={selectedRequest.bloodGroup} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Component</span>
                <span className="font-bold text-slate-800">{selectedRequest.componentType}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Urgency Level</span>
                <StatusBadge status={selectedRequest.urgency} type="urgency" />
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Order Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">
                Clinical Diagnosis & Indication
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                "{selectedRequest.clinicalDiagnosis}"
              </p>
            </div>

            {selectedRequest.allocatedUnits && selectedRequest.allocatedUnits.length > 0 && (
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">
                  Allocated Unit Barcodes
                </span>
                <div className="space-y-1">
                  {selectedRequest.allocatedUnits.map((u, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center justify-between"
                    >
                      <span>Unit #{u.unitId || u}</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                        Reserved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTrackerPage;
