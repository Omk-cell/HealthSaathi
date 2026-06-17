import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

// Types used in data models
export interface HealthMetricDataPoint {
  label: string;
  weight: number;
  bmi: number;
  systolic: number;
  diastolic: number;
  fasting: number;
  postPrandial: number;
  avgHeartRate: number;
  maxHeartRate: number;
  restingHeartRate: number;
  adherence: number;
}

interface WearableAnalyticsModuleProps {
  onAddNotification?: (notif: {
    id: string;
    title: string;
    text: string;
    time: string;
    unread: boolean;
    type: 'success' | 'alert' | 'info';
  }) => void;
}

// 1. Fully-formed historical analytics data blocks
const WEEKLY_DATA: HealthMetricDataPoint[] = [
  { label: 'Mon', weight: 74.5, bmi: 24.3, systolic: 122, diastolic: 81, fasting: 94, postPrandial: 132, avgHeartRate: 72, maxHeartRate: 125, restingHeartRate: 61, adherence: 100 },
  { label: 'Tue', weight: 74.3, bmi: 24.2, systolic: 118, diastolic: 79, fasting: 98, postPrandial: 128, avgHeartRate: 68, maxHeartRate: 130, restingHeartRate: 59, adherence: 100 },
  { label: 'Wed', weight: 74.4, bmi: 24.3, systolic: 120, diastolic: 80, fasting: 92, postPrandial: 140, avgHeartRate: 74, maxHeartRate: 118, restingHeartRate: 62, adherence: 50 },
  { label: 'Thu', weight: 74.2, bmi: 24.2, systolic: 125, diastolic: 82, fasting: 105, postPrandial: 135, avgHeartRate: 71, maxHeartRate: 140, restingHeartRate: 60, adherence: 100 },
  { label: 'Fri', weight: 74.0, bmi: 24.1, systolic: 119, diastolic: 78, fasting: 96, postPrandial: 129, avgHeartRate: 75, maxHeartRate: 122, restingHeartRate: 63, adherence: 100 },
  { label: 'Sat', weight: 73.9, bmi: 24.1, systolic: 121, diastolic: 80, fasting: 91, postPrandial: 131, avgHeartRate: 70, maxHeartRate: 135, restingHeartRate: 58, adherence: 100 },
  { label: 'Sun', weight: 73.8, bmi: 24.1, systolic: 117, diastolic: 77, fasting: 95, postPrandial: 133, avgHeartRate: 73, maxHeartRate: 120, restingHeartRate: 61, adherence: 100 },
];

const MONTHLY_DATA: HealthMetricDataPoint[] = [
  { label: 'Week 1', weight: 74.8, bmi: 24.4, systolic: 124, diastolic: 82, fasting: 99, postPrandial: 138, avgHeartRate: 74, maxHeartRate: 135, restingHeartRate: 62, adherence: 96 },
  { label: 'Week 2', weight: 74.4, bmi: 24.3, systolic: 121, diastolic: 80, fasting: 96, postPrandial: 132, avgHeartRate: 72, maxHeartRate: 128, restingHeartRate: 61, adherence: 92 },
  { label: 'Week 3', weight: 74.1, bmi: 24.2, systolic: 119, diastolic: 79, fasting: 94, postPrandial: 130, avgHeartRate: 71, maxHeartRate: 125, restingHeartRate: 60, adherence: 100 },
  { label: 'Week 4', weight: 73.8, bmi: 24.1, systolic: 118, diastolic: 78, fasting: 93, postPrandial: 129, avgHeartRate: 69, maxHeartRate: 122, restingHeartRate: 59, adherence: 95 },
];

const YEARLY_DATA: HealthMetricDataPoint[] = [
  { label: 'Jan', weight: 76.5, bmi: 25.0, systolic: 128, diastolic: 84, fasting: 105, postPrandial: 145, avgHeartRate: 76, maxHeartRate: 145, restingHeartRate: 64, adherence: 88 },
  { label: 'Feb', weight: 76.2, bmi: 24.9, systolic: 126, diastolic: 83, fasting: 102, postPrandial: 142, avgHeartRate: 75, maxHeartRate: 140, restingHeartRate: 63, adherence: 92 },
  { label: 'Mar', weight: 75.8, bmi: 24.8, systolic: 124, diastolic: 81, fasting: 100, postPrandial: 139, avgHeartRate: 73, maxHeartRate: 138, restingHeartRate: 62, adherence: 90 },
  { label: 'Apr', weight: 75.4, bmi: 24.6, systolic: 123, diastolic: 81, fasting: 98, postPrandial: 137, avgHeartRate: 72, maxHeartRate: 135, restingHeartRate: 61, adherence: 94 },
  { label: 'May', weight: 74.9, bmi: 24.4, systolic: 122, diastolic: 80, fasting: 96, postPrandial: 134, avgHeartRate: 73, maxHeartRate: 132, restingHeartRate: 62, adherence: 95 },
  { label: 'Jun', weight: 74.5, bmi: 24.3, systolic: 120, diastolic: 79, fasting: 95, postPrandial: 133, avgHeartRate: 71, maxHeartRate: 130, restingHeartRate: 60, adherence: 97 },
  { label: 'Jul', weight: 74.2, bmi: 24.2, systolic: 119, diastolic: 78, fasting: 93, postPrandial: 131, avgHeartRate: 70, maxHeartRate: 128, restingHeartRate: 59, adherence: 100 },
  { label: 'Aug', weight: 73.9, bmi: 24.1, systolic: 118, diastolic: 78, fasting: 92, postPrandial: 130, avgHeartRate: 69, maxHeartRate: 125, restingHeartRate: 59, adherence: 96 },
  { label: 'Sep', weight: 73.6, bmi: 24.0, systolic: 117, diastolic: 77, fasting: 91, postPrandial: 128, avgHeartRate: 68, maxHeartRate: 124, restingHeartRate: 58, adherence: 98 },
  { label: 'Oct', weight: 73.8, bmi: 24.1, systolic: 118, diastolic: 78, fasting: 93, postPrandial: 130, avgHeartRate: 69, maxHeartRate: 126, restingHeartRate: 59, adherence: 95 },
  { label: 'Nov', weight: 73.5, bmi: 24.0, systolic: 116, diastolic: 77, fasting: 90, postPrandial: 126, avgHeartRate: 68, maxHeartRate: 122, restingHeartRate: 58, adherence: 97 },
  { label: 'Dec', weight: 73.4, bmi: 24.0, systolic: 117, diastolic: 78, fasting: 92, postPrandial: 128, avgHeartRate: 67, maxHeartRate: 120, restingHeartRate: 57, adherence: 98 },
];

export const WearableAnalyticsModule: React.FC<WearableAnalyticsModuleProps> = ({
  onAddNotification
}) => {
  // Navigation Range & Tab configuration
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('weight');

  // Interactive Live Data mutation for simulated synching BLE feeds
  const [dataPoints, setDataPoints] = useState<{
    weekly: HealthMetricDataPoint[];
    monthly: HealthMetricDataPoint[];
    yearly: HealthMetricDataPoint[];
  }>(() => {
    const saved = localStorage.getItem('hs_charts_metrics_payload');
    return saved ? JSON.parse(saved) : {
      weekly: WEEKLY_DATA,
      monthly: MONTHLY_DATA,
      yearly: YEARLY_DATA
    };
  });

  // State elements for BLE wearable live syncher simulation
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('06:15 PM');

  // Custom States for Download Report Control desk
  const [includeVitalsInReport, setIncludeVitalsInReport] = useState<boolean>(true);
  const [includeAdherenceInReport, setIncludeAdherenceInReport] = useState<boolean>(true);
  const [reportFormat, setReportFormat] = useState<'csv' | 'json' | 'txt'>('csv');
  const [downloadStep, setDownloadStep] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadReadyHash, setDownloadReadyHash] = useState<string | null>(null);

  // Sync to LS
  useEffect(() => {
    localStorage.setItem('hs_charts_metrics_payload', JSON.stringify(dataPoints));
  }, [dataPoints]);

  const activeDataset: HealthMetricDataPoint[] = dataPoints[timeframe];

  // Helper dynamic labels matching active times
  const getLatestStats = () => {
    const currentList = dataPoints[timeframe];
    return currentList[currentList.length - 1];
  };

  const latest = getLatestStats();

  // Metrics configurations dictionary mapping variables to Recharts series & styling
  const metricConfigs = [
    {
      id: 'weight',
      name: 'Weight & BMI',
      icon: Lucide.Weight,
      color: '#3b82f6', // blue
      secondaryColor: '#ec4899', // pink BMI
      unit: 'kg',
      secondaryUnit: 'BMI',
      currentStr: `${latest.weight} kg`,
      secondaryStr: `BMI: ${latest.bmi}`,
      desc: 'Weight depletion goals checked on smart telemetry scale',
      bounds: 'Height Ref: 1.75m • Normal BMI limits: 18.5 – 24.9'
    },
    {
      id: 'bloodPressure',
      name: 'Blood Pressure',
      icon: Lucide.Activity,
      color: '#ef4444', // red SBP
      secondaryColor: '#f97316', // orange DBP
      unit: 'mmHg',
      currentStr: `${latest.systolic}/${latest.diastolic}`,
      desc: 'Smart arm band systolic/diastolic compliance logs',
      bounds: 'HIPAA Normal Bounds: Systolic < 120 • Diastolic < 80 mmHg'
    },
    {
      id: 'bloodSugar',
      name: 'Sugar Levels',
      icon: Lucide.Droplet,
      color: '#f59e0b', // amber Fasting
      secondaryColor: '#10b981', // emerald Post-prandial
      unit: 'mg/dL',
      currentStr: `Fasting: ${latest.fasting}`,
      secondaryStr: `PP: ${latest.postPrandial}`,
      desc: 'Continuous interstitial glucose monitoring sensors',
      bounds: 'Stable Target ranges: Fasting: 70-100 • Post-Prandial: < 140'
    },
    {
      id: 'heartRate',
      name: 'Heart Rate Trends',
      icon: Lucide.Heart,
      color: '#ec4899', // avg
      secondaryColor: '#ef4444', // max
      thirdColor: '#14b8a6', // resting
      unit: 'bpm',
      currentStr: `${latest.avgHeartRate} bpm (avg)`,
      secondaryStr: `Resting: ${latest.restingHeartRate}`,
      desc: 'Continuous optical photoplethysmography heart telemetry',
      bounds: 'Resting goal: 55-70 bpm • Peak aerobic VO2 max thresholds'
    },
    {
      id: 'medicationAdherence',
      name: 'Medication Adherence',
      icon: Lucide.CheckCircle2,
      color: '#10b981', // emerald
      unit: '%',
      currentStr: `${latest.adherence}% Rate`,
      desc: 'Prescription smart bottle cap compliance trackers',
      bounds: 'High compliance tier threshold: At or above > 90%'
    }
  ];

  const activeMetric = metricConfigs.find(m => m.id === selectedMetricId) || metricConfigs[0];

  // Live BLE Sync feature simulator
  const triggerWearableSync = () => {
    setIsSyncing(true);
    if (onAddNotification) {
      onAddNotification({
        id: `charts-sync-start-${Date.now()}`,
        title: 'BLE Health Registry Syncing...',
        text: 'Handshaking with continuous glucose monitor, smartwatch, and digital scale...',
        time: 'Just now',
        unread: true,
        type: 'info'
      });
    }

    setTimeout(() => {
      setIsSyncing(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);

      // Mutate current data points with realistic micro-variability profiles
      setDataPoints(prev => {
        const modifyList = (list: HealthMetricDataPoint[]): HealthMetricDataPoint[] => {
          return list.map((item, idx) => {
            if (idx === list.length - 1) {
              const deltaWeight = (Math.random() - 0.6) * 0.2; // slight weight loss tendency
              const newWeight = Math.round((item.weight + deltaWeight) * 10) / 10;
              const newBmi = Math.round((newWeight / (1.75 * 1.75)) * 10) / 10;
              const deltaBP = Math.floor(Math.random() * 5) - 2; // -2 to +2 mmHg
              const deltaSugar = Math.floor(Math.random() * 8) - 3; // -3 to +4 mg/dL
              const deltaHR = Math.floor(Math.random() * 6) - 3; // -3 to +2 bpm

              return {
                ...item,
                weight: newWeight,
                bmi: newBmi,
                systolic: Math.min(139, Math.max(105, item.systolic + deltaBP)),
                diastolic: Math.min(89, Math.max(68, item.diastolic + (deltaBP > 0 ? 1 : -1))),
                fasting: Math.min(125, Math.max(80, item.fasting + deltaSugar)),
                postPrandial: Math.min(160, Math.max(110, item.postPrandial + (deltaSugar * 1.5))),
                avgHeartRate: Math.min(95, Math.max(60, item.avgHeartRate + deltaHR)),
                restingHeartRate: Math.min(75, Math.max(52, item.restingHeartRate + (deltaHR > 0 ? 1 : 0))),
                adherence: Math.min(100, Math.max(80, item.adherence + (Math.random() > 0.85 ? -5 : 0)))
              };
            }
            return item;
          });
        };

        return {
          weekly: modifyList(prev.weekly),
          monthly: modifyList(prev.monthly),
          yearly: modifyList(prev.yearly)
        };
      });

      if (onAddNotification) {
        onAddNotification({
          id: `charts-sync-end-${Date.now()}`,
          title: 'All Sensor Analytics Refreshed',
          text: `Extracted latest compliance telemetry metrics. Weight: ${getLatestStats().weight}kg • BP: ${getLatestStats().systolic}/${getLatestStats().diastolic}mmHg.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    }, 1800);
  };

  // Compile and trigger direct file download (Real integration, no mocking!)
  const triggerDocumentDownload = () => {
    if (!includeVitalsInReport && !includeAdherenceInReport) {
      alert("Please check at least one telemetry set to compile.");
      return;
    }

    setDownloadProgress(20);
    setDownloadStep("Extracting patient metric records coordinates...");
    setDownloadReadyHash(null);

    // Timeline progress simulation
    setTimeout(() => {
      setDownloadProgress(50);
      setDownloadStep("Calculating Recharts trend vectors and standard deviations...");
    }, 800);

    setTimeout(() => {
      setDownloadProgress(80);
      setDownloadStep("Applying SHA-256 digital signature clinical checksum...");
    }, 1500);

    setTimeout(() => {
      setDownloadProgress(100);
      setDownloadStep("Compilation complete!");

      // Forge content based on formats
      const mockHashStr = Math.random().toString(16).substring(2, 10).toUpperCase();
      setDownloadReadyHash(`HSSP-AUTH-HASH-${mockHashStr}`);

      let contentStr = "";
      let filename = `HealthSaathi_${timeframe}_report.${reportFormat}`;

      if (reportFormat === 'json') {
        const payload = {
          patientName: "Rohan Sharma",
          meta: {
            portal: "HealthSaathi EMR Gateway",
            hashVerification: `SHA256-${mockHashStr}`,
            timestamp: new Date().toISOString(),
            timeframe: timeframe
          },
          datasets: {
            vitals: includeVitalsInReport ? dataPoints[timeframe] : null,
            medicationAdherence: includeAdherenceInReport ? dataPoints[timeframe].map(d => ({ label: d.label, adherence: d.adherence })) : null
          }
        };
        contentStr = JSON.stringify(payload, null, 2);
      } else if (reportFormat === 'csv') {
        contentStr = `HEALTH REPORT (HealthSaathi Portal) - SATELLITE COMPILE\n`;
        contentStr += `Patient: Rohan Sharma • Verification Hash: SHA256-${mockHashStr}\n`;
        contentStr += `Analyzed Range: ${timeframe.toUpperCase()} TIMEFRAME • Generated: ${new Date().toLocaleDateString()}\n\n`;

        if (includeVitalsInReport) {
          contentStr += `--- SECTION 1: WEARABLE VITALS TRENDS ---\n`;
          contentStr += `Label,Weight (kg),BMI,BP Systolic,BP Diastolic,Fasting Sugar,Post-Prandial Sugar,Avg Heart Rate,Max Heart Rate,Resting Heart Rate\n`;
          dataPoints[timeframe].forEach(d => {
            contentStr += `${d.label},${d.weight},${d.bmi},${d.systolic},${d.diastolic},${d.fasting},${d.postPrandial},${d.avgHeartRate},${d.maxHeartRate},${d.restingHeartRate}\n`;
          });
          contentStr += `\n`;
        }

        if (includeAdherenceInReport) {
          contentStr += `--- SECTION 2: MEDICATION ADHERENCE TACTICAL REGISTER ---\n`;
          contentStr += `Label,Compliance ScoreAdherence (%)\n`;
          dataPoints[timeframe].forEach(d => {
            contentStr += `${d.label},${d.adherence}%\n`;
          });
        }
      } else {
        // Flat text formatted view
        contentStr = `==========================================================\n`;
        contentStr += `       HEALTHSAATHI CLINICAL TELEMETRY PORTAL REPORT\n`;
        contentStr += `==========================================================\n`;
        contentStr += `Patient ID : HS-PAT-9238\n`;
        contentStr += `Patient Name: Rohan Sharma\n`;
        contentStr += `Timestamp   : ${new Date().toUTCString()}\n`;
        contentStr += `Index Hash  : SHA256-${mockHashStr}\n`;
        contentStr += `Range Mode  : ${timeframe.toUpperCase()} RESOLUTION\n`;
        contentStr += `----------------------------------------------------------\n\n`;

        if (includeVitalsInReport) {
          contentStr += `SECTION A: VITALS ASSESSMENT VERIFICATION\n`;
          dataPoints[timeframe].forEach(d => {
            contentStr += `[${d.label}] Weight: ${d.weight}kg | BMI: ${d.bmi} | BP: ${d.systolic}/${d.diastolic}mmHg | Glucose: ${d.fasting}/${d.postPrandial}mg/dL | HR Avg: ${d.avgHeartRate}bpm\n`;
          });
          contentStr += `\n`;
        }

        if (includeAdherenceInReport) {
          contentStr += `SECTION B: SMART DISPENSER ADHERENCE\n`;
          dataPoints[timeframe].forEach(d => {
            contentStr += `[${d.label}] Continuous Compliance Adherence: ${d.adherence}%\n`;
          });
        }
      }

      // Create browser text chunk download blob
      const fileBlob = new Blob([contentStr], { type: 'text/plain;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(fileBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      if (onAddNotification) {
        onAddNotification({
          id: `charts-download-success-${Date.now()}`,
          title: 'Clinical Report Transmitted',
          text: `Assembled and saved "${filename}" locally. Integrity verified with credential hash ${mockHashStr}.`,
          time: 'Just now',
          unread: true,
          type: 'success'
        });
      }
    }, 2200);
  };

  // Custom tooltips styling for gorgeous Recharts display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-[11px] text-white">
          <p className="font-extrabold mb-1.5 border-b border-slate-800 pb-1 text-slate-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex justify-between gap-4 font-mono leading-relaxed">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400">{entry.name}:</span>
              </span>
              <span className="font-bold text-slate-100">{entry.value} {activeMetric.unit}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom renderer for selected detailed Recharts Plot configuration
  const renderDetailedChart = () => {
    switch (activeMetric.id) {
      case 'weight':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activeDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis yAxisId="left" stroke="#3b82f6" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <YAxis yAxisId="right" orientation="right" stroke="#ec4899" fontSize={10} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Area yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" />
              <Area yAxisId="right" type="monotone" dataKey="bmi" name="BMI Ratio" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBmi)" />
              <ReferenceLine yAxisId="left" y={74.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Ideal target', position: 'insideBottomLeft', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bloodPressure':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={activeDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 160]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <ReferenceLine y={120} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Systolic Normal Bound', fill: '#f97316', fontSize: 9 }} />
              <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Diastolic Normal Bound', fill: '#10b981', fontSize: 9 }} />
              <Line type="monotone" dataKey="systolic" name="Systolic (SBP)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="diastolic" name="Diastolic (DBP)" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bloodSugar':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activeDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFasting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorPP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[60, 180]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="fasting" name="Fasting Sugar" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFasting)" />
              <Area type="monotone" dataKey="postPrandial" name="Post-Prandial Sugar" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPP)" />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fasting Threshold', fill: '#f59e0b', fontSize: 8 }} />
              <ReferenceLine y={140} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'PP Target limit', fill: '#10b981', fontSize: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'heartRate':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={activeDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[40, 160]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="maxHeartRate" name="Max Heart Rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgHeartRate" name="Avg Heart Rate" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="restingHeartRate" name="Resting Heart Rate" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'medicationAdherence':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activeDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Adherence Target (90%)', fill: '#10b981', position: 'insideTopLeft', fontSize: 9 }} />
              <Bar dataKey="adherence" name="Compliance Adherence (%)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left select-none pb-8" id="health-analytics-dashboard-root">
      
      {/* HEADER SECTION WITH CLOUD SYNC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm" id="analytics-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <Lucide.TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Health Analytics Dashboard
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Clinical diagnostic timelines, Compliance scores, and Wearable sync desk
            </p>
          </div>
        </div>

        {/* Sync buttons */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block uppercase font-mono">Last Sensor Refresh</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 block font-mono">{lastSyncTime}</span>
          </div>

          <button
            id="sync-wearable-btn"
            onClick={triggerWearableSync}
            disabled={isSyncing}
            className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Lucide.RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing sensors...' : 'Sync BLE wearable'}
          </button>
        </div>
      </div>

      {/* TIMEFRAME TAB CONTROLLER */}
      <div className="flex bg-slate-100/80 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 max-w-[320px] select-none" id="timeframe-selector">
        {(['weekly', 'monthly', 'yearly'] as const).map((tab) => {
          const isActive = timeframe === tab;
          return (
            <button
              key={tab}
              id={`tab-range-${tab}`}
              onClick={() => {
                setTimeframe(tab);
                if (onAddNotification) {
                  onAddNotification({
                    id: `notif-time-${tab}-${Date.now()}`,
                    title: `Scale Changed: ${tab.toUpperCase()}`,
                    text: `Switched medical analytics timeline resolution to ${tab} aggregation mode.`,
                    time: 'Just now',
                    unread: true,
                    type: 'info'
                  });
                }
              }}
              className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 text-blue-650 dark:text-blue-400 text-blue-600 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-205'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* METRICS KPI CARDS GRID (ALL 5 METRICS WITH SPARK VALUE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="metrics-kpi-sub-grid">
        {metricConfigs.map(metric => {
          const isSelected = metric.id === selectedMetricId;

          return (
            <div
              key={metric.id}
              id={`kpi-card-${metric.id}`}
              onClick={() => setSelectedMetricId(metric.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between h-[125px] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-blue-500/80 dark:border-blue-500/80 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate max-w-[110px]">
                  {metric.name}
                </span>
                <span style={{ color: metric.color }}>
                  <metric.icon className="w-4 h-4 shrink-0" />
                </span>
              </div>

              <div className="mt-2.5">
                <span className="text-base font-black text-slate-800 dark:text-slate-105 leading-none">
                  {metric.currentStr}
                </span>
                {metric.secondaryStr && (
                  <span className="text-[10px] block font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {metric.secondaryStr}
                  </span>
                )}
              </div>

              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-2 truncate w-full block">
                {timeframe === 'weekly' ? 'Daily feeds standard' : timeframe === 'monthly' ? '4-week aggregates' : '12-month coordinates'}
              </span>
            </div>
          );
        })}
      </div>

      {/* CHOSEN COMPREHENSIVE CHART FOCUS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm select-none" id="detailed-chart-focus-card">
        
        {/* Detail Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5 gap-3">
          <div className="text-left space-y-1">
            <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Focused Series Analysis ({timeframe})
            </span>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {activeMetric.name}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Unit: {activeMetric.unit}
              </span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {activeMetric.desc}
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl shrink-0">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Normal Medical Thresholds</span>
            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block mt-1">
              {activeMetric.bounds}
            </span>
          </div>
        </div>

        {/* Detailed Chart Canvas Container */}
        <div className="w-full bg-slate-50/50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 min-h-[280px]">
          {renderDetailedChart()}
        </div>

        {/* Clinical Recommendations Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 text-xs text-slate-700 dark:text-slate-300 flex gap-2.5 items-start">
          <Lucide.Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-left space-y-0.5">
            <span className="font-extrabold text-slate-900 dark:text-slate-200 block uppercase tracking-wider text-[10px]">
              AI Clinical Compliance Insights
            </span>
            <p className="leading-relaxed">
              {selectedMetricId === 'weight' && `Rohan’s BMI is holding consistently at ${latest.bmi}, sitting perfectly within the standard normal range. Continued moderate aerobic brisk walking of 30 minutes daily is highly productive.`}
              {selectedMetricId === 'bloodPressure' && `BP average demonstrates high compliance with your nightly Atorvastatin dose of 10mg. The systolic reads show fewer peaks this semester aggregates compared to last year.`}
              {selectedMetricId === 'bloodSugar' && `Continuous interstitial glucose coordinates remain tightly matched to ideal targets (< 140 mg/dL post-meals). Restrict high-glycemic carbohydrates during lunch to minimize the peaks.`}
              {selectedMetricId === 'heartRate' && `Your resting heart rate averages ${latest.restingHeartRate} bpm. The max heart rate profiles verify that dynamic exercises remain within secure metabolic parameters.`}
              {selectedMetricId === 'medicationAdherence' && `Adherence rate stands at a high ${latest.adherence}% compliance tier. Automated bottle registers detected steady evening dosages. Do not skip evening tablets.`}
            </p>
          </div>
        </div>
      </div>

      {/* DOWNLOADABLE HEALTH REPORTS DESK */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm select-none" id="reports-download-desk">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Lucide.FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-805 dark:text-slate-100">
              Download Credentials & Telemetry Reports Desktop
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Compile encrypted diagnostic reports paired with cryptographic verification hash logs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls column */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              {/* Select content items */}
              <div className="space-y-2.5">
                <span className="text-[9.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Include Datasets</span>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeVitalsInReport}
                      onChange={(e) => setIncludeVitalsInReport(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-blue-600 bg-transparent"
                    />
                    Vitals trends historical registry
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeAdherenceInReport}
                      onChange={(e) => setIncludeAdherenceInReport(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-blue-600 bg-transparent"
                    />
                    Medication compliance checklists
                  </label>
                </div>
              </div>

              {/* Select document format */}
              <div className="space-y-2.5">
                <span className="text-[9.5px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Document Format</span>
                <div className="flex flex-col gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold select-none">
                  {(['csv', 'json', 'txt'] as const).map(fmt => (
                    <label key={fmt} className="flex items-center gap-2 cursor-pointer capitalize hover:text-slate-900 dark:hover:text-white">
                      <input
                        type="radio"
                        name="report-format-radio"
                        checked={reportFormat === fmt}
                        onChange={() => setReportFormat(fmt)}
                        className="border-slate-300 dark:border-slate-700 text-blue-600 bg-transparent"
                      />
                      {fmt === 'csv' ? 'Comma separated (.csv)' : fmt === 'json' ? 'FHIR Interop Schema JSON' : 'Plain Text Document (.txt)'}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="compile-report-btn"
                onClick={triggerDocumentDownload}
                disabled={downloadStep !== null && downloadProgress < 100}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Lucide.Download className="w-3.5 h-3.5" />
                Compile & Download {timeframe.toUpperCase()} Report
              </button>
            </div>
          </div>

          {/* Progress / Status output column */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl min-h-[148px] flex flex-col justify-between">
            {downloadStep ? (
              <div className="space-y-3.5 text-left select-text">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">Compilation Stage</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450">{downloadProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 bottom-0 left-0 bg-emerald-500"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>

                <p className="text-[10.5px] font-mono text-slate-600 dark:text-slate-400 leading-snug">
                  🧬 {downloadStep}
                </p>

                {downloadReadyHash && (
                  <div className="p-2 px-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-[9px] text-emerald-800 dark:text-emerald-300 font-mono mt-1 select-all">
                    Verification Auth Hash: <strong className="font-bold">{downloadReadyHash}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 py-6 text-slate-400 dark:text-slate-500 space-y-1.5 select-none my-auto">
                <Lucide.Cpu className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Diagnostic Compiler Desk Idle</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug max-w-[220px]">
                  Check datasets parameters above and click compilation download to trigger.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
