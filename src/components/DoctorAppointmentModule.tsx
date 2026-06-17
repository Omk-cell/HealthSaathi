import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Doctor } from '../types';

// Let's define the inner sub-views within our unified Appointment Module
export type ModuleView = 'listing' | 'profile' | 'booking' | 'confirmation' | 'history';

interface DoctorAppointmentModuleProps {
  doctors: Doctor[];
  appointments: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    hospital: string;
    status: 'Confirmed' | 'Pending' | 'Completed';
  }>;
  onBookAppointment: (newApp: {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    hospital: string;
    status: 'Confirmed' | 'Pending' | 'Completed';
  }) => void;
  onCancelAppointment: (id: string, name: string) => void;
  initialView?: ModuleView;
  activeTab: 'appointments' | 'doctors';
  setActiveTab: (tab: any) => void;
}

// Highly realistic reviews dataset to make Doctor Profiles feel extremely authentic and premium
const ENRICHED_DOCTOR_DETAILS: Record<string, {
  qualification: string;
  about: string;
  gender: 'Male' | 'Female';
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}> = {
  'doc-1': {
    qualification: 'MD, DM (Cardiology) - Harvard Medical School, FACC',
    gender: 'Male',
    about: 'Dr. Alok Sen is a senior consultant cardiologist with over 14 years of premier research and clinical operations experience in ischemic heart disease therapy, clinical angioscopy, and minimally invasive cardiac wellness strategies.',
    reviews: [
      { id: 'rev-1-1', author: 'Suresh Kumar', rating: 5, date: 'May 12, 2026', comment: 'Dr. Alok is incredibly patient. He explained my ECG results and made me feel very secure about the lifestyle changes I needed to make.' },
      { id: 'rev-1-2', author: 'Ananya Roy', rating: 5, date: 'Apr 28, 2026', comment: 'Excellent clinical judgment. Clean clinic, very professional diagnostics setup, and cashless insurance authorization took less than 10 minutes.' },
      { id: 'rev-1-3', author: 'Vijay Singh', rating: 4, date: 'Mar 15, 2026', comment: 'Clear explanations and punctual schedule, though the hospital reception desk had a small queue.' }
    ]
  },
  'doc-2': {
    qualification: 'MD (Pediatrics) - Johns Hopkins School of Medicine, FAAP',
    gender: 'Female',
    about: 'Dr. Meera Vasudevan is a compassionate pediatric consultant specializing in childhood dietary systems, pediatric respiratory allergies, immunizations, and developmental tracking.',
    reviews: [
      { id: 'rev-2-1', author: 'Neha Deshmukh', rating: 5, date: 'May 20, 2026', comment: 'The absolute best doctor for toddlers! Highly reassuring and down-to-earth. She didn’t prescribe unnecessary antibiotics.' },
      { id: 'rev-2-2', author: 'Rohan Mehta', rating: 4, date: 'May 02, 2026', comment: 'My daughter loved the colorful cabin and Dr. Meera was very playful. Highly recommend Rainbow Care clinic.' }
    ]
  },
  'doc-3': {
    qualification: 'MD, DNB (Dermatology & Cosmetology) - AIIMS New Delhi',
    gender: 'Male',
    about: 'Dr. Siddharth Verma is an acclaimed dermatologist with deep clinical focus on pediatric skin rashes, psoriasis remedies, acne scar subcision, and laser anti-aging treatments.',
    reviews: [
      { id: 'rev-3-1', author: 'Karina Shah', rating: 5, date: 'May 18, 2026', comment: 'Excellent dermatology expert. My adult acne cleared up in 3 weeks after struggling for years. Highly informative consult!' },
      { id: 'rev-3-2', author: 'Amit Sharma', rating: 4, date: 'Apr 11, 2026', comment: 'Detailed skin mapping. Explains product ingredients very well instead of just pushing generic brands.' }
    ]
  },
  'doc-4': {
    qualification: 'MD, PhD (Neurology & Brain Injury Care) - Stanford Medical',
    gender: 'Female',
    about: 'Dr. Ritika Sharma is a super-specialist neurologist dedicated to migraine therapeutics, chronic nerve pain management, geriatric vertigo, and localized sleep disorders.',
    reviews: [
      { id: 'rev-4-1', author: 'Gopal Chawla', rating: 5, date: 'May 24, 2026', comment: 'Fantastic neurological physician. Solved my father’s complex recurring vertigo issues within one detailed session.' },
      { id: 'rev-4-2', author: 'Sneha Patil', rating: 5, date: 'May 08, 2026', comment: 'A brilliant listener who digs deep into sleep journals and triggers instead of just sedating. Stanford qualified indeed!' }
    ]
  }
};

export const DoctorAppointmentModule: React.FC<DoctorAppointmentModuleProps> = ({
  doctors,
  appointments,
  onBookAppointment,
  onCancelAppointment,
  initialView = 'listing',
  activeTab,
  setActiveTab
}) => {
  // Let's control our sub-view stage
  const [currentView, setCurrentView] = useState<ModuleView>(() => {
    // Smart auto routing:
    // If user clicked 'Verified Doctors' sidebar tab, open Listing Page.
    // If user clicked 'Appointments' sidebar tab, open History Page.
    if (activeTab === 'appointments') return 'history';
    return 'listing';
  });

  // Track selected doctor and booked appointment context across pages
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(doctors[0] || null);
  const [latestBookingDetails, setLatestBookingDetails] = useState<{
    bookingId: string;
    doctor: Doctor;
    selectedDate: string;
    selectedSlot: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    consultType: string;
  } | null>(null);

  // Filter and Search states for Doctor Listing View
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All');
  const [filterExperience, setFilterExperience] = useState('All');
  const [filterRating, setFilterRating] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState('All');

  // Booking Form temporary states
  const [selectedDay, setSelectedDay] = useState<number>(3); // Representing June 3rd, 2026 (Wednesday) by default
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [consultType, setConsultType] = useState('First Consultation');
  const [symptomDetails, setSymptomDetails] = useState('');
  const [cashlessConsent, setCashlessConsent] = useState(true);

  // Sync view when sidebar tabs trigger changes
  React.useEffect(() => {
    if (activeTab === 'appointments') {
      setCurrentView('history');
    } else {
      setCurrentView('listing');
    }
  }, [activeTab]);

  // Extract unique elements for filters from our doctor list
  const specializations = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];
  const locations = ['All', ...Array.from(new Set(doctors.map(d => d.hospital)))];
  const experiences = ['All', 'Over 10 Years', 'Over 13 Years'];
  const ratings = ['All', '4.8 Stars & Above', '5.0 Pure Stars'];
  const availabilityDays = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Advanced cascade filters
  const filteredDoctors = doctors.filter(doc => {
    // Search query matching
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

    // Specialization
    const matchesSpecialty = filterSpecialization === 'All' || doc.specialty === filterSpecialization;

    // Location
    const matchesLoc = filterLocation === 'All' || doc.hospital === filterLocation;

    // Experience
    let matchesExp = true;
    if (filterExperience !== 'All') {
      const expNumeric = parseInt(doc.experience.replace(/[^\d]/g, ''), 10) || 0;
      if (filterExperience === 'Over 10 Years') matchesExp = expNumeric > 10;
      if (filterExperience === 'Over 13 Years') matchesExp = expNumeric > 13;
    }

    // Ratings
    let matchesRating = true;
    if (filterRating !== 'All') {
      if (filterRating === '4.8 Stars & Above') matchesRating = doc.rating >= 4.8;
      if (filterRating === '5.0 Pure Stars') matchesRating = doc.rating >= 5.0;
    }

    // Availability Filter (Checks day strings inside doc.availability array)
    let matchesAvail = true;
    if (filterAvailability !== 'All') {
      matchesAvail = doc.availability.some(slot =>
        slot.toLowerCase().startsWith(filterAvailability.toLowerCase())
      );
    }

    return matchesSearch && matchesSpecialty && matchesLoc && matchesExp && matchesRating && matchesAvail;
  });

  // Helper: Get enriched data for the active doctor
  const getEnriched = (id: string) => {
    return ENRICHED_DOCTOR_DETAILS[id] || {
      qualification: 'B.Sc, MBBS, MD - General Medicine',
      gender: 'Male' as const,
      about: 'A certified healthcare specialist dedicated to general clinical excellence and proactive outpatient diagnoses with top quality family metrics.',
      reviews: [
        { id: 'rev-gen-1', author: 'Patient Log', rating: 5, date: 'May 01, 2026', comment: 'Professional consulting approach and helpful treatment.' }
      ]
    };
  };

  // Reset Listings Filter helper
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterSpecialization('All');
    setFilterExperience('All');
    setFilterRating('All');
    setFilterLocation('All');
    setFilterAvailability('All');
  };

  // Switch to Doctor Profile Page
  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoc(doctor);
    setCurrentView('profile');
  };

  // Switch to Booking Page
  const handleInitiateBooking = (doctor: Doctor) => {
    setSelectedDoc(doctor);
    setSelectedSlot(doctor.availability[0] || '10:30 AM');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientAge('');
    setPatientGender('Male');
    setConsultType('First Consultation');
    setSymptomDetails('');
    setCurrentView('booking');
  };

  // Submit Booking and launch Confirmation Page
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !selectedSlot) return;

    const confId = `HS-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedDate = `2026-06-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

    // Add appointment to global system state
    onBookAppointment({
      id: confId,
      doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: formattedDate,
      time: selectedSlot.includes(' ') ? selectedSlot.split(' ').slice(1).join(' ') : selectedSlot,
      hospital: selectedDoc.hospital,
      status: 'Confirmed'
    });

    // Populate confirmation display context
    setLatestBookingDetails({
      bookingId: confId,
      doctor: selectedDoc,
      selectedDate: formattedDate,
      selectedSlot: selectedSlot,
      patientName: patientName || 'Self Care Patient',
      patientPhone: patientPhone || '+91 95005 12053',
      patientEmail: patientEmail || 'patient@healthsaathi.org',
      consultType: consultType
    });

    // Transit to Page 4: Confirmation
    setCurrentView('confirmation');
  };

  return (
    <div className="w-full">
      {/* 5-Page Render Router */}
      <AnimatePresence mode="wait">
        
        {/* =========================================================
            PAGE 1: DOCTOR LISTING
            ========================================================= */}
        {currentView === 'listing' && (
          <motion.div
            key="listing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800">
              <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 opacity-10">
                <Lucide.Stethoscope className="w-96 h-96 shrink-0" />
              </div>
              <div className="relative z-10 max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/20 text-blue-200 text-[10px] font-extrabold uppercase tracking-widest">
                  <Lucide.Sparkles className="w-3 h-3 text-emerald-400" /> OPD OPD Specialist Finder
                </div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-white font-sans">
                  Schedule Verified Doctors
                </h1>
                <p className="text-xs md:text-sm text-blue-200/90 font-medium">
                  Direct live appointment portal integration with 180+ multi-specialty clinical centers. 100% cashless pre-authorization compatible.
                </p>
              </div>
            </div>

            {/* Quick Search and Multi-Filters Combo Panel */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Lucide.Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctor name, medical domain, specialty, or clinic hospital center..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <Lucide.X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Clear Filter Action */}
                {(searchQuery || filterSpecialization !== 'All' || filterExperience !== 'All' || filterRating !== 'All' || filterLocation !== 'All' || filterAvailability !== 'All') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Lucide.FilterX className="w-4 h-4" /> Reset Filters
                  </button>
                )}
              </div>

              {/* Collapsed Filter Cascade Badges */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Lucide.SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Active Search Refining Channels
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {/* Filter 1: Specialty */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Department Specialty</span>
                    <select
                      value={filterSpecialization}
                      onChange={e => setFilterSpecialization(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
                    >
                      <option value="All">All Specialty Fields</option>
                      {specializations.filter(s => s !== 'All').map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 2: Clinic Location */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Clinic Placement</span>
                    <select
                      value={filterLocation}
                      onChange={e => setFilterLocation(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
                    >
                      <option value="All">All Hospital Venues</option>
                      {locations.filter(l => l !== 'All').map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 3: Experience */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Minimum Tenure</span>
                    <select
                      value={filterExperience}
                      onChange={e => setFilterExperience(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
                    >
                      {experiences.map(exp => (
                        <option key={exp} value={exp}>{exp === 'All' ? 'Any Tenure Experience' : exp}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 4: Ratings */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Clinical Rating</span>
                    <select
                      value={filterRating}
                      onChange={e => setFilterRating(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
                    >
                      {ratings.map(rat => (
                        <option key={rat} value={rat}>{rat === 'All' ? 'Any Patient Rating' : rat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 5: Availability */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Weekly Availability</span>
                    <select
                      value={filterAvailability}
                      onChange={e => setFilterAvailability(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 font-mono"
                    >
                      <option value="All">Any Week Day</option>
                      <option value="Mon">Monday Slots</option>
                      <option value="Tue">Tuesday Slots</option>
                      <option value="Wed">Wednesday Slots</option>
                      <option value="Thu">Thursday Slots</option>
                      <option value="Fri">Friday Slots</option>
                      <option value="Sat">Saturday Slots</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Listings Grid */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
                <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full">
                  <Lucide.Users className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">No Matching Practitioners Found</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We could not locate any active staff doctor matching those specific filter metrics. Try clearing your availability, ratings, or location tags to search broader options.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Clear All Filtering Channels
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map(doc => {
                  const enriched = getEnriched(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition duration-300 relative group"
                    >
                      <div>
                        {/* Avatar Image Block */}
                        <div className="relative mb-4">
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-full h-44 object-cover rounded-2xl object-top group-hover:scale-[1.01] transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-3 left-3 bg-blue-900 border border-blue-700 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                            {doc.specialty}
                          </span>
                          <span className="absolute top-3 right-3 bg-amber-50 text-amber-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md border border-amber-200">
                            <Lucide.Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                            {doc.rating} <span className="font-medium text-slate-450 text-[9px]">({doc.reviewsCount})</span>
                          </span>
                        </div>

                        {/* Text Metadata */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                            {doc.name}
                            <Lucide.CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                          </h4>
                          <p className="text-[10.5px] text-slate-500 leading-tight flex items-start gap-1 font-mono">
                            <Lucide.Award className="w-3.5 h-3.5 text-slate-450 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{enriched.qualification}</span>
                          </p>
                          <p className="text-[10.5px] text-slate-400 font-medium leading-none">
                            Tenure: {doc.experience}
                          </p>
                          <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <Lucide.MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate text-[10px] font-semibold">{doc.hospital}</span>
                          </div>
                        </div>

                        {/* Render Slot Quick Previews */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Available Hours</p>
                          <div className="flex flex-wrap gap-1">
                            {doc.availability.slice(0, 3).map((slot, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-semibold font-mono rounded">
                                {slot}
                              </span>
                            ))}
                            {doc.availability.length > 3 && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">
                                +{doc.availability.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Consultation Fee and Action CTAs */}
                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold uppercase text-[9px]">Outpatient Fee</span>
                          <span className="font-extrabold text-slate-800 text-sm">
                            ₹{doc.fees} <span className="text-[10px] font-normal text-slate-400">/ Session</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleViewProfile(doc)}
                            className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-extrabold transition cursor-pointer"
                          >
                            Read Profile
                          </button>
                          <button
                            onClick={() => handleInitiateBooking(doc)}
                            className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-blue-100"
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================
            PAGE 2: DOCTOR PROFILE
            ========================================================= */}
        {currentView === 'profile' && selectedDoc && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Back CTA Navigation Breadcrumb */}
            <button
              onClick={() => setCurrentView('listing')}
              className="inline-flex items-center gap-1.5 p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition shadow-sm"
            >
              <Lucide.ArrowLeft className="w-4 h-4 text-blue-500" /> Back to Staff Listings
            </button>

            {/* Profile Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card Left Widget */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Main Biography Block */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                    <img
                      src={selectedDoc.avatarUrl}
                      alt={selectedDoc.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border-4 border-slate-50 shadow"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                        Active Staff Practitioner
                      </div>
                      <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        {selectedDoc.name} <Lucide.CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      </h2>
                      <p className="text-xs text-blue-600 font-extrabold pr-2">
                        {selectedDoc.specialty} &#8226; {getEnriched(selectedDoc.id).qualification}
                      </p>
                      <p className="text-xs text-slate-400 font-medium font-mono">
                        Experience: {selectedDoc.experience}
                      </p>
                      
                      <div className="pt-2 flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                        <Lucide.MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-[11px] text-slate-600">{selectedDoc.hospital}</span>
                      </div>
                    </div>
                  </div>

                  {/* About Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Summary</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                      {getEnriched(selectedDoc.id).about}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Total OPD Sessions</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">3,800+</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Cashless Approval</p>
                      <span className="inline-flex items-center justify-center text-[10px] text-emerald-600 font-bold font-mono">Verified</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Wait Time Avg</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">15 Mins</p>
                    </div>
                  </div>
                </div>

                {/* Patient Reviews Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lucide.MessageSquare className="w-4 h-4 text-blue-600" /> Patient Feedback & Audited Reviews
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-5 border border-amber-100 rounded-lg px-2.5 py-1 bg-amber-50">
                      <Lucide.Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" /> {selectedDoc.rating} / 5.0
                    </div>
                  </div>

                  <div className="space-y-4">
                    {getEnriched(selectedDoc.id).reviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{rev.author}</span>
                            <span className="text-[10px] text-slate-450 font-mono mt-0.5">{rev.date}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Lucide.Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-650 leading-relaxed italic">&quot;{rev.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation Fees & Slot Options Widget Right Sidebar */}
              <div className="space-y-6">
                
                {/* Outpatient consultation pricing card */}
                <div className="bg-gradient-to-br from-white to-blue-50/10 rounded-3xl p-6 border border-blue-200 shadow-sm space-y-5">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-widest rounded-md">Consultation Summary</span>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold">Hospital Consultation OPD Fee</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-slate-800 font-mono">₹{selectedDoc.fees}</p>
                      <p className="text-xs text-slate-450 font-medium">Out-of-Pocket Max</p>
                    </div>
                    <p className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-md p-1.5 mt-2">
                      <Lucide.ShieldCheck className="w-4 h-4 shrink-0" /> Zero Co-pay for Partner Insurance
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pledge Clinical Availability</p>
                    <div className="space-y-2">
                      {selectedDoc.availability.map((slot, sIdx) => (
                        <div key={sIdx} className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600 shadow-sm">
                          <span className="font-semibold">{slot}</span>
                          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse"></span> Available
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateBooking(selectedDoc)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-2xl transition shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lucide.CalendarDays className="w-4 h-4 shrink-0" /> Book Direct OPD Appointment
                  </button>
                </div>

                {/* Patient Portal Assistance Helper */}
                <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 space-y-3 shadow">
                  <div className="inline-flex p-1.5 bg-blue-500/25 text-blue-400 rounded-xl">
                    <Lucide.Info className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Appointment Policies</h4>
                  <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside">
                    <li><strong className="text-slate-300">Rescheduling Allowed:</strong> Up to 2 hours prior to scheduled consultation times.</li>
                    <li><strong className="text-slate-300">Identity Clearance:</strong> Bring a digital identification or Aadhaar number card for cashless check-in.</li>
                  </ul>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            PAGE 3: APPOINTMENT BOOKING
            ========================================================= */}
        {currentView === 'booking' && selectedDoc && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Step Indicators Header */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-slate-400"><Lucide.Check className="w-4 h-4 text-emerald-500 font-bold" /> Doctor Select</span>
              <Lucide.ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-blue-600 font-bold flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span> Schedule & Intake Details</span>
              <Lucide.ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-400">Confirmation Ticket</span>
            </div>

            <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Patient details & Intake questionnaire fields */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 pb-2.5 border-b border-slate-100 flex items-center gap-1.5">
                    <Lucide.UserCheck className="w-5 h-5 text-blue-600" /> Patient Demographics & Intake
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Patient Full Name <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Rohan Deshmukh"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    {/* Patient Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Primary WhatsApp Mobile <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Email */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Notification Email Address <span className="text-rose-400 font-bold">(Optional)</span></label>
                      <input
                        type="email"
                        placeholder="rohan@gmail.com"
                        value={patientEmail}
                        onChange={e => setPatientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Patient Age <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="number"
                        required
                        placeholder="29"
                        value={patientAge}
                        onChange={e => setPatientAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gender select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Biological Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Male', 'Female', 'Other'].map(gen => (
                          <button
                            key={gen}
                            type="button"
                            onClick={() => setPatientGender(gen as any)}
                            className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                              patientGender === gen
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {gen}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Consultation Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Consultation Objective</label>
                      <select
                        value={consultType}
                        onChange={e => setConsultType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="First Consultation">First Consultation (OPD Visit)</option>
                        <option value="Follow-Up Disease Review">Follow-Up Review Check</option>
                        <option value="Chronic Symptom Analysis">Chronic Disease Monitoring</option>
                        <option value="Diagnostic Report Evaluation">Physical Report Evaluation</option>
                      </select>
                    </div>
                  </div>

                  {/* Symptom Context Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Reason for Outpatient Visit / Active Symptoms <span className="text-slate-400 font-normal">(Explain briefly)</span></label>
                    <textarea
                      rows={3}
                      placeholder="Explain what chronic or acute issues you are experiencing (e.g. skin rash, blood pressure, child cough, cardiology review log histories...)"
                      value={symptomDetails}
                      onChange={e => setSymptomDetails(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Terms & Consent toggle */}
                  <div className="pt-2 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="cashless-consent-checkbox"
                      checked={cashlessConsent}
                      onChange={e => setCashlessConsent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="cashless-consent-checkbox" className="text-[10.5px] leading-relaxed text-slate-500 select-none cursor-pointer">
                      I authorize HealthSaathi to pre-validate my diagnostic profile with partner hospitals to check cashless claim eligibility. I declare the above details are authentic.
                    </label>
                  </div>
                </div>
              </div>

              {/* Day, Slot Selection and Final Summary sidebar */}
              <div className="space-y-6">
                
                {/* Visual Calendar Selector */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                      <Lucide.Calendar className="w-4 h-4 text-blue-600 shrink-0" /> Focus Consultation Date
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-400">June 2026</span>
                  </div>

                  {/* Day Picker Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Days Name Header */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dHead, i) => (
                      <span key={i} className="text-[9px] font-bold text-slate-400 uppercase py-1">{dHead}</span>
                    ))}
                    {/* Day cells (Using June 1st to 14th representing first two weeks) */}
                    {Array.from({ length: 14 }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const isActive = selectedDay === dayNumber;
                      // Some placeholder styling to make calendar look super realistic
                      const isWeekend = dayNumber === 6 || dayNumber === 7 || dayNumber === 13 || dayNumber === 14;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDay(dayNumber)}
                          className={`py-1.5 text-xs rounded-lg font-mono font-bold transition flex flex-col items-center justify-center relative ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                              : isWeekend
                              ? 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          <span>{dayNumber}</span>
                          {!isWeekend && !isActive && (
                            <span className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-1"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Select available slot timeline */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[9px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1">
                      <Lucide.Clock className="w-3.5 h-3.5 text-blue-600" /> Available Hourly OPD slots
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 font-mono">
                      {selectedDoc.availability.map((time, sIdx) => {
                        const isChosenSlot = selectedSlot === time;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setSelectedSlot(time)}
                            className={`py-2 px-2 text-[10px] text-center font-bold font-mono rounded-lg border transition ${
                              isChosenSlot
                                ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-50'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Patient Invoice Summary widget */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 space-y-4 border border-blue-800 shadow">
                  <div className="pb-3 border-b border-blue-800 flex items-center gap-3">
                    <img
                      src={selectedDoc.avatarUrl}
                      alt={selectedDoc.name}
                      className="w-10 h-10 object-cover rounded-full border-2 border-white/20 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedDoc.name}</h4>
                      <p className="text-[10px] text-blue-200 font-semibold leading-tight">{selectedDoc.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-blue-200">
                      <span>Date Scheduled:</span>
                      <span className="font-bold font-mono text-white">June {selectedDay}, 2026</span>
                    </div>
                    <div className="flex justify-between text-blue-200">
                      <span>Slot Time Selected:</span>
                      <span className="font-bold font-mono text-white">{selectedSlot || 'Select hours'}</span>
                    </div>
                    <div className="flex justify-between text-blue-200">
                      <span>Consultation OPD Fee:</span>
                      <span className="font-bold font-mono text-white">₹{selectedDoc.fees}</span>
                    </div>
                    <div className="flex justify-between text-blue-200">
                      <span>Pre-Auth Co-pay:</span>
                      <span className="font-bold font-mono text-emerald-400">₹0 (100% Cashless)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedSlot || !patientName || !patientPhone || !patientAge}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow ${
                      (!selectedSlot || !patientName || !patientPhone || !patientAge)
                        ? 'bg-blue-800 text-blue-400 cursor-not-allowed border border-blue-700/60'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-0 cursor-pointer shadow-lg shadow-emerald-900/30 font-extrabold uppercase tracking-wide'
                    }`}
                  >
                    <Lucide.CheckCircle2 className="w-4 h-4" /> Finalize Consultation Appointment
                  </button>
                </div>

              </div>
            </form>
          </motion.div>
        )}

        {/* =========================================================
            PAGE 4: APPOINTMENT CONFIRMATION
            ========================================================= */}
        {currentView === 'confirmation' && latestBookingDetails && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-6 max-w-lg mx-auto py-4"
          >
            {/* Celebrate animation badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-2 border-2 border-emerald-100 shadow-md shadow-emerald-50 animate-bounce">
              <Lucide.CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">Consultation Booked Successfully!</h2>
              <p className="text-slate-500 text-xs">
                Your appointment slot is locked and authorized at the hospital master clinic list.
              </p>
            </div>

            {/* The Digital Outpatient Receipt (Boarding Pass Theme) */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden text-left relative flex flex-col">
              
              {/* Header block */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 text-white flex justify-between items-center relative z-15">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">Cashless Verified Slip</span>
                  <p className="text-[10px] text-slate-200 font-medium font-mono">ID: {latestBookingDetails.bookingId}</p>
                </div>
                <div className="p-1 px-2.5 bg-white/10 rounded-md text-[10px] font-bold border border-white/10 flex items-center gap-1">
                  <Lucide.ShieldCheck className="w-4 h-4 text-emerald-400" /> Copay Verified
                </div>
              </div>

              {/* Slip content */}
              <div className="p-5 space-y-4">
                
                {/* Doctor details */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-dashed border-slate-250">
                  <img
                    src={latestBookingDetails.doctor.avatarUrl}
                    alt={latestBookingDetails.doctor.name}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{latestBookingDetails.doctor.name}</h4>
                    <p className="text-[10.5px] text-blue-600 font-semibold leading-none">{latestBookingDetails.doctor.specialty}</p>
                    <p className="text-[9.5px] text-slate-400 font-mono mt-1">{latestBookingDetails.doctor.hospital}</p>
                  </div>
                </div>

                {/* Dual Column Info */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2.5 text-xs leading-none">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase mb-1">Registered Patient</span>
                    <span className="font-extrabold text-slate-700">{latestBookingDetails.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase mb-1">Intake Objective</span>
                    <span className="font-extrabold text-slate-700 truncate block">{latestBookingDetails.consultType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase mb-1">Calendar Schedule Date</span>
                    <span className="font-extrabold text-blue-600 font-mono flex items-center gap-1">
                      <Lucide.Calendar className="w-3.5 h-3.5 text-slate-400" /> {latestBookingDetails.selectedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 block uppercase mb-1">OPD Session Slot</span>
                    <span className="font-extrabold text-slate-700 font-mono flex items-center gap-1">
                      <Lucide.Clock className="w-3.5 h-3.5 text-slate-400" /> {latestBookingDetails.selectedSlot}
                    </span>
                  </div>
                </div>

              </div>

              {/* Separation perforated line indicator */}
              <div className="relative flex items-center py-2 bg-slate-50/50">
                <div className="w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full absolute -left-2"></div>
                <div className="flex-1 border-t border-dashed border-slate-200 mx-3"></div>
                <div className="w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full absolute -right-2"></div>
              </div>

              {/* Clear Instructions Bottom Block */}
              <div className="p-5 pt-2 bg-slate-50/80 space-y-2.5 text-[10.5px] text-slate-500 leading-relaxed">
                <h5 className="font-bold uppercase tracking-wider text-slate-400 text-[9px] flex items-center gap-1">
                  <Lucide.Info className="w-3.5 h-3.5 text-orange-400 shrink-0" /> outpatient arrival pre-checks
                </h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Please flash this digital ticket log at hospital OPD reception desk at least 15 mins early.</li>
                  <li>Our cashless team has reserved complete pre-authorization with billing reference <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1 rounded">CLAIM-HS605</span>.</li>
                </ul>
              </div>

            </div>

            {/* Confirmation actions controls */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  alert('Consultation receipt document saved successfully as PDF!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-black transition flex items-center justify-center gap-1 bg-white cursor-pointer"
              >
                <Lucide.Download className="w-4 h-4 text-blue-500 shrink-0" /> Download PDF Receipt
              </button>
              <button
                onClick={() => {
                  alert('Appointment schedule successfully synchronized with Google Calendar!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-black transition flex items-center justify-center gap-1 bg-white cursor-pointer"
              >
                <Lucide.CalendarPlus className="w-4 h-4 text-emerald-500 shrink-0" /> Sync to Google Calendar
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  // Push back to history ledger of appointments
                  setCurrentView('history');
                  setActiveTab('appointments');
                }}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-md shadow-blue-100 cursor-pointer"
              >
                Manage All Booked Appointments
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            PAGE 5: APPOINTMENT HISTORY
            ========================================================= */}
        {currentView === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header section with Schedule CTA */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 leading-none">
                  <Lucide.CalendarDays className="w-5 h-5 text-blue-600" /> Patient Outpatient Consultation Ledgers
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-400/85 mt-1">Manage booked appointments, trigger video diagnostics, or cancel active reservation slots.</p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('listing');
                  setActiveTab('doctors');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-md shadow-blue-100 shrink-0 cursor-pointer"
              >
                <Lucide.Plus className="w-4 h-4" /> Book New Consultation
              </button>
            </div>

            {/* Tabbed view upcoming vs historic logs */}
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto">
                  <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
                    <Lucide.CalendarX className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">You have no active appointments</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400/85 leading-relaxed mt-1">
                      Schedule a physical in-person clinical consult or telemedicine live streaming session with any of HealthSaathi&apos;s verified doctors.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView('listing');
                      setActiveTab('doctors');
                    }}
                    className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Select Specialties
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(app => (
                    <div
                      key={app.id}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md transition duration-200"
                    >
                      <div className="flex items-start gap-3.5 w-full sm:w-auto">
                        {/* Clinical indicator banner */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 mt-0.5">
                          <Lucide.CalendarCheck className="w-5 h-5 shrink-0" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight">{app.doctorName}</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold rounded uppercase">
                              {app.status}
                            </span>
                            <span className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-805 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono font-medium">
                              {app.id}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold leading-none">{app.specialty} &#8226; <span className="font-medium text-slate-500 dark:text-slate-400 font-sans">{app.hospital}</span></p>
                          <p className="text-[10.5px] text-slate-401 dark:text-slate-400/85 font-mono mt-1">
                            Operational Hours: {app.date} AT {app.time}
                          </p>
                        </div>
                      </div>

                      {/* History card actions */}
                      <div className="flex gap-2 w-full sm:w-auto border-t sm:border-0 pt-3.5 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            alert(`Opening Google Maps navigation route directly to: ${app.hospital}`);
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap bg-white dark:bg-slate-900 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Lucide.Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Directions
                        </button>
                        <button
                          onClick={() => {
                            alert('Consultation medical ticket loaded in browser print buffer!');
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap bg-white dark:bg-slate-900 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Lucide.FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" /> Invoice Slip
                        </button>
                        <button
                          onClick={() => {
                            alert(`Joining high-fidelity telemedicine secure link for consultation with ${app.doctorName}`);
                          }}
                          className="flex-1 sm:flex-none px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Lucide.Video className="w-3.5 h-3.5 shrink-0" /> Digital Video
                        </button>
                        <button
                          onClick={() => onCancelAppointment(app.id, app.doctorName)}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-1 hover:text-rose-700 cursor-pointer"
                          title="Revoke reservation"
                        >
                          <Lucide.Trash className="w-3.5 h-3.5 shrink-0" /> Cancel Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
