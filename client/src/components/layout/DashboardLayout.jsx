import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their own role dashboard if unauthorized for this specific role layout
    if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
    if (user.role === 'bloodbank') return <Navigate to="/bloodbank" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital" replace />;
    if (user.role === 'donor') return <Navigate to="/donor" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
