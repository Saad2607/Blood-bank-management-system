import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/common/BloodBadge';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Search, MapPin, Phone, Building2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

const BloodAvailabilityPage = () => {
  const [bloodGroup, setBloodGroup] = useState('All');
  const [componentType, setComponentType] = useState('Packed Red Blood Cells (PRBC)');
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);
  const [compatibleGroups, setCompatibleGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/availability', {
        params: {
          bloodGroup: bloodGroup !== 'All' ? bloodGroup : undefined,
          componentType,
          city: city.trim() || undefined,
        },
      });
      setResults(res.data.data || []);
      setCompatibleGroups(res.data.compatibleGroups || []);
    } catch (err) {
      console.error('Error fetching availability:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [bloodGroup, componentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAvailability();
  };

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = [
    'Packed Red Blood Cells (PRBC)',
    'Whole Blood',
    'Fresh Frozen Plasma (FFP)',
    'Platelet Concentrate',
    'Cryoprecipitate',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Live Transfusion Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Blood Availability Search
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Search real-time unit stock across accredited blood banks by patient blood group and component type with automated immunohematology compatibility logic.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === 'All' ? 'All Blood Groups' : bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Component
            </label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
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
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Stock</span>
            </button>
          </div>
        </form>

        {/* Compatibility Explainer Banner when specific group is chosen */}
        {bloodGroup !== 'All' && compatibleGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Searching for <strong>{bloodGroup}</strong>: Showing exact match and compatible donor groups:{' '}
              <span className="font-bold text-slate-800">{compatibleGroups.join(', ')}</span>.
            </span>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSpinner message="Searching inventory across accredited blood banks..." />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <BloodBadge bloodGroup={item.bloodGroup} size="lg" />
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                    {item.availableUnitsCount} Unit(s) Available
                  </span>
                </div>

                <div className="text-xs font-semibold text-medical-700 uppercase tracking-wider mb-1">
                  {item.componentType}
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.bankName}</h3>

                <div className="mt-3 space-y-2 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {item.street}, {item.city}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Contact: {item.phone}</span>
                  </p>
                  {item.emergencyContact && (
                    <p className="flex items-center gap-2 text-blood-700 font-semibold">
                      <AlertCircle className="w-4 h-4 text-blood-500 shrink-0" />
                      <span>Emergency Hotline: {item.emergencyContact}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.isExactMatch ? 'Direct Blood Group Match' : 'Compatible Alternative'}
                </span>
                <a
                  href={`tel:${item.phone}`}
                  className="px-4 py-2 rounded-lg font-bold text-xs bg-blood-600 hover:bg-blood-700 text-white shadow-sm transition-all"
                >
                  Contact Blood Bank
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No Matching Blood Units Found"
          description="There are currently no available screened units matching this blood group and component in the selected region."
          actionText="Reset Search Filters"
          onAction={() => {
            setBloodGroup('All');
            setComponentType('Packed Red Blood Cells (PRBC)');
            setCity('');
          }}
        />
      )}
    </div>
  );
};

export default BloodAvailabilityPage;
