import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { Doctor, MedicineItem, ModalType } from '../types';
import { doctorsList, medicinesList } from '../data/healthcareData';
import { useApp } from '../context/AppContext';

interface InteractiveModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (email: string, name: string) => void;
  currentUser: { email: string; name: string } | null;
}

export const InteractiveModal: React.FC<InteractiveModalProps> = ({
  type,
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser
}) => {
  // Common visual backdrop click handler
  if (!isOpen || !type) return null;

  // Icons Helper
  const getLucideIcon = (name: string, className = "w-5 h-5") => {
    const IconComponent = (Lucide as any)[name];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Lucide.Activity className={className} />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/65 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          id="interactive-modal-body"
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-sans">
                {type === 'appointment' && <Lucide.CalendarRange className="w-5 h-5" />}
                {type === 'symptom' && <Lucide.BrainCircuit className="w-5 h-5" />}
                {type === 'records' && <Lucide.FolderLock className="w-5 h-5" />}
                {type === 'medicine' && <Lucide.Pill className="w-5 h-5" />}
                {type === 'auth-login' && <Lucide.LogIn className="w-5 h-5" />}
                {type === 'auth-signup' && <Lucide.UserCheck className="w-5 h-5" />}
                {type === 'emergency' && <Lucide.PhoneCall className="w-5 h-5" />}
              </div>
              <div className="font-sans">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {type === 'appointment' && 'Book Specialist Appointment'}
                  {type === 'symptom' && 'AI Clinical Symptom Decoder'}
                  {type === 'records' && 'Medical Records Secure Vault'}
                  {type === 'medicine' && 'Prescription e-Pharmacy'}
                  {type === 'auth-login' && 'Access Your Account'}
                  {type === 'auth-signup' && 'Create Your Health Profile'}
                  {type === 'emergency' && 'Critical Emergency Responder'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {type === 'appointment' && 'Verified slots at partner healthcare facilities'}
                  {type === 'symptom' && 'Instant self-guidance scanning engine'}
                  {type === 'records' && '256-bit AES HIPAA encrypted folder'}
                  {type === 'medicine' && 'Flat 20% discount on health essentials'}
                  {type === 'auth-login' && 'Sign in to access secure dashboard metrics'}
                  {type === 'auth-signup' && 'Join 450,050+ patients monitoring wellness'}
                  {type === 'emergency' && 'Instant EMS ambulance dispatcher tracker'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-modal-button"
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <Lucide.X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content - Router */}
          <div className="p-6 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            {type === 'appointment' && <AppointmentSection onClose={onClose} currentUser={currentUser} />}
            {type === 'symptom' && <SymptomSection />}
            {type === 'records' && <MedicalRecordsSection />}
            {type === 'medicine' && <MedicineOrderingSection onClose={onClose} />}
            {type === 'auth-login' && <AuthGatewaySection initialView="login" onClose={onClose} onAuthSuccess={onAuthSuccess} />}
            {type === 'auth-signup' && <AuthGatewaySection initialView="register" onClose={onClose} onAuthSuccess={onAuthSuccess} />}
            {type === 'emergency' && <EmergencySection />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ==========================================
   1. APPOINTMENT SECTION
   ========================================== */
const AppointmentSection: React.FC<{ onClose: () => void; currentUser: { email: string; name: string } | null }> = ({ onClose, currentUser }) => {
  const { setAppointments } = useApp();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const savedFilter = localStorage.getItem('tempSpecialtyFilter');
    if (savedFilter) {
      setSearchQuery(savedFilter);
      localStorage.removeItem('tempSpecialtyFilter');
    }
  }, []);

  const filteredDoctors = doctorsList.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot || !patientName || !patientPhone) return;

    const confirmationId = `HS-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(confirmationId);

    // Build the structural booking object and synchronize to persistent Firebase store
    const newAppointment = {
      id: confirmationId,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospital: selectedDoctor.hospital,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days in the future
      time: selectedSlot,
      status: 'Confirmed' as const,
      fees: selectedDoctor.fees,
      type: selectedDoctor.id === 'doc-2' ? ('In-Clinic' as const) : ('Video Call' as const)
    };

    setAppointments((prev: any) => [...prev, newAppointment]);
    setIsBooked(true);
  };

  if (isBooked && selectedDoctor) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4 animate-bounce">
          <Lucide.CheckCircle className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-bold text-slate-800 mb-1 font-sans">Appointment Confirmed!</h4>
        <p className="text-sm text-slate-500 mb-6 font-mono text-center px-4">
          Booking ID: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{bookingId}</span>
        </p>
        
        <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 text-sm">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
            <img 
              src={selectedDoctor.avatarUrl} 
              alt={selectedDoctor.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <h5 className="font-semibold text-slate-800 font-sans">{selectedDoctor.name}</h5>
              <p className="text-xs text-blue-600 font-medium">{selectedDoctor.specialty}</p>
            </div>
          </div>
          <div className="space-y-2 text-slate-600">
            <p className="flex justify-between"><span>Location:</span> <span className="font-medium text-slate-800">{selectedDoctor.hospital}</span></p>
            <p className="flex justify-between"><span>Slot Chosen:</span> <span className="font-medium text-slate-800 font-mono">{selectedSlot}</span></p>
            <p className="flex justify-between"><span>Patient:</span> <span className="font-medium text-slate-800">{patientName}</span></p>
            <p className="flex justify-between"><span>Consultation Fee:</span> <span className="font-medium text-emerald-600 font-bold">₹{selectedDoctor.fees} / Cashless Approved</span></p>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-6 bg-amber-50 border border-amber-200/50 rounded-xl p-3 max-w-sm mx-auto text-left flex gap-2">
          <Lucide.Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <span>Please flash this booking card at the hospital front reception at least 15 minutes before your scheduled slot.</span>
        </div>

        <button 
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {!selectedDoctor ? (
        <div>
          <div className="relative mb-4">
            <Lucide.Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search specialists (e.g. Cardiologist, Neurologist, Dr. Alok...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-3">
            {filteredDoctors.map(doctor => (
              <div 
                key={doctor.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-100 hover:border-blue-200 rounded-2xl hover:shadow-md transition-all gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src={doctor.avatarUrl} 
                    alt={doctor.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {doctor.name}
                      <span className="flex items-center gap-0.5 text-amber-500 font-mono text-xs bg-amber-50 px-1.5 py-0.5 rounded">
                        <Lucide.Star className="w-3 h-3 fill-amber-500" />
                        {doctor.rating}
                      </span>
                    </h5>
                    <p className="text-xs text-blue-600 font-semibold">{doctor.specialty} • {doctor.experience}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Lucide.MapPin className="w-3 h-3" />
                      {doctor.hospital}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-sm font-semibold text-slate-800 sm:mb-1">₹{doctor.fees} <span className="text-xs text-slate-400 font-normal">fee</span></span>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setSelectedSlot(doctor.availability[0]);
                    }}
                    className="px-4 py-1.5 bg-blue-50 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Select Slots
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !currentUser ? (
        <div className="text-center py-8 px-4 space-y-4">
          <button 
            type="button"
            onClick={() => setSelectedDoctor(null)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs font-semibold mb-2"
          >
            <Lucide.ArrowLeft className="w-3.5 h-3.5" /> Back to specialists
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-500">
            <Lucide.Lock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-800">Direct Patient Check-In Locked</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Please sign in or provision a new clinical HealthSaathi card before scheduling active physician consultation hours.
          </p>
          <div className="flex gap-2.5 justify-center pt-2">
            <a
              href="/login"
              onClick={() => onClose()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow transition"
            >
              Sign In
            </a>
            <a
              href="/signup"
              onClick={() => onClose()}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200 transition"
            >
              Provision New Card
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <button 
            type="button"
            onClick={() => setSelectedDoctor(null)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs font-semibold mb-2"
          >
            <Lucide.ArrowLeft className="w-3.5 h-3.5" /> Back to specialists
          </button>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <img 
              src={selectedDoctor.avatarUrl} 
              alt={selectedDoctor.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">{selectedDoctor.name}</h5>
              <p className="text-xs text-blue-600 font-semibold">{selectedDoctor.specialty} • {selectedDoctor.experience}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDoctor.hospital}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Available Time Slot</label>
            <div className="grid grid-cols-2 gap-2">
              {selectedDoctor.availability.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 text-xs font-medium font-mono rounded-xl border text-center transition-all ${
                    selectedSlot === slot 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Patient Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Rohan Sharma"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp Mobile Contact</label>
              <input 
                type="tel" 
                required 
                placeholder="+91 98765 43210"
                value={patientPhone}
                onChange={e => setPatientPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Describe Symptoms or Notes (Optional)</label>
            <textarea 
              rows={2}
              placeholder="e.g. chronic skin rash around elbow joint since last 4 days"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            Confirm Appointment Booking (₹{selectedDoctor.fees})
          </button>
        </form>
      )}
    </div>
  );
};

/* ==========================================
   2. AI SYMPTOM SECTION (Simulation)
   ========================================== */
/* ==========================================
   2. AI SYMPTOM SECTION (Simulation)
   ========================================== */
const getDiagnosisForSymptom = (input: string) => {
  const query = input.toLowerCase();

  // 1. Back pain / knee / bone / joint
  if (
    query.includes('back') || 
    query.includes('knee') || 
    query.includes('joint') || 
    query.includes('bone') || 
    query.includes('muscle') || 
    query.includes('pain') && (query.includes('stiff') || query.includes('neck') || query.includes('shoulder') || query.includes('spine') || query.includes('leg') || query.includes('walking') || query.includes('hip'))
  ) {
    return {
      condition: 'Postural Musculoskeletal Strain / Lumbar spasm',
      accuracy: '94.2%',
      description: 'The reporting keywords strongly highlight indicators associated with localized mechanical back pain, muscle spasm, or knee joint overexertion. It frequently correlates with static postural fatigue, poor ergonomics, or mild physical loading.',
      recommendations: [
        'Gentle hamstring & lower back stretches',
        'Alternating hot/cold compress packs',
        'Ergonomic lumbar support adjustments'
      ],
      specialist: 'Orthopaedic Specialist / Physical Therapist',
      physiciansOnline: '3 specialists online'
    };
  }

  // 2. Stomach / abdomen / digestion / burn / acidity / nausea / food
  if (
    query.includes('stomach') || 
    query.includes('abdomen') || 
    query.includes('digest') || 
    query.includes('burn') || 
    query.includes('acid') || 
    query.includes('nausea') || 
    query.includes('diarrhea') ||
    query.includes('vomit') ||
    query.includes('gastric') ||
    query.includes('food') ||
    query.includes('breakfast') ||
    query.includes('lunch') ||
    query.includes('dinner')
  ) {
    return {
      condition: 'Acute Gastric Acid Flux & Dyspepsia / GERD',
      accuracy: '91.8%',
      description: 'Your reported symptoms indicate irritation of the gastric lining or esophageal acid reflux. It often associates with recent spicy meals, high caffeine use, anxiety, or skipping breakfast.',
      recommendations: [
        'Avoid fried, acidic, or extremely spicy food items',
        'Sip cold milk, chamomile tea, or take counter antacids',
        'Rest in an upright position for at least 45 minutes'
      ],
      specialist: 'Gastroenterologist',
      physiciansOnline: '2 specialists online'
    };
  }

  // 3. Headache / migraine / bright screen / eyes / light / tension
  if (
    query.includes('headache') || 
    query.includes('migraine') || 
    query.includes('eye') || 
    query.includes('light') || 
    query.includes('screen') || 
    query.includes('tension') ||
    query.includes('temple') ||
    query.includes('brain') ||
    query.includes('head')
  ) {
    return {
      condition: 'Tension-type Cephalgia / Screen-induced Migraine',
      accuracy: '95.1%',
      description: 'The symptoms heavily match indicators of screen fatigue, sensory overload, or cranial muscle tension. This is usually triggered by long screen hours, poor hydration, or low-quality blue-light exposure.',
      recommendations: [
        'Apply an ice pack to your forehead or temples',
        'Rest in a completely dark, quiet room',
        'Implement the 20-20-20 rule for eyes going forward'
      ],
      specialist: 'Neurologist / Optometrist',
      physiciansOnline: '4 specialists online'
    };
  }

  // 4. Cough / cold / fever / throat / chest / breath / congestion / flu
  if (
    query.includes('cough') || 
    query.includes('cold') || 
    query.includes('fever') || 
    query.includes('throat') || 
    query.includes('congest') || 
    query.includes('flu') || 
    query.includes('nose') ||
    query.includes('sneeze') ||
    query.includes('respiratory') ||
    query.includes('headache') && query.includes('cough')
  ) {
    return {
      condition: 'Acute Upper Respiratory Tract Infection / Seasonal Rhinitis',
      accuracy: '93.4%',
      description: 'Strong matching for seasonal rhinopharyngitis or common cold. This represents standard nasal/bronchial airway hypersensitivity often triggered by allergy, environmental humidity, or mild viral vectors.',
      recommendations: [
        'Perform warm saltwater gargles 3-4 times daily',
        'Inhale steam or humidified warm vapors',
        'Ensure fluid intake is at least 3 liters of warm water'
      ],
      specialist: 'Pulmonologist / ENT Specialist',
      physiciansOnline: '2 specialists online'
    };
  }

  // 5. Skin / rash / itch / allergy / spot
  if (
    query.includes('skin') ||
    query.includes('rash') ||
    query.includes('itch') ||
    query.includes('allergy') ||
    query.includes('dry skin') ||
    query.includes('dermatitis') ||
    query.includes('spot') ||
    query.includes('redness')
  ) {
    return {
      condition: 'Contact Dermatitis / Cutaneous Allergy Spectrum',
      accuracy: '89.6%',
      description: 'The reporting indicators point towards local skin irritation, allergen contact, or dry skin. Check for any recent physical exposure to chemicals, new soaps, or environmental irritants.',
      recommendations: [
        'Apply soothing calamine lotion or pure aloe gel',
        'Avoid scratching or picking the dry areas',
        'Use mild, fragrance-free hypoallergenic washes'
      ],
      specialist: 'Dermatologist',
      physiciansOnline: '5 specialists online'
    };
  }

  // Default fallback
  return {
    condition: 'Atypical Functional Clinical Feedback',
    accuracy: '88.0%',
    description: 'Your entered symptom characteristics present an overlapping set of clinical markers indicating general body responses. We recommend tracking active temperature, resting well, and scheduling a direct physician consultation to confirm wellness indicators.',
    recommendations: [
      'Record your active temperature & blood pressure twice daily',
      'Optimize sleep for a minimum level of 8 restful hours',
      'Maintain an active intake record of nutrition & hydration'
    ],
    specialist: 'General Family Medicine Practitioner',
    physiciansOnline: '6 specialists online'
  };
};

const SymptomSection: React.FC = () => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tempSymptomInput');
    if (saved) {
      setSymptomInput(saved);
      localStorage.removeItem('tempSymptomInput');
      // Auto trigger dynamic scan simulation for a seamless UX!
      setIsScanning(true);
      setHasScanned(false);
      setTimeout(() => {
        setIsScanning(false);
        setHasScanned(true);
      }, 2000); // 2 seconds is optimal
    }
  }, []);

  const handleDecoderRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    
    setIsScanning(true);
    setHasScanned(false);

    // Simulate clinical scan phases
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2000);
  };

  const commonSymptomPhrases = [
    'Dry cough with mild sore throat and headache',
    'Sudden burning stomach pain after hot breakfast',
    'Low back pain muscle stiffness and knee joint fatigue',
    'Migraine headache sensitivity to bright screen lighting'
  ];

  const activeDiagnosis = getDiagnosisForSymptom(symptomInput);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
        <Lucide.ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Medical Disclaimer:</span> This AI tool runs general natural language diagnostic classifiers to output informational health guidance. For medical emergencies or severe symptoms, immediately use the <span className="font-semibold text-rose-700 dark:text-rose-450">HealthSaathi Emergency Action Siren</span>.
        </div>
      </div>

      {!isScanning && !hasScanned && (
        <form onSubmit={handleDecoderRun} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">What symptoms are you experiencing?</label>
            <textarea
              required
              rows={3}
              value={symptomInput}
              onChange={e => setSymptomInput(e.target.value)}
              placeholder="e.g. constant headache since morning, mild temperature feeling, and localized nose congestion."
              className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-1">Click a preset to quick test:</span>
            <div className="flex flex-wrap gap-1.5">
              {commonSymptomPhrases.map(phrase => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setSymptomInput(phrase)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-250 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 text-white font-semibold rounded-xl text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 dark:shadow-none cursor-pointer active:scale-98"
          >
            <Lucide.Sparkles className="w-4 h-4" /> Diagnose with HealthSaathi Copilot
          </button>
        </form>
      )}

      {isScanning && (
        <div className="text-center py-10 space-y-4">
          <div className="relative inline-block animate-bounce">
            {/* Visual scanner pulses */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 flex items-center justify-center animate-pulse z-10 relative">
              <Lucide.BrainCircuit className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 opacity-20 rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Analysing symptom linguistics...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Matching indices against digital clinical research manuals...</p>
          </div>
          <div className="max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-emerald-500 h-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {hasScanned && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">Cognitive Diagnosis</span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-bold">Match Accuracy: {activeDiagnosis.accuracy}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">Simulated evaluation for: &quot;{symptomInput}&quot;</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans mb-3">
              The reporting keywords strongly highlight indicators associated with <strong className="text-slate-800 dark:text-white">{activeDiagnosis.condition}</strong>. {activeDiagnosis.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mt-4">
              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80">
                <span className="text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wide text-[10px]">Recommendations</span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                  {activeDiagnosis.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-snug">{rec}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wide text-[10px]">Specialist field matching</span>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{activeDiagnosis.specialist}</p>
                </div>
                <p className="text-slate-550 dark:text-slate-450 text-[11px] mt-1.5 italic bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md inline-block w-max">
                  {activeDiagnosis.physiciansOnline}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setHasScanned(false);
                setSymptomInput('');
              }}
              className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
            >
              Scan New Symptoms
            </button>
            <button
              onClick={() => {
                // Swap view to schedule an appointment with specialties
                setHasScanned(false);
              }}
              className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition-colors text-center shadow cursor-pointer active:scale-98"
            >
              Book Specialist Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================
   3. SECURE RECORDS LOCKER SECTION
   ========================================== */
const MedicalRecordsSection: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; date: string; tag: string }>>([
    { name: 'Radiology_Chest_Xray_2025.pdf', size: '2.4 MB', date: 'Jul 15, 2025', tag: 'Radiology' },
    { name: 'Allergy_Blood_Panel_Apollo.pdf', size: '1.1 MB', date: 'Jan 02, 2026', tag: 'Diagnostic' },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setTimeout(() => {
      const newFile = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        tag: 'User Upload'
      };
      setUploadedFiles(prev => [newFile, ...prev]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop UI */}
      <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl bg-slate-50 p-6 text-center transition-all cursor-pointer">
        <input 
          type="file" 
          onChange={handleMockUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mb-1">
            <Lucide.Upload className="w-5 h-5 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Drag or click to upload prescriptions or reports</p>
          <p className="text-xs text-slate-400">PDF, PNG, JPEG up to 10MB sizes. Files are instantly encrypted locally.</p>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2.5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-800 animate-pulse">
          <Lucide.Loader2 className="w-5 h-5 animate-spin" />
          <span>Encrypting file bits and synching with secure decentralized cloud nodes...</span>
        </div>
      )}

      {/* Uploaded File lists */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Encrypted Clinical Repository ({uploadedFiles.length})</label>
        
        {uploadedFiles.map((file, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <Lucide.FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 line-clamp-1 break-all">{file.name}</span>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="font-mono">{file.size}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                  <span>•</span>
                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-medium">{file.tag}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              <button className="p-1 px-2 hover:bg-slate-100 text-slate-500 rounded text-xs font-semibold hover:text-slate-800 transition-colors">
                Decrypt
              </button>
              <button className="p-1 px-1.5 hover:bg-slate-100 text-slate-500 rounded text-xs">
                <Lucide.Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================
   4. E-PHARMACY ORDERING SECTION
   ========================================== */
const MedicineOrderingSection: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [basket, setBasket] = useState<Array<{ medicine: MedicineItem; quantity: number }>>([]);
  const [isOrdered, setIsOrdered] = useState(false);

  const toggleBasketAdd = (med: MedicineItem) => {
    setBasket(prev => {
      const existing = prev.find(item => item.medicine.id === med.id);
      if (existing) {
        return prev.filter(item => item.medicine.id !== med.id);
      } else {
        return [...prev, { medicine: med, quantity: 1 }];
      }
    });
  };

  const handleBasketChangeQty = (id: string, diff: number) => {
    setBasket(prev => prev.map(item => {
      if (item.medicine.id === id) {
        const nextQty = item.quantity + diff;
        return { ...item, quantity: nextQty > 0 ? nextQty : 1 };
      }
      return item;
    }));
  };

  const isItemInBasket = (id: string) => basket.some(item => item.medicine.id === id);

  const calculateSubtotal = () => {
    return basket.reduce((acc, current) => acc + (current.medicine.price * current.quantity), 0);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (basket.length === 0) return;
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-500 mb-4 animate-bounce">
          <Lucide.PackageOpen className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-bold text-slate-800 mb-1">Prescription e-Pharmacy Order Received!</h4>
        <p className="text-sm text-slate-500 mb-6 px-4">
          Our verified pharmacist is evaluating your digital medical profile. Your order has been scheduled for flat <strong className="text-slate-800">Express Delivery in 4 Hours</strong>.
        </p>

        <div className="max-w-xs mx-auto p-4 bg-teal-50/40 rounded-xl border border-teal-100 text-xs mb-6 text-left space-y-1">
          <span className="font-bold text-teal-800 block text-center uppercase tracking-wider mb-2">Invoice Summary</span>
          <p className="flex justify-between"><span>Items count:</span> <span className="font-bold text-slate-800">{basket.length} meds</span></p>
          <p className="flex justify-between"><span>Discount Applied:</span> <span className="text-teal-600 font-semibold">Flat 20% (HS-PHARMA)</span></p>
          <p className="flex justify-between border-t border-teal-100 pt-2 font-bold text-slate-800 text-sm"><span>Total Charged:</span> <span className="text-emerald-600 font-bold">₹{Math.floor(calculateSubtotal() * 0.8)}</span></p>
        </div>

        <button 
          onClick={onClose}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-100"
        >
          Track Dispatch Route
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest font-mono">Pharmacist verified</span>
          <h4 className="text-sm font-bold text-slate-800 mt-0.5">Choose standard doctor supplements</h4>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="text-xs bg-teal-50 border border-teal-100 font-semibold px-2 py-1 rounded text-teal-700">Code: HS-PHARMA Flat 20% off</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left pane: lists */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Available Stock Medicines</span>
          {medicinesList.map(med => {
            const added = isItemInBasket(med.id);
            return (
              <div 
                key={med.id}
                className={`p-3 rounded-xl border transition-all ${
                  added 
                    ? 'border-teal-200 bg-teal-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">{med.name}</h5>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">{med.category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">₹{med.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{med.description}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/60">
                  <span className="text-[10px] italic text-slate-400">{med.dosage}</span>
                  <button
                    onClick={() => toggleBasketAdd(med)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      added 
                        ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100' 
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-50 shadow-sm'
                    }`}
                  >
                    {added ? 'Remove' : 'Add to cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right pane: cart checkout */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold text-slate-600">Prescription Cart ({basket.length})</span>
              <Lucide.ShoppingBag className="w-4 h-4 text-slate-500" />
            </div>

            {basket.length === 0 ? (
              <div className="text-center py-12">
                <Lucide.Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Your pharmacy cart is empty.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Select pharmaceutical items to configure dispatch.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
                {basket.map(item => (
                  <div key={item.medicine.id} className="flex items-center justify-between text-xs py-1">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-800 block truncate">{item.medicine.name}</span>
                      <span className="text-slate-400 font-mono">₹{item.medicine.price} / tablet bundle</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleBasketChangeQty(item.medicine.id, -1)}
                        className="w-5 h-5 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center hover:bg-slate-100 text-[10px]"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleBasketChangeQty(item.medicine.id, 1)}
                        className="w-5 h-5 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center hover:bg-slate-100 text-[10px]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 mt-4 space-y-3.5">
            <div className="space-y-1 text-xs">
              <p className="flex justify-between text-slate-500"><span>Cart Subtotal:</span> <span className="font-mono text-slate-800">₹{calculateSubtotal()}</span></p>
              <p className="flex justify-between text-slate-500"><span>Instant Code Discount:</span> <span className="font-mono text-red-500 font-semibold">-₹{Math.floor(calculateSubtotal() * 0.2)}</span></p>
              <p className="flex justify-between text-slate-500"><span>Shipping Dispatch:</span> <span className="text-emerald-500 font-semibold">FREE</span></p>
              <p className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-200/50 pt-2"><span>Total Invoice:</span> <span className="font-mono text-teal-600 text-base font-bold">₹{Math.floor(calculateSubtotal() * 0.8)}</span></p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={basket.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 ${
                basket.length === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer shadow-lg shadow-teal-50'
              }`}
            >
              <Lucide.FileCheck className="w-4 h-4" /> Dispatch e-Pharma Box (₹{Math.floor(calculateSubtotal() * 0.8)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   5. AUTHENTICATION GATEWAY SECTION (Login, Register, Forgot Password, OTP, Reset)
   ========================================== */
interface AuthGatewaySectionProps {
  initialView: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess?: (email: string, name: string) => void;
}

const AuthGatewaySection: React.FC<AuthGatewaySectionProps> = ({
  initialView,
  onClose,
  onAuthSuccess
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'otp-verification' | 'reset-password'>(initialView);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

  // Input states
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [consent, setConsent] = useState(false);

  // OTP Box inputs (4 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const otpRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];
  const [otpTimer, setOtpTimer] = useState(30);

  // Password Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockOtpSent, setMockOtpSent] = useState(false);

  // Resend OTP countdown effect
  useEffect(() => {
    let interval: any;
    if (view === 'otp-verification' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, otpTimer]);

  // Form Validations helper
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (view === 'login') {
      if (loginMethod === 'email') {
        if (!email) {
          tempErrors.email = 'Email represents a mandatory secure address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          tempErrors.email = 'Please provide a valid HIPAA format email';
        }
        if (!password) {
          tempErrors.password = 'Passcode required to open encrypted tunnel';
        }
      } else {
        if (!mobile) {
          tempErrors.mobile = 'Mobile contact coordinate required';
        } else if (!/^\d{10}$/.test(mobile.replace(/[^\d]/g, ''))) {
          tempErrors.mobile = 'Specify exactly a 10-digit mobile contact';
        }
      }
    } else if (view === 'register') {
      if (!name.trim()) tempErrors.name = 'Full name required under medical logs';
      if (!email) {
        tempErrors.email = 'Email is mandatory for health report sync';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        tempErrors.email = 'Provide a valid health-standard email format';
      }
      if (!mobile) {
        tempErrors.mobile = 'Contact mobile is critical for doctor calls';
      } else if (!/^\d{10}$/.test(mobile.replace(/[^\d]/g, ''))) {
        tempErrors.mobile = 'Provide a standard 10-digit primary mobile';
      }
      if (!password) {
        tempErrors.password = 'Define a secure password for record encryption';
      } else if (password.length < 8) {
        tempErrors.password = 'Passcode must have at least 8 alphanumeric bits';
      } else if (!/[A-Z]/.test(password)) {
        tempErrors.password = 'Must contain at least 1 uppercase letter';
      } else if (!/[0-9]/.test(password)) {
        tempErrors.password = 'Must contain at least 1 numeric character';
      }
      if (password !== confirmPassword) {
        tempErrors.confirmPassword = 'Encryption signatures do not match';
      }
      if (!consent) {
        tempErrors.consent = 'Consent to the clinical privacy statements is required';
      }
    } else if (view === 'forgot-password') {
      if (loginMethod === 'email') {
        if (!email) {
          tempErrors.email = 'Specify the registered email map';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          tempErrors.email = 'Enter a valid email structure';
        }
      } else {
        if (!mobile) {
          tempErrors.mobile = 'Specify the registered contact number';
        } else if (!/^\d{10}$/.test(mobile.replace(/[^\d]/g, ''))) {
          tempErrors.mobile = 'Must match a valid 10-digit string';
        }
      }
    } else if (view === 'otp-verification') {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 4) {
        tempErrors.otp = 'Please enter the complete 4-digit token';
      } else if (enteredOtp !== '4321') {
        tempErrors.otp = 'Invalid token code. Enter the verification token code (4321) sent to you.';
      }
    } else if (view === 'reset-password') {
      if (!password) {
        tempErrors.password = 'New passcode is mandatory';
      } else if (password.length < 8) {
        tempErrors.password = 'Must carry 8+ security units';
      } else if (!/[A-Z]/.test(password)) {
        tempErrors.password = 'Missing uppercase validation letter';
      } else if (!/[0-9]/.test(password)) {
        tempErrors.password = 'Missing standard number digit';
      }
      if (password !== confirmPassword) {
        tempErrors.confirmPassword = 'Passcode signatures must match';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // OTP box jumping logic
  const handleOtpChange = (index: number, val: string) => {
    if (/[^\d]/.test(val)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // clear individual error when they enter otp
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto focus next box
    if (val && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Google social login trigger
  const handleGoogleSocialAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onAuthSuccess) {
        onAuthSuccess('google.user@healthsaathi.org', 'Google Patient');
      }
      onClose();
    }, 1500);
  };

  // Handle Form Actions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (view === 'login') {
        const displayName = loginMethod === 'email' ? email.split('@')[0] : `Patient-${mobile.slice(-4)}`;
        const userEmailOrPhone = loginMethod === 'email' ? email : `${mobile}@healthsaathi.sms`;
        if (onAuthSuccess) {
          onAuthSuccess(userEmailOrPhone, displayName[0].toUpperCase() + displayName.slice(1));
        }
        onClose();
      } else if (view === 'register') {
        if (onAuthSuccess) {
          onAuthSuccess(email, name);
        }
        onClose();
      } else if (view === 'forgot-password') {
        setMockOtpSent(true);
        setView('otp-verification');
        setOtpTimer(30);
        setOtp(['', '', '', '']);
      } else if (view === 'otp-verification') {
        setView('reset-password');
      } else if (view === 'reset-password') {
        setView('login');
        alert('Password reset successful! Please sign in with your new passcode.');
      }
    }, 1800);
  };

  // Password score computer
  const computePasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    return score;
  };

  const strengthScore = computePasswordStrength();

  return (
    <div className="max-w-md mx-auto py-1">
      {isSubmitting ? (
        <div className="text-center py-10 space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-spin border-4 border-t-blue-600 border-blue-100 mx-auto" />
            <Lucide.ShieldCheck className="w-6 h-6 text-emerald-500 absolute top-5 right-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-700">Authorizing credentials secure keys...</h4>
            <p className="text-xs text-slate-400 italic">256-bit AES Patient Ledger Syncing in progress</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 transition-all-custom">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Lucide.Lock className="w-3.5 h-3.5" /> HIPAA Sealed Session
            </div>
            <h4 className="text-lg font-bold text-slate-800">
              {view === 'login' && (loginMethod === 'email' ? 'Email Portal Login' : 'Secure OTP Mobile Login')}
              {view === 'register' && 'Register Diagnostic Profile'}
              {view === 'forgot-password' && 'Recover Credential Keys'}
              {view === 'otp-verification' && 'Enter Secure OTP Token'}
              {view === 'reset-password' && 'Setup Secure Credentials'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {view === 'login' && 'Gain immediate access to verified labs and diagnostic histories'}
              {view === 'register' && 'Create your localized medical profile to manage doctor records'}
              {view === 'forgot-password' && 'Enter your coordinates to receive a decryption token'}
              {view === 'otp-verification' && 'Please type the 4-digit code sent to your coordinates'}
              {view === 'reset-password' && 'Configure custom cryptographic passcode to unlock data'}
            </p>
          </div>

          {(view === 'otp-verification' || mockOtpSent) && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-800 flex gap-2.5">
              <Lucide.Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold block">💡 HealthSaathi Security Token Sent:</span>
                Your simulated clinical authentication code is <span className="font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">4321</span>. Please use this to bypass.
              </div>
            </div>
          )}

          {view === 'login' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/55">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  setErrors({});
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/30'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lucide.Mail className="w-3.5 h-3.5" /> Email Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('mobile');
                  setErrors({});
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'mobile'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/30'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lucide.Smartphone className="w-3.5 h-3.5" /> Mobile OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name under Medical Logs</label>
                <div className="relative">
                  <Lucide.User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rohan Sharma"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full pl-10 pr-3 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none ${
                      errors.name 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
                        : name.trim().length > 2
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {name.trim().length > 2 && (
                    <Lucide.Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                  )}
                </div>
                {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5"><Lucide.AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>
            )}

            {((view === 'login' && loginMethod === 'email') || view === 'register' || (view === 'forgot-password' && loginMethod === 'email')) && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Authenticated Email Address</label>
                <div className="relative">
                  <Lucide.Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@healthsaathi.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full pl-10 pr-3 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none ${
                      errors.email 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
                        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <Lucide.Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                  )}
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5"><Lucide.AlertCircle className="w-3 h-3" />{errors.email}</p>}
              </div>
            )}

            {((view === 'login' && loginMethod === 'mobile') || view === 'register' || (view === 'forgot-password' && loginMethod === 'mobile')) && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp Mobile Coordinate</label>
                <div className="relative">
                  <span className="text-xs font-bold font-mono text-slate-400 absolute left-3.5 top-3">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={mobile}
                    onChange={e => {
                      const clean = e.target.value.replace(/[^\d]/g, '');
                      setMobile(clean);
                      if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                    }}
                    className={`w-full pl-14 pr-3 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none ${
                      errors.mobile 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
                        : /^\d{10}$/.test(mobile)
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {/^\d{10}$/.test(mobile) && (
                    <Lucide.Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                  )}
                </div>
                {errors.mobile && <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5"><Lucide.AlertCircle className="w-3 h-3" />{errors.mobile}</p>}
              </div>
            )}

            {((view === 'login' && loginMethod === 'email') || view === 'register' || view === 'reset-password') && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500">Security Passcode</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setView('forgot-password');
                      }}
                      className="text-[10pt] text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Forgot Passcode?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lucide.Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none ${
                      errors.password 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
                        : (password.length >= 8 && strengthScore >= 2)
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                  >
                    {showPassword ? <Lucide.EyeOff className="w-4 h-4" /> : <Lucide.Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5"><Lucide.AlertCircle className="w-3 h-3" />{errors.password}</p>}

                {(view === 'register' || view === 'reset-password') && password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Cryptographic Strength:</span>
                      <span className={`font-bold uppercase ${
                        strengthScore === 1 ? 'text-red-500' : strengthScore === 2 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {strengthScore === 1 && 'Weak Passcode'}
                        {strengthScore === 2 && 'Medium Strength'}
                        {strengthScore === 3 && 'Secure Shield Approved'}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 rounded bg-slate-100 overflow-hidden text-[1px]">
                      <div className={`h-full transition-all ${
                        strengthScore >= 1 ? 'bg-red-500' : 'bg-slate-200'
                      }`} style={{ width: '33.33%' }} />
                      <div className={`h-full transition-all ${
                        strengthScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'
                      }`} style={{ width: '33.33%' }} />
                      <div className={`h-full transition-all ${
                        strengthScore >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} style={{ width: '33.33%' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {(view === 'register' || view === 'reset-password') && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Confirm Security Passcode</label>
                <div className="relative">
                  <Lucide.Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10'
                        : (confirmPassword && password === confirmPassword)
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                  >
                    {showConfirmPassword ? <Lucide.EyeOff className="w-4 h-4" /> : <Lucide.Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5"><Lucide.AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              </div>
            )}

            {view === 'otp-verification' && (
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-500 text-center uppercase tracking-wider">
                  Type 4-digit token
                </label>
                <div className="flex justify-center gap-3" id="otp-container">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      id={`otp-input-${idx}`}
                      className="w-14 h-14 bg-slate-50 hover:bg-slate-100 focus:bg-white text-center text-xl font-extrabold text-slate-800 border-2 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl transition-all font-mono"
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-[11px] text-red-500 font-bold text-center flex items-center justify-center gap-1">
                    <Lucide.AlertCircle className="w-3.5 h-3.5" /> {errors.otp}
                  </p>
                )}

                <div className="text-center pt-1.5">
                  {otpTimer > 0 ? (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Resend secure token in <span className="font-bold text-blue-600">{otpTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpTimer(30);
                        setOtp(['', '', '', '']);
                        setMockOtpSent(true);
                      }}
                      className="text-[11px] text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Resend Decryption Token Code
                    </button>
                  )}
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center gap-2 px-0.5">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="remember-me-checkbox" className="text-xs text-slate-500 select-none cursor-pointer">
                  Remember my credentials on this secure system
                </label>
              </div>
            )}

            {view === 'register' && (
              <div>
                <div className="flex items-start gap-2.5 px-0.5">
                  <input
                    type="checkbox"
                    id="register-consent-checkbox"
                    checked={consent}
                    onChange={e => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors(prev => ({ ...prev, consent: '' }));
                    }}
                    className={`rounded text-emerald-500 border-slate-300 focus:ring-emerald-500 w-4.5 h-4.5 cursor-pointer mt-0.5 ${
                      errors.consent ? 'border-red-500 ring-2 ring-red-100' : ''
                    }`}
                  />
                  <label htmlFor="register-consent-checkbox" className="text-[11px] text-slate-500 leading-tight select-none cursor-pointer">
                    I authorize HealthSaathi to securely register my digital patient profile under standard health-privacy laws, and store encrypted records on AWS vault servers.
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-0.5">
                    <Lucide.AlertCircle className="w-3 h-3" /> {errors.consent}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 font-bold rounded-xl text-xs transition-transform transform active:scale-[0.98] outline-none shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                view === 'register'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100 hover:shadow-emerald-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 hover:shadow-blue-200'
              }`}
            >
              <Lucide.Fingerprint className="w-4 h-4" />
              {view === 'login' && (loginMethod === 'email' ? 'Unlock Account Portal' : 'Send Verification OTP Code')}
              {view === 'register' && 'Decrypt Profile Coordinates'}
              {view === 'forgot-password' && 'Generate Recovery Code'}
              {view === 'otp-verification' && 'Verify and Decrypt'}
              {view === 'reset-password' && 'Save Credentials Signature'}
            </button>
          </form>

          {(view === 'login' || view === 'register') && (
            <div className="space-y-3 pt-1">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Or continue using clinical oauth
                </span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSocialAuth}
                className="w-full py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 hover:bg-slate-50/50 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.52 5.52 0 0 1 8.4 13a5.52 5.52 0 0 1 5.59-5.514c2.23 0 4.09.15 5.55 1.5l3.19-3.19C20.213 3.327 16.92 2 13 2 6.925 2 2 6.925 2 13s4.925 11 11 11c6.55 0 10.5-4.43 10.5-10.5 0-.715-.114-1.215-.26-1.5H12.24Z"
                  />
                </svg>
                Sign In with Google Medical SSO
              </button>
            </div>
          )}

          <div className="text-center pt-2 text-xs border-t border-slate-100/80">
            {view === 'login' && (
              <p className="text-slate-500">
                First time at HealthSaathi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setView('register');
                    setErrors({});
                  }}
                  className="text-emerald-500 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Create Patient Key File
                </button>
              </p>
            )}

            {view === 'register' && (
              <p className="text-slate-500">
                Already registered patient?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setErrors({});
                  }}
                  className="text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Mount Your Key Portal
                </button>
              </p>
            )}

            {(view === 'forgot-password' || view === 'otp-verification' || view === 'reset-password') && (
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrors({});
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                <Lucide.ArrowLeft className="w-3.5 h-3.5" /> Back to Account Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================
   7. EMERGENCY DISPATCHER SECTION
   ========================================== */
const EmergencySection: React.FC = () => {
  const [triggered, setTriggered] = useState(false);
  const [paramedicETA, setParamedicETA] = useState(8);

  return (
    <div className="space-y-4">
      {!triggered ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Lucide.AlertCircle className="w-12 h-12 text-rose-600" />
          </div>
          
          <div>
            <h4 className="text-lg font-extrabold text-slate-800">Critical Siren Responder</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Clicking the button below instantly broadcasts your digital medical profile, active GPS coordinate coordinates, and contact logs to the 3 nearest regional ambulances. 
            </p>
          </div>

          <button
            onClick={() => {
              setTriggered(true);
              // Simulated paramedic count down
              const timer = setInterval(() => {
                setParamedicETA(prev => (prev > 1 ? prev - 1 : 1));
              }, 10000);
              return () => clearInterval(timer);
            }}
            className="px-8 py-3 bg-rose-600 text-white font-extrabold rounded-2xl text-xs hover:bg-rose-700 transition shadow-xl shadow-rose-200 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto animate-bounce cursor-pointer"
          >
            <Lucide.Flame className="w-4 h-4 fill-white" /> Launch Immediate Siren (1-tap EMS call)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-rose-500 text-white rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Lucide.Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase block text-rose-100">Ambulance Code HS-09</span>
                <span className="text-sm font-extrabold">Emergency Paramedics Dispatched!</span>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1 bg-neutral bg-opacity-15 font-mono font-bold text-sm text-center rounded-xl shrink-0">
              <span className="block text-[9px] text-rose-100 font-sans tracking-wide">ETA</span>
              <span>{paramedicETA} MIN</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Real-time GPS Tracking</span>
              <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Live Sat Links Active
              </span>
            </div>

            {/* Simulating mapping details */}
            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex justify-between"><span>Dispatcher Station:</span> <span className="font-bold text-slate-800">Apex City Trauma Unit</span></p>
              <p className="flex justify-between"><span>Vitals Shared:</span> <span className="font-bold text-slate-800">Profile Allergy Records + Blood Type</span></p>
              <p className="flex justify-between"><span>Sirens Status:</span> <span className="font-bold text-red-500 uppercase">Code Red Urgent Navigation</span></p>
            </div>

            <div className="bg-white p-3 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 italic">
              <strong>Tip for Patient:</strong> Please keep your smartphone unblocked for an immediate backup audio validation check from our centralized EMT triage nurse coordinates.
            </div>
          </div>

          <button 
            onClick={() => setTriggered(false)}
            className="w-full py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-300 transition-all text-center"
          >
            Cancel Dispatch Request (Accidental tap)
          </button>
        </div>
      )}
    </div>
  );
};
