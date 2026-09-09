import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  HelpCircle,
  Cpu,
  Target,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  ArrowRight,
  X,
  Check,
  Zap,
  Play,
  ShieldCheck,
  ScanLine,
  MapPin,
  Snowflake,
  PackageCheck,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { NewHire, TrainingModule, ModuleActivity, DARK_STORE_CAPABILITIES } from "../types";
import { MANDATORY_TRAINING_MODULES } from "../data/modulesData";

export function checkDeanModuleGate(mod: TrainingModule, newHire: NewHire): { isGated: boolean; reason: string; correctiveAction: string } {
  const capabilities = newHire.capabilities || {};
  if (newHire.status === "At risk" || newHire.status === "Needs attention") {
    if (mod.dayNumber >= (newHire.currentDay || 3) + 1) {
      return {
        isGated: true,
        reason: `Dean's True Adaptive Hold: Day ${mod.dayNumber} (${mod.code}) is gated because ongoing telemetry indicates active floor friction and unmastered prerequisites.`,
        correctiveAction: `Manager / Buddy Corrective Action: Execute targeted 15-minute 1:1 floor walkthrough before unlocking Day ${mod.dayNumber}.`,
      };
    }
  }
  return { isGated: false, reason: "", correctiveAction: "" };
}

interface ModulesViewProps {
  newHire: NewHire;
  onUpdateHire?: (updatedHire: NewHire) => void;
  isHindi?: boolean;
  initialModuleId?: string | null;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  newHire,
  onUpdateHire,
  isHindi = false,
  initialModuleId = null,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "foundation" | "floor" | "cert">("all");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    initialModuleId || `lms-mod-0${Math.min(10, Math.max(1, (newHire.modulesCompleted || 3) + 1))}`
  );
  const [activeDetailModule, setActiveDetailModule] = useState<TrainingModule | null>(
    initialModuleId ? MANDATORY_TRAINING_MODULES.find((m) => m.id === initialModuleId) || null : null
  );
  const [activeActivityModal, setActiveActivityModal] = useState<{
    module: TrainingModule;
    activity: ModuleActivity;
  } | null>(null);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [practiceChecked, setPracticeChecked] = useState<boolean>(false);

  const modulesCompletedCount = newHire.modulesCompleted ?? 3;
  const completedIds = newHire.completedModuleIds || [
    "lms-mod-01",
    "lms-mod-02",
    "lms-mod-03",
  ];
  const quizAvg = newHire.quizAverageScore ?? 94;

  const handleCompleteActivity = (modId: string, actId: string) => {
    // If the learner completes the assessment/final activity, unlock/complete the module
    const currentCompletedCount = newHire.modulesCompleted || 0;
    const mod = MANDATORY_TRAINING_MODULES.find((m) => m.id === modId);
    if (!mod) return;

    if (!completedIds.includes(modId)) {
      const updatedCompletedIds = [...completedIds, modId];
      const newCompletedCount = updatedCompletedIds.length;

      // Update capability exposure (exposure = "exposed" without falsely marking floor mastery)
      const updatedCapabilities = { ...(newHire.capabilities || {}) };
      mod.mappedCapabilityIds.forEach((capId) => {
        if (!updatedCapabilities[capId]) {
          updatedCapabilities[capId] = {
            capabilityId: capId,
            exposure: "exposed",
            evidence: "none",
            performance: "unknown",
            mastery: "in_progress",
            lastAssessedAt: `Day ${mod.dayNumber} LMS Module`,
            reinforcementCount: 0,
          };
        } else if (updatedCapabilities[capId].exposure === "not_exposed") {
          updatedCapabilities[capId] = {
            ...updatedCapabilities[capId],
            exposure: "exposed",
          };
        }
      });

      const updatedHire: NewHire = {
        ...newHire,
        modulesCompleted: newCompletedCount,
        completedModuleIds: updatedCompletedIds,
        capabilities: updatedCapabilities,
      };

      if (onUpdateHire) {
        onUpdateHire(updatedHire);
      }
    }

    setActiveActivityModal(null);
  };

  const getActivityIcon = (type: ModuleActivity["type"]) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case "simulation":
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case "practice":
        return <Target className="w-4 h-4 text-amber-600" />;
      case "assessment":
        return <FileCheck className="w-4 h-4 text-rose-600" />;
    }
  };

  const getActivityTypeName = (type: ModuleActivity["type"]) => {
    switch (type) {
      case "video":
        return isHindi ? "वीडियो पाठ" : "Video Lesson";
      case "quiz":
        return isHindi ? "इंटरएक्टिव क्विज" : "Interactive Quiz";
      case "simulation":
        return isHindi ? "फ्लोर सिमुलेशन" : "Floor Simulation";
      case "practice":
        return isHindi ? "प्रैक्टिकल ड्रिल" : "Floor Practice Drill";
      case "assessment":
        return isHindi ? "मॉड्यूल मूल्यांकन" : "Module Assessment";
    }
  };

  const getModuleDayIcon = (dayNumber: number) => {
    const iconClass = "w-7 h-7 sm:w-8 sm:h-8";
    switch (dayNumber) {
      case 1:
        return <ShieldCheck className={iconClass} />;
      case 2:
        return <ScanLine className={iconClass} />;
      case 3:
        return <Snowflake className={iconClass} />;
      case 4:
        return <ShoppingCart className={iconClass} />;
      case 5:
        return <Boxes className={iconClass} />;
      case 6:
        return <PackageCheck className={iconClass} />;
      case 7:
        return <Zap className={iconClass} />;
      case 8:
        return <FileCheck className={iconClass} />;
      case 9:
        return <Target className={iconClass} />;
      case 10:
        return <Trophy className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const getModuleShortLabel = (dayNumber: number, hindiMode: boolean) => {
    const map: Record<number, { en: string; hi: string }> = {
      1: { en: "Store Safety & PPE", hi: "सुरक्षा व PPE" },
      2: { en: "PDA Barcode", hi: "PDA बारकोड" },
      3: { en: "Cold Chain", hi: "कोल्ड चेन" },
      4: { en: "High Picking", hi: "हाई पिकिंग" },
      5: { en: "Multi Totes", hi: "मल्टी टोट्स" },
      6: { en: "Packaging", hi: "पैकेजिंग" },
      7: { en: "Speed Drill", hi: "स्पीड ड्रिल" },
      8: { en: "Quality Check", hi: "क्वालिटी चेक" },
      9: { en: "Rush Hours", hi: "रश आवर्स" },
      10: { en: "Certification", hi: "सर्टिफिकेशन" },
    };
    return hindiMode ? map[dayNumber]?.hi || `डे ${dayNumber}` : map[dayNumber]?.en || `Day ${dayNumber}`;
  };

  const filteredModules = MANDATORY_TRAINING_MODULES.filter((mod) => {
    if (activeTab === "foundation") return mod.dayNumber >= 1 && mod.dayNumber <= 3;
    if (activeTab === "floor") return mod.dayNumber >= 4 && mod.dayNumber <= 7;
    if (activeTab === "cert") return mod.dayNumber >= 8 && mod.dayNumber <= 10;
    return true;
  });

  return (
    <div className="animate-in fade-in duration-200 select-none pb-20 text-white bg-[#14161d]">
      {/* ========================================================= */}
      {/* 1. HERO BANNER */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-b-[32px] rounded-t-none pt-10 pb-7 px-5 sm:px-6 text-white shadow-2xl border-b border-white/10 overflow-hidden bg-[#1b1e26]"
      >
        {/* Subtle premium accent glow to lift the look */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-rose-600/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-3.5 max-w-[65%]">
            <div className="inline-block px-3 py-1 rounded-full bg-pink-500/10 backdrop-blur-md text-pink-300 text-[10px] font-black uppercase tracking-wider border border-pink-500/20">
              {isHindi ? "फीचर्ड प्रोग्राम" : "Featured"}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
                {isHindi ? "10-दिवसीय ट्रेनिंग और सर्टिफिकेशन" : "Certification & Training"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold drop-shadow-xs">
                <span>⭐ 4.8</span>
                <span>•</span>
                <span>{isHindi ? `${modulesCompletedCount}/10 दिन पूर्ण` : `${modulesCompletedCount}/10 Days Done`}</span>
                <span>•</span>
                <span className="text-pink-400 font-bold">{Math.round((modulesCompletedCount / 10) * 100)}% {isHindi ? "तैयार" : "Ready"}</span>
              </div>
            </div>
          </div>

          {/* Premium Circular SVG Dial styled like the reference photo (hot pink with central stats) */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            {/* Soft backdrop glow to mimic OLED lighting of hot pink */}
            <div className="absolute inset-2 bg-pink-500/10 rounded-full blur-md animate-pulse" />

            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Matte underlying circle track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-white/10"
                strokeWidth="5"
                fill="transparent"
              />
              {/* Vibrant Hot Pink glowing progress path */}
              <circle
                cx="50"
                cy="50"
                r="38"
                className="stroke-pink-500 transition-all duration-700 ease-out"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={238.76}
                strokeDashoffset={238.76 - (238.76 * (modulesCompletedCount / 10))}
                strokeLinecap="round"
              />
            </svg>

            {/* Core text content inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[9px] font-black tracking-widest text-pink-400/85 uppercase">DAY</span>
              <span className="text-2xl font-black text-white mt-1">0{modulesCompletedCount}</span>
              <span className="text-[10px] font-bold text-slate-450 mt-0.5">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapped in padding div to keep aligned */}
      <div className="px-4 pt-4 space-y-4">


      {/* ========================================================= */}
      {/* TODAY'S TRAINING GOAL SUMMARY CARD                         */}
      {/* ========================================================= */}
      <div className="bg-[#1b1e26] border border-white/10 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#13151b] text-pink-400 border border-white/10 flex items-center justify-center shrink-0 font-black shadow-xs">
            {modulesCompletedCount >= 3 ? <Check className="w-5 h-5 stroke-[3]" /> : "L3"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wide">
                {isHindi ? "आज का निर्धारित LMS मॉड्यूल लक्ष्य" : "Today's Prescribed LMS Goal"}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modulesCompletedCount >= 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-pink-500/20 text-pink-300 border border-pink-500/30"}`}>
                {modulesCompletedCount >= 3 ? "✓ Completed" : "In Progress"}
              </span>
            </div>
            
            {/* Explicit Actual Completed Day vs Ideal Target Day Indicators */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-350">
                {isHindi ? "वास्तविक प्रगति: " : "Actual Completed: "}
                <span className="text-pink-400 font-black">Day {modulesCompletedCount}</span>
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] font-bold text-slate-350">
                {isHindi ? "निर्धारित आदर्श: " : "Ideal Target: "}
                <span className="text-cyan-400 font-black">Day {newHire.currentDay || 3}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-medium truncate mt-1">
              {isHindi ? "फास्ट बारकोड स्कैनर एलाइनमेंट और शेल्फ नेविगेशन" : "Fast Barcode Scanner Alignment & Shelf Navigation"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const targetMod = MANDATORY_TRAINING_MODULES.find(m => m.id === "lms-mod-03") || MANDATORY_TRAINING_MODULES[2];
            setSelectedModuleId(targetMod.id);
            setActiveDetailModule(targetMod);
          }}
          className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-550 to-rose-600 hover:from-pink-500 hover:to-rose-500 bg-pink-500 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 border border-white/10"
        >
          <span className="text-white">{isHindi ? "खोलें" : "Open →"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER TABS BAR                                        */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
        {[
          { id: "all", label: isHindi ? "सभी (10)" : "All (10)" },
          { id: "foundation", label: isHindi ? "फाउंडेशन (D1-3)" : "Foundation (D1-3)" },
          { id: "floor", label: isHindi ? "फ्लोर पिक (D4-7)" : "Floor Pick (D4-7)" },
          { id: "cert", label: isHindi ? "सर्टिफिकेशन (D8-10)" : "Certification (D8-10)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-550 to-rose-600 bg-pink-500 text-white border-transparent shadow-md"
                : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 3. PREMIUM VERTICAL LIST (AS PER REFERENCE IMAGE)          */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3.5 pb-8">
        {filteredModules.map((mod) => {
          const isCompleted = completedIds.includes(mod.id);
          const gateResult = checkDeanModuleGate(mod, newHire);
          const isGatedByDean = gateResult.isGated;
          const isCurrent = !isCompleted && !isGatedByDean && mod.dayNumber === modulesCompletedCount + 1;
          const isLocked = !isCompleted && (mod.dayNumber > modulesCompletedCount + 1 || isGatedByDean);

          // Highlight matching the active or completed list item in the reference image (capsule card with inset shadow)
          const isCapsule = isCurrent || isCompleted;

          return (
            <div
              key={mod.id}
              onClick={() => {
                setSelectedModuleId(mod.id);
                setActiveDetailModule(mod);
              }}
              className={`w-full flex items-center justify-between gap-4 p-3.5 transition-all duration-300 cursor-pointer select-none ${
                isCapsule
                  ? "bg-[#111317] border border-white/5 rounded-[28px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)] hover:border-[#ff007f]/45"
                  : "bg-transparent rounded-[28px] border border-transparent hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Neon fuchsia circular icon / checkmark container */}
                <div className={`relative w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 shadow-md ${
                  isLocked && !isGatedByDean
                    ? "bg-[#1f2229] text-slate-500 opacity-60"
                    : isGatedByDean
                    ? "bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.3)]"
                    : "bg-[#ff007f] text-white shadow-[0_4px_16px_rgba(255,0,127,0.35)]"
                }`}>
                  {/* Neumorphic/3D glossy inner glow overlay */}
                  <div className="absolute inset-0.5 rounded-full border border-white/10 pointer-events-none" />

                  {isCompleted ? (
                    <Check className="w-5.5 h-5.5 stroke-[3.5] text-white" />
                  ) : isGatedByDean ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-slate-400" />
                  ) : (
                    <div className="w-5.5 h-5.5 text-white">
                      {getModuleDayIcon(mod.dayNumber)}
                    </div>
                  )}
                </div>

                {/* Typography matching reference image */}
                <div className="min-w-0 text-left">
                  {/* "Lorem" / small indicator line */}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Day {mod.dayNumber} • {mod.code} • {mod.durationMinutes} mins
                  </span>
                  
                  {/* "ipsum" / main title */}
                  <h3 className={`text-sm sm:text-base font-black mt-0.5 leading-snug tracking-tight ${
                    isLocked ? "text-slate-500" : "text-white"
                  }`}>
                    {isHindi && mod.titleHi ? mod.titleHi : mod.title}
                  </h3>
                </div>
              </div>

              {/* Status indicator / + sign as seen on the right hand side of the reference image */}
              <div className="shrink-0 flex items-center gap-3 pr-2">
                {isCompleted && (
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase text-emerald-400 bg-emerald-550/15 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Done ✓
                  </span>
                )}
                {isCurrent && (
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase text-[#ff007f] bg-[#ff007f]/10 px-2.5 py-1 rounded-full border border-[#ff007f]/30 animate-pulse">
                    Active
                  </span>
                )}
                
                {/* Small indicator '+' sign from the right of reference layout */}
                {!isCapsule && (
                  <span className="text-white/20 text-lg font-light select-none shrink-0">
                    +
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 2.5 MODULE DETAIL MODAL                                   */}
      {/* ========================================================= */}
      {activeDetailModule && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 text-white">
          <div className="bg-[#1b1e26] rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-white/10 max-h-[88vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    Day {activeDetailModule.dayNumber} • {activeDetailModule.code}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeDetailModule.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {isHindi && activeDetailModule.titleHi ? activeDetailModule.titleHi : activeDetailModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModule(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHindi && activeDetailModule.descriptionHi
                ? activeDetailModule.descriptionHi
                : activeDetailModule.description}
            </p>

            {/* Capability mapping tag */}
            <div className="flex items-center gap-1.5 text-xs text-pink-300 bg-pink-500/10 px-3 py-2 rounded-xl border border-pink-500/25">
              <Zap className="w-3.5 h-3.5 shrink-0 text-pink-450" />
              <span>
                <strong className="font-bold">{isHindi ? "हुनर संबंध:" : "Maps to:"}</strong>{" "}
                {activeDetailModule.mappedCapabilityIds
                  .map((cid) => {
                     const cap = DARK_STORE_CAPABILITIES.find((c) => c.id === cid);
                     return cap ? cap.name : `Cap ${cid}`;
                  })
                  .join(", ")}
              </span>
            </div>

            {checkDeanModuleGate(activeDetailModule, newHire).isGated && (
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Dean Pit-Stop Rule & Gating Active</span>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  {checkDeanModuleGate(activeDetailModule, newHire).reason}
                </p>
                <div className="p-2 rounded-xl bg-[#13151b] border border-amber-550/20 text-[11px] font-bold text-amber-400">
                  {checkDeanModuleGate(activeDetailModule, newHire).correctiveAction}
                </div>
              </div>
            )}

            {/* 5 Activities */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">
                <span>{isHindi ? "मॉड्यूल गतिविधियां:" : "Module Activities:"}</span>
                <span>{activeDetailModule.activities.length} tasks</span>
              </div>

              {activeDetailModule.activities.map((act) => {
                const isModCompleted = completedIds.includes(activeDetailModule.id);
                const isActCompleted = isModCompleted || act.completed;
                const isModLocked =
                  !isModCompleted &&
                  activeDetailModule.dayNumber > modulesCompletedCount + 1;

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (!isModLocked) {
                        setQuizAnswerSelected(null);
                        setQuizSubmitted(false);
                        setPracticeChecked(false);
                        setActiveActivityModal({ module: activeDetailModule, activity: act });
                      }
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isModLocked
                        ? "bg-white/5 opacity-40 cursor-not-allowed"
                        : isActCompleted
                        ? "bg-[#13151b] border border-white/5 hover:border-pink-500/30"
                        : "bg-[#13151b] border border-pink-500/25 hover:border-pink-500/50 shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-black/25 border border-white/5 shrink-0 text-pink-400">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wide">
                          {getActivityTypeName(act.type)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white leading-tight block truncate">
                          {isHindi && act.titleHi ? act.titleHi : act.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {act.score !== undefined && (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {act.score}%
                        </span>
                      )}
                      {isActCompleted ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
                          ✓ {isHindi ? "पूर्ण" : "Done"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-pink-300 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/15 hover:bg-pink-500/20">
                          {isHindi ? "शुरू करें →" : "Start →"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Module Button if Current */}
            {activeDetailModule.dayNumber === modulesCompletedCount + 1 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteActivity(activeDetailModule.id, activeDetailModule.activities[4].id);
                    setActiveDetailModule(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-550 to-rose-600 bg-pink-500 text-white rounded-2xl text-xs font-black shadow-lg hover:opacity-95 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-white">
                    {isHindi
                      ? `डे ${activeDetailModule.dayNumber} मॉड्यूल पूरा मार्क करें`
                      : `Complete Day ${activeDetailModule.dayNumber} Module`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. INTERACTIVE ACTIVITY MODAL                             */}
      {/* ========================================================= */}
      {activeActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 text-white">
          <div className="bg-[#1b1e26] rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-white/10 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/25">
                  {getActivityIcon(activeActivityModal.activity.type)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {activeActivityModal.module.code} • {getActivityTypeName(activeActivityModal.activity.type)}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {isHindi && activeActivityModal.activity.titleHi
                      ? activeActivityModal.activity.titleHi
                      : activeActivityModal.activity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveActivityModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIDEO ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "video" && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="aspect-video bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden border border-white/5">
                  <PlayCircle className="w-10 h-10 text-pink-400 mb-1 animate-pulse" />
                  <span className="font-bold text-xs">{activeActivityModal.activity.title}</span>
                  <span className="text-[10px] text-slate-450">Duration: {activeActivityModal.activity.durationMinutes} mins</span>
                </div>
                <div className="p-3 bg-[#13151b] rounded-2xl border border-white/5 space-y-1">
                  <span className="font-bold text-white block">
                    {isHindi ? "वीडियो सारांश व मुख्य नियम:" : "Key Takeaways:"}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {isHindi
                      ? "1. हमेशा सेफ्टी शूज व ग्लव्स पहनें। 2. रैक से सामान उठाते समय नंबर क्रॉस-वेरिफाई करें।"
                      : "1. Follow standard aisle traffic rules. 2. Verify shelf rack-bay coordinates before picking."}
                  </p>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl text-xs font-black cursor-pointer border border-white/10"
                >
                  {isHindi ? "पाठ पूरा हुआ 👍" : "Mark Video Watched 👍"}
                </button>
              </div>
            )}

            {/* QUIZ ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "quiz" && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-[#13151b] border border-pink-500/20 rounded-2xl space-y-1">
                  <span className="font-bold text-pink-300 block">
                    {isHindi ? "प्रश्न 1:" : "Question 1 of 1:"}
                  </span>
                  <p className="text-xs font-medium text-white">
                    {isHindi
                      ? "टोट पैक करते समय भारी सामान (जैसे आटा, तेल) कहां रखना चाहिए?"
                      : "When packing a tote, where should heavy items (flour, oil cans) always be placed?"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {[
                    { en: "At the very bottom of the tote", hi: "टोट के सबसे नीचे तली में" },
                    { en: "On top of bread and eggs", hi: "ब्रेड और अंडों के ऊपर" },
                    { en: "In any random order", hi: "बिना किसी क्रम के कहीं भी" },
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuizAnswerSelected(idx)}
                      className={`w-full p-2.5 rounded-2xl border text-left text-xs font-medium transition-all cursor-pointer ${
                        quizAnswerSelected === idx
                          ? "bg-pink-500 text-white border-transparent shadow-xs font-black"
                          : "bg-[#13151b] text-slate-200 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      {idx === 0 ? "A" : idx === 1 ? "B" : "C"}. {isHindi ? opt.hi : opt.en}
                    </button>
                  ))}
                </div>

                {quizAnswerSelected !== null && !quizSubmitted && (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-2.5 bg-pink-500 text-white rounded-2xl text-xs font-black cursor-pointer hover:bg-pink-400 border border-white/10"
                  >
                    {isHindi ? "उत्तर जमा करें" : "Submit Answer"}
                  </button>
                )}

                {quizSubmitted && (
                  <div className="p-3 bg-emerald-550/10 border border-emerald-500/25 rounded-2xl space-y-1 text-center">
                    <span className="text-xs font-bold text-emerald-400 block">
                      {quizAnswerSelected === 0
                        ? isHindi ? "✅ सही उत्तर! 100% स्कोर" : "✅ Correct! 100% Score"
                        : isHindi ? "❌ गलत उत्तर। भारी सामान हमेशा नीचे रहता है।" : "❌ Incorrect. Heavy items always go at the bottom."}
                    </span>
                    <button
                      onClick={() => setActiveActivityModal(null)}
                      className="mt-1 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-emerald-500"
                    >
                      {isHindi ? "जारी रखें" : "Continue"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "simulation" && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-[#13151b] border border-pink-500/20 rounded-2xl space-y-1">
                  <span className="font-bold text-pink-300 block">
                    {isHindi ? "3D वर्चुअल सिमुलेशन टास्क:" : "Virtual Simulation Task:"}
                  </span>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {isHindi
                      ? "आइसल 5, बे 2, शेल्फ B पर जाएं और 1 किलो चीनी का बारकोड स्कैन करें।"
                      : "Navigate to Aisle 5, Bay 2, Shelf B and aim scanner at 1kg Sugar pouch."}
                  </p>
                </div>
                <div className="p-4 bg-black/45 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1 border border-white/5">
                  <div>&gt; Locating bin: A05-B02-S02... OK</div>
                  <div>&gt; Aiming ring laser at SKU: 890123456... OK</div>
                  <div>&gt; Barcode verified: MATCH (1000g)</div>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl text-xs font-black cursor-pointer border border-white/10"
                >
                  {isHindi ? "सिमुलेशन पास हुआ ✅" : "Pass Simulation Step ✅"}
                </button>
              </div>
            )}

            {/* PRACTICE / ASSESSMENT CONTENT */}
            {(activeActivityModal.activity.type === "practice" ||
              activeActivityModal.activity.type === "assessment") && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-[#13151b] border border-pink-500/20 rounded-2xl space-y-1">
                  <span className="font-bold text-pink-300 block">
                    {isHindi ? "फ्लोर प्रैक्टिकल चेकलिस्ट:" : "Floor Practice Verification:"}
                  </span>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {isHindi
                      ? "सीनियर बडी के साथ 10-मिनट का अभ्यास पूरा करें और चेकलिस्ट टिक करें।"
                      : "Perform practical drill with senior floor buddy and confirm completion."}
                  </p>
                </div>

                <label className="flex items-center gap-2.5 p-3 bg-[#13151b] border border-white/10 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={practiceChecked}
                    onChange={(e) => setPracticeChecked(e.target.checked)}
                    className="w-4 h-4 text-pink-500 bg-black border-white/15 rounded-md focus:ring-pink-500"
                  />
                  <span className="text-xs font-medium text-slate-200">
                    {isHindi
                      ? "मैंने सभी स्टेप्स बडी के साथ अभ्यास कर लिए हैं"
                      : "I have completed all drill steps with my buddy"}
                  </span>
                </label>

                <button
                  disabled={!practiceChecked}
                  onClick={() =>
                    handleCompleteActivity(
                      activeActivityModal.module.id,
                      activeActivityModal.activity.id
                    )
                  }
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl text-xs font-black disabled:opacity-40 cursor-pointer shadow-md border border-white/10"
                >
                  {isHindi ? "ड्रिल पूर्ण मार्क करें ✅" : "Mark Activity Complete ✅"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
