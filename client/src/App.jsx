import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import BloodAvailabilityPage from './pages/public/BloodAvailabilityPage';
import FindBloodBanksPage from './pages/public/FindBloodBanksPage';
import DonorGuidePage from './pages/public/DonorGuidePage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import AppointmentsPage from './pages/donor/AppointmentsPage';
import DonationHistoryPage from './pages/donor/DonationHistoryPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import CreateRequestPage from './pages/hospital/CreateRequestPage';
import RequestTrackerPage from './pages/hospital/RequestTrackerPage';
import ReceivedUnitsPage from './pages/hospital/ReceivedUnitsPage';

// Blood Bank Pages
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import InventoryPage from './pages/bloodbank/InventoryPage';
import IncomingRequestsPage from './pages/bloodbank/IncomingRequestsPage';
import DonationLabPage from './pages/bloodbank/DonationLabPage';
import BankAppointmentsPage from './pages/bloodbank/BankAppointmentsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminDonorsPage from './pages/admin/AdminDonorsPage';
import ManageHospitalsPage from './pages/admin/ManageHospitalsPage';
import ManageBloodBanksPage from './pages/admin/ManageBloodBanksPage';
import UserDirectoryPage from './pages/admin/UserDirectoryPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/availability" element={<BloodAvailabilityPage />} />
        <Route path="/blood-banks" element={<FindBloodBanksPage />} />
        <Route path="/donor-guide" element={<DonorGuidePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Donor Portal */}
      <Route element={<DashboardLayout allowedRoles={['donor']} />}>
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/donor/book" element={<AppointmentsPage />} />
        <Route path="/donor/appointments" element={<AppointmentsPage />} />
        <Route path="/donor/history" element={<DonationHistoryPage />} />
        <Route path="/donor/profile" element={<DonorProfilePage />} />
      </Route>

      {/* Hospital Portal */}
      <Route element={<DashboardLayout allowedRoles={['hospital']} />}>
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/hospital/new-request" element={<CreateRequestPage />} />
        <Route path="/hospital/requests" element={<RequestTrackerPage />} />
        <Route path="/hospital/received" element={<ReceivedUnitsPage />} />
      </Route>

      {/* Blood Bank Portal */}
      <Route element={<DashboardLayout allowedRoles={['bloodbank']} />}>
        <Route path="/bloodbank" element={<BloodBankDashboard />} />
        <Route path="/bloodbank/inventory" element={<InventoryPage />} />
        <Route path="/bloodbank/requests" element={<IncomingRequestsPage />} />
        <Route path="/bloodbank/screening" element={<DonationLabPage />} />
        <Route path="/bloodbank/appointments" element={<BankAppointmentsPage />} />
        <Route path="/bloodbank/donations" element={<DonationLabPage />} />
      </Route>

      {/* Super Admin Portal */}
      <Route element={<DashboardLayout allowedRoles={['superadmin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/hospital-orders" element={<AdminRequestsPage />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        <Route path="/admin/donors" element={<AdminDonorsPage />} />
        <Route path="/admin/hospitals" element={<ManageHospitalsPage />} />
        <Route path="/admin/blood-banks" element={<ManageBloodBanksPage />} />
        <Route path="/admin/users" element={<UserDirectoryPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
