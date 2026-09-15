import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FlaskConical, CheckCircle2, ShieldCheck, Heart, AlertCircle, Droplets } from 'lucide-react';

const DonationLabPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [volumeMl, setVolumeMl] = useState(450);
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [pulseRate, setPulseRate] = useState(72);
  const [hemoglobinGdl, setHemoglobinGdl] = useState(13.5);
  const [weightKg, setWeightKg] = useState(65);
  const [separateComponents, setSeparateComponents] = useState(true);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        // Fetch donors list (via public stats or admin endpoint)
        const res = await api.get('/admin/users?role=donor&limit=50').catch(() => null);
        if (res && res.data.data) {
          setUsers(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedDonorId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching donors:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/donations', {
        donorId: selectedDonorId,
        bloodGroup,
        volumeMl: Number(volumeMl),
        systolicBP: Number(systolicBP),
        diastolicBP: Number(diastolicBP),
        pulseRate: Number(pulseRate),
        hemoglobinGdl: Number(hemoglobinGdl),
        weightKg: Number(weightKg),
        separateComponents,
        notes,
      });

      setResult(res.data);
      toast.success(res.data.message || 'Donation logged and units separated into active inventory!');
    } catch (err) {
      setError(err.message || 'Collection logging failed.');
      toast.error(err.message || 'Collection logging failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Phlebotomy Collection & Lab Processing
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record donor clinical vitals, perform viral ELISA markers screening, and separate Whole Blood into PRBC and FFP components.
        </p>
      </div>

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{result.message}</span>
          </div>
          <p className="text-xs text-emerald-800">
            Donation ID: <strong>{result.data?.donationId}</strong> • Blood units generated and released into active inventory with cold-chain tracking.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleCollectionSubmit} className="space-y-6">
          {/* Donor & Group Selection */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Voluntary Donor Selection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Select Registered Donor
                </label>
                <select
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:outline-none"
                >
                  {users.length > 0 ? (
                    users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))
                  ) : (
                    <option value="">No registered donors loaded</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Confirmed ABO / Rh Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pre-Screening Vitals */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Pre-Phlebotomy Clinical Vitals (Mandatory Screening)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={diastolicBP}
                  onChange={(e) => setDiastolicBP(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Hemoglobin (g/dL ≥ 12.5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hemoglobinGdl}
                  onChange={(e) => setHemoglobinGdl(e.target.value)}
                  required
                  min="12.5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Weight (kg ≥ 45)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  required
                  min="45"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simulated Laboratory Assay Verification */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Laboratory Viral Testing Screen (Automated Negative Assay)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold">
                HIV I & II: Negative
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold">
                HBsAg: Negative
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold">
                HCV Ab: Negative
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold">
                Syphilis (VDRL): Negative
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold">
                Malaria Smear: Negative
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              All 5 mandatory transmissible infection markers must be non-reactive before releasing units into active storage.
            </p>
          </div>

          {/* Component Separation Checkbox */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Centrifugal Component Separation
              </span>
              <span className="text-xs text-slate-500">
                Produce both Packed Red Blood Cells (PRBC - 280ml) and Fresh Frozen Plasma (FFP - 200ml) from this unit.
              </span>
            </div>
            <input
              type="checkbox"
              checked={separateComponents}
              onChange={(e) => setSeparateComponents(e.target.checked)}
              className="w-5 h-5 text-blood-600 rounded focus:ring-blood-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-md transition-all"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{submitting ? 'Processing Collection...' : 'Log Phlebotomy & Release to Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationLabPage;
