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
    <div className="animate-in fade-in duration-200 select-none pb-20">
      {/* ========================================================= */}
      {/* 1. HERO BANNER (FULL BLEED WAREHOUSE BACKGROUND & DARK OVERLAY) */}
      {/* ========================================================= */}
      <div 
        className="relative rounded-b-[32px] rounded-t-none pt-10 pb-7 px-5 sm:px-6 text-white shadow-xl shadow-blue-900/15 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80')`
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/40 backdrop-blur-[1px]" />

        <div className="relative z-10 space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/25">
            {isHindi ? "फीचर्ड प्रोग्राम" : "Featured"}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              {isHindi ? "10-दिवसीय ट्रेनिंग और सर्टिफिकेशन" : "Certification & Training"}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-medium drop-shadow-xs">
              <span>⭐ 4.8</span>
              <span>•</span>
              <span>{isHindi ? `${modulesCompletedCount}/10 दिन पूर्ण` : `12k Reviews`}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{Math.round((modulesCompletedCount / 10) * 100)}% {isHindi ? "तैयार" : "Ready"}</span>
            </div>
          </div>

          {/* Progress bar inside banner */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.round((modulesCompletedCount / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content wrapped in padding div to keep aligned */}
      <div className="px-4 pt-4 space-y-4">


      {/* ========================================================= */}
      {/* TODAY'S TRAINING GOAL SUMMARY CARD                         */}
      {/* ========================================================= */}
      <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/30 flex items-center justify-center shrink-0 font-black shadow-xs">
            {modulesCompletedCount >= 3 ? <Check className="w-5 h-5 stroke-[3]" /> : "L3"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wide">
                {isHindi ? "आज का निर्धारित LMS मॉड्यूल लक्ष्य" : "Today's Prescribed LMS Goal"}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modulesCompletedCount >= 3 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                {modulesCompletedCount >= 3 ? "✓ Completed" : "In Progress"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
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
          className="shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 border border-white/10"
        >
          <span>{isHindi ? "खोलें" : "Open →"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER TABS BAR (FROM SCREENSHOT)                      */}
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
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-md"
                : "bg-black/30 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 3. 3-COLUMN LEARNING AREA GRID (EXACT SCREENSHOT STYLE)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 pb-4">
        {filteredModules.map((mod) => {
          const isCompleted = completedIds.includes(mod.id);
          const gateResult = checkDeanModuleGate(mod, newHire);
          const isGatedByDean = gateResult.isGated;
          const isCurrent = !isCompleted && !isGatedByDean && mod.dayNumber === modulesCompletedCount + 1;
          const isLocked = !isCompleted && (mod.dayNumber > modulesCompletedCount + 1 || isGatedByDean);

          // Premium frosted glass color identities with subtle glow borders matching the dashboard
          let cardBgClass = "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border-cyan-400/40 text-white shadow-lg shadow-cyan-500/10 hover:border-cyan-400/75";
          let padBgClass = "bg-cyan-950/80 border-cyan-500/30 shadow-inner";
          let iconColorClass = "text-cyan-400";
          let textColorClass = "text-white";

          if (isLocked && !isGatedByDean) {
            // Sleek translucent dark-glass layout for locked modules
            cardBgClass = "bg-white/5 backdrop-blur-md border-white/10 text-slate-400 opacity-60 shadow-inner cursor-not-allowed";
            padBgClass = "bg-black/30 border-white/5";
            iconColorClass = "text-slate-500";
            textColorClass = "text-slate-400";
          } else if (isGatedByDean) {
            // Amber-orange warning glass gradient for Gated modules
            cardBgClass = "bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-md border-amber-400/40 text-white shadow-lg shadow-amber-500/10 animate-pulse hover:border-amber-400/75";
            padBgClass = "bg-amber-950/80 border-amber-500/30 shadow-inner";
            iconColorClass = "text-amber-400";
            textColorClass = "text-white";
          } else if (isCompleted) {
            // Radiant emerald-green glass gradient for Completed modules
            cardBgClass = "bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-md border-emerald-400/40 text-white shadow-lg shadow-emerald-500/10 hover:border-emerald-400/75";
            padBgClass = "bg-emerald-950/80 border-emerald-500/30 shadow-inner";
            iconColorClass = "text-emerald-400";
            textColorClass = "text-white";
          }

          return (
            <div
              key={mod.id}
              onClick={() => {
                setSelectedModuleId(mod.id);
                setActiveDetailModule(mod);
              }}
              className={`relative aspect-square rounded-[30px] p-2 sm:p-3 flex flex-col items-center justify-between text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 border cursor-pointer select-none overflow-hidden ${cardBgClass}`}
            >
              {/* Top Row: Day marker + Complete checkbox check */}
              <div className="w-full flex items-center justify-between text-[9px] font-bold px-1 select-none z-10">
                <span className={`px-1.5 py-0.5 rounded-full ${
                  isLocked && !isGatedByDean
                    ? "bg-black/30 text-slate-400 border border-white/5"
                    : "bg-white/10 text-white border border-white/10 backdrop-blur-xs"
                }`}>
                  Day {mod.dayNumber}
                </span>

                {isCompleted && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shadow-xs border border-emerald-500/40 font-black text-[10px]">
                    ✓
                  </span>
                )}
                {isGatedByDean && (
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shadow-xs border border-amber-500/40 font-black text-[10px]">
                    !
                  </span>
                )}
                {isCurrent && !isCompleted && !isGatedByDean && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                )}
              </div>

              {/* Central Elevated Glossy Square Pad (3D Skeuomorphic Glass) */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] flex items-center justify-center border transition-all duration-300 relative z-10 ${padBgClass} ${
                !isLocked ? "shadow-md hover:scale-105 active:scale-95" : ""
              }`}>
                {/* 3D beveled inner reflex boundary */}
                <div className="absolute inset-0.5 rounded-[16px] border border-white/10 pointer-events-none" />
                
                {/* Render Lucide icon inside */}
                <div className={`w-6 h-6 flex items-center justify-center transition-all ${iconColorClass}`}>
                  {getModuleDayIcon(mod.dayNumber)}
                </div>
              </div>

              {/* Module Short Title bottom aligned */}
              <div className="w-full z-10">
                <p className={`text-[10px] sm:text-[11px] font-black truncate leading-tight select-none ${textColorClass}`}>
                  {getModuleShortLabel(mod.dayNumber, isHindi)}
                </p>
              </div>

              {/* Glossy diagonal light reflections crossing card for premium glass shine effect */}
              {!isLocked && (
                <div className="absolute -inset-y-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-[35deg] pointer-events-none mix-blend-overlay z-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 2.5 MODULE DETAIL MODAL                                   */}
      {/* ========================================================= */}
      {activeDetailModule && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-100 text-violet-800">
                    Day {activeDetailModule.dayNumber} • {activeDetailModule.code}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeDetailModule.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {isHindi && activeDetailModule.titleHi ? activeDetailModule.titleHi : activeDetailModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModule(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi && activeDetailModule.descriptionHi
                ? activeDetailModule.descriptionHi
                : activeDetailModule.description}
            </p>

            {/* Capability mapping tag */}
            <div className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50/80 px-3 py-2 rounded-xl border border-violet-100">
              <Zap className="w-3.5 h-3.5 shrink-0" />
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
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Dean Pit-Stop Rule & Gating Active</span>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  {checkDeanModuleGate(activeDetailModule, newHire).reason}
                </p>
                <div className="p-2 rounded-xl bg-white/90 border border-amber-200 text-[11px] font-bold text-amber-900">
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
                        ? "bg-slate-100/50 opacity-60 cursor-not-allowed"
                        : isActCompleted
                        ? "bg-white border border-slate-200 hover:border-violet-300 shadow-2xs"
                        : "bg-white border border-violet-200 hover:border-violet-400 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          {getActivityTypeName(act.type)}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight block truncate">
                          {isHindi && act.titleHi ? act.titleHi : act.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {act.score !== undefined && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {act.score}%
                        </span>
                      )}
                      {isActCompleted ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          ✓ {isHindi ? "पूर्ण" : "Done"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full hover:bg-violet-100">
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
                  className="w-full py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl text-xs font-bold shadow-md hover:opacity-95 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  {getActivityIcon(activeActivityModal.activity.type)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {activeActivityModal.module.code} • {getActivityTypeName(activeActivityModal.activity.type)}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {isHindi && activeActivityModal.activity.titleHi
                      ? activeActivityModal.activity.titleHi
                      : activeActivityModal.activity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveActivityModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIDEO ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "video" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden">
                  <PlayCircle className="w-10 h-10 text-purple-400 mb-1 animate-pulse" />
                  <span className="font-bold text-xs">{activeActivityModal.activity.title}</span>
                  <span className="text-[10px] text-slate-400">Duration: {activeActivityModal.activity.durationMinutes} mins</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">
                    {isHindi ? "वीडियो सारांश व मुख्य नियम:" : "Key Takeaways:"}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {isHindi
                      ? "1. हमेशा सेफ्टी शूज व ग्लव्स पहनें। 2. रैक से सामान उठाते समय नंबर क्रॉस-वेरिफाई करें।"
                      : "1. Follow standard aisle traffic rules. 2. Verify shelf rack-bay coordinates before picking."}
                  </p>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  {isHindi ? "पाठ पूरा हुआ 👍" : "Mark Video Watched 👍"}
                </button>
              </div>
            )}

            {/* QUIZ ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "quiz" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                  <span className="font-bold text-purple-950 block">
                    {isHindi ? "प्रश्न 1:" : "Question 1 of 1:"}
                  </span>
                  <p className="text-xs font-medium text-purple-900">
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
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {idx === 0 ? "A" : idx === 1 ? "B" : "C"}. {isHindi ? opt.hi : opt.en}
                    </button>
                  ))}
                </div>

                {quizAnswerSelected !== null && !quizSubmitted && (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    {isHindi ? "उत्तर जमा करें" : "Submit Answer"}
                  </button>
                )}

                {quizSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-center">
                    <span className="text-xs font-bold text-emerald-800 block">
                      {quizAnswerSelected === 0
                        ? isHindi ? "✅ सही उत्तर! 100% स्कोर" : "✅ Correct! 100% Score"
                        : isHindi ? "❌ गलत उत्तर। भारी सामान हमेशा नीचे रहता है।" : "❌ Incorrect. Heavy items always go at the bottom."}
                    </span>
                    <button
                      onClick={() => setActiveActivityModal(null)}
                      className="mt-1 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold cursor-pointer"
                    >
                      {isHindi ? "जारी रखें" : "Continue"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIMULATION ACTIVITY CONTENT */}
            {activeActivityModal.activity.type === "simulation" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="font-bold text-emerald-950 block">
                    {isHindi ? "3D वर्चुअल सिमुलेशन टास्क:" : "Virtual Simulation Task:"}
                  </span>
                  <p className="text-[11px] text-emerald-900 leading-snug">
                    {isHindi
                      ? "आइसल 5, बे 2, शेल्फ B पर जाएं और 1 किलो चीनी का बारकोड स्कैन करें।"
                      : "Navigate to Aisle 5, Bay 2, Shelf B and aim scanner at 1kg Sugar pouch."}
                  </p>
                </div>
                <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1">
                  <div>&gt; Locating bin: A05-B02-S02... OK</div>
                  <div>&gt; Aiming ring laser at SKU: 890123456... OK</div>
                  <div>&gt; Barcode verified: MATCH (1000g)</div>
                </div>
                <button
                  onClick={() => setActiveActivityModal(null)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  {isHindi ? "सिमुलेशन पास हुआ ✅" : "Pass Simulation Step ✅"}
                </button>
              </div>
            )}

            {/* PRACTICE / ASSESSMENT CONTENT */}
            {(activeActivityModal.activity.type === "practice" ||
              activeActivityModal.activity.type === "assessment") && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                  <span className="font-bold text-purple-950 block">
                    {isHindi ? "फ्लोर प्रैक्टिकल चेकलिस्ट:" : "Floor Practice Verification:"}
                  </span>
                  <p className="text-[11px] text-purple-900 leading-snug">
                    {isHindi
                      ? "सीनियर बडी के साथ 10-मिनट का अभ्यास पूरा करें और चेकलिस्ट टिक करें।"
                      : "Perform practical drill with senior floor buddy and confirm completion."}
                  </p>
                </div>

                <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={practiceChecked}
                    onChange={(e) => setPracticeChecked(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
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
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-xs font-bold disabled:opacity-40 cursor-pointer shadow-xs"
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
