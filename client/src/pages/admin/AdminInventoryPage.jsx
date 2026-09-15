import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import BloodBadge from '../../components/common/BloodBadge';
import {
  Boxes,
  Droplets,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  X,
  RefreshCw,
  Trash2,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';

const AdminInventoryPage = () => {
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState({});
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'discarded'

  // Filters
  const [bloodBankFilter, setBloodBankFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [componentFilter, setComponentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [activeUnit, setActiveUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('status'); // 'status' | 'discard'
  const [newStatus, setNewStatus] = useState('');
  const [newTestStatus, setNewTestStatus] = useState('');
  const [discardReason, setDiscardReason] = useState('outdated');
  const [discardNotes, setDiscardNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { toast } = useToast();

  const fetchBloodBanks = async () => {
    try {
      const usersRes = await api.get('/admin/users?limit=100');
      const allUsers = usersRes.data.data || [];
      const uniqueBanks = [];
      const bankIds = new Set();

      allUsers.forEach((u) => {
        if (u.bloodBank && !bankIds.has(u.bloodBank._id)) {
          bankIds.add(u.bloodBank._id);
          uniqueBanks.push(u.bloodBank);
        }
      });
      setBloodBanks(uniqueBanks);
    } catch (err) {
      console.error('Error loading blood banks:', err.message);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bloodBankFilter !== 'All') params.bloodBankId = bloodBankFilter;
      if (bloodGroupFilter !== 'All') params.bloodGroup = bloodGroupFilter;
      if (componentFilter !== 'All') params.componentType = componentFilter;

      if (activeTab === 'discarded') {
        params.status = 'discarded';
      } else if (statusFilter !== 'All') {
        params.status = statusFilter;
      }

      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/admin/inventory', { params });
      setUnits(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err) {
      toast.error('Failed to load inventory ledger: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [bloodBankFilter, bloodGroupFilter, componentFilter, statusFilter, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenModal = (unit, defaultAction = 'status') => {
    setActiveUnit(unit);
    setActionType(defaultAction);
    setNewStatus(unit.status);
    setNewTestStatus(unit.testStatus);
    setDiscardReason('outdated');
    setDiscardNotes('');
    setShowModal(true);
  };

  const handleSaveUnitOverride = async (e) => {
    e.preventDefault();
    if (!activeUnit) return;
    setProcessing(true);

    try {
      const payload = {};
      if (actionType === 'status') {
        payload.status = newStatus;
        payload.testStatus = newTestStatus;
      } else {
        payload.discardReason = discardReason;
        payload.discardNotes = discardNotes.trim() || 'Super Admin biosecurity action';
      }

      const res = await api.put(`/admin/inventory/units/${activeUnit._id}/status`, payload);
      toast.success(res.data.message || 'Unit updated successfully.');
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to update blood unit.');
    } finally {
      setProcessing(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const componentTypes = [
    'Whole Blood',
    'Packed Red Blood Cells (PRBC)',
    'Fresh Frozen Plasma (FFP)',
    'Platelet Concentrate',
    'Cryoprecipitate',
  ];

  const discardReasons = [
    { value: 'outdated', label: 'Outdated / Shelf-Life Expired' },
    { value: 'temperature_breach', label: 'Cold-Chain Temperature Breach (>6°C / <-18°C)' },
    { value: 'hemolyzed', label: 'Hemolyzed Specimen' },
    { value: 'seropositive', label: 'Viral / Serological Reactive (Pathogen Positive)' },
    { value: 'seal_broken', label: 'Primary Bag Seal Compromised' },
    { value: 'clotted', label: 'Fibrin Clot Formation' },
    { value: 'other', label: 'Other Laboratory Discard' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-400/20">
            <Boxes className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-Facility Blood Reserve</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Global Blood Inventory & Stock Ledger</h1>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
            Central oversight of blood components, viral clearance status, cold-chain rack storage, and Australian BloodNet-compliant wastage logs.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Units</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.totalUnits || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Available Screened</div>
          <div className="text-xl font-black text-emerald-900 mt-1">{stats.available || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-blue-50/50 border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Reserved (Orders)</div>
          <div className="text-xl font-black text-blue-900 mt-1">{stats.reserved || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-amber-50/50 border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Expiring &lt;7 Days</div>
          <div className="text-xl font-black text-amber-900 mt-1">{stats.expiringSoon || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-purple-50/50 border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">In Quarantine</div>
          <div className="text-xl font-black text-purple-900 mt-1">{stats.quarantine || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-rose-50/50 border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Discarded / Wastage</div>
          <div className="text-xl font-black text-rose-900 mt-1">{stats.discarded || 0}</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'active'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Blood Units Ledger
        </button>
        <button
          onClick={() => setActiveTab('discarded')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'discarded'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Australian BloodNet Biosecure Discard Log ({stats.discarded || 0})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search DIN Barcode (e.g. DIN-2026-WB401) or Storage Rack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={bloodBankFilter}
              onChange={(e) => setBloodBankFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Blood Banks</option>
              {bloodBanks.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
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

            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Components</option>
              {componentTypes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {activeTab === 'active' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="transfused">Transfused</option>
              </select>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Units Table */}
      {loading ? (
        <LoadingSpinner message="Querying multi-center blood inventory..." />
      ) : units.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Inventory Units Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No blood units match your current filter parameters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">DIN Barcode</th>
                  <th className="py-3 px-4">Blood Center</th>
                  <th className="py-3 px-4">Product & Group</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Expiry Countdown</th>
                  <th className="py-3 px-4">Cold-Chain Storage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {units.map((unit) => {
                  const now = new Date();
                  const expDate = new Date(unit.expiryDate);
                  const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays <= 0;
                  const isExpiringSoon = diffDays > 0 && diffDays <= 7;

                  return (
                    <tr key={unit._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{unit.unitId}</div>
                        <div className="text-[10px] text-slate-400">
                          Collected: {new Date(unit.collectionDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{unit.bloodBank?.name || 'Blood Bank'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{unit.bloodBank?.city}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <BloodBadge bloodGroup={unit.bloodGroup} size="sm" />
                          <span className="font-semibold text-slate-800">{unit.componentType}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{unit.volumeMl} ml</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {expDate.toLocaleDateString()}
                        </div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            <AlertTriangle className="w-3 h-3" /> Expired
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> {diffDays}d left
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{diffDays} days left</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                          <span>{unit.storageLocation?.temperatureRange || '2°C to 6°C'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {unit.storageLocation?.rack || 'Rack'} • {unit.storageLocation?.shelf || 'Shelf'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {unit.status === 'discarded' ? (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Discarded
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                              {unit.discardReason?.replace('_', ' ')}
                            </div>
                          </div>
                        ) : (
                          <StatusBadge status={unit.status} />
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(unit, 'status')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all"
                            title="Edit Unit Status"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {unit.status !== 'discarded' && (
                            <button
                              onClick={() => handleOpenModal(unit, 'discard')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                              title="Australian BloodNet Discard"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Discard</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Unit Intervention Modal */}
      {showModal && activeUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Unit Intervention: {activeUnit.unitId}
                  </h3>
                  <p className="text-xs text-slate-500">Super Administrator Inventory Control</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Status Override vs BloodNet Discard */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActionType('status')}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  actionType === 'status'
                    ? 'bg-white text-purple-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Update Lifecycle Status
              </button>
              <button
                type="button"
                onClick={() => setActionType('discard')}
                className={`flex-1 py-1.5 rounded-md transition-colors ${
                  actionType === 'discard'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BloodNet Biosecure Discard
              </button>
            </div>

            <form onSubmit={handleSaveUnitOverride} className="space-y-4">
              {actionType === 'status' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Inventory Unit Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="available">Available (Screened &amp; Ready)</option>
                      <option value="reserved">Reserved (Clinical Transfusion)</option>
                      <option value="transfused">Transfused (Patient Bedside)</option>
                      <option value="discarded">Discarded (Wastage Protocol)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Viral / Screening Test Status
                    </label>
                    <select
                      value={newTestStatus}
                      onChange={(e) => setNewTestStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="screened_passed">Screened Passed (Pathogen Free)</option>
                      <option value="quarantine">Quarantine (Under Testing)</option>
                      <option value="reactive">Reactive (Pathogen Detected)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Australian BloodNet protocol: Discarded units cannot be transfused and will be permanently decommissioned.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Standard Discard Reason
                    </label>
                    <select
                      value={discardReason}
                      onChange={(e) => setDiscardReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      {discardReasons.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Compliance &amp; Laboratory Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Observation details (e.g. cold-chain breach reading, visual hemolysis)..."
                      value={discardNotes}
                      onChange={(e) => setDiscardNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

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
                  className={`px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 ${
                    actionType === 'discard'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {processing ? 'Applying...' : 'Save Unit Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
