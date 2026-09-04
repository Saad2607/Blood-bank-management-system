import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import BloodBadge from '../../components/common/BloodBadge';
import { History, Award, CheckCircle2, ShieldCheck, Droplets, Calendar } from 'lucide-react';

const DonationHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/donations/my-history');
        setHistory(res.data.data || []);
      } catch (err) {
        console.error('Error fetching history:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Donation Records & Impact
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed clinical records of your voluntary donations, laboratory screening passes, and component separation yields.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching collection logs..." />
      ) : history.length > 0 ? (
        <div className="space-y-6">
          {/* Certificate of Appreciation Card */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-100 mb-2">
                  <Award className="w-4 h-4" />
                  <span>Official Certificate of Life-Saving Contribution</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Honoring {user?.name}
                </h2>
                <p className="text-xs text-amber-100 max-w-lg mt-1 leading-relaxed">
                  In sincere gratitude for donating {history.length} life-saving blood unit(s), providing essential red blood cells and platelets to emergency and surgical patients.
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                  Donor Rank
                </span>
                <div className="text-xl font-black text-white mt-0.5">
                  {history.length >= 5 ? 'Gold Benefactor' : history.length >= 2 ? 'Silver Lifesaver' : 'Bronze Hero'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Donations List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
              Verified Phlebotomy Records
            </div>
            <div className="divide-y divide-slate-100">
              {history.map((donation) => (
                <div key={donation._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {donation.donationId}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          📅 {new Date(donation.donationDate).toLocaleDateString()}
                        </span>
                        <BloodBadge bloodGroup={donation.bloodGroup} size="sm" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{donation.bloodBank?.name}</h4>
                      <p className="text-xs text-slate-500">
                        {donation.bloodBank?.street}, {donation.bloodBank?.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        {donation.donationType} ({donation.volumeMl} ml)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Screened Passed
                      </span>
                    </div>
                  </div>

                  {donation.screeningVitals && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500">
                      <div>Blood Pressure: <strong className="text-slate-700">{donation.screeningVitals.systolicBP}/{donation.screeningVitals.diastolicBP} mmHg</strong></div>
                      <div>Pulse Rate: <strong className="text-slate-700">{donation.screeningVitals.pulseRate} bpm</strong></div>
                      <div>Hemoglobin: <strong className="text-slate-700">{donation.screeningVitals.hemoglobinGdl} g/dL</strong></div>
                      <div>Weight: <strong className="text-slate-700">{donation.screeningVitals.weightKg} kg</strong></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No Donation History Found"
          description="Your completed blood donations will appear here with full clinical screening markers and separation reports."
        />
      )}
    </div>
  );
};

export default DonationHistoryPage;
