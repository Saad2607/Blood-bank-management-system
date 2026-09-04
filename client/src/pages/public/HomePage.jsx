import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CompatibilityMatrix from '../../components/common/CompatibilityMatrix';
import BloodBadge from '../../components/common/BloodBadge';
import {
  HeartPulse,
  Search,
  Building2,
  Users,
  ShieldAlert,
  ArrowRight,
  Droplets,
  Clock,
  MapPin,
  CheckCircle2,
  FlaskConical,
  Truck,
  Activity,
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalBloodBanks: 0,
    totalHospitals: 0,
    totalAvailableUnits: 0,
    estimatedLivesSaved: 0,
  });
  const [searchGroup, setSearchGroup] = useState('O-');
  const [searchComponent, setSearchComponent] = useState('Packed Red Blood Cells (PRBC)');
  const [searchCity, setSearchCity] = useState('Mumbai');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Error fetching public stats:', err.message);
      }
    };
    fetchStats();
    handleQuickSearch();
  }, []);

  const handleQuickSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await api.get('/public/availability', {
        params: {
          bloodGroup: searchGroup,
          componentType: searchComponent,
          city: searchCity,
        },
      });
      setSearchResults(res.data.data.slice(0, 3)); // show top 3 on home
    } catch (err) {
      console.error('Search failed:', err.message);
    } finally {
      setSearching(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = [
    'Whole Blood',
    'Packed Red Blood Cells (PRBC)',
    'Fresh Frozen Plasma (FFP)',
    'Platelet Concentrate',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blood-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blood-100/70 border border-blood-200 text-blood-800 text-xs font-bold uppercase tracking-wider mb-6">
              <HeartPulse className="w-4 h-4 text-blood-600 animate-pulse" />
              <span>Real-Time Clinical Blood Management System</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Connecting Hospitals, Blood Banks, and{' '}
              <span className="bg-gradient-to-r from-blood-600 to-blood-700 bg-clip-text text-transparent">
                Voluntary Donors
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Pulse Point coordinates emergency transfusion requests, unit-level inventory with cold-chain tracking, and donor appointment scheduling across accredited healthcare facilities.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/availability"
                className="px-6 py-3.5 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-md shadow-blood-600/25 transition-all flex items-center gap-2 group"
              >
                <Search className="w-5 h-5" />
                <span>Search Live Availability</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all flex items-center gap-2"
              >
                <Droplets className="w-5 h-5 text-blood-600" />
                <span>Register as Voluntary Donor</span>
              </Link>
            </div>
          </div>

          {/* Key Metric Counters */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blood-600">
                {stats.totalAvailableUnits}+
              </div>
              <div className="text-xs font-semibold uppercase text-slate-500 mt-1">
                Units Available Now
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {stats.totalBloodBanks}
              </div>
              <div className="text-xs font-semibold uppercase text-slate-500 mt-1">
                Verified Blood Banks
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {stats.totalHospitals}
              </div>
              <div className="text-xs font-semibold uppercase text-slate-500 mt-1">
                Partner Hospitals
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {stats.estimatedLivesSaved}+
              </div>
              <div className="text-xs font-semibold uppercase text-slate-500 mt-1">
                Lives Impacted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Quick Search Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blood-600 flex items-center gap-1.5 mb-1">
                <Activity className="w-4 h-4 animate-pulse" />
                Live Network Stock Matrix
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Find Compatible Blood Units in Real-Time
              </h2>
            </div>
            <Link
              to="/availability"
              className="text-xs font-bold text-blood-600 hover:text-blood-700 flex items-center gap-1"
            >
              <span>Open Detailed Search Filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Blood Group
              </label>
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Component Type
              </label>
              <select
                value={searchComponent}
                onChange={(e) => setSearchComponent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
              >
                {components.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{searching ? 'Checking...' : 'Check Stock'}</span>
              </button>
            </div>
          </form>

          {/* Quick Results Cards */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <BloodBadge bloodGroup={result.bloodGroup} size="sm" />
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {result.availableUnitsCount} Unit(s) In Stock
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{result.bankName}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {result.street}, {result.city}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phone: {result.phone}</span>
                      <a
                        href={`tel:${result.phone}`}
                        className="font-bold text-blood-600 hover:text-blood-700"
                      >
                        Call Bank
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No matching units found for current query. Try adjusting the city or component type.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How Pulse Point Works — 4-Step Clinical Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-medical-600">
            Standardized Transfusion Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            How Pulse Point Operates
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every blood unit follows strict immunohematology protocols from initial collection to hospital delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center font-black text-lg mb-4 border border-blood-100">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Donor Screening & Collection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Voluntary donors book appointments. Vitals (BP, Pulse, Hb ≥ 12.5 g/dL) and weight are validated before aseptic phlebotomy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-black text-lg mb-4 border border-medical-100">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Lab Testing & Separation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mandatory screening for HIV, HBV, HCV, Syphilis, and Malaria. Blood is centrifugally separated into PRBC, FFP, and Platelets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-lg mb-4 border border-sky-100">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Unit-Level Barcode Inventory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each unit receives an identifier (`PPU-YYYY-XXXXX`) with shelf-life expiry and temperature-monitored rack placement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg mb-4 border border-purple-100">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Hospital Request & Issuance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hospitals request units by urgency (`Emergency`, `Urgent`, `Routine`). Compatible units are verified and issued under cold chain.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Immunohematology Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CompatibilityMatrix />
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 p-8 sm:p-12 text-white shadow-xl shadow-blood-700/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Save Lives as a Voluntary Donor?
            </h3>
            <p className="mt-3 text-sm text-blood-100 leading-relaxed">
              A single whole blood donation separated into red cells, plasma, and platelets can save up to three lives in emergency surgical and trauma situations.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-bold bg-white text-blood-700 hover:bg-blood-50 shadow-md transition-all text-center"
            >
              Register as Donor
            </Link>
            <Link
              to="/donor-guide"
              className="px-6 py-3.5 rounded-xl font-bold bg-blood-800/80 hover:bg-blood-800 text-white border border-blood-500/50 transition-all text-center"
            >
              Check Eligibility Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
