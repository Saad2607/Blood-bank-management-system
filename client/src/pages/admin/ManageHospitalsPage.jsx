import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Building2, Plus, Phone, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ManageHospitalsPage = () => {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [hospitalType, setHospitalType] = useState('Private');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/hospitals');
      setHospitals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load hospitals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/hospitals', {
        name,
        registrationNumber,
        hospitalType,
        email,
        phone,
        street,
        city,
        state,
        pincode,
        emergencyContact,
      });

      toast.success(`Hospital "${name}" registered successfully.`);
      setShowModal(false);
      fetchHospitals();
    } catch (err) {
      setError(err.message || 'Failed to register hospital.');
      toast.error(err.message || 'Failed to register hospital.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Partner Hospitals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accreditation directory of authorized healthcare institutions requesting blood products.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-medical-600 hover:bg-medical-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hospital</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading hospital institutions..." />
      ) : hospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Reg: {hosp.registrationNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-medical-50 text-medical-700 px-2.5 py-0.5 rounded-full border border-medical-200">
                    <ShieldCheck className="w-3 h-3 text-medical-600" />
                    Accredited
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{hosp.name}</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                  {hosp.hospitalType} Hospital
                </span>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {hosp.street}, {hosp.city}, {hosp.state} - {hosp.pincode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Contact Phone: {hosp.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 text-blood-700 font-semibold">
                    <span>Emergency Ambulance: {hosp.emergencyContact}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No Hospitals Registered"
          description="Register partner medical centers to allow clinical staff blood requisitions."
          actionText="Register Hospital"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Register Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register Partner Hospital</h3>
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
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Super Specialty Hospital"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Registration No
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. HOSP-MH-9941"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Type
                  </label>
                  <select
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                  >
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Trust">Trust</option>
                    <option value="Clinic">Clinic</option>
                  </select>
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

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Emergency Desk / Hotline
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. 108 / +91 22 2400 9108"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHospitalsPage;
