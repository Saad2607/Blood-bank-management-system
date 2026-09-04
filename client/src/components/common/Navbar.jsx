import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Menu, X, User, LogOut, LayoutDashboard, Search, Building2, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'superadmin':
        return '/admin';
      case 'bloodbank':
        return '/bloodbank';
      case 'hospital':
        return '/hospital';
      case 'donor':
        return '/donor';
      default:
        return '/';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'superadmin':
        return 'Super Admin';
      case 'bloodbank':
        return 'Blood Bank Staff';
      case 'hospital':
        return 'Hospital Staff';
      case 'donor':
        return 'Registered Donor';
      default:
        return 'User';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blood Availability', path: '/availability', icon: Search },
    { name: 'Blood Banks', path: '/blood-banks', icon: Building2 },
    { name: 'Donor Guide', path: '/donor-guide', icon: BookOpen },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blood-700 to-blood-500 flex items-center justify-center text-white shadow-md shadow-blood-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blood-700 to-blood-600 bg-clip-text text-transparent">
                Pulse Point
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-medical-600 bg-medical-50 px-1.5 py-0.5 rounded ml-2 border border-medical-200">
                Healthcare Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blood-50 text-blood-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-blood-600" />
                  <span>Dashboard</span>
                  <span className="text-xs bg-white text-blood-700 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                    {getRoleLabel()}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blood-600 hover:bg-blood-700 rounded-lg shadow-sm shadow-blood-600/20 transition-all hover:shadow-md"
                >
                  Register Donor
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-blood-50 hover:text-blood-700"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-100 text-slate-800 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blood-600" />
                    Dashboard ({getRoleLabel()})
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg bg-blood-600 text-white font-medium hover:bg-blood-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
