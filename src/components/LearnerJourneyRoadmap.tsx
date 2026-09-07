import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  BookOpen,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { NewHire } from "../types";
import { deriveLearnerRoadmap, CanonicalRoadmapStage } from "../services/intelligence";
import { speakMessage, stopSpeaking } from "../utils/speech";

interface LearnerJourneyRoadmapProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onNavigateToSection?: (section: "modules" | "buddy" | "dashboard") => void;
  onOpenWorkTools?: () => void;
}

export const LearnerJourneyRoadmap: React.FC<LearnerJourneyRoadmapProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onNavigateToSection,
  onOpenWorkTools,
}) => {
  const [showFullRoadmapModal, setShowFullRoadmapModal] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  // Pure presentation derived directly from authoritative intelligence pipeline
  const roadmapData = deriveLearnerRoadmap(newHire, currentDay);
  const { currentStageIndex, currentStage, stages, readinessScore, destinationEn, destinationHi } = roadmapData;

  const getStageIcon = (key: CanonicalRoadmapStage["key"]) => {
    switch (key) {
      case "training":
        return <BookOpen className="w-4 h-4" />;
      case "capability":
        return <Target className="w-4 h-4" />;
      case "independent":
        return <UserCheck className="w-4 h-4" />;
      case "productivity":
        return <TrendingUp className="w-4 h-4" />;
      case "reliability":
        return <ShieldCheck className="w-4 h-4" />;
      case "job_ready":
        return <Award className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  // Audio speech narration
  const handlePlayAudio = () => {
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }
    const text = isHindi
      ? `आपकी जॉब रेडी यात्रा। आप अभी स्टेज ${currentStage.stageNumber}: ${currentStage.titleHi} पर हैं। अगला लक्ष्य: ${currentStage.milestoneHi}। अंतिम मंजिल: ${destinationHi}।`
      : `Your Job-Ready Journey. You are currently at Stage ${currentStage.stageNumber}: ${currentStage.titleEn}. Next milestone: ${currentStage.milestoneEn}. Ultimate destination: ${destinationEn}.`;

    setPlayingAudio(true);
    speakMessage(text, isHindi, () => {
      setPlayingAudio(false);
    });
  };

  return (
    <div
      id="learner-job-ready-roadmap-card"
      className="bg-white rounded-[26px] p-4 border border-purple-100 shadow-2xs space-y-3 select-none"
    >
      {/* CARD HEADER: WHERE AM I? */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                {isHindi ? "मेरी कार्यकुशलता यात्रा" : "MY JOB-READY JOURNEY"}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {currentStage.stageNumber}/6
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-tight mt-0.5">
              {isHindi ? currentStage.titleHi : currentStage.titleEn}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
            title="Listen aloud"
          >
            <Volume2 className={`w-3.5 h-3.5 ${playingAudio ? "animate-bounce text-purple-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowFullRoadmapModal(true)}
            className="text-[11px] font-bold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-full border border-violet-200/80 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{isHindi ? "पूरा मैप" : "View Map"}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 6-STAGE VISUAL PROGRESSION TRACK */}
      <div className="relative pt-1 pb-1">
        {/* Connection line */}
        <div className="absolute top-4 left-3 right-3 h-1 bg-slate-100 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full transition-all duration-700"
            style={{
              width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stage Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.status === "current";
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setShowFullRoadmapModal(true)}
                className="flex flex-col items-center group cursor-pointer"
                title={isHindi ? stage.titleHi : stage.titleEn}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white ring-4 ring-purple-100 shadow-md scale-110"
                      : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-bold">{stage.stageNumber}</span>
                  )}
                </div>
                <span
                  className={`text-[9px] mt-1 font-bold truncate max-w-[50px] text-center hidden sm:block ${
                    isCurrent ? "text-violet-900" : isCompleted ? "text-emerald-800" : "text-slate-400"
                  }`}
                >
                  {isHindi
                    ? stage.titleHi.split(". ")[1] || stage.titleHi
                    : stage.titleEn.split(". ")[1] || stage.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CURRENT STATUS & NEXT MILESTONE SNAPSHOT */}
      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
              {isHindi ? "📍 वर्तमान स्थिति व फोकस" : "📍 CURRENT FOCUS"}
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
              {isHindi ? currentStage.shortDescHi : currentStage.shortDescEn}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[10px] font-bold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full inline-block">
              {readinessScore}% {isHindi ? "रेडीनेस" : "Ready"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <Target className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span className="truncate text-[11px]">
              <strong className="font-bold text-slate-800">{isHindi ? "अगला पड़ाव: " : "Next Target: "}</strong>
              {isHindi ? currentStage.milestoneHi : currentStage.milestoneEn}
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <Award className="w-3.5 h-3.5" />
            <span>{isHindi ? "मंजिल: सर्टिफाइड" : "Goal: Certified"}</span>
          </div>
        </div>
      </div>

      {/* FULL ROADMAP EXPANDED MODAL */}
      {showFullRoadmapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] max-w-md w-full max-h-[88vh] overflow-y-auto p-5 space-y-4 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isHindi ? "जॉब-रेडी रोडमैप (6 चरण)" : "Job-Ready Roadmap (6 Stages)"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isHindi ? "डार्क स्टोर पिकर बनने का पूरा सफर" : "Your path to Autonomous Dark Store Mastery"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullRoadmapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stages Stack */}
            <div className="space-y-2.5">
              {stages.map((stage) => {
                const isCurrent = stage.status === "current";
                const isCompleted = stage.status === "completed";
                return (
                  <div
                    key={stage.id}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      isCurrent
                        ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/30"
                        : isCompleted
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-slate-50 border-slate-200/80 opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-xs"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : getStageIcon(stage.key)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">
                            {isHindi ? stage.titleHi : stage.titleEn}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isCurrent
                                ? "bg-purple-200/80 text-purple-900 animate-pulse"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isCompleted
                              ? isHindi ? "पूर्ण हुआ ✓" : "Completed ✓"
                              : isCurrent
                              ? isHindi ? "👉 अभी आप यहां हैं" : "👉 YOU ARE HERE"
                              : isHindi ? "आगामी चरण" : "Upcoming Stage"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {isHindi ? stage.shortDescHi : stage.shortDescEn}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-700">
                      <Target className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>
                        <strong className="font-bold">{isHindi ? "लक्ष्य: " : "Milestone: "}</strong>
                        {isHindi ? stage.milestoneHi : stage.milestoneEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFullRoadmapModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                {isHindi ? "समझ गया, वापस जाएं" : "Close Roadmap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
