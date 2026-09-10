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
  Activity,
  Radio,
  TrendingUp,
  Bell,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { NewHire, TrainingModule, DayRecord } from "../types";
import { MANDATORY_TRAINING_MODULES } from "../data/modulesData";
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
  const [isTodaysActivityModalOpen, setIsTodaysActivityModalOpen] = useState<boolean>(false);
  const [isEodSimulation, setIsEodSimulation] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#eef0f4] text-slate-900 pb-28 select-none relative font-sans">
      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md mx-auto px-3 sm:px-4 space-y-3.5 pt-3 sm:pt-4">
        {/* ========================================================= */}
        {/* SECTION 1: 3-TAB PROGRESS CARD (DAY, CAREER, YESTERDAY)   */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div
            id="circular-telemetry-dial-widget"
            className="bg-gradient-to-b from-[#1b42df] via-[#0c268a] to-[#040b32] rounded-[28px] p-4 shadow-xl space-y-3 select-none relative overflow-hidden text-white border border-blue-500/20"
          >
            {/* Top Bar inside Hero Banner: Back Button, Blinking Green Dot, and Hindi Language Icon */}
            <div className="flex items-center justify-between relative z-20 pb-0.5">
              {/* Floating Back Action */}
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white border border-white/15 cursor-pointer"
                title={isHindi ? "वापस जाएं" : "Back to Home"}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Green Blinking Status Dot */}
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  {isHindi ? "लाइव" : "LIVE"}
                </span>
              </div>

              {/* Hindi / Language Selector Icon */}
              {onToggleLanguage ? (
                <button
                  type="button"
                  onClick={onToggleLanguage}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black tracking-wide border border-white/15 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  title="Toggle Hindi / English"
                >
                  <Languages className="w-3 h-3 text-cyan-400" />
                  <span>{isHindi ? "हिंदी" : "EN"}</span>
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>

            {/* 1. Three-Tab Pill Selector (Day, Career, Yesterday) */}
            <div className="flex items-center justify-center gap-1 bg-white/10 p-1 rounded-full max-w-xs mx-auto border border-white/15">
              <button
                type="button"
                onClick={() => setActiveDialTab("day")}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "day"
                    ? "bg-white text-slate-900 font-bold shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {isHindi ? "📅 दिन" : "📅 Day"}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialTab("career")}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "career"
                    ? "bg-white text-slate-900 font-bold shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {isHindi ? "📈 करियर" : "📈 Career"}
              </button>
              <button
                type="button"
                onClick={() => setActiveDialTab("yesterday")}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-medium transition-all cursor-pointer truncate ${
                  activeDialTab === "yesterday"
                    ? "bg-white text-slate-900 font-bold shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {isHindi ? "⏮️ कल" : "⏮️ Yesterday"}
              </button>
            </div>

            {/* 2. Four Quick Action Circular Buttons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {/* Action 1: Aisle Map */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("map");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "आइसल मैप" : "Aisle Guide"}
                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/10 text-white border-white/15 hover:bg-white/20 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400 stroke-[1.8]" />
              </button>

              {/* Action 2: Scanner Lock / Fix */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("scanner");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "स्कैनर चेक" : "Scanner Terminal"}
                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/10 text-white border-white/15 hover:bg-white/20 active:scale-95"
              >
                <Clock className="w-3.5 h-3.5 text-blue-300 stroke-[1.8]" />
              </button>

              {/* Action 3: Target Goal */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectFloorTask) onSelectFloorTask("target");
                  else if (onSelectSection) onSelectSection("dial");
                }}
                title={isHindi ? "पिक टारगेट" : "Ramp Target"}
                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/10 text-white border-white/15 hover:bg-white/20 active:scale-95"
              >
                <Target className="w-3.5 h-3.5 text-teal-300 stroke-[1.8]" />
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
                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/10 text-white border-white/15 hover:bg-white/20 active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-300 stroke-[1.8]" />
              </button>
            </div>

            {/* 3. The Circular Dial / Gauge */}
            <div className="relative flex items-center justify-center py-1">
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                <svg
                  viewBox="0 0 220 220"
                  className="w-full h-full select-none -rotate-90"
                >
                  <defs>
                    <radialGradient id="midnightSphereGrad" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#1a3475" stopOpacity="1" />
                      <stop offset="100%" stopColor="#081432" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  {/* Inner Shaded Sphere */}
                  <circle
                    cx="110"
                    cy="110"
                    r="68"
                    fill="url(#midnightSphereGrad)"
                    className="rotate-90 origin-center"
                  />

                  {/* Outer Track */}
                  <circle
                    cx="110"
                    cy="110"
                    r="84"
                    fill="none"
                    stroke="#1e3a6e"
                    strokeWidth="16"
                  />

                  {/* Active Solid White Progress Arc */}
                  <circle
                    cx="110"
                    cy="110"
                    r="84"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={
                      (2 * Math.PI * 84) - (displayedPercentage / 100) * (2 * Math.PI * 84)
                    }
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Centered Gauge Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-3">
                  <div className="flex items-baseline justify-center text-white">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">{displayedPercentage}</span>
                    <span className="text-lg sm:text-xl font-bold text-white/80 ml-0.5">%</span>
                  </div>
                  <span className="text-xs font-bold text-white mt-0.5">
                    {activeDialTab === "career"
                      ? (isHindi ? "कुल रेडीनेस" : "Total Readiness")
                      : activeDialTab === "day"
                      ? (isHindi ? "दैनिक लक्ष्य" : "Daily Goal")
                      : (isHindi ? "कल का स्कोर" : "Yesterday Score")}
                  </span>
                  <span className="text-[10px] font-medium text-white/70">
                    {isHindi
                      ? `दिन ${currentDay} · ${activeDialTab === "career" ? "करियर रेडी" : activeDialTab === "day" ? "शिफ्ट प्रोग्रेस" : "प्रदर्शन"}`
                      : `Day ${currentDay} · ${activeDialTab === "career" ? "Career Ready" : activeDialTab === "day" ? "Shift Progress" : "Performance"}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Context Note */}
            <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/15 flex items-center justify-between text-[11px] text-white/90">
              <span className="font-semibold text-white">{dialSubtext}</span>
              <span className="font-mono text-white/80 text-[10px]">
                {activeDialTab === "day" && `Speed: ${actualPickRate}/${targetPickRate} • Acc: ${accuracyRate}%`}
                {activeDialTab === "career" && `Benchmark: 85%+ • Current: ${liveReadinessPct}%`}
                {activeDialTab === "yesterday" && `Pace: ${yestActualPace}/${yestTargetPace} • Acc: ${yestAccuracy}%`}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: TODAY'S LIVE METRICS (MINIMALIST 4-GRID CARD)  */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-4 w-1 bg-slate-900 rounded-full" />
            <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-500">
              {isHindi ? "आज के लाइव मेट्रिक्स" : "TODAY'S LIVE METRICS"}
            </h3>
          </div>

          <div className="bg-white rounded-[24px] p-4 shadow-xs text-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isHindi ? "लाइव शिफ्ट मेट्रिक्स" : "LIVE SHIFT METRICS"}
              </span>
              <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {isHindi ? `दिन ${currentDay} लाइव` : `Day ${currentDay} Live`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* 1. Live Module Completion % */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tight truncate w-full">
                  {isHindi ? "मॉड्यूल" : "Modules"}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-none">
                  {Math.min(100, Math.round((completedCount / 4) * 100))}%
                </span>
                <span className="text-[7.5px] font-semibold text-emerald-600 mt-0.5 truncate w-full">
                  {isHindi ? `${completedCount}/4 पूर्ण` : `${completedCount}/4 Done`}
                </span>
              </div>

              {/* 2. Pick Rate Live */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tight truncate w-full">
                  {isHindi ? "पिक रेट" : "Pick Rate"}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-none">
                  {actualPickRate}
                </span>
                <span className="text-[7.5px] font-semibold text-blue-600 mt-0.5 truncate w-full">
                  /{targetPickRate} P/H
                </span>
              </div>

              {/* 3. Accuracy Live */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tight truncate w-full">
                  {isHindi ? "सटीकता" : "Accuracy"}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-none">
                  {accuracyRate}%
                </span>
                <span className="text-[7.5px] font-semibold text-emerald-600 mt-0.5 truncate w-full">
                  {isHindi ? "लक्ष्य पार" : "On Target"}
                </span>
              </div>

              {/* 4. Quality Check */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase text-slate-500 tracking-tight truncate w-full">
                  {isHindi ? "क्वालिटी" : "QC Check"}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 leading-none">
                  98.5%
                </span>
                <span className="text-[7.5px] font-semibold text-blue-600 mt-0.5 truncate w-full">
                  {isHindi ? "पास (OK)" : "Passed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TODAY'S ACTIVITY PILL (CLICKABLE TO OPEN DETAILED MODAL)  */}
        {/* ========================================================= */}
        <div className="pt-0.5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsTodaysActivityModalOpen(true)}
            className="flex items-center gap-2.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 backdrop-blur-md rounded-full px-4.5 py-2 shadow-md select-none cursor-pointer transition-all active:scale-95 group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white flex items-center justify-center shrink-0 border border-white/25 shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-200 transition-colors">
              {isHindi ? "आज की गतिविधि (विस्तृत टैब)" : "Today's Activity (Detailed Tab)"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
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

      {/* ========================================================= */}
      {/* 10. CONTROL TOWER VIEW: DEAN PRESCRIBED ACTIVITIES LIST   */}
      {/* ========================================================= */}
      {isTodaysActivityModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d1321] border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            {/* Close button */}
            <button
              onClick={() => setIsTodaysActivityModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1b2536] hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white border border-[#2b3c54] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                  {isHindi ? "कंट्रोल टॉवर व्यू" : "Control Tower View"}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isHindi ? `दिन ${currentDay} निगरानी` : `Day ${currentDay} Monitor`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {isHindi ? "डीन द्वारा निर्धारित आज की गतिविधियां" : "Dean Prescribed Activities & 5-Activity Breakdown"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isHindi
                  ? "यह केवल नियंत्रण कक्ष (Control Tower) का अवलोकन है। यहां से कोई कार्रवाई या सबमिशन नहीं होता।"
                  : "Read-only control tower viewpoint. Displays all prescribed LMS sub-modules and floor tasks with shift tracking."}
              </p>
            </div>

            {/* EOD Simulation Toggle Switch */}
            <div className="bg-[#141b2c] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEodSimulation ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isHindi ? "एंड-ऑफ-डे (EOD) सिमुलेशन" : "End-of-Day (EOD) Shift Simulation"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isEodSimulation
                      ? (isHindi ? "अपूर्ण कार्य लाल (Red) दिखाए जा रहे हैं" : "Unfinished tasks flagged Red for EOD")
                      : (isHindi ? "सक्रिय शिफ्ट - अपूर्ण कार्य पीले (Amber)" : "Active shift - unfinished tasks in Amber")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEodSimulation(!isEodSimulation)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEodSimulation ? 'bg-red-600' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEodSimulation ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px bg-white/10" />

            {/* Flat Control Tower List of Prescribed LMS Modules and 5 Sub-Activities */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                {isHindi ? "1. निर्धारित एलएमएस मॉड्यूल (5 उप-गतिविधियां)" : "1. Prescribed LMS Modules (All 5 Sub-Activities)"}
              </span>

              <div className="space-y-2">
                {todaysPrescribedModules.map((prescribedMod) => {
                  const fullModData = MANDATORY_TRAINING_MODULES.find((m) => m.id === prescribedMod.id) || prescribedMod;
                  const activities = fullModData.activities || [];

                  return (
                    <div key={prescribedMod.id} className="bg-[#131927] border border-white/10 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                            {prescribedMod.code}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {isHindi ? prescribedMod.titleHi : prescribedMod.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {prescribedMod.durationMinutes}m
                        </span>
                      </div>

                      {/* Flat list of 5 sub-activities (No nested cards) */}
                      <div className="space-y-1.5 pl-1">
                        {activities.map((act, actIdx) => {
                          const isDone = act.completed;
                          const statusColor = isDone
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : isEodSimulation
                            ? "text-red-400 bg-red-500/15 border-red-500/30"
                            : "text-amber-300 bg-amber-500/10 border-amber-500/20";

                          return (
                            <div
                              key={act.id || actIdx}
                              className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-2 text-xs ${statusColor}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : isEodSimulation ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                )}
                                <span className="font-medium text-slate-200 truncate">
                                  {actIdx + 1}. {isHindi ? (act.titleHi || act.title) : act.title}
                                </span>
                              </div>

                              <div className="shrink-0">
                                {isDone ? (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                    {isHindi ? "पूर्ण" : "DONE"}
                                  </span>
                                ) : isEodSimulation ? (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                                    {isHindi ? "अपूर्ण (लाल)" : "OVERDUE"}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                    {isHindi ? "लंबित" : "PENDING"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flat Control Tower List of Floor Practice Tasks */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                {isHindi ? "2. फ्लोर अभ्यास और व्यावहारिक कार्य" : "2. Prescribed Floor Practice Tasks"}
              </span>

              <div className="space-y-1.5">
                {todaysTasks.map((t) => {
                  const isDone = completedTaskIds[t.id];
                  const statusColor = isDone
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : isEodSimulation
                    ? "text-red-400 bg-red-500/15 border-red-500/30"
                    : "text-slate-200 bg-[#131927] border-white/10";

                  return (
                    <div
                      key={t.id}
                      className={`px-3 py-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${statusColor}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isEodSimulation ? (
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-semibold text-white truncate">{t.title}</span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-mono">{t.duration}</span>
                        {isDone ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            {isHindi ? "पूर्ण" : "DONE"}
                          </span>
                        ) : isEodSimulation ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                            {isHindi ? "लाल (EOD)" : "OVERDUE"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            {isHindi ? "लंबित" : "PENDING"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                onClick={() => setIsTodaysActivityModalOpen(false)}
                className="py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#1b2536] hover:bg-[#253247] text-slate-200 transition-all w-full cursor-pointer border border-white/10"
              >
                <span>{isHindi ? "बंद करें" : "Close Control Tower View"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
