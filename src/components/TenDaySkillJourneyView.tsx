import React, { useState } from "react";
import {
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  Check,
  Target,
  Wrench,
  Trophy,
  Star,
  Zap,
  Flame,
  ChevronRight,
  BookOpen,
  Gauge,
  PlayCircle,
} from "lucide-react";
import {
  NewHire,
  DARK_STORE_CAPABILITIES,
  CapabilityState,
  WorkSignal,
} from "../types";
import { assessReadiness } from "../services/intelligence";

export interface MilestoneDefinition {
  dayNumber: number;
  name: string;
  shortTitle: string;
  description: string;
  encouragingNote: string;
  expectedCapabilities: string[];
  requiredCapabilities: Array<{
    capabilityId: number;
    minEvidenceLevel: "emerging" | "demonstrated";
  }>;
}

export const CANONICAL_MILESTONES: MilestoneDefinition[] = [
  {
    dayNumber: 3,
    name: "Level 1: Safe & Steady Picker",
    shortTitle: "Basic Execution",
    description: "Mastering safety gear, pairing your scanner, and finding items quickly in Aisles 1-4.",
    encouragingNote: "You're building your foundation! Focus on accurate barcode scans over speed.",
    expectedCapabilities: [
      "Safety gear & high-vis vest verified",
      "Handheld scanner & Bluetooth ring pairing",
      "Smooth navigation in Aisles 1-4",
    ],
    requiredCapabilities: [
      { capabilityId: 1, minEvidenceLevel: "demonstrated" },
      { capabilityId: 2, minEvidenceLevel: "demonstrated" },
      { capabilityId: 3, minEvidenceLevel: "emerging" },
    ],
  },
  {
    dayNumber: 5,
    name: "Level 2: Core Consistency Pro",
    shortTitle: "Core Consistency",
    description: "Handling fragile items with care, checking item variants, and packing tidy totes.",
    encouragingNote: "Great rhythm! Keep fragile items protected at the bottom of your tote.",
    expectedCapabilities: [
      "Variant checking & barcode discipline",
      "Fragile item cushioning & care",
      "Balanced tote placement",
    ],
    requiredCapabilities: [
      { capabilityId: 4, minEvidenceLevel: "demonstrated" },
      { capabilityId: 5, minEvidenceLevel: "demonstrated" },
      { capabilityId: 6, minEvidenceLevel: "emerging" },
    ],
  },
  {
    dayNumber: 7,
    name: "Level 3: Multi-Tasking Expert",
    shortTitle: "Multi-Tasking",
    description: "Mastering cold chain freshness, produce scale checks, and stock exceptions like a pro.",
    encouragingNote: "You're handling complex orders smoothly. Keep cold items moving fast!",
    expectedCapabilities: [
      "Cold chain item priority picking",
      "Produce weight & quality check",
      "Stock exception reporting",
    ],
    requiredCapabilities: [
      { capabilityId: 7, minEvidenceLevel: "demonstrated" },
      { capabilityId: 8, minEvidenceLevel: "demonstrated" },
      { capabilityId: 9, minEvidenceLevel: "emerging" },
    ],
  },
  {
    dayNumber: 9,
    name: "Level 4: Speed & Route Master",
    shortTitle: "Near Job-Ready",
    description: "Optimizing your serpentine walking path, beating SLA timers, and pre-dispatch QC.",
    encouragingNote: "Lightning fast! You're moving through store zones with total confidence.",
    expectedCapabilities: [
      "SLA timer pacing (>45 UPH)",
      "Serpentine route optimization",
      "Pre-dispatch quality inspection",
    ],
    requiredCapabilities: [
      { capabilityId: 10, minEvidenceLevel: "demonstrated" },
      { capabilityId: 11, minEvidenceLevel: "demonstrated" },
      { capabilityId: 12, minEvidenceLevel: "emerging" },
    ],
  },
  {
    dayNumber: 10,
    name: "Level 5: Certified Autonomous Picker",
    shortTitle: "Certified Pro",
    description: "Full shift autonomy, zero safety issues, and ready to lead your own waves!",
    encouragingNote: "You've arrived! Ready for autonomous shift certification and top earnings.",
    expectedCapabilities: [
      "Full shift autonomy (>50 UPH)",
      "Zero safety incidents",
      "Independent wave handoffs",
    ],
    requiredCapabilities: [
      { capabilityId: 1, minEvidenceLevel: "demonstrated" },
      { capabilityId: 2, minEvidenceLevel: "demonstrated" },
      { capabilityId: 3, minEvidenceLevel: "demonstrated" },
      { capabilityId: 4, minEvidenceLevel: "demonstrated" },
      { capabilityId: 5, minEvidenceLevel: "demonstrated" },
    ],
  },
];

export function getMilestoneForDay(day: number): MilestoneDefinition | undefined {
  if (day <= 3) return CANONICAL_MILESTONES[0];
  if (day <= 5) return CANONICAL_MILESTONES[1];
  if (day <= 7) return CANONICAL_MILESTONES[2];
  if (day <= 9) return CANONICAL_MILESTONES[3];
  return CANONICAL_MILESTONES[4];
}

export interface MilestoneComparisonResult {
  dayNumber: number;
  milestone: MilestoneDefinition;
  isMet: boolean;
  status: "ahead" | "on_track" | "behind" | "reached" | "not_enough_evidence";
}

export function compareLearnerToMilestone(
  hire: NewHire,
  milestone: MilestoneDefinition,
  workSignal?: WorkSignal
): MilestoneComparisonResult {
  const capabilities = hire.capabilities || {};
  let demonstratedCount = 0;
  let totalRequired = milestone.requiredCapabilities.length;

  for (const req of milestone.requiredCapabilities) {
    const state = capabilities[req.capabilityId] as CapabilityState | undefined;
    if (state && (state.evidence === "demonstrated" || state.mastery === "proficient" || state.mastery === "mastered")) {
      demonstratedCount++;
    } else if (req.minEvidenceLevel === "emerging" && state && state.evidence === "emerging") {
      demonstratedCount += 0.8;
    }
  }

  const isMet = demonstratedCount >= totalRequired * 0.75;
  const currentDay = hire.currentDay;

  let status: "ahead" | "on_track" | "behind" | "reached" | "not_enough_evidence" = "on_track";
  if (currentDay < milestone.dayNumber && isMet) {
    status = "ahead";
  } else if (currentDay === milestone.dayNumber && isMet) {
    status = "reached";
  } else if (currentDay > milestone.dayNumber && !isMet) {
    status = "behind";
  } else if (isMet) {
    status = "reached";
  } else {
    status = "on_track";
  }

  return {
    dayNumber: milestone.dayNumber,
    milestone,
    isMet,
    status,
  };
}

interface TenDaySkillJourneyViewProps {
  newHires: NewHire[];
  activeHireId: string;
  onSelectHire: (hireId: string) => void;
  currentDay: number;
  onBackToManager?: () => void;
  isLearnerMode?: boolean;
  isHindi?: boolean;
  onNavigateToSection?: (section: "modules" | "dial" | "home") => void;
  onOpenTodaysGoal?: () => void;
}

export const TenDaySkillJourneyView: React.FC<TenDaySkillJourneyViewProps> = ({
  newHires,
  activeHireId,
  onSelectHire,
  currentDay,
  onBackToManager,
  isLearnerMode = false,
  isHindi = false,
  onNavigateToSection,
  onOpenTodaysGoal,
}) => {
  const activeHire = newHires.find((h) => h.id === activeHireId) || newHires[0];
  const learnerDay = activeHire.currentDay;
  const modulesCompleted = activeHire.modulesCompleted ?? 3;
  const isBehind = activeHire.status === "At risk" || activeHire.status === "Needs attention" || modulesCompleted < learnerDay - 1;

  // Authoritative Overall Job Readiness calculation
  const authoritativeReadiness = typeof activeHire.overallReadinessScore === "number"
    ? (activeHire.overallReadinessScore <= 1 ? Math.round(activeHire.overallReadinessScore * 100) : Math.round(activeHire.overallReadinessScore))
    : (activeHire.capabilities ? assessReadiness(activeHire.capabilities, activeHire) : 0);

  const [expandedLevel, setExpandedLevel] = useState<number | null>(learnerDay <= 3 ? 3 : learnerDay <= 5 ? 5 : learnerDay <= 7 ? 7 : learnerDay <= 9 ? 9 : 10);

  const currentMilestoneDef = getMilestoneForDay(learnerDay) || CANONICAL_MILESTONES[0];

  // Dean's Regenerative Catch-Up Plan Generation (Unified with Today's Goal)
  const catchUpActions = [
    {
      id: "act-1",
      title: "Today's Active Goal & Pacing Brief",
      category: "Daily Goal",
      duration: "5 mins",
      desc: "Open your primary shift goal workspace with live UPH targets and Dean's focus instructions.",
      actionType: "todays_goal" as const,
      icon: <Sparkles className="w-4 h-4 text-violet-600" />,
    },
    {
      id: "act-2",
      title: isBehind ? "15-Min Aisle Walkthrough Drill" : "Daily Pro Speed Pacing",
      category: isBehind ? "Floor Practice" : "Pacing",
      duration: isBehind ? "15 mins" : "Active Shift",
      desc: isBehind ? "Targeted bin coordinate practice in Aisles 4-8 with your buddy." : "Maintain >45 UPH across your assigned store sectors.",
      actionType: isBehind ? ("dial" as const) : ("todays_goal" as const),
      section: isBehind ? ("dial" as const) : undefined,
      icon: <Target className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "act-3",
      title: "Catch-Up / Advanced Module Check",
      category: "LMS Learning",
      duration: "10 mins",
      desc: "Review and complete your pending training modules to maintain flawless progression.",
      actionType: "modules" as const,
      section: "modules" as const,
      icon: <BookOpen className="w-4 h-4 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white w-full select-none">
      {/* 1. HERO HEADER (Cockpit Glass Treatment with radial glow) */}
      <div className="bg-white/10 border border-white/10 text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-cyan-400">
          <Trophy className="w-40 h-40" />
        </div>
        {/* Soft Ambient Radial Glow behind content */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-400/10 backdrop-blur-md text-cyan-300 text-xs font-black tracking-wide border border-cyan-400/20">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Shift Day {learnerDay} of 10 • Pro Picker Track</span>
            </div>
            {onBackToManager && (
              <button
                onClick={onBackToManager}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isLearnerMode ? "My 10-Day Pro Roadmap" : `${activeHire.name.split(" ")[0]}'s Journey`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1 leading-relaxed">
              {isBehind
                ? "Dean has redistributed your tasks to recover comfortable progress."
                : "Your personalized path to full certification, guided step-by-step by Dean."}
            </p>
          </div>

          {/* Simple Live Progress Bar (High Visual Contrast) */}
          <div className="w-full mt-4 bg-black/20 border border-white/10 rounded-2xl p-3.5 space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>{isHindi ? "कुल करियर रेडीनेस (लक्ष्य: 85%+)" : "Overall Role Readiness (Target: 85%+)"}</span>
              <span className="text-cyan-400 font-mono font-black">{authoritativeReadiness}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${authoritativeReadiness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MANAGER COHORT SELECTOR (If Manager Mode) */}
      {!isLearnerMode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Team Member</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
            {newHires.map((hire) => {
              const isSelected = hire.id === activeHire.id;
              return (
                <button
                  key={hire.id}
                  onClick={() => onSelectHire(hire.id)}
                  className={`snap-start min-w-[170px] p-3 rounded-2xl border text-left transition-all cursor-pointer shrink-0 shadow-xs ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                      : "bg-white/10 border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={hire.avatar} alt={hire.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate leading-tight">{hire.name}</h4>
                      <span className={`text-[10px] block truncate ${isSelected ? "text-cyan-300" : "text-slate-450"}`}>
                        Day {hire.currentDay} / 10
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WHERE I STAND VS IDEAL (FLATTENED ELITE METRICS) */}
      <div className={`p-5 rounded-[24px] border transition-all backdrop-blur-sm flex flex-col gap-4 ${
        isBehind 
          ? "bg-[#1d1414] border-red-500/20 shadow-lg shadow-red-950/10" 
          : "bg-white/5 border-white/10 shadow-lg"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              isBehind ? "bg-red-500/15 text-red-400" : "bg-cyan-500/10 text-cyan-400"
            }`}>
              {isBehind ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {isHindi ? "मेरी वर्तमान स्थिति" : "Standing vs Pro Target"}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Day {learnerDay} Status Check</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isBehind 
              ? "bg-red-500/15 text-red-400 border-red-500/20" 
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
          }`}>
            {isBehind ? (isHindi ? "कैच-अप मोड" : "Recovery Mode") : (isHindi ? "ऑन ट्रैक" : "On Track")}
          </span>
        </div>

        <div className="flex bg-black/20 rounded-xl p-3.5 items-center justify-between border border-white/5">
           <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {isHindi ? "निर्धारित गति" : "IDEAL PACE"}
              </span>
              <span className="font-bold text-white text-sm">Day {learnerDay} Module</span>
           </div>
           <div className="w-[1px] h-8 bg-white/10" />
           <div className="flex flex-col text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {isHindi ? "आपकी प्रगति" : "YOUR PROGRESS"}
              </span>
              <span className={`font-bold text-sm ${isBehind ? "text-amber-400" : "text-emerald-400"}`}>
                {modulesCompleted} {isHindi ? "मॉड्यूल पूर्ण" : "Modules Done"}
              </span>
           </div>
        </div>

        {isBehind && (
          <div className="pl-3.5 border-l-2 border-amber-500 text-xs text-amber-300 font-medium leading-relaxed">
            <strong className="text-white">Dean's Note:</strong> You are slightly behind due to aisle navigation friction on Day 3. Dean has automatically redistributed your tasks.
          </div>
        )}
      </div>

      {/* 4. ACTIONABLE MICRO-CARDS (COCKPIT CHECKLIST ALIGNMENT) */}
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            {isHindi ? "डीन की कोचिंग एक्शन प्लान" : "Dean's Coaching Action Plan"}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isHindi ? "कदम दर कदम गाइड - आगे बढ़ने के लिए टैप करें" : "Tap any task below to complete and proceed"}
          </p>
        </div>

        {/* Tactical Glass Cards on canvas - No heavy dark borders */}
        <div className="space-y-3">
          {catchUpActions.map((action, idx) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.actionType === "todays_goal" && onOpenTodaysGoal) {
                  onOpenTodaysGoal();
                } else if (onNavigateToSection && action.section) {
                  onNavigateToSection(action.section);
                } else if (onOpenTodaysGoal) {
                  onOpenTodaysGoal();
                }
              }}
              className="w-full p-5 rounded-[24px] bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/25 text-left transition-all cursor-pointer flex items-center justify-between gap-4 group active:scale-[0.98] shadow-md backdrop-blur-xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-slate-950/40 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-cyan-400/50 text-cyan-300">
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/25">
                      {action.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-350">{action.duration}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white mt-1.5 group-hover:text-cyan-300 leading-snug">
                    {idx + 1}. {action.title}
                  </h4>
                </div>
              </div>
              <div className="p-1.5 rounded-full bg-slate-950/25 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-950/50 shrink-0 border border-white/5 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. VISUAL 5-LEVEL CERTIFICATION ROADMAP (STORE ZONE GRADIENT STYLE) */}
      <div className="space-y-4">
        <div className="px-1 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {isHindi ? "प्रमाणन स्तर" : "Certification Levels"}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isHindi ? "स्तर विवरण खोलने के लिए टैप करें" : "Tap any level card to expand requirements"}
            </p>
          </div>
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            Day {learnerDay} Active
          </span>
        </div>

        {/* Flat Stack of Level Cards - NO container card, letting the cards breathe natively! */}
        <div className="space-y-3.5">
          {CANONICAL_MILESTONES.map((milestone, idx) => {
            const isCompleted = learnerDay > milestone.dayNumber;
            const isCurrent = learnerDay <= milestone.dayNumber && (idx === 0 || learnerDay > CANONICAL_MILESTONES[idx - 1].dayNumber);
            const isExpanded = expandedLevel === milestone.dayNumber;

            // Crisp line outline icon lookup mapping to match clean reference screenshot
            const getLevelIcon = (index: number, active: boolean) => {
              const iconClass = "w-7 h-7";
              switch (index) {
                case 0:
                  return <ShieldCheck className={iconClass} strokeWidth={1.5} />;
                case 1:
                  return <BookOpen className={iconClass} strokeWidth={1.5} />;
                case 2:
                  return <Zap className={iconClass} strokeWidth={1.5} />;
                case 3:
                  return <Gauge className={iconClass} strokeWidth={1.5} />;
                case 4:
                  return <Trophy className={iconClass} strokeWidth={1.5} />;
                default:
                  return <Star className={iconClass} strokeWidth={1.5} />;
              }
            };

            return (
              <div
                key={milestone.dayNumber}
                onClick={() => setExpandedLevel(isExpanded ? null : milestone.dayNumber)}
                className={`p-6 rounded-[28px] transition-all duration-300 cursor-pointer select-none border transition-all duration-200 active:scale-99 ${
                  isCurrent
                    ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 border-transparent shadow-lg shadow-cyan-950/15 ring-2 ring-cyan-400/40 font-bold"
                    : isCompleted
                    ? "bg-white/10 border border-white/20 text-slate-200 hover:border-white/30 hover:bg-white/15 shadow-md"
                    : "bg-[#111317]/40 border border-white/5 text-slate-500 opacity-50 hover:bg-[#111317]/50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4.5 min-w-0">
                    {/* Visual Icon matching the clean top-centered icons in reference screenshot */}
                    <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center border transition-colors ${
                      isCurrent
                        ? "bg-slate-950/10 text-slate-950 border-slate-950/15"
                        : isCompleted
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : "bg-slate-950/40 text-slate-500 border-white/5"
                    }`}>
                      {getLevelIcon(idx, isCurrent)}
                    </div>

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCurrent
                            ? "bg-slate-950/20 text-slate-900 font-bold"
                            : isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25"
                            : "bg-white/5 text-slate-450 border border-white/5"
                        }`}>
                          Day {milestone.dayNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-full shadow-xs border border-cyan-400/20">
                            {isHindi ? "सक्रिय" : "Active"}
                          </span>
                        )}
                      </div>
                      
                      <h4 className={`text-base sm:text-lg font-black mt-1 leading-snug tracking-tight ${
                        isCurrent ? "text-slate-950" : "text-white"
                      }`}>
                        {milestone.name}
                      </h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                        isCurrent ? "text-slate-900 font-bold" : "text-slate-350"
                      }`}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    } ${isCurrent ? "text-slate-950" : "text-slate-400"}`} />
                  </div>
                </div>

                {/* Smooth Expandable Dropdown Content - ZERO NESTED CARDS - High Visibility */}
                {isExpanded && (
                  <div className={`mt-5 pt-5 border-t space-y-5 animate-in slide-in-from-top-2 duration-300 ${
                    isCurrent ? "border-slate-950/20 text-slate-950" : "border-white/10 text-slate-200"
                  }`}>
                    {/* Dean's Note - Flat styling using a clean vertical left border block */}
                    <div className={`pl-4 border-l-2 ${
                      isCurrent ? "border-slate-950" : "border-cyan-400"
                    } space-y-1`}>
                      <span className={`block font-black uppercase text-[10px] sm:text-xs tracking-wider ${
                        isCurrent ? "text-slate-900/85" : "text-cyan-300"
                      }`}>
                        {isHindi ? "डीन की कोचिंग नोट" : "Dean's Coaching Note"}
                      </span>
                      <p className={`text-xs sm:text-sm italic leading-relaxed ${
                        isCurrent ? "font-bold text-slate-950" : "text-slate-200"
                      }`}>
                        "{milestone.encouragingNote}"
                      </p>
                    </div>

                    {/* Requirements checklist - Clear, bold list with zero nested backgrounds */}
                    <div className="space-y-2.5">
                      <span className={`block font-black uppercase text-[10px] sm:text-xs tracking-wider ${
                        isCurrent ? "text-slate-900/85" : "text-cyan-300"
                      }`}>
                        {isHindi ? "आवश्यक क्षमताएं" : "Required Capabilities"}
                      </span>
                      
                      <div className="space-y-2">
                        {milestone.expectedCapabilities.map((cap, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-3 text-xs sm:text-sm font-semibold leading-relaxed">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isCurrent ? "text-slate-950" : "text-emerald-400"
                            }`} />
                            <span className={isCurrent ? "text-slate-950 font-bold" : "text-slate-200"}>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
