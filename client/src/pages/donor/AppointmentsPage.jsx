import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Calendar, Building2, Clock, CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react';

const AppointmentsPage = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedBank, setSelectedBank] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [apptRes, bankRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/public/blood-banks'),
      ]);
      setAppointments(apptRes.data.data || []);
      setBloodBanks(bankRes.data.data || []);
      if (bankRes.data.data?.length > 0) {
        setSelectedBank(bankRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/appointments', {
        bloodBankId: selectedBank,
        appointmentDate,
        timeSlot,
        notes,
      });
      toast.success('Donation appointment scheduled successfully!');
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment.');
      toast.error(err.message || 'Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'Cancelled' });
      toast.info('Appointment has been cancelled.');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment.');
    }
  };

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Donation Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your booked voluntary phlebotomy sessions across certified regional blood banks.
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
          <span>Book Donation Slot</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => {
            const isBooked = appt.status === 'Booked';
            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                        isBooked
                          ? 'bg-medical-50 text-medical-700 border border-medical-200'
                          : appt.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {appt.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      📅 {new Date(appt.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-1">{appt.bloodBank?.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {appt.bloodBank?.street}, {appt.bloodBank?.city}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.timeSlot}</span>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Ph: {appt.bloodBank?.phone}</span>
                  </div>

                  {appt.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded">
                      Note: "{appt.notes}"
                    </p>
                  )}
                </div>

                {isBooked && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCancelAppointment(appt._id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Appointments Scheduled"
          description="Book a voluntary whole blood or platelet donation appointment to support local emergency care."
          actionText="Book Donation Slot"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule Donation Slot</h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Select Blood Bank Center
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  {bloodBanks.map((bank) => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name} — {bank.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Preferred Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="e.g. Voluntary whole blood donation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all"
                >
                  {submitting ? 'Confirming...' : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
