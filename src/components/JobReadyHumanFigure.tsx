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
      {/* ------------------------------------------------------------- */}
      {/* HERO HEADER: "See Your Progress. Build Your Future."         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          <span>{isHindi ? "अपनी प्रगति देखें. " : "See Your Progress. "}</span>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isHindi ? "भविष्य संवारें." : "Build Your Future."}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          {isHindi
            ? "आपकी जॉब-रेडी क्षमता केवल कोर्स पूरा करने से नहीं, बल्कि वास्तविक फ्लोर पर काम करने से बनती है।"
            : "Your career readiness is built from real progress — not just completed courses."}
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2-COLUMN GRID (ON DESKTOP) / STACKED ON MOBILE               */}
      {/* Left: Overall Readiness & Breakdown | Right: Human Silhouette */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================== */}
        {/* CARD A: OVERALL CAREER READINESS GAUGE & BREAKDOWN          */}
        {/* =========================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Circular Readiness Ring Card */}
          <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                {isHindi ? "कुल जॉब तत्परता" : "Overall Career Readiness"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isHindi ? "सत्यापित" : "Live Score"}
              </span>
            </div>

            {/* Circular Donut Dial Gauge */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="stroke-slate-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="url(#readiness-grad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={
                      2 * Math.PI * 48 * (1 - overallReadiness / 100)
                    }
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient
                      id="readiness-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {overallReadiness}%
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {isHindi ? "रेडी" : "Ready"}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Role Pill */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                <Building2 className="w-4 h-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">
                  {isHindi ? "वेयरहाउस एसोसिएट / पिकर" : "Warehouse Associate"}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {isHindi ? "डार्क स्टोर पूर्ति एवं लॉजिस्टिक्स" : "Logistics & Supply Chain"}
                </div>
              </div>
            </div>
          </div>

          {/* Your Progress Breakdown Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
              {isHindi ? "प्रगति का विवरण" : "Your Progress Breakdown"}
            </h3>

            <div className="space-y-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-left ${
                    selectedCategory === cat.id
                      ? "bg-slate-100/90 ring-1 ring-slate-300 font-black"
                      : "hover:bg-slate-50 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs text-slate-800">
                      {isHindi ? cat.titleHi : cat.title}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {Math.round(cat.ratio * cat.weight)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CARD B: CENTRAL HUMAN SILHOUETTE WITH 4 BANDED ZONES        */}
        {/* =========================================================== */}
        <div className="lg:col-span-7 bg-gradient-to-b from-blue-50/20 via-slate-50/50 to-purple-50/30 rounded-3xl p-4 border border-slate-200/80 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Ambient cyan glowing halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* SVG Canvas for Layered Glowing Human Figure Structure */}
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] h-[480px] sm:h-[520px]">
            <svg
              viewBox="0 0 360 520"
              className="w-full h-full drop-shadow-md cursor-pointer select-none"
              role="img"
              aria-label="Human structure showing 4 capability progress bands"
            >
              <defs>
                {/* 4 Reference Band Gradients */}
                {/* Band 1: Head & Neck (Blue - Learning) */}
                <linearGradient
                  id="grad-learning-blue"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>

                {/* Band 2: Chest (Green - Practice) */}
                <linearGradient
                  id="grad-practice-green"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Band 3: Midriff, Waist & Arms (Purple - Simulation) */}
                <linearGradient
                  id="grad-sim-purple"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>

                {/* Band 4: Legs & Feet (Orange - Assessment) */}
                <linearGradient
                  id="grad-assess-orange"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>

                {/* Neon Cyan Outer Glow Filter */}
                <filter
                  id="cyan-glow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="6"
                    floodColor="#38bdf8"
                    floodOpacity="0.85"
                  />
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="12"
                    floodColor="#0284c7"
                    floodOpacity="0.4"
                  />
                </filter>

                {/* Clip Path for the Complete Human Silhouette Body */}
                <clipPath id="human-silhouette-clip">
                  <path
                    d="
                      M 180 40
                      C 194 40 205 52 205 68
                      C 205 84 195 95 188 100
                      L 194 108
                      C 214 112 232 118 245 130
                      C 252 136 256 146 254 165
                      L 248 215
                      C 246 226 252 245 253 260
                      C 254 275 248 288 242 290
                      C 236 292 232 284 232 272
                      L 230 230
                      C 229 215 224 190 220 180
                      L 214 185
                      L 216 225
                      L 218 260
                      L 218 280
                      C 218 295 210 330 206 360
                      L 204 420
                      L 208 470
                      C 210 478 206 484 196 484
                      C 186 484 182 478 182 470
                      L 182 420
                      C 182 390 182 360 180 320
                      C 178 360 178 390 178 420
                      L 178 470
                      C 178 478 174 484 164 484
                      C 154 484 150 478 152 470
                      L 156 420
                      L 154 360
                      C 150 330 142 295 142 280
                      L 142 260
                      L 144 225
                      L 146 185
                      L 140 180
                      C 136 190 131 215 130 230
                      L 128 272
                      C 128 284 124 292 118 290
                      C 112 288 106 275 107 260
                      C 108 245 114 226 112 215
                      L 106 165
                      C 104 146 108 136 115 130
                      C 128 118 146 112 166 108
                      L 172 100
                      C 165 95 155 84 155 68
                      C 155 52 166 40 180 40 Z
                    "
                  />
                </clipPath>
              </defs>

              {/* Ground Shadow Ellipse */}
              <ellipse
                cx="180"
                cy="492"
                rx="65"
                ry="9"
                fill="#cbd5e1"
                opacity="0.6"
              />

              {/* ===================================================== */}
              {/* GLOWING AURA HUMAN SILHOUETTE OUTLINE                */}
              {/* ===================================================== */}
              <path
                d="
                  M 180 40
                  C 194 40 205 52 205 68
                  C 205 84 195 95 188 100
                  L 194 108
                  C 214 112 232 118 245 130
                  C 252 136 256 146 254 165
                  L 248 215
                  C 246 226 252 245 253 260
                  C 254 275 248 288 242 290
                  C 236 292 232 284 232 272
                  L 230 230
                  C 229 215 224 190 220 180
                  L 214 185
                  L 216 225
                  L 218 260
                  L 218 280
                  C 218 295 210 330 206 360
                  L 204 420
                  L 208 470
                  C 210 478 206 484 196 484
                  C 186 484 182 478 182 470
                  L 182 420
                  C 182 390 182 360 180 320
                  C 178 360 178 390 178 420
                  L 178 470
                  C 178 478 174 484 164 484
                  C 154 484 150 478 152 470
                  L 156 420
                  L 154 360
                  C 150 330 142 295 142 280
                  L 142 260
                  L 144 225
                  L 146 185
                  L 140 180
                  C 136 190 131 215 130 230
                  L 128 272
                  C 128 284 124 292 118 290
                  C 112 288 106 275 107 260
                  C 108 245 114 226 112 215
                  L 106 165
                  C 104 146 108 136 115 130
                  C 128 118 146 112 166 108
                  L 172 100
                  C 165 95 155 84 155 68
                  C 155 52 166 40 180 40 Z
                "
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                filter="url(#cyan-glow)"
                className="transition-all duration-300"
              />

              {/* White crisp border line overlay */}
              <path
                d="
                  M 180 40
                  C 194 40 205 52 205 68
                  C 205 84 195 95 188 100
                  L 194 108
                  C 214 112 232 118 245 130
                  C 252 136 256 146 254 165
                  L 248 215
                  C 246 226 252 245 253 260
                  C 254 275 248 288 242 290
                  C 236 292 232 284 232 272
                  L 230 230
                  C 229 215 224 190 220 180
                  L 214 185
                  L 216 225
                  L 218 260
                  L 218 280
                  C 218 295 210 330 206 360
                  L 204 420
                  L 208 470
                  C 210 478 206 484 196 484
                  C 186 484 182 478 182 470
                  L 182 420
                  C 182 390 182 360 180 320
                  C 178 360 178 390 178 420
                  L 178 470
                  C 178 478 174 484 164 484
                  C 154 484 150 478 152 470
                  L 156 420
                  L 154 360
                  C 150 330 142 295 142 280
                  L 142 260
                  L 144 225
                  L 146 185
                  L 140 180
                  C 136 190 131 215 130 230
                  L 128 272
                  C 128 284 124 292 118 290
                  C 112 288 106 275 107 260
                  C 108 245 114 226 112 215
                  L 106 165
                  C 104 146 108 136 115 130
                  C 128 118 146 112 166 108
                  L 172 100
                  C 165 95 155 84 155 68
                  C 155 52 166 40 180 40 Z
                "
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* ===================================================== */}
              {/* 4 HORIZONTALLY BANDED CAPABILITY LAYERS (CLIPPED)     */}
              {/* ===================================================== */}
              <g clipPath="url(#human-silhouette-clip)">
                {/* Band 1: Head & Neck (Blue - Learning) y: 0 to 125 */}
                <rect
                  x="0"
                  y="0"
                  width="360"
                  height="125"
                  fill="url(#grad-learning-blue)"
                  opacity={selectedCategory === "learning" ? 1 : 0.9}
                  onClick={() => setSelectedCategory("learning")}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />

                {/* Band 2: Chest (Green - Practice) y: 125 to 195 */}
                <rect
                  x="0"
                  y="125"
                  width="360"
                  height="70"
                  fill="url(#grad-practice-green)"
                  opacity={selectedCategory === "practice" ? 1 : 0.9}
                  onClick={() => setSelectedCategory("practice")}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />

                {/* Band 3: Midriff, Waist & Arms (Purple - Simulation) y: 195 to 290 */}
                <rect
                  x="0"
                  y="195"
                  width="360"
                  height="95"
                  fill="url(#grad-sim-purple)"
                  opacity={selectedCategory === "simulation" ? 1 : 0.9}
                  onClick={() => setSelectedCategory("simulation")}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />

                {/* Band 4: Legs & Feet (Orange - Assessment) y: 290 to 520 */}
                <rect
                  x="0"
                  y="290"
                  width="360"
                  height="230"
                  fill="url(#grad-assess-orange)"
                  opacity={selectedCategory === "assessment" ? 1 : 0.9}
                  onClick={() => setSelectedCategory("assessment")}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                />

                {/* Horizontal Band Separators (Crisp white dividing lines) */}
                <line
                  x1="80"
                  y1="125"
                  x2="280"
                  y2="125"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <line
                  x1="80"
                  y1="195"
                  x2="280"
                  y2="195"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                <line
                  x1="80"
                  y1="290"
                  x2="280"
                  y2="290"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              </g>

              {/* ===================================================== */}
              {/* POINTER CALLOUT LINES & ANCHOR NODES                  */}
              {/* ===================================================== */}

              {/* 1. TOP-LEFT CALLOUT LINE: Blue (Learning) */}
              <g onClick={() => setSelectedCategory("learning")} className="cursor-pointer">
                {/* Node on Body */}
                <circle
                  cx="150"
                  cy="98"
                  r="5"
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <circle cx="150" cy="98" r="2" fill="#3b82f6" />
                {/* Connecting Line */}
                <polyline
                  points="150,98 120,98 90,135 15,135"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray={selectedCategory === "learning" ? "none" : "3 2"}
                />
              </g>

              {/* 2. TOP-RIGHT CALLOUT LINE: Green (Practice) */}
              <g onClick={() => setSelectedCategory("practice")} className="cursor-pointer">
                {/* Node on Body */}
                <circle
                  cx="200"
                  cy="155"
                  r="5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <circle cx="200" cy="155" r="2" fill="#10b981" />
                {/* Connecting Line */}
                <polyline
                  points="200,155 240,120 345,120"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray={selectedCategory === "practice" ? "none" : "3 2"}
                />
              </g>

              {/* 3. BOTTOM-LEFT CALLOUT LINE: Purple (Simulation) */}
              <g onClick={() => setSelectedCategory("simulation")} className="cursor-pointer">
                {/* Node on Body */}
                <circle
                  cx="128"
                  cy="245"
                  r="5"
                  fill="#ffffff"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                />
                <circle cx="128" cy="245" r="2" fill="#8b5cf6" />
                {/* Connecting Line */}
                <polyline
                  points="128,245 95,245 80,265 15,265"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="1.5"
                  strokeDasharray={selectedCategory === "simulation" ? "none" : "3 2"}
                />
              </g>

              {/* 4. BOTTOM-RIGHT CALLOUT LINE: Orange (Assessment) */}
              <g onClick={() => setSelectedCategory("assessment")} className="cursor-pointer">
                {/* Node on Body */}
                <circle
                  cx="198"
                  cy="355"
                  r="5"
                  fill="#ffffff"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />
                <circle cx="198" cy="355" r="2" fill="#f59e0b" />
                {/* Connecting Line */}
                <polyline
                  points="198,355 230,300 345,300"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray={selectedCategory === "assessment" ? "none" : "3 2"}
                />
              </g>
            </svg>

            {/* ======================================================= */}
            {/* 4 FLOATING HTML CALLOUT CARDS (Matching Reference)      */}
            {/* ======================================================= */}

            {/* Top Left: Learning (Blue) */}
            <div
              onClick={() => setSelectedCategory("learning")}
              className={`absolute top-[65px] left-[-6px] sm:left-[0px] p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border shadow-sm transition-all cursor-pointer max-w-[155px] sm:max-w-[175px] ${
                selectedCategory === "learning"
                  ? "border-blue-400 ring-2 ring-blue-400/30 scale-105"
                  : "border-slate-200/90 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    {isHindi ? "लर्निंग" : "Learning"}
                  </div>
                  <div className="text-xs font-black text-blue-600">
                    {learningPct}%
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight line-clamp-1">
                {isHindi ? `मॉड्यूल ${learningCompleted}/12` : `Video modules ${learningCompleted}/12`}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${learningRatio * 100}%` }}
                />
              </div>
            </div>

            {/* Top Right: Practice (Green) */}
            <div
              onClick={() => setSelectedCategory("practice")}
              className={`absolute top-[50px] right-[-6px] sm:right-[0px] p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border shadow-sm transition-all cursor-pointer max-w-[155px] sm:max-w-[175px] ${
                selectedCategory === "practice"
                  ? "border-emerald-400 ring-2 ring-emerald-400/30 scale-105"
                  : "border-slate-200/90 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    {isHindi ? "अभ्यास" : "Practice"}
                  </div>
                  <div className="text-xs font-black text-emerald-600">
                    {practicePct}%
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight line-clamp-1">
                {isHindi ? `ड्रिल्स ${practiceCompleted}/${practiceTotal}` : `Exercises ${practiceCompleted}/${practiceTotal}`}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${practiceRatio * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Left: Simulation (Purple) */}
            <div
              onClick={() => setSelectedCategory("simulation")}
              className={`absolute top-[230px] left-[-6px] sm:left-[0px] p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border shadow-sm transition-all cursor-pointer max-w-[155px] sm:max-w-[175px] ${
                selectedCategory === "simulation"
                  ? "border-purple-400 ring-2 ring-purple-400/30 scale-105"
                  : "border-slate-200/90 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    {isHindi ? "सिमुलेशन" : "Simulation"}
                  </div>
                  <div className="text-xs font-black text-purple-600">
                    {simPct}%
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight line-clamp-1">
                {isHindi ? `एक्टिविटी ${simCompleted}/${simTotal}` : `Activities ${simCompleted}/${simTotal}`}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${simRatio * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Right: Assessment (Orange) */}
            <div
              onClick={() => setSelectedCategory("assessment")}
              className={`absolute top-[260px] right-[-6px] sm:right-[0px] p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border shadow-sm transition-all cursor-pointer max-w-[155px] sm:max-w-[175px] ${
                selectedCategory === "assessment"
                  ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
                  : "border-slate-200/90 hover:border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    {isHindi ? "असेसमेंट" : "Assessment"}
                  </div>
                  <div className="text-xs font-black text-amber-600">
                    {assessPct}%
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight line-clamp-1">
                {isHindi ? `फाइनल टेस्ट ${assessCompleted}/${assessTotal}` : `Final passed ${assessCompleted}/${assessTotal}`}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${assessRatio * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Selection Strip */}
          <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span>{isHindi ? c.titleHi : c.title}</span>
              </button>
            ))}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-violet-100 text-violet-700">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                    {isHindi ? "डे 10 जॉब रेडी सर्टिफिकेशन (7 क्राइटेरिया)" : "Day 10 Commercial Certification (7 Criteria)"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isHindi
                      ? "केवल प्रतिशत नहीं — 7 आवश्यक व्यावसायिक मानदंडों का वास्तविक मूल्यांकन"
                      : "Not reduced to one percentage — 7 non-negotiable operational conditions"}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  day10Audit.isReady
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {day10Audit.isReady ? (isHindi ? "जॉब रेडी ✓" : "JOB READY ✓") : (isHindi ? "नॉट रेडी ⚠️" : "NOT READY ⚠️")}
              </span>
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
      {/* BOTTOM SECTION: "Your Learning Journey" (7 STAGE PROGRESSION) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-50/90 rounded-3xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            {isHindi ? "आपकी लर्निंग जर्नी" : "Your Learning Journey"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {isHindi
              ? "अपने करियर के लक्ष्य तक पहुंचने के लिए प्रत्येक चरण पूरा करें।"
              : "Complete each stage to reach your career goal."}
          </p>
        </div>

        {/* Horizontal Scrollable Stage Step Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {journeyStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                className={`min-w-[125px] sm:min-w-[135px] p-3 rounded-2xl border transition-all shrink-0 flex flex-col justify-between ${
                  stage.status === "completed"
                    ? "bg-white border-emerald-200/80 shadow-2xs"
                    : stage.status === "active"
                    ? "bg-white border-purple-400 ring-2 ring-purple-400/30 shadow-xs"
                    : "bg-slate-100/70 border-slate-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${stage.color}`}
                    >
                      {stage.icon}
                    </div>
                    {stage.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    )}
                    {stage.status === "active" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">
                    {stage.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight line-clamp-2">
                    {stage.sub}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] font-black">
                  {stage.status === "completed" ? (
                    <span className="text-emerald-700">✓ {isHindi ? "पूर्ण" : "Completed"}</span>
                  ) : stage.status === "active" ? (
                    <span className="text-purple-700 font-black">● {isHindi ? "प्रगति पर" : "In Progress"}</span>
                  ) : (
                    <span className="text-slate-400">{isHindi ? "आगामी" : "Upcoming"}</span>
                  )}
                </div>
              </div>

              {idx < journeyStages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

