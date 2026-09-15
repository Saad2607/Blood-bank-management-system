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
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Immunohematology Compatibility Checker
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a blood group to see transfusion compatibility rules.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('rbc')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'rbc'
                ? 'bg-red-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Red Blood Cells
          </button>
          <button
            onClick={() => setActiveTab('plasma')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'plasma'
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plasma (FFP)
          </button>
        </div>
      </div>

      {/* Group Selector Pill Bar */}
      <div className="py-4">
        <label className="block text-xs font-semibold text-slate-500 mb-2">
          Select Target Blood Group:
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((group) => {
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition-colors border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600'
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
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-900">
                Can Receive Red Cells From:
              </span>
              <span className="text-xs bg-white text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                {canReceive.length} compatible group(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((g) => {
                const isMatch = canReceive.includes(g);
                return (
                  <div
                    key={g}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border ${
                      isMatch
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{g}</span>
                  </div>
                );
              })}
            </div>
            {selectedGroup === 'AB+' && (
              <p className="text-xs text-emerald-800 font-medium mt-3 bg-white p-2.5 rounded border border-emerald-200">
                <strong>Universal Recipient:</strong> AB+ individuals can receive red blood cells of any type.
              </p>
            )}
          </div>

          {/* Can Donate To */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-red-900">
                Can Donate Red Cells To:
              </span>
              <span className="text-xs bg-white text-red-800 px-2 py-0.5 rounded font-semibold border border-red-200">
                {canGive.length} compatible group(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((g) => {
                const isMatch = canGive.includes(g);
                return (
                  <div
                    key={g}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border ${
                      isMatch
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{g}</span>
                  </div>
                );
              })}
            </div>
            {selectedGroup === 'O-' && (
              <p className="text-xs text-red-800 font-medium mt-3 bg-white p-2.5 rounded border border-red-200">
                <strong>Universal Donor:</strong> O- red cells can be given to emergency patients of any blood group.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 mt-2">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 space-y-1">
              <p className="font-semibold">Plasma Compatibility Rules are Inverted:</p>
              <p>
                <strong>AB group plasma</strong> is the universal plasma donor (safe for any patient in emergency trauma).
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
