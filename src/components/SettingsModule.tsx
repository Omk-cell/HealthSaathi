import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'watch' | 'bp' | 'glucose' | 'scale';
  connected: boolean;
  battery: number;
}

interface SettingsModuleProps {
  currentUser: { email: string; name: string } | null;
  onUpdateCurrentUser: (user: { email: string; name: string }) => void;
  healthVitals: {
    score: number;
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    glucose: number;
    weight: number;
    height: number;
    bloodGroup: string;
    allergens: string;
  };
  onUpdateVitals: (v: any) => void;
  onAddNotification: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentUser,
  onUpdateCurrentUser,
  healthVitals,
  onUpdateVitals,
  onAddNotification
}) => {
  // Navigation tabs within settings (Desktop Sidebar + Mobile Header scroll)
  const [activeSection, setActiveSection] = useState<
    'personal' | 'security' | 'privacy' | 'notifications' | 'language' | 'devices' | 'emergency'
  >('personal');

  // --- 1. PERSONAL INFORMATION STATE ---
  const [profileName, setProfileName] = useState(currentUser?.name || 'Rohan Sharma');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'rohan.sharma@gmail.com');
  const [vitalsHeight, setVitalsHeight] = useState(healthVitals.height);
  const [vitalsWeight, setVitalsWeight] = useState(healthVitals.weight);
  const [vitalsBloodGroup, setVitalsBloodGroup] = useState(healthVitals.bloodGroup);
  const [vitalsAllergens, setVitalsAllergens] = useState(healthVitals.allergens);

  // --- 2. SECURITY STATES ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [validationError, setValidationError] = useState('');

  // --- 3. PRIVACY CONTROLS STATES ---
  const [shareDataWithDoctor, setShareDataWithDoctor] = useState(true);
  const [allowInsuranceAccess, setAllowInsuranceAccess] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState<'private' | 'doctor' | 'public'>('doctor');

  // --- 4. NOTIFICATION STATES ---
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);

  // --- 5. LANGUAGE STATES ---
  const [appLanguage, setAppLanguage] = useState('English (US)');

  // --- 6. CONNECTED DEVICES STATES ---
  const [devices, setDevices] = useState<ConnectedDevice[]>([
    { id: 'dev-1', name: 'Smart Blood Pressure Cuff V2', type: 'bp', connected: true, battery: 84 },
    { id: 'dev-2', name: 'Glucolink CG Monitor CGM', type: 'glucose', connected: true, battery: 92 },
    { id: 'dev-3', name: 'Pulse-4 Smart Fitness Bracelet', type: 'watch', connected: false, battery: 0 },
  ]);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingDeviceName, setPairingDeviceName] = useState('');
  const [pairingDeviceType, setPairingDeviceType] = useState<'watch' | 'scale'>('watch');

  // --- 7. EMERGENCY CONTACTS STATES ---
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: 'contact-1', name: 'Priya Sharma', relation: 'Spouse', phone: '+91 98765 43210', isPrimary: true },
    { id: 'contact-2', name: 'Dr. Vivek Nair', relation: 'Primary Clinician', phone: '+91 91234 56789', isPrimary: false },
  ]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Spouse');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactIsPrimary, setNewContactIsPrimary] = useState(false);

  // --- SAVE ACTIONS ---

  // Save Profile Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      alert('Name and Email fields are required.');
      return;
    }
    
    // Save to App State
    onUpdateCurrentUser({ name: profileName, email: profileEmail });
    onUpdateVitals({
      ...healthVitals,
      height: vitalsHeight,
      weight: vitalsWeight,
      bloodGroup: vitalsBloodGroup,
      allergens: vitalsAllergens
    });

    onAddNotification({
      id: `set-profile-save-${Date.now()}`,
      title: 'Personal Information Updated',
      text: 'Biometric measurements & personal core parameters saved successfully.',
      time: 'Just now',
      unread: true,
      type: 'success'
    });
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setValidationError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Confirm password does not match new password.');
      return;
    }

    setValidationError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    onAddNotification({
      id: `password-change-${Date.now()}`,
      title: 'Password Security Revoked & Reset',
      text: 'Your cryptographic account login password was successfully updated.',
      time: 'Just now',
      unread: true,
      type: 'success'
    });

    alert('Password updated successfully!');
  };

  // 2FA Verification Flow
  const handleVerify2fa = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() !== '123456') {
      alert('Invalid code! For testing purposes, enter "123456" to verify setup.');
      return;
    }

    setIs2faEnabled(true);
    setShow2faSetup(false);
    setVerificationCode('');
    
    onAddNotification({
      id: `2fa-enabled-${Date.now()}`,
      title: 'Two-Factor Authentication Active',
      text: 'Time-based OTP codes (TOTP) are now active across your medical portals.',
      time: 'Just now',
      unread: true,
      type: 'success'
    });
  };

  // Turn off 2fa
  const handleDisable2fa = () => {
    setIs2faEnabled(false);
    onAddNotification({
      id: `2fa-disabled-${Date.now()}`,
      title: '2FA Disabled',
      text: 'Two-Factor compliance authentication has been deactivated.',
      time: 'Just now',
      unread: true,
      type: 'alert'
    });
  };

  // Toggle privacy toggles
  const handlePrivacyToggle = (type: 'doctor' | 'insurance') => {
    if (type === 'doctor') {
      const state = !shareDataWithDoctor;
      setShareDataWithDoctor(state);
      onAddNotification({
        id: `priv-doc-${Date.now()}`,
        title: 'Doctor Sharing Configuration',
        text: state ? 'Continuous data transmission with doctor active.' : 'Doctor dashboard sync deactivated.',
        time: 'Just now',
        unread: true,
        type: 'info'
      });
    } else {
      const state = !allowInsuranceAccess;
      setAllowInsuranceAccess(state);
      onAddNotification({
        id: `priv-ins-${Date.now()}`,
        title: 'Insurance Data Policy Refinement',
        text: state ? 'Underwriting claim diagnostics access allowed.' : 'Medical metadata access restricted.',
        time: 'Just now',
        unread: true,
        type: 'info'
      });
    }
  };

  // Change notification permissions
  const handleSaveNotifications = () => {
    onAddNotification({
      id: `notif-pref-save-${Date.now()}`,
      title: 'Notification Routing System Updated',
      text: 'In-app SMS, telemetry emails, and health digests customized.',
      time: 'Just now',
      unread: true,
      type: 'success'
    });
    alert('Notification parameters saved.');
  };

  // Save Language Mode
  const handleSaveLanguage = () => {
    onAddNotification({
      id: `lang-pref-save-${Date.now()}`,
      title: 'Portal Localization Mode Appended',
      text: `All future labels, logs, and vitals readouts will translate using ${appLanguage}.`,
      time: 'Just now',
      unread: true,
      type: 'info'
    });
    alert(`Language adjusted to: ${appLanguage}`);
  };

  // Toggle individual devices
  const toggleDeviceConnection = (id: string, currentState: boolean) => {
    setDevices(prev => prev.map(dev => {
      if (dev.id === id) {
        return { ...dev, connected: !currentState };
      }
      return dev;
    }));

    const dev = devices.find(d => d.id === id);
    if (!dev) return;

    onAddNotification({
      id: `dev-toggle-${id}-${Date.now()}`,
      title: currentState ? 'Sensor Hardware Disconnected' : 'Sensor Handshake Restructured',
      text: currentState 
        ? `Severed data extraction loop with "${dev.name}".`
        : `Paired securely with "${dev.name}" via modern Bluetooth Low Energy channels.`,
      time: 'Just now',
      unread: true,
      type: currentState ? 'alert' : 'success'
    });
  };

  // Pair hypothetical device
  const handlePairDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingDeviceName.trim()) {
      alert('Please specify a device model name to scan.');
      return;
    }

    setIsPairing(true);
    setTimeout(() => {
      setIsPairing(false);
      const newDev: ConnectedDevice = {
        id: `dev-gen-${Date.now()}`,
        name: pairingDeviceName,
        type: pairingDeviceType,
        connected: true,
        battery: 100
      };
      setDevices(prev => [...prev, newDev]);
      setPairingDeviceName('');

      onAddNotification({
        id: `dev-pair-success-${Date.now()}`,
        title: 'New Bio-Sensor Paired Successfully',
        text: `Device: "${newDev.name}" detected on range and aligned to clinical charts telemetry.`,
        time: 'Just now',
        unread: true,
        type: 'success'
      });
    }, 1500);
  };

  // Add emergency contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      alert('Name and phone numbers are essential.');
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact-gen-${Date.now()}`,
      name: newContactName,
      relation: newContactRelation,
      phone: newContactPhone,
      isPrimary: newContactIsPrimary
    };

    // If making this one primary, un-primary others
    if (newContactIsPrimary) {
      setContacts(prev => prev.map(c => ({ ...c, isPrimary: false })).concat(newContact));
    } else {
      setContacts(prev => [...prev, newContact]);
    }

    setNewContactName('');
    setNewContactPhone('');
    setNewContactIsPrimary(false);

    onAddNotification({
      id: `contact-added-${Date.now()}`,
      title: 'Emergency Ring Update',
      text: `Added "${newContact.name}" as an authorized EMT rescue dispatcher contact.`,
      time: 'Just now',
      unread: true,
      type: 'success'
    });
  };

  // Remove contact card
  const removeContact = (id: string, name: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    onAddNotification({
      id: `contact-rem-${id}-${Date.now()}`,
      title: 'Emergency Register Cleared',
      text: `Revoked EMT signal coordination proxy privilege from ${name}.`,
      time: 'Just now',
      unread: true,
      type: 'alert'
    });
  };

  // Sidebar navigation elements
  const sidebarNavItems = [
    { id: 'personal', name: 'Personal Profile', icon: Lucide.UserCircle, color: 'text-blue-500' },
    { id: 'security', name: 'Security Credentials', icon: Lucide.Lock, color: 'text-rose-500' },
    { id: 'privacy', name: 'Privacy Controls', icon: Lucide.EyeOff, color: 'text-amber-500' },
    { id: 'notifications', name: 'Notification Rules', icon: Lucide.Bell, color: 'text-indigo-500' },
    { id: 'language', name: 'Language Engine', icon: Lucide.Globe2, color: 'text-cyan-500' },
    { id: 'devices', name: 'Connected Devices', icon: Lucide.Cpu, color: 'text-emerald-500' },
    { id: 'emergency', name: 'Emergency Ring', icon: Lucide.PhoneCall, color: 'text-red-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left select-none pb-8" id="settings-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm" id="settings-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <Lucide.Sliders className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
               Diagnostic Profile & Settings
            </h2>
            <p className="text-xs text-slate-400">
              Update authorization tokens, pairing arrays, privacy filters, and EMT triggers
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 block mb-2">Settings Registry</span>
          
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none select-none">
            {sidebarNavItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`set-nav-${item.id}`}
                  onClick={() => {
                    setActiveSection(item.id as any);
                    setValidationError('');
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 lg:shrink-1 w-auto lg:w-full ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-805 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-inner'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL STAGE */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[460px]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. PERSONAL INFORMATION */}
            {activeSection === 'personal' && (
              <motion.div
                key="personal-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.UserCircle className="w-5 h-5 text-blue-500" />
                    Personal & Medical Demographics
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                    Manage patient credential profile names, emails, and essential clinical characteristics.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Patient Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Designation</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-805 border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Height (Centimeters)</label>
                      <input
                        type="number"
                        value={vitalsHeight}
                        onChange={e => setVitalsHeight(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Weight (Kilograms)</label>
                      <input
                        type="number"
                        value={vitalsWeight}
                        onChange={e => setVitalsWeight(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Blood Signature</label>
                      <select
                        value={vitalsBloodGroup}
                        onChange={e => setVitalsBloodGroup(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-850 dark:border-slate-800 rounded-xl text-xs font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="A Positive" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-105 dark:text-slate-100">A Positive (A+)</option>
                        <option value="A Negative" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">A Negative (A-)</option>
                        <option value="B Positive" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">B Positive (B+)</option>
                        <option value="B Negative" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">B Negative (B-)</option>
                        <option value="O Positive" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">O Positive (O+)</option>
                        <option value="O Negative" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">O Negative (O-)</option>
                        <option value="AB Positive" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">AB Positive (AB+)</option>
                        <option value="AB Negative" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">AB Negative (AB-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Clinical Allergen Warnings</label>
                      <input
                        type="text"
                        value={vitalsAllergens}
                        onChange={e => setVitalsAllergens(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-855 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/50 dark:bg-slate-955 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        placeholder="e.g. Penicillin, Shellfish, Dust Mites"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      id="save-profile-btn"
                      className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-98"
                    >
                      Save Biometric Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. SECURITY */}
            {activeSection === 'security' && (
              <motion.div
                key="security-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-105 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.Lock className="w-5 h-5 text-rose-500" />
                    Security Credentials & Authorization
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Strengthen authorization boundaries, refresh keys, or toggle multi-factor security matrices.
                  </p>
                </div>

                {/* Sub-section: CHANGE PASSWORD */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-804 border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-205 dark:text-slate-200 uppercase tracking-wide">
                    Change Password Registry
                  </h4>

                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    {validationError && (
                      <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-[11px] text-red-650 dark:text-red-400 rounded-xl font-bold">
                        ⚠️ Error: {validationError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-450 uppercase mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={e => {
                            setCurrentPassword(e.target.value);
                            setValidationError('');
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-450 uppercase mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => {
                            setNewPassword(e.target.value);
                            setValidationError('');
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-955 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-450 uppercase mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => {
                            setConfirmPassword(e.target.value);
                            setValidationError('');
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-805 text-slate-800 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="py-2.5 px-4 bg-slate-850 bg-slate-800 dark:bg-slate-950/80 dark:border dark:border-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer active:scale-98 animate-none"
                      >
                        Update Account Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sub-section: ENABLE 2FA */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 max-w-[340px] mt-0.5">
                        Add a barrier level security checkpoint utilizing a mobile authenticator.
                      </p>
                    </div>

                    {is2faEnabled ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 uppercase">
                        <Lucide.ShieldCheck className="w-3.5 h-3.5" /> Enabled
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 uppercase">
                        Not Configured
                      </span>
                    )}
                  </div>

                  {!is2faEnabled && !show2faSetup && (
                    <button
                      onClick={() => setShow2faSetup(true)}
                      className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Lucide.ShieldAlert className="w-3.5 h-3.5" /> Initialize 2FA Protection
                    </button>
                  )}

                  {is2faEnabled && (
                    <button
                      onClick={handleDisable2fa}
                      className="py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      Disable 2FA Protection
                    </button>
                  )}

                  {show2faSetup && (
                    <div className="border border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-xl space-y-3">
                      <span className="text-[10.5px] font-black text-indigo-900 dark:text-indigo-400 uppercase block tracking-wider">Integrate Medical Authenticator App</span>
                      <p className="text-xs text-indigo-950 dark:text-indigo-305 leading-relaxed max-w-[480px]">
                        Scan the cryptographic seeds coordinates on your Authenticator (Google Authenticator, Duo) or enter manual secret key:
                      </p>

                      <div className="p-2.5 font-mono text-[10px] bg-white dark:bg-slate-950 border border-indigo-105 dark:border-indigo-905 rounded-xl text-indigo-805 dark:text-indigo-400 select-all max-w-[280px]">
                        Secret: <strong className="font-extrabold">HSSP-F6Y2-MKL9-OPAQ</strong>
                      </div>

                      <form onSubmit={handleVerify2fa} className="space-y-2 mt-3 text-left">
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Enter 1-time 6-digit confirmation code</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Type 123456 to test..."
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-808 rounded-xl text-xs text-slate-800 dark:text-slate-100 px-3 py-2 max-w-[200px] outline-none"
                            required
                          />
                          <button
                            type="submit"
                            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition"
                          >
                            Verify & Auth
                          </button>
                          <button
                            type="button"
                            onClick={() => setShow2faSetup(false)}
                            className="py-2 px-3 border border-slate-202 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-600 dark:text-slate-350 font-extrabold text-xs rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. PRIVACY CONTROLS */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.EyeOff className="w-5 h-5 text-amber-500" />
                    Medical Privacy & HIPAA Compliance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure electronic health records (EHR) visibility proxies, insurer requests, and credential permissions.
                  </p>
                </div>

                {/* VISIBILITY TIER */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-450 tracking-wider block">Global Dossier Visibility Mode</span>
                  <div className="grid grid-cols-3 gap-3">
                    {(['private', 'doctor', 'public'] as const).map(tier => {
                      const isSelected = profileVisibility === tier;
                      return (
                        <button
                          key={tier}
                          id={`priv-tier-${tier}`}
                          onClick={() => {
                            setProfileVisibility(tier);
                            onAddNotification({
                              id: `priv-tier-chg-${Date.now()}`,
                              title: 'EHR Privacy Tier Mutated',
                              text: `Health documents set to: ${tier.toUpperCase()}`,
                              time: 'Just now',
                              unread: true,
                              type: 'info'
                            });
                          }}
                          className={`p-3 text-center border rounded-xl flex flex-col items-center justify-center gap-1.5 transition cursor-pointer select-none ${
                            isSelected
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-600 text-amber-900 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/10'
                              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {tier === 'private' && <Lucide.Lock className="w-4 h-4 text-rose-500" />}
                          {tier === 'doctor' && <Lucide.Activity className="w-4 h-4 text-emerald-500" />}
                          {tier === 'public' && <Lucide.Globe2 className="w-4 h-4 text-blue-500" />}
                          <span className="text-[10px] font-black capitalize">{tier}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* POLICIES LIST */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-450 tracking-wider block">Active Sharing Consents</span>

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-2xl">
                      <div className="max-w-[420px]">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Share Health Logs with Direct Clinician</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-snug mt-0.5">
                          Allows Dr. Vivek Nair to retrieve live continuous blood sugar levels and emergency GPS triggers directly.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={shareDataWithDoctor}
                          onChange={() => handlePrivacyToggle('doctor')}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-350 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-2xl">
                      <div className="max-w-[420px]">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Insurer Diagnostic Underwriting Sync</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-snug mt-0.5">
                          Permit automated premium calculations by providing anonymized weight metrics to Star Health Alliance portal.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowInsuranceAccess}
                          onChange={() => handlePrivacyToggle('insurance')}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-350 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. NOTIFICATION RULES */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notif-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.Bell className="w-5 h-5 text-indigo-500" />
                    Alert Routing & Notifications Desk
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Control automated med-intake alerts, SMS triggers, and weekly analytics report deliveries.
                  </p>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200 block">Continuous Glucose Monitor & Vitals Push</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Mobile and browser instant push relays.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifInApp}
                      onChange={(e) => setNotifInApp(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                    <div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200 block">Critical Emergency EMT SMS Dispatcher</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Transmit SOS GPS targets via direct SMS networks.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifSms}
                      onChange={(e) => setNotifSms(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                    <div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200 block">Periodic Medical Trends Emails</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Receive monthly PDF compliance aggregates in your inbox.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                    <div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200 block">Opt-in Weekly Clinical Optimization Digest</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Receive healthy nutrition tips aligned directly to weight charts.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifDigest}
                      onChange={(e) => setNotifDigest(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveNotifications}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-98"
                  >
                    Apply Notification Parameters
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. LANGUAGE ENGINE */}
            {activeSection === 'language' && (
              <motion.div
                key="lang-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.Globe2 className="w-5 h-5 text-cyan-500" />
                    Localization & Language Engine
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select localization translation metrics mapped systematically across the clinical UI elements.
                  </p>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl max-w-[420px] space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Portal Dialect</label>
                    <select
                      value={appLanguage}
                      onChange={(e) => setAppLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="English (US)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">English (US)</option>
                      <option value="Hindi (हिंदी)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Hindi (हिंदी)</option>
                      <option value="Malayalam (മലയാളം)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Malayalam (മലയാളം)</option>
                      <option value="Tamil (தமிழ்)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Tamil (தமிழ்)</option>
                      <option value="Bengali (বাংলা)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Bengali (বাংলা)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveLanguage}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer active:scale-98"
                  >
                    Adjust Language Schema
                  </button>
                </div>
              </motion.div>
            )}

            {/* 6. CONNECTED DEVICES */}
            {activeSection === 'devices' && (
              <motion.div
                key="dev-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.Cpu className="w-5 h-5 text-emerald-500" />
                    Continuous Sensor Devices Pairings
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sync and monitor Bluetooth-enabled diagnostic wearables, automated scales, and glucometer sensors.
                  </p>
                </div>

                {/* DEVICE INDEX */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-450 tracking-wider block">Currently Paired Assets</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map(dev => (
                      <div
                        key={dev.id}
                        id={`dev-card-${dev.id}`}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-[120px] transition bg-slate-50/50 dark:bg-slate-950/20 ${
                          dev.connected ? 'border-emerald-500/25 dark:border-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{dev.name}</span>
                            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block uppercase font-mono">
                              {dev.type === 'bp' && 'BLOOD PRESSURE CUFF'}
                              {dev.type === 'glucose' && 'CGM BIOSENSOR'}
                              {dev.type === 'watch' && 'BIOMETRIC HEALTH BRACELET'}
                              {dev.type === 'scale' && 'WEIGHT METRICS SCALE'}
                            </span>
                          </div>

                          {dev.connected ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-450 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              OFFLINE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100/80 dark:border-slate-800 pt-2 text-[11px]">
                          {dev.connected ? (
                            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                              <Lucide.Battery className="w-3.5 h-3.5" /> {dev.battery}% Charge
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-medium">Not detected</span>
                          )}

                          <button
                            onClick={() => toggleDeviceConnection(dev.id, dev.connected)}
                            className={`py-1 px-3 rounded-lg text-[10px] font-extrabold transition cursor-pointer select-none ${
                              dev.connected 
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/45 border border-rose-100 dark:border-rose-900/30' 
                                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/45 border border-emerald-100 dark:border-emerald-900/30'
                            }`}
                          >
                            {dev.connected ? 'Sever Link' : 'Pair Device'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAIR NEW DEVICE */}
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    Pair New Hardware Transceiver
                  </h4>

                  <form onSubmit={handlePairDeviceSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Sensor Model Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Accu-Chek Smart-X"
                          value={pairingDeviceName}
                          onChange={e => setPairingDeviceName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Telemetry Domain</label>
                        <select
                          value={pairingDeviceType}
                          onChange={e => setPairingDeviceType(e.target.value as any)}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-xs font-semibold outline-none"
                        >
                          <option value="watch" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Wrist Health Band tracker</option>
                          <option value="scale" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Biometric Weight Scale telemetry</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <button
                        type="submit"
                        disabled={isPairing}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                      >
                        <Lucide.RefreshCw className={`w-3.5 h-3.5 ${isPairing ? 'animate-spin' : ''}`} />
                        {isPairing ? 'Scanning BLE signals...' : 'Begin Signal Scan'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 7. EMERGENCY CONTACTS */}
            {activeSection === 'emergency' && (
              <motion.div
                key="emergency-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
                    <Lucide.PhoneCall className="w-5 h-5 text-red-500" />
                    Authorized Emergency EMT Ring
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage contacts receiving SMS warning packets and mapping metrics on SOS triggers.
                  </p>
                </div>

                {/* LIST */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-450 tracking-wider block">Authorized Rescuers</span>

                  <div className="space-y-2.5">
                    {contacts.map(c => (
                      <div
                        key={c.id}
                        id={`contact-item-${c.id}`}
                        className={`p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          c.isPrimary ? 'border-red-500/25 dark:border-red-500/30 bg-red-50/10 dark:bg-red-950/10' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${c.isPrimary ? 'bg-red-105 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            <Lucide.UserCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 leading-none">
                              {c.name}
                              {c.isPrimary && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider">
                                  PRIMARY SOS DISPATCH
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-1">
                              Relationship: <strong className="font-bold text-slate-500 dark:text-slate-350">{c.relation}</strong> | Mobile: <strong className="font-bold text-slate-500 dark:text-slate-350">{c.phone}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeContact(c.id, c.name)}
                          className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left self-start sm:self-center bg-white dark:bg-slate-950"
                        >
                          Revoke Permission
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADD NEW CONTACT */}
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    Add Authorized SOS Partner
                  </h4>

                  <form onSubmit={handleAddContact} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Companion Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Rohan Saxena"
                          value={newContactName}
                          onChange={e => setNewContactName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Relationship</label>
                        <select
                          value={newContactRelation}
                          onChange={e => setNewContactRelation(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-semibold outline-none"
                        >
                          <option value="Spouse" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Spouse Companion</option>
                          <option value="Parent" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Parent / Guardian</option>
                          <option value="Child" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Child</option>
                          <option value="Primary Clinician" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Primary Clinician</option>
                          <option value="Neighbor" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Neighbor Emergency Partner</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Mobile Carrier Phone No.</label>
                        <input
                          type="text"
                          placeholder="+91 99999 88888"
                          value={newContactPhone}
                          onChange={e => setNewContactPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newContactIsPrimary}
                          onChange={e => setNewContactIsPrimary(e.target.checked)}
                          className="rounded text-red-650 text-red-600 focus:ring-red-500 h-4.5 w-4.5 border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                        Designate as primary EMT SOS packet recipient
                      </label>

                      <button
                        type="submit"
                        className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-98"
                      >
                        Enlist SOS Partner
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
