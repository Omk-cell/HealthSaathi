import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';
import { ModalType } from '../types';

interface HeroProps {
  onOpenModal: (type: ModalType) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  const [symptomText, setSymptomText] = useState('');

  const handleSolve = () => {
    if (symptomText.trim()) {
      localStorage.setItem('tempSymptomInput', symptomText);
    }
    onOpenModal('symptom');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSolve();
    }
  };
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative Background Blob/Mesh */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[35rem] h-[35rem] bg-gradient-to-br from-blue-100/40 via-teal-100/30 to-transparent rounded-full blur-[90px] pointer-events-none dark:from-blue-900/10 dark:via-teal-900/10" />
      <div className="absolute bottom-0 left-0 -translate-x-10 translate-y-10 w-[30rem] h-[30rem] bg-gradient-to-tr from-green-100/20 via-blue-150/30 to-transparent rounded-full blur-[100px] pointer-events-none dark:from-emerald-950/5 dark:via-indigo-950/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="text-center lg:text-left lg:col-span-7 space-y-6">
            
            {/* Quick Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-955/40 dark:bg-blue-950/40 border border-blue-105 border-blue-100 dark:border-blue-900/60 rounded-full text-blue-700 dark:text-blue-300 text-xs font-bold leading-tight"
            >
              <Lucide.Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span>National Digital Health Mission Aligned</span>
            </motion.div>

            {/* Display Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08]"
              id="hero-main-title"
            >
              Your Digital <br className="hidden sm:inline" />
              Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500">Companion</span>
            </motion.h1>

            {/* Display Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans"
              id="hero-sub-title"
            >
              Manage appointments, medical records, medicines, telemedicine consultations and emergency healthcare from one platform. HealthSaathi brings top-tier medical assistance straight to your screen.
            </motion.p>

            {/* Interactive CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => onOpenModal('auth-signup')}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-900/30 transition-all text-sm tracking-wide cursor-pointer"
                id="hero-cta-signup"
              >
                Get Started
              </button>
              <button
                onClick={() => onOpenModal('appointment')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 hover:shadow-md transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                id="hero-cta-appointment"
              >
                <Lucide.CalendarDays className="w-4 h-4 text-emerald-500" /> Book Appointment
              </button>
            </motion.div>

            {/* Quality Accents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>HIPAA Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Lucide.ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>NMC Certified</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Lucide.BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>24/7 Support</span>
              </div>
            </motion.div>

          </div>

          {/* Right Visual Floating-Engine Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-tr from-slate-100 to-white/60 dark:from-slate-900/80 dark:to-slate-950/40 p-6 rounded-[3rem] border border-white dark:border-slate-800 shadow-xl dark:shadow-none flex flex-col gap-5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

              {/* 1. Simulated Active consultation card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl p-4 shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=100" 
                      alt="Dr. Meera Vasudevan" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-50 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Dr. Meera Vasudevan</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-semibold uppercase font-mono tracking-wider">Pediatric Specialist</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenModal('appointment')}
                  className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition"
                >
                  Consult
                </button>
              </motion.div>

              {/* 2. Interactive Main AI Symptom Simulator teaser */}
              <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl p-4 shadow-md border border-slate-150 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded uppercase font-mono">Cognitive Diagnostic Panel</span>
                  <Lucide.BrainCircuit className="w-4 h-4 text-blue-500 animate-pulse" />
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 font-bold mb-1">Enter acute symptom coordinates:</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Dry cough, low fever..."
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg px-2 py-1.5 text-[11px] grow text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSolve}
                    className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer active:scale-95"
                  >
                    Solve
                  </button>
                </div>
              </div>

              {/* 3. Emergency summon quick panel */}
              <div className="relative bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                    <Lucide.Truck className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest font-mono">EMT Immediate Responder</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-205 dark:text-slate-200 mt-0.5">Critical Emergency Summon</h5>
                  </div>
                </div>
                <button
                  onClick={() => onOpenModal('emergency')}
                  className="p-1 px-2.5 bg-rose-600 text-white hover:bg-rose-700 font-extrabold rounded-lg text-[10px] uppercase shadow-sm transition cursor-pointer"
                >
                  SOS Siren
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
