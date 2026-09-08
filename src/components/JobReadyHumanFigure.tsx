import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Dumbbell,
  FlaskConical,
  FileCheck2,
  Award,
  ChevronRight,
  Building2,
  PackageCheck,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import {
  NewHire,
  CapabilityState,
  DARK_STORE_CAPABILITIES,
} from "../types";
import { evaluateDay10Outcome } from "../services/intelligence";

interface JobReadyHumanFigureProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
}

interface CapabilityCategory {
  id: "learning" | "practice" | "simulation" | "assessment";
  title: string;
  titleHi: string;
  weight: number;
  completedText: string;
  completedTextHi: string;
  color: string;
  gradientId: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ReactNode;
  ratio: number;
  completedCount: number;
  totalCount: number;
}

export const JobReadyHumanFigure: React.FC<JobReadyHumanFigureProps> = ({
  newHire,
  currentDay,
  isHindi = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "learning" | "practice" | "simulation" | "assessment"
  >("practice");

  const capabilities = newHire.capabilities || {};
  const currentCapId = newHire.currentCapabilityId || 3;

  // Calculate demonstrated capabilities
  const demonstratedCount = (
    Object.values(capabilities) as CapabilityState[]
  ).filter(
    (c) =>
      c &&
      (c.evidence === "demonstrated" ||
        c.mastery === "proficient" ||
        c.mastery === "mastered")
  ).length;

  // Modules completed (out of 10)
  const modulesCompleted = newHire.modulesCompleted ?? Math.min(10, currentDay);
  const quizAvg = newHire.quizAverageScore ?? 94;

  // 4 Core Reference Image Pillars calculated from real intelligence state:
  // 1. Learning (20% weight) - Video & Theory LMS modules
  const learningCompleted = Math.min(12, Math.round((modulesCompleted / 10) * 12));
  const learningRatio = Math.min(1, modulesCompleted / 10);
  const learningPct = Math.round(learningRatio * 20);

  // 2. Practice (25% weight) - Floor exercises & Aisle drills
  const practiceTotal = 10;
  const practiceCompleted = Math.min(
    practiceTotal,
    Math.round((demonstratedCount / 20) * 10) + (currentDay >= 3 ? 2 : 1)
  );
  const practiceRatio = Math.min(1, practiceCompleted / practiceTotal);
  const practicePct = Math.round(practiceRatio * 25);

  // 3. Simulation (25% weight) - Practical terminal activities & mock orders
  const simTotal = 8;
  const simCompleted = Math.min(
    simTotal,
    Math.round((demonstratedCount / 20) * 8) + (currentDay >= 4 ? 2 : 1)
  );
  const simRatio = Math.min(1, simCompleted / simTotal);
  const simPct = Math.round(simRatio * 25);

  // 4. Assessment (30% weight) - Real floor shift verification & solo SLA tests
  const assessTotal = 3;
  const assessCompleted =
    currentDay >= 5 && demonstratedCount >= 10
      ? 3
      : currentDay >= 4
      ? 2
      : currentDay >= 3
      ? 1
      : 0;
  const assessRatio = assessCompleted / assessTotal;
  const assessPct = Math.round(assessRatio * 30);

  // Overall readiness percentage matching reference image style
  const overallReadiness = Math.min(
    100,
    typeof newHire.overallReadinessScore === "number"
      ? (newHire.overallReadinessScore <= 1
          ? Math.round(newHire.overallReadinessScore * 100)
          : Math.round(newHire.overallReadinessScore))
      : learningPct + practicePct + simPct + assessPct
  );

  const categories: CapabilityCategory[] = [
    {
      id: "learning",
      title: "Learning",
      titleHi: "थ्योरी और वीडियो",
      weight: 20,
      completedText: `Video modules completed ${learningCompleted}/12`,
      completedTextHi: `वीडियो मॉड्यूल पूर्ण ${learningCompleted}/12`,
      color: "#3b82f6",
      gradientId: "grad-learning-blue",
      bgClass: "bg-blue-500",
      textClass: "text-blue-600",
      borderClass: "border-blue-200",
      icon: <Play className="w-3.5 h-3.5 fill-current" />,
      ratio: learningRatio,
      completedCount: learningCompleted,
      totalCount: 12,
    },
    {
      id: "practice",
      title: "Practice",
      titleHi: "फ्लोर अभ्यास",
      weight: 25,
      completedText: `Exercises completed ${practiceCompleted}/${practiceTotal}`,
      completedTextHi: `अभ्यास ड्रिल पूर्ण ${practiceCompleted}/${practiceTotal}`,
      color: "#10b981",
      gradientId: "grad-practice-green",
      bgClass: "bg-emerald-500",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-200",
      icon: <Dumbbell className="w-3.5 h-3.5" />,
      ratio: practiceRatio,
      completedCount: practiceCompleted,
      totalCount: practiceTotal,
    },
    {
      id: "simulation",
      title: "Simulation",
      titleHi: "सिमुलेशन लैब",
      weight: 25,
      completedText: `Practical activities completed ${simCompleted}/${simTotal}`,
      completedTextHi: `प्रैक्टिकल एक्टिविटी पूर्ण ${simCompleted}/${simTotal}`,
      color: "#8b5cf6",
      gradientId: "grad-sim-purple",
      bgClass: "bg-purple-500",
      textClass: "text-purple-600",
      borderClass: "border-purple-200",
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      ratio: simRatio,
      completedCount: simCompleted,
      totalCount: simTotal,
    },
    {
      id: "assessment",
      title: "Assessment",
      titleHi: "फ्लोर टेस्ट",
      weight: 30,
      completedText: `Final assessment passed ${assessCompleted}/${assessTotal}`,
      completedTextHi: `फाइनल टेस्ट पास ${assessCompleted}/${assessTotal}`,
      color: "#f59e0b",
      gradientId: "grad-assess-orange",
      bgClass: "bg-amber-500",
      textClass: "text-amber-600",
      borderClass: "border-amber-200",
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
      ratio: assessRatio,
      completedCount: assessCompleted,
      totalCount: assessTotal,
    },
  ];

  // Learning journey stages matching reference image bottom bar
  const journeyStages = [
    {
      id: 1,
      title: isHindi ? "लर्निंग वीडियो" : "Learning Videos",
      sub: isHindi ? "ज्ञान बढ़ाएं" : "Build your knowledge",
      status: currentDay >= 1 ? "completed" : "locked",
      icon: <Play className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: 2,
      title: isHindi ? "फ्लोर प्रैक्टिस" : "Practice",
      sub: isHindi ? "हुनर तराशें" : "Sharpen your skills",
      status: currentDay >= 2 ? "completed" : "locked",
      icon: <Dumbbell className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: 3,
      title: isHindi ? "सिमुलेशन लैब" : "Simulation Lab",
      sub: isHindi ? "प्रैक्टिकल अनुभव" : "Get hands-on experience",
      status: currentDay === 3 ? "active" : currentDay > 3 ? "completed" : "locked",
      icon: <FlaskConical className="w-4 h-4" />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: 4,
      title: isHindi ? "वर्कप्लेस इंग्लिश" : "Workplace Hindi/Eng",
      sub: isHindi ? "आत्मविश्वास से बोलें" : "Speak with confidence",
      status: currentDay >= 4 ? "completed" : "locked",
      icon: <Volume2 className="w-4 h-4" />,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      id: 5,
      title: isHindi ? "शिफ्ट इंटरव्यू" : "Interview Prep",
      sub: isHindi ? "तैयारी पूरी करें" : "Practice & get ready",
      status: currentDay >= 5 ? "completed" : "locked",
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      id: 6,
      title: isHindi ? "फाइनल असेसमेंट" : "Final Assessment",
      sub: isHindi ? "अपनी क्षमता दिखाएं" : "Show what you can do",
      status: currentDay >= 5 && overallReadiness >= 70 ? "completed" : "locked",
      icon: <FileCheck2 className="w-4 h-4" />,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: 7,
      title: isHindi ? "जॉब सर्टिफिकेट" : "Certificate",
      sub: isHindi ? "सर्टिफाइड बनें" : "Get your credential",
      status: overallReadiness >= 85 ? "completed" : "locked",
      icon: <Award className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const activeCategoryData =
    categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <section
      id="job-ready-human-dashboard"
      className="bg-white rounded-[32px] p-4 sm:p-6 border border-slate-200/90 shadow-lg shadow-purple-950/5 space-y-6 select-none"
    >
      {/* =========================================================== */}
      {/* HERO BANNER & PROGRESS BREAKDOWN (MATCHING SCREENSHOT)      */}
      {/* =========================================================== */}
      <div className="space-y-4">
        {/* Vibrant Purple Hero Banner */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-[32px] p-5 sm:p-7 text-white shadow-xl shadow-purple-900/15 overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-30px] opacity-10 pointer-events-none select-none text-9xl font-black tracking-widest text-white">
            READINESS
          </div>

          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {isHindi ? "जॉब रेडीनेस प्रतिशत" : "Job Readiness Percentage"}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">
                {isHindi ? "आपकी कुल करियर तैयारी और कौशल स्कोर" : "Your overall career preparedness and capability score"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Left: Circular Ring with Percentage */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#34d399"
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - overallReadiness / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                      {overallReadiness}%
                    </span>
                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mt-0.5">
                      {isHindi ? "रेडीनेस" : "Readiness"}
                    </span>
                  </div>
                </div>

                {/* Role Info Box */}
                <div className="flex-1 min-w-0 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-white">
                  <div className="text-xs font-black truncate">
                    {isHindi ? "वेयरहाउस एसोसिएट" : "Warehouse Associate"}
                  </div>
                  <div className="text-[10px] text-purple-200 truncate mt-0.5">
                    {isHindi ? "डार्क स्टोर लॉजिस्टिक्स" : "Dark Store Logistics"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar in Banner */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-purple-100 border-t border-white/15">
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-300">Target 85%+</span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isHindi ? "सर्टिफाइड रेडीनेस" : "Certified Readiness"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                <span>{isHindi ? "7 क्राइटेरिया" : "7 Criteria"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Breakdown Categories Section */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isHindi ? "श्रेणियां" : "Categories"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isHindi ? "4 मुख्य सीखने के स्तंभ" : "4 Core Learning Pillars"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {}}
              className="text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              {isHindi ? "सभी देखें ›" : "View All ›"}
            </button>
          </div>

          {/* 4 Cards in 1 Line (grid-cols-4) with Icons */}
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.id;
              const catScore = Math.round(cat.ratio * cat.weight);

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col items-center text-center justify-between bg-slate-100/80 hover:bg-slate-100 ${
                    isSelected
                      ? "border-2 border-purple-600 ring-2 ring-purple-600/10 shadow-sm bg-white"
                      : "border-slate-200/90"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-purple-600 shrink-0 mb-1.5">
                    {cat.icon}
                  </div>

                  <div className="text-xs sm:text-sm font-black text-slate-900 mb-1.5">
                    {catScore}%
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-purple-600"
                      style={{
                        width: `${Math.round(cat.ratio * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DAY 10 COMMERCIAL CERTIFICATION AUDIT (7 CRITERIA)            */}
      {/* ------------------------------------------------------------- */}
      {(() => {
        const day10Audit = evaluateDay10Outcome(newHire);
        return (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            {/* Clean Header Card */}
            <div className="bg-gradient-to-r from-violet-50/70 via-purple-50/40 to-fuchsia-50/30 rounded-2xl p-3 sm:p-3.5 border border-purple-200/60 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                    {isHindi ? "डे 10 कमर्शियल सर्टिफिकेशन (7 क्राइटेरिया)" : "Day 10 Commercial Certification"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {isHindi ? "7 आवश्यक व्यावसायिक मानदंड" : "7 Core Operational Criteria Audit"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {day10Audit.isReady ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHindi ? "जॉब रेडी" : "JOB READY"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                    <span>{isHindi ? "नॉट रेडी" : "NOT READY"}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {day10Audit.summary}
            </p>

            {/* 7 Criteria Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {day10Audit.verifiedCriteria.map((crit, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border flex items-start gap-2 ${
                    crit.met
                      ? "bg-slate-50/80 border-slate-200/80 text-slate-800"
                      : "bg-rose-50/80 border-rose-200/90 text-rose-950"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {crit.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">{crit.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{crit.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {!day10Audit.isReady && day10Audit.unresolvedBlockers.length > 0 && (
              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-900 font-medium">
                <div className="font-black text-amber-950 mb-0.5">
                  {isHindi ? "मुख्य रुकावट → आवश्यक अगला कदम:" : "Main blocker → Required next action:"}
                </div>
                <div>
                  {day10Audit.unresolvedBlockers[0]} • {day10Audit.recommendedAction}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: "Your Learning Journey" (Slim Compact Bar)      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 tracking-tight">
            {isHindi ? "आपकी लर्निंग जर्नी" : "Your Learning Journey"}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">7 Stages</span>
        </div>

        {/* Slim Horizontal Scrollable Stage Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {journeyStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                className={`px-3 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-2.5 ${
                  stage.status === "completed"
                    ? "bg-white border-emerald-200 text-slate-900 shadow-2xs"
                    : stage.status === "active"
                    ? "bg-white border-purple-500 ring-2 ring-purple-500/20 text-slate-900 shadow-xs"
                    : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-70"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${stage.color}`}
                >
                  {stage.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black truncate leading-tight">
                    {stage.title}
                  </div>
                  <div className="text-[9px] font-semibold truncate">
                    {stage.status === "completed"
                      ? (isHindi ? "पूर्ण" : "Completed")
                      : stage.status === "active"
                      ? (isHindi ? "प्रगति पर" : "In Progress")
                      : (isHindi ? "आगामी" : "Upcoming")}
                  </div>
                </div>
              </div>

              {idx < journeyStages.length - 1 && (
                <div className="w-3 h-0.5 bg-slate-200 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

