import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Pulse Point</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              A modern healthcare management system uniting hospitals, licensed blood banks, and voluntary donors to save lives through real-time inventory and safe transfusions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Transparent Sandbox: Clinical vitals and viral tests are simulated for operational demonstrations.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/availability" className="hover:text-blood-400 transition-colors">
                  Live Blood Stock Search
                </Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-blood-400 transition-colors">
                  Verified Blood Bank Directory
                </Link>
              </li>
              <li>
                <Link to="/donor-guide" className="hover:text-blood-400 transition-colors">
                  Donor Eligibility Guidelines
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blood-400 transition-colors">
                  About Pulse Point Architecture
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blood-400 transition-colors">
                  Become a Voluntary Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* Blood Compatibility Guide */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Immunohematology</h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-blood-400 font-bold">O Negative (O-)</span>: Universal Red Cell Donor. Can donate red cells to all recipients.
              </div>
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-emerald-400 font-bold">AB Positive (AB+)</span>: Universal Red Cell Recipient. Can receive red cells from all groups.
              </div>
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-sky-400 font-bold">AB Plasma</span>: Universal Plasma Donor for emergency trauma resuscitations.
              </div>
            </div>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Emergency Transfusion Support</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blood-950/60 border border-blood-800/40 text-blood-200">
                <PhoneCall className="w-5 h-5 text-blood-400 shrink-0" />
                <div>
                  <div className="text-xs uppercase font-bold text-blood-300">National Ambulance</div>
                  <div className="text-base font-bold text-white tracking-wide">108 / 102</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                <Heart className="w-5 h-5 text-medical-400 shrink-0" />
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">Toll-Free Blood Helpline</div>
                  <div className="text-sm font-semibold text-white">1800-BLOOD-HELP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Pulse Point Blood Bank Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">MERN Stack • Full-Stack Healthcare Engineering</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
