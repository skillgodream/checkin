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

  if (isRecovered || (actualPace >= targetPace && accuracy >= 98)) {
    isShiftGood = true;
    signTitle = isHindi ? "शानदार (GOOD)" : "GOOD SHIFT";
    signTag = isHindi ? "✓ मजबूत गति" : "Target Exceeded";
    signSub = isHindi ? "सटीक व तेज पिकिंग" : "Fast & Accurate";
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
      className={`rounded-[26px] p-4.5 sm:p-5 border shadow-[0_6px_20px_-4px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.03)] space-y-3.5 cursor-pointer select-none transition-all hover:shadow-[0_10px_24px_-4px_rgba(15,23,42,0.08)] active:scale-[0.995] ${
        !isShiftGood
          ? "border-red-300 ring-2 ring-red-500/15 bg-gradient-to-br from-white via-red-50/25 to-white"
          : "border-emerald-300 ring-2 ring-emerald-500/15 bg-gradient-to-br from-white via-emerald-50/25 to-white"
      } ${isDashboardVariant ? "ring-2 ring-slate-900/10" : ""}`}
    >
      {/* 1. HEADER: CLEAN "YESTERDAY SNAPSHOT" WITH COHESIVE SLATE ACCENTS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              {isHindi ? `कल का स्नैपशॉट (दिन ${yesterdayNumber})` : `YESTERDAY SNAPSHOT (DAY ${yesterdayNumber})`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Listen aloud"
          >
            <Volume2 className={`w-4 h-4 ${playingAudio ? "animate-bounce text-slate-900" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. PICTORIAL EVIDENCE CARDS GRID (CONSISTENT, HARMONIOUS TILES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {/* Card 1: Pick Pace vs Target */}
        <div className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-colors relative ${
          isPaceBelow
            ? "bg-red-50/90 border-red-300 shadow-2xs"
            : "bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/70"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isPaceBelow && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isPaceBelow ? "text-red-700" : "text-slate-500"}`}>
                {isHindi ? "पिकिंग रफ़्तार" : "Pick Speed"}
              </span>
            </div>
            <div className={`w-6 h-6 rounded-lg bg-white border ${isPaceBelow ? "border-red-200 text-red-600" : "border-slate-200/70 text-slate-600"} flex items-center justify-center shadow-2xs`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black leading-none ${isPaceBelow ? "text-red-900" : "text-slate-900"}`}>{actualPace}</span>
              <span className={`text-xs font-bold ${isPaceBelow ? "text-red-600" : "text-slate-400"}`}>/hr</span>
            </div>
            {/* Unified Sleek Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isPaceBelow ? "bg-red-500" : "bg-slate-900"}`}
                style={{ width: `${pacePct}%` }}
              />
            </div>
            <span className={`text-xs font-bold block mt-1.5 ${isPaceBelow ? "text-red-700" : "text-slate-600"}`}>
              {isPaceBelow ? "⚠️ " : "🎯 "}
              {isHindi ? `लक्ष्य ${targetPace}/hr` : `Goal ${targetPace}/hr`}
            </span>
          </div>
        </div>

        {/* Card 2: Accuracy Rate */}
        <div className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-colors relative ${
          accuracy < 98
            ? "bg-red-50/90 border-red-300 shadow-2xs"
            : "bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/70"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {accuracy < 98 && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${accuracy < 98 ? "text-red-700" : "text-slate-500"}`}>
                {isHindi ? "एक्यूरेसी" : "Accuracy"}
              </span>
            </div>
            <div className={`w-6 h-6 rounded-lg bg-white border ${accuracy < 98 ? "border-red-200 text-red-600" : "border-slate-200/70 text-slate-600"} flex items-center justify-center shadow-2xs`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black leading-none ${accuracy < 98 ? "text-red-900" : "text-slate-900"}`}>{accuracy}%</span>
            </div>
            {/* Unified Sleek Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${accuracy < 98 ? "bg-red-500" : "bg-slate-900"}`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <span className={`text-xs font-bold block mt-1.5 ${accuracy < 98 ? "text-red-700" : "text-slate-600"}`}>
              {accuracy < 98 ? "⚠️ Check errors" : `✓ ${isHindi ? "0 त्रुटियां" : "Zero Errors"}`}
            </span>
          </div>
        </div>

        {/* Card 3: Orders Completed */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-2.5 hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? "ऑर्डर" : "Orders"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/70 text-slate-600 flex items-center justify-center shadow-2xs">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 leading-none">{ordersCompleted}</span>
              <span className="text-xs font-bold text-slate-400">{isHindi ? "पूरे" : "done"}</span>
            </div>
            {/* Unified Sleek Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (ordersCompleted / 40) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 font-bold block mt-1.5">
              📦 {isHindi ? "समय पर" : "On-Time"}
            </span>
          </div>
        </div>

        {/* Card 4: Status Tile (Consistent neutral base or red when attention needed) */}
        <div className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-colors relative ${
          !isShiftGood
            ? "bg-red-50/90 border-red-300 shadow-2xs"
            : "bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/70"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {!isShiftGood && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${!isShiftGood ? "text-red-700" : "text-slate-500"}`}>
                {isHindi ? "स्थिति" : "Status"}
              </span>
            </div>
            <div className={`w-6 h-6 rounded-lg bg-white border ${!isShiftGood ? "border-red-200 text-red-600" : "border-slate-200/70 text-slate-600"} flex items-center justify-center shadow-2xs`}>
              {isShiftGood ? <ThumbsUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className={`text-lg sm:text-xl font-black leading-tight ${!isShiftGood ? "text-red-900" : "text-slate-900"}`}>
                {isShiftGood ? (isHindi ? "सही रहा" : "GOOD") : (isHindi ? "ध्यान दें" : "ATTENTION")}
              </span>
            </div>
            <div className="mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                  isShiftGood
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-red-100 border-red-300 text-red-800"
                }`}
              >
                {!isShiftGood && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                {signTag}
              </span>
            </div>
            <span className={`text-xs font-medium block mt-1 truncate ${!isShiftGood ? "text-red-700" : "text-slate-500"}`}>
              {signSub}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TACTILE ACTION FOOTER */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          {isDashboardVariant ? (
            <>
              <FileText className="w-4 h-4 text-slate-500" />
              <span>{isHindi ? "पूरा विवरण देखें" : "Tap for full shift details"}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>{isHindi ? "डैशबोर्ड रिपोर्ट देखें" : "Tap for full details"}</span>
            </>
          )}
        </span>
        <div className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 transition-colors">
          <span>{isHindi ? "विवरण →" : "Details →"}</span>
        </div>
      </div>
    </div>
  );
};
