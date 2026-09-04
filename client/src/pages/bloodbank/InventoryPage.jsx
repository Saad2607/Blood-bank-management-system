import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/common/BloodBadge';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Boxes, Plus, Search, Trash2, AlertTriangle, CheckCircle2, Thermometer } from 'lucide-react';

const InventoryPage = () => {
  const [units, setUnits] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('All');
  const [componentType, setComponentType] = useState('All');
  const [status, setStatus] = useState('available');
  const [searchUnitId, setSearchUnitId] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Unit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addBloodGroup, setAddBloodGroup] = useState('O-');
  const [addComponent, setAddComponent] = useState('Packed Red Blood Cells (PRBC)');
  const [addVolume, setAddVolume] = useState(280);
  const [addRack, setAddRack] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory', {
        params: {
          bloodGroup: bloodGroup !== 'All' ? bloodGroup : undefined,
          componentType: componentType !== 'All' ? componentType : undefined,
          status: status !== 'All' ? status : undefined,
          unitId: searchUnitId.trim() || undefined,
        },
      });
      setUnits(res.data.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [bloodGroup, componentType, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUnits();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/inventory/units', {
        bloodGroup: addBloodGroup,
        componentType: addComponent,
        volumeMl: Number(addVolume),
        rack: addRack || undefined,
      });

      setSuccess('Blood unit added to active inventory with automatic expiry tracking.');
      setShowAddModal(false);
      fetchUnits();
    } catch (err) {
      setError(err.message || 'Failed to add blood unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscardUnit = async (id, unitId) => {
    if (!window.confirm(`Are you sure you want to mark unit ${unitId} as DISCARDED?`)) return;
    try {
      await api.put(`/inventory/units/${id}`, {
        status: 'discarded',
        testStatus: 'reactive_discarded',
      });
      fetchUnits();
    } catch (err) {
      alert(err.message || 'Failed to discard unit.');
    }
  };

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = [
    'All',
    'Packed Red Blood Cells (PRBC)',
    'Whole Blood',
    'Fresh Frozen Plasma (FFP)',
    'Platelet Concentrate',
    'Cryoprecipitate',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Unit-Level Blood Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual barcode tracking, storage temperature coordinates, and shelf-life expiration management.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Blood Unit</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchUnitId}
            onChange={(e) => setSearchUnitId(e.target.value)}
            placeholder="Search Unit ID (e.g. PPU-2026-00101)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none"
          />
        </form>

        <select
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
        >
          {bloodGroups.map((bg) => (
            <option key={bg} value={bg}>
              {bg === 'All' ? 'All Blood Groups' : bg}
            </option>
          ))}
        </select>

        <select
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
        >
          {components.map((comp) => (
            <option key={comp} value={comp}>
              {comp === 'All' ? 'All Components' : comp}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="available">Available (Screened)</option>
          <option value="reserved">Reserved for Request</option>
          <option value="issued">Issued to Hospital</option>
          <option value="discarded">Discarded</option>
        </select>
      </div>

      {/* Units Table */}
      {loading ? (
        <LoadingSpinner message="Loading inventory units..." />
      ) : units.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Unit ID</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Storage Coordinates</th>
                  <th className="py-3 px-4">Collected</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => {
                  const isNearExpiry =
                    new Date(unit.expiryDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                  return (
                    <tr key={unit._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {unit.unitId}
                      </td>
                      <td className="py-3 px-4">
                        <BloodBadge bloodGroup={unit.bloodGroup} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-medium">{unit.componentType}</td>
                      <td className="py-3 px-4">{unit.volumeMl} ml</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {unit.storageLocation?.rack} • {unit.storageLocation?.shelf}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {unit.storageLocation?.temperatureRange}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(unit.collectionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            isNearExpiry ? 'text-red-600 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {new Date(unit.expiryDate).toLocaleDateString()}
                        </span>
                        {isNearExpiry && (
                          <span className="block text-[10px] text-red-500 font-bold">
                            Expiring Soon
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={unit.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {unit.status === 'available' && (
                          <button
                            onClick={() => handleDiscardUnit(unit._id, unit.unitId)}
                            title="Discard contaminated/hemolyzed unit"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          icon={Boxes}
          title="No Inventory Units Found"
          description="Adjust your search filters or add a new blood unit to inventory."
          actionText="Add Blood Unit"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Blood Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Blood Unit to Inventory</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={addBloodGroup}
                    onChange={(e) => setAddBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:outline-none"
                  >
                    {bloodGroups.filter((g) => g !== 'All').map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Volume (ml)
                  </label>
                  <input
                    type="number"
                    value={addVolume}
                    onChange={(e) => setAddVolume(e.target.value)}
                    min="100"
                    max="600"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Component Type
                </label>
                <select
                  value={addComponent}
                  onChange={(e) => setAddComponent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none"
                >
                  {components.filter((c) => c !== 'All').map((comp) => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Custom Storage Rack (Optional)
                </label>
                <input
                  type="text"
                  value={addRack}
                  onChange={(e) => setAddRack(e.target.value)}
                  placeholder="Leave blank for automatic rack assignment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                💡 Shelf life and storage temperatures are automatically calculated based on immunohematology standards (e.g. 42 days for PRBC at 2-6°C, 365 days for FFP at -18°C, 5 days for Platelets).
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all"
                >
                  {submitting ? 'Generating Barcode...' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
