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

interface ModulesViewProps {
  newHire: NewHire;
  onUpdateHire?: (updatedHire: NewHire) => void;
  isHindi?: boolean;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  newHire,
  onUpdateHire,
  isHindi = false,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    `lms-mod-0${Math.min(10, Math.max(1, (newHire.modulesCompleted || 3) + 1))}`
  );
  const [activeDetailModule, setActiveDetailModule] = useState<TrainingModule | null>(null);
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
    const iconClass = "w-6 h-6 sm:w-7 sm:h-7";
    switch (dayNumber) {
      case 1:
        return <ShieldCheck className={iconClass} />;
      case 2:
        return <ScanLine className={iconClass} />;
      case 3:
        return <MapPin className={iconClass} />;
      case 4:
        return <Snowflake className={iconClass} />;
      case 5:
        return <PackageCheck className={iconClass} />;
      case 6:
        return <Boxes className={iconClass} />;
      case 7:
        return <ShoppingCart className={iconClass} />;
      case 8:
        return <Zap className={iconClass} />;
      case 9:
        return <AlertTriangle className={iconClass} />;
      case 10:
        return <Trophy className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const getModuleShortLabel = (dayNumber: number, hindiMode: boolean) => {
    const map: Record<number, { en: string; hi: string }> = {
      1: { en: "Warehouse", hi: "वेयरहाउस" },
      2: { en: "Scanner", hi: "स्कैनर" },
      3: { en: "Aisle Racks", hi: "रैक्स" },
      4: { en: "Cold Room", hi: "कोल्ड रूम" },
      5: { en: "Single Pick", hi: "सिंगल पिक" },
      6: { en: "Multi-Tote", hi: "मल्टी-टोट" },
      7: { en: "Batch Pick", hi: "बैच पिक" },
      8: { en: "Speed 120", hi: "स्पीड 120" },
      9: { en: "Quality SKU", hi: "क्वालिटी SKU" },
      10: { en: "Certify", hi: "सर्टिफिकेशन" },
    };
    return hindiMode ? map[dayNumber]?.hi || `डे ${dayNumber}` : map[dayNumber]?.en || `Day ${dayNumber}`;
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200 select-none">
      {/* ========================================================= */}
      {/* 1. HERO BANNER: 10-DAY TRAINING (WHITE CARD IN PURPLE CARD)*/}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-3.5 sm:p-5 shadow-lg shadow-purple-600/20">
        <div className="bg-white rounded-xl p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-sm">
          {/* Subtle background gradient accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-100/40 via-violet-50/20 to-transparent rounded-full pointer-events-none -mr-8 -mt-8" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {isHindi ? "10-दिवसीय ट्रेनिंग" : "10-Day Training"}
              </h2>
            </div>

            {/* Right Visual Tile & Count Badge */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-right shrink-0 bg-violet-50/80 border border-violet-100 px-3 py-1.5 rounded-xl">
                <div className="text-sm sm:text-base font-black text-violet-700 leading-tight">
                  {modulesCompletedCount} / 10
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold leading-tight">
                  {isHindi ? "दिन पूर्ण" : "Done"}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-0.5 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isHindi ? "पाठ्यक्रम प्रगति" : "Course Progress"}</span>
              <span className="text-violet-700 font-black">
                {Math.round((modulesCompletedCount / 10) * 100)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((modulesCompletedCount / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SECTION HEADER: EXPLORE LEARNING AREAS                 */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {isHindi ? "सीखने के क्षेत्र एक्सप्लोर करें" : "Explore Learning Areas"}
        </h3>
        <button
          type="button"
          onClick={() => {
            const nextMod =
              MANDATORY_TRAINING_MODULES.find((m) => m.dayNumber === modulesCompletedCount + 1) ||
              MANDATORY_TRAINING_MODULES[0];
            setSelectedModuleId(nextMod.id);
            setActiveDetailModule(nextMod);
          }}
          className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-0.5"
        >
          <span>{isHindi ? "सभी देखें ›" : "View All ›"}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. 3-COLUMN LEARNING AREA GRID (INSPIRED BY SCREENSHOT)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {MANDATORY_TRAINING_MODULES.map((mod) => {
          const isCompleted = completedIds.includes(mod.id);
          const isCurrent = !isCompleted && mod.dayNumber === modulesCompletedCount + 1;
          const isLocked = !isCompleted && mod.dayNumber > modulesCompletedCount + 1;

          return (
            <div
              key={mod.id}
              onClick={() => {
                setSelectedModuleId(mod.id);
                setActiveDetailModule(mod);
              }}
              className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center aspect-square transition-all duration-200 cursor-pointer relative shadow-sm hover:shadow-md active:scale-98 border ${
                isCurrent
                  ? "border-violet-300 ring-2 ring-violet-200/80 shadow-md shadow-violet-500/10"
                  : isCompleted
                  ? "border-emerald-200/70 hover:border-emerald-300 bg-white"
                  : "border-slate-100 bg-slate-50/50 hover:bg-white"
              }`}
            >
              {/* Central Squircle Icon Container */}
              <div className="relative my-auto">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                      : isCurrent
                      ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30 ring-2 ring-white"
                      : "bg-slate-100/90 text-slate-400"
                  }`}
                >
                  {getModuleDayIcon(mod.dayNumber)}
                </div>

                {/* "SOON" Pill for locked modules only (tick and play icons removed) */}
                {isLocked && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-100 text-blue-600 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full border border-white shadow-2xs tracking-wider">
                    {isHindi ? "जल्द" : "SOON"}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="w-full mt-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight">
                  {getModuleShortLabel(mod.dayNumber, isHindi)}
                </h4>
                <p
                  className={`text-[10px] sm:text-[11px] mt-0.5 font-medium truncate ${
                    isCompleted
                      ? "text-slate-500"
                      : isCurrent
                      ? "text-violet-700 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {isCompleted
                    ? isHindi ? "एक्सप्लोर" : "Explore"
                    : isCurrent
                    ? isHindi ? "शुरू करें" : "Explore"
                    : isHindi ? "जल्द आएगा" : "Soon"}
                </p>
              </div>
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
  );
};
