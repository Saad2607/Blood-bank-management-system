import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { ShieldCheck, Search, Clock, FileText } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          action: actionFilter !== 'All' ? actionFilter : undefined,
          limit: 100,
        },
      });
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Compliance Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event log of user logins, phlebotomy collections, blood unit additions, request approvals, and dispatches.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
        >
          <option value="All">All Actions</option>
          <option value="USER_LOGIN">User Logins</option>
          <option value="USER_REGISTERED">User Registrations</option>
          <option value="BLOOD_REQUEST_CREATED">Blood Requests Created</option>
          <option value="BLOOD_REQUEST_APPROVED">Blood Requests Approved</option>
          <option value="BLOOD_ISSUED">Blood Units Issued</option>
          <option value="DONATION_RECORDED">Donations Logged</option>
          <option value="BLOOD_UNIT_ADDED">Blood Units Added</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <LoadingSpinner message="Fetching compliance audit trail..." />
      ) : logs.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">
                      {log.performedByName || 'System'}
                    </td>
                    <td className="py-3 px-4 font-sans uppercase text-[10px] font-bold text-slate-500">
                      {log.role}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.entityType} {log.entityId && `(${log.entityId})`}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-slate-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Audit Logs Found"
          description="System events will be automatically logged here as users interact with the platform."
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
