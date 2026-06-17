export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorTheme: 'blue' | 'green' | 'teal' | 'indigo' | 'red' | 'amber' | 'emerald';
  badge?: string;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  iconName: string;
}

export interface StatItem {
  id: string;
  value: number;
  label: string;
  suffix: string;
  iconName: string;
  colorClass: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
  stars: number;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Booking' | 'AI Checker' | 'Telemedicine';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  availability: string[];
  avatarUrl: string;
  hospital: string;
  fees: number;
}

export interface MedicineItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  dosage: string;
}

export type ModalType = 
  | null 
  | 'appointment' 
  | 'symptom' 
  | 'records' 
  | 'medicine' 
  | 'auth-login' 
  | 'auth-signup' 
  | 'emergency';
