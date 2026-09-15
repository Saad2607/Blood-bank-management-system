import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">Pulse Point</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Connecting hospitals, blood banks, and voluntary donors to ensure safe, timely access to compatible blood products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/availability" className="hover:text-white transition-colors">
                  Blood Stock Search
                </Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-white transition-colors">
                  Blood Bank Directory
                </Link>
              </li>
              <li>
                <Link to="/donor-guide" className="hover:text-white transition-colors">
                  Donor Guidelines & Eligibility
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About the Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Emergency Helpline
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-red-500 shrink-0" />
                <span>National Ambulance: <strong className="text-white">108 / 102</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Heart className="w-4 h-4 text-red-500 shrink-0" />
                <span>Blood Support: <strong className="text-white">1800-BLOOD-HELP</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Pulse Point. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
