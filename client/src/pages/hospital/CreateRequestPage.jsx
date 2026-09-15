import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, AlertTriangle, ArrowRight, ShieldCheck, Clock, Zap, CheckCircle2 } from 'lucide-react';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [bloodBankId, setBloodBankId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [hospitalFileNumber, setHospitalFileNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [componentType, setComponentType] = useState('Packed Red Blood Cells (PRBC)');
  const [unitsRequested, setUnitsRequested] = useState(1);
  const [urgency, setUrgency] = useState('Routine');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [requiredByDate, setRequiredByDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get('/public/blood-banks');
        setBloodBanks(res.data.data || []);
        if (res.data.data?.length > 0) {
          setBloodBankId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load blood banks:', err.message);
      }
    };
    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/requests', {
        bloodBankId,
        patientName,
        patientAge: Number(patientAge),
        patientGender,
        hospitalFileNumber,
        bloodGroup,
        componentType,
        unitsRequested: Number(unitsRequested),
        urgency,
        clinicalDiagnosis,
        requiredByDate: requiredByDate || undefined,
      });

      toast.success(`Transfusion requisition submitted successfully (${urgency} priority).`);
      navigate('/hospital/requests');
    } catch (err) {
      setError(err.message || 'Failed to submit clinical request.');
      toast.error(err.message || 'Failed to submit clinical request.');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = [
    'Packed Red Blood Cells (PRBC)',
    'Whole Blood',
    'Fresh Frozen Plasma (FFP)',
    'Platelet Concentrate',
    'Cryoprecipitate',
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Submit Clinical Blood Requisition
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Order unit-matched blood components from certified blood bank centers with urgency triage.
        </p>
      </div>

      {urgency === 'Emergency' && (
        <div className="p-4 rounded-2xl bg-red-600 text-white flex items-center gap-3 shadow-md animate-pulse">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div className="text-xs">
            <strong>Emergency Status Active:</strong> This request bypasses routine queueing and alerts blood bank phlebotomists immediately for uncrossmatched or emergency-compatible O- red cells.
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Bank Destination */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Target Certified Blood Bank
            </label>
            <select
              value={bloodBankId}
              onChange={(e) => setBloodBankId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
            >
              {bloodBanks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name} — {bank.city} (Capacity: {bank.storageCapacityUnits} units)
                </option>
              ))}
            </select>
          </div>

          {/* Patient Details */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Patient Clinical Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Hospital Inpatient / File ID
                </label>
                <input
                  type="text"
                  value={hospitalFileNumber}
                  onChange={(e) => setHospitalFileNumber(e.target.value)}
                  placeholder="e.g. ICU-2026-99"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="42"
                  required
                  min="0"
                  max="120"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Patient Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Units Needed
                </label>
                <input
                  type="number"
                  value={unitsRequested}
                  onChange={(e) => setUnitsRequested(e.target.value)}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Component & Urgency Triage */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Transfusion Specifics & Urgency Triage
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Blood Component
              </label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
              >
                {components.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Triage Level Selector */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Clinical Urgency Triage (Australian BloodNet / NHSBT Protocol)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setUrgency('Routine')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    urgency === 'Routine'
                      ? 'border-slate-800 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Routine</span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-1">Target: &lt;24–48 Hours</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Elective surgeries, stable chronic anemia, standard cross-match queue.
                  </p>
                </div>

                <div
                  onClick={() => setUrgency('Urgent')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    urgency === 'Urgent'
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-amber-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Urgent</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-[11px] font-bold text-amber-700 mt-1">Target: &lt;6–12 Hours</div>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Inpatient clinical deterioration, urgent surgery scheduled today.
                  </p>
                </div>

                <div
                  onClick={() => setUrgency('Emergency')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    urgency === 'Emergency'
                      ? 'border-red-600 bg-red-50 shadow-sm ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-red-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900">Emergency (STAT)</span>
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-[11px] font-bold text-red-700 mt-1">Target: &lt;2 Hours</div>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Life-threatening massive hemorrhage, trauma code, STAT uncrossmatched issue.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Clinical Indication & Diagnosis
              </label>
              <textarea
                value={clinicalDiagnosis}
                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                required
                rows="3"
                placeholder="e.g. Severe intra-operative hemorrhage during emergency laparotomy, estimated blood loss > 1500ml."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Required Transfusion Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
              <span className="block text-[10px] text-slate-400 mt-1">
                Leave blank to automatically apply dispatch target based on triage priority.
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/hospital/requests')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blood-600 hover:bg-blood-700 shadow-md shadow-blood-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Submitting Order...' : 'Submit Transfusion Requisition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
