import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Statistics } from '../components/Statistics';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { InteractiveModal } from '../components/InteractiveModal';
import { ModalType } from '../types';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { currentUser, handleAuthSuccess, handleLogout } = useApp();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const navigate = useNavigate();

  const handleOpenModal = (type: ModalType) => {
    // If we want a separate page for login/signup, we can open them or navigate!
    if (type === 'auth-login') {
      navigate('/login');
    } else if (type === 'auth-signup') {
      navigate('/signup');
    } else {
      setActiveModal(type);
    }
  };

  const handleFindSlots = () => {
    if (selectedSymptom) {
      localStorage.setItem('tempSymptomInput', selectedSymptom);
    }
    if (selectedSpecialty) {
      localStorage.setItem('tempSpecialtyFilter', selectedSpecialty);
      handleOpenModal('appointment');
    } else if (selectedSymptom) {
      handleOpenModal('symptom');
    } else {
      handleOpenModal('appointment');
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleModalAuthSuccess = (email: string, name: string) => {
    handleAuthSuccess(email, name);
    setActiveModal(null);
    navigate('/dashboard');
  };

  const onEnterDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Dynamic emergency flash notification bar */}
        <div className="bg-rose-650 text-white py-2 px-4 text-xs font-semibold text-center bg-rose-600 flex items-center justify-center gap-1.5 leading-none shadow-sm relative z-50">
          <Lucide.AlertCircle className="w-4 h-4 animate-bounce shrink-0 text-red-100" />
          <span>In physical distress? Access 24/7 certified EMT ambulances.</span>
          <button 
            onClick={() => handleOpenModal('emergency')}
            className="underline hover:text-red-100 font-bold ml-1 cursor-pointer"
          >
            Launch Emergency SOS
          </button>
        </div>

        {/* 1. Navbar */}
        <Navbar 
          onOpenModal={handleOpenModal} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onEnterDashboard={onEnterDashboard}
        />

        {/* 2. Hero Section */}
        <Hero onOpenModal={handleOpenModal} />

        {/* Direct Filter Doctor CTA segment */}
        <section className="-mt-8 relative z-20 max-w-4xl mx-auto px-4 mb-8">
          <div className="glass rounded-[2rem] p-4 shadow-xl flex flex-col md:flex-row items-center gap-4 border border-white/40 dark:border-slate-800/20 dark:bg-slate-900/80">
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 px-2 py-1.5 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <Lucide.Search className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Quick OPD Search</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Search 45+ super specialties</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              <div className="relative w-full">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs font-semibold px-4 py-2.5 pr-10 rounded-xl text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">Select clinical specialty (e.g. Pediatric)</option>
                  <option value="Cardiologist" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Cardiologist (Heart Care)</option>
                  <option value="Pediatric" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Pediatric Specialist (Child Care)</option>
                  <option value="Dermatologist" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Dermatologist (Skin Care)</option>
                  <option value="Neurologist" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Neurologist (Brain Care)</option>
                </select>
                <Lucide.ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative w-full">
                <select
                  value={selectedSymptom}
                  onChange={(e) => setSelectedSymptom(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs font-semibold px-4 py-2.5 pr-10 rounded-xl text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="" className="text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">Select symptoms (e.g. dry cough)</option>
                  <option value="Dry cough with mild sore throat and headache" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Dry cough, mild fever, throat pain</option>
                  <option value="Sudden burning stomach pain after hot breakfast" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Stomach pain, acidity, indigestion</option>
                  <option value="Low back pain muscle stiffness and knee joint fatigue" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Back pain, joint or muscle stiffness</option>
                  <option value="Migraine headache sensitivity to bright screen lighting" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">Headache, migraine, screen strain</option>
                </select>
                <Lucide.Brain className="absolute right-3.5 top-3 w-4 h-4 text-emerald-500 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={handleFindSlots}
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 transition cursor-pointer active:scale-95"
            >
              Find Slots
            </button>
          </div>
        </section>

        {/* 3. Features section */}
        <Features onOpenModal={handleOpenModal} />

        {/* 4. How It Works Section */}
        <HowItWorks />

        {/* 5. Statistics Count Up segment */}
        <Statistics />

        {/* 6. Testimonials Reviews Carousel */}
        <Testimonials />

        {/* 7. FAQ interactive Accordion */}
        <FAQ />
      </div>

      {/* 8. Footer */}
      <Footer />

      {/* 9. Interactive Modals Router Container */}
      <InteractiveModal 
        type={activeModal} 
        isOpen={activeModal !== null} 
        onClose={handleCloseModal}
        onAuthSuccess={handleModalAuthSuccess}
        currentUser={currentUser}
      />
    </div>
  );
};
