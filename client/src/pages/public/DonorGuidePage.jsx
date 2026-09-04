import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Heart, Droplets, ArrowRight } from 'lucide-react';

const DonorGuidePage = () => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [recentDonationDays, setRecentDonationDays] = useState('');
  const [hasTattoo, setHasTattoo] = useState('no');
  const [hasFever, setHasFever] = useState('no');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const checkEligibility = () => {
    const numAge = Number(age);
    const numWeight = Number(weight);
    const numDays = recentDonationDays !== '' ? Number(recentDonationDays) : 999;

    const reasons = [];
    if (numAge < 18 || numAge > 65) reasons.push('Donor age must be between 18 and 65 years.');
    if (numWeight < 45) reasons.push('Donor weight must be at least 45 kg for safe phlebotomy volume.');
    if (numDays < 56) reasons.push(`Standard red cell donation cooldown is 56 days (you entered ${numDays} days).`);
    if (hasTattoo === 'yes') reasons.push('Tattoos or piercings within the last 6 months require clinical deferral.');
    if (hasFever === 'yes') reasons.push('Active fever or flu-like symptoms require deferral until full recovery.');

    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    setQuizSubmitted(true);
  };

  const result = checkEligibility();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blood-600 bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
          Clinical Guidance & Assessment
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
          Voluntary Donor Guidelines
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Learn about medical criteria for blood donation and evaluate your immediate eligibility with our interactive self-check quiz.
        </p>
      </div>

      {/* Interactive Self-Assessment Quiz */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Immediate Eligibility Self-Checker</h2>
            <p className="text-xs text-slate-500">Fast 1-minute pre-screening based on clinical transfusion guidelines.</p>
          </div>
        </div>

        <form onSubmit={handleQuizSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Your Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              required
              min="10"
              max="100"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Weight (in kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 65"
              required
              min="30"
              max="200"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
              Days Since Last Blood Donation (Leave blank if first time)
            </label>
            <input
              type="number"
              value={recentDonationDays}
              onChange={(e) => setRecentDonationDays(e.target.value)}
              placeholder="e.g. 90"
              min="0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
              Any Tattoo / Piercing in Last 6 Months?
            </label>
            <select
              value={hasTattoo}
              onChange={(e) => setHasTattoo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
              Do you have active fever, cold, or infection today?
            </label>
            <select
              value={hasFever}
              onChange={(e) => setHasFever(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blood-500 focus:outline-none"
            >
              <option value="no">No, feeling healthy and well</option>
              <option value="yes">Yes, currently unwell</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-blood-600 hover:bg-blood-700 shadow-md shadow-blood-600/20 transition-all text-sm"
            >
              Check My Eligibility
            </button>
          </div>
        </form>

        {/* Quiz Result Display */}
        {quizSubmitted && (
          <div className={`mt-8 p-6 rounded-2xl border ${result.isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-4">
              {result.isEligible ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-lg font-bold ${result.isEligible ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {result.isEligible ? 'Congratulations! You appear medically eligible to donate.' : 'Temporary Clinical Deferral Advised'}
                </h3>
                {result.isEligible ? (
                  <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
                    Based on your responses, you meet the initial donor criteria. You can proceed to register and schedule a donation appointment.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1 text-sm text-rose-800">
                    <p className="font-semibold">Reasons for deferral:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.isEligible && (
                  <div className="mt-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <span>Register as Voluntary Donor</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preparation Steps Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mb-4">
            💧
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-2">Hydrate Before Donating</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Drink at least 500 ml (2 large glasses) of water or electrolyte fluid before arriving for phlebotomy to maintain safe intravascular blood volume.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
            🥗
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-2">Eat an Iron-Rich Meal</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eat a healthy, low-fat meal 2-3 hours prior. Avoid fatty foods which can cause lipemic plasma and interfere with viral antibody screening tests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
            🛌
          </div>
          <h3 className="font-bold text-base text-slate-900 mb-2">Rest & Recovery</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rest for 10-15 minutes at the blood bank after donation. Keep the venipuncture bandage on for 4 hours and avoid heavy weight lifting for 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonorGuidePage;
