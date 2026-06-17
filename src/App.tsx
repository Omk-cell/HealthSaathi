import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SharedLayout } from './components/SharedLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardOverview } from './components/DashboardOverview';

// Import child hospital/OPD modules
import { DoctorAppointmentModule } from './components/DoctorAppointmentModule';
import { LabTestBookingModule } from './components/LabTestBookingModule';
import { MedicalRecordsModule } from './components/MedicalRecordsModule';
import { TelemedicineConsultationModule } from './components/TelemedicineConsultationModule';
import { MedicineOrderingModule } from './components/MedicineOrderingModule';
import { MedicationManagementModule } from './components/MedicationManagementModule';
import { SymptomCheckerModule } from './components/SymptomCheckerModule';
import { WearableAnalyticsModule } from './components/WearableAnalyticsModule';
import { InsuranceManagementModule } from './components/InsuranceManagementModule';
import { DoctorPatientMessagingModule } from './components/DoctorPatientMessagingModule';
import { EmergencyAssistanceModule } from './components/EmergencyAssistanceModule';
import { SettingsModule } from './components/SettingsModule';

import { doctorsList } from './data/healthcareData';

// -------------------------------------------------------------
// MODULE WRAPPERS TO CONVERGE PROPS FROM GLOBAL `useApp` CONTEXT
// -------------------------------------------------------------

const AppointmentsWrapper: React.FC = () => {
  const { appointments, setAppointments, setNotifications } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'appointments' | 'doctors') || 'appointments';

  const handleBook = (newApp: any) => {
    setAppointments(prev => [...prev, newApp]);
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title: 'Appointment Booked',
        text: `Confirmed OPD consultation with ${newApp.doctorName} on ${newApp.date} at ${newApp.time}.`,
        time: 'Just now',
        unread: true,
        type: 'success',
      },
      ...prev,
    ]);
    alert(`Appointment Confirmed with ${newApp.doctorName}!`);
    navigate('/dashboard');
  };

  const handleCancel = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel the scheduled consultation with ${name}?`)) {
      setAppointments(prev => prev.filter(app => app.id !== id));
      setNotifications(prev => [
        {
          id: `n-${Date.now()}`,
          title: 'Consultation Revoked',
          text: `OPD visit scheduled with ${name} was deleted from clinical boards.`,
          time: 'Just now',
          unread: true,
          type: 'alert',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <DoctorAppointmentModule
        doctors={doctorsList}
        appointments={appointments}
        onBookAppointment={handleBook}
        onCancelAppointment={handleCancel}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSearchParams({ tab });
        }}
      />
    </div>
  );
};

const LabTestWrapper: React.FC = () => {
  const { setRecords, setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <LabTestBookingModule
        onAddRecord={(rec) => setRecords(prev => [rec, ...prev])}
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'alert' ? 'alert' : 'success',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const MedicalLockerWrapper: React.FC = () => {
  const { setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <MedicalRecordsModule
        onAddRecordNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'error' ? 'alert' : (notif.type === 'success' ? 'success' : 'info'),
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const TelemedicineWrapper: React.FC = () => {
  const { setNotifications, setIsTeleSessionLive, setRecords } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <TelemedicineConsultationModule
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'alert' ? 'alert' : 'success',
            },
            ...prev,
          ]);
        }}
        onSessionStateChange={(liveState) => {
          setIsTeleSessionLive(liveState);
        }}
        onAddRecordToLocker={(newRecord) => {
          setRecords(prev => [
            {
              id: newRecord.id,
              name: newRecord.name,
              category: newRecord.category,
              date: newRecord.date,
              doctor: newRecord.doctor,
              size: newRecord.size,
            },
            ...prev,
          ]);

          // Sync to localStorage
          try {
            const saved = localStorage.getItem('hs_ehr_records');
            let list = [];
            if (saved) {
              list = JSON.parse(saved);
            }
            const fullEHRRecord = {
              id: newRecord.id,
              name: newRecord.name,
              fileName: newRecord.fileName,
              category: newRecord.category,
              date: newRecord.date,
              doctor: newRecord.doctor,
              institution: newRecord.institution,
              size: newRecord.size,
              notes: newRecord.notes,
              tags: [newRecord.category, 'Telemed Shared'],
              status: 'Verified' as const,
            };
            localStorage.setItem('hs_ehr_records', JSON.stringify([fullEHRRecord, ...list]));
          } catch (e) {
            console.error('Locker synchronization error:', e);
          }
        }}
      />
    </div>
  );
};

const MedicineOrderingWrapper: React.FC = () => {
  const { setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <MedicineOrderingModule
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'alert' ? 'alert' : 'success',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const MedicationTrackerWrapper: React.FC = () => {
  const { setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <MedicationManagementModule
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'alert' ? 'alert' : 'success',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const SymptomCheckerWrapper: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <SymptomCheckerModule />
    </div>
  );
};

const InsuranceWrapper: React.FC = () => {
  const { currentUser, setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <InsuranceManagementModule
        currentUser={currentUser}
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'success' ? 'success' : notif.type === 'alert' ? 'alert' : 'info',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const AnalyticsWrapper: React.FC = () => {
  const { setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <WearableAnalyticsModule
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'success' ? 'success' : notif.type === 'alert' ? 'alert' : 'info',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const MessagingWrapper: React.FC = () => {
  const { currentUser, setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <DoctorPatientMessagingModule
        currentUser={currentUser}
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'success' ? 'success' : notif.type === 'alert' ? 'alert' : 'info',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const EmergencyWrapper: React.FC = () => {
  const { currentUser, setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <EmergencyAssistanceModule
        currentUser={currentUser}
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'success' ? 'success' : notif.type === 'alert' ? 'alert' : 'info',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

const SettingsWrapper: React.FC = () => {
  const { currentUser, handleUpdateCurrentUser, healthVitals, setHealthVitals, setNotifications } = useApp();
  return (
    <div className="max-w-6xl mx-auto">
      <SettingsModule
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        healthVitals={healthVitals}
        onUpdateVitals={setHealthVitals}
        onAddNotification={(notif) => {
          setNotifications(prev => [
            {
              id: notif.id,
              title: notif.title,
              text: notif.text,
              time: notif.time,
              unread: notif.unread,
              type: notif.type === 'success' ? 'success' : notif.type === 'alert' ? 'alert' : 'info',
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};

// ------------------------------
// APP INNER ROUTER CORE ENGINE
// ------------------------------

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Dashboard Panel Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SharedLayout />
          </ProtectedRoute>
        }
      >
        {/* Child Views */}
        <Route index element={<DashboardOverview />} />
        <Route path="appointments" element={<AppointmentsWrapper />} />
        <Route path="lab-tests" element={<LabTestWrapper />} />
        <Route path="records" element={<MedicalLockerWrapper />} />
        <Route path="telemedicine" element={<TelemedicineWrapper />} />
        <Route path="medicines" element={<MedicineOrderingWrapper />} />
        <Route path="medication" element={<MedicationTrackerWrapper />} />
        <Route path="symptom-checker" element={<SymptomCheckerWrapper />} />
        <Route path="insurance" element={<InsuranceWrapper />} />
        <Route path="analytics" element={<AnalyticsWrapper />} />
        <Route path="messages" element={<MessagingWrapper />} />
        <Route path="emergency" element={<EmergencyWrapper />} />
        <Route path="settings" element={<SettingsWrapper />} />
      </Route>

      {/* Fallback routing Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
