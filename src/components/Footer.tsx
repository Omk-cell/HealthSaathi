import React from 'react';
import * as Lucide from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 font-sans">
      {/* Upper footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand block (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Lucide.HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Health<span className="text-emerald-400 font-bold">Saathi</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Your digital health companion assisting in doctor appointments, e-prescriptions, clinical record lockers, and emergency EMT dispatches securely under 256-bit encryption rules.
            </p>
            {/* Quick social channels */}
            <div className="flex gap-2.5 pt-2">
              <a href="#t" className="p-2.5 bg-slate-800 hover:bg-blue-650 hover:text-white rounded-xl transition-all cursor-pointer">
                <Lucide.Twitter className="w-4 h-4" />
              </a>
              <a href="#f" className="p-2.5 bg-slate-800 hover:bg-blue-650 hover:text-white rounded-xl transition-all cursor-pointer">
                <Lucide.Facebook className="w-4 h-4" />
              </a>
              <a href="#l" className="p-2.5 bg-slate-800 hover:bg-blue-650 hover:text-white rounded-xl transition-all cursor-pointer">
                <Lucide.Linkedin className="w-4 h-4" />
              </a>
              <a href="#i" className="p-2.5 bg-slate-800 hover:bg-blue-650 hover:text-white rounded-xl transition-all cursor-pointer">
                <Lucide.Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick link columns (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition">OPD Bookings</a></li>
              <li><a href="#features" className="hover:text-white transition">AI Diagnostic</a></li>
              <li><a href="#features" className="hover:text-white transition">e-Pharmacy</a></li>
              <li><a href="#features" className="hover:text-white transition">Diagnostic Lab</a></li>
              <li><a href="#features" className="hover:text-white transition">Claims Locker</a></li>
            </ul>
          </div>

          {/* Help column (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#faq" className="hover:text-white transition">Safety Guides</a></li>
              <li><a href="#how" className="hover:text-white transition">Process Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#faq" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#faq" className="hover:text-white transition">Ethics Charter</a></li>
            </ul>
          </div>

          {/* Hot Contact channels (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Hotline Helpdesk</h4>
            <p className="text-xs text-slate-400">
              Need immediate digital support or account retrieval help? Speak directly with our responsive clinical coordinators.
            </p>
            <div className="space-y-2 text-xs">
              <a href="tel:+91800123456" className="flex items-center gap-2.5 hover:text-white transition group py-1">
                <div className="p-2 rounded bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition">
                  <Lucide.Phone className="w-4 h-4 shrink-0" />
                </div>
                <span>+91 800 123 456 (General Tollfree)</span>
              </a>
              <a href="mailto:support@healthsaathi.com" className="flex items-center gap-2.5 hover:text-white transition group py-1">
                <div className="p-2 rounded bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition">
                  <Lucide.Mail className="w-4 h-4 shrink-0" />
                </div>
                <span>support@healthsaathi.com</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Disclaimers & Copyright bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 leading-relaxed max-w-xl">
            <strong>Clinical Notice:</strong> HealthSaathi provides online health platforms for educational tracking purposes. The content provided is not intended to substitute certified hands-on clinical diagnoses or definitive medical emergency treatments.
          </p>
          <div className="shrink-0 text-slate-400 dark:text-slate-400 text-left md:text-right space-y-1">
            <p>&copy; {currentYear} HealthSaathi Inc. All rights protected.</p>
            <p className="text-slate-400">Engineered by <strong className="text-emerald-450 text-emerald-400 dark:text-emerald-400 font-extrabold uppercase tracking-wide">Om & Gauri</strong>.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
