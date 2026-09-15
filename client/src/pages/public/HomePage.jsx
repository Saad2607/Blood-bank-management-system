import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CompatibilityMatrix from '../../components/common/CompatibilityMatrix';
import BloodBadge from '../../components/common/BloodBadge';
import {
  Search,
  ArrowRight,
  Droplets,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';

const HomePage = () => {
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
      setSearchResults(res.data.data.slice(0, 3));
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
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-5">
            <span>Hospital & Blood Bank Network</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Connecting Hospitals, Blood Banks, and Voluntary Donors
          </h1>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A simple, centralized platform for real-time blood stock availability, emergency hospital requisitions, and voluntary donor appointments.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/availability"
              className="px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Blood Stock</span>
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Droplets className="w-4 h-4 text-red-600" />
              <span>Register as Donor</span>
            </Link>
          </div>

          {/* Key Metric Counters */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">
                {stats.totalAvailableUnits}+
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Units Available
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stats.totalBloodBanks}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Verified Blood Banks
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stats.totalHospitals}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Partner Hospitals
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                {stats.estimatedLivesSaved}+
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Lives Impacted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Widget */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Quick Blood Stock Search
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check unit availability across blood banks by group and location.
              </p>
            </div>
            <Link
              to="/availability"
              className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Blood Group
              </label>
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Component Type
              </label>
              <select
                value={searchComponent}
                onChange={(e) => setSearchComponent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {components.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" />
                <span>{searching ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Search Results */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <BloodBadge bloodGroup={result.bloodGroup} size="sm" />
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {result.availableUnitsCount} Unit(s) In Stock
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900">{result.bankName}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {result.street}, {result.city}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {result.phone}
                      </span>
                      <a
                        href={`tel:${result.phone}`}
                        className="font-semibold text-red-600 hover:text-red-700"
                      >
                        Contact
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                No matching units found. Try searching for a different blood group, component, or city.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How Pulse Point Works — 4 Simple Steps */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            How Pulse Point Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A standardized, safe transfusion workflow from voluntary donor to patient bedside.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Donor Screening</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Voluntary donors book appointments. Vitals (BP, pulse, hemoglobin, weight) are checked before collection.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Testing & Separation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Blood is screened for infectious diseases and separated into red cells, plasma, and platelets.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Unit Traceability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every unit receives a unique barcode with temperature-controlled rack coordinates and expiry timers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Hospital Request & Issuance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hospitals request units by urgency. Compatible units are cross-matched and dispatched under cold chain.
            </p>
          </div>
        </div>
      </section>

      {/* Compatibility Matrix Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <CompatibilityMatrix />
      </section>

      {/* Simple Call to Action Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-xl bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">
              Ready to Save Lives as a Voluntary Donor?
            </h3>
            <p className="mt-1.5 text-xs text-slate-300 max-w-xl">
              One blood donation can save up to three lives in critical trauma and surgery cases.
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white text-xs transition-colors"
            >
              Register as Donor
            </Link>
            <Link
              to="/donor-guide"
              className="px-4 py-2 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            >
              Eligibility Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
