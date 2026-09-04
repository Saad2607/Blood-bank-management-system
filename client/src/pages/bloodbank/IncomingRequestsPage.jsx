import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Truck,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';

const IncomingRequestsPage = () => {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState(searchParams.get('urgency') || 'All');
  const [loading, setLoading] = useState(true);

  // Issue Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [dispatchTemp, setDispatchTemp] = useState(4.0);
  const [icePackIntact, setIcePackIntact] = useState(true);
  const [transportBoxSealed, setTransportBoxSealed] = useState(true);
  const [courierName, setCourierName] = useState('Hospital Transport Liaison');
  const [courierPhone, setCourierPhone] = useState('9876543210');

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/bloodbank', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          urgency: urgencyFilter !== 'All' ? urgencyFilter : undefined,
        },
      });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching bank requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  // Handle Approve & Allocate
  const handleApprove = async (reqId) => {
    if (!window.confirm('Approve request and allocate compatible units from active inventory?'))
      return;
    setProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put(`/requests/${reqId}/approve`);
      setMessage({ type: 'success', text: res.data.message });
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    setProcessing(true);

    try {
      const res = await api.put(`/requests/${activeRequest._id}/reject`, {
        rejectionReason,
      });
      setMessage({ type: 'success', text: res.data.message });
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // Handle Issue Blood
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    setProcessing(true);

    try {
      const res = await api.post(`/requests/${activeRequest._id}/issue`, {
        temperatureAtDispatchCelsius: Number(dispatchTemp),
        icePackIntact,
        transportBoxSealed,
        recipientStaffName: courierName,
        recipientContactPhone: courierPhone,
      });

      setMessage({ type: 'success', text: res.data.message });
      setShowIssueModal(false);
      fetchRequests();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Hospital Blood Orders & Issuance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review clinical requisitions, cross-match available stock, and issue blood with cold-chain audit validation.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

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
            <option value="pending">Pending Review</option>
            <option value="approved">Approved (Reserved)</option>
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
            <option value="Emergency">Emergency Only</option>
            <option value="Urgent">Urgent Only</option>
            <option value="Routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner message="Loading incoming hospital requests..." />
      ) : requests.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Hospital & Patient</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const isEmergency = req.urgency === 'Emergency';
                  return (
                    <tr
                      key={req._id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isEmergency && req.status === 'pending' ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {req.requestId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{req.hospital?.name}</div>
                        <div className="text-slate-500">
                          {req.patientName} ({req.patientAge}y) • File: {req.hospitalFileNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <BloodBadge bloodGroup={req.bloodGroup} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-medium">{req.componentType}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{req.unitsRequested}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.urgency} type="urgency" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req._id)}
                              disabled={processing}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all"
                            >
                              Approve & Allocate
                            </button>
                            <button
                              onClick={() => {
                                setActiveRequest(req);
                                setShowRejectModal(true);
                              }}
                              disabled={processing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <button
                            onClick={() => {
                              setActiveRequest(req);
                              setShowIssueModal(true);
                            }}
                            disabled={processing}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Issue Blood</span>
                          </button>
                        )}

                        {req.status === 'issued' && (
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No Matching Requests"
          description="Hospital transfusion orders assigned to your facility will appear here."
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reject Request: {activeRequest.requestId}
            </h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Clinical / Inventory Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows="3"
                  placeholder="e.g. Zero available compatible units in stock; recommended immediate referral to regional blood center."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Blood Modal */}
      {showIssueModal && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {activeRequest.requestId}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Issue Blood to {activeRequest.hospital?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div>Patient: <strong>{activeRequest.patientName}</strong></div>
                <div>Component: <strong>{activeRequest.unitsRequested} unit(s) of {activeRequest.bloodGroup} {activeRequest.componentType}</strong></div>
              </div>

              {/* Cold Chain Verification */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cold-Chain Transport Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Dispatch Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dispatchTemp}
                      onChange={(e) => setDispatchTemp(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Ice Pack Condition
                    </label>
                    <select
                      value={icePackIntact ? 'true' : 'false'}
                      onChange={(e) => setIcePackIntact(e.target.value === 'true')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                    >
                      <option value="true">Intact & Chilled</option>
                      <option value="false">Melted / Compromised</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Courier / Recipient Name
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Courier Phone
                    </label>
                    <input
                      type="tel"
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  {processing ? 'Dispatching...' : 'Confirm & Dispatch Blood'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingRequestsPage;
