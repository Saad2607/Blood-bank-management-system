import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react';

const BankAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/bloodbank');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching bank appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update appointment status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Scheduled Donor Appointments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View and process upcoming voluntary whole blood and platelet donation appointments at your center.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading donor visit schedules..." />
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {appt.donor?.user?.name || 'Voluntary Donor'}
                    </td>
                    <td className="py-3 px-4">
                      <div>{appt.donor?.user?.phone}</div>
                      <div className="text-[10px] text-slate-400">{appt.donor?.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {new Date(appt.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{appt.timeSlot}</td>
                    <td className="py-3 px-4 italic text-slate-500">{appt.notes || 'Routine donation'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          appt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'Booked'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {appt.status === 'Booked' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appt._id, 'Completed')}
                            className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt._id, 'No-Show')}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Scheduled Appointments"
          description="Donors who schedule voluntary visits at your blood center will be listed here."
        />
      )}
    </div>
  );
};

export default BankAppointmentsPage;
