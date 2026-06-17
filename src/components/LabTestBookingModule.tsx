import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type LabViewStage = 'listing' | 'details' | 'booking' | 'confirmation' | 'history';

// Complete robust diagnostic tests dataset
export interface LabTest {
  id: string;
  name: string;
  category: 'Comprehensive Package' | 'Diabetes Care' | 'Heart Health' | 'Thyroid Care' | 'Core Pathology' | 'Vitamins & Minerals';
  price: number;
  reportingTime: string;
  parametersCount: number;
  isFastingRequired: boolean;
  instructions: string;
  preparationGuidelines: string;
  description: string;
  rating: number;
  scannedCount: number;
}

export const LAB_TESTS_DATASET: LabTest[] = [
  {
    id: 'lab-1',
    name: 'Full Body Health Shield (Comprehensive Package)',
    category: 'Comprehensive Package',
    price: 1599,
    reportingTime: '12 Hours',
    parametersCount: 84,
    isFastingRequired: true,
    instructions: 'Requires 10-12 hours of overnight fasting. Avoid alcohol for 24h prior.',
    preparationGuidelines: 'Do not consume any beverages except plain water, tea without milk/sugar, or current maintenance medication prior to blood draw. Rest well.',
    description: 'Our flagship wellness shield tracking cardiovascular indicators, kidney performance, liver enzyme efficiency, diabetes thresholds, and complete hemogram charts.',
    rating: 4.9,
    scannedCount: 1420
  },
  {
    id: 'lab-2',
    name: 'Diabetes Screening Profile (HbA1c & Fasting Sugar)',
    category: 'Diabetes Care',
    price: 499,
    reportingTime: '8 Hours',
    parametersCount: 3,
    isFastingRequired: true,
    instructions: 'Requires 8-10 hours fasting. Hydrate with water.',
    preparationGuidelines: 'Overnight fasting of 8-10 hours is mandatory. If you are on active diabetic injections or oral drugs, consult your practitioner regarding morning timing.',
    description: 'Gold-standard screening comprising Glycated Hemoglobin (HbA1c) for 3-month sugar averages, alongside instant blood glucose levels.',
    rating: 4.8,
    scannedCount: 980
  },
  {
    id: 'lab-3',
    name: 'Cardiac Wellness Assessment (Lipid & ECG)',
    category: 'Heart Health',
    price: 899,
    reportingTime: '12 Hours',
    parametersCount: 9,
    isFastingRequired: true,
    instructions: '12 hours fasting required. Rest for 10 minutes prior.',
    preparationGuidelines: 'Absorb no high-fat food, alcohol, or heavy exercise for 24 hours. Fast overnight. Avoid nicotine or caffeine 2 hours before sample collection.',
    description: 'Evaluates your cardiovascular threat index. Measures Cholesterol fractionation (HDL, LDL, VLDL, Triglycerides) and risk ratios.',
    rating: 4.9,
    scannedCount: 650
  },
  {
    id: 'lab-4',
    name: 'Active Thyroid Panel (FT3, FT4, TSH)',
    category: 'Thyroid Care',
    price: 599,
    reportingTime: '10 Hours',
    parametersCount: 3,
    isFastingRequired: false,
    instructions: 'Ideal for early morning tests. Non-fasting is fine.',
    preparationGuidelines: 'Collect blood sample preferably in the morning. Postpone your morning dose of levothyroxine/thyroid medications until blood draw is complete.',
    description: 'Direct measurement of Free Triiodothyronine (FT3), Free Thyroxine (FT4), and Thyroid Stimulating Hormone (TSH) to diagnose hypothyroid or hyperthyroid states.',
    rating: 4.7,
    scannedCount: 512
  },
  {
    id: 'lab-5',
    name: 'Complete Blood Count (CBC) with ESR & Hemoglobin',
    category: 'Core Pathology',
    price: 349,
    reportingTime: '6 Hours',
    parametersCount: 24,
    isFastingRequired: false,
    instructions: 'No fasting required. Quick 5-minute draw.',
    preparationGuidelines: 'No specific food restrictions. Stay well-hydrated to make vein localization easier and more comfortable for sample draw.',
    description: 'Measures Red Blood Cells, White Blood Cells with differentials, Platelet volume indices, and ESR to identify underlying anemia, infection triggers, or inflammation.',
    rating: 4.8,
    scannedCount: 2110
  },
  {
    id: 'lab-6',
    name: 'Vitamin D3 & Vitamin B12 Vital Duo',
    category: 'Vitamins & Minerals',
    price: 999,
    reportingTime: '18 Hours',
    parametersCount: 2,
    isFastingRequired: false,
    instructions: 'No fasting necessary. Avoid vitamin supplements for 48h.',
    preparationGuidelines: 'Keep a 48-hour gap from consuming high-dose therapeutic bioti/vitamin supplements to guarantee non-skewed reporting parameters.',
    description: 'Assesses biochemical bone synthesis capability, neuro-muscular wellness levels, and vital red cell maturation cycles controlled by B12.',
    rating: 4.6,
    scannedCount: 420
  },
  {
    id: 'lab-7',
    name: 'Active Kidney Performance Profile (LFT & KFT Combo)',
    category: 'Core Pathology',
    price: 1199,
    reportingTime: '12 Hours',
    parametersCount: 18,
    isFastingRequired: true,
    instructions: 'Requires overnight fasting. Drink water.',
    preparationGuidelines: 'Maintain 10-12 hours fasting. Avoid rich animal protein or strenuous muscle fatigue 24 hours prior to blood collection.',
    description: 'Tracks blood urea nitrogen, creatinine, uric acid, electrolytes (sodium, chloride), liver bilirubin, SGOT/SGPT balances to map organ metabolism.',
    rating: 4.7,
    scannedCount: 340
  }
];

export interface NearbyLab {
  id: string;
  name: string;
  rating: number;
  distance: string;
  address: string;
  certifications: string[];
  slotsAvailable: string;
}

export const NEARBY_LABS_DATASET: NearbyLab[] = [
  {
    id: 'laborg-1',
    name: 'Apex Central Diagnostics & Research Lab',
    rating: 4.9,
    distance: '0.8 km away',
    address: 'Ground Floor, Sunshine Business Tower, Sector 3, Mumbai',
    certifications: ['NABL Accredited', 'CAP Compliant', 'ISO 9001'],
    slotsAvailable: '9 Slots Active Today'
  },
  {
    id: 'laborg-2',
    name: 'Rainbow Pathology & Super diagnostics',
    rating: 4.8,
    distance: '1.4 km away',
    address: '2B Medical Complex Row, Link Road, Mumbai',
    certifications: ['NABL Accredited', 'Govt approved', 'ISO 15189 Certified'],
    slotsAvailable: '14 Slots Active Today'
  },
  {
    id: 'laborg-3',
    name: 'Metro Care Diagnostic Hub Labs',
    rating: 4.6,
    distance: '2.5 km away',
    address: 'Opposite Railway Station East Gate, Sector 15, Mumbai',
    certifications: ['ISO Certified', 'NABL Accredited'],
    slotsAvailable: '5 Slots Active Today'
  }
];

interface LabTestBookingModuleProps {
  onAddRecord?: (newRec: any) => void;
  onAddNotification?: (notif: any) => void;
}

export const LabTestBookingModule: React.FC<LabTestBookingModuleProps> = ({
  onAddRecord,
  onAddNotification
}) => {
  // Navigation View Controller
  const [currentStage, setCurrentStage] = useState<LabViewStage>('listing');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [fastingFilter, setFastingFilter] = useState<'All' | 'Fasting Required' | 'Non-Fasting Fine'>('All');

  // Booking Form Fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [collectionAddress, setCollectionAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string>(NEARBY_LABS_DATASET[0].id);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Booking History / Ledger State (persisted in localStorage for active realism)
  const [labBookings, setLabBookings] = useState<Array<{
    id: string;
    testName: string;
    testPrice: number;
    patientName: string;
    patientAge: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Sample Collected' | 'Report Generated' | 'Cancelled';
    labName: string;
    address: string;
  }>>([]);

  // Load booked tests on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('hs_lab_bookings');
    if (saved) {
      try {
        setLabBookings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load lab bookings', e);
      }
    } else {
      // Mock one historic compiled success lab report for extreme clinical realism
      const seedHistory = [
        {
          id: 'LAB-TX-44021',
          testName: 'Complete Blood Count (CBC) with ESR & Hemoglobin',
          testPrice: 349,
          patientName: 'Rohan Sharma',
          patientAge: '29',
          date: '2026-05-10',
          time: '08:30 AM',
          status: 'Report Generated' as const,
          labName: 'Rainbow Pathology & Super diagnostics',
          address: '2B Medical Complex Row, Link Road, Mumbai'
        }
      ];
      setLabBookings(seedHistory);
      localStorage.setItem('hs_lab_bookings', JSON.stringify(seedHistory));
    }
  }, []);

  // Sync state helpers
  const saveBookings = (newVal: any) => {
    setLabBookings(newVal);
    localStorage.setItem('hs_lab_bookings', JSON.stringify(newVal));
  };

  // Derived Categories
  const categories = ['All', 'Comprehensive Package', 'Diabetes Care', 'Heart Health', 'Thyroid Care', 'Core Pathology', 'Vitamins & Minerals'];

  // Advanced searching/filtering
  const filteredTests = LAB_TESTS_DATASET.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.instructions.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;

    let matchesFasting = true;
    if (fastingFilter === 'Fasting Required') matchesFasting = test.isFastingRequired;
    if (fastingFilter === 'Non-Fasting Fine') matchesFasting = !test.isFastingRequired;

    return matchesSearch && matchesCategory && matchesFasting;
  });

  // Date generators (Next 10 working days starting June 1st, 2026 for alignment)
  const getNextDays = () => {
    const days = [];
    const dateOrigin = new Date('2026-06-01');
    for (let i = 0; i < 10; i++) {
      const copy = new Date(dateOrigin);
      copy.setDate(dateOrigin.getDate() + i);
      const dayName = copy.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = copy.getDate();
      const monthName = copy.toLocaleDateString('en-US', { month: 'short' });
      days.push({
        formatted: copy.toISOString().split('T')[0],
        dayName,
        dayNum,
        monthName
      });
    }
    return days;
  };

  const activeDays = getNextDays();

  // Booking details container for the active ticket view
  const [activeReceipt, setActiveReceipt] = useState<{
    id: string;
    test: LabTest;
    lab: NearbyLab;
    patientName: string;
    patientAge: string;
    patientPhone: string;
    patientGender: string;
    date: string;
    time: string;
    address: string;
    invoiceAmount: number;
  } | null>(null);

  // Handlers
  const handleViewTestDetails = (test: LabTest) => {
    setSelectedTest(test);
    setCurrentStage('details');
  };

  const handleStartBooking = (test: LabTest) => {
    setSelectedTest(test);
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientGender('Male');
    setCollectionAddress('');
    setSelectedDate(activeDays[0].formatted);
    setSelectedTimeSlot('07:00 AM - 09:00 AM (Overnight Fasting Draw)');
    setSelectedLabId(NEARBY_LABS_DATASET[0].id);
    setSpecialInstructions('');
    setCurrentStage('booking');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    const chosenLab = NEARBY_LABS_DATASET.find(l => l.id === selectedLabId) || NEARBY_LABS_DATASET[0];
    const receiptId = `LAB-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = {
      id: receiptId,
      testName: selectedTest.name,
      testPrice: selectedTest.price,
      patientName: patientName || 'Self Care Patient',
      patientAge: patientAge || '29',
      date: selectedDate,
      time: selectedTimeSlot,
      status: 'Scheduled' as const,
      labName: chosenLab.name,
      address: collectionAddress || 'Patient Residence, Mumbai'
    };

    // Save Booking
    const updatedHistory = [newBooking, ...labBookings];
    saveBookings(updatedHistory);

    // Populate active receipt parameters
    setActiveReceipt({
      id: receiptId,
      test: selectedTest,
      lab: chosenLab,
      patientName: patientName || 'Self Care Patient',
      patientAge: patientAge || '29',
      patientPhone: patientPhone || '+91 91092 38174',
      patientGender: patientGender,
      date: selectedDate,
      time: selectedTimeSlot,
      address: collectionAddress || 'Patient Residence, Mumbai',
      invoiceAmount: selectedTest.price
    });

    // Fire callback triggers to general record locker if specified
    if (onAddRecord) {
      onAddRecord({
        id: `rec-lab-${Date.now()}`,
        name: `${selectedTest.name.split(' ')[0]}_Order_Registered.pdf`,
        category: 'Pathology',
        date: selectedDate,
        doctor: chosenLab.name,
        size: 'Pending Sample Draw'
      });
    }

    // Fire alert notifications
    if (onAddNotification) {
      onAddNotification({
        id: `n-lab-${Date.now()}`,
        title: 'Home Lab Booking Lodged',
        text: `Healthcare coordinator from ${chosenLab.name} will phone you on ${selectedDate} before ${selectedTimeSlot.split(' ')[0]} to retrieve samples.`,
        time: 'Just now',
        unread: true,
        type: 'success'
      });
    }

    // Move to receipt page
    setCurrentStage('confirmation');
  };

  const handleCancelBookingAction = (id: string) => {
    if (window.confirm('Do you want to revoke and cancel this scheduled lab session? All cashless co-pay parameters will be voided.')) {
      const updated = labBookings.map(b => {
        if (b.id === id) {
          return { ...b, status: 'Cancelled' as const };
        }
        return b;
      });
      saveBookings(updated);

      if (onAddNotification) {
        onAddNotification({
          id: `n-cancel-${Date.now()}`,
          title: 'Home Sample Cancelled',
          text: `The collection slot for ${id} has been successfully revoked.`,
          time: 'Just now',
          unread: true,
          type: 'error'
        });
      }
    }
  };

  return (
    <div id="lab-test-booking-container" className="w-full">
      <AnimatePresence mode="wait">

        {/* =========================================================
            STAGE 1: LAB TESTS LISTING
            ========================================================= */}
        {currentStage === 'listing' && (
          <motion.div
            key="listing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Beautiful Diagnostic Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
              <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-6 opacity-10 pointer-events-none">
                <Lucide.TestTubeDiagonal className="w-96 h-96 shrink-0 text-white" />
              </div>
              <div className="relative z-10 max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-200 text-[10px] font-extrabold uppercase tracking-widest">
                  <Lucide.Sparkles className="w-3 h-3 text-amber-400" /> NABL Accredited Diagnostics
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none font-sans">
                  Certified Pathology & Home Diagnostics
                </h1>
                <p className="text-xs md:text-sm text-emerald-150/90 font-medium">
                  Professional certified phlebotomists collect medical blood/urine samples in the high safety comfort of your private home. Instant reports generated in 6-24 hours.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-emerald-100">
                  <span className="bg-emerald-800/40 border border-emerald-700/50 px-2.5 py-1 rounded-lg">✓ Zero Collection Cost</span>
                  <span className="bg-emerald-800/40 border border-emerald-700/50 px-2.5 py-1 rounded-lg">✓ Safe Sealed Smartkits</span>
                  <span className="bg-emerald-800/40 border border-emerald-700/50 px-2.5 py-1 rounded-lg">✓ Cashless Insurance Sync</span>
                </div>
              </div>
            </div>

            {/* Grid for Listings and History quick switch */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Browse Available Tests
                </button>
                <button
                  onClick={() => setCurrentStage('history')}
                  className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Lucide.History className="w-4 h-4 text-emerald-600" /> View Scheduled Specimens ({labBookings.filter(b => b.status === 'Scheduled').length})
                </button>
              </div>

              {/* Verified Badge */}
              <div className="text-[10px] font-bold py-1 px-3 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 rounded-full flex items-center gap-1">
                <Lucide.ShieldCheck className="w-3.5 h-3.5" /> ISO 9001 & CAP Certified Partner Labs Only
              </div>
            </div>

            {/* Quick Filter Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Inputs */}
                <div className="relative flex-1">
                  <Lucide.Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search diagnostic parameters (e.g. CBC, Lipid, HbA1c, Liver, Diabetes, Thyroid...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-905 transition-all text-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-650 rounded-full"
                    >
                      <Lucide.X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Fasting Toggle Switches */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-150 dark:bg-slate-950 p-1.5 rounded-xl shrink-0">
                  {([ 'All', 'Fasting Required', 'Non-Fasting Fine'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFastingFilter(f)}
                      className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                        fastingFilter === f
                          ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      {f === 'All' ? 'Any Diet' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category tabs */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/35'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-slate-850'
                    }`}
                  >
                    {cat === 'All' ? 'All Diagnostics' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Listing Cards Grid */}
            {filteredTests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto">
                <div className="inline-flex p-3 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full">
                  <Lucide.GlassWater className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 dark:text-white text-sm font-sans">No Diagnostic Panels Match Your Terms</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Try clearing the active text filter, choosing &quot;All Diagnostics&quot;, or looking for general fasting properties.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setFastingFilter('All');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => (
                  <div
                    key={test.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition duration-300 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3.5">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 font-extrabold text-[9px] rounded-md uppercase tracking-wider">
                          {test.category}
                        </span>
                        {test.isFastingRequired ? (
                          <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/35 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/35 font-extrabold text-[9px] rounded-md flex items-center gap-0.5 whitespace-nowrap font-mono">
                            <Lucide.GlassWater className="w-3 h-3 shrink-0" /> Fasting Mandatory
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-extrabold text-[9px] rounded-md flex items-center gap-0.5 whitespace-nowrap font-mono">
                            <Lucide.Utensils className="w-3 h-3 shrink-0" /> Fasting Optional
                          </span>
                        )}
                      </div>

                      {/* Header title */}
                      <div className="space-y-1.5">
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-[13.5px] leading-tight pr-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                          {test.name}
                        </h3>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {test.description}
                        </p>
                      </div>

                      {/* Diagnostic details counts */}
                      <div className="mt-4 pt-3 border-t border-slate-105 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Lucide.Binary className="w-3.5 h-3.5 text-slate-400" /> Blood Markers: <strong className="text-slate-850 dark:text-slate-205 text-slate-800 dark:text-white">{test.parametersCount}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Lucide.Clock3 className="w-3.5 h-3.5 text-slate-400" /> Report in: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{test.reportingTime}</strong>
                        </span>
                      </div>

                      {/* Instruction text line highlight */}
                      <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-805 text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <Lucide.Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed line-clamp-2 italic"><strong>Instruction:</strong> {test.instructions}</span>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Home Collection Complete Price</span>
                        <div className="text-right">
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] line-through font-bold font-mono mr-1.5">₹{Math.floor(test.price * 1.5)}</span>
                          <span className="font-black text-slate-800 dark:text-slate-105 text-lg font-mono">
                            ₹{test.price}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewTestDetails(test)}
                          className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-xs font-black transition cursor-pointer"
                        >
                          View Test Details
                        </button>
                        <button
                          onClick={() => handleStartBooking(test)}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer text-center shadow-md shadow-emerald-100/50 flex items-center justify-center gap-1"
                        >
                          Book Home Visit <Lucide.ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================
            STAGE 2: TEST DETAILS SECTION
            ========================================================= */}
        {currentStage === 'details' && selectedTest && (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Back action */}
            <button
              onClick={() => setCurrentStage('listing')}
              className="inline-flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-700 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Lucide.ArrowLeft className="w-4 h-4 text-emerald-600 animate-pulse" /> Back to Test Directory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile/Instructions and preparation guidelines left container */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Medical panel general guidelines card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  
                  <div className="pb-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-350 text-[10px] font-extrabold uppercase tracking-widest rounded-md">
                        {selectedTest.category}
                      </span>
                      {selectedTest.isFastingRequired && (
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/35 text-amber-800 dark:text-amber-400 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                          <Lucide.GlassWater className="w-3.5 h-3.5" /> Overnight Fasting Mandatory
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                      {selectedTest.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedTest.description}
                    </p>
                  </div>

                  {/* Preparation Guidelines Section */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lucide.ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" /> Essential Patient Preparation Guidelines
                    </h4>
                    <div className="p-4 bg-emerald-50/45 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-2xl space-y-2.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Lucide.CalendarHeart className="w-4 h-4 text-emerald-700 to-emerald-400" /> Critical Pre-Collection Instructions:
                      </p>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-medium">
                        {selectedTest.preparationGuidelines}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Dietary note */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-805 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Diet Prerequisites</span>
                        <p className="text-[11.5px] text-slate-650 dark:text-slate-400 leading-relaxed">
                          {selectedTest.isFastingRequired 
                            ? 'Absolutely no caffeine, solids or soft drinks for 10-12 hours prior. Clear plain drinking water is allowed and encouraged.' 
                            : 'Normal light dieting is completely fine. Avoid greasy, saturated fat meals for 4 hours before sample draw.'}
                        </p>
                      </div>

                      {/* Report timeline */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-805 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Report Issuance SLA</span>
                        <p className="text-[11.5px] text-slate-650 dark:text-slate-400 leading-relaxed">
                          NABL verified digital PDF laboratory reports will be dispatched via secure email and uploaded directly into your **Medical Records Locker** in <strong className="text-emerald-700 dark:text-emerald-450 font-bold">{selectedTest.reportingTime}</strong> from sample collection.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Marker params details */}
                  <div className="space-y-3.5 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Biological Parameters Tracked ({selectedTest.parametersCount})</h5>
                    <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl text-center space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        This specialized clinical checkup screens **{selectedTest.parametersCount} specific micro-markers** in human blood/specimen for absolute health fidelity. Includes comprehensive benchmark ranges.
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/35 px-3 py-1 rounded-full">
                        <Lucide.ShieldAlert className="w-3.5 h-3.5" /> High Precision Bio-Reagent Tested
                      </span>
                    </div>
                  </div>

                </div>

                {/* Nearby Partner Labs List (Required feature) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="border-b border-slate-150 dark:border-slate-800 pb-3 flex justify-between items-center bg-white dark:bg-slate-900">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Lucide.Microscope className="w-5 h-5 text-emerald-600 shrink-0" /> Certified Labs Ready Nearby
                    </h3>
                    <span className="text-[9.5px] font-bold text-slate-450 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 px-2 py-0.5 rounded-full">Pre-Approved Claims</span>
                  </div>

                  <div className="space-y-4">
                    {NEARBY_LABS_DATASET.map(lab => (
                      <div key={lab.id} className="p-4 bg-slate-50 dark:bg-slate-955 hover:bg-emerald-50/10 rounded-2xl border border-slate-150 dark:border-slate-805 transition-all flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{lab.name}</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400 text-[8px] font-extrabold uppercase tracking-wider rounded">
                              ✓ NABL Sync
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1 font-sans">
                            <Lucide.MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{lab.address} &#8226; <strong className="text-emerald-700 dark:text-emerald-450 font-bold">{lab.distance}</strong></span>
                          </p>

                          {/* Certification badges */}
                          <div className="pt-2 flex flex-wrap gap-1">
                            {lab.certifications.map((cert, cIdx) => (
                              <span key={cIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] font-bold rounded">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="sm:text-right flex flex-col justify-between shrink-0 space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Lab Rating</span>
                            <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-extrabold bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-lg px-2.5 py-0.5 font-mono">
                              ★ {lab.rating}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold leading-none bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 p-1.5 rounded-md text-center">
                            {lab.slotsAvailable}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Booking and Consultation Checkout Summary on Royal Sidebar */}
              <div className="space-y-6">
                
                {/* Summary box */}
                <div className="bg-gradient-to-br from-white to-emerald-50/10 dark:from-slate-900 dark:to-slate-900/50 rounded-3xl p-6 border border-emerald-200 dark:border-slate-800 shadow-sm space-y-5">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-350 text-[10px] font-extrabold uppercase tracking-widest rounded-md">Order Summary</span>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold">Standard Specimen Panel cost</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">₹{selectedTest.price}</p>
                      <p className="text-[11px] text-slate-450 line-through font-mono">₹{Math.floor(selectedTest.price * 1.5)}</p>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/35 rounded-md p-1.5 mt-2">
                      <Lucide.CheckCircle2 className="w-4 h-4 shrink-0" /> Free Home Phlebotomy Visit
                    </p>
                  </div>

                  {/* Summary lists of inclusions */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-650 dark:text-slate-350">
                      <span className="text-slate-450 dark:text-slate-550 font-bold">Sample Draw Model</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">Vacuum Sealed Vacutainers</span>
                    </div>
                    <div className="flex justify-between text-slate-650 dark:text-slate-350">
                      <span className="text-slate-450 dark:text-slate-550 font-bold">Health Record Lock</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">AES-256 Cloud Sync</span>
                    </div>
                    <div className="flex justify-between text-slate-650 dark:text-slate-350">
                      <span className="text-slate-450 dark:text-slate-550 font-bold">Billing Copay</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">100% Cashless Friendly</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartBooking(selectedTest)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-emerald-105/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lucide.CalendarDays className="w-4.5 h-4.5 shrink-0" /> Reserve Home Collection Visit
                  </button>
                </div>

                {/* Refund & Booking Policies */}
                <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 space-y-3 shadow">
                  <div className="inline-flex p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Lucide.Info className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Home Draw Guidelines</h4>
                  <ul className="text-[10.5px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong className="text-slate-300">Sanitized Kits:</strong> Every specialist opens a virgin sealed Vacutainer kit inside your residence.</li>
                    <li><strong className="text-slate-300">Easy Reschedule:</strong> Modify collection dates free of cost up to 1 hour before scheduled time blocks.</li>
                  </ul>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* =========================================================
            STAGE 3: HOME COLLECTION BOOKING FORM
            ========================================================= */}
        {currentStage === 'booking' && selectedTest && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Step Indicators Header */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500"><Lucide.Check className="w-4 h-4 text-emerald-500 font-bold" /> Panel Selected</span>
              <Lucide.ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="text-emerald-700 dark:text-emerald-450 font-bold flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span> Home Collect Slot & Address</span>
              <Lucide.ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="text-slate-400 dark:text-slate-500">Specimen Ticket</span>
            </div>

            <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Patient details & address inputs left pane */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                    <Lucide.UserCheck className="w-5 h-5 text-emerald-600" /> Phlebotomy Demographics & Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Patient Full Name <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Rohan Sharma"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-905 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    {/* Patient Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Primary Contact Phone <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 91092 38174"
                        value={patientPhone}
                        onChange={e => setPatientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-905 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Age */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Patient Age <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="number"
                        required
                        placeholder="29"
                        value={patientAge}
                        onChange={e => setPatientAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-905 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>

                    {/* Gender select */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Biological Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Male', 'Female', 'Other'].map(gen => (
                          <button
                            key={gen}
                            type="button"
                            onClick={() => setPatientGender(gen as any)}
                            className={`py-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${
                              patientGender === gen
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-extrabold'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
                            }`}
                          >
                            {gen}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complete Physical Mapping Address */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Flat Residence Complex, Landmark & Address <span className="text-rose-500 font-bold">*</span></label>
                      <button
                        type="button"
                        onClick={() => setCollectionAddress('Flat 304, Maplewood Tower, Sector 15-A, Bandra West, Mumbai')}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ⚡ Pre-fill Saved Residence
                      </button>
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Input complete address details for the phlebotomist to easily locate your residence inside Mumbai region..."
                      value={collectionAddress}
                      onChange={e => setCollectionAddress(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-850 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-905 resize-none"
                    />
                  </div>

                  {/* Certified Lab Choice list option toggle */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Select Partner Diagnostic Laboratory</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {NEARBY_LABS_DATASET.map(lab => (
                        <div
                          key={lab.id}
                          onClick={() => setSelectedLabId(lab.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer select-none relative ${
                            selectedLabId === lab.id
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-805 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                        >
                          {selectedLabId === lab.id && (
                            <span className="absolute top-2 right-2 text-emerald-600">
                              <Lucide.CheckCircle2 className="w-4 h-4 fill-emerald-50 dark:fill-emerald-950 hover:bg-white dark:hover:bg-slate-900 rounded-full bg-white dark:bg-slate-900 shrink-0" />
                            </span>
                          )}
                          <p className="font-extrabold text-[11.5px] text-slate-800 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">{lab.name.split(' ')[0]} Diagnostic</p>
                          <p className="text-[9px] text-slate-450 dark:text-slate-400 mt-1">{lab.distance} away</p>
                          <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">{lab.rating} Rating</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special collection triggers */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Special Collector Directives / Medical Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Ring doorbell twice / call prior to entry / patient has fragile veins..."
                      value={specialInstructions}
                      onChange={e => setSpecialInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-905 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                    />
                  </div>

                  {/* Terms check */}
                  <div className="pt-2 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="terms-accepted-checkbox"
                      required
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 dark:border-slate-800 rounded focus:ring-emerald-550 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="terms-accepted-checkbox" className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                      I declare the patient bio-information matches valid national registers, and understand a certified diagnostic collection coordinator is dispatched for the specified slot.
                    </label>
                  </div>
                </div>
              </div>

              {/* Date selection grid and checkout total right sidebar */}
              <div className="space-y-6">
                
                {/* Elegant dynamic Date slot picker */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-202 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/80">
                    <span className="text-xs font-extrabold text-slate-850 dark:text-slate-105 flex items-center gap-1">
                      <Lucide.Calendar className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> Pick Collection Date
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-400">June 2026</span>
                  </div>

                  {/* Active 10 days scroll row */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {activeDays.map(day => {
                      const isActive = selectedDate === day.formatted;
                      return (
                        <button
                          key={day.formatted}
                          type="button"
                          onClick={() => setSelectedDate(day.formatted)}
                          className={`py-2 px-1 text-center rounded-xl transition flex flex-col items-center justify-center relative cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider block leading-none">{day.dayName}</span>
                          <span className="text-sm font-black font-mono block mt-1 leading-none">{day.dayNum}</span>
                          <span className="text-[8px] font-semibold mt-1 opacity-80 block leading-none">{day.monthName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hours block picker */}
                  <div className="space-y-2 pt-2.5 border-t border-slate-50 dark:border-slate-800/80">
                    <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Available Hour Windows</span>
                    
                    <div className="space-y-2">
                      {[
                        '06:00 AM - 08:30 AM (Perfect overnight fasting)',
                        '08:30 AM - 11:00 AM (Morning sample collect)',
                        '11:00 AM - 01:30 PM (Mid-day generic collection)',
                        '02:30 PM - 05:00 PM (Afternoon check)'
                      ].map(hour => {
                        const isChosen = selectedTimeSlot === hour;
                        return (
                          <div
                            key={hour}
                            onClick={() => setSelectedTimeSlot(hour)}
                            className={`p-2.5 rounded-xl border text-[11px] font-mono cursor-pointer transition flex items-center justify-between select-none ${
                              isChosen
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-extrabold'
                                : 'bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-805 text-slate-650 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span>{hour}</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isChosen ? 'bg-emerald-600 border-emerald-600' : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}>
                              {isChosen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Confirm pricing invoice card */}
                <div className="bg-gradient-to-br from-white dark:from-slate-900 to-teal-50/10 dark:to-slate-900/50 rounded-3xl p-5 border border-emerald-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Checkout Breakdown</h4>
                  
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex justify-between items-center text-slate-650 dark:text-slate-350">
                      <span className="text-slate-400 dark:text-slate-500 font-bold">Standard Diagnostic fee</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">₹{selectedTest.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-650 dark:text-slate-350">
                      <span className="text-slate-400 dark:text-slate-500 font-bold">Safe Phlebotomist visit fee</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE / Waived</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-650 dark:text-slate-350 font-sans">
                      <span className="text-slate-400 dark:text-slate-500 font-bold font-sans">NABL report generation SLA</span>
                      <span className="font-mono text-slate-850 dark:text-slate-200 font-bold">Included</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-650 dark:text-slate-350 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-850 dark:text-slate-100 font-black text-sm">Amount Payable</span>
                      <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-base font-sans">₹{selectedTest.price}</span>
                    </div>
                  </div>

                  {selectedTest.isFastingRequired && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-relaxed space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Lucide.Flame className="w-3.5 h-3.5 text-amber-600 animate-bounce" /> Fasting Mandatory Alert
                      </p>
                      <p>You have chosen a test with fasting guidelines. Please do not ingest breakfast, snacks, or milk before {selectedTimeSlot.split(' ')[0]}.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lucide.ShieldAlert className="w-4.5 h-4.5" /> Finalize Collection Booking
                  </button>
                </div>

              </div>

            </form>
          </motion.div>
        )}

        {/* =========================================================
            STAGE 4: BOOKING CONFIRMATION TICKET
            ========================================================= */}
        {currentStage === 'confirmation' && activeReceipt && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 max-w-2xl mx-auto"
          >
            {/* Visual ticket receipt */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
              
              {/* Confirmed checklist head row */}
              <div className="bg-gradient-to-r from-emerald-600 dark:from-emerald-750 to-teal-700 dark:to-teal-900 p-6 sm:p-8 text-white relative text-center space-y-3">
                <div className="inline-flex p-3 bg-white/20 text-white rounded-full mx-auto">
                  <Lucide.CheckCircle2 className="w-12 h-12 text-white shrink-0" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase bg-emerald-800 text-emerald-100 px-3 py-1 rounded-full border border-emerald-700 dark:border-emerald-650">
                    Phlebotomist Scheduled Successfully
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-sans">
                    Specimen Collection Ticket Issued
                  </h2>
                  <p className="text-xs text-emerald-150 font-mono">
                    Unique Booking ID: <strong className="text-white underline">{activeReceipt.id}</strong>
                  </p>
                </div>
              </div>

              {/* Details grid row */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-705 dark:text-slate-300">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnostic Test Details</p>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{activeReceipt.test.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold text-[9px] rounded uppercase">
                      {activeReceipt.test.category}
                    </span>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{activeReceipt.test.description}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Collection Spot Details</p>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 rounded-xl p-3 space-y-2">
                      <p className="font-extrabold text-slate-805 dark:text-slate-200 leading-tight">Patient: {activeReceipt.patientName} ({activeReceipt.patientAge} Years, {activeReceipt.patientGender})</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight flex items-start gap-1 font-mono">
                        <Lucide.MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Address: {activeReceipt.address}</span>
                      </p>
                      <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">Phone: {activeReceipt.patientPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Calendar timing card */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Allocated Time Block</span>
                    <span className="font-black text-slate-800 dark:text-white text-sm flex items-center gap-1 mt-0.5 font-mono">
                      <Lucide.CalendarDays className="w-4.5 h-4.5 text-emerald-600" /> {activeReceipt.date} AT {activeReceipt.time.split(' (')[0]}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-808 dark:text-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest sm:text-right">Fulfillment Partner</span>
                    <span className="text-emerald-700 dark:text-emerald-400 block mt-0.5">{activeReceipt.lab.name}</span>
                  </div>
                </div>

                {/* Fasting warnings and clinical indicators box */}
                {activeReceipt.test.isFastingRequired && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/10 rounded-2xl border border-amber-250 dark:border-amber-900/30 text-xs text-amber-950 dark:text-amber-400 space-y-2">
                    <p className="font-extrabold flex items-center gap-1 text-amber-900 leading-none">
                      <Lucide.Lock className="w-4 h-4 text-amber-700 shrink-0" /> Strict Fasting Required Notification
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 leading-relaxed font-sans font-medium text-slate-700 dark:text-slate-350">
                      <li>Maintain absolute fasting for **10-12 hours** before the diagnostic coordinator arrives at {activeReceipt.time.split(' AT ')[0]}.</li>
                      <li>Plain mineral water is authorized. Refrain from milk, juices, chewing-gum, or standard breakfast routines.</li>
                    </ul>
                  </div>
                )}

                {/* Paid invoice breakdown summary */}
                <div className="border-t border-slate-150 dark:border-slate-800 pt-5 space-y-2.5 text-xs text-slate-750">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cashless Invoice Ledger</p>
                  
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-450 dark:text-slate-500 font-bold">{activeReceipt.test.name}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">₹{activeReceipt.invoiceAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 dark:text-slate-500 font-bold">Certified Home Sanitized Visit</span>
                      <span className="text-emerald-700 dark:text-emerald-450 font-extrabold">₹0 (Waived)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 dark:text-slate-505 font-bold">GST & Diagnostics Surcharge</span>
                      <span className="text-slate-750 dark:text-slate-405 font-bold">₹0</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-150/60 dark:border-slate-800 font-sans font-black text-xs text-slate-800 dark:text-white">
                      <span>Total Amount Discharged (Paid via Cashless Policy)</span>
                      <span className="font-mono text-emerald-800 dark:text-emerald-450 text-sm">₹{activeReceipt.invoiceAmount}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action grid bottom rows */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStage('history')}
                  className="py-2.5 px-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-black transition cursor-pointer text-center"
                >
                  View Scheduled History
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert('Diagnostic receipt downloaded successfully on your device locker!');
                    }}
                    className="py-2.5 px-5 bg-white dark:bg-slate-900 border border-emerald-250 dark:border-emerald-900 text-emerald-700 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Lucide.ArrowDownToLine className="w-4 h-4 shrink-0 text-emerald-600" /> Save PDF Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setCurrentStage('listing');
                    }}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* =========================================================
            STAGE 5: APPOINTMENT/BOOKING HISTORY LEDGER
            ========================================================= */}
        {currentStage === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Back action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={() => setCurrentStage('listing')}
                className="inline-flex items-center gap-1.5 p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-700 border border-slate-200 dark:border-slate-800 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Lucide.ArrowLeft className="w-4 h-4 text-emerald-600" /> Back to Test Directory
              </button>
              
              <div className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold bg-emerald-50/25 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100/40 dark:border-emerald-900/40">
                <Lucide.HardDrive className="w-3.5 h-3.5 text-emerald-600" /> Live HIPAA Specimen Audit Logs Active
              </div>
            </div>

            {/* List box container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lucide.History className="w-5 h-5 text-emerald-600" /> Unified Home Specimen Specimen Ledger
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-[10.5px] mt-0.5 leading-none">Audit active diagnostic collections & historic medical records.</p>
              </div>

              {labBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs italic space-y-3">
                  <p>You have no registered scheduled laboratory specimen appointments.</p>
                  <button
                    onClick={() => setCurrentStage('listing')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
                  >
                    Schedule Home Phlebotomy
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {labBookings.map(book => {
                    const isCan = book.status === 'Cancelled';
                    const isRep = book.status === 'Report Generated';
                    const isSch = book.status === 'Scheduled';
                    return (
                      <div
                        key={book.id}
                        className={`p-4 rounded-2xl border transition duration-200 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center ${
                          isCan
                            ? 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-850 opacity-60'
                            : isRep
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-900/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm">{book.testName}</span>
                            <span className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase tracking-wider ${
                              isCan
                                ? 'bg-rose-105 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                                : isRep
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                            }`}>
                              {book.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <p className="font-semibold text-slate-650 dark:text-slate-350">Patient Full Name: <strong className="text-slate-800 dark:text-slate-200">{book.patientName}</strong> (Age {book.patientAge})</p>
                            <p className="font-medium">Diagnostic Lab Center: {book.labName}</p>
                            <p className="font-sans line-clamp-1 font-medium">Address: {book.address}</p>
                            <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                              <Lucide.Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Date: {book.date} | Hours Block: {book.time}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons on the right side */}
                        <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto items-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800">
                          <div className="text-right mr-3 hidden md:block">
                            <p className="text-[10px] text-slate-405 dark:text-slate-500 uppercase tracking-widest font-bold">Total price</p>
                            <p className="font-mono font-black text-slate-800 dark:text-slate-100">₹{book.testPrice}</p>
                          </div>

                          {isSch && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`The Phlebotomist status from ${book.labName} is pre-assigned. Driver tracking code will emit via SMS 15 minutes before.`);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition"
                              >
                                Track Collector
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelBookingAction(book.id)}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:border-rose-200 dark:hover:border-rose-900 border border-slate-200 dark:border-slate-800 font-bold text-[11px] rounded-lg transition"
                              >
                                Revoke Slot
                              </button>
                            </>
                          )}

                          {isRep && (
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Opening downloaded lab report for booking ID ${book.id}`);
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-lg shadow transition flex items-center gap-1"
                            >
                              <Lucide.ExternalLink className="w-3.5 h-3.5 shrink-0" /> Open Secure Report PDF
                            </button>
                          )}

                          {isCan && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">Slot Revoked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
