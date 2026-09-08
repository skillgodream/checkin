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
  BookOpen,
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
  const accuracy = prevWork?.accuracyRate ?? 99;
  const ordersCompleted = prevWork?.ordersCompleted ?? (isFirstDay ? 15 : 38);
  const targetOrders = prevWork?.targetOrders ?? (isFirstDay ? 20 : 42);

  // 3. Four-Pillar Weighted Model Calculation
  const completedCount = newHire.modulesCompleted ?? 3;
  const quizAvg = newHire.quizAverageScore ?? 94;

  const trainingScore = Math.min(100, Math.round(((completedCount / 3) * 50 + (quizAvg / 100) * 50)));
  const speedScore = Math.min(100, Math.round((actualPace / targetPace) * 100));
  const accuracyScore = Math.min(100, Math.round(accuracy));
  const ordersScore = Math.min(100, Math.round((ordersCompleted / targetOrders) * 100));

  const compositeScore = Math.round(
    trainingScore * 0.25 + speedScore * 0.30 + accuracyScore * 0.30 + ordersScore * 0.15
  );

  let statusLabel = isHindi ? "लक्ष्य पर" : "On Track";
  let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (compositeScore < 65) {
    statusLabel = isHindi ? "ध्यान दें" : "Needs Attention";
    statusColor = "bg-red-50 text-red-700 border-red-200";
  } else if (compositeScore < 80) {
    statusLabel = isHindi ? "स्थिर रफ़्तार" : "Ramping Steady";
    statusColor = "bg-amber-50 text-amber-700 border-amber-200";
  }

  const prevDailySignal = yesterdayRecord?.dailySignal;
  const prevPattern = yesterdayRecord?.identifiedPattern;
  const prevActionOutcome = yesterdayRecord?.actionOutcome;

  const isPaceBelow = actualPace < targetPace - 3;
  const isShiftGood = compositeScore >= 75;

  // Audio speech narration
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }

    const text = isHindi
      ? `कल का समग्र प्रदर्शन स्कोर ${compositeScore} प्रतिशत है। ट्रेनिंग ${trainingScore}%, पिकिंग स्पीड ${actualPace} सामान प्रति घंटा, एक्यूरेसी ${accuracy}%, और ${ordersCompleted} ऑर्डर पूरे हुए। स्थिति: ${statusLabel}।`
      : `Yesterday's overall daily performance score is ${compositeScore} percent. Training ${trainingScore} percent, pick rate ${actualPace} items per hour, ${accuracy} percent accuracy, and ${ordersCompleted} orders fulfilled. Status: ${statusLabel}.`;

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
        compositeScore < 65
          ? "border-red-300 ring-2 ring-red-500/15 bg-gradient-to-br from-white via-red-50/25 to-white"
          : "border-emerald-300 ring-2 ring-emerald-500/15 bg-gradient-to-br from-white via-emerald-50/25 to-white"
      } ${isDashboardVariant ? "ring-2 ring-slate-900/10" : ""}`}
    >
      {/* 1. HEADER: CLEAN "YESTERDAY SNAPSHOT" + COMPOSITE SCORE RING BADGE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 block">
              {isHindi ? "कल का स्नैपशॉट" : "YESTERDAY SNAPSHOT"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Circular badge with 89% without any text */}
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shadow-xs">
            89%
          </div>

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

      {/* 2. 4-PILLAR METRIC GRID TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        {/* Pillar 1: Training Completion (25%) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? "ट्रेनिंग (25%)" : "Training (25%)"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/70 text-purple-600 flex items-center justify-center shadow-2xs">
              🎓
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 leading-none">{completedCount}/3</span>
              <span className="text-[10px] text-slate-400 font-bold">Mod</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(completedCount / 3) * 100}%` }} />
            </div>
            <span className="text-[10px] text-slate-600 font-bold block mt-1">
              Quiz {quizAvg}% avg
            </span>
          </div>
        </div>

        {/* Pillar 2: Pick Speed (30%) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? "स्पीड (30%)" : "Speed (30%)"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/70 text-slate-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 leading-none">{actualPace}</span>
              <span className="text-[10px] text-slate-400 font-bold">/{targetPace}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${Math.min(100, (actualPace / targetPace) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-slate-600 font-bold block mt-1">
              {speedScore}% Pace
            </span>
          </div>
        </div>

        {/* Pillar 3: Scan Accuracy (30%) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? "एक्यूरेसी (30%)" : "Accuracy (30%)"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/70 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 leading-none">{accuracy}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${accuracy}%` }} />
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              ✓ Zero Error
            </span>
          </div>
        </div>

        {/* Pillar 4: Orders SLA (15%) */}
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? "ऑर्डर SLA (15%)" : "Orders (15%)"}
            </span>
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/70 text-blue-600 flex items-center justify-center shadow-2xs">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 leading-none">{ordersCompleted}</span>
              <span className="text-[10px] text-slate-400 font-bold">/{targetOrders}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (ordersCompleted / targetOrders) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-blue-700 font-bold block mt-1">
              📦 On-Time SLA
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
