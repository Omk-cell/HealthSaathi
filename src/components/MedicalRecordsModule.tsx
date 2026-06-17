import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type RecordCategory = 'Prescription' | 'Reports' | 'X-Ray' | 'Insurance Documents';
export type EHRTab = 'dashboard' | 'upload' | 'timeline' | 'details';

export interface EHRRecord {
  id: string;
  name: string;
  fileName: string;
  category: RecordCategory;
  date: string;
  doctor: string;
  institution: string;
  size: string;
  notes?: string;
  tags?: string[];
  status?: 'Verified' | 'Pending' | 'Reviewing';
  patientName?: string;
  contentBioValues?: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'Normal' | 'High' | 'Low';
  }>;
  xrayFindings?: string[];
  prescriptionMeds?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  insuranceDetails?: {
    carrier: string;
    policyNumber: string;
    preAuthCode?: string;
    coverageAmount: number;
    status: string;
  };
}

const DEFAULT_EHR_RECORDS: EHRRecord[] = [
  {
    id: 'rec-1',
    name: 'Cardiological Echocardiogram Telemetry Report',
    fileName: 'Cardio_Echo_Telemetry_July.pdf',
    category: 'Reports',
    date: '2026-05-18',
    doctor: 'Dr. Alok Sen',
    institution: 'Apex Cardiovascular Institute, Mumbai',
    size: '2.4 MB',
    patientName: 'Rohan Sharma',
    notes: 'Follow-up telemetry review. Left ventricular ejection fraction (LVEF) calculated at 58% (Normal balance). Minor thickening observed in mitral valve leaflets.',
    tags: ['Echocardiogram', 'Cardiology', 'Telemetry'],
    status: 'Verified',
    contentBioValues: [
      { parameter: 'Ejection Fraction (LVEF)', value: '58', unit: '%', referenceRange: '55 - 70', status: 'Normal' },
      { parameter: 'Left Atrium Diameter', value: '3.9', unit: 'cm', referenceRange: '3.0 - 4.0', status: 'Normal' },
      { parameter: 'Systolic Blood Pressure', value: '118', unit: 'mmHg', referenceRange: '90 - 120', status: 'Normal' },
      { parameter: 'Diastolic Blood Pressure', value: '78', unit: 'mmHg', referenceRange: '60 - 80', status: 'Normal' },
      { parameter: 'Resting Pulse Rate', value: '72', unit: 'bpm', referenceRange: '60 - 100', status: 'Normal' }
    ]
  },
  {
    id: 'rec-2',
    name: 'Standard Complete Blood Count (CBC) Panel',
    fileName: 'Full_CBC_Haemogram_Specs.pdf',
    category: 'Reports',
    date: '2026-05-10',
    doctor: 'Dr. Meera Vasudevan',
    institution: 'Rainbow Diagnostics Hub, Bandra West',
    size: '1.1 MB',
    patientName: 'Rohan Sharma',
    notes: 'Hemoglobin levels are well balanced. Moderate elevation in eosinophils probably connected back to mild dust mite seasonal allergy.',
    tags: ['Blood Panel', 'CBC', 'Pathology'],
    status: 'Verified',
    contentBioValues: [
      { parameter: 'Hemoglobin (Hb)', value: '14.8', unit: 'g/dL', referenceRange: '13.5 - 17.5', status: 'Normal' },
      { parameter: 'Total White Blood Cells (WBC)', value: '6200', unit: '/cu mm', referenceRange: '4000 - 11000', status: 'Normal' },
      { parameter: 'Red Blood Cells (RBC)', value: '5.1', unit: 'million/uL', referenceRange: '4.5 - 5.9', status: 'Normal' },
      { parameter: 'Platelet Count', value: '280000', unit: '/uL', referenceRange: '150000 - 450000', status: 'Normal' },
      { parameter: 'Eosinophils Fraction', value: '6.4', unit: '%', referenceRange: '1.0 - 6.0', status: 'High' }
    ]
  },
  {
    id: 'rec-3',
    name: 'Post-Op Chronic Gastritis Care & Medication Prescription',
    fileName: 'Rx_Chronic_Gastritis_Care.pdf',
    category: 'Prescription',
    date: '2026-05-02',
    doctor: 'Dr. Meera Vasudevan',
    institution: 'Bandra Wellness Clinic, Mumbai',
    size: '420 KB',
    patientName: 'Rohan Sharma',
    notes: 'Instructed patient to complete full course of medication. High-fiber dietary requirements issued. Review clinical progress in 14 days.',
    tags: ['Prescription', 'Bandra Clinic', 'Gastric'],
    status: 'Verified',
    prescriptionMeds: [
      { name: 'Pantoprazole 40mg (Gastro-resistant)', dosage: '1 Capsule', frequency: 'Once daily (Empty stomach)', duration: '14 Days' },
      { name: 'Acotiamide 100mg Extended Release', dosage: '1 Tablet', frequency: 'Twice daily (Before meals)', duration: '10 Days' },
      { name: 'Multivitamin Complete Formula', dosage: '1 Softgel', frequency: 'Once daily (Post dinner)', duration: '30 Days' }
    ]
  },
  {
    id: 'rec-4',
    name: 'High-Resolution Chest Radiograph (X-Ray Study)',
    fileName: 'Bandra_Radiology_Chest_XRay.pdf',
    category: 'X-Ray',
    date: '2026-04-20',
    doctor: 'Dr. Vivek Malhotra',
    institution: 'City Scan and Imaging Center, Andheri East',
    size: '4.8 MB',
    patientName: 'Rohan Sharma',
    notes: 'No active lung parenchymal infiltrates or consolidation observed. Cardiothoracic ratio is normal. Both costophrenic angles are sharp.',
    tags: ['Chest X-Ray', 'Radiology', 'Lungs'],
    status: 'Verified',
    xrayFindings: [
      'Bony thorax and surrounding soft tissue structures appear intact.',
      'No pleural effusion or active focal airspace consolidation.',
      'Trachea is midline and cardiac contours are within physiological parameters.',
      'Diagphragm outlines appear crisp and normal.'
    ]
  },
  {
    id: 'rec-5',
    name: 'Cashless Pre-Authorization Cover & Claim Settlement Certificate',
    fileName: 'HealthSaathi_Gold_Elite_PreAuth.pdf',
    category: 'Insurance Documents',
    date: '2026-04-12',
    doctor: 'HealthSaathi TPA Auditor',
    institution: 'HealthSaathi Insurance Co. Ltd.',
    size: '1.5 MB',
    patientName: 'Rohan Sharma',
    notes: 'Pre-authorized claim approval certificate issued under policy HS-G-809231. Co-payment liability is 0% (Fully cashless for approved diagnostic categories).',
    tags: ['Insurance', 'Pre-Auth', 'Co-Pay Certificate'],
    status: 'Verified',
    insuranceDetails: {
      carrier: 'HealthSaathi Alliance Gold Elite',
      policyNumber: 'HS-G-809231',
      preAuthCode: 'AUTH-2026-X88012',
      coverageAmount: 18500,
      status: 'Settled & Paid-Out'
    }
  }
];

interface MedicalRecordsModuleProps {
  onAddRecordNotification?: (notif: any) => void;
  overrideRecords?: EHRRecord[];
  onRecordsChange?: (records: EHRRecord[]) => void;
}

export const MedicalRecordsModule: React.FC<MedicalRecordsModuleProps> = ({
  onAddRecordNotification,
  overrideRecords,
  onRecordsChange
}) => {
  // State: Medical Records list
  const [localRecords, setLocalRecords] = useState<EHRRecord[]>(() => {
    const saved = localStorage.getItem('hs_ehr_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_EHR_RECORDS;
      }
    }
    return DEFAULT_EHR_RECORDS;
  });

  // Sync back to local storage and parent component callbacks
  const saveRecords = (newRecs: EHRRecord[]) => {
    setLocalRecords(newRecs);
    localStorage.setItem('hs_ehr_records', JSON.stringify(newRecs));
    if (onRecordsChange) {
      onRecordsChange(newRecs);
    }
  };

  useEffect(() => {
    if (overrideRecords && overrideRecords.length > 0) {
      setLocalRecords(overrideRecords);
    }
  }, [overrideRecords]);

  // View Controller States
  const [activeSubTab, setActiveSubTab] = useState<EHRTab>('dashboard');
  const [selectedRecord, setSelectedRecord] = useState<EHRRecord | null>(null);

  // Filters & Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Document Upload State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<RecordCategory>('Prescription');
  const [uploadDoctor, setUploadDoctor] = useState('');
  const [uploadInstitution, setUploadInstitution] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // PDF Preview State
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRotated, setPreviewRotated] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isCopiedText, setIsCopiedText] = useState(false);

  // File system input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics Calculation
  const stats = {
    total: localRecords.length,
    prescriptions: localRecords.filter(r => r.category === 'Prescription').length,
    reports: localRecords.filter(r => r.category === 'Reports').length,
    xrays: localRecords.filter(r => r.category === 'X-Ray').length,
    insurance: localRecords.filter(r => r.category === 'Insurance Documents').length,
  };

  // Drag and Drop helpers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileObj(file);
      if (!uploadTitle) {
        // Autopopulate friendly title
        const niceName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ") // replace dashes with spaces
          .slice(0, 50);
        setUploadTitle(niceName);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileObj(file);
      if (!uploadTitle) {
        const niceName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .slice(0, 50);
        setUploadTitle(niceName);
      }
    }
  };

  // Submit Uploader logic
  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setUploadSuccessMsg('');
    setUploadProgress(10);

    // Simulate clinical encryption transmission progress
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    setTimeout(() => {
      setUploadProgress(null);
      // Generate real medical metadata representation
      const fileExt = selectedFileObj ? selectedFileObj.name.split('.').pop() : 'pdf';
      const cleanFileName = (uploadTitle.trim().replace(/\s+/g, '_') + '.' + fileExt).toLowerCase();
      const randomId = 'rec-' + Math.floor(1000 + Math.random() * 9000);
      const todayDate = new Date().toISOString().split('T')[0];

      // Simulate parsing some structured values for high professional realism
      let mockBioValues: any[] | undefined = undefined;
      let mockPrescriptionMeds: any[] | undefined = undefined;
      let mockXrays: string[] | undefined = undefined;

      if (uploadCategory === 'Reports') {
        mockBioValues = [
          { parameter: 'Reference Checkup Parameter', value: '98', unit: 'Index', referenceRange: '80 - 120', status: 'Normal' },
          { parameter: 'Reactive Core Antigen', value: 'Negative', unit: '-', referenceRange: 'Negative', status: 'Normal' }
        ];
      } else if (uploadCategory === 'Prescription') {
        mockPrescriptionMeds = [
          { name: 'Prescribed Care Medicine 500mg', dosage: '1 Pill', frequency: 'Twice Daily', duration: '5 Days' }
        ];
      } else if (uploadCategory === 'X-Ray') {
        mockXrays = [
          'No significant acute pathological abnormalities identified.',
          'Intact anatomical layout throughout target segment.'
        ];
      }

      const newRecord: EHRRecord = {
        id: randomId,
        name: uploadTitle.trim(),
        fileName: cleanFileName,
        category: uploadCategory,
        date: todayDate,
        doctor: uploadDoctor.trim() || 'Dr. Self Uploaded',
        institution: uploadInstitution.trim() || 'Patient Digitized Home Registry',
        size: selectedFileObj ? `${(selectedFileObj.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
        notes: uploadNotes.trim() || 'Digital copy uploaded securely in personal patient encrypted terminal locker.',
        tags: [uploadCategory, 'Patient Record', todayDate.split('-')[0]],
        status: 'Verified',
        contentBioValues: mockBioValues,
        prescriptionMeds: mockPrescriptionMeds,
        xrayFindings: mockXrays
      };

      const updated = [newRecord, ...localRecords];
      saveRecords(updated);

      // Trigger notification callbacks
      if (onAddRecordNotification) {
        onAddRecordNotification({
          id: `n-ehr-${Date.now()}`,
          title: 'EHR Cloud Synchronized',
          text: `Document "${uploadTitle.trim()}" is now fully encrypted & synchronized to HIPAA storage ledger.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }

      // Reset state variables
      setUploadTitle('');
      setUploadDoctor('');
      setUploadInstitution('');
      setUploadNotes('');
      setSelectedFileObj(null);
      setUploadSuccessMsg('Success! Secure medical report encrypted & uploaded and synchronized successfully to your Health Locker.');

      // Automatically redirect to newly added record's details
      setTimeout(() => {
        setSelectedRecord(newRecord);
        setActiveSubTab('details');
        setUploadSuccessMsg('');
      }, 1000);

    }, 1100);
  };

  // Simulated Professional File Download handler
  const handleDownloadRecordFile = (record: EHRRecord) => {
    setDownloadingId(record.id);

    // Provide visual download animation cues
    setTimeout(() => {
      setDownloadingId(null);

      // Trigger standard local mock file text downloader to actually trigger real browser window triggers!
      const mockMetaFile = `HEALTHSAATHI HIPAA HIGH-SECURITY PATIENT DATA LOCKER\n` +
        `============================================================\n` +
        `Document ID: ${record.id}\n` +
        `Document Name: ${record.name}\n` +
        `Clinical Category: ${record.category}\n` +
        `Sourced Date: ${record.date}\n` +
        `Physician / Care Sign-off: ${record.doctor}\n` +
        `Source Medical Institution: ${record.institution}\n` +
        `Encryption Standard: AES-256 Cloud Cryptographic Ledger\n` +
        `Medical Notes: ${record.notes || "None Entered"}\n` +
        `============================================================\n` +
        `THIS FILE IS CLINICALLY SYNCED IN DECRYPTED PATIENT PORTABLE FORMAT`;

      const blob = new Blob([mockMetaFile], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.fileName + '.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onAddRecordNotification) {
        onAddRecordNotification({
          id: `n-dl-${Date.now()}`,
          title: 'Digital Specimen Downloaded',
          text: `Retrieved decrypted portable offline text docket copy for ${record.fileName}.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    }, 1200);
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedText(true);
    setTimeout(() => setIsCopiedText(false), 2000);
  };

  // Advanced Filtering Sequence
  const filteredAndSortedRecords = localRecords
    .filter(rec => {
      const text = searchQuery.toLowerCase();
      const matchesSearch =
        rec.name.toLowerCase().includes(text) ||
        rec.doctor.toLowerCase().includes(text) ||
        rec.institution.toLowerCase().includes(text) ||
        (rec.notes && rec.notes.toLowerCase().includes(text));

      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div id="ehr-module-wrapper" className="space-y-6">

      {/* Main EHR Section Header Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/10">
            <Lucide.FolderLock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">Electronic Health Records</h2>
              <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                HIPAA / Secure Locker
              </span>
            </div>
            <p className="text-[11.5px] text-slate-400">
              Manage, upload, search and preview verified diagnostic medical records instantly in a high-security container.
            </p>
          </div>
        </div>

        {/* Tab Selection Chassis */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-start sm:self-center">
          <button
            onClick={() => { setActiveSubTab('dashboard'); setSelectedRecord(null); }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lucide.LayoutGrid className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => { setActiveSubTab('upload'); setSelectedRecord(null); }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lucide.UploadCloud className="w-3.5 h-3.5" /> Upload File
          </button>
          <button
            onClick={() => { setActiveSubTab('timeline'); setSelectedRecord(null); }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lucide.CalendarClock className="w-3.5 h-3.5" /> Timeline View
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ========================================================
            TAB 1: RECORDS DASHBOARD VIEW
            ======================================================== */}
        {activeSubTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Elegant statistics cards layout */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Vault Files</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">{stats.total}</span>
                <div className="inline-flex py-1 px-2.5 rounded-full bg-slate-50 dark:bg-slate-950 text-[9px] font-bold text-slate-500 dark:text-slate-400">Fully Encrypted</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prescriptions</span>
                <span className="text-2xl font-black text-blue-600 font-mono">{stats.prescriptions}</span>
                <div className="inline-flex py-1 px-2.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[9px] font-bold text-blue-600 dark:text-blue-400">Medication Rx</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostics Reports</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">{stats.reports}</span>
                <div className="inline-flex py-1 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Blood / Panels</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">X-Rays & Imaging</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">{stats.xrays}</span>
                <div className="inline-flex py-1 px-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">Radiology Studies</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-sm col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Insurance PreAuths</span>
                <span className="text-2xl font-black text-amber-600 font-mono">{stats.insurance}</span>
                <div className="inline-flex py-1 px-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[9px] font-bold text-amber-600 dark:text-amber-400">Billing Policies</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-r from-blue-500/10 to-transparent rounded-2xl p-4.5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Lucide.Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                  Want to synchronize a diagnostic record? Drop files directly into the HIPAA uploader or browse details for high precision PDF rendering.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('upload')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition self-stretch md:self-auto text-center"
              >
                + Drag & Register Medical File
              </button>
            </div>

            {/* Main Filters & Search and list Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                
                {/* Search query box */}
                <div className="relative flex-1">
                  <Lucide.Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search documents by clinically logged name, doctor name, clinic or symptoms..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
                      <Lucide.X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sorting choices dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-extrabold text-slate-705 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
                  >
                    <option value="newest" className="dark:bg-slate-950">Newest Scans First</option>
                    <option value="oldest" className="dark:bg-slate-950">Historical Reports First</option>
                    <option value="name" className="dark:bg-slate-950">Alpabethical Order A-Z</option>
                  </select>
                </div>
              </div>

              {/* Main Category Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Prescription', 'Reports', 'X-Ray', 'Insurance Documents'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      selectedCategory === cat
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-805 text-slate-500 dark:text-slate-404 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat === 'All' ? 'All Records Locker' : cat}
                  </button>
                ))}
              </div>

              {/* Main Document Listing Stream */}
              {filteredAndSortedRecords.length === 0 ? (
                <div className="p-12 text-center max-w-sm mx-auto space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-full inline-flex text-slate-400 border border-slate-100 dark:border-slate-800">
                    <Lucide.FolderOpen className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-850 dark:text-white text-sm">No Medical Vault Files Match</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
                      Try resetting your searching filters or choosing "All Records Locker" categories above.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedRecords.map(record => {
                    // Category icon logic
                    let cardIcon = <Lucide.FileText className="w-6 h-6 shrink-0" />;
                    let iconBg = 'bg-emerald-50 text-emerald-600';
                    if (record.category === 'Prescription') {
                      cardIcon = <Lucide.Pill className="w-6 h-6 shrink-0" />;
                      iconBg = 'bg-blue-50 text-blue-600';
                    } else if (record.category === 'X-Ray') {
                      cardIcon = <Lucide.ScanFace className="w-6 h-6 shrink-0" />;
                      iconBg = 'bg-indigo-50 text-indigo-600';
                    } else if (record.category === 'Insurance Documents') {
                      cardIcon = <Lucide.ShieldCheck className="w-6 h-6 shrink-0" />;
                      iconBg = 'bg-amber-50 text-amber-600';
                    }

                    return (
                      <div
                        key={record.id}
                        className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* File header badges */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                              {record.category}
                            </span>
                            <span className="px-2 py-0.5 text-[8.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-md flex items-center gap-0.5 border border-emerald-100/10">
                              <Lucide.ShieldCheck className="w-3.5 h-3.5" /> Checked
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-xs sm:text-[13px] leading-tight line-clamp-1">
                              {record.name}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <span>{record.date}</span> &#8226; <span>{record.size}</span>
                            </p>
                          </div>

                          {/* Quick details snippet */}
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 min-h-[64px] flex flex-col justify-center">
                            {record.category === 'Prescription' && record.prescriptionMeds ? (
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Active Medications ({record.prescriptionMeds.length}):</strong>
                                {record.prescriptionMeds[0]?.name}, {record.prescriptionMeds[1]?.name || 'Routine Formula'}...
                              </p>
                            ) : record.category === 'Reports' && record.contentBioValues ? (
                               <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Tracked Bio-Variables ({record.contentBioValues.length}):</strong>
                                {record.contentBioValues[0]?.parameter}, {record.contentBioValues[1]?.parameter}...
                              </p>
                            ) : (
                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                &ldquo;{record.notes}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Physician sign off details */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                            <div className="p-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-500">
                              <Lucide.User className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">Authored: <strong>{record.doctor}</strong></span>
                          </div>
                        </div>

                        {/* Interactive trigger controls */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                          <button
                            onClick={() => { setSelectedRecord(record); setActiveSubTab('details'); }}
                            className="py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-black tracking-tight transition cursor-pointer text-center"
                          >
                            PDF View & Detail
                          </button>
                          <button
                            onClick={() => handleDownloadRecordFile(record)}
                            disabled={downloadingId === record.id}
                            className={`py-2 text-[11px] font-black tracking-tight rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border ${
                              downloadingId === record.id
                                ? 'bg-slate-50 dark:bg-slate-900 text-slate-350 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed'
                                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-150 dark:border-blue-900/50'
                            }`}
                          >
                            {downloadingId === record.id ? (
                              <>
                                <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> Sycing...
                              </>
                            ) : (
                              <>
                                <Lucide.Download className="w-3.5 h-3.5" /> Download
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 2: UPLOAD & REGISTER NEW DOCUMENTS
            ======================================================== */}
        {activeSubTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <Lucide.FolderLock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Secure HIPAA Document Encryptor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmit clinical prescriptions, laboratory blood sheets, or X-ray imaging files safely to your decentralized health records vault.
                </p>
              </div>

              {uploadSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-850 rounded-2xl flex items-start gap-2.5 inline-block text-emerald-800 dark:text-emerald-400 text-xs font-bold leading-relaxed shadow-sm">
                  <Lucide.CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Secure Drag and Drop file selection area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99] shadow-inner'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:border-blue-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,image/*,.doc,.docx"
                  className="hidden"
                />

                <div className="max-w-md mx-auto space-y-3 text-center">
                  <div className="inline-flex p-4 bg-blue-50/80 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-450 border border-blue-100/50 dark:border-blue-900/50 shadow-sm">
                    {selectedFileObj ? (
                      <Lucide.FileCheck className="w-10 h-10 animate-bounce" />
                    ) : (
                      <Lucide.CloudUpload className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>

                  {selectedFileObj ? (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-805 dark:text-white">
                        File selected: &quot;{selectedFileObj.name}&quot;
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Size: {(selectedFileObj.size / (1024 * 1024)).toFixed(2)} MB &#8226; Tap to swap another file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Drag & Drop document files here or click to browse
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                        Supports high-definition PDF scans, medical JPG/PNG radiographs, or doc formats up to 25MB maximum threshold.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Meta details form */}
              <form onSubmit={handleRecordSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category select block */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Select HIPAA Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'Prescription', icon: Lucide.Pill, label: 'Prescription' },
                        { id: 'Reports', icon: Lucide.FileText, label: 'Diagnostic' },
                        { id: 'X-Ray', icon: Lucide.ScanFace, label: 'X-Ray / Scan' },
                        { id: 'Insurance Documents', icon: Lucide.ShieldCheck, label: 'Insurance' }
                      ] as const).map(catOpt => (
                        <button
                          key={catOpt.id}
                          type="button"
                          onClick={() => setUploadCategory(catOpt.id)}
                          className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                            uploadCategory === catOpt.id
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-900 text-blue-700 dark:text-blue-400 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-805 text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <catOpt.icon className={`w-5 h-5 shrink-0 ${uploadCategory === catOpt.id ? 'text-blue-600 dark:text-blue-450' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold leading-tight">{catOpt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title of Document input */}
                  <div className="space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Clinical Record Document Title <span className="text-rose-500 font-bold">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hematology Hemogram Blood Panel Screen"
                        value={uploadTitle}
                        onChange={e => setUploadTitle(e.target.value)}
                        className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-808 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/20 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 italic">
                      <Lucide.Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>The title helps you easily search and locate records on the health timeline.</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor name input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Authored Physician Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Meera Vasudevan"
                      value={uploadDoctor}
                      onChange={e => setUploadDoctor(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Sourcing Institution input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Sourcing Medical Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. Bandra Wellness Clinic"
                      value={uploadInstitution}
                      onChange={e => setUploadInstitution(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-808 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Additional Clinical Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Additional Patient Notes / Diagnosis Details</label>
                  <textarea
                    rows={3}
                    placeholder="Input detailed prescriptions guidelines, critical warnings issues by the physician, or symptoms noted..."
                    value={uploadNotes}
                    onChange={e => setUploadNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-808 rounded-2xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 resize-none"
                  />
                </div>

                {/* Progress Indicators bar */}
                {uploadProgress !== null && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Lucide.Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" /> High-security encryption transmission in-progress...
                      </span>
                      <span className="font-mono">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all rounded" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Confirm transmit controls */}
                <button
                  type="submit"
                  disabled={uploadProgress !== null}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-350 dark:disabled:text-slate-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-100/50 transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Lucide.HardDriveUpload className="w-4.5 h-4.5 shrink-0" /> Safely Transmit & Guard Document
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 3: TIMELINE VIEW CHRONOLOGICAL STREAM
            ======================================================== */}
        {activeSubTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <Lucide.CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Chronological Care Timeline
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    A clinical sequence of all medical contacts, diagnostic trials, and prescription records.
                  </p>
                </div>
                <span className="text-[10px] font-bold py-1 px-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-707 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50 rounded-full font-mono">
                  {localRecords.length} Milestones
                </span>
              </div>

              {/* Sequential timeline branch */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-150 dark:before:bg-slate-850">
                {localRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, index) => {
                    // Match visual styles
                    let itemColor = 'bg-blue-600 border-blue-1050 text-white';
                    if (record.category === 'Reports') itemColor = 'bg-emerald-600 text-white';
                    else if (record.category === 'X-Ray') itemColor = 'bg-indigo-600 text-white';
                    else if (record.category === 'Insurance Documents') itemColor = 'bg-amber-600 text-white';

                    return (
                      <div key={record.id} className="relative group space-y-2">
                        {/* Bullet point nodes */}
                        <div className={`absolute -left-10 sm:-left-12 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full border-4 border-white dark:border-slate-900 ${itemColor} flex items-center justify-center shadow-sm font-mono text-[9px] font-extrabold`}>
                          {localRecords.length - index}
                        </div>

                        {/* Date badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md font-mono">
                            {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                            &#8226; {record.category}
                          </span>
                        </div>

                        {/* Summary Container Box */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 group-hover:bg-blue-50/10 dark:group-hover:bg-blue-950/10 group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-all space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-xs sm:text-[13px] leading-tight">
                                {record.name}
                              </h4>
                              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                                Verified by <strong>{record.doctor}</strong> at {record.institution}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic shrink-0">
                              {record.size}
                            </span>
                          </div>

                          {/* Detail Note summary excerpt */}
                          {record.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-200 dark:border-slate-800 italic font-medium">
                              &ldquo;{record.notes}&rdquo;
                            </p>
                          )}

                          {/* Secondary tag chips */}
                          {record.tags && record.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {record.tags.map(t => (
                                <span key={t} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 font-bold text-[9px] rounded-md font-mono">
                                  #{t.replace(/\s+/g, '')}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Fast Navigation to Details page */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedRecord(record); setActiveSubTab('details'); }}
                              className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                            >
                              Open Clinical PDF Sheet <Lucide.ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          </motion.div>
        )}

        {/* ========================================================
            TAB 4: MEDICAL RECORD DETAILS (PDF PREVIEW & METADATA)
            ======================================================== */}
        {activeSubTab === 'details' && selectedRecord && (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Upper Action row */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => { setActiveSubTab('dashboard'); setSelectedRecord(null); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black transition-all shadow-sm"
              >
                <Lucide.ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" /> Back to Vault Directory
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadRecordFile(selectedRecord)}
                  disabled={downloadingId === selectedRecord.id}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-350 dark:disabled:text-slate-600 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {downloadingId === selectedRecord.id ? (
                    <>
                      <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> Synchronizing...
                    </>
                  ) : (
                    <>
                      <Lucide.Download className="w-4 h-4" /> Download Decrypted Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split Grid between document parameters details and simulated PDF preview sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left pane: Clinical details parameters (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Meta details docket card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-150 dark:border-blue-900 text-blue-700 dark:text-blue-400">
                    Clinical Document Dossier
                  </span>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Patient Lock Name</p>
                    <p className="text-base font-black text-slate-850 dark:text-white leading-tight">
                      {selectedRecord.patientName || 'Rohan Sharma'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1.5">
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Authored Date</span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{selectedRecord.date}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-405 dark:text-slate-400 uppercase tracking-wider font-mono">Document Volume</span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{selectedRecord.size}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Prescribing Physician</span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Lucide.UserCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> {selectedRecord.doctor}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Registered Institution</span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Lucide.MapPin className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" /> {selectedRecord.institution}
                      </p>
                    </div>
                  </div>

                  {/* Care tags metadata chips */}
                  {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9.5px] font-bold text-slate-401 dark:text-slate-400 uppercase tracking-wider font-mono block">Taxonomy Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRecord.tags.map(t => (
                          <span key={t} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-808 text-slate-550 dark:text-slate-400 rounded-lg">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Patient notes diagnostic guidelines card */}
                {selectedRecord.notes && (
                  <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 space-y-3 shadow-md border border-slate-800">
                    <div className="flex justify-between items-center bg-transparent">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Lucide.Sparkles className="w-4.5 h-4.5 text-blue-400" /> Clinical Diagnosis Notes
                      </h4>
                      <button
                        onClick={() => handleCopySummary(selectedRecord.notes || '')}
                        className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                      >
                        {isCopiedText ? 'Copied ✓' : 'Copy Text'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic pr-1">
                      &ldquo;{selectedRecord.notes}&rdquo;
                    </p>
                  </div>
                )}

                {/* HIPAA Cryptographic Security stamp */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-850 rounded-3xl space-y-2.5 shadow-sm">
                  <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Lucide.LockKeyhole className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" /> Unified Encryption Ledger (STAMP)
                  </p>
                  <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 leading-normal font-sans font-medium">
                    This medical file has been encapsulated using HIPAA compliant <strong>AES-256-GCM symmetric block cipher</strong>. Decrypted streams are generated locally within your private authenticated profile container sandbox only.
                  </p>
                </div>

              </div>

              {/* Right pane: Beautiful interactive PDF preview panel (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* PDF Interactive Controls Bar */}
                <div className="bg-slate-800 text-white rounded-2xl p-3 flex justify-between items-center shadow border border-slate-700 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-slate-700 rounded-md text-red-400">
                      <Lucide.FileText className="w-4.5 h-4.5" />
                    </span>
                    <span className="font-extrabold max-w-[150px] sm:max-w-xs truncate font-mono text-[11px] text-slate-200">
                      {selectedRecord.fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zoom choices */}
                    <button
                      onClick={() => setPreviewZoom(prev => Math.max(75, prev - 10))}
                      className="p-1 px-1.5 bg-slate-700 hover:bg-slate-650 rounded text-[10px] font-bold transition font-mono border border-slate-600/50"
                    >
                      A-
                    </button>
                    <span className="font-mono text-[10px] text-slate-400 w-11 text-center font-bold">{previewZoom}%</span>
                    <button
                      onClick={() => setPreviewZoom(prev => Math.min(125, prev + 10))}
                      className="p-1 px-1.5 bg-slate-700 hover:bg-slate-650 rounded text-[10px] font-bold transition font-mono border border-slate-600/50"
                    >
                      A+
                    </button>

                    {/* Rotation */}
                    <button
                      onClick={() => setPreviewRotated(prev => !prev)}
                      title="Rotate document layout"
                      className="p-1.5 bg-slate-705/30 bg-slate-700 hover:bg-slate-650 border border-slate-600/50 text-slate-400 hover:text-white rounded transition"
                    >
                      <Lucide.RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>                {/* Simulated Clinical Paper PDF View */}
                <div className="bg-slate-100 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 min-h-[500px] flex items-center justify-center overflow-auto shadow-inner relative">
                  
                  {/* Outer page wrap */}
                  <div
                    style={{
                      transform: `scale(${previewZoom / 100}) rotate(${previewRotated ? 180 : 0}deg)`,
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-lg border border-slate-350 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden text-slate-800 dark:text-slate-100"
                  >
                    {/* Security watermark background diagonal */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-[0.035] dark:opacity-[0.015] transform -rotate-12">
                      <span className="text-[55px] font-black tracking-widest text-slate-900 dark:text-white border-8 border-slate-850 dark:border-slate-700 p-6 rounded-3xl animate-pulse">HEALTHSAATHI SYNCED</span>
                    </div>

                    {/* Report clinical letterhead */}
                    <div className="pb-4 border-b-2 border-slate-850 dark:border-slate-750 flex justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 tracking-widest font-mono">Digital Care Platform</p>
                        <h4 className="text-base font-black tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                          <Lucide.Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" /> HEALTHSAATHI HEALTH LOCKER
                        </h4>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                          Secure Health Ledger: AES 256-bit Encrypted Portable File Data System.
                        </p>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-150 dark:border-emerald-900/50 px-2 py-0.5 rounded uppercase tracking-wider leading-none">
                          ✓ Verified Original
                        </span>
                        <p className="text-[10.5px] text-slate-800 dark:text-slate-200 font-bold font-mono">TXN-{selectedRecord.id.toUpperCase()}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-none">Sourced: {selectedRecord.date}</p>
                      </div>
                    </div>

                    {/* Patient & medical center Demographics information block */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 text-[11px] font-medium leading-relaxed">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block font-mono">PATIENT PARTICULARS</span>
                        <p className="text-xs font-black text-slate-850 dark:text-white">ROHAN SHARMA</p>
                        <p className="text-slate-500 dark:text-slate-400">Age / Gender: <strong>29 Years / Male</strong></p>
                        <p className="text-slate-500 dark:text-slate-400">Contact: <strong>+91 91092 38174</strong></p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono block font-mono">MEDICAL CENTER REFERRAL</span>
                        <p className="text-xs font-bold text-slate-850 dark:text-white truncate">{selectedRecord.institution}</p>
                        <p className="text-slate-500 dark:text-slate-400">Specialist: <strong>{selectedRecord.doctor}</strong></p>
                        <p className="text-slate-500 dark:text-slate-400">Verification: <strong>HIPAA Electronic Ledger</strong></p>
                      </div>
                    </div>

                    {/* Body content changes dynamically based on category */}

                    {/* SECTION Category 1: PRESCRIPTIONS LIST MEDS TABLE */}
                    {selectedRecord.category === 'Prescription' && selectedRecord.prescriptionMeds && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-150 dark:border-slate-850">
                          <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase font-mono">
                            <Lucide.Pill className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" /> RX MEDICATION DIRECTIVE
                          </span>
                        </div>

                        <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-[11.5px] font-medium">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-150 dark:border-slate-850 font-mono">
                                <th className="p-3 pl-4">Active Drug & Strength</th>
                                <th className="p-3">Dosage</th>
                                <th className="p-3">Frequency Instruction</th>
                                <th className="p-3 pr-4 text-right">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                              {selectedRecord.prescriptionMeds.map((med, idx) => (
                                <tr key={idx}>
                                  <td className="p-3 pl-4 font-black text-slate-850 dark:text-slate-100">{med.name}</td>
                                  <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{med.dosage}</td>
                                  <td className="p-3 text-[11px] text-slate-650 dark:text-slate-400 italic font-medium">{med.frequency}</td>
                                  <td className="p-3 pr-4 text-right font-bold text-blue-700 dark:text-blue-400 font-mono text-[11px]">{med.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SECTION Category 2: BIO MEDICAL MEASURED REPORTS VALUES TABLE */}
                    {selectedRecord.category === 'Reports' && selectedRecord.contentBioValues && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-150 dark:border-slate-850">
                          <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase font-mono">
                            <Lucide.TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0" /> BIOLOGICAL MEASURED METRIC SHEET
                          </span>
                        </div>

                        <div className="overflow-hidden border border-slate-150 dark:border-slate-808 rounded-xl bg-white dark:bg-slate-900 text-[11.5px] font-medium">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-150 dark:border-slate-850/80 font-mono">
                                <th className="p-3 pl-4">Clinical Test Variable</th>
                                <th className="p-3">Result</th>
                                <th className="p-3 font-mono">Biological reference</th>
                                <th className="p-3 pr-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                              {selectedRecord.contentBioValues.map((bio, idx) => (
                                <tr key={idx}>
                                  <td className="p-3 pl-4 font-bold text-slate-800 dark:text-slate-205">{bio.parameter}</td>
                                  <td className="p-3 font-black text-slate-905 dark:text-white font-mono">{bio.value} <span className="text-[10px] text-slate-404 dark:text-slate-500 font-normal">{bio.unit}</span></td>
                                  <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{bio.referenceRange} {bio.unit}</td>
                                  <td className="p-3 pr-4 text-right">
                                    {bio.status === 'Normal' ? (
                                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-805 dark:text-emerald-400 text-[9px] font-extrabold rounded font-mono">Normal</span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-955/30 text-rose-805 dark:text-rose-400 text-[9px] font-extrabold rounded font-mono flex items-center justify-end gap-0.5 whitespace-nowrap">
                                        ⚠ {bio.status}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SECTION Category 3: IMAGING X-RAY OBSERVATION BOX */}
                    {selectedRecord.category === 'X-Ray' && selectedRecord.xrayFindings && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-150 dark:border-slate-850">
                          <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-202 flex items-center gap-1.5 uppercase font-mono">
                            <Lucide.ScanFace className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> CLINICAL RADIOLOGICAL FINDINGS
                          </span>
                        </div>

                        {/* Simulated Radiograph preview background sketch representation */}
                        <div className="h-44 bg-slate-950 rounded-2xl border-4 border-slate-800 relative flex items-center justify-center overflow-hidden">
                          {/* Radial overlay to look like glowing lightbox screen */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_75%)]" />
                          <div className="absolute top-3 left-3 text-[9px] font-mono font-bold text-slate-500 flex flex-col uppercase">
                            <span>Bony Thorax PA Scan</span>
                            <span className="text-sky-400">Contrast: Normal</span>
                          </div>
                          
                          {/* Simulated chest cage rib structure with vector circles */}
                          <div className="relative opacity-35 scale-90 flex items-center justify-center">
                            <Lucide.UserCheck className="w-28 h-28 text-white stroke-[1]" />
                            <div className="absolute w-24 h-24 border-2 border-indigo-400/20 rounded-full animate-ping" />
                          </div>

                          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded">
                            Digital Scan Lock Matrix
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Radiologist Observations</p>
                          <ul className="text-xs text-slate-650 dark:text-slate-350 space-y-2 leading-relaxed font-medium">
                            {selectedRecord.xrayFindings.map((find, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-600 dark:text-indigo-400 font-black mt-0.5 shrink-0">&#8226;</span>
                                <span>{find}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* SECTION Category 4: INSURANCE CERTIFICATE */}
                    {selectedRecord.category === 'Insurance Documents' && selectedRecord.insuranceDetails && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-150 dark:border-slate-850 font-medium">
                          <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-205 flex items-center gap-1.5 uppercase font-mono">
                            <Lucide.ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> COVERAGE PRE-AUTH CERTIFICATE
                          </span>
                        </div>

                        <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block font-mono">TPA CARRIER</span>
                            <p className="font-extrabold text-slate-800 dark:text-slate-200">{selectedRecord.insuranceDetails.carrier}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block font-mono">POLICY NUMBER</span>
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{selectedRecord.insuranceDetails.policyNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block font-mono">PRE-AUTH APPROVAL</span>
                            <p className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{selectedRecord.insuranceDetails.preAuthCode || 'Pending Code'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block font-mono">SETTLEMENT LIMIT</span>
                            <p className="font-extrabold text-amber-800 dark:text-amber-300 font-mono text-xs">₹{selectedRecord.insuranceDetails.coverageAmount}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed font-sans">
                          Diagnostic costs have been adjudicated and passed with co-pay coverage terms. All approved network diagnostic units can claim direct cashless settlement via clinical pre-auth signatures.
                        </div>
                      </div>
                    )}

                    {/* Lower signoff and signature */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end gap-4 text-[10px] text-slate-400 dark:text-slate-500">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Security Check</p>
                        <p className="font-sans leading-normal">This medical PDF sheet has been certified secure under digital key: <strong className="text-slate-650 dark:text-slate-400 font-mono">{selectedRecord.id}-{selectedRecord.category.slice(0,3).toUpperCase()}</strong></p>
                      </div>

                      <div className="text-center shrink-0 space-y-1">
                        {/* Mock Signature Stamp shape */}
                        <div className="inline-flex flex-col items-center border border-red-500/45 dark:border-red-500 p-1 px-2.5 rounded transform rotate-2 text-red-500 font-black font-mono text-[8px] uppercase tracking-wider leading-none shadow-sm">
                          <span>MUMBAI DIAGNOSTICS</span>
                          <span className="text-[7px] text-red-400/80 font-bold">APPROVED SIGNATURE</span>
                        </div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 block font-mono leading-none">E-Signature Signed</p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
              
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
