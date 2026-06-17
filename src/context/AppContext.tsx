import React, { createContext, useContext, useState, useEffect } from 'react';
import { Doctor, MedicineItem, ModalType } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export interface HealthVitals {
  score: number;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  glucose: number;
  weight: number; // kg
  height: number; // cm
  bloodGroup: string;
  allergens: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'In Consultation';
  fees: number;
  type: 'In-Clinic' | 'Video Call';
}

export interface Notification {
  id: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  type: 'success' | 'alert' | 'info';
}

export interface MedicalRecord {
  id: string;
  name: string;
  date: string;
  category: string;
  doctor: string;
  fileSize: string;
  status: string;
}

export interface Claim {
  id: string;
  carrier: string;
  amount: string;
  reason: string;
  status: 'Pending Verification' | 'Authorized' | 'Disbursed' | 'Declined';
  date: string;
}

export interface MedReminder {
  id: string;
  name: string;
  time: string;
  dosage: string;
  taken: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
}

export interface ChatThreads {
  'doc-1': { doctorName: string; messages: ChatMessage[] };
  'doc-2': { doctorName: string; messages: ChatMessage[] };
}

interface AppContextType {
  currentUser: { email: string; name: string; uid?: string } | null;
  setCurrentUser: (user: { email: string; name: string; uid?: string } | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  healthVitals: HealthVitals;
  setHealthVitals: React.Dispatch<React.SetStateAction<HealthVitals>>;
  appointments: Appointment[];
  setAppointments: (value: React.SetStateAction<Appointment[]>) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  medReminders: MedReminder[];
  setMedReminders: React.Dispatch<React.SetStateAction<MedReminder[]>>;
  records: MedicalRecord[];
  setRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>;
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  medicineCart: CartItem[];
  setMedicineCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  chatThreads: ChatThreads;
  setChatThreads: React.Dispatch<React.SetStateAction<ChatThreads>>;
  activeMessageThread: 'doc-1' | 'doc-2';
  setActiveMessageThread: (id: 'doc-1' | 'doc-2') => void;
  activeModal: ModalType;
  setActiveModal: (type: ModalType) => void;
  handleAuthSuccess: (email: string, name: string) => void;
  handleLogout: () => void;
  loginWithFirebase: (email: string, password: string) => Promise<any>;
  signupWithFirebase: (email: string, name: string, password: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; uid?: string } | null>(() => {
    const saved = localStorage.getItem('hs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hs_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [healthVitals, setHealthVitals] = useState<HealthVitals>(() => {
    const saved = localStorage.getItem('hs_health_vitals');
    return saved ? JSON.parse(saved) : {
      score: 84,
      bpSystolic: 118,
      bpDiastolic: 76,
      heartRate: 72,
      glucose: 95,
      weight: 70,
      height: 175,
      bloodGroup: 'O Positive',
      allergens: 'Penicillin, Dust Mites',
    };
  });

  const [appointments, _setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('hs_appointments');
    return saved ? JSON.parse(saved) : [
      {
        id: 'app-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Vivek Nair',
        specialty: 'Cardiologist',
        hospital: 'Saathi Multispecialty Hospital',
        date: '2026-06-03',
        time: '10:00 AM',
        status: 'Confirmed',
        fees: 800,
        type: 'Video Call',
      },
      {
        id: 'app-2',
        doctorId: 'doc-2',
        doctorName: 'Dr. Meera Vasudevan',
        specialty: 'Pediatrician',
        hospital: 'Saathi Wellness Hub, Clinic 4B',
        date: '2026-06-05',
        time: '04:30 PM',
        status: 'Confirmed',
        fees: 600,
        type: 'In-Clinic',
      },
    ];
  });

  // Custom setter that automatically writes or deletes documents from Firestore in reaction to client-side state modifications
  const setAppointments = (value: React.SetStateAction<Appointment[]>) => {
    _setAppointments(prev => {
      const next = typeof value === 'function' ? (value as Function)(prev) : value;

      const added = next.filter((n: Appointment) => !prev.some((p: Appointment) => p.id === n.id));
      const removed = prev.filter((p: Appointment) => !next.some((n: Appointment) => n.id === p.id));

      if (auth.currentUser?.uid) {
        added.forEach(async (app: Appointment) => {
          try {
            await setDoc(doc(db, 'bookings', app.id), {
              id: app.id,
              doctorId: app.doctorId || 'doc-1',
              doctorName: app.doctorName,
              specialty: app.specialty,
              hospital: app.hospital,
              date: app.date,
              time: app.time,
              status: app.status,
              fees: Number(app.fees) || 500,
              type: app.type || 'Video Call',
              userId: auth.currentUser!.uid,
              userEmail: auth.currentUser!.email || '',
              userName: auth.currentUser!.displayName || currentUser?.name || 'Patient',
              createdAt: new Date().toISOString()
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `bookings/${app.id}`);
          }
        });

        removed.forEach(async (app: Appointment) => {
          try {
            await deleteDoc(doc(db, 'bookings', app.id));
          } catch (e) {
            handleFirestoreError(e, OperationType.DELETE, `bookings/${app.id}`);
          }
        });
      }

      return next;
    });
  };

  // Synchronize authentication and pull appointment history in-sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch customized legal profiling attributes from our cloud user card
        let name = fbUser.displayName || '';
        if (!name) {
          try {
            const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (docSnap.exists()) {
              name = docSnap.data().name || '';
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, `users/${fbUser.uid}`);
          }
        }
        if (!name) name = fbUser.email?.split('@')[0] || 'Patient';

        const userObj = { email: fbUser.email || '', name, uid: fbUser.uid };
        setCurrentUser(userObj);
        localStorage.setItem('hs_user', JSON.stringify(userObj));

        // Load synced appointment list directly from Firestore
        try {
          const q = query(collection(db, 'bookings'), where('userId', '==', fbUser.uid));
          const querySnaps = await getDocs(q);
          const fbApps: Appointment[] = [];
          querySnaps.forEach((doc) => {
            fbApps.push({ id: doc.id, ...doc.data() } as Appointment);
          });
          _setAppointments(fbApps);
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'bookings');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('hs_user');
        // Revert cleanly to cached local list when offline/logged-out
        const saved = localStorage.getItem('hs_appointments');
        if (saved) {
          _setAppointments(JSON.parse(saved));
        } else {
          _setAppointments([
            {
              id: 'app-1',
              doctorId: 'doc-1',
              doctorName: 'Dr. Vivek Nair',
              specialty: 'Cardiologist',
              hospital: 'Saathi Multispecialty Hospital',
              date: '2026-06-03',
              time: '10:00 AM',
              status: 'Confirmed',
              fees: 800,
              type: 'Video Call',
            },
            {
              id: 'app-2',
              doctorId: 'doc-2',
              doctorName: 'Dr. Meera Vasudevan',
              specialty: 'Pediatrician',
              hospital: 'Saathi Wellness Hub, Clinic 4B',
              date: '2026-06-05',
              time: '04:30 PM',
              status: 'Confirmed',
              fees: 600,
              type: 'In-Clinic',
            },
          ]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('hs_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n-1',
        title: 'Clinical System Check-In',
        text: 'All biometric feedback links active. Ensure wearable sensor bands are tightened properly on your wrist.',
        time: '10 Mins Ago',
        unread: true,
        type: 'info',
      },
      {
        id: 'n-2',
        title: 'Star Health Premium Aligned',
        text: 'Third-party auto claim verifiers unlocked a direct co-pay margin for upcoming cardiovascular diagnostics.',
        time: '2 Hours Ago',
        unread: true,
        type: 'success',
      },
      {
        id: 'n-3',
        title: 'Medication Non-Compliance Alert',
        text: 'Glycomet 500mg missed during previous lunch cycle log. Take caution and review active schedules.',
        time: '1 Day Ago',
        unread: false,
        type: 'alert',
      },
    ];
  });

  const [medReminders, setMedReminders] = useState<MedReminder[]>(() => {
    const saved = localStorage.getItem('hs_med_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 'rem-1', name: 'Glycomet GP 1/500 Forte', time: '8:30 AM (Post-Breakfast)', dosage: '1 Tablet', taken: true },
      { id: 'rem-2', name: 'Atorva 10mg Smartstatin', time: '9:30 PM (Pre-Sleep)', dosage: '1 Tablet', taken: false },
      { id: 'rem-3', name: 'Multivitamin Complete Active', time: '1:00 PM (Post-Lunch)', dosage: '1 Capsule', taken: false },
    ];
  });

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('hs_records');
    return saved ? JSON.parse(saved) : [
      { id: 'rec-1', name: 'ECG Lipids Profile Chart.pdf', date: '2026-05-15', category: 'Diagnostics', doctor: 'Dr. Vivek Nair', fileSize: '2.4 MB', status: 'Verified' },
      { id: 'rec-2', name: 'Standard Chest X-Ray.jpg', date: '2026-04-10', category: 'Radiology', doctor: 'Dr. Vivek Nair', fileSize: '4.8 MB', status: 'Verified' },
      { id: 'rec-3', name: 'Childhood Vaccination Card.pdf', date: '2026-01-20', category: 'Immunization', doctor: 'Dr. Meera Vasudevan', fileSize: '1.1 MB', status: 'Verified' },
    ];
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem('hs_claims');
    return saved ? JSON.parse(saved) : [
      { id: 'claim-101', carrier: 'HealthSaathi Gold Elite', amount: '₹14,500', reason: 'Emergency Ambulance & Cardiac Op', status: 'Pending Verification', date: '2026-05-24' },
      { id: 'claim-102', carrier: 'Star Health Allied Network', amount: '₹3,200', reason: 'Consultation & Multi-Specialty Lab OPD', status: 'Authorized', date: '2026-05-12' },
      { id: 'claim-103', carrier: 'Care Health Unlimited Block', amount: '₹65,000', reason: 'Short-Stay Daycare Minor Procedures', status: 'Completed', date: '2026-04-02' },
    ];
  });

  const [medicineCart, setMedicineCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hs_medicine_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatThreads, setChatThreads] = useState<ChatThreads>(() => {
    const saved = localStorage.getItem('hs_chat_threads');
    return saved ? JSON.parse(saved) : {
      'doc-1': {
        doctorName: 'Dr. Vivek Nair (Cardiology)',
        messages: [
          { id: 'm1', sender: 'doctor', text: 'Hello Rohan. Your lipid trends indicate minor improvement, but we must stabilize that systolic BP. Are you taking Atorva daily?', time: 'Yesterday' },
          { id: 'm2', sender: 'user', text: 'Yes Doctor. Tracking compliance regularly on the app. However, I sometimes experience slight dizziness in the mornings.', time: 'Yesterday' },
          { id: 'm3', sender: 'doctor', text: 'I see. Continue Atorva and monitor your vitals, especially resting pulse. Ensure you stay well hydrated.', time: '9:45 AM' },
        ],
      },
      'doc-2': {
        doctorName: 'Dr. Meera Vasudevan (Pediatric)',
        messages: [
          { id: 'm4', sender: 'doctor', text: 'Hi Rohan, did you finish uploading your child vaccine report from the health card?', time: '3 Days Ago' },
          { id: 'm5', sender: 'user', text: 'Just uploaded in the documents locker under immunization category!', time: '3 Days Ago' },
          { id: 'm6', sender: 'doctor', text: 'Perfect. Checked. The booster sequence is scheduled for next month. Let me queue the booking.', time: '2 Days Ago' },
        ],
      },
    };
  });

  const [activeMessageThread, setActiveMessageThread] = useState<'doc-1' | 'doc-2'>('doc-1');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('hs_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hs_health_vitals', JSON.stringify(healthVitals));
  }, [healthVitals]);

  useEffect(() => {
    localStorage.setItem('hs_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('hs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hs_med_reminders', JSON.stringify(medReminders));
  }, [medReminders]);

  useEffect(() => {
    localStorage.setItem('hs_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hs_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('hs_medicine_cart', JSON.stringify(medicineCart));
  }, [medicineCart]);

  useEffect(() => {
    localStorage.setItem('hs_chat_threads', JSON.stringify(chatThreads));
  }, [chatThreads]);

  const loginWithFirebase = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (e) {
      console.error("Firebase Login routine error:", e);
      throw e;
    }
  };

  const signupWithFirebase = async (email: string, name: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      await updateProfile(user, { displayName: name });
      
      // Persist clinical profile mapping details securely in cloud collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      });
      return user;
    } catch (e) {
      console.error("Firebase Signup registration error:", e);
      throw e;
    }
  };

  const handleAuthSuccess = (email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('hs_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('hs_user');
    } catch (e) {
      console.error("Firebase dynamic Signout error:", e);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        theme,
        setTheme,
        toggleTheme,
        healthVitals,
        setHealthVitals,
        appointments,
        setAppointments,
        notifications,
        setNotifications,
        medReminders,
        setMedReminders,
        records,
        setRecords,
        claims,
        setClaims,
        medicineCart,
        setMedicineCart,
        chatThreads,
        setChatThreads,
        activeMessageThread,
        setActiveMessageThread,
        activeModal,
        setActiveModal,
        handleAuthSuccess,
        handleLogout,
        loginWithFirebase,
        signupWithFirebase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
