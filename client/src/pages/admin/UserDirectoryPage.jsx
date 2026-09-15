import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Users, Search, CheckCircle, XCircle, Shield } from 'lucide-react';

const UserDirectoryPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          role: roleFilter !== 'All' ? roleFilter : undefined,
          search: search.trim() || undefined,
        },
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      toast.success(`User account ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          User Account Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of registered platform users across all clinical and administrative roles.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
        >
          <option value="All">All Roles</option>
          <option value="donor">Donors</option>
          <option value="bloodbank">Blood Bank Staff</option>
          <option value="hospital">Hospital Staff</option>
          <option value="superadmin">Super Admins</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : users.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Associated Facility</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'bloodbank'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'hospital'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {u.bloodBank?.name || u.hospital?.name || 'Individual Voluntary Donor'}
                    </td>
                    <td className="py-3 px-4">{u.city || 'Mumbai'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'superadmin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            u.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
          icon={Users}
          title="No Users Found"
          description="Try modifying your role or search filters."
        />
      )}
    </div>
  );
};

export default UserDirectoryPage;
