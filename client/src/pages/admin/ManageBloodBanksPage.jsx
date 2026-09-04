import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Droplets, Plus, Phone, MapPin, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

const ManageBloodBanksPage = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [storageCapacityUnits, setStorageCapacityUnits] = useState(2000);
  const [operatingHours, setOperatingHours] = useState('24/7 (Emergency Blood Issue Active)');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBloodBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/blood-banks');
      setBloodBanks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load blood banks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/blood-banks', {
        name,
        licenseNumber,
        email,
        phone,
        street,
        city,
        state,
        pincode,
        storageCapacityUnits: Number(storageCapacityUnits),
        operatingHours,
        emergencyContact,
        componentSeparationAvailable: true,
      });

      setSuccess(`Blood Bank ${name} registered successfully.`);
      setShowModal(false);
      fetchBloodBanks();
    } catch (err) {
      setError(err.message || 'Failed to register blood bank.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Certified Blood Banks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional licensed centers authorized to separate components and issue blood to hospitals.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Blood Bank</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading blood bank facilities..." />
      ) : bloodBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bloodBanks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    License: {bank.licenseNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blood-50 text-blood-700 px-2.5 py-0.5 rounded-full border border-blood-200">
                    <ShieldCheck className="w-3 h-3 text-blood-600" />
                    Licensed Center
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{bank.name}</h3>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {bank.street}, {bank.city}, {bank.state} - {bank.pincode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Hours: <strong>{bank.operatingHours}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Phone: {bank.phone}</span>
                  </p>
                  {bank.emergencyContact && (
                    <p className="flex items-center gap-2 text-blood-700 font-semibold">
                      <span>Emergency Hotline: {bank.emergencyContact}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>Capacity: {bank.storageCapacityUnits} units</span>
                <span className="text-emerald-600">Component Separation: Active</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Droplets}
          title="No Blood Banks Registered"
          description="Register certified regional blood banks to expand the network inventory."
          actionText="Register Blood Bank"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Register Blood Bank Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register Certified Blood Bank</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Blood Bank Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. LifeCare Blood Center"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Official License No
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. BB-MH-2024-9102"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Capacity (Units)
                  </label>
                  <input
                    type="number"
                    value={storageCapacityUnits}
                    onChange={(e) => setStorageCapacityUnits(e.target.value)}
                    min="100"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Emergency Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. 1800-BLOOD-HELP"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Blood Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBloodBanksPage;
