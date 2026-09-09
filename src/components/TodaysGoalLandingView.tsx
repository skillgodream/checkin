import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  Clock,
  Award,
  TrendingUp,
  Languages,
  Check,
  Stethoscope,
  Pencil,
  AlertCircle,
  BookOpen,
  ListTodo,
} from "lucide-react";
import { NewHire, TrainingModule } from "../types";
import { MANDATORY_TRAINING_MODULES } from "../data/modulesData";
import { LearnerSection } from "./FloatingGlassMenu";

interface TodaysGoalLandingViewProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
  onBack: () => void;
  onSelectSection?: (section: LearnerSection) => void;
  onUpdateHire?: (updatedHire: NewHire) => void;
  onOpenBuddy?: () => void;
  onSelectModuleWithId?: (modId: string) => void;
  onSelectFloorTask?: (modalType: "buddy" | "scanner" | "work" | "target" | "map") => void;
}

export const TodaysGoalLandingView: React.FC<TodaysGoalLandingViewProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onToggleLanguage,
  onBack,
  onSelectSection,
  onUpdateHire,
  onOpenBuddy,
  onSelectModuleWithId,
  onSelectFloorTask,
}) => {
  // Role selector dropdown state
  const [selectedRole, setSelectedRole] = useState<string>("Dark Store Picker • Zone A");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  // Interactive task completion state
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({
    task_1: true, // One pre-checked to show progress
  });

  const [drillStarted, setDrillStarted] = useState<boolean>(false);

  const handleStartDrill = () => {
    setDrillStarted(true);
    setTimeout(() => {
      setDrillStarted(false);
      if (onSelectSection) {
        onSelectSection("dial");
      }
    }, 1500);
  };

  // Live floor performance data
  const currentRecord = (newHire?.daysHistory || []).find((d) => d.dayNumber === currentDay) || {
    dayNumber: currentDay,
    workSignal: {
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 44,
      targetOrders: 65,
    },
  };

  const actualPickRate = currentRecord.workSignal?.actualPickRate ?? 38;
  const targetPickRate = currentRecord.workSignal?.targetPickRate ?? 50;
  const accuracyRate = currentRecord.workSignal?.accuracyRate ?? 98;

  // Authoritative live career readiness score calculation
  const baseReadiness =
    typeof newHire.overallReadinessScore === "number"
      ? newHire.overallReadinessScore <= 1
        ? Math.round(newHire.overallReadinessScore * 100)
        : Math.round(newHire.overallReadinessScore)
      : Math.round((newHire.rampProgress || 0.74) * 100);

  // Dynamic bonus for tasks checked today
  const tasksBonus = Object.values(completedTaskIds).filter(Boolean).length * 2;
  const modulesBonus = 0;
  const liveReadinessPct = Math.min(100, baseReadiness + tasksBonus);

  // Doctor's suggestion for today
  const doctorDiagnosis = isHindi
    ? "डॉक्टर सुझाव (AI Store Doctor): आइसल 4-8 में सामान खोजने का समय कम करें और 90 सेकंड की कोल्ड-चेन ड्रिल पूरी करें। इससे रेडीनेस स्कोर 74% से बढ़कर 85% लक्ष्य तक पहुंचेगा।"
    : "Store Doctor Rx: Floor signal detects pick lag in Aisles 4-8. Complete the 15-min barcode scanner drill and Cold Room 90-sec SOP before peak shift to reach the 85% readiness benchmark.";

  // Today's prescribed modules (based on doctor's recommendation)
  const todaysPrescribedModules: (TrainingModule & { rxReason: string; rxReasonHi: string })[] = [
    {
      dayNumber: 3,
      id: "lms-mod-03",
      code: "LMS-MOD-03",
      title: "Fast Barcode Scanner Alignment & Shelf Navigation",
      titleHi: "तेज़ बारकोड स्कैनिंग और शेल्फ नेविगेशन",
      description: "Quick optical scanner positioning, eliminating red-light mis-scans, and Aisle 4-8 coordinate routing.",
      descriptionHi: "ऑप्टिकल स्कैनर का सही एंगल, लाल लाइट एरर से बचाव, और आइसल 4-8 का रूट।",
      durationMinutes: 15,
      mappedCapabilityIds: [3],
      passingScore: 80,
      rxReason: "Prescribed to eliminate barcode read latency in Aisle 6.",
      rxReasonHi: "आइसल 6 में स्कैनिंग देरी को ठीक करने के लिए डॉक्टर द्वारा निर्धारित।",
      activities: [],
    },
    {
      dayNumber: 4,
      id: "lms-mod-04",
      code: "LMS-MOD-04",
      title: "Cold Chain Dairy & Perishable Tote Packaging",
      titleHi: "कोल्ड चेन डेयरी और सेफ टोट पैकिंग",
      description: "90-second freezer door protocol, insulated bag sealing, and avoiding condensation spoilage.",
      descriptionHi: "90 सेकंड में फ्रीजर से पिक, इंसुलेटेड बैग सील और दूध-दही की सुरक्षित पैकिंग।",
      durationMinutes: 20,
      mappedCapabilityIds: [4],
      passingScore: 85,
      rxReason: "Critical SOP requirement before afternoon dairy shift peak.",
      rxReasonHi: "दोपहर के पीक ऑर्डर से पहले कोल्ड चेन सुरक्षा नियम सीखना अनिवार्य है।",
      activities: [],
    },
  ];

  // Today's floor tasks
  const todaysTasks = [
    {
      id: "task_1",
      title: isHindi ? "आइसल 4 से 8 का वॉकथ्रू सीनियर साथी (विक्रम) के साथ" : "Aisle 4-8 physical walkthrough with Buddy Vikram",
      category: isHindi ? "साथी वॉकथ्रू" : "Buddy Walk",
      duration: "10 min",
    },
    {
      id: "task_2",
      title: isHindi ? "फिंगर-रिंग स्कैनर से 50 ऑर्डर बिना किसी एरर के स्कैन करें" : "Pick 50 orders using finger-ring scanner with 0 mis-scans",
      category: isHindi ? "फ्लोर पिकिंग" : "Floor Pick",
      duration: "30 min",
    },
    {
      id: "task_3",
      title: isHindi ? "कोल्ड रूम डेयरी 90-सेकंड एसओपी और इंसुलेटेड बैग सील" : "Cold Room dairy 90-sec retrieval SOP & insulated seal",
      category: isHindi ? "गुणवत्ता व सुरक्षा" : "Quality SOP",
      duration: "15 min",
    },
    {
      id: "task_4",
      title: isHindi ? "शिफ्ट के अंत में वॉयस रिपोर्ट दर्ज करें (चेक-इन)" : "Submit end-of-shift status update & voice check-in",
      category: isHindi ? "दैनिक रिपोर्ट" : "Daily Report",
      duration: "5 min",
    },
  ];

  const handleStartModule = (modId: string) => {
    if (onSelectModuleWithId) {
      onSelectModuleWithId(modId);
    } else if (onSelectSection) {
      onSelectSection("modules");
    }
  };

  const handleOpenTaskDestination = (taskId: string, taskCategory: string) => {
    if (onSelectFloorTask) {
      if (taskId === "task_1") {
        onSelectFloorTask("map");
      } else if (taskId === "task_2") {
        onSelectFloorTask("scanner");
      } else if (taskId === "task_3") {
        onSelectFloorTask("work");
      } else if (taskId === "task_4") {
        onSelectFloorTask("target");
      } else {
        onSelectFloorTask("work");
      }
    } else if (onSelectSection) {
      onSelectSection("dial");
    }
  };

  // Math for circular progress arc matching Screenshot 2026-09-08 at 12.58.01 PM.png
  // SVG center (130, 130), radius = 96. Angle spans from -140 deg to +140 deg (280 deg total)
  const radius = 96;
  const center = 130;
  const strokeWidth = 10;
  // Progress fraction (0 to 1) based on live readiness (clamped to 0.1 - 1.0)
  const progressRatio = Math.max(0.1, Math.min(1, liveReadinessPct / 100));

  // Angles: Start at -135° (top-left) to +135° (bottom-right), total 270°
  const startAngle = -135;
  const totalSweep = 270;
  const currentAngle = startAngle + totalSweep * progressRatio;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDegrees: number) => {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const backgroundTrackPath = describeArc(center, center, radius, startAngle, startAngle + totalSweep);
  const activeArcPath = describeArc(center, center, radius, startAngle, currentAngle);

  const startNode = polarToCartesian(center, center, radius, startAngle);
  const endNode = polarToCartesian(center, center, radius, currentAngle);

  // Cardinal milestones along arc matching reference thermostat
  const milestones = [
    { label: "10%", angle: -135 },
    { label: "35%", angle: -65 },
    { label: "65%", angle: 25 },
    { label: "85%", angle: 85 },
    { label: "100%", angle: 135 },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-28 select-none">
      {/* ========================================================= */}
      {/* 1. TOP PURPLE APP BAR (MATCHING SCREENSHOT 12.58.01)       */}
      {/* ========================================================= */}
      <div className="w-full bg-[#271549] text-white pt-3 pb-4 px-4 shadow-md relative z-20">
        {/* Status bar notch representation */}
        <div className="flex items-center justify-between text-[11px] text-purple-200/80 font-mono pb-2 border-b border-white/10">
          <span className="flex items-center gap-1 font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CHEIN LIVE</span>
          </span>
          <span className="font-bold tracking-wider">
            {isHindi ? `दिन ${currentDay} • डार्क स्टोर #104` : `DAY ${currentDay} • STORE #104`}
          </span>
          <span>9:41 AM</span>
        </div>

        <div className="flex items-center justify-between pt-3">
          {/* Back button '<' */}
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white border border-white/15 cursor-pointer"
            title={isHindi ? "वापस जाएं" : "Back to Home"}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Heading: TODAY'S GOAL (matching NEST THERMOSTAT in screenshot) */}
          <div className="text-center">
            <h1 className="text-sm font-black tracking-widest uppercase text-white font-mono">
              {isHindi ? "आज का लक्ष्य" : "TODAY'S GOAL"}
            </h1>
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
              {isHindi ? "दैनिक ऑनबोर्डिंग प्लान" : "Daily Learning & Floor Plan"}
            </p>
          </div>

          {/* Language toggle or quick action */}
          {onToggleLanguage ? (
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black tracking-wide border border-white/15 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Languages className="w-3 h-3 text-purple-200" />
              <span>{isHindi ? "हिंदी" : "EN"}</span>
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md mx-auto px-4 space-y-5 pt-3">
        {/* ========================================================= */}
        {/* 2. ROLE SELECTOR PILL (MATCHING 'LIVING ROOM ▾' DROPDOWN)  */}
        {/* ========================================================= */}
        <div className="relative flex justify-center">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm text-xs font-black text-slate-800 tracking-tight transition-all active:scale-98 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-violet-600" />
            <span>{selectedRole}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Role selector dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute top-11 z-30 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {isHindi ? "भूमिका व क्षेत्र चुनें" : "Select Role & Work Zone"}
              </div>
              {[
                "Dark Store Picker • Zone A",
                "Speed Picking • Aisles 4-8",
                "Cold Chain Specialist • Dairy",
                "Handheld Scanner Specialist",
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRole === role ? "bg-purple-50 text-purple-800" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{role}</span>
                  {selectedRole === role && <Check className="w-3.5 h-3.5 text-purple-700 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. CIRCULAR PROGRESS GAUGE (MATCHING SCREENSHOT 12.58.01) */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-b from-slate-50/80 to-purple-50/30 rounded-[32px] p-4 border border-purple-100/70 shadow-sm flex flex-col items-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

          {/* SVG Circular Gauge */}
          <div className="relative w-[260px] h-[220px] flex items-center justify-center">
            <svg width="260" height="230" viewBox="0 0 260 230" className="overflow-visible">
              <defs>
                {/* Vibrant orange gradient matching reference thermostat */}
                <linearGradient id="landingOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA62B" />
                  <stop offset="50%" stopColor="#FF7A00" />
                  <stop offset="100%" stopColor="#FF5500" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF7A00" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Background circular track (grey) */}
              <path
                d={backgroundTrackPath}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Active orange progression arc */}
              <path
                d={activeArcPath}
                fill="none"
                stroke="url(#landingOrangeGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="url(#orangeGlow)"
              />

              {/* Start circular terminal node */}
              <circle
                cx={startNode.x}
                cy={startNode.y}
                r={strokeWidth / 2 + 1}
                fill="#FFA62B"
              />

              {/* Active current circular terminal node (prominent rounded endpoint) */}
              <circle
                cx={endNode.x}
                cy={endNode.y}
                r={strokeWidth / 2 + 3}
                fill="#FF5500"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#orangeGlow)"
              />

              {/* Cardinal scale markers */}
              {milestones.map((m, idx) => {
                const pt = polarToCartesian(center, center, radius + 18, m.angle);
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={pt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[11px] font-bold fill-slate-400 select-none"
                  >
                    {m.label}
                  </text>
                );
              })}
            </svg>

            {/* Central live temperature-style percentage readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
              <div className="flex items-baseline gap-0.5">
                <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  {liveReadinessPct}
                </span>
                <span className="text-2xl font-black text-amber-500">
                  %
                </span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-1">
                {isHindi ? "करियर रेडीनेस स्कोर" : "Career Readiness"}
              </span>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-black text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{liveReadinessPct >= 80 ? "Ready for Floor" : "Onboarding Ramp"}</span>
              </div>
            </div>
          </div>

          {/* Live Progress Bar at the top (as explicitly requested: 'live progrs bar at the top') */}
          <div className="w-full mt-2 space-y-1.5 px-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>{isHindi ? "लाइव प्रगति ट्रैकर" : "Live Progress Bar"}</span>
              <span className="text-purple-700 font-mono">{liveReadinessPct}% / 85% Target</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${liveReadinessPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Training: 3/10</span>
              <span>Speed: {actualPickRate} / {targetPickRate} picks/hr</span>
              <span>Accuracy: {accuracyRate}%</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. TWO PARAMETER CARDS (LIGHT INTENSITY 72% & HUMIDITY 34%) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3">
          {/* CARD 1: LIVE ROLE PERFORMANCE (Matching Light Intensity 72%) */}
          <div
            onClick={() => onSelectSection && onSelectSection("dial")}
            className="bg-[#F0EBFA] border border-[#DDD0F5] hover:border-[#C4B0EC] rounded-3xl p-3.5 flex flex-col justify-between transition-all cursor-pointer active:scale-98 shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-violet-600 shadow-xs">
                <Zap className="w-4 h-4 fill-violet-600" />
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 group-hover:text-violet-700 transition-colors"
                title="View role speed dial"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 block">
                {isHindi ? "रोल परफॉर्मेंस" : "Role Performance"}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {actualPickRate}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  / {targetPickRate} {isHindi ? "पिक/घंटा" : "picks/hr"}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-violet-700 mt-1">
                {accuracyRate}% {isHindi ? "सटीकता • लाइव" : "Accuracy • Live"}
              </p>
            </div>
          </div>

          {/* CARD 2: DOCTOR'S SUGGESTION (Matching Humidity 34%) */}
          <div
            onClick={() => {
              // Smooth scroll to modules section below
              document.getElementById("prescribed-modules-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-[#F0EBFA] border border-[#DDD0F5] hover:border-[#C4B0EC] rounded-3xl p-3.5 flex flex-col justify-between transition-all cursor-pointer active:scale-98 shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-fuchsia-600 shadow-xs">
                <Stethoscope className="w-4 h-4 text-fuchsia-600" />
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 group-hover:text-fuchsia-700 transition-colors"
                title="View Doctor prescription"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 block">
                {isHindi ? "डॉक्टर सुझाव" : "Doctor's Suggestion"}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-black text-slate-900 tracking-tight leading-tight line-clamp-1">
                  {isHindi ? "आइसल 4-8 व कोल्ड-चेन" : "Aisle 4-8 & Cold Chain"}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-fuchsia-700 mt-1 line-clamp-1">
                {isHindi ? "2 मॉड्यूल निर्धारित" : "2 Prescribed Modules"}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor's Suggestion Detail Callout */}
        <div className="bg-purple-50/80 rounded-2xl p-3 border border-purple-100 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <span className="font-bold text-purple-900 block mb-0.5">
              {isHindi ? "AI स्टोर डॉक्टर डायग्नोसिस:" : "AI Store Doctor Diagnosis:"}
            </span>
            <p className="leading-relaxed text-slate-600">{doctorDiagnosis}</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. LIST OF MODULES TO BE DONE TODAY (DOCTOR'S SUGGESTION)  */}
        {/* ========================================================= */}
        <div id="prescribed-modules-section" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {isHindi ? "आज के निर्धारित मॉड्यूल (डॉक्टर सुझाव)" : "Today's Modules (Doctor's Suggestion)"}
              </h2>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {todaysPrescribedModules.length} {isHindi ? "मॉड्यूल" : "Prescribed"}
            </span>
          </div>

          <div className="space-y-2.5">
            {todaysPrescribedModules.map((mod) => {
              return (
                <div
                  key={mod.id}
                  onClick={() => handleStartModule(mod.id)}
                  className="p-3.5 rounded-2xl border bg-white border-slate-200 hover:border-purple-300 shadow-2xs transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono">
                          {mod.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mod.durationMinutes} min
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                        {isHindi ? mod.titleHi : mod.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {isHindi ? mod.descriptionHi : mod.description}
                      </p>
                      {/* Doctor's justification tag */}
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-violet-700">
                        <Stethoscope className="w-3 h-3 shrink-0" />
                        <span className="truncate">{isHindi ? mod.rxReasonHi : mod.rxReason}</span>
                      </div>
                    </div>

                    {/* Navigation Button */}
                    <div className="shrink-0 px-3 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{isHindi ? "शुरू करें" : "Open Module"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. TODAY'S FLOOR TASKS (DEEP-LINK NAVIGATION TO ORIGIN)  */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ListTodo className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {isHindi ? "आज के फ्लोर कार्य (Tasks)" : "Today's Prescribed Tasks"}
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {isHindi ? "मूल लैंडिंग पर नेविगेट करें" : "Tap to open origin"}
            </span>
          </div>

          <div className="space-y-2">
            {todaysTasks.map((task) => {
              return (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDestination(task.id, task.category)}
                  className="p-3.5 rounded-2xl border bg-white border-slate-200 hover:border-violet-300 text-slate-800 shadow-2xs transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black leading-snug text-slate-900 group-hover:text-violet-950 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                        <span className="font-semibold text-purple-700">{task.category}</span>
                        <span>•</span>
                        <span>⏱️ {task.duration}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-black shrink-0 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    {isHindi ? "खोलें" : "Open →"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. BOTTOM ORANGE PRIMARY CTA (MATCHING 'SET TEMPERATURE')  */}
        {/* ========================================================= */}
        <div className="pt-3">
          <button
            id="landing-start-drill-cta"
            type="button"
            onClick={handleStartDrill}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
              drillStarted
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#FF8C1A] hover:to-[#FF661A] text-white shadow-orange-500/30"
            }`}
          >
            {drillStarted ? (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>{isHindi ? "ड्रिल शुरू हुई! प्रगति जुड़ी" : "Drill Active! +2% Boost Added"}</span>
              </>
            ) : (
              <>
                <span>{isHindi ? "आज की ट्रेनिंग शुरू करें" : "START TODAY'S DRILL"}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
