import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Declaring Types and Interfaces
export interface InsurancePolicy {
  id: string;
  carrier: string;
  policyName: string;
  policyNumber: string;
  totalCoverage: number;
  remainingBalance: number;
  deductible: number;
  satisfiedDeductible: number;
  copayPercent: number; // e.g. 10 for 10%
  effectiveDate: string;
  expiryDate: string;
  primaryBeneficiary: string;
  cardDesign: 'gold-dark' | 'emerald-dark' | 'indigo-dark' | 'sapphire-flat';
  insuranceCardUrl?: string; // base64 or scanned representation
}

export interface MedicalClaim {
  id: string;
  policyId: string;
  policyName: string;
  carrier: string;
  providerName: string;
  serviceDate: string;
  serviceType: 'Outpatient' | 'Inpatient' | 'Laboratory' | 'Pharmacy' | 'Dental' | 'Wellness';
  diagnosisReason: string;
  amount: number;
  copayAmount: number;
  payoutAmount: number;
  status: 'Submitted' | 'In-Review' | 'Processing' | 'Approved' | 'Rejected';
  signatureName: string;
  billAttachedName?: string;
  timeline: {
    stage: string;
    timestamp: string;
    description: string;
    completed: boolean;
  }[];
}

interface InsuranceManagementModuleProps {
  currentUser?: { name: string; email: string } | null;
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

// Pre-seeded high quality mock data matching Rohan's clinical setup
const INITIAL_POLICIES: InsurancePolicy[] = [
  {
    id: "pol-1",
    carrier: "HealthSaathi Care Corp",
    policyName: "Gold Care Premium",
    policyNumber: "HS-8849-2026-PATI",
    totalCoverage: 500000,
    remainingBalance: 485150,
    deductible: 1500,
    satisfiedDeductible: 1100,
    copayPercent: 10,
    effectiveDate: "2026-01-01",
    expiryDate: "2026-12-31",
    primaryBeneficiary: "Rohan Sharma",
    cardDesign: "emerald-dark"
  },
  {
    id: "pol-2",
    carrier: "Apex Mutual",
    policyName: "Corporate Staff Block Plan",
    policyNumber: "APX-9901-2026-STAFF",
    totalCoverage: 120500,
    remainingBalance: 118228,
    deductible: 500,
    satisfiedDeductible: 500,
    copayPercent: 15,
    effectiveDate: "2026-02-15",
    expiryDate: "2027-02-14",
    primaryBeneficiary: "Rohan Sharma",
    cardDesign: "indigo-dark"
  }
];

const INITIAL_CLAIMS: MedicalClaim[] = [
  {
    id: "clm-1",
    policyId: "pol-1",
    policyName: "Gold Care Premium",
    carrier: "HealthSaathi Care Corp",
    providerName: "Apollo Cardiac Care",
    serviceDate: "2026-05-18",
    serviceType: "Laboratory",
    diagnosisReason: "Tachycardia screening and stress-test echocardiography",
    amount: 1500,
    copayAmount: 150,
    payoutAmount: 1350,
    status: "Approved",
    signatureName: "Rohan Sharma",
    billAttachedName: "Apollo_Cardio_Echo_July_Receipt.pdf",
    timeline: [
      { stage: "Submitted", timestamp: "2026-05-18 10:15 AM", description: "Claim digital files indexed securely", completed: true },
      { stage: "Under Review", timestamp: "2026-05-18 02:45 PM", description: "First-tier clinical triage assessment passed", completed: true },
      { stage: "Medical Assessment", timestamp: "2026-05-19 11:30 AM", description: "Diagnoses mapped to pre-authorization benefits", completed: true },
      { stage: "Disbursement Authorized", timestamp: "2026-05-20 09:12 AM", description: "FHIR cashless processing cleared. Disbursed $1,350.", completed: true }
    ]
  },
  {
    id: "clm-2",
    policyId: "pol-1",
    policyName: "Gold Care Premium",
    carrier: "HealthSaathi Care Corp",
    providerName: "Suburban Pathology Labs",
    serviceDate: "2026-05-10",
    serviceType: "Laboratory",
    diagnosisReason: "Full Lipid lipid profiling & high-sensitivity CRP biochemistry",
    amount: 650,
    copayAmount: 65,
    payoutAmount: 585,
    status: "Approved",
    signatureName: "Rohan Sharma",
    billAttachedName: "Pathology_Biochem_650.pdf",
    timeline: [
      { stage: "Submitted", timestamp: "2026-05-10 09:00 AM", description: "Digital Claim docket filed", completed: true },
      { stage: "Under Review", timestamp: "2026-05-11 11:20 AM", description: "Automatic verification system passed", completed: true },
      { stage: "Disbursement Authorized", timestamp: "2026-05-12 04:55 PM", description: "Approved. Deductibles updated.", completed: true }
    ]
  },
  {
    id: "clm-3",
    policyId: "pol-2",
    policyName: "Corporate Staff Block Plan",
    carrier: "Apex Mutual",
    providerName: "Active-Fit Physiotherapy Clinic",
    serviceDate: "2026-04-20",
    serviceType: "Wellness",
    diagnosisReason: "Therapeutic recovery sessions for lower lumbar muscular strain",
    amount: 320,
    copayAmount: 48,
    payoutAmount: 272,
    status: "Approved",
    signatureName: "Rohan Sharma",
    billAttachedName: "Physio_Invoice_320.pdf",
    timeline: [
      { stage: "Submitted", timestamp: "2026-04-20 11:00 AM", description: "Direct remittance file uploaded", completed: true },
      { stage: "Approved", timestamp: "2026-04-22 01:10 PM", description: "Employer cashless benefits processed", completed: true }
    ]
  },
  {
    id: "clm-4",
    policyId: "pol-1",
    policyName: "Gold Care Premium",
    carrier: "HealthSaathi Care Corp",
    providerName: "Gastro Health Center",
    serviceDate: "2026-05-29",
    serviceType: "Outpatient",
    diagnosisReason: "Stomach ultrasound evaluating right-lower abdominal quadrant tenderness",
    amount: 1100,
    copayAmount: 110,
    payoutAmount: 990,
    status: "In-Review",
    signatureName: "Rohan Sharma",
    billAttachedName: "Gastro_US_Scan_1100.pdf",
    timeline: [
      { stage: "Submitted", timestamp: "2026-05-29 03:40 PM", description: "Claim digital files indexed securely by automated system", completed: true },
      { stage: "Under Review", timestamp: "2026-05-30 10:15 AM", description: "Standard clinical benefit coverage mapping underway", completed: true },
      { stage: "Medical Assessment", timestamp: "--", description: "Awaiting senior clinical billing auditor", completed: false },
      { stage: "Disbursement Authorized", timestamp: "--", description: "Pending approval", completed: false }
    ]
  }
];

export const InsuranceManagementModule: React.FC<InsuranceManagementModuleProps> = ({
  currentUser,
  onAddNotification
}) => {
  // Navigation Tabs for Fintech UI
  // 1. Details/Overview, 2. Add Policy, 3. File Claim, 4. Track Status & History
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'add' | 'claim' | 'track'>('details');

  // Interactive core persistent states
  const [policies, setPolicies] = useState<InsurancePolicy[]>(() => {
    const saved = localStorage.getItem('hs_insurance_policies');
    return saved ? JSON.parse(saved) : INITIAL_POLICIES;
  });

  const [claims, setClaims] = useState<MedicalClaim[]>(() => {
    const saved = localStorage.getItem('hs_insurance_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  // Keep saved local state updated
  useEffect(() => {
    localStorage.setItem('hs_insurance_policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('hs_insurance_claims', JSON.stringify(claims));
  }, [claims]);

  // General active selection states
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(policies[0]?.id || 'pol-1');
  const [selectedTrackClaimId, setSelectedTrackClaimId] = useState<string>(claims[3]?.id || 'clm-4');

  // Form State: Add Policy
  const [addCarrier, setAddCarrier] = useState('');
  const [addPolicyName, setAddPolicyName] = useState('');
  const [addPolicyNumber, setAddPolicyNumber] = useState('');
  const [addTotalCoverage, setAddTotalCoverage] = useState('');
  const [addDeductible, setAddDeductible] = useState('');
  const [addCopayPercent, setAddCopayPercent] = useState('10');
  const [addEffectiveDate, setAddEffectiveDate] = useState('2026-06-01');
  const [addExpiryDate, setAddExpiryDate] = useState('2027-05-31');
  const [addBeneficiary, setAddBeneficiary] = useState(currentUser?.name || 'Rohan Sharma');
  const [addCardDesign, setAddCardDesign] = useState<'gold-dark' | 'emerald-dark' | 'indigo-dark' | 'sapphire-flat'>('gold-dark');
  
  // Custom uploaded state for insurance card files & drag drop
  const [uploadedCardImage, setUploadedCardImage] = useState<string | null>(null);
  const [uploadedCardName, setUploadedCardName] = useState<string | null>(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [ocrScanning, setOcrScanning] = useState(false);

  // Form State: File Claim
  const [claimPolicyId, setClaimPolicyId] = useState(policies[0]?.id || 'pol-1');
  const [claimProvider, setClaimProvider] = useState('');
  const [claimServiceDate, setClaimServiceDate] = useState('2026-05-30');
  const [claimServiceType, setClaimServiceType] = useState<MedicalClaim['serviceType']>('Outpatient');
  const [claimDiagnosis, setClaimDiagnosis] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimSignature, setClaimSignature] = useState('');
  const [claimBillName, setClaimBillName] = useState<string | null>(null);
  const [claimBillDragging, setClaimBillDragging] = useState(false);
  const billFileInputRef = useRef<HTMLInputElement>(null);

  // Find Currently Active Policy details
  const activePolicy = policies.find(p => p.id === selectedPolicyId) || policies[0];

  // OCR simulation for uploaded card scanning
  const handleCardFileChange = (file: File) => {
    setUploadedCardName(file.name);
    setOcrScanning(true);

    // Read file as base64 for mockup preview
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedCardImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate HIPAA compliant AI Smart scanning extraction
    setTimeout(() => {
      setOcrScanning(false);
      
      // Auto-extracting mock details based on typical medical card images
      const carriers = ["Cigna Gold Advantage", "Blue Cross Lifesaver", "UnitedHealthcare Shield", "Aetna Executive Care"];
      const randCarrier = carriers[Math.floor(Math.random() * carriers.length)];
      const randNum = `HS-IC-${Math.floor(Math.random() * 900000 + 100000)}-PATI`;
      
      setAddCarrier(randCarrier);
      setAddPolicyName("OmniShield Specialty Premium");
      setAddPolicyNumber(randNum);
      setAddTotalCoverage("300000");
      setAddDeductible("1000");
      setAddCopayPercent("15");

      if (onAddNotification) {
        onAddNotification({
          id: `ocr-${Date.now()}`,
          title: "AI OCR Card Verification Complete",
          text: `Auto-extracted insurance coordinates: ${randCarrier}, Policy No: ${randNum}. Checked registry status.`,
          time: "Just now",
          unread: true,
          type: "success"
        });
      }
    }, 1500);
  };

  const handleCardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCard(true);
  };

  const handleCardDragLeave = () => {
    setIsDraggingCard(false);
  };

  const handleCardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCard(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCardFileChange(e.dataTransfer.files[0]);
    }
  };

  // Drag-Drop helpers for claims invoice submission
  const handleBillFileChange = (file: File) => {
    setClaimBillName(file.name);
  };

  const handleBillDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setClaimBillDragging(true);
  };

  const handleBillDragLeave = () => {
    setClaimBillDragging(false);
  };

  const handleBillDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setClaimBillDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBillFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit new policy
  const handleAddPolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCarrier || !addPolicyName || !addPolicyNumber || !addTotalCoverage) return;

    const totalCovNum = parseFloat(addTotalCoverage) || 100000;
    const dedNum = parseFloat(addDeductible) || 1000;
    const copayNum = parseInt(addCopayPercent, 10) || 10;

    const newPolicy: InsurancePolicy = {
      id: `pol-${Date.now()}`,
      carrier: addCarrier,
      policyName: addPolicyName,
      policyNumber: addPolicyNumber,
      totalCoverage: totalCovNum,
      remainingBalance: totalCovNum,
      deductible: dedNum,
      satisfiedDeductible: 0,
      copayPercent: copayNum,
      effectiveDate: addEffectiveDate,
      expiryDate: addExpiryDate,
      primaryBeneficiary: addBeneficiary,
      cardDesign: addCardDesign,
      insuranceCardUrl: uploadedCardImage || undefined
    };

    setPolicies(prev => [...prev, newPolicy]);
    setSelectedPolicyId(newPolicy.id);

    // Reset Form Fields
    setAddCarrier('');
    setAddPolicyName('');
    setAddPolicyNumber('');
    setAddTotalCoverage('');
    setAddDeductible('');
    setAddCopayPercent('10');
    setUploadedCardImage(null);
    setUploadedCardName(null);

    // Notify user
    if (onAddNotification) {
      onAddNotification({
        id: `pol-notif-${Date.now()}`,
        title: "Medical Policy Added",
        text: `The "${addPolicyName}" health policy issued by ${addCarrier} has been incorporated into your clinical profile.`,
        time: "Just now",
        unread: true,
        type: "success"
      });
    }

    // Switch view to details to see the new card
    setActiveSubTab('details');
  };

  // Submit Claim Reimbursement Direct Remittance
  const handleFileClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const billingAmt = parseFloat(claimAmount);
    if (isNaN(billingAmt) || billingAmt <= 0 || !claimProvider || !claimDiagnosis) return;

    const selectedPol = policies.find(p => p.id === claimPolicyId) || policies[0];

    // Compute copay and direct payouts
    const calculatedCopay = (billingAmt * selectedPol.copayPercent) / 100;
    const calculatedPayout = billingAmt - calculatedCopay;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date().toISOString().split('T')[0];

    const newClaim: MedicalClaim = {
      id: `clm-${Date.now()}`,
      policyId: claimPolicyId,
      policyName: selectedPol.policyName,
      carrier: selectedPol.carrier,
      providerName: claimProvider,
      serviceDate: claimServiceDate,
      serviceType: claimServiceType,
      diagnosisReason: claimDiagnosis,
      amount: billingAmt,
      copayAmount: calculatedCopay,
      payoutAmount: calculatedPayout,
      status: "Submitted",
      signatureName: claimSignature || currentUser?.name || "Rohan Sharma",
      billAttachedName: claimBillName || "invoice_receipt_digital.pdf",
      timeline: [
        { stage: "Submitted", timestamp: `${formattedDate} ${formattedTime}`, description: "Remittance application filed digitally", completed: true },
        { stage: "Under Review", timestamp: "--", description: "Benefit schedule and diagnosis validation scheduled", completed: false },
        { stage: "Medical Assessment", timestamp: "--", description: "Manual verification by clinical billing specialist", completed: false },
        { stage: "Disbursement Authorized", timestamp: "--", description: "Cashless reimbursement release scheduled", completed: false }
      ]
    };

    setClaims(prev => [newClaim, ...prev]);

    // Update Remaining balance & Deductible satisfy metrics logically inside active policy simulation
    setPolicies(prevPolList => {
      return prevPolList.map(pol => {
        if (pol.id === claimPolicyId) {
          const remainingDiff = Math.max(0, pol.remainingBalance - calculatedPayout);
          // Increase met deductible up to deductible max limit
          const addedDeductible = Math.min(pol.deductible - pol.satisfiedDeductible, billingAmt);
          return {
            ...pol,
            remainingBalance: remainingDiff,
            satisfiedDeductible: pol.satisfiedDeductible + addedDeductible
          };
        }
        return pol;
      });
    });

    setSelectedTrackClaimId(newClaim.id);

    // Reset Claim Form
    setClaimProvider('');
    setClaimDiagnosis('');
    setClaimAmount('');
    setClaimSignature('');
    setClaimBillName(null);

    if (onAddNotification) {
      onAddNotification({
        id: `clm-filed-${Date.now()}`,
        title: "Medical Claim Transmitted",
        text: `Claim for $${billingAmt} submitted under policy "${selectedPol.policyName}". Deductible and balance coordinates updated.`,
        time: "Just now",
        unread: true,
        type: "info"
      });
    }

    // Switch view to track progress
    setActiveSubTab('track');
  };

  // Helper functions for status design styles
  const getStatusStyle = (status: MedicalClaim['status']) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
          text: 'text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-600 text-white',
          icon: Lucide.CheckCircle2,
          stepIndex: 4
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
          text: 'text-rose-700 dark:text-rose-400',
          badge: 'bg-rose-600 text-white',
          icon: Lucide.XCircle,
          stepIndex: 0
        };
      case 'Processing':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40',
          text: 'text-indigo-700 dark:text-indigo-400',
          badge: 'bg-indigo-600 text-white',
          icon: Lucide.Loader2,
          stepIndex: 3
        };
      case 'In-Review':
        return {
          bg: 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
          text: 'text-amber-700 dark:text-amber-400',
          badge: 'bg-amber-600 text-white',
          icon: Lucide.Compass,
          stepIndex: 2
        };
      default: // Submitted
        return {
          bg: 'bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
          text: 'text-blue-700 dark:text-blue-400',
          badge: 'bg-blue-600 text-white',
          icon: Lucide.ArrowUpCircle,
          stepIndex: 1
        };
    }
  };

  // Select Tracker Claim detail
  const trackedClaim = claims.find(c => c.id === selectedTrackClaimId) || claims[0];

  return (
    <div className="space-y-6">
      
      {/* HEADER SUMMARY CONTROLS PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl text-left border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center shadow-lg">
            <Lucide.ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
              Fintech Medical Insurance Ledger <span className="text-[10px] bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">SECURE PORTAL</span>
            </h3>
            <p className="text-xs text-slate-350">Secure cashless policy synchronization, direct automated claims submission, and realtime EOB transparency index.</p>
          </div>
        </div>

        {/* Global Summary Badge Counters */}
        <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
          <div className="text-left font-sans">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Registered Policies</span>
            <span className="text-lg font-black font-mono text-emerald-400">{policies.length}</span>
          </div>
          <div className="text-left font-sans border-l border-slate-800 pl-4">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Total Claim Transmittals</span>
            <span className="text-lg font-black font-mono text-indigo-400">{claims.length}</span>
          </div>
        </div>
      </div>

      {/* FINTECH STYLE PAGE TAB CONTROLLER */}
      <div className="flex bg-slate-105 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 select-none">
        <button
          onClick={() => setActiveSubTab('details')}
          aria-label="Toggle Details Tab"
          className={`flex-1 py-3 text-xs font-black rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'details' ? 'bg-white dark:bg-slate-950 text-slate-905 dark:text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-300'
          }`}
        >
          <Lucide.CreditCard className="w-4 h-4" /> Policy Details
        </button>
        <button
          onClick={() => setActiveSubTab('add')}
          aria-label="Toggle Add Policy Tab"
          className={`flex-1 py-3 text-xs font-black rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'add' ? 'bg-white dark:bg-slate-950 text-slate-905 dark:text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-300'
          }`}
        >
          <Lucide.PlusCircle className="w-4 h-4" /> Add Insurance Policy
        </button>
        <button
          onClick={() => setActiveSubTab('claim')}
          aria-label="Toggle Claims Submission Tab"
          className={`flex-1 py-3 text-xs font-black rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'claim' ? 'bg-white dark:bg-slate-950 text-slate-905 dark:text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-755 dark:hover:text-slate-300'
          }`}
        >
          <Lucide.FileSpreadsheet className="w-4 h-4" /> Claim Insurance
        </button>
        <button
          onClick={() => setActiveSubTab('track')}
          aria-label="Toggle Tracker Tab"
          className={`flex-1 py-3 text-xs font-black rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'track' ? 'bg-white dark:bg-slate-950 text-slate-905 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-755 dark:hover:text-slate-300'
          }`}
        >
          <Lucide.Clock className="w-4 h-4" /> Track Claim Status ({claims.filter(c => c.status === 'In-Review' || c.status === 'Submitted' || c.status === 'Processing').length})
        </button>
      </div>

      {/* CORE PAGES RENDER SWITCH */}
      <div id="insurance-core-pages">
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: POLICY DETAILS & MEMBERSHIP HEALTH CARD */}
          {activeSubTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
            >
              
              {/* Left Column: Interactive Card & Policy Selector (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">
                    Select Membership Policy Card
                  </h4>

                  <div className="space-y-2.5">
                    {policies.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPolicyId(p.id)}
                        className={`p-3.5 border rounded-2xl cursor-pointer transition flex items-center justify-between ${
                          selectedPolicyId === p.id 
                            ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500 ring-2 ring-emerald-50 dark:ring-emerald-950/20' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            p.cardDesign === 'emerald-dark' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                          }`}>
                            <Lucide.ShieldCheck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block leading-tight">{p.policyName}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-none">{p.policyNumber}</span>
                          </div>
                        </div>
                        <Lucide.ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* THE GOLD / EMERALD CO-BRANDED ID CARD */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center shadow-xs">
                  <span className="text-[10.5px] text-slate-400 dark:text-slate-550 font-bold mb-3 self-start">Interactive Virtual Membership Card</span>
                  
                  {/* Health Card Graphic Container */}
                  <div className={`w-full max-w-sm aspect-[1.58/1] rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden text-left border border-white/10 ${
                    activePolicy.cardDesign === 'emerald-dark' 
                      ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950' 
                      : activePolicy.cardDesign === 'indigo-dark'
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-rose-950'
                      : activePolicy.cardDesign === 'gold-dark'
                      ? 'bg-gradient-to-br from-amber-950 via-neutral-900 to-amber-900'
                      : 'bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl'
                  }`}>
                    {/* Background faint geometric accent lines */}
                    <div className="absolute top-0 right-0 p-4 font-mono font-black text-2xl text-white/5 uppercase select-none tracking-widest">
                      PREMIUM SYSTEM
                    </div>
                    
                    {/* Top row */}
                    <div className="flex justify-between items-start z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                          <Lucide.Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs uppercase leading-none text-emerald-400">HealthSaathi</h4>
                          <span className="text-[8px] text-slate-300 uppercase font-mono tracking-widest">{activePolicy.carrier}</span>
                        </div>
                      </div>
                      
                      <span className="text-[8.5px] font-mono font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        CASHLESS SECURE
                      </span>
                    </div>

                    {/* Middle: Policy ID */}
                    <div className="space-y-1.5 z-10">
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Policy Identification Docket</span>
                      <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-[#f8fafc]">{activePolicy.policyNumber}</span>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex justify-between items-end border-t border-slate-800/80 pt-3 z-10">
                      <div>
                        <span className="text-[8px] text-slate-400 block leading-none uppercase">Beneficiary Name</span>
                        <span className="text-xs font-black">{activePolicy.primaryBeneficiary}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block leading-none uppercase">Total Plan Cover</span>
                        <span className="text-xs font-black font-mono text-emerald-400">${activePolicy.totalCoverage.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400 mt-3 font-semibold text-center">
                    🔒 Embedded HL7 / Patient ID Token. Scannable at pre-approved cashless network hospital dockets.
                  </p>
                </div>
              </div>

              {/* Right Column: Detailed Policy Information Benefits Schedule (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      <Lucide.ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-450" /> Policy Benefit Information & Deductibles
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Realtime tracking of satisfying deductibles, remaining cashless cap limits, and coverage definitions.</p>
                  </div>

                  {/* Financial Counters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Remaining Cover Balance Card */}
                    <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 p-4.5 rounded-2xl">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-450 font-bold uppercase tracking-wider block">Remaining Cashless Limit</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-950 dark:text-emerald-200">${activePolicy.remainingBalance.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold">USD</span>
                      </div>
                      <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/50 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                           className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                           style={{ width: `${(activePolicy.remainingBalance / activePolicy.totalCoverage) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        Cover balance resets on plan renewal date.
                      </span>
                    </div>

                    {/* Deductible status tracker Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl">
                      <span className="text-[9px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider block">Satisfied Deductibles Ledger</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl sm:text-2xl font-black font-mono text-slate-855 dark:text-slate-205">${activePolicy.satisfiedDeductible.toLocaleString()}</span>
                        <span className="text-xs text-slate-450">/ ${activePolicy.deductible.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-205 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                           className="bg-slate-700 h-full rounded-full transition-all duration-500"
                           style={{ width: `${(activePolicy.satisfiedDeductible / activePolicy.deductible) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1">
                        ${activePolicy.deductible - activePolicy.satisfiedDeductible} remaining before cashless coverage triggers fully.
                      </span>
                    </div>
                  </div>

                  {/* Summary of limits metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-t border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Beneficiary</span>
                      <span className="font-bold text-slate-750 dark:text-slate-300">{activePolicy.primaryBeneficiary}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Co-pay Schedule</span>
                      <span className="font-bold text-slate-750 dark:text-slate-300">{activePolicy.copayPercent}% Out-of-pocket</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Policy Span</span>
                      <span className="font-bold text-slate-750 dark:text-slate-300 font-mono">{activePolicy.effectiveDate} to {activePolicy.expiryDate}</span>
                    </div>
                  </div>

                  {/* Details Covered treatment types listing */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Schedule of Medical Benefits Covered:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-650 dark:text-slate-300 font-bold">General Consult / Outpatient</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">90% Paid</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-650 dark:text-slate-300 font-bold">Inpatient Treatment Admission</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Cashless Approved</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-650 dark:text-slate-300 font-bold">Laboratory Triage / Diagnostics</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Fully Covered</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs text-slate-650 dark:text-slate-300 font-bold">Prescription Pharmacy Drugs</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">80% Covered</span>
                      </div>
                    </div>
                  </div>

                  {/* Fintech Security advisory info */}
                  <div className="p-3 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-[10.5px] leading-relaxed">
                    ⚙️ <strong>Pre-Authorization Reminder:</strong> Major inpatient surgeries require filing advanced Pre-Authorization requests at least 48 hours prior to service date, except in emergency triage scenario.
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 2: ADD MEDICAL POLICY & UPLOAD CARD */}
          {activeSubTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
            >
                      {/* Left Side Upload Core Card Panel (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Upload card drag and drop */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-center">
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Upload Medical Insurance Card
                    </h4>
                    <p className="text-[10.5px] text-slate-405 dark:text-slate-400 leading-tight">Drag and drop physical insurance card photo here for automated digital OCR scanning extraction.</p>
                  </div>

                  {/* Drag-drop target container */}
                  <div
                    onDragOver={handleCardDragOver}
                    onDragLeave={handleCardDragLeave}
                    onDrop={handleCardDrop}
                    onClick={() => cardFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition min-h-[180px] ${
                      isDraggingCard 
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' 
                        : uploadedCardImage 
                        ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950' 
                        : 'border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    <input
                      type="file"
                      ref={cardFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCardFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept="image/*"
                    />

                    {ocrScanning ? (
                      <div className="space-y-2 flex flex-col items-center">
                        <Lucide.Bot className="w-10 h-10 text-emerald-500 animate-spin" />
                        <span className="text-xs font-black text-slate-705 dark:text-slate-305">OCR Clinical Scanner reading card...</span>
                        <p className="text-[9px] text-slate-400">Extracting Policy ID, Carrier Networks, and Co-Pay schedule.</p>
                      </div>
                    ) : uploadedCardImage ? (
                      <div className="space-y-3 w-full flex flex-col items-center">
                        <Lucide.Image className="w-8 h-8 text-emerald-600 dark:text-emerald-450" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {uploadedCardName || "card_snapshot.jpg"}
                        </p>
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-150 dark:border-emerald-900/40 px-2 py-0.5 rounded font-bold uppercase">
                          AI Parsing Success
                        </span>
                        <img 
                          src={uploadedCardImage} 
                          alt="Scanned membership card preview" 
                          referrerPolicy="no-referrer"
                          className="max-h-24 object-cover rounded-lg border border-slate-205 dark:border-slate-800 mt-1 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedCardImage(null);
                            setUploadedCardName(null);
                          }}
                          className="text-[10px] text-rose-500 font-bold hover:underline"
                        >
                          Remove card photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="w-12 h-12 rounded-full bg-slate-101 dark:bg-slate-900 text-slate-550 flex items-center justify-center mx-auto">
                          <Lucide.UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">Drag & Drop Card Photo or click to browse</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Supports JPEG, PNG up to 5MB size</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedCardImage && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 p-3 rounded-2xl text-[10.5px] text-emerald-955 dark:text-emerald-300 font-medium leading-relaxed text-left">
                      ⚡ <strong>AI OCR Note:</strong> Our cloud parser extracted coordinates for <strong>"{addCarrier || 'extracted provider'}"</strong> network automatically. Check extracted values in the form.
                    </div>
                  )}
                </div>

                {/* Cover theme choices */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Membership Cover Style</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAddCardDesign('emerald-dark')}
                      className={`p-2.5 border rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        addCardDesign === 'emerald-dark' 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-black' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-705 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-emerald-800 inline-block" /> Emerald Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddCardDesign('indigo-dark')}
                      className={`p-2.5 border rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        addCardDesign === 'indigo-dark' 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-850 dark:text-indigo-400 font-black' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-705 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-indigo-800 inline-block" /> Indigo Fusion
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddCardDesign('gold-dark')}
                      className={`p-2.5 border rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        addCardDesign === 'gold-dark' 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-955/40 text-amber-850 dark:text-amber-400 font-black' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-705 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-amber-600 inline-block" /> Classic Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddCardDesign('sapphire-flat')}
                      className={`p-2.5 border rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        addCardDesign === 'sapphire-flat' 
                          ? 'border-slate-400 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-705 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-slate-800 inline-block" /> Steel Slate
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Policy Details Form (lg:col-span-7) */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      <Lucide.PlusCircle className="w-5 h-5 text-indigo-650 dark:text-indigo-400" /> Add Corporate / Private Health Policy
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Provide coverage values, active dates, and deductible structures to configure direct coordinate mapping.</p>
                  </div>

                  <form onSubmit={handleAddPolicySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Insurance Carrier / Issuer</label>
                        <input
                          type="text"
                          required
                          value={addCarrier}
                          onChange={(e) => setAddCarrier(e.target.value)}
                          placeholder="e.g. UnitedHealthcare"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Plan / Policy Name</label>
                        <input
                          type="text"
                          required
                          value={addPolicyName}
                          onChange={(e) => setAddPolicyName(e.target.value)}
                          placeholder="e.g. Elite Choice PPO"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Policy Number (ID)</label>
                        <input
                          type="text"
                          required
                          value={addPolicyNumber}
                          onChange={(e) => setAddPolicyNumber(e.target.value)}
                          placeholder="e.g. HS-1120-PATI"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Primary Beneficiary</label>
                        <input
                          type="text"
                          required
                          value={addBeneficiary}
                          onChange={(e) => setAddBeneficiary(e.target.value)}
                          placeholder="Beneficiary Name"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Health Cover ($)</label>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={addTotalCoverage}
                          onChange={(e) => setAddTotalCoverage(e.target.value)}
                          placeholder="e.g. 250000"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Plan Deductible ($)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={addDeductible}
                          onChange={(e) => setAddDeductible(e.target.value)}
                          placeholder="e.g. 1500"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Co-Pay Rate (%)</label>
                        <select
                          value={addCopayPercent}
                          onChange={(e) => setAddCopayPercent(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        >
                          <option value="0">0% (Absolute Cover)</option>
                          <option value="5">5% Co-pay</option>
                          <option value="10">10% Co-pay</option>
                          <option value="15">15% Co-pay</option>
                          <option value="20">20% Co-pay</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Effective Date</label>
                        <input
                          type="date"
                          value={addEffectiveDate}
                          onChange={(e) => setAddEffectiveDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-sans text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Expiration Date</label>
                        <input
                          type="date"
                          value={addExpiryDate}
                          onChange={(e) => setAddExpiryDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-sans text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-805 dark:bg-slate-800 dark:hover:bg-slate-705 text-white font-black text-xs rounded-xl shadow-lg transition tracking-wide uppercase cursor-pointer"
                      >
                        Register Medical Coverage Policy to Clinical File
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 3: SUBMIT DIRECT CARE CLAIM */}
          {activeSubTab === 'claim' && (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
            >
              
              {/* Left Column Information Checklist (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Cashless Direct Claim filing Instructions
                    </h4>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500">Ensure the following metrics are mapped to authorize rapid payouts.</p>
                  </div>

                  <ul className="space-y-3 text-[11px] text-slate-650 dark:text-slate-300 font-medium">
                    <li className="flex gap-2.5">
                      <Lucide.CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p><strong className="dark:text-slate-100">Provider Legitimacy:</strong> Confirm the primary laboratory, specialist clinic or dentist is inside network directory.</p>
                    </li>
                    <li className="flex gap-2.5">
                      <Lucide.CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p><strong className="dark:text-slate-100">Invoice Uploads:</strong> Attach a clean PDF screenshot scan or photograph of prescription/bill receipts.</p>
                    </li>
                    <li className="flex gap-2.5">
                      <Lucide.CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p><strong className="dark:text-slate-100">Deductible Check:</strong> Claim amount will satisfy remaining deductibles before cashless cover activates.</p>
                    </li>
                  </ul>
                </div>

                {/* Upload Invoice Drag & Drop block */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-center">
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Attach Clinical Invoice PDF/Receipt
                    </h4>
                  </div>

                  {/* Drag drop bill */}
                  <div
                    onDragOver={handleBillDragOver}
                    onDragLeave={handleBillDragLeave}
                    onDrop={handleBillDrop}
                    onClick={() => billFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer min-h-[140px] transition ${
                      claimBillDragging 
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' 
                        : claimBillName 
                        ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950' 
                        : 'border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                    }`}
                  >
                    <input
                      type="file"
                      ref={billFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleBillFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,image/*"
                    />

                    {claimBillName ? (
                      <div className="space-y-2">
                        <Lucide.FileCheck2 className="w-8 h-8 text-indigo-500 mx-auto" />
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 max-w-[220px] truncate mx-auto">
                          {claimBillName}
                        </p>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-80 shadow-xs border border-slate-300 dark:border-slate-700 text-slate-750 dark:text-slate-300 px-2 py-0.5 rounded font-bold font-mono">
                          Ready to upload with claim
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClaimBillName(null);
                          }}
                          className="block text-[10px] text-rose-500 font-bold hover:underline mx-auto mt-2"
                        >
                          Change Invoice document
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
                          <Lucide.FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag & Drop Bill Invoice PDF here</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-550 leading-none">PDF, JPG, or PNG under 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column Claim Submission Form (lg:col-span-7) */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      <Lucide.FileSpreadsheet className="w-5 h-5 text-indigo-650 dark:text-indigo-400" /> Transmit Direct Clinical Reimbursement
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">File expense reports for cardiology tests, medicine purchases, or clinical evaluations safely.</p>
                  </div>

                  <form onSubmit={handleFileClaimSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Select Health policy to claim Against</label>
                        <select
                          value={claimPolicyId}
                          onChange={(e) => setClaimPolicyId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        >
                          {policies.map(p => (
                            <option key={p.id} value={p.id}>{p.policyName} ({p.carrier})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Service Provider / Hospital Clinic</label>
                        <input
                          type="text"
                          required
                          value={claimProvider}
                          onChange={(e) => setClaimProvider(e.target.value)}
                          placeholder="e.g. Apollo Diagnostics"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Date of Medical service</label>
                        <input
                          type="date"
                          required
                          value={claimServiceDate}
                          onChange={(e) => setClaimServiceDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-sans text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Consultation Type Category</label>
                        <select
                          value={claimServiceType}
                          onChange={(e) => setClaimServiceType(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-501"
                        >
                          <option value="Outpatient">Outpatient General Consult</option>
                          <option value="Inpatient">Inpatient Surgery Admission</option>
                          <option value="Laboratory">Laboratory / Diagnostics</option>
                          <option value="Pharmacy">Pharmacy / Medicines</option>
                          <option value="Dental">Dentistry / Teeth checks</option>
                          <option value="Wellness">Therapeutic / Wellness Rehab</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Diagnostic Cost Bill Amount ($)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={claimAmount}
                          onChange={(e) => setClaimAmount(e.target.value)}
                          placeholder="e.g. 850"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Detailed clinical Reason / Medical Diagnosis Codes</label>
                      <textarea
                        required
                        value={claimDiagnosis}
                        onChange={(e) => setClaimDiagnosis(e.target.value)}
                        placeholder="Please specify pathology details, physician observations, or therapeutic indications justifying consultation..."
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-605 focus:outline-none focus:border-indigo-501 min-h-[90px]"
                      />
                    </div>

                    {/* Signature and legal declaration pad simulation */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">Beneficiary Clinical Declarations Signature</span>
                        <p className="text-[9.5px] text-slate-400 dark:text-slate-500">By typing your legal name, you declare all clinical dockets and diagnostic coordinates represent verified events.</p>
                      </div>

                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          required
                          value={claimSignature}
                          onChange={(e) => setClaimSignature(e.target.value)}
                          placeholder="Type 'Rohan Sharma' to authorize remittance"
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold font-serif italic text-slate-850 dark:text-slate-100 tracking-wider focus:outline-none focus:border-indigo-501"
                        />
                        <div className="text-[9px] bg-indigo-50 dark:bg-indigo-955/20 text-indigo-750 dark:text-indigo-400 p-2.5 rounded font-bold font-mono uppercase tracking-wide border border-indigo-100 dark:border-indigo-900/40">
                          Digital HIPAA Signature verified
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1e293b] hover:bg-slate-805 dark:bg-slate-850 dark:hover:bg-slate-750 text-white font-black text-xs rounded-xl tracking-wider uppercase transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lucide.Send className="w-4 h-4 text-teal-400" /> Transmit Claim to Medical Review Board
                    </button>
                  </form>
                </div>
              </div>

            </motion.div>
          )}

          {/* PAGE 4: TRACK CLAIM STATUS & PAST HISTORY LEDGER */}
          {activeSubTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in"
            >
              
              {/* Left Column claims history ledger database ledger (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center justify-between">
                      <span>Historic Claims Ledger</span>
                      <span className="text-[8.5px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/40 text-indigo-805 dark:text-indigo-400 font-bold px-2 py-0.5 rounded font-mono uppercase">
                        {claims.length} Records Total
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500">Select any claim entry to display its live progression timeline.</p>
                  </div>

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {claims.map(c => {
                      const stStyle = getStatusStyle(c.status);
                      const IconComponent = stStyle.icon;
                      
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedTrackClaimId(c.id)}
                          className={`p-3 border.5 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                            selectedTrackClaimId === c.id 
                              ? 'bg-slate-50 dark:bg-slate-950 border-slate-900 dark:border-slate-700 ring-1 ring-slate-900 dark:ring-slate-700' 
                              : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">
                                {c.providerName}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-350 font-bold block bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-1 py-0.2 rounded">
                                {c.serviceType}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">
                              {c.diagnosisReason}
                            </p>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono font-bold block">
                              {c.serviceDate} • <span className="text-slate-800 dark:text-slate-200">${c.amount.toLocaleString()}</span>
                            </span>
                          </div>

                          <span className={`text-[8px] font-mono font-black uppercase text-left px-2 py-0.5 rounded flex items-center gap-1 border ${stStyle.bg}`}>
                            <IconComponent className="w-3.5 h-3.5 shrink-0" />
                            {c.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column details of tracked progress bar (lg:col-span-7) */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Detailed summary card of chosen claim item */}
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[9px] text-[#475569] dark:text-slate-400 font-black uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850 leading-none font-mono tracking-widest">
                        Claim Tracking Reference: {trackedClaim.id}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-slate-850 dark:text-slate-100 mt-1 flex items-center gap-2">
                        {trackedClaim.providerName} <span className="font-sans text-xs text-slate-400 dark:text-slate-500 font-bold">({trackedClaim.policyName})</span>
                      </h3>
                      <p className="text-[10.5px] text-indigo-650 dark:text-indigo-400 font-semibold mb-1">
                        Carrier schedule: {trackedClaim.carrier}
                      </p>
                    </div>

                    <span className={`text-[9.5px] font-mono font-black uppercase px-2.5 py-0.5 rounded border flex items-center gap-1 ${
                      getStatusStyle(trackedClaim.status).bg
                    }`}>
                      {trackedClaim.status}
                    </span>
                  </div>

                  {/* Financial accounting breakdown */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <div>
                      <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block leading-none">Total Invoiced</span>
                      <span className="text-sm font-black font-mono text-slate-850 dark:text-slate-200">${trackedClaim.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block leading-none">Your Co-pay</span>
                      <span className="text-sm font-black font-mono text-rose-700 dark:text-rose-450">${trackedClaim.copayAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-extrabold uppercase block leading-none">Insurance Disburse</span>
                      <span className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-450">${trackedClaim.payoutAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Line Bar Visualizer */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">
                      Progress Audit Timeline
                    </h4>

                    {/* Step Timeline Render */}
                    <div className="relative pl-6 space-y-6 border-l-2 border-slate-150 dark:border-slate-855">
                      {trackedClaim.timeline.map((step, idx) => {
                        const isDone = step.completed;
                        return (
                          <div key={idx} className="relative">
                            
                            {/* Bullet Dot node */}
                            <div className={`absolute -left-[31px] w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold text-[8.5px] ${
                              isDone 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                            }`}>
                              {idx + 1}
                            </div>

                            {/* Details of the audit stage */}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h5 className={`text-xs font-black leading-tight ${isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-550'}`}>
                                  {step.stage}
                                </h5>
                                <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                                  {step.timestamp}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-505 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                                {step.description}
                              </p>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attachment metadata */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Lucide.Paperclip className="w-4 h-4 text-slate-400" />
                      <span>Document: <strong className="text-slate-700 dark:text-slate-200">{trackedClaim.billAttachedName}</strong></span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Explanation of Benefits (EOB) downloadable package generated for reference ID: ${trackedClaim.id}.`);
                      }}
                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                    >
                      Download EOB Receipt <Lucide.Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
