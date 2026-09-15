import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HeartPulse, Lock, Mail, ArrowRight, Shield, User, Building2, Droplets, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
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
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-10 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">Pulse Point</span>
        </Link>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access blood bank inventory, hospital requests, or donor dashboard.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pulsepoint.org"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 text-center mb-2.5">
              Instant Demo Accounts (Click to Fill & Test)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@pulsepoint.org', 'Admin@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-600" /> Super Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('redcross@pulsepoint.org', 'Staff@123')}
                className="p-2 rounded-lg text-left border border-red-200 bg-red-50/50 hover:bg-red-100/70 transition-colors text-xs"
              >
                <div className="font-semibold text-red-900 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-red-600" /> Red Cross Lab
                </div>
                <div className="text-[10px] text-red-700 font-mono truncate">redcross@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('metro@pulsepoint.org', 'Staff@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-red-600" /> Metro Center
                </div>
                <div className="text-[10px] text-slate-500 truncate">metro@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('citygen@pulsepoint.org', 'Hosp@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> City Hospital
                </div>
                <div className="text-[10px] text-slate-500 truncate">citygen@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('stjude@pulsepoint.org', 'Hosp@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> St. Jude Hospital
                </div>
                <div className="text-[10px] text-slate-500 truncate">stjude@pulsepoint.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('donor1@pulsepoint.org', 'Donor@123')}
                className="p-2 rounded-lg text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Donor (O-)
                </div>
                <div className="text-[10px] text-slate-500 truncate">donor1@pulsepoint.org</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-red-600 hover:text-red-700">
              Register as Donor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
