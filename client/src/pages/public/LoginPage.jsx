import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Lock, Mail, ArrowRight, Shield, User, Building2, Droplets } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route based on role
      switch (user.role) {
        case 'superadmin':
          navigate('/admin');
          break;
        case 'bloodbank':
          navigate('/bloodbank');
          break;
        case 'hospital':
          navigate('/hospital');
          break;
        case 'donor':
          navigate('/donor');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demonstration / evaluation
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">Pulse Point</span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Healthcare Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter credentials to access clinical inventory, requests, or donor dashboard.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pulsepoint.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-md shadow-blood-600/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Evaluator Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@pulsepoint.org', 'Admin@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('metro@pulsepoint.org', 'Staff@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Droplets className="w-3.5 h-3.5 text-blood-600" />
                  <span>Blood Bank Staff</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">metro@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('citygen@pulsepoint.org', 'Hosp@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-medical-600" />
                  <span>Hospital Staff</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">citygen@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('donor1@pulsepoint.org', 'Donor@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span>Donor (O-)</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">donor1@pulsepoint.org</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blood-600 hover:text-blood-700">
              Register as Donor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
