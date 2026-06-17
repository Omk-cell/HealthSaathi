import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
export interface Medication {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: 'Daily' | 'Twice Daily' | 'Thrice Daily' | 'Alternate Days' | 'Once Weekly';
  reminderTimes: string[]; // e.g., ["08:00 AM", "09:00 PM"]
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  instructions: string; // "Take with lukewarm milk", "Before food", etc.
  active: boolean;
  color: string; // Tailwind color theme for badges
}

export interface ScheduleItem {
  id: string;
  medicationId: string;
  medicationName: string;
  category: string;
  dosage: string;
  date: string; // "YYYY-MM-DD"
  time: string; // e.g., "08:00 AM"
  status: 'taken' | 'missed' | 'upcoming';
  takenAt?: string; // Time string when checked taken
}

interface MedicationManagementModuleProps {
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

// Initial Data representing Rohan's medications
const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-metformin',
    name: 'Metformin Glucophage 500mg',
    category: 'Diabetes',
    dosage: '1 Pill',
    frequency: 'Daily',
    reminderTimes: ['08:00 AM'],
    startDate: '2026-05-01',
    endDate: '2026-08-01',
    instructions: 'Take in the morning with breakfast to stabilize blood sugar.',
    active: true,
    color: 'emerald',
  },
  {
    id: 'med-atorvastatin',
    name: 'Atorvastatin Lipid Care 10mg',
    category: 'Cardiology',
    dosage: '1 Pill',
    frequency: 'Daily',
    reminderTimes: ['09:00 PM'],
    startDate: '2026-05-01',
    endDate: '2026-11-01',
    instructions: 'Take at bedtime for cholesterol synthesis regulation.',
    active: true,
    color: 'rose',
  },
  {
    id: 'med-multivitamin',
    name: 'Multivitamin Complete Active',
    category: 'Vitamins',
    dosage: '1 Capsule',
    frequency: 'Daily',
    reminderTimes: ['01:00 PM'],
    startDate: '2026-05-15',
    endDate: '2026-06-15',
    instructions: 'Take after a heavy lunch. Avoid taking on an empty stomach.',
    active: true,
    color: 'amber',
  },
  {
    id: 'med-amoxicillin',
    name: 'Amoxyclav 625 Antibiotic',
    category: 'Infections',
    dosage: '1 Tablet',
    frequency: 'Twice Daily',
    reminderTimes: ['08:00 AM', '08:00 PM'],
    startDate: '2026-05-27',
    endDate: '2026-06-02',
    instructions: 'Complete the 7-day scheduled antibiotic course. Avoid skipping.',
    active: true,
    color: 'blue',
  },
  {
    id: 'med-allegra',
    name: 'Allegra Allergy Relief 120mg',
    category: 'Allergy',
    dosage: '1 Tablet',
    frequency: 'Daily',
    reminderTimes: ['04:00 PM'],
    startDate: '2026-05-29',
    endDate: '2026-06-05',
    instructions: 'Take with a full glass of water. Non-drowsy formulation.',
    active: true,
    color: 'violet',
  }
];

// Seed initial schedules around May 28 - June 02, 2026
const createInitialSchedules = (): ScheduleItem[] => {
  const schedules: ScheduleItem[] = [];
  const days = ['2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02'];

  days.forEach(day => {
    const isPast = day < '2026-05-30';
    const isToday = day === '2026-05-30';

    INITIAL_MEDICATIONS.forEach(med => {
      // Check if medicine is within start and end date
      if (day >= med.startDate && day <= med.endDate && med.active) {
        med.reminderTimes.forEach(time => {
          let status: 'taken' | 'missed' | 'upcoming' = 'upcoming';

          if (isPast) {
            // Pick realistic historical taken vs missed
            const hash = (day.charCodeAt(9) + med.name.charCodeAt(1) + time.charCodeAt(1)) % 10;
            status = hash > 2 ? 'taken' : 'missed';
          } else if (isToday) {
            // Today schedule splits based on current hour (assume current mock is around 05:30 PM)
            const hour = parseInt(time.split(':')[0]);
            const isPM = time.includes('PM');
            const mockHour24 = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);

            if (mockHour24 < 17) { // 5:00 PM
              // Past times today
              if (med.id === 'med-metformin') status = 'taken';
              else if (med.id === 'med-multivitamin') status = 'taken';
              else if (med.id === 'med-amoxicillin' && time === '08:00 AM') status = 'taken';
              else status = 'missed'; // e.g. missed an early afternoon dosage
            } else {
              // Future times today
              status = 'upcoming';
            }
          } else {
            // Future days are upcoming
            status = 'upcoming';
          }

          schedules.push({
            id: `sch-${med.id}-${day}-${time.replace(/[: ]/g, '')}`,
            medicationId: med.id,
            medicationName: med.name,
            category: med.category,
            dosage: med.dosage,
            date: day,
            time,
            status,
            takenAt: status === 'taken' ? (time === '08:00 AM' ? '08:05 AM' : '01:12 PM') : undefined
          });
        });
      }
    });
  });

  return schedules;
};

export const MedicationManagementModule: React.FC<MedicationManagementModuleProps> = ({
  onAddNotification
}) => {
  // Navigation / Tabs control state inside the module
  // 'dashboard' | 'calendar' | 'edit-list'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'edit-list'>('dashboard');

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('hs_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('hs_med_schedules');
    return saved ? JSON.parse(saved) : createInitialSchedules();
  });

  // Local persistence synchronization
  useEffect(() => {
    localStorage.setItem('hs_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('hs_med_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Calendar State
  // For the calendar, let's lock in May 2026 initially as specified in the local time.
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed: April = 3, May = 4, June = 5.
  const [selectedDateStr, setSelectedDateStr] = useState('2026-05-30'); // Selected date in YYYY-MM-DD
  const [calendarViewMode, setCalendarViewMode] = useState<'calendar' | 'list'>('calendar');

  // Form states (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Vitamins');
  const [formDosage, setFormDosage] = useState('1 Pill');
  const [formFrequency, setFormFrequency] = useState<Medication['frequency']>('Daily');
  const [formReminderTimes, setFormReminderTimes] = useState<string[]>(['08:00 AM']);
  const [formStartDate, setFormStartDate] = useState('2026-05-30');
  const [formEndDate, setFormEndDate] = useState('2026-08-30');
  const [formInstructions, setFormInstructions] = useState('');
  const [formColor, setFormColor] = useState('blue');

  const categories = ['Cardiology', 'Diabetes', 'Vitamins', 'Infections', 'Allergy', 'Hypertension', 'Other'];
  const colors = [
    { name: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', fill: 'bg-emerald-500' },
    { name: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200', fill: 'bg-rose-500' },
    { name: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200', fill: 'bg-blue-500' },
    { name: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200', fill: 'bg-amber-500' },
    { name: 'violet', bg: 'bg-violet-50 text-violet-700 border-violet-200', fill: 'bg-violet-500' },
    { name: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', fill: 'bg-indigo-500' },
  ];

  // Quick reminder time helpers
  const PRESET_TIMES = ['08:00 AM', '11:00 AM', '01:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '09:00 PM'];

  // Current context time check: 2026-05-30
  const TODAY_STR = '2026-05-30';

  // Toggle state of schedule
  const handleToggleScheduleStatus = (schId: string, forceStatus?: 'taken' | 'missed' | 'upcoming') => {
    setSchedules(prev => {
      return prev.map(sch => {
        if (sch.id === schId) {
          let nextStatus: 'taken' | 'missed' | 'upcoming' = 'taken';
          if (forceStatus) {
            nextStatus = forceStatus;
          } else {
            if (sch.status === 'taken') nextStatus = 'missed';
            else if (sch.status === 'missed') nextStatus = 'upcoming';
            else nextStatus = 'taken';
          }

          const takenAt = nextStatus === 'taken' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

          // Dispatch Notification if required
          if (onAddNotification) {
            let statusText = 'Completed';
            let type: 'success' | 'alert' | 'info' = 'success';
            if (nextStatus === 'missed') {
              statusText = 'Marked as Missed';
              type = 'alert';
            } else if (nextStatus === 'upcoming') {
              statusText = 'Reset to Scheduled';
              type = 'info';
            }

            onAddNotification({
              id: `notif-sch-${Date.now()}`,
              title: `Pill Tracker: ${statusText}`,
              text: `"${sch.medicationName}" dose for ${sch.time} is ${nextStatus}.`,
              time: 'Just now',
              unread: true,
              type
            });
          }

          return { ...sch, status: nextStatus, takenAt };
        }
        return sch;
      });
    });
  };

  // Delete Medication
  const handleDeleteMedication = (id: string, name: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    setSchedules(prev => prev.filter(s => s.medicationId !== id));

    if (onAddNotification) {
      onAddNotification({
        id: `notif-del-${Date.now()}`,
        title: 'Medication Deleted',
        text: `"${name}" and all scheduled doses have been permanently deleted from your logs.`,
        time: 'Just now',
        unread: true,
        type: 'info'
      });
    }
  };

  // Open Form for Adding New Medication
  const handleOpenAddForm = () => {
    setEditingMedication(null);
    setFormName('');
    setFormCategory('Vitamins');
    setFormDosage('1 Pill');
    setFormFrequency('Daily');
    setFormReminderTimes(['08:00 AM']);
    setFormStartDate(TODAY_STR);
    setFormEndDate('2026-08-30');
    setFormInstructions('');
    setFormColor('blue');
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Medication
  const handleOpenEditForm = (med: Medication) => {
    setEditingMedication(med);
    setFormName(med.name);
    setFormCategory(med.category);
    setFormDosage(med.dosage);
    setFormFrequency(med.frequency);
    setFormReminderTimes(med.reminderTimes);
    setFormStartDate(med.startDate);
    setFormEndDate(med.endDate);
    setFormInstructions(med.instructions);
    setFormColor(med.color);
    setIsFormOpen(true);
  };

  // Form submission handler
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMedication) {
      // ===== EDIT EXISTENT =====
      const medId = editingMedication.id;
      const updatedMed: Medication = {
        ...editingMedication,
        name: formName,
        category: formCategory,
        dosage: formDosage,
        frequency: formFrequency,
        reminderTimes: formReminderTimes,
        startDate: formStartDate,
        endDate: formEndDate,
        instructions: formInstructions,
        color: formColor,
      };

      setMedications(prev => prev.map(m => m.id === medId ? updatedMed : m));

      // Re-generate/Update schedule entries:
      // Keep completed historical entries, but replace/generate entries for today and onwards
      setSchedules(prev => {
        // Filter out any future schedules for this medication
        const baseSchedules = prev.filter(sch => !(sch.medicationId === medId && sch.date >= TODAY_STR));

        // Generate updated schedules for remaining dates (Today onwards)
        const newSchedules: ScheduleItem[] = [];
        const start = formStartDate > TODAY_STR ? formStartDate : TODAY_STR;
        
        // Generate loop of days (up to end date or maximum 14 days ahead to save performance)
        const startDateObj = new Date(start);
        const endDateObj = new Date(formEndDate);
        
        const tempDate = new Date(startDateObj);
        let safetyCount = 0;

        while (tempDate <= endDateObj && safetyCount < 30) {
          const dateStr = tempDate.toISOString().split('T')[0];

          formReminderTimes.forEach(time => {
            newSchedules.push({
              id: `sch-${medId}-${dateStr}-${time.replace(/[: ]/g, '')}`,
              medicationId: medId,
              medicationName: formName,
              category: formCategory,
              dosage: formDosage,
              date: dateStr,
              time,
              status: 'upcoming'
            });
          });

          tempDate.setDate(tempDate.getDate() + (formFrequency === 'Alternate Days' ? 2 : 1));
          safetyCount++;
        }

        return [...baseSchedules, ...newSchedules];
      });

      if (onAddNotification) {
        onAddNotification({
          id: `notif-save-${Date.now()}`,
          title: 'Medication Updated',
          text: `"${formName}" details and incoming schedules have been updated.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    } else {
      // ===== ADD NEW MEDICINE =====
      const medId = `med-${Math.floor(100000 + Math.random() * 900000)}`;
      const newMed: Medication = {
        id: medId,
        name: formName,
        category: formCategory,
        dosage: formDosage,
        frequency: formFrequency,
        reminderTimes: formReminderTimes,
        startDate: formStartDate,
        endDate: formEndDate,
        instructions: formInstructions,
        active: true,
        color: formColor,
      };

      setMedications(prev => [newMed, ...prev]);

      // Generate schedule logs for this new medication
      const newSchedules: ScheduleItem[] = [];
      const startDateObj = new Date(formStartDate);
      const endDateObj = new Date(formEndDate);
      
      const tempDate = new Date(startDateObj);
      let safetyCount = 0;

      while (tempDate <= endDateObj && safetyCount < 30) {
        const dateStr = tempDate.toISOString().split('T')[0];

        formReminderTimes.forEach(time => {
          newSchedules.push({
            id: `sch-${medId}-${dateStr}-${time.replace(/[: ]/g, '')}`,
            medicationId: medId,
            medicationName: formName,
            category: formCategory,
            dosage: formDosage,
            date: dateStr,
            time,
            status: 'upcoming'
          });
        });

        tempDate.setDate(tempDate.getDate() + (formFrequency === 'Alternate Days' ? 2 : 1));
        safetyCount++;
      }

      setSchedules(prev => [...prev, ...newSchedules]);

      if (onAddNotification) {
        onAddNotification({
          id: `notif-add-${Date.now()}`,
          title: 'Medication Added Successfully',
          text: `"${formName}" was successfully on-boarded into your daily routine logs.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    }

    setIsFormOpen(false);
  };

  // Add/Remove single reminder time slots in form
  const handleToggleFormTime = (time: string) => {
    if (formReminderTimes.includes(time)) {
      if (formReminderTimes.length > 1) {
        setFormReminderTimes(prev => prev.filter(t => t !== time));
      }
    } else {
      setFormReminderTimes(prev => [...prev, time].sort());
    }
  };

  // Filter schedules specifically for Today (2026-05-30)
  const todaySchedules = schedules.filter(sch => sch.date === TODAY_STR);

  // Split schedules into Today, Missed, and Upcoming
  const todayTaken = todaySchedules.filter(sch => sch.status === 'taken');
  const todayTotal = todaySchedules.length;

  // Let's filter today's missed schedule items
  // Under the dashboard prompt, "Missed Medicines" tracks all overdue doses today and yesterday
  const missedSchedules = schedules.filter(sch => {
    // Overdue is either from previous days (date < today) with status !== taken OR today overdue
    const isPastDay = sch.date < TODAY_STR;
    const isOverdueToday = sch.date === TODAY_STR && sch.status === 'missed';
    return (isPastDay || isOverdueToday) && sch.status === 'missed';
  });

  // Upcoming Medicines covers today's upcoming and upcoming from future dates
  const upcomingSchedules = schedules.filter(sch => {
    const isFutureDay = sch.date > TODAY_STR;
    const isFutureToday = sch.date === TODAY_STR && sch.status === 'upcoming';
    return isFutureDay || isFutureToday;
  }).sort((a, b) => {
    // Sort chronology by date first, then time slot
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  // Today's scheduled (taken + missed + upcoming of "Today" only)
  const todayMedicinesList = todaySchedules;

  // Calendar Helpers
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar grid array
  const daysInMonthString = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);
  
  const calendarCells: { dateStr: string | null; dayNum: number | null }[] = [];
  
  // Fill in blanks for previous month offset
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ dateStr: null, dayNum: null });
  }

  // Fill in printable calendar days
  for (let day = 1; day <= daysInMonthString; day++) {
    const paddedDay = day < 10 ? `0${day}` : `${day}`;
    const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;
    calendarCells.push({ dateStr, dayNum: day });
  }

  // Filter schedule items for the currently selected date in the calendar
  const selectedDateSchedules = schedules.filter(sch => sch.date === selectedDateStr);

  return (
    <div id="medication-tracker-view" className="space-y-6">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Lucide.Clock4 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              Clinical Medication Management <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">2026 Treatment Schedule</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add medicines, configure complex reminder alarms, log daily dose compliance, and analyze health adherence.</p>
          </div>
        </div>

        {/* Navigation Tabs Pill inside the medication module */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.CalendarDays className="w-3.5 h-3.5" /> Schedule & Calendar
          </button>

          <button
            onClick={() => setActiveTab('edit-list')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === 'edit-list'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lucide.Settings className="w-3.5 h-3.5" /> Manage Medications
            <span className="ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded-full font-black">
              {medications.length}
            </span>
          </button>

          <button
            onClick={handleOpenAddForm}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Lucide.Plus className="w-3.5 h-3.5" /> Add Medicine
          </button>
        </div>
      </div>

      {/* METRICS METERS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-955/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Lucide.CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider block">Today's Intake Progress</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">{todayTaken.length}/{todayTotal}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                ({todayTotal > 0 ? Math.round((todayTaken.length / todayTotal) * 100) : 0}% Active)
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Lucide.AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider block">Missed Overdue Doses</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{missedSchedules.length}</span>
              <span className="text-[10px] text-rose-500 dark:text-rose-400 font-extrabold uppercase">Requires Attention</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Lucide.Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider block">Upcoming Schedules</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {upcomingSchedules.filter(s => s.date === TODAY_STR).length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Remaining Today</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-955/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Lucide.ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider block">Adherence Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">88%</span>
              <span className="text-[10px] text-indigo-505 dark:text-indigo-400 font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/45 px-1.5 py-0.5 rounded border border-indigo-150 dark:border-indigo-900/40">Optimal score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[450px]">
        {/* ==============================================
            PAGE 1: TRACKING & PILLS LISTINGS DASHBOARD
            ============================================== */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column A: Today's Intake (Left panel - 7 columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-550 dark:text-slate-300 flex items-center gap-1.5">
                    <Lucide.Activity className="text-emerald-500 w-4 h-4" /> Today's Medications List
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Click to change ingestion logs for May 30, 2026.</p>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-black border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg select-none">
                  {TODAY_STR}
                </span>
              </div>

              {todayMedicinesList.length === 0 ? (
                <div className="py-12 p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Lucide.CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">No scheduled pills remaining for today</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      All your medications have been completely reconciled, or your treatment lists for today are empty.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayMedicinesList.map(sch => {
                    const colorSet = colors.find(c => c.name === medications.find(m => m.id === sch.medicationId)?.color) || colors[2];
                    const medInstructions = medications.find(m => m.id === sch.medicationId)?.instructions;

                    return (
                      <div
                        key={sch.id}
                        className={`p-4.5 rounded-3xl border text-left transition relative flex flex-col justify-between ${
                          sch.status === 'taken'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-250 dark:border-emerald-800/30'
                            : sch.status === 'missed'
                            ? 'bg-rose-50/40 dark:bg-rose-955/10 border-rose-200 dark:border-rose-805/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-705 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Card header */}
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 px-2 py-0.5 rounded">
                              {sch.time}
                            </span>
                            
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              sch.status === 'taken'
                                ? 'bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                                : sch.status === 'missed'
                                ? 'bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
                                : 'bg-blue-100 dark:bg-blue-950/30 border-blue-150 dark:border-blue-900/40 text-blue-800 dark:text-blue-300'
                            }`}>
                              {sch.status}
                            </span>
                          </div>

                          {/* Medicine details */}
                          <div className="space-y-1">
                            <h4 className={`text-xs sm:text-sm font-black tracking-tight ${
                              sch.status === 'taken' ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-850 dark:text-slate-100'
                            }`}>
                              {sch.medicationName}
                            </h4>
                            <div className="flex gap-2 items-center flex-wrap select-none">
                              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase flex items-center gap-0.5">
                                <Lucide.Tag className="w-3 h-3" /> {sch.category}
                              </span>
                              <span className="text-slate-300">&#8226;</span>
                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono">
                                Dosage: {sch.dosage}
                              </span>
                            </div>
                          </div>

                          {medInstructions && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-150 dark:border-slate-800">
                              💡 {medInstructions}
                            </p>
                          )}
                        </div>

                        {/* Actions Foot */}
                        <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-slate-800/80 flex items-center justify-between gap-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold italic">
                            {sch.status === 'taken' && sch.takenAt ? `Logged at ${sch.takenAt}` : 'Awaiting tracking'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {sch.status !== 'taken' && (
                              <button
                                onClick={() => handleToggleScheduleStatus(sch.id, 'taken')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                              >
                                <Lucide.Check className="w-3 h-3" /> Mark Taken
                              </button>
                            )}

                            {sch.status !== 'missed' && (
                              <button
                                onClick={() => handleToggleScheduleStatus(sch.id, 'missed')}
                                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-semibold text-[10px] rounded-xl shrink-0 cursor-pointer"
                              >
                                Skip/Missed
                              </button>
                            )}

                            {sch.status !== 'upcoming' && (
                              <button
                                onClick={() => handleToggleScheduleStatus(sch.id, 'upcoming')}
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-300 rounded-lg shrink-0 cursor-pointer"
                                title="Reset status to Scheduled"
                              >
                                <Lucide.Undo2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column B: Right sidebar layout with Missed & Upcoming */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Box 1: Missed Medicines */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/85 dark:border-rose-900/35 p-5 text-left space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950/40 pb-2">
                  <h4 className="font-black text-rose-800 dark:text-rose-400 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                    <Lucide.AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> Overdue & Missed Doses
                  </h4>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/35 text-rose-800 dark:text-rose-300 font-mono font-black px-1.5 py-0.5 rounded-md">
                    {missedSchedules.length} Alert
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                  {missedSchedules.length === 0 ? (
                    <div className="py-4 text-center text-slate-400">
                      <Lucide.Smile className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-slate-650 dark:text-slate-350">Excellent! No missed dosages.</p>
                      <p className="text-[10px] text-slate-450">Your drug adherence log is absolute green.</p>
                    </div>
                  ) : (
                    missedSchedules.map(sch => (
                      <div key={sch.id} className="p-3 bg-rose-50/50 dark:bg-rose-955/10 border border-rose-100/70 dark:border-rose-900/30 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{sch.medicationName}</p>
                            <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                              Date: {sch.date} &#8226; {sch.time} ({sch.dosage})
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleToggleScheduleStatus(sch.id, 'taken')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
                          >
                            Take Now
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box 2: Upcoming Medicines list */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                    <Lucide.Hourglass className="w-4 h-4 text-blue-500 shrink-0" /> Incoming / Future Schedule
                  </h4>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 font-mono font-black px-1.5 py-0.5 rounded-md">
                    {upcomingSchedules.length} Total
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {upcomingSchedules.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      <Lucide.CalendarHeart className="w-8 h-8 text-indigo-400 mx-auto mb-1.5" />
                      <p className="text-xs">No upcoming schedules planned.</p>
                      <p className="text-[10px]">Check start dates in Medication setups.</p>
                    </div>
                  ) : (
                    upcomingSchedules.slice(0, 10).map(sch => (
                      <div key={sch.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-805 rounded-xl flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="font-black text-slate-850 dark:text-slate-100 text-xs leading-none">{sch.medicationName}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold font-mono uppercase tracking-tight">
                            {sch.date === TODAY_STR ? 'Today' : sch.date} &#8226; {sch.time}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/35 px-2 py-0.5 border border-indigo-150 dark:border-indigo-900/30 rounded">
                          {sch.dosage}
                        </span>
                      </div>
                    ))
                  )}
                  
                  {upcomingSchedules.length > 10 && (
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 italic pt-1">
                      + {upcomingSchedules.length - 10} more future schedules. Use Calendar view.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 2: CALENDAR & INTEGRATED SCHEDULE VIEWER (LIST PATTERN)
            ======================================================== */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
            
            {/* Grid 1: Calendar Monthly Widget (Left Panel - 7 columns) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                    <Lucide.CalendarDays className="w-4.5 h-4.5 text-blue-500" /> Date Selection Matrix
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-tight">Choose any calendar day to audit scheduled clinical dosages.</p>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl p-0.5 border border-slate-150 dark:border-slate-800">
                  <button
                    onClick={() => setCalendarViewMode('calendar')}
                    className={`px-3 py-1 rounded-lg text-[10.5px] font-black tracking-tight flex items-center gap-1 transition ${
                      calendarViewMode === 'calendar' 
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
                    }`}
                  >
                    <Lucide.LayoutGrid className="w-3 h-3" /> Calendar Grid
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('list')}
                    className={`px-3 py-1 rounded-lg text-[10.5px] font-black tracking-tight flex items-center gap-1 transition ${
                      calendarViewMode === 'list' 
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
                    }`}
                  >
                    <Lucide.List className="w-3 h-3" /> Agenda List
                  </button>
                </div>
              </div>

              {calendarViewMode === 'calendar' ? (
                /* Month Calendar view grid component */
                <div className="space-y-4">
                  
                  {/* Navigator Bar */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 px-2.5 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-xs font-black transition cursor-pointer"
                    >
                      &larr; Prev
                    </button>
                    
                    <span className="text-xs sm:text-sm font-black text-slate-850 dark:text-slate-100">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>

                    <button
                      onClick={handleNextMonth}
                      className="p-1 px-2.5 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-xs font-black transition cursor-pointer"
                    >
                      Next &rarr;
                    </button>
                  </div>

                  {/* Calendar Grid proper */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {/* Header cells */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                      <span key={i} className="text-[10px] font-black text-slate-400 py-1 uppercase">{wd}</span>
                    ))}

                    {/* Cells */}
                    {calendarCells.map((cell, idx) => {
                      if (!cell.dateStr) {
                        return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl" />;
                      }

                      const dateKey = cell.dateStr;
                      const hasSchedules = schedules.filter(s => s.date === dateKey);
                      const isSelected = selectedDateStr === dateKey;
                      const isToday = cell.dateStr === TODAY_STR;

                      // Calculate colored dots representation
                      const doseTakenCount = hasSchedules.filter(s => s.status === 'taken').length;
                      const doseMissedCount = hasSchedules.filter(s => s.status === 'missed').length;
                      const doseUpcomingCount = hasSchedules.filter(s => s.status === 'upcoming').length;

                      return (
                        <div
                          key={`day-${cell.dayNum}`}
                          onClick={() => setSelectedDateStr(dateKey)}
                          className={`aspect-square p-1.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between items-center ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 shadow-sm font-black translate-y-[-1px]'
                              : isToday
                              ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                              : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-white dark:text-slate-950' : 'text-slate-700 dark:text-slate-200'}`}>
                            {cell.dayNum}
                          </span>

                          {/* Action indicator dots inside individual calendar day cells */}
                          <div className="flex gap-0.5 justify-center w-full flex-wrap h-1.5">
                            {doseTakenCount > 0 && (
                              <span className="w-1 h-1 rounded-full bg-emerald-500" title={`${doseTakenCount} taken`} />
                            )}
                            {doseMissedCount > 0 && (
                              <span className="w-1 h-1 rounded-full bg-rose-500" title={`${doseMissedCount} missed`} />
                            )}
                            {doseUpcomingCount > 0 && (
                              <span className="w-1 h-1 rounded-full bg-blue-500" title={`${doseUpcomingCount} scheduled`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calibration legend info */}
                  <div className="flex gap-4 items-center justify-center p-2.5 bg-slate-50/60 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850 text-[10px] select-none text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Taken Doses
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Missed Doses
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Upcoming Doses
                    </span>
                  </div>

                </div>
              ) : (
                /* Master Agenda List view grouped by upcoming dates */
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {Array.from(new Set(schedules.map(sch => sch.date))).sort().map(grpDate => {
                    const groupItems = schedules.filter(sch => sch.date === grpDate);
                    const isPassedDate = grpDate < TODAY_STR;
                    const isTodayDate = grpDate === TODAY_STR;

                    return (
                      <div key={grpDate} className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1 pt-2">
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 font-mono">
                            {grpDate} {isTodayDate && <span className="text-[9.5px] bg-blue-100 dark:bg-blue-955/40 text-blue-700 dark:text-blue-300 px-1 rounded uppercase tracking-wider font-extrabold ml-1 inline-block">Today</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                            {groupItems.length} active doses
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {groupItems.map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedDateStr(grpDate);
                                handleToggleScheduleStatus(item.id);
                              }}
                              className={`p-3 rounded-2xl border flex justify-between items-center gap-2 cursor-pointer transition ${
                                item.status === 'taken'
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-150 dark:border-emerald-900/30 text-slate-500 dark:text-slate-500 line-through'
                                  : item.status === 'missed'
                                  ? 'bg-rose-50/40 dark:bg-rose-955/10 border-rose-150 dark:border-rose-900/30'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{item.medicationName}</p>
                                <p className="text-[9.5px] text-slate-450 dark:text-slate-400 font-semibold font-mono">Time: {item.time} ({item.dosage})</p>
                              </div>
                              <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded border uppercase font-extrabold ${
                                item.status === 'taken'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-905 text-emerald-800 dark:text-emerald-300'
                                  : item.status === 'missed'
                                  ? 'bg-rose-100 dark:bg-rose-950/30 border-rose-200 dark:border-rose-905 text-rose-800 dark:text-rose-300'
                                  : 'bg-blue-100 dark:bg-blue-950/30 border-blue-150 dark:border-blue-905 text-blue-800 dark:text-blue-300'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Grid 2: Selected Date Dosage Checklist panel (Right sidebar) */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] bg-slate-900 dark:bg-slate-950 text-blue-400 dark:text-blue-500 font-mono uppercase px-2.5 py-1 rounded-md tracking-wider font-extrabold inline-block select-none">
                  DAY INSPECTOR CONSOLE
                </span>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Lucide.Activity className="w-4 h-4 text-emerald-500" /> Agenda for {selectedDateStr}
                </h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  {selectedDateStr === TODAY_STR 
                    ? "Displaying today's live treatment logs. You can mark items off directly here."
                    : `Schedules calculated for ${selectedDateStr}. Click any dose inside lists to toggle status.`}
                </p>
              </div>

              {/* Day scheduled logs list container */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 p-4.5 space-y-3 flex-1 min-h-[220px] max-h-[340px] overflow-y-auto">
                {selectedDateSchedules.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 h-full flex flex-col items-center justify-center space-y-2">
                    <Lucide.CalendarX className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-650 dark:text-slate-350">No scheduled intakes recorded</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-tight">This date sits outside treatment schedules, or medication lists were modified.</p>
                  </div>
                ) : (
                  selectedDateSchedules.map(sch => (
                    <div
                      key={sch.id}
                      onClick={() => handleToggleScheduleStatus(sch.id)}
                      className={`p-3 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2.5 transition cursor-pointer select-none ${
                        sch.status === 'taken' ? 'opacity-70 line-through' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{sch.medicationName}</p>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium font-mono">
                          🕒 Time slots: {sch.time} ({sch.dosage})
                        </p>
                      </div>

                      <div className="shrink-0">
                        {sch.status === 'taken' ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Lucide.Check className="w-3.5 h-3.5" />
                          </span>
                        ) : sch.status === 'missed' ? (
                          <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white" title="Missed">
                            <Lucide.Minus className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" title="Scheduled upcoming" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Live Adherence Ad-doc summary */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-955/20 border border-blue-150 dark:border-blue-900/30 rounded-2xl text-[10.5px] text-blue-800 dark:text-blue-300 leading-relaxed font-semibold">
                <div className="flex gap-2 items-start">
                  <Lucide.Activity className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-xs text-blue-900 dark:text-blue-200 block pb-0.5">May Treatment Advisory</span>
                    Maintain routine and schedule. Take tablets exactly at defined timestamps. Ingesting antibiotics without missing slots protects therapeutic levels in tissues.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 3: MASTER LISTS & MANAGEMENT (ADD / EDIT / DELETE FORM)
            ======================================================== */}
        {activeTab === 'edit-list' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-550 dark:text-slate-200 flex items-center gap-1.5">
                  <Lucide.ClipboardList className="w-4.5 h-4.5 text-indigo-600" /> Active Medications Library
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-505">Manage prescription metadata, dosages, intervals, and dates of treatments.</p>
              </div>

              <button
                onClick={handleOpenAddForm}
                className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer shadow-xs"
              >
                <Lucide.Plus className="w-4 h-4" /> Add Medication Scheme
              </button>
            </div>

            {/* Medications matrix list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map(med => {
                const colorSet = colors.find(c => c.name === med.color) || colors[2];
                // Calculate compliance rates dynamically for this pill
                const medDoses = schedules.filter(s => s.medicationId === med.id);
                const medTaken = medDoses.filter(s => s.status === 'taken').length;
                const medTotal = medDoses.filter(s => s.status !== 'upcoming').length;
                const adherence = medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 100;

                return (
                  <div key={med.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow hover:border-slate-350 dark:hover:border-slate-700 transition-all">
                    
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${colorSet.bg}`}>
                          {med.category}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${colorSet.fill}`} />
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold font-mono">Active Monitoring</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-tight leading-snug">
                          {med.name}
                        </h4>
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono">Dosage: {med.dosage}</span>
                          <span className="text-slate-250">&#8226;</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-455 font-semibold uppercase tracking-wider">{med.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline logs */}
                    <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 text-[11px] text-slate-550 dark:text-slate-300 space-y-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-455 dark:text-slate-400">Course Timeline:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-350">{med.startDate} to {med.endDate}</span>
                      </div>
                      
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-455 dark:text-slate-400">Scheduled alarms:</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-350">
                          {med.reminderTimes.join(' , ')}
                        </span>
                      </div>

                      {med.instructions && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl mt-1 text-slate-500 dark:text-slate-400">
                          <strong>Note:</strong> {med.instructions}
                        </div>
                      )}
                    </div>

                    {/* Compliance Progress meter bar */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-400">Adherence compliance</span>
                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">{adherence}% ({medTaken}/{medTotal} taken)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-150 dark:border-slate-850 p-0.5">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${adherence}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center justify-end gap-1.5 pt-1.5">
                      <button
                        onClick={() => handleOpenEditForm(med)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10.5px] rounded-xl flex items-center gap-1 transition cursor-pointer"
                        title="Edit clinical details"
                      >
                        <Lucide.Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteMedication(med.id, med.name)}
                        className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/45 text-rose-700 dark:text-rose-400 font-bold text-[10.5px] rounded-xl flex items-center gap-1 transition cursor-pointer"
                        title="Delete scheduling"
                      >
                        <Lucide.Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>

                  </div>
                );
              })}

              {medications.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto">
                    <Lucide.ClipboardList className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Your medication library is empty</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Click the "Add Medicine" button above to register your first treatment schedules with reminders.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          SLIDING DRAWER / DIALOG MODAL: ADD & EDIT MEDICINE FORM
          ======================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header banner */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between text-left">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Lucide.Pill className="w-5 h-5 text-emerald-600 animate-spin" />
                  {editingMedication ? `Modify: ${editingMedication.name}` : 'Register New Medication'}
                </h3>
                <p className="text-[10.5px] text-slate-450 dark:text-slate-400 leading-none">Complete medication metadata details to map reminder timers.</p>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 flex items-center justify-center transition"
              >
                <Lucide.X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <form onSubmit={handleSaveMedication} className="p-6 space-y-5 flex-1 overflow-y-auto text-left">
              
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">Medicine Brand Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Metformin Glucophage 500mg, Paracetamol"
                  className="w-full px-4.5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-2xl text-xs font-semibold shadow-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Grid: Category and Dosage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 font-bold">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Therapeutic Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-4.5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-2xl text-xs font-semibold shadow-xs text-slate-800 dark:text-slate-100"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 font-bold">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Dosage Amount</label>
                  <input
                    type="text"
                    required
                    value={formDosage}
                    onChange={e => setFormDosage(e.target.value)}
                    placeholder="e.g. 1 Pill, 1 Capsule, 5ml, 2 tablets"
                    className="w-full px-4.5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-2xl text-xs font-semibold shadow-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Grid: Frequency and Start/End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-bold">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Alarm Frequency</label>
                  <select
                    value={formFrequency}
                    onChange={e => setFormFrequency(e.target.value as Medication['frequency'])}
                    className="w-full px-4.5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-2xl text-xs font-semibold shadow-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Daily" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Daily Intake</option>
                    <option value="Twice Daily" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Twice Daily Course</option>
                    <option value="Thrice Daily" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Thrice Daily Course</option>
                    <option value="Alternate Days" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Every Alternate Day</option>
                    <option value="Once Weekly" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Once Weekly</option>
                  </select>
                </div>

                <div className="space-y-1.5 font-bold">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Treatment Timeline Course</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono shadow-xs text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-slate-400 dark:text-slate-500 text-xs text-center">to</span>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={e => setFormEndDate(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono shadow-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Times Alarms Selector (Multiple selections) */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-450 dark:text-slate-400 block">Set Daily Reminder Times (Alarms)</label>
                
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TIMES.map(time => {
                    const isSelected = formReminderTimes.includes(time);
                    return (
                      <button
                        type="button"
                        key={time}
                        onClick={() => handleToggleFormTime(time)}
                        className={`px-3 py-1.5 text-[10.5px] font-mono font-black border rounded-xl transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                  Tip: Toggle multiple alarm timestamps. Alarm widgets will ring/notify on the exact designated times.
                </p>
              </div>

              {/* Instructions and Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Instructions & Notes</label>
                <textarea
                  value={formInstructions}
                  onChange={e => setFormInstructions(e.target.value)}
                  placeholder="e.g. Take post lunch with lukewarm water/Avoid consuming dairy concurrently..."
                  className="w-full px-4.5 py-3 h-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-2xl text-xs font-semibold shadow-xs text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Pin Accent Color selection */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-455 dark:text-slate-400 block">Pin Theme Color Accent</label>
                <div className="flex gap-3">
                  {colors.map(col => {
                    const isSelected = formColor === col.name;
                    return (
                      <button
                        type="button"
                        key={col.name}
                        onClick={() => setFormColor(col.name)}
                        className={`w-8 h-8 rounded-full ${col.fill} transition cursor-pointer ${
                          isSelected ? 'ring-4 ring-offset-2 ring-slate-450 dark:ring-slate-300 ring-offset-white dark:ring-offset-slate-900 scale-105' : 'hover:scale-105'
                        }`}
                        title={col.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Button Action submit */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center justify-end gap-3 font-semibold">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md"
                >
                  {editingMedication ? 'Save Changes' : 'Register Medication'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
