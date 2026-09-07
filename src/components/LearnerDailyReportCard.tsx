import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  ShieldCheck,
  Package,
  AlertTriangle,
  ArrowRight,
  Volume2,
  Sparkles,
  ThumbsUp,
  FileText,
} from "lucide-react";
import { NewHire, DayRecord } from "../types";
import { speakMessage, stopSpeaking } from "../utils/speech";

interface LearnerDailyReportCardProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onOpenDashboard?: () => void;
  onOpenDetailedModal?: () => void;
  onOpenWorkTools?: () => void;
  onOpenBuddy?: () => void;
  onOpenModules?: () => void;
  isDashboardVariant?: boolean;
}

export const LearnerDailyReportCard: React.FC<LearnerDailyReportCardProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onOpenDashboard,
  onOpenDetailedModal,
  isDashboardVariant = false,
}) => {
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  // 1. Resolve yesterday's completed day record
  const yesterdayNumber = Math.max(1, currentDay - 1);
  const isFirstDay = currentDay === 1;

  const yesterdayRecord: DayRecord | undefined = isFirstDay
    ? undefined
    : newHire.daysHistory.find((d) => d.dayNumber === yesterdayNumber) ||
      newHire.daysHistory.filter((d) => d.dayNumber < currentDay).pop();

  // 2. Extract key metrics from yesterday
  const prevWork = yesterdayRecord?.workSignal;
  const actualPace = prevWork?.actualPickRate ?? (isFirstDay ? 20 : 32);
  const targetPace = prevWork?.targetPickRate ?? (isFirstDay ? 25 : 35);
  const pacePct = Math.min(100, Math.round((actualPace / targetPace) * 100));

  const accuracy = prevWork?.accuracyRate ?? 99;
  const ordersCompleted = prevWork?.ordersCompleted ?? (isFirstDay ? 15 : 38);

  const prevDailySignal = yesterdayRecord?.dailySignal;
  const prevPattern = yesterdayRecord?.identifiedPattern;
  const prevActionOutcome = yesterdayRecord?.actionOutcome;

  // 3. Evaluate Shift Assessment: GOOD vs ATTENTION / NEEDS WORK (Good/Bad sign)
  const isPaceBelow = actualPace < targetPace - 3;
  const hasQuizGap = newHire.quizAverageScore !== undefined && newHire.quizAverageScore < 70;
  const hasFloorIssue =
    prevDailySignal?.category === "Environment" ||
    prevPattern?.category === "Environment" ||
    (prevDailySignal?.rawText || "").toLowerCase().includes("aisle");
  const isRecovered = prevActionOutcome?.improved === "yes";

  let isShiftGood = true;
  let signTitle = isHindi ? "शानदार प्रदर्शन" : "GOOD SHIFT";
  let signTag = isHindi ? "✓ लक्ष्य पर" : "On Track";
  let signSub = isHindi ? "सटीक व सुरक्षित कार्य" : "Safe & Accurate Work";
  let signBg = "bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border-emerald-200 text-emerald-950";
  let signIconBg = "bg-emerald-600 text-white";
  let signBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (isRecovered || (actualPace >= targetPace && accuracy >= 98)) {
    isShiftGood = true;
    signTitle = isHindi ? "शानदार (GOOD)" : "GOOD SHIFT";
    signTag = isHindi ? "✓ मजबूत गति" : "Target Exceeded";
    signSub = isHindi ? "सटीक व तेज पिकिंग" : "Fast & Accurate";
    signBg = "bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border-emerald-200 text-emerald-950";
    signIconBg = "bg-emerald-600 text-white";
    signBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (isPaceBelow || hasFloorIssue || hasQuizGap) {
    isShiftGood = false;
    signTitle = isHindi ? "सुधार जरूरी (NEEDS WORK)" : "NEEDS ATTENTION";
    signTag = hasFloorIssue
      ? isHindi
        ? "⚠️ आइसल रूट"
        : "⚠️ Aisle Route"
      : isPaceBelow
      ? isHindi
        ? "⚠️ गति धीमी"
        : "⚠️ Below Target"
      : isHindi
      ? "⚠️ क्विज़ रिवीजन"
      : "⚠️ Quiz Review";
    signSub = hasFloorIssue
      ? isHindi
        ? "आइसल 4-8 वॉकथ्रू तय"
        : "15m Walkthrough Set"
      : isPaceBelow
      ? isHindi
        ? "धीमी गति पर ध्यान दें"
        : "Speed Support Active"
      : isHindi
      ? "नियम दोहराना आवश्यक"
      : "Reinforcement Needed";
    signBg = "bg-gradient-to-br from-amber-50/90 to-orange-50/40 border-amber-200 text-amber-950";
    signIconBg = "bg-amber-500 text-white";
    signBadgeBg = "bg-amber-100 text-amber-900 border-amber-300";
  }

  // Audio speech narration
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }

    const text = isHindi
      ? `कल का स्नैपशॉट। पिकिंग स्पीड ${actualPace} सामान प्रति घंटा, एक्यूरेसी ${accuracy} प्रतिशत, ${ordersCompleted} ऑर्डर पूरे हुए। स्थिति: ${signTitle}।`
      : `Yesterday's Snapshot. Pick rate ${actualPace} items per hour, ${accuracy} percent accuracy, ${ordersCompleted} orders completed. Status: ${signTitle}.`;

    setPlayingAudio(true);
    speakMessage(text, isHindi, () => {
      setPlayingAudio(false);
    });
  };

  const handleCardClick = () => {
    if (isDashboardVariant && onOpenDetailedModal) {
      onOpenDetailedModal();
    } else if (onOpenDashboard) {
      onOpenDashboard();
    }
  };

  return (
    <div
      id={isDashboardVariant ? "dashboard-yesterday-snapshot-card" : "yesterday-quick-snapshot-card"}
      onClick={handleCardClick}
      className={`bg-white rounded-[26px] p-4 border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer select-none transition-all hover:border-purple-300 hover:shadow-md active:scale-[0.995] ${
        isDashboardVariant ? "ring-2 ring-violet-500/15" : ""
      }`}
    >
      {/* 1. HEADER: CLEAN "YESTERDAY SNAPSHOT" WITH NO CLUTTERED TEXT */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              {isHindi ? `कल का स्नैपशॉट (दिन ${yesterdayNumber})` : `YESTERDAY SNAPSHOT (DAY ${yesterdayNumber})`}
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${signBadgeBg}`}
            >
              {signTag}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-1.5 rounded-full text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
            title="Listen aloud"
          >
            <Volume2 className={`w-4 h-4 ${playingAudio ? "animate-bounce text-purple-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. PICTORIAL EVIDENCE CARDS GRID (4 SCANNABLE VISUAL TILES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {/* Card 1: Pick Pace vs Target */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/30 border border-purple-100/90 flex flex-col justify-between space-y-2 hover:bg-violet-100/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700">
              {isHindi ? "पिकिंग रफ़्तार" : "Pick Speed"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 leading-none">{actualPace}</span>
              <span className="text-xs font-bold text-slate-500">/hr</span>
            </div>
            {/* Progress bar visual */}
            <div className="w-full bg-purple-100 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pacePct}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 font-bold block mt-1.5">
              🎯 {isHindi ? `लक्ष्य ${targetPace}/hr` : `Goal ${targetPace}/hr`}
            </span>
          </div>
        </div>

        {/* Card 2: Accuracy Rate */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/30 border border-emerald-100/90 flex flex-col justify-between space-y-2 hover:bg-emerald-100/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              {isHindi ? "एक्यूरेसी" : "Accuracy"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 leading-none">{accuracy}%</span>
            </div>
            {/* Accuracy bar visual */}
            <div className="w-full bg-emerald-100 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className="text-xs text-emerald-700 font-bold block mt-1.5">
              ✓ {isHindi ? "0 त्रुटियां" : "Zero Errors"}
            </span>
          </div>
        </div>

        {/* Card 3: Orders Completed */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/80 to-sky-50/30 border border-blue-100/90 flex flex-col justify-between space-y-2 hover:bg-blue-100/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">
              {isHindi ? "ऑर्डर" : "Orders"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 leading-none">{ordersCompleted}</span>
              <span className="text-xs font-bold text-slate-500">{isHindi ? "पूरे" : "done"}</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (ordersCompleted / 40) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-blue-700 font-bold block mt-1.5">
              📦 {isHindi ? "समय पर" : "On-Time"}
            </span>
          </div>
        </div>

        {/* Card 4: GOOD / BAD SIGN (OVERALL SHIFT ASSESSMENT) */}
        <div className={`p-3 rounded-2xl ${signBg} flex flex-col justify-between space-y-2 hover:brightness-98 transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">
              {isShiftGood ? (isHindi ? "स्थिति" : "STATUS") : (isHindi ? "स्थिति" : "STATUS")}
            </span>
            <div className={`w-6 h-6 rounded-lg ${signIconBg} flex items-center justify-center shadow-2xs`}>
              {isShiftGood ? <ThumbsUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black leading-tight tracking-tight">
                {isShiftGood ? (isHindi ? "👍 सही रहा" : "👍 GOOD") : (isHindi ? "⚠️ ध्यान दें" : "⚠️ ATTENTION")}
              </span>
            </div>
            <div className={`mt-1.5 px-2 py-0.5 rounded-md text-xs font-bold border inline-block ${signBadgeBg}`}>
              {signTag}
            </div>
            <span className="text-xs opacity-85 font-semibold block mt-1 truncate">
              {signSub}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TACTILE ACTION FOOTER */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          {isDashboardVariant ? (
            <>
              <FileText className="w-4 h-4 text-violet-600" />
              <span>{isHindi ? "पूरा विवरण देखें" : "Tap for full shift details"}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>{isHindi ? "डैशबोर्ड रिपोर्ट देखें" : "Tap for full details"}</span>
            </>
          )}
        </span>
        <div className="text-xs font-bold text-violet-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>{isHindi ? "विवरण →" : "Details →"}</span>
        </div>
      </div>
    </div>
  );
};
