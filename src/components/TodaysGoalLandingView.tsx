import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  Radio,
  TrendingUp,
  Bell,
} from "lucide-react";
import { NewHire, TrainingModule, DayRecord } from "../types";
import { assessReadiness } from "../services/intelligence";
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
  // Popup detail modals state
  const [activeModule, setActiveModule] = useState<CustomModule | null>(null);
  const [activeTask, setActiveTask] = useState<CustomTask | null>(null);

  // Interactive task completion state
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({
    task_1: true,
  });

  const toggleTaskCompletion = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // 3-Tab dial mode state: "day" | "career" | "yesterday"
  const [activeDialTab, setActiveDialTab] = useState<"day" | "career" | "yesterday">("day");

  // Expandable sections state (Prescribed training & Required floor actions)
  const [isPrescribedExpanded, setIsPrescribedExpanded] = useState<boolean>(false);
  const [isFloorActionsExpanded, setIsFloorActionsExpanded] = useState<boolean>(false);
  const [isRxAlertActive, setIsRxAlertActive] = useState<boolean>(true);
  const [isDiagnosisNotesOpen, setIsDiagnosisNotesOpen] = useState<boolean>(false);

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
      : (newHire.capabilities ? assessReadiness(newHire.capabilities, newHire) : 0);

  const tasksBonus = Object.values(completedTaskIds).filter(Boolean).length * 2;
  const liveReadinessPct = Math.min(100, baseReadiness + tasksBonus);

  // Today's shift performance / daily progress score matching Home page
  const completedCount = newHire.modulesCompleted ?? 3;
  const quizAvg = newHire.quizAverageScore ?? 94;
  const ordersCompleted = currentRecord.workSignal?.ordersCompleted ?? 38;
  const targetOrders = currentRecord.workSignal?.targetOrders ?? 42;
  const trainingScore = Math.min(100, Math.round(((completedCount / 3) * 50 + (quizAvg / 100) * 50)));
  const speedScore = Math.min(100, Math.round((actualPickRate / targetPickRate) * 100));
  const accuracyScore = Math.min(100, Math.round(accuracyRate));
  const ordersScore = Math.min(100, Math.round((ordersCompleted / targetOrders) * 100));
  const dailyShiftProgress = Math.round(
    trainingScore * 0.25 + speedScore * 0.30 + accuracyScore * 0.30 + ordersScore * 0.15
  );

  // Yesterday's record & composite score calculation
  const yesterdayNumber = Math.max(1, currentDay - 1);
  const isFirstDay = currentDay === 1;
  const yesterdayRecord: DayRecord | undefined = isFirstDay
    ? undefined
    : (newHire?.daysHistory || []).find((d) => d.dayNumber === yesterdayNumber) ||
      (newHire?.daysHistory || []).filter((d) => d.dayNumber < currentDay).pop();

  const prevWork = yesterdayRecord?.workSignal;
  const yestActualPace = prevWork?.actualPickRate ?? (isFirstDay ? 20 : 32);
  const yestTargetPace = prevWork?.targetPickRate ?? (isFirstDay ? 25 : 35);
  const yestAccuracy = prevWork?.accuracyRate ?? 99;
  const yestOrders = prevWork?.ordersCompleted ?? (isFirstDay ? 15 : 38);
  const yestTargetOrders = prevWork?.targetOrders ?? (isFirstDay ? 20 : 42);

  const yestSpeedScore = Math.min(100, Math.round((yestActualPace / yestTargetPace) * 100));
  const yestAccuracyScore = Math.min(100, Math.round(yestAccuracy));
  const yestOrdersScore = Math.min(100, Math.round((yestOrders / yestTargetOrders) * 100));
  const yesterdayScore = Math.round(
    trainingScore * 0.25 + yestSpeedScore * 0.30 + yestAccuracyScore * 0.30 + yestOrdersScore * 0.15
  );

  // Resolve values for the 3-tab dial
  let displayedPercentage = dailyShiftProgress;
  let dialUnit = isHindi ? "% दैनिक लक्ष्य" : "% Day Goal";
  let dialSubtext = isHindi ? "आज का दैनिक प्रगति स्कोर" : "Present Day Performance";
  let dialBadgeText = dailyShiftProgress >= 75 ? (isHindi ? "लक्ष्य पर" : "On Track") : (isHindi ? "प्रगति में" : "Ramping Steady");

  if (activeDialTab === "career") {
    displayedPercentage = liveReadinessPct;
    dialUnit = isHindi ? "% जॉब रेडी" : "% Job Ready";
    dialSubtext = isHindi ? "अब तक का समग्र करियर रेडीनेस" : "Till Date Job Ready Score";
    dialBadgeText = liveReadinessPct >= 80 ? (isHindi ? "नौकरी के लिए तैयार" : "Role Ready") : (isHindi ? "स्थिर गति" : "Ramping Steady");
  } else if (activeDialTab === "yesterday") {
    displayedPercentage = yesterdayScore;
    dialUnit = isHindi ? "% कल का स्कोर" : "% Yesterday";
    dialSubtext = isHindi ? "कल का समग्र शिफ्ट प्रदर्शन" : "Yesterday Performance";
    dialBadgeText = yesterdayScore >= 75 ? (isHindi ? "सफल शिफ्ट" : "Shift Met") : (isHindi ? "ध्यान दें" : "Needs Attention");
  }

  // Radial dial calculations
  const dialRadius = 68;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const sweepDegree = 280;
  const strokeDashoffset = dialCircumference - (displayedPercentage / 100) * (sweepDegree / 360) * dialCircumference;

  const totalTicks = 32;
  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    const angle = 130 + (i / (totalTicks - 1)) * sweepDegree;
    const rad = (angle * Math.PI) / 180;
    const x1 = 100 + 82 * Math.cos(rad);
    const y1 = 100 + 82 * Math.sin(rad);
    const x2 = 100 + 90 * Math.cos(rad);
    const y2 = 100 + 90 * Math.sin(rad);
    const isActive = (i / (totalTicks - 1)) * 100 <= displayedPercentage;
    return { x1, y1, x2, y2, isActive, key: i };
  });

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

  return (
    <div className="min-h-screen bg-[#070b13] text-[#e2e8f0] pb-28 select-none relative font-sans">
      {/* ========================================================= */}
      {/* 1. APP BAR - MINIMALIST HEADER WITH GREEN BLINKING DOT    */}
      {/* ========================================================= */}
      <div className="w-full bg-[#0d1321] text-white pt-3 pb-3 px-4 border-b border-[#1e293b] relative z-20 shadow-xl">
        <div className="flex items-center justify-between">
          {/* Floating Back Action */}
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center text-white border border-[#2e3e59] cursor-pointer shadow-md"
            title={isHindi ? "वापस जाएं" : "Back to Home"}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Green Blinking Status Dot */}
          <div className="flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            </span>
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
        {/* SECTION 1: 3-TAB PROGRESS CARD (DAY, CAREER, YESTERDAY)   */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div
            id="circular-telemetry-dial-widget"
            className="bg-gradient-to-b from-[#0b1739] via-[#071128] to-[#040816] rounded-[36px] p-5 sm:p-6 border border-white/10 shadow-2xl shadow-blue-950/50 space-y-4 select-none relative overflow-hidden text-white"
          >
            {/* Background ambient radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top User Pill (Matching the screenshot capsule: Amit Verma · 18% ready · दिन 1) */}
            <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 backdrop-blur-md rounded-full px-4 py-2.5 w-full max-w-xs mx-auto shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20">
                {newHire.name ? newHire.name.charAt(0) : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate leading-tight">
                  {newHire.name || "Amit Verma"}
                </h4>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {liveReadinessPct}% ready · {isHindi ? `दिन ${currentDay}` : `Day ${currentDay}`}
                </p>
              </div>
            </div>

            {/* 1. Three-Tab Pill Selector (Day, Career, Yesterday) */}
            <div className="flex items-center justify-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full max-w-xs mx-auto border border-white/10">
              <button
                type="button"
                onClick={() => setActiveDialTab("day")}
                className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "day"
                    ? "bg-white text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {isHindi ? "📅 दिन" : "📅 Day"}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialTab("career")}
                className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "career"
                    ? "bg-white text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {isHindi ? "📈 करियर" : "📈 Career"}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialTab("yesterday")}
                className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "yesterday"
                    ? "bg-white text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {isHindi ? "⏮️ कल" : "⏮️ Yesterday"}
              </button>
            </div>

            {/* 2. Four Quick Action Circular Buttons */}
            <div className="flex items-center justify-center gap-3.5 pt-0.5">
              {/* Action 1: Aisle Map */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("map");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "आइसल मैप" : "Aisle Guide"}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/[0.07] text-white border-white/10 hover:border-white/30 hover:bg-white/15 active:scale-95"
              >
                <Zap className="w-4 h-4 text-cyan-300 stroke-[1.6]" />
              </button>

              {/* Action 2: Scanner Lock / Fix */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("scanner");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "स्कैनर चेक" : "Scanner Terminal"}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/[0.07] text-white border-white/10 hover:border-white/30 hover:bg-white/15 active:scale-95"
              >
                <Clock className="w-4 h-4 text-blue-300 stroke-[1.6]" />
              </button>

              {/* Action 3: Target Goal */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("target");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "पिक टारगेट" : "Ramp Target"}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/[0.07] text-white border-white/10 hover:border-white/30 hover:bg-white/15 active:scale-95"
              >
                <Target className="w-4 h-4 text-cyan-400 stroke-[1.6]" />
              </button>

              {/* Action 4: Floor Buddy */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenBuddy) onOpenBuddy();
                  else if (onSelectFloorTask) onSelectFloorTask("buddy");
                  else if (onSelectSection) onSelectSection("buddy");
                }}
                title={isHindi ? "विक्रम भैया को बुलाएं" : "Call Floor Buddy"}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/[0.07] text-white border-white/10 hover:border-white/30 hover:bg-white/15 active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-emerald-300 stroke-[1.6]" />
              </button>
            </div>

            {/* 3. The Circular Dial / Gauge (Exact styling from screenshot: white arc, blue sphere) */}
            <div className="relative flex items-center justify-center py-2">
              <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center">
                <svg
                  viewBox="0 0 220 220"
                  className="w-full h-full select-none -rotate-90"
                >
                  <defs>
                    <radialGradient id="screenshotSphereGrad" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#354e8c" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#1a2b56" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#0b1328" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  {/* Inner Shaded Blue Sphere */}
                  <circle
                    cx="110"
                    cy="110"
                    r="68"
                    fill="url(#screenshotSphereGrad)"
                    className="rotate-90 origin-center"
                  />

                  {/* Outer Semi-Transparent Track */}
                  <circle
                    cx="110"
                    cy="110"
                    r="84"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="18"
                  />

                  {/* Active Solid White Progress Arc (Exact match to screenshot) */}
                  <circle
                    cx="110"
                    cy="110"
                    r="84"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={
                      (2 * Math.PI * 84) - (displayedPercentage / 100) * (2 * Math.PI * 84)
                    }
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Centered Gauge Typography (Matching screenshot layout) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
                  <div className="flex items-baseline justify-center text-white">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">{displayedPercentage}</span>
                    <span className="text-xl sm:text-2xl font-bold text-white/90 ml-0.5">%</span>
                  </div>
                  <span className="text-[13px] sm:text-sm font-bold text-white mt-1">
                    {activeDialTab === "career"
                      ? (isHindi ? "कुल रेडीनेस" : "Total Readiness")
                      : activeDialTab === "day"
                      ? (isHindi ? "दैनिक लक्ष्य" : "Daily Goal")
                      : (isHindi ? "कल का स्कोर" : "Yesterday Score")}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300/80 mt-0.5">
                    {isHindi
                      ? `दिन ${currentDay} · ${activeDialTab === "career" ? "करियर रेडी" : activeDialTab === "day" ? "शिफ्ट प्रोग्रेस" : "प्रदर्शन"}`
                      : `Day ${currentDay} · ${activeDialTab === "career" ? "Career Ready" : activeDialTab === "day" ? "Shift Progress" : "Performance"}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. White CTA Button (Exact styling from screenshot: "शुरू करें · आज का लक्ष्य ➔") */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("floor-checklist-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-black text-base tracking-tight shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>{isHindi ? "शुरू करें · आज का लक्ष्य" : "Start · Today's Goal"}</span>
                <span className="text-lg leading-none">➔</span>
              </button>
              <p className="text-xs font-normal text-slate-300 text-center">
                {isHindi ? "दैनिक लक्ष्य और चेकलिस्ट पर जाएं" : "Go to daily goals & checklist"}
              </p>
            </div>

            {/* Context Note based on Active Tab */}
            <div className="bg-black/30 rounded-xl px-3.5 py-2 border border-white/5 flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-medium text-cyan-300">{dialSubtext}</span>
              <span className="font-mono text-white text-[10.5px]">
                {activeDialTab === "day" && `Speed: ${actualPickRate}/${targetPickRate} • Acc: ${accuracyRate}%`}
                {activeDialTab === "career" && `Benchmark: 85%+ • Current: ${liveReadinessPct}%`}
                {activeDialTab === "yesterday" && `Pace: ${yestActualPace}/${yestTargetPace} • Acc: ${yestAccuracy}%`}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: PERFORMANCE & CLINIC RX (TEAL UNIFIED CARD)    */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-4 w-1 bg-[#00d0a5] rounded-full" />
            <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400">
              {isHindi ? "फ्लोर परफॉर्मेंस व डॉक्टर सुझाव" : "PERFORMANCE & CLINIC RX"}
            </h3>
          </div>

          {/* Cohesive Teal Card formatted exactly like the user's reference image */}
          <div className="bg-gradient-to-b from-[#02564d] via-[#014d45] to-[#014038] border border-[#0d786d]/80 rounded-[24px] overflow-hidden shadow-xl shadow-teal-950/30 text-white">
            {/* Top Half: 2 Metrics in equal columns with vertical divider */}
            <div className="p-4 sm:p-5 grid grid-cols-2">
              {/* Left Column: Active Speed */}
              <div
                onClick={() => onSelectSection && onSelectSection("dial")}
                className="pr-3 sm:pr-4 flex flex-col justify-between cursor-pointer group select-none"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-[#7be0d0] leading-tight block">
                    {isHindi ? "पिकिंग स्पीड" : "ACTIVE SPEED"}
                  </span>
                  <span className="text-[8.5px] font-bold text-[#52bfae] uppercase tracking-wider block">
                    {isHindi ? "यूनिट्स / घंटा" : "PICK RATE, P/H"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <div className="text-[#00ffd5] group-hover:scale-110 transition-transform shrink-0">
                    <Zap className="w-5 h-5 fill-[#00ffd5]/30 stroke-[2.5]" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                      {actualPickRate}
                    </span>
                    <span className="text-[10px] font-bold text-[#7be0d0]/80">
                      /{targetPickRate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Store Accuracy & Doctor Rx */}
              <div className="border-l border-[#0d786d] pl-3 sm:pl-4 flex flex-col justify-between">
                <div
                  onClick={() => {
                    setIsPrescribedExpanded(true);
                    document.getElementById("prescribed-modules-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="cursor-pointer group select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-[#7be0d0] leading-tight block">
                      {isHindi ? "सटीकता व आरएक्स" : "ACCURACY & RX"}
                    </span>
                    <span className="text-[8.5px] font-bold text-[#52bfae] uppercase tracking-wider block">
                      {isHindi ? "क्वालिटी स्कोर" : "QUALITY SCORE, %"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-[#00ffd5] group-hover:scale-110 transition-transform shrink-0">
                      <Stethoscope className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        {accuracyRate}%
                      </span>
                      <span className="text-[9.5px] font-black text-[#00ffd5] bg-[#00ffd5]/15 px-1.5 py-0.5 rounded border border-[#00ffd5]/25">
                        2 Rx
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Notification Label + Title + Bell & Toggle Switch */}
            <div className="bg-[#013f38] border-t border-[#0d786d] px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase text-[#7be0d0] block leading-tight">
                  {isHindi ? "नोटिफिकेशन प्राप्त करें जब" : "RECIEVE NOTIFICATION WHEN"}
                </span>
                <span className="text-xs sm:text-sm font-black text-white truncate block mt-0.5">
                  {isHindi ? "डॉक्टर आरएक्स ड्रिल चालू हो" : "Doctor Rx turns on"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className={`transition-colors ${isRxAlertActive ? "text-[#00ffd5]" : "text-slate-400"}`}>
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsRxAlertActive((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                    isRxAlertActive ? "bg-[#00c9a7]" : "bg-[#022f29]"
                  }`}
                  aria-label="Toggle doctor alert notifications"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isRxAlertActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Row: Action link / Chevron Toggle */}
            <button
              type="button"
              onClick={() => setIsDiagnosisNotesOpen((prev) => !prev)}
              className="w-full bg-[#003730] hover:bg-[#00312b] border-t border-[#0d786d] px-4 py-3 sm:px-5 flex items-center justify-between text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="text-[11px] sm:text-xs font-semibold text-[#8deedd] group-hover:text-white">
                {isHindi ? "अन्य ज़ोन व डॉक्टर सुझाव के लिए नोटिफिकेशन सेट करें" : "Set up notifications for other zones"}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-[#7be0d0] group-hover:text-white transition-transform duration-200 ${
                  isDiagnosisNotesOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Expandable Diagnosis Drawer */}
            {isDiagnosisNotesOpen && (
              <div className="bg-[#002d27] px-4 py-3.5 sm:px-5 border-t border-[#0d786d] text-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00ffd5]/15 text-[#00ffd5] flex items-center justify-center shrink-0 mt-0.5 border border-[#00ffd5]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#7be0d0] block">
                      {isHindi ? "AI स्टोर डॉक्टर डायग्नोसिस आधार:" : "AI Clinic Diagnosis Basis:"}
                    </span>
                    <p className="leading-relaxed text-slate-200 text-[11.5px]">
                      {doctorDiagnosis}
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrescribedExpanded(true);
                      document.getElementById("prescribed-modules-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[10.5px] font-black text-[#00ffd5] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isHindi ? "निर्धारित मॉड्यूल खोलें" : "Open Prescribed Modules"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: PRESCRIBED TRAINING (SMART MODERN LMS CARD)    */}
        {/* ========================================================= */}
        <div id="prescribed-modules-section" className="space-y-2.5">
          {/* Main Collapsible Header Tab matching the requested screenshot */}
          <button
            type="button"
            onClick={() => setIsPrescribedExpanded((prev) => !prev)}
            className="w-full text-left bg-gradient-to-r from-[#171d2b] to-[#141824] hover:from-[#1d2537] hover:to-[#171d2c] border border-purple-500/25 hover:border-purple-500/45 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg shadow-purple-950/20 transition-all active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Icon with Violet/Purple Accent */}
              <div className="w-11 h-11 rounded-full bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-300 shrink-0 shadow-inner group-hover:scale-105 group-hover:border-purple-400/60 transition-all">
                <BookOpen className="w-5 h-5" />
              </div>

              {/* Tag + Duration and Title */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {isHindi ? "एलएमएस लर्निंग" : "LMS LEARNING"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {todaysPrescribedModules.reduce((acc, m) => acc + m.durationMinutes, 0)} mins
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-purple-200 transition-colors">
                  {isHindi
                    ? "1. निर्धारित डिजिटल ट्रेनिंग मॉड्यूल"
                    : "1. Today's Active Goal & Prescribed Learning"}
                </h3>
              </div>
            </div>

            {/* Circular Arrow Badge */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#101420] border border-purple-500/20 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-purple-600/30 transition-all">
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  isPrescribedExpanded ? "rotate-90 text-purple-300" : ""
                }`}
              />
            </div>
          </button>

          {/* Expanded Content: Individual Prescribed Modules */}
          {isPrescribedExpanded && (
            <div className="space-y-2 pl-2 sm:pl-3 border-l-2 border-purple-500/30 ml-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {todaysPrescribedModules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveModule(mod)}
                  className="p-3 rounded-xl border bg-[#101726] border-purple-900/30 hover:border-purple-400/50 shadow-md transition-all cursor-pointer group active:scale-98 flex items-center justify-between gap-3 hover:-translate-y-0.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20 font-mono">
                        {mod.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {mod.durationMinutes} min
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {isHindi ? mod.titleHi : mod.title}
                    </h4>
                  </div>

                  <div className="shrink-0 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-all">
                    <Play className="w-3 h-3 fill-white stroke-[2]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: FLOOR PRACTICE (SMART MODERN AMBER/CYAN CARD)  */}
        {/* ========================================================= */}
        <div className="space-y-2.5">
          {/* Main Collapsible Header Tab matching the requested screenshot */}
          <button
            type="button"
            onClick={() => setIsFloorActionsExpanded((prev) => !prev)}
            className="w-full text-left bg-gradient-to-r from-[#171e2b] to-[#141924] hover:from-[#1d2737] hover:to-[#18202e] border border-cyan-500/25 hover:border-cyan-500/45 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg shadow-cyan-950/20 transition-all active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Icon with Warm Amber/Gold Center */}
              <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 shadow-inner group-hover:scale-105 group-hover:border-amber-400/60 transition-all">
                <Target className="w-5 h-5" />
              </div>

              {/* Tag + Duration and Title */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {isHindi ? "फ्लोर प्रैक्टिस" : "FLOOR PRACTICE"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {todaysTasks.length} {isHindi ? "कार्य • 60 mins" : "Tasks • 60 mins"}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-cyan-200 transition-colors">
                  {isHindi
                    ? "2. फ्लोर पर आवश्यक कार्य व ड्रिल्स"
                    : "2. 15-Min Aisle Walkthrough & Floor Drills"}
                </h3>
              </div>
            </div>

            {/* Circular Arrow Badge */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#101420] border border-cyan-500/20 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-600/30 transition-all">
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  isFloorActionsExpanded ? "rotate-90 text-cyan-300" : ""
                }`}
              />
            </div>
          </button>

          {/* Expanded Content: Floor Action Cards */}
          {isFloorActionsExpanded && (
            <div className="space-y-2 pl-2 sm:pl-3 border-l-2 border-cyan-500/30 ml-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {todaysTasks.map((task) => {
                const isToggled = !!completedTaskIds[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className="bg-[#0e1726] rounded-xl p-3 border border-[#1e2c44] hover:border-cyan-500/40 flex items-center justify-between gap-3 shadow-md transition-all cursor-pointer active:scale-98 group"
                  >
                    {/* Left Squircle Icon Container */}
                    <div className="w-9 h-9 rounded-xl bg-[#092230] text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/25 group-hover:scale-105 transition-transform">
                      <Radio className="w-4 h-4" />
                    </div>

                    {/* Middle Title & Subtitle */}
                    <div className="min-w-0 flex-1 pr-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-cyan-200 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                        {isHindi
                          ? `${task.category} • ${task.duration}`
                          : `${task.category} • ${task.duration}`}
                      </p>
                    </div>

                    {/* Right Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => toggleTaskCompletion(task.id, e)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                        isToggled
                          ? "bg-[#00c5ff]"
                          : "bg-slate-700"
                      }`}
                      aria-label={`Toggle ${task.title}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                          isToggled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
