import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import BloodBadge from '../../components/common/BloodBadge';
import {
  Users,
  Calendar,
  History,
  Droplets,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  HeartPulse,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  FlaskConical,
  ShieldCheck,
  CalendarCheck,
  XCircle,
} from 'lucide-react';

const AdminDonorsPage = () => {
  const [data, setData] = useState({
    donors: [],
    appointments: [],
    donations: [],
    stats: {},
  });
  const [loading, setLoading] = useState(true);

  // Tabs: 'donors' | 'appointments' | 'collections'
  const [activeTab, setActiveTab] = useState('donors');

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [bloodBankFilter, setBloodBankFilter] = useState('All');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Status update processing
  const [processingId, setProcessingId] = useState(null);

  const { toast } = useToast();

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bloodGroupFilter !== 'All') params.bloodGroup = bloodGroupFilter;
      if (bloodBankFilter !== 'All') params.bloodBankId = bloodBankFilter;
      if (appointmentStatusFilter !== 'All') params.status = appointmentStatusFilter;

      const res = await api.get('/admin/donors-overview', { params });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load donor overview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [bloodGroupFilter, bloodBankFilter, appointmentStatusFilter]);

  const handleOverrideAppointment = async (apptId, newStatus) => {
    setProcessingId(apptId);
    try {
      const res = await api.put(`/admin/appointments/${apptId}/status`, { status: newStatus });
      toast.success(res.data.message || `Appointment updated to '${newStatus}'.`);
      fetchOverview();
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment status.');
    } finally {
      setProcessingId(null);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Client-side search filtering for the active tab
  const filteredDonors = (data.donors || []).filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.user?.name?.toLowerCase().includes(term) ||
      d.user?.email?.toLowerCase().includes(term) ||
      d.user?.phone?.includes(term) ||
      d.user?.city?.toLowerCase().includes(term)
    );
  });

  const filteredAppointments = (data.appointments || []).filter((a) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.donor?.user?.name?.toLowerCase().includes(term) ||
      a.bloodBank?.name?.toLowerCase().includes(term) ||
      a.timeSlot?.toLowerCase().includes(term)
    );
  });

  const filteredDonations = (data.donations || []).filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.donationId?.toLowerCase().includes(term) ||
      d.donor?.user?.name?.toLowerCase().includes(term) ||
      d.bloodBank?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-400/20">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Voluntary Donor Community</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Donors, Appointments &amp; Phlebotomy</h1>
          <p className="text-xs text-rose-200/80 mt-1 max-w-xl">
            Central administration of registered voluntary donors, multi-center appointment schedules, and phlebotomy collection screening.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-white border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Donors</div>
          <div className="text-xl font-black text-slate-900 mt-1">{data.stats?.totalDonors || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Eligible Today</div>
          <div className="text-xl font-black text-emerald-900 mt-1">{data.stats?.eligibleToday || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-amber-50/50 border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Cooling Off</div>
          <div className="text-xl font-black text-amber-900 mt-1">{data.stats?.coolingOff || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-blue-50/50 border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Total Bookings</div>
          <div className="text-xl font-black text-blue-900 mt-1">{data.stats?.totalAppointments || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-purple-50/50 border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Pending Visits</div>
          <div className="text-xl font-black text-purple-900 mt-1">{data.stats?.pendingAppointments || 0}</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-rose-50/50 border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Completed Bleeds</div>
          <div className="text-xl font-black text-rose-900 mt-1">{data.stats?.completedDonations || 0}</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('donors')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'donors'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Donor Community Directory ({filteredDonors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Center Appointments ({filteredAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'collections'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Phlebotomy Collections &amp; Testing ({filteredDonations.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={
                activeTab === 'donors'
                  ? 'Search donor name, email, phone, or city...'
                  : activeTab === 'appointments'
                  ? 'Search appointment donor or blood bank...'
                  : 'Search donation ID, donor name, or blood bank...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(activeTab === 'donors' || activeTab === 'collections') && (
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
            )}

            {activeTab === 'appointments' && (
              <select
                value={appointmentStatusFilter}
                onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-Show">No-Show</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: Donors Directory */}
      {activeTab === 'donors' && (
        loading ? (
          <LoadingSpinner message="Querying voluntary donors directory..." />
        ) : filteredDonors.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Donors Found</h3>
            <p className="text-xs text-slate-500 mt-1">No voluntary donors match the current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Donor Profile</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Demographics</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Donation History</th>
                    <th className="py-3 px-4">Cooldown &amp; Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDonors.map((donor) => {
                    const now = new Date();
                    const nextEligible = new Date(donor.nextEligibleDate);
                    const isEligible = nextEligible <= now;
                    const daysRemaining = Math.max(0, Math.ceil((nextEligible - now) / (1000 * 60 * 60 * 24)));

                    return (
                      <tr key={donor._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{donor.user?.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Registered: {new Date(donor.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <BloodBadge bloodGroup={donor.bloodGroup} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-slate-800 font-semibold">{donor.gender}</div>
                          <div className="text-[11px] text-slate-400">Weight: {donor.weightKg} kg</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{donor.user?.phone}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{donor.user?.email}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{donor.user?.city}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {donor.totalDonations} Lifetime Bleed(s)
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Last: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Ready to Donate
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> Cooling Off ({daysRemaining}d)
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Eligible: {nextEligible.toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* TAB 2: Appointments Schedule */}
      {activeTab === 'appointments' && (
        loading ? (
          <LoadingSpinner message="Querying center appointment schedule..." />
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
            <p className="text-xs text-slate-500 mt-1">No scheduled donation visits match your criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Visit Date &amp; Slot</th>
                    <th className="py-3 px-4">Donor</th>
                    <th className="py-3 px-4">Blood Bank Center</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400">{appt.timeSlot}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{appt.donor?.user?.name || 'Voluntary Donor'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <BloodBadge bloodGroup={appt.donor?.bloodGroup} size="sm" />
                          <span>{appt.donor?.user?.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{appt.bloodBank?.name || 'Blood Bank'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{appt.bloodBank?.city}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            appt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : appt.status === 'Cancelled'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : appt.status === 'No-Show'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {appt.status === 'Booked' && (
                          <>
                            <button
                              onClick={() => handleOverrideAppointment(appt._id, 'Completed')}
                              disabled={processingId === appt._id}
                              className="px-2.5 py-1 rounded text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                            >
                              Mark Completed
                            </button>
                            <button
                              onClick={() => handleOverrideAppointment(appt._id, 'Cancelled')}
                              disabled={processingId === appt._id}
                              className="px-2.5 py-1 rounded text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleOverrideAppointment(appt._id, 'No-Show')}
                              disabled={processingId === appt._id}
                              className="px-2.5 py-1 rounded text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
                            >
                              No-Show
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* TAB 3: Phlebotomy Collections & Lab Testing */}
      {activeTab === 'collections' && (
        loading ? (
          <LoadingSpinner message="Querying phlebotomy collections and lab testing results..." />
        ) : filteredDonations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Collection Records</h3>
            <p className="text-xs text-slate-500 mt-1">No completed phlebotomy records match your query.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Donation ID &amp; Date</th>
                    <th className="py-3 px-4">Donor &amp; Blood Bank</th>
                    <th className="py-3 px-4">Product &amp; Volume</th>
                    <th className="py-3 px-4">Donor Vitals</th>
                    <th className="py-3 px-4">5-Marker Viral Screening</th>
                    <th className="py-3 px-4">Processed Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDonations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{d.donationId}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(d.donationDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.donor?.user?.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Droplets className="w-3 h-3 text-red-600" />
                          <span>{d.bloodBank?.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <BloodBadge bloodGroup={d.bloodGroup} size="sm" />
                          <span className="font-bold text-slate-800">{d.volumeMl} ml</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{d.donationType}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-semibold">
                          BP: {d.screeningVitals?.systolicBP}/{d.screeningVitals?.diastolicBP} mmHg
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Hb: <span className="font-bold text-slate-700">{d.screeningVitals?.hemoglobinGdl} g/dL</span> • {d.screeningVitals?.weightKg} kg
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {d.labTesting?.isPassed ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" /> Screened Passed (Non-Reactive)
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              HIV: {d.labTesting?.hiv} • HBV: {d.labTesting?.hbv} • HCV: {d.labTesting?.hcv}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" /> Reactive (Quarantined)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {d.processedUnits?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {d.processedUnits.map((u) => (
                              <span key={u._id} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                {u.unitId} ({u.componentType?.split(' ')[0]})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Direct Whole Blood</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminDonorsPage;
