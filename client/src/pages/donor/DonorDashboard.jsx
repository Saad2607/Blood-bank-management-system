import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import BloodBadge from '../../components/common/BloodBadge';
import StatCard from '../../components/common/StatCard';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import {
  HeartPulse,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Building2,
  FlaskConical,
  Boxes,
  Sparkles,
} from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [eligibility, setEligibility] = useState({
    isEligible: true,
    lastDonationDate: null,
    nextEligibleDate: null,
    totalDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const [histRes, apptRes] = await Promise.all([
          api.get('/donations/my-history'),
          api.get('/appointments/my'),
        ]);

        setHistory(histRes.data.data || []);
        if (histRes.data.eligibility) {
          setEligibility(histRes.data.eligibility);
        }
        setAppointments(apptRes.data.data || []);
      } catch (err) {
        console.error('Error fetching donor dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading donor medical profile and records..." />;
  }

  // Calculate cooldown countdown
  const isEligibleNow = eligibility.isEligible;
  let daysUntilEligible = 0;
  if (eligibility.nextEligibleDate) {
    const diff = new Date(eligibility.nextEligibleDate).getTime() - Date.now();
    daysUntilEligible = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-yellow-300" />
              <span>Voluntary Life Saver Profile</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-blood-100 mt-1 max-w-xl">
              Your donations directly support emergency surgeries, trauma care, and clinical oncology transfusions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-blood-100">Blood Group</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {user?.donorProfile?.bloodGroup || 'O+'}
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-blood-100">Donations</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {eligibility.totalDonations}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Clinical Eligibility"
          value={isEligibleNow ? 'Eligible to Donate' : `Cooldown (${daysUntilEligible}d left)`}
          subtitle={
            isEligibleNow
              ? 'Ready for voluntary collection'
              : `Eligible on ${new Date(eligibility.nextEligibleDate).toLocaleDateString()}`
          }
          icon={isEligibleNow ? CheckCircle2 : Clock}
          color={isEligibleNow ? 'teal' : 'amber'}
        />

        <StatCard
          title="Total Units Donated"
          value={`${eligibility.totalDonations} Units`}
          subtitle="Whole blood voluntary units"
          icon={HeartPulse}
          color="red"
        />

        <StatCard
          title="Estimated Lives Saved"
          value={`${eligibility.totalDonations * 3}`}
          subtitle="Up to 3 lives per separated unit"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Scheduled Appointments"
          value={appointments.filter((a) => a.status === 'Booked').length}
          subtitle="Upcoming center visits"
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Main Grid: Next Appointment & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Appointment or Booking Prompt */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blood-600" />
              <span>Upcoming Donation Appointment</span>
            </h3>
            <Link
              to="/donor/book"
              className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
            >
              <span>Schedule New</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.filter((a) => a.status === 'Booked').length > 0 ? (
            <div className="space-y-3">
              {appointments
                .filter((a) => a.status === 'Booked')
                .slice(0, 2)
                .map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase text-medical-700 bg-medical-50 px-2 py-0.5 rounded border border-medical-200">
                        Confirmed Appointment
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{appt.bloodBank?.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {appt.bloodBank?.street}, {appt.bloodBank?.city}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold mt-2">
                        <span>📅 {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                        <span>⏰ {appt.timeSlot}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 italic max-w-xs">
                      {appt.notes ? `"${appt.notes}"` : 'Routine voluntary donation'}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Upcoming Appointment</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Schedule a convenient time slot at your nearest certified blood center.
              </p>
              <Link
                to="/donor/book"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white shadow-sm transition-all"
              >
                <span>Book Appointment Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right 1 Col: Digital Donor ID Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-[10px] font-mono font-bold tracking-widest text-blood-400 uppercase">
                Pulse Point • Digital Donor ID
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black tracking-tight">{user?.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                <p className="text-xs text-slate-400">{user?.phone}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-blood-600/90 border border-blood-400/50 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[9px] uppercase font-bold text-blood-200">ABO/Rh</span>
                <span className="text-lg font-black text-white">
                  {user?.donorProfile?.bloodGroup || 'O+'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Donor Status
                </span>
                <span className="font-bold text-emerald-400">Verified Voluntary</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">City</span>
                <span className="font-bold">{user?.city || 'Mumbai'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-700 text-[10px] text-slate-500 text-center">
            Valid at all accredited Pulse Point blood bank facilities.
          </div>
        </div>
      </div>

      {/* Real-World Blood Journey Tracker (American Red Cross / Lifeblood Protocol) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>The Journey of Your Blood (Red Cross & Lifeblood Protocol)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              How One Single Donation Saves Up To 3 Lives
            </h3>
          </div>
          {history.length > 0 && (
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Unit Trace</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                #{history[0].donationId}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <HeartPulse className="w-4 h-4 text-red-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Phlebotomy Collection</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                450ml drawn into a sterile anticoagulant pack. Donor vitals logged.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-700">
              ✓ 10-15 min draw
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <FlaskConical className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Lab Testing & Separation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Centrifuged into PRBC, Plasma, and Platelets. ELISA screened for viral markers.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-indigo-700">
              ✓ 3 distinct components
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <Boxes className="w-4 h-4 text-sky-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Cold-Chain Storage</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Quarantined and racked at 2°C–6°C. Barcode registered in central database.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-sky-700">
              ✓ Continuous temp log
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                  4
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Hospital Transfusion</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Cross-matched and dispatched for emergency trauma, surgery, or oncology care.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] font-bold text-emerald-700">
              ✓ Up to 3 lives saved
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donation Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blood-600" />
            <span>Past Donation History</span>
          </h3>
          <Link
            to="/donor/history"
            className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Donation ID</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Viral Screening</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((donation) => (
                  <tr key={donation._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {donation.donationId}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {donation.bloodBank?.name}
                    </td>
                    <td className="py-3 px-4">{donation.donationType}</td>
                    <td className="py-3 px-4">{donation.volumeMl} ml</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        All Markers Negative
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No Past Donations Logged Yet"
            description="When you complete your first voluntary blood donation, clinical collection logs and component separation metrics will display here."
          />
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
