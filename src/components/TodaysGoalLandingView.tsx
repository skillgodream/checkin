import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  Languages,
  Check,
  Stethoscope,
  Pencil,
  BookOpen,
  ListTodo,
  X,
  Target,
  UserCheck,
} from "lucide-react";
import { NewHire, TrainingModule } from "../types";
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

interface CustomModule extends TrainingModule {
  rxReason: string;
  rxReasonHi: string;
}

interface CustomTask {
  id: string;
  title: string;
  category: string;
  duration: string;
  detailsEn: string;
  detailsHi: string;
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

  // Popup detail modals state
  const [activeModule, setActiveModule] = useState<CustomModule | null>(null);
  const [activeTask, setActiveTask] = useState<CustomTask | null>(null);

  // Interactive task completion state
  const [completedTaskIds] = useState<Record<string, boolean>>({
    task_1: true,
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

  const tasksBonus = Object.values(completedTaskIds).filter(Boolean).length * 2;
  const liveReadinessPct = Math.min(100, baseReadiness + tasksBonus);

  // Concise Doctor's suggestion for today
  const doctorDiagnosis = isHindi
    ? "डॉक्टर सुझाव: आइसल 4-8 में पिक लैग मिला है। 85% रेडीनेस बेंचमार्क पाने के लिए स्कैनर व कोल्ड चेन ड्रिल पूरी करें।"
    : "Store Doctor Rx: Pick lag in Aisles 4-8. Complete scanner drill and Cold Room SOP to reach 85% readiness.";

  // Today's prescribed modules
  const todaysPrescribedModules: CustomModule[] = [
    {
      dayNumber: 3,
      id: "lms-mod-03",
      code: "LMS-MOD-03",
      title: "Barcode Scanner Alignment",
      titleHi: "तेज़ बारकोड स्कैनिंग",
      description: "Quick scanner positioning and avoiding red-light mis-scans.",
      descriptionHi: "ऑप्टिकल स्कैनर का सही एंगल और एरर-मुक्त कोआर्डिनेशन।",
      durationMinutes: 15,
      mappedCapabilityIds: [3],
      passingScore: 80,
      rxReason: "Rx: Barcode read lag in Aisle 6.",
      rxReasonHi: "Rx: आइसल 6 में स्कैनिंग सुस्ती को ठीक करने के लिए।",
      activities: [],
    },
    {
      dayNumber: 4,
      id: "lms-mod-04",
      code: "LMS-MOD-04",
      title: "Cold Chain & Dairy Packaging",
      titleHi: "कोल्ड चेन और डेयरी पैकेजिंग",
      description: "90-second freezer retrieval protocols and insulated bag sealing.",
      descriptionHi: "90 सेकंड में फ्रीजर पिक और सुरक्षित डेयरी बैग पैकिंग नियम।",
      durationMinutes: 20,
      mappedCapabilityIds: [4],
      passingScore: 85,
      rxReason: "Rx: Required for afternoon dairy shift.",
      rxReasonHi: "Rx: दोपहर के डेयरी पीक समय से पहले आवश्यक नियम।",
      activities: [],
    },
  ];

  // Today's floor tasks with rich details for popups
  const todaysTasks: CustomTask[] = [
    {
      id: "task_1",
      title: isHindi ? "आइसल 4-8 वॉकथ्रू" : "Aisle 4-8 walkthrough",
      category: isHindi ? "साथी वॉक" : "Buddy Walk",
      duration: "10 min",
      detailsEn: "Walk through Aisles 4-8 with your dedicated buddy, Vikram. He will show you the exact sequence for locating items, shelf arrangement, and coordinate reading.",
      detailsHi: "अपने सीनियर साथी विक्रम के साथ आइसल 4-8 का फिजिकल वॉकथ्रू करें। वे आपको सामान खोजने का सही क्रम, कोआर्डिनेशन और शेल्फ नेविगेशन समझाएंगे।",
    },
    {
      id: "task_2",
      title: isHindi ? "फिंगर स्कैनर से 50 सफल ऑर्डर" : "Pick 50 orders with finger scanner",
      category: isHindi ? "फ्लोर पिक" : "Floor Pick",
      duration: "30 min",
      detailsEn: "Using your wearable finger-ring scanner, scan and pick 50 real dark store orders. Focus on scanning barcodes from the recommended 15cm angle to avoid mis-scans.",
      detailsHi: "वियरेबल फिंगर-रिंग स्कैनर का उपयोग करके 50 ऑर्डर चुनें। स्कैनर को 15 सेंटीमीटर की सही दूरी और एंगल पर रखकर स्कैन करें ताकि कोई मिस-स्कैन न हो।",
    },
    {
      id: "task_3",
      title: isHindi ? "डेयरी 90-सेकंड एसओपी ड्रिल" : "Cold Room dairy 90-sec SOP",
      category: isHindi ? "गुणवत्ता एसओपी" : "Quality SOP",
      duration: "15 min",
      detailsEn: "Complete the 90-second entry-to-exit protocol for Cold Room dairy. Ensure the insulated storage bags are sealed immediately upon exit to prevent temperature disruption.",
      detailsHi: "कोल्ड रूम डेयरी से सामान निकालने का 90-सेकंड प्रोटोकॉल सीखें। बाहर निकलने पर तापमान बिगड़ने से बचाने के लिए इंसुलेटेड बैग को तुरंत सील करें।",
    },
    {
      id: "task_4",
      title: isHindi ? "शिफ्ट रिपोर्ट और वॉयस चेक-इन" : "Submit shift status & voice report",
      category: isHindi ? "रिपोर्ट" : "Report",
      duration: "5 min",
      detailsEn: "Use the built-in voice assist to record and submit your shift progress report. Summarize orders picked, any shelf exceptions, and final store hand-over.",
      detailsHi: "वॉयस असिस्टेंट का उपयोग करके अपनी शिफ्ट की अंतिम रिपोर्ट दर्ज करें। इसमें आपके द्वारा चुने गए कुल ऑर्डर और शेल्फ विसंगतियों की जानकारी शामिल होनी चाहिए।",
    },
  ];

  const handleStartModule = (modId: string) => {
    setActiveModule(null);
    if (onSelectModuleWithId) {
      onSelectModuleWithId(modId);
    } else if (onSelectSection) {
      onSelectSection("modules");
    }
  };

  const handleOpenTaskDestination = (taskId: string, taskCategory: string) => {
    setActiveTask(null);
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

  // SVG Gauge Calculations
  const radius = 96;
  const center = 130;
  const strokeWidth = 10;
  const progressRatio = Math.max(0.1, Math.min(1, liveReadinessPct / 100));

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

  const milestones = [
    { label: "10%", angle: -135 },
    { label: "35%", angle: -65 },
    { label: "65%", angle: 25 },
    { label: "85%", angle: 85 },
    { label: "100%", angle: 135 },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-[#e2e8f0] pb-28 select-none relative font-sans">
      {/* ========================================================= */}
      {/* 1. APP BAR - HIGH CONTRAST SOLID HEADER                    */}
      {/* ========================================================= */}
      <div className="w-full bg-[#0d1321] text-white pt-4 pb-4 px-4 border-b border-[#1e293b] relative z-20 shadow-xl">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-2 border-b border-white/5 mb-3">
          <span className="flex items-center gap-1 font-semibold text-blue-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>LIVE TRACKING ACTIVE</span>
          </span>
          <span className="font-bold tracking-wider text-slate-300">
            {isHindi ? `दिन ${currentDay} • डार्क स्टोर #104` : `DAY ${currentDay} • STORE #104`}
          </span>
          <span>9:41 AM</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Back Action */}
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center text-white border border-[#2e3e59] cursor-pointer"
            title={isHindi ? "वापस जाएं" : "Back to Home"}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Heading: TODAY'S GOAL */}
          <div className="text-center">
            <h1 className="text-sm font-black tracking-widest uppercase text-white font-mono">
              {isHindi ? "आज का लक्ष्य" : "TODAY'S GOAL"}
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              {isHindi ? "दैनिक ऑनबोर्डिंग प्लान" : "Daily Learning & Floor Plan"}
            </p>
          </div>

          {/* Language Selector */}
          {onToggleLanguage ? (
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-[11px] font-black tracking-wide border border-[#2e3e59] transition-all cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>{isHindi ? "हिंदी" : "EN"}</span>
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md mx-auto px-4 space-y-7 pt-4">
        {/* ========================================================= */}
        {/* 2. ROLE SELECTOR PILL                                      */}
        {/* ========================================================= */}
        <div className="relative flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121a2c] hover:bg-[#162137] border border-[#243553] shadow-md text-xs font-bold text-slate-200 tracking-tight transition-all active:scale-98 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>{selectedRole}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Selector dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute top-12 z-30 w-72 rounded-2xl bg-[#0d1321] border border-[#22334f] shadow-2xl py-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1.5">
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
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRole === role ? "bg-blue-600/20 text-blue-300" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{role}</span>
                  {selectedRole === role && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: VISUAL PROGRESS GAUGE (PROFOUND SEPARATION)     */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-4 w-1 bg-blue-500 rounded-full" />
            <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400">
              {isHindi ? "आपका स्कोर और ट्रैकर" : "YOUR PROGRESS SCORES"}
            </h3>
          </div>

          <div className="bg-[#101726] rounded-[28px] p-5 border border-[#21314d] shadow-xl flex flex-col items-center relative overflow-hidden transition-all hover:border-[#2b4166]">
            {/* Gentle blue glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* SVG Circular Gauge */}
            <div className="relative w-[260px] h-[220px] flex items-center justify-center">
              <svg width="260" height="230" viewBox="0 0 260 230" className="overflow-visible">
                <defs>
                  <linearGradient id="landingBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Background track */}
                <path
                  d={backgroundTrackPath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />

                {/* Active arc */}
                <path
                  d={activeArcPath}
                  fill="none"
                  stroke="url(#landingBlueGrad)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  filter="url(#blueGlow)"
                />

                {/* Terminal Nodes */}
                <circle cx={startNode.x} cy={startNode.y} r={strokeWidth / 2 + 1} fill="#60a5fa" />
                <circle
                  cx={endNode.x}
                  cy={endNode.y}
                  r={strokeWidth / 2 + 3}
                  fill="#1d4ed8"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="url(#blueGlow)"
                />

                {/* Milestones */}
                {milestones.map((m, idx) => {
                  const pt = polarToCartesian(center, center, radius + 18, m.angle);
                  return (
                    <text
                      key={idx}
                      x={pt.x}
                      y={pt.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] font-bold fill-slate-400 select-none font-mono"
                    >
                      {m.label}
                    </text>
                  );
                })}
              </svg>

              {/* Central score readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none">
                    {liveReadinessPct}
                  </span>
                  <span className="text-2xl font-black text-blue-400">
                    %
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  {isHindi ? "करियर रेडीनेस स्कोर" : "Career Readiness"}
                </span>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>{liveReadinessPct >= 80 ? "Ready for Floor" : "Onboarding Ramp"}</span>
                </div>
              </div>
            </div>

            {/* Simple Live Progress Bar (High Visual Contrast) */}
            <div className="w-full mt-1 bg-[#090e18] border border-[#1e293b] rounded-2xl p-3.5 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>{isHindi ? "लाइव प्रगति ट्रैकर" : "Live Progress Bar"}</span>
                <span className="text-blue-400 font-mono font-black">{liveReadinessPct}% / 85% Target</span>
              </div>
              <div className="w-full h-2.5 bg-[#101726] border border-white/5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${liveReadinessPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1 border-t border-white/5">
                <span>Training: 3/10</span>
                <span>Speed: {actualPickRate} / {targetPickRate} p/h</span>
                <span>Accuracy: {accuracyRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: HEALTH & LIVE SIGNALS (GOLD/LAVENDER BALANCED)  */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-4 w-1 bg-amber-500 rounded-full" />
            <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400">
              {isHindi ? "फ्लोर परफॉर्मेंस व डॉक्टर सुझाव" : "PERFORMANCE & CLINIC RX"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Live Role Performance (Gold Accent, highly separate) */}
            <div
              onClick={() => onSelectSection && onSelectSection("dial")}
              className="bg-[#121b2d] border border-[#21324e] hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer active:scale-98 group shadow-lg shadow-black/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Zap className="w-4.5 h-4.5 fill-amber-400/30" />
                </div>
                <button type="button" className="p-1 rounded-lg text-slate-500 group-hover:text-amber-300 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  {isHindi ? "पिकिंग स्पीड" : "Picking Speed"}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-400 leading-none">
                    {actualPickRate}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    /{targetPickRate} p/h
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center">
                  <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-500/10">
                    {accuracyRate}% {isHindi ? "सटीकता" : "Accuracy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Doctor's Suggestion Summary (Lavender Accent, highly separate) */}
            <div
              onClick={() => {
                document.getElementById("prescribed-modules-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#121b2d] border border-[#21324e] hover:border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer active:scale-98 group shadow-lg shadow-black/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-300 border border-purple-500/20">
                  <Stethoscope className="w-4.5 h-4.5" />
                </div>
                <button type="button" className="p-1 rounded-lg text-slate-500 group-hover:text-purple-300 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  {isHindi ? "डॉक्टर सुझाव" : "Doctor Suggestion"}
                </span>
                <span className="text-xs font-black text-white block truncate leading-none mt-1">
                  {isHindi ? "आइसल 4-8 व डेयरी" : "Aisle 4-8 & Dairy"}
                </span>
                <div className="mt-2 inline-flex items-center">
                  <span className="text-[9px] font-black text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/10">
                    2 {isHindi ? "निर्धारित मॉड्यूल" : "Prescriptions"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Store Doctor Diagnosis Callout (Crisp lavender boundary) */}
          <div className="bg-[#121522] rounded-2xl p-4 border border-[#2b2444] flex items-start gap-3 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0 border border-purple-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-purple-300 block mb-0.5">
                {isHindi ? "AI स्टोर डॉक्टर डायग्नोसिस:" : "AI Store Doctor Rx Basis:"}
              </span>
              <p className="leading-relaxed text-slate-300">{doctorDiagnosis}</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: PRESCRIBED MODULES (HIGHLY SEPARATED BLOCKS)   */}
        {/* ========================================================= */}
        <div id="prescribed-modules-section" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-500 rounded-full" />
              <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400">
                {isHindi ? "निर्धारित डिजिटल ट्रेनिंग" : "PRESCRIBED TRAINING"}
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {todaysPrescribedModules.length} {isHindi ? "मॉड्यूल" : "Prescribed"}
            </span>
          </div>

          {/* Individual cards have high-contrast borders and solid bg */}
          <div className="space-y-3">
            {todaysPrescribedModules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className="p-4 rounded-2xl border bg-[#111827] border-[#223049] hover:border-blue-400/40 shadow-lg transition-all cursor-pointer group active:scale-98 flex items-center justify-between gap-4 hover:-translate-y-0.5"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                      {mod.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {mod.durationMinutes} min
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {isHindi ? mod.titleHi : mod.title}
                  </h4>
                </div>

                <div className="shrink-0 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                  <Play className="w-3.5 h-3.5 fill-white stroke-[2]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: TODAY'S FIELD ACTIONS (HIGHLY SEPARATED BLOCKS) */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 bg-indigo-500 rounded-full" />
              <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400">
                {isHindi ? "फ्लोर पर आज के आवश्यक कार्य" : "REQUIRED FLOOR ACTIONS"}
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {todaysTasks.length} {isHindi ? "कार्य" : "Tasks"}
            </span>
          </div>

          {/* Individual tasks have high-contrast borders and solid bg */}
          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setActiveTask(task)}
                className="p-4 rounded-2xl border bg-[#111827] border-[#223049] hover:border-indigo-400/40 text-slate-200 transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-98 group hover:-translate-y-0.5 shadow-lg"
              >
                <div className="min-w-0 space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <span className="text-indigo-400 font-black tracking-wider uppercase">{task.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md">
                      ⏱️ {task.duration}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-9 h-9 rounded-full bg-[#1b2536] text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all shadow-md border border-[#2b3c54]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: PRIMARY COMMAND BUTTON (COBALT BLUE)           */}
        {/* ========================================================= */}
        <div className="pt-3">
          <button
            id="landing-start-drill-cta"
            type="button"
            onClick={handleStartDrill}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer ${
              drillStarted
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white shadow-blue-500/20 border border-blue-500/30"
            }`}
          >
            {drillStarted ? (
              <>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>{isHindi ? "ट्रेनिंग शुरू!" : "Drill Active! +2% Boost Added"}</span>
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

      {/* ========================================================= */}
      {/* 8. DETAIL POPUP OVERLAY: PRESCRIBED MODULE                 */}
      {/* ========================================================= */}
      {activeModule && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d1321] border border-[#23334f] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            {/* Close button */}
            <button
              onClick={() => setActiveModule(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1b2536] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white border border-[#2b3c54] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Details */}
            <div className="space-y-1.5 pt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  {activeModule.code}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {activeModule.durationMinutes} minutes
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">
                {isHindi ? activeModule.titleHi : activeModule.title}
              </h2>
            </div>

            <div className="h-px bg-[#1e293b]" />

            {/* Description & Diagnostic info */}
            <div className="space-y-3.5 text-slate-300 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? "मॉड्यूल विवरण" : "Module Description"}
                </span>
                <p className="leading-relaxed bg-[#111827] border border-[#223049] p-4 rounded-xl text-slate-200 text-xs">
                  {isHindi ? activeModule.descriptionHi : activeModule.description}
                </p>
              </div>

              {/* Stethoscope recommendation tag */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? "डॉक्टर डायग्नोसिस रीज़न" : "Doctor's Recommendation Basis"}
                </span>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3 text-purple-300 text-xs">
                  <Stethoscope className="w-4.5 h-4.5 shrink-0 mt-0.5 text-purple-400" />
                  <p className="leading-relaxed">
                    {isHindi ? activeModule.rxReasonHi : activeModule.rxReason}
                  </p>
                </div>
              </div>

              {/* Requirement standards */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-400" />
                  {isHindi ? "पासिंग स्कोर:" : "Passing Standard:"}
                </span>
                <span className="text-white font-mono">{activeModule.passingScore}% minimum</span>
              </div>
            </div>

            {/* Modal Primary Play Button */}
            <div className="pt-2">
              <button
                onClick={() => handleStartModule(activeModule.id)}
                className="w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isHindi ? "ट्रेनिंग मॉड्यूल शुरू करें" : "Start Module Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. DETAIL POPUP OVERLAY: FLOOR TASK                        */}
      {/* ========================================================= */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d1321] border border-[#23334f] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            {/* Close button */}
            <button
              onClick={() => setActiveTask(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1b2536] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white border border-[#2b3c54] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Details */}
            <div className="space-y-1.5 pt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {activeTask.category}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {activeTask.duration}
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">
                {activeTask.title}
              </h2>
            </div>

            <div className="h-px bg-[#1e293b]" />

            {/* Rich Task Instructions */}
            <div className="space-y-3.5 text-slate-300 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isHindi ? "कार्य का विवरण और गाइड" : "Task Instructions & Guide"}
                </span>
                <p className="leading-relaxed bg-[#111827] border border-[#223049] p-4 rounded-xl text-slate-200 text-xs font-medium">
                  {isHindi ? activeTask.detailsHi : activeTask.detailsEn}
                </p>
              </div>

              {/* Safety/Help Support banner */}
              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center gap-3 text-blue-300 text-xs">
                <UserCheck className="w-4.5 h-4.5 shrink-0 text-blue-400" />
                <span className="font-semibold">
                  {isHindi ? "विक्रम (Buddy) आपकी सहायता के लिए फ्लोर पर उपलब्ध हैं।" : "Buddy Vikram is on-duty to support you."}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setActiveTask(null)}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5 cursor-pointer"
              >
                {isHindi ? "बंद करें" : "Dismiss"}
              </button>
              <button
                onClick={() => handleOpenTaskDestination(activeTask.id, activeTask.category)}
                className="flex-[2] py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <span>{isHindi ? "कार्य शुरू करें" : "Open Task Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
