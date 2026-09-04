import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  FlaskConical,
  Calendar,
  History,
  Building2,
  Users,
  ShieldCheck,
  PlusCircle,
  PackageCheck,
  UserCheck,
  Heart,
  Droplets,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isDonor, isHospital, isBloodBank, isAdmin } = useAuth();

  const getLinks = () => {
    if (isAdmin) {
      return [
        { name: 'System Overview', path: '/admin', icon: LayoutDashboard, end: true },
        { name: 'Manage Hospitals', path: '/admin/hospitals', icon: Building2 },
        { name: 'Manage Blood Banks', path: '/admin/blood-banks', icon: Droplets },
        { name: 'User Directory', path: '/admin/users', icon: Users },
        { name: 'Audit Trail Logs', path: '/admin/audit-logs', icon: ShieldCheck },
      ];
    }
    if (isBloodBank) {
      return [
        { name: 'Bank Console', path: '/bloodbank', icon: LayoutDashboard, end: true },
        { name: 'Inventory Units', path: '/bloodbank/inventory', icon: Boxes },
        { name: 'Hospital Requests', path: '/bloodbank/requests', icon: ClipboardList },
        { name: 'Lab & Phlebotomy', path: '/bloodbank/screening', icon: FlaskConical },
        { name: 'Donor Appointments', path: '/bloodbank/appointments', icon: Calendar },
        { name: 'Collection Records', path: '/bloodbank/donations', icon: History },
      ];
    }
    if (isHospital) {
      return [
        { name: 'Hospital Console', path: '/hospital', icon: LayoutDashboard, end: true },
        { name: 'Create Blood Request', path: '/hospital/new-request', icon: PlusCircle },
        { name: 'Request Tracker', path: '/hospital/requests', icon: ClipboardList },
        { name: 'Received Blood Units', path: '/hospital/received', icon: PackageCheck },
      ];
    }
    if (isDonor) {
      return [
        { name: 'Donor Dashboard', path: '/donor', icon: LayoutDashboard, end: true },
        { name: 'Book Appointment', path: '/donor/book', icon: Calendar },
        { name: 'My Appointments', path: '/donor/appointments', icon: ClipboardList },
        { name: 'Donation History', path: '/donor/history', icon: History },
        { name: 'Health Profile', path: '/donor/profile', icon: UserCheck },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Facility / User Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Authenticated Facility
        </div>
        <div className="font-bold text-sm text-slate-800 truncate mt-0.5">
          {user?.bloodBank?.name || user?.hospital?.name || user?.name || 'Pulse Point User'}
        </div>
        <div className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{user?.role?.replace('bloodbank', 'Blood Bank Staff')?.replace('hospital', 'Hospital Staff')}</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blood-600 text-white shadow-sm shadow-blood-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
