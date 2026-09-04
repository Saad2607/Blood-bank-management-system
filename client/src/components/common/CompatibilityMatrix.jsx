import React, { useState } from 'react';
import BloodBadge from './BloodBadge';
import { ArrowRight, Info, Check, X } from 'lucide-react';

const RBC_CAN_GIVE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Can only give to AB+
};

const RBC_CAN_RECEIVE_FROM = {
  'O-': ['O-'], // Can only receive from O-
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CompatibilityMatrix = () => {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [activeTab, setActiveTab] = useState('rbc'); // 'rbc' or 'plasma'

  const canGive = RBC_CAN_GIVE_TO[selectedGroup] || [];
  const canReceive = RBC_CAN_RECEIVE_FROM[selectedGroup] || [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Immunohematology Compatibility Checker</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a blood group below to inspect transfusion compatibility matrices.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rbc')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rbc'
                ? 'bg-blood-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Red Blood Cells (PRBC/WB)
          </button>
          <button
            onClick={() => setActiveTab('plasma')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'plasma'
                ? 'bg-medical-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plasma (FFP)
          </button>
        </div>
      </div>

      {/* Group Selector Pill Bar */}
      <div className="py-4">
        <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
          Select Target Blood Group:
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`py-2 px-3 rounded-xl font-bold text-sm transition-all border ${
                  isSelected
                    ? 'bg-blood-600 text-white border-blood-600 shadow-md scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transfusion Results Grid */}
      {activeTab === 'rbc' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Can Receive From */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Can Receive Red Cells From:
              </span>
              <span className="text-xs bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded font-bold">
                {canReceive.length} compatible group(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map((g) => {
                const isMatch = canReceive.includes(g);
                return (
                  <div
                    key={g}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isMatch
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white/60 text-slate-400 border-slate-200 opacity-40'
                    }`}
                  >
                    {isMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{g}</span>
                  </div>
                );
              })}
            </div>
            {selectedGroup === 'AB+' && (
              <p className="text-[11px] text-emerald-700 font-medium mt-3 bg-emerald-100/50 p-2 rounded">
                🌟 <strong>Universal Recipient:</strong> AB+ individuals have both A and B antigens and Rh factor, so they can safely receive red blood cells of any type.
              </p>
            )}
          </div>

          {/* Can Donate To */}
          <div className="bg-blood-50/60 rounded-xl p-4 border border-blood-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blood-800">
                Can Donate Red Cells To:
              </span>
              <span className="text-xs bg-blood-200/60 text-blood-800 px-2 py-0.5 rounded font-bold">
                {canGive.length} compatible group(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map((g) => {
                const isMatch = canGive.includes(g);
                return (
                  <div
                    key={g}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isMatch
                        ? 'bg-blood-600 text-white border-blood-700 shadow-sm'
                        : 'bg-white/60 text-slate-400 border-slate-200 opacity-40'
                    }`}
                  >
                    {isMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{g}</span>
                  </div>
                );
              })}
            </div>
            {selectedGroup === 'O-' && (
              <p className="text-[11px] text-blood-700 font-medium mt-3 bg-blood-100/50 p-2 rounded">
                🩸 <strong>Universal Donor:</strong> O- red cells lack A, B, and Rh antigens, meaning they can be transfused to emergency trauma patients of any blood group without acute hemolytic reactions.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-medical-50/60 rounded-xl p-4 border border-medical-100 mt-2">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-medical-600 shrink-0 mt-0.5" />
            <div className="text-xs text-medical-900 space-y-1">
              <p className="font-bold">Plasma Compatibility Rules are Inverted:</p>
              <p>
                Because plasma contains antibodies against absent antigens, <strong>AB group plasma</strong> has neither anti-A nor anti-B antibodies, making <strong>AB positive/negative individuals the universal plasma donors</strong>.
              </p>
              <p>
                Conversely, <strong>O group patients</strong> can receive plasma from any blood group.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityMatrix;
