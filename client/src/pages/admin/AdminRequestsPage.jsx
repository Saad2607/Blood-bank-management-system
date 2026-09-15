import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import {
  ClipboardList,
  Building2,
  Droplets,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Edit3,
  X,
  ChevronRight,
  RefreshCw,
  User,
  HeartPulse,
} from 'lucide-react';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [bloodBankFilter, setBloodBankFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Override State
  const [activeRequest, setActiveRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newBloodBank, setNewBloodBank] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();

  const fetchMetadata = async () => {
    try {
      const usersRes = await api.get('/admin/users?limit=100');
      const allUsers = usersRes.data.data || [];

      const uniqueHospitals = [];
      const uniqueBanks = [];
      const hospIds = new Set();
      const bankIds = new Set();

      allUsers.forEach((u) => {
        if (u.hospital && !hospIds.has(u.hospital._id)) {
          hospIds.add(u.hospital._id);
          uniqueHospitals.push(u.hospital);
        }
        if (u.bloodBank && !bankIds.has(u.bloodBank._id)) {
          bankIds.add(u.bloodBank._id);
          uniqueBanks.push(u.bloodBank);
        }
      });

      setHospitals(uniqueHospitals);
      setBloodBanks(uniqueBanks);
    } catch (err) {
      console.error('Error fetching facility metadata:', err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
      if (hospitalFilter !== 'All') params.hospitalId = hospitalFilter;
      if (bloodBankFilter !== 'All') params.bloodBankId = bloodBankFilter;
      if (bloodGroupFilter !== 'All') params.bloodGroup = bloodGroupFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/admin/requests', { params });
      setRequests(res.data.data || []);
      setStatusCounts(res.data.statusCounts || {});
    } catch (err) {
      toast.error('Failed to load requisitions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter, hospitalFilter, bloodBankFilter, bloodGroupFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleOpenOverride = (req) => {
    setActiveRequest(req);
    setNewStatus(req.status);
    setNewBloodBank(req.bloodBank?._id || '');
    setAdminNotes(req.notes || '');
    setShowModal(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    setProcessing(true);

    try {
      const payload = {
        status: newStatus,
        bloodBankId: newBloodBank || undefined,
        adminNotes: adminNotes.trim(),
      };

      const res = await api.put(`/admin/requests/${activeRequest._id}/override`, payload);
      toast.success(res.data.message || 'Requisition updated by Super Admin.');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to override requisition.');
    } finally {
      setProcessing(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/20">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>National Requisitions Registry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hospital Blood Orders & Oversight</h1>
          <p className="text-xs text-blue-200/80 mt-1 max-w-xl">
            Live central monitoring of all clinical blood orders submitted by hospitals to accredited blood banks across the country.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'All'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Orders</div>
          <div className="text-xl font-black text-slate-900 mt-1">{statusCounts.total || 0}</div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-600 uppercase">Pending Triage</div>
          <div className="text-xl font-black text-amber-900 mt-1">{statusCounts.pending || 0}</div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'approved'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-600 uppercase">Approved / Reserved</div>
          <div className="text-xl font-black text-emerald-900 mt-1">{statusCounts.approved || 0}</div>
        </div>

        <div
          onClick={() => setStatusFilter('issued')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'issued'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-indigo-600 uppercase">In Cold Transit</div>
          <div className="text-xl font-black text-indigo-900 mt-1">{statusCounts.issued || 0}</div>
        </div>

        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'delivered'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-teal-600 uppercase">Bedside Delivered</div>
          <div className="text-xl font-black text-teal-900 mt-1">{statusCounts.delivered || 0}</div>
        </div>

        <div
          onClick={() => setUrgencyFilter('Emergency')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            urgencyFilter === 'Emergency'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-600 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping inline-block" />
            <span>STAT Emergency</span>
          </div>
          <div className="text-xl font-black text-rose-900 mt-1">{statusCounts.emergency || 0}</div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Request ID, Patient Name, or Hospital File No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="issued">Issued</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Urgencies</option>
              <option value="Routine">Routine (&lt;24h)</option>
              <option value="Urgent">Urgent (&lt;12h)</option>
              <option value="Emergency">Emergency STAT (&lt;2h)</option>
            </select>

            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner message="Querying national hospital blood orders..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Requisitions Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hospital blood orders match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Request ID & Date</th>
                  <th className="py-3 px-4">Hospital & Patient</th>
                  <th className="py-3 px-4">Blood Product</th>
                  <th className="py-3 px-4">Target Blood Bank</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{req.requestId}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()} at{' '}
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{req.hospital?.name || 'Partner Hospital'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Pt: <span className="font-semibold text-slate-700">{req.patientName}</span> ({req.patientAge}y, {req.patientGender})
                        {req.hospitalFileNumber && ` • File: ${req.hospitalFileNumber}`}
                      </div>
                      <div className="text-[11px] text-slate-400 italic truncate max-w-xs">
                        Dx: {req.clinicalDiagnosis}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BloodBadge bloodGroup={req.bloodGroup} size="sm" />
                        <span className="font-bold text-slate-800">{req.unitsRequested} Unit(s)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{req.componentType}</div>
                      {req.allocatedUnits?.length > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Allocated: {req.allocatedUnits.map((u) => u.unitId).join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{req.bloodBank?.name || 'Accredited Center'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{req.bloodBank?.city}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={req.urgency} type="urgency" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenOverride(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Intervene / Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Inspection & Override Modal */}
      {showModal && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Requisition Oversight: {activeRequest.requestId}
                  </h3>
                  <p className="text-xs text-slate-500">Super Administrator Intervention & Details</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clinical Overview Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold block">Hospital:</span>
                  <span className="font-bold text-slate-800">{activeRequest.hospital?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Patient:</span>
                  <span className="font-bold text-slate-800">
                    {activeRequest.patientName} ({activeRequest.patientAge}y, {activeRequest.patientGender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Product Required:</span>
                  <span className="font-bold text-slate-800">
                    {activeRequest.unitsRequested}x {activeRequest.bloodGroup} {activeRequest.componentType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Triage Urgency:</span>
                  <span className="font-bold text-slate-800">{activeRequest.urgency}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Clinical Diagnosis:</span>
                <span className="text-slate-700 font-medium">{activeRequest.clinicalDiagnosis}</span>
              </div>

              {activeRequest.allocatedUnits?.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block">Reserved Unit Barcodes:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeRequest.allocatedUnits.map((u) => (
                      <span key={u._id} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {u.unitId} ({u.bloodGroup} • Exp: {new Date(u.expiryDate).toLocaleDateString()})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Intervention Form */}
            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Override Requisition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pending">Pending (Awaiting Allocation)</option>
                    <option value="approved">Approved (Units Reserved)</option>
                    <option value="issued">Issued (Cold-Chain Dispatched)</option>
                    <option value="delivered">Delivered (Bedside Verified)</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled (Release Units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Reassign Blood Bank Center
                  </label>
                  <select
                    value={newBloodBank}
                    onChange={(e) => setNewBloodBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Keep Existing Bank</option>
                    {bloodBanks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Super Admin Intervention Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="State the administrative rationale (e.g. emergency protocol override, center reroute)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
                >
                  {processing ? 'Applying Changes...' : 'Save Administrative Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
