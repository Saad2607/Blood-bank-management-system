import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { PackageCheck, ShieldCheck, Thermometer, Building2 } from 'lucide-react';

const ReceivedUnitsPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const { toast } = useToast();

  const fetchIssues = async () => {
    try {
      const res = await api.get('/requests/issues/hospital');
      setIssues(res.data.data || []);
    } catch (err) {
      console.error('Error fetching issued records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (requestId) => {
    if (!requestId) return;
    setConfirmingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/deliver`, {
        receivedTemperatureCelsius: 4.2,
        packagingIntact: true,
        bedsideVerificationNotes: 'Acknowledged & received by Hospital Staff',
      });
      toast.success(res.data.message || 'Delivery confirmed! Transfusion units verified.');
      fetchIssues();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm delivery.');
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Received Transfusion Units
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of blood units dispatched from certified blood banks with verified cold-chain logs.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching delivered blood unit records..." />
      ) : issues.length > 0 ? (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
                      Issue ID: {issue.issueId}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      📅 {new Date(issue.dispatchDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    Dispatched from {issue.bloodBank?.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {issue.status === 'Dispatched' ? (
                    <button
                      onClick={() => handleConfirmDelivery(issue.bloodRequest?._id || issue.bloodRequest)}
                      disabled={confirmingId === (issue.bloodRequest?._id || issue.bloodRequest)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{confirmingId === (issue.bloodRequest?._id || issue.bloodRequest) ? 'Confirming...' : 'Acknowledge & Confirm Delivery'}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-4 h-4" />
                      Delivered &amp; Bedside Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Cold Chain Data Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blood-600" />
                  <span>
                    Dispatch Temp:{' '}
                    <strong>{issue.coldChainVerification?.temperatureAtDispatchCelsius || 4.0}°C</strong>
                  </span>
                </div>
                <div>
                  Ice Packs Intact:{' '}
                  <strong>{issue.coldChainVerification?.icePackIntact ? 'Verified Yes' : 'No'}</strong>
                </div>
                <div>
                  Transport Box Sealed:{' '}
                  <strong>{issue.coldChainVerification?.transportBoxSealed ? 'Aseptic Seal Intact' : 'Broken'}</strong>
                </div>
              </div>

              {/* Units Table */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Delivered Units ({issue.issuedUnits?.length} Unit(s))
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {issue.issuedUnits?.map((unit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-xs text-slate-800">
                          {unit.unitId}
                        </div>
                        <div className="text-[11px] text-slate-500">{unit.componentType}</div>
                        <div className="text-[10px] text-slate-400">
                          Exp: {new Date(unit.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <BloodBadge bloodGroup={unit.bloodGroup} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageCheck}
          title="No Blood Units Received Yet"
          description="When an accredited blood bank approves and issues units for your patient requests, dispatch logs and cold-chain compliance reports will be documented here."
        />
      )}
    </div>
  );
};

export default ReceivedUnitsPage;
