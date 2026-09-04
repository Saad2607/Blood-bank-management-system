import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingSpinner';
import { Building2, MapPin, Phone, Clock, ShieldCheck, Search, Droplets } from 'lucide-react';

const FindBloodBanksPage = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBloodBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/blood-banks', {
        params: {
          search: search.trim() || undefined,
          city: city.trim() || undefined,
        },
      });
      setBloodBanks(res.data.data || []);
    } catch (err) {
      console.error('Error fetching blood banks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBloodBanks();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-50 border border-medical-200 text-medical-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Accredited Healthcare Facilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Certified Blood Banks
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Directory of licensed regional blood centers equipped with component separation, cold-chain storage, and voluntary phlebotomy facilities.
        </p>
      </div>

      {/* Search Toolbar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by facility name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
          />
        </div>
        <div className="sm:w-64">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city (e.g. Mumbai)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 transition-all text-sm"
        >
          Search
        </button>
      </form>

      {/* Directory Grid */}
      {loading ? (
        <LoadingSpinner message="Loading blood bank facilities..." />
      ) : bloodBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bloodBanks.map((bank) => (
            <div
              key={bank._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      License: {bank.licenseNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{bank.name}</h3>
                  </div>
                  {bank.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-medical-50 text-medical-700 px-2.5 py-1 rounded-full border border-medical-200 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-medical-600" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 mt-4">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {bank.street}, {bank.city}, {bank.state} - {bank.pincode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Operating Hours: <strong>{bank.operatingHours}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Phone: {bank.phone}</span>
                  </p>
                  {bank.emergencyContact && (
                    <p className="flex items-center gap-2 text-blood-700 font-semibold">
                      <Droplets className="w-4 h-4 text-blood-500 shrink-0" />
                      <span>Emergency Hotline: {bank.emergencyContact}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Storage Capacity: {bank.storageCapacityUnits} units
                </span>
                <a
                  href={`tel:${bank.phone}`}
                  className="px-4 py-2 rounded-lg font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                >
                  Call Center
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No Blood Banks Found"
          description="Try broadening your city or facility name search query."
          actionText="Reset Filter"
          onAction={() => {
            setSearch('');
            setCity('');
            fetchBloodBanks();
          }}
        />
      )}
    </div>
  );
};

export default FindBloodBanksPage;
