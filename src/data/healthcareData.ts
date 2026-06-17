import { FeatureItem, HowItWorksStep, StatItem, TestimonialItem, FAQItem, Doctor, MedicineItem } from '../types';

export const featuresList: FeatureItem[] = [
  {
    id: 'appointment',
    title: 'Doctor Appointment Booking',
    description: 'Book instant, confirmed, or pre-scheduled physical consults with elite healthcare specialists in top-rated hospitals near you.',
    iconName: 'CalendarRange',
    colorTheme: 'blue',
    badge: '1-Click Booking'
  },
  {
    id: 'telemedicine',
    title: 'Instant Telemedicine',
    description: 'Connect 24/7 with certifed general physicians and super-specialists via HD video consultations within 10 minutes.',
    iconName: 'Video',
    colorTheme: 'green',
    badge: '24/7 Active'
  },
  {
    id: 'symptom',
    title: 'AI Symptom Checker',
    description: 'Scan symptoms, decode acute indicators, and receive immediate educational guidance powered by state-of-the-art health models.',
    iconName: 'BrainCircuit',
    colorTheme: 'indigo',
    badge: 'Smart Assist'
  },
  {
    id: 'medicine',
    title: 'Medicine Ordering',
    description: 'Upload prescriptions to purchase verified medications with express dispatch & up to 20% flat savings on high-demand brands.',
    iconName: 'Pill',
    colorTheme: 'teal',
    badge: 'Save 20%'
  },
  {
    id: 'lab-test',
    title: 'Lab Test booking',
    description: 'Schedule certified, professional home-sample collections with digital reports sent straight to your app in under 24 hours.',
    iconName: 'TestTubeDiagonal',
    colorTheme: 'emerald',
    badge: 'Home Sample'
  },
  {
    id: 'records',
    title: 'Medical Records Locker',
    description: 'Securely stash and share high-resolution radiology files, lab test printouts, and digital prescriptions in a cloud-encrypted, HIPAA-aligned folder.',
    iconName: 'ShieldAlert', // We can map this to ShieldCheck or FolderLock
    colorTheme: 'teal',
    badge: 'Encrypted'
  },
  {
    id: 'insurance',
    title: 'Insurance Claims Portal',
    description: 'Track cashless claims approvals, link existing health policies, and upload hospital bills for accelerated direct reimbursement cycles.',
    iconName: 'FileCheck2',
    colorTheme: 'amber',
    badge: 'Paperless'
  },
  {
    id: 'emergency',
    title: 'Emergency Assistance',
    description: 'Instantly transmit live GPS metrics and critical vitals to nearest hospitals to summon certified EMT sirens in 1-tap.',
    iconName: 'PhoneCall',
    colorTheme: 'red',
    badge: 'Immediate Action'
  }
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Create Account',
    description: 'Supply your phone number and essential contact parameters. Validate with our safe OTP interface to begin.',
    iconName: 'UserCheck'
  },
  {
    number: 2,
    title: 'Add Health Profile',
    description: 'Fill details on chronic conditions, surgical history, past prescriptions, and active allergies for personalized guidance.',
    iconName: 'Activity'
  },
  {
    number: 3,
    title: 'Book Services',
    description: 'Select clinical specialists, request verified diagnostic pickups, check acute symptoms, or order custom medicine bundles.',
    iconName: 'Stethoscope'
  },
  {
    number: 4,
    title: 'Manage Health',
    description: 'View digital reports, set custom pill-intake alerts, and track chronic wellness graphs via a unified live dashboard.',
    iconName: 'HeartPulse'
  }
];

export const statsList: StatItem[] = [
  {
    id: 'doctors',
    value: 1250,
    suffix: '+',
    label: 'Verified Doctors',
    iconName: 'Users',
    colorClass: 'text-blue-600'
  },
  {
    id: 'patients',
    value: 450,
    suffix: 'k+',
    label: 'Happy Patients',
    iconName: 'Heart',
    colorClass: 'text-emerald-500'
  },
  {
    id: 'hospitals',
    value: 180,
    suffix: '+',
    label: 'Partner Hospitals',
    iconName: 'Building2',
    colorClass: 'text-teal-600'
  },
  {
    id: 'appointments',
    value: 950,
    suffix: 'k+',
    label: 'Appointments Handled',
    iconName: 'Handshake',
    colorClass: 'text-indigo-600'
  }
];

export const testimonialsList: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Dr. Sarah Mathews',
    role: 'Pediatric Consultant',
    content: 'HealthSaathi completely overhauled how I manage patient workflows. Teleconsultation streams are secure and seamless, which has significantly lowered cancellations.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    stars: 5,
    verified: true
  },
  {
    id: 'test-2',
    name: 'Rohan Deshmukh',
    role: 'Tech Executive (Active Care)',
    content: 'The Emergency Button saved our family when my grandfather needed an immediate cardiac response. The live tracking tool kept us updated the entire way.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    stars: 5,
    verified: true
  },
  {
    id: 'test-3',
    name: 'Priyesh Chawla',
    role: 'Father of Two',
    content: 'Ordering monthly pediatric medicines is trivial on HealthSaathi. Prescriptions are reviewed in minutes, and the fast home-delivery options are highly reliable.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    stars: 5,
    verified: true
  },
  {
    id: 'test-4',
    name: 'Aishwarya Roy',
    role: 'Chronic Health Monitor',
    content: 'The digital record locker is exceptionally practical. I can store my entire radiology and diagnostic blood work history in one secure dashboard. No more loose papers!',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    stars: 5,
    verified: true
  }
];

export const faqsList: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I schedule an in-person doctor appointment?',
    answer: 'Simply click "Book Appointment" in the top bar or select "Doctor Appointment Booking" card. Browse specialists by clinical field or distance, inspect their available slots, and choose a time that fits. You will receive an SMS and email notification with your booking code to flash at the registration desk.',
    category: 'Booking'
  },
  {
    id: 'faq-2',
    question: 'Is the AI Symptom Checker medically sound?',
    answer: 'Our AI checker evaluates clinical symptoms against known public patterns to provide instant educational breakdowns and general health advice. It is built to serve as a fast self-guidance utility and should not replace professional emergency care or definitive physician diagnoses.',
    category: 'AI Checker'
  },
  {
    id: 'faq-3',
    question: 'Are my digital medical uploads secure and private?',
    answer: 'Absolutely. HealthSaathi encrypts records at-rest and in-transit using 256-bit HIPAA-compliant parameters. Your records are completely masked and can only be decrypted and viewed when you explicitly authorize active physicians during consultations.',
    category: 'General'
  },
  {
    id: 'faq-4',
    question: 'How quickly will telemedicine consultation begin?',
    answer: 'Our 24/7 on-call general physicians usually respond to video requests within 5 to 10 minutes. For specific specialists, you can reserve exact digital calendar hours or trigger an immediate on-demand waitlist request if the practitioner is online.',
    category: 'Telemedicine'
  },
  {
    id: 'faq-5',
    question: 'Does HealthSaathi integrate with national health insurance?',
    answer: 'Yes! We support flat cashless authorization across 45+ premier insurance carriers. You can upload photo credentials of your policy card inside your medical profile for automated approval tracking.',
    category: 'General'
  }
];

export const doctorsList: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Alok Sen',
    specialty: 'Cardiologist',
    experience: '14 Years Exp',
    rating: 4.9,
    reviewsCount: 312,
    availability: ['Mon 9:00 AM', 'Mon 2:00 PM', 'Tue 10:30 AM', 'Wed 4:00 PM'],
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    hospital: 'Apex Heart Research Center',
    fees: 800
  },
  {
    id: 'doc-2',
    name: 'Dr. Meera Vasudevan',
    specialty: 'Pediatric Specialist',
    experience: '11 Years Exp',
    rating: 4.8,
    reviewsCount: 245,
    availability: ['Tue 9:00 AM', 'Tue 1:00 PM', 'Thu 11:00 AM', 'Fri 3:30 PM'],
    avatarUrl: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=200',
    hospital: 'Rainbow Children Clinic',
    fees: 600
  },
  {
    id: 'doc-3',
    name: 'Dr. Siddharth Verma',
    specialty: 'Dermatologist',
    experience: '9 Years Exp',
    rating: 4.7,
    reviewsCount: 189,
    availability: ['Wed 10:00 AM', 'Wed 2:00 PM', 'Fri 9:30 AM', 'Sat 11:30 AM'],
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    hospital: 'Skinsafe Advanced Center',
    fees: 700
  },
  {
    id: 'doc-4',
    name: 'Dr. Ritika Sharma',
    specialty: 'Neurologist',
    experience: '16 Years Exp',
    rating: 5.0,
    reviewsCount: 420,
    availability: ['Thu 9:30 AM', 'Thu 3:00 PM', 'Fri 2:00 PM', 'Mon 11:00 AM'],
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    hospital: 'Neuro Life Superspecialty',
    fees: 1000
  }
];

export const medicinesList: MedicineItem[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 650mg XL',
    price: 45,
    category: 'Fever & Pain',
    description: 'Relieves mild to moderate pain and decreases high fever immediately.',
    dosage: '1 tablet every 6 hours'
  },
  {
    id: 'med-2',
    name: 'Amoxicillin Trihydrate 500mg',
    price: 120,
    category: 'Antibiotics',
    description: 'Combats respiratory, throat, skin and dental bacterial infections.',
    dosage: '1 capsule twice daily after meals'
  },
  {
    id: 'med-3',
    name: 'Multivitamin Complete Active',
    price: 250,
    category: 'Wellness',
    description: 'Replenishes trace minerals, essential amino acids, and stress-guard vitamins.',
    dosage: '1 tablet daily at breakfast'
  },
  {
    id: 'med-4',
    name: 'Atorvastatin Lipid Care 10mg',
    price: 180,
    category: 'Cardiac & Lipids',
    description: 'Stabilizes LDL cholesterol counts and supports cardiac wall health.',
    dosage: '1 tablet at bedtime daily'
  },
  {
    id: 'med-5',
    name: 'Pantoprazole Acid Relief 40mg',
    price: 90,
    category: 'Gastroenterology',
    description: 'Treats medical acid reflux, bloating symptoms and ulcer occurrences.',
    dosage: '1 capsule empty-stomach before coffee'
  }
];
