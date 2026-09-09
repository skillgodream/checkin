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
  onNavigateToSection,
  onOpenTodaysGoal,
}) => {
  const activeHire = newHires.find((h) => h.id === activeHireId) || newHires[0];
  const learnerDay = activeHire.currentDay;
  const modulesCompleted = activeHire.modulesCompleted ?? 3;
  const isBehind = activeHire.status === "At risk" || activeHire.status === "Needs attention" || modulesCompleted < learnerDay - 1;

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
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-28 select-none animate-in fade-in duration-200">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none">
          <Trophy className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-wide border border-white/30">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Shift Day {learnerDay} of 10 • Pro Picker Track</span>
            </div>
            {onBackToManager && (
              <button
                onClick={onBackToManager}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isLearnerMode ? "My 10-Day Pro Roadmap" : `${activeHire.name.split(" ")[0]}'s Journey`}
            </h1>
            <p className="text-xs text-violet-100 font-medium mt-0.5 leading-relaxed">
              {isBehind
                ? "Dean has intelligently redistributed your remaining learning plan to help you catch up comfortably."
                : "Your personalized path to full certification, guided step-by-step by Dean."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MANAGER COHORT SELECTOR (If Manager Mode) */}
      {!isLearnerMode && (
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Team Member</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {newHires.map((hire) => {
              const isSelected = hire.id === activeHire.id;
              return (
                <button
                  key={hire.id}
                  onClick={() => onSelectHire(hire.id)}
                  className={`snap-start min-w-[160px] p-2.5 rounded-2xl border text-left transition-all cursor-pointer shrink-0 shadow-2xs ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-slate-800 hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={hire.avatar} alt={hire.name} className="w-7 h-7 rounded-full object-cover border" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate leading-tight">{hire.name}</h4>
                      <span className={`text-[10px] block truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
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

      {/* 3. WHERE I STAND VS IDEAL (RECOVERY STANDING CARD) */}
      <div className={`rounded-3xl p-4 border shadow-sm space-y-3 ${isBehind ? "bg-amber-50/80 border-amber-200 text-amber-950" : "bg-white border-slate-200 text-slate-900"}`}>
        <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${isBehind ? "bg-amber-200 text-amber-900" : "bg-violet-100 text-violet-700"}`}>
              {isBehind ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">My Standing vs Pro Target</h3>
              <p className="text-[10px] opacity-75 font-medium">Shift Day {learnerDay} Status Check</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isBehind ? "bg-amber-500 text-slate-950" : "bg-emerald-100 text-emerald-800"}`}>
            {isBehind ? "Catch-Up Mode Active" : "On Track"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/80 border border-black/5">
            <span className="block text-[10px] font-bold uppercase opacity-60 mb-0.5">IDEAL PACE</span>
            <span className="font-black">Module {learnerDay} Completed</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/80 border border-black/5">
            <span className="block text-[10px] font-bold uppercase opacity-60 mb-0.5">YOUR STANDING</span>
            <span className={`font-black ${isBehind ? "text-amber-800" : "text-emerald-800"}`}>
              {modulesCompleted} Modules Done
            </span>
          </div>
        </div>

        {isBehind && (
          <p className="text-[11px] font-medium leading-relaxed bg-amber-100/70 p-2.5 rounded-2xl border border-amber-200">
            <strong>Dean's Regenerative Note:</strong> You are slightly behind due to aisle navigation friction on Day 3. Dean has automatically redistributed your catch-up tasks across today and tomorrow so you don't feel overwhelmed.
          </p>
        )}
      </div>

      {/* 4. ACTIONABLE MICRO-CARDS (3-4 TAPPABLE TASKS FOR TODAY) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Dean's Daily Action Plan</h3>
            <p className="text-[10px] text-slate-500 font-medium">Tap any task below to complete and get back on track</p>
          </div>
          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
            3 Actions
          </span>
        </div>

        <div className="space-y-2.5 pt-0.5">
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
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-violet-50/70 border border-slate-200 hover:border-violet-200 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-98 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-violet-300">
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100/80 px-2 py-0.2 rounded-full">
                      {action.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{action.duration}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 mt-0.5 truncate group-hover:text-violet-950">
                    {idx + 1}. {action.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{action.desc}</p>
                </div>
              </div>
              <div className="p-1.5 rounded-full bg-white text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-100 shrink-0 border border-slate-200 group-hover:border-violet-200 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. VISUAL 5-LEVEL PROGRESS ROADMAP (EXPANDABLE) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">Your 5 Certification Levels</span>
            <p className="text-[10px] text-slate-400 font-medium">Tap any level to view complete expectations</p>
          </div>
          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
            Day {learnerDay} Active
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {CANONICAL_MILESTONES.map((milestone, idx) => {
            const isCompleted = learnerDay > milestone.dayNumber;
            const isCurrent = learnerDay <= milestone.dayNumber && (idx === 0 || learnerDay > CANONICAL_MILESTONES[idx - 1].dayNumber);
            const isExpanded = expandedLevel === milestone.dayNumber;

            return (
              <div
                key={milestone.dayNumber}
                onClick={() => setExpandedLevel(isExpanded ? null : milestone.dayNumber)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-200"
                    : isCompleted
                    ? "bg-emerald-50/80 border-emerald-200 text-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                        isCurrent
                          ? "bg-white text-violet-700 shadow-sm"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `L${idx + 1}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black truncate ${isCurrent ? "text-white" : "text-slate-900"}`}>
                          {milestone.name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? "bg-white/25 text-white"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          Day {milestone.dayNumber}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isCurrent ? "text-violet-100" : "text-slate-500"}`}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-white text-violet-700 text-[10px] font-black uppercase tracking-wider shadow-xs">
                        Current
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <span>Unlocked</span>
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} ${isCurrent ? "text-white" : "text-slate-400"}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t space-y-2.5 text-xs animate-in fade-in duration-200 ${isCurrent ? "border-violet-500/50 text-violet-50" : "border-slate-200 text-slate-700"}`}>
                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 space-y-1">
                      <span className="block font-black uppercase text-[10px] tracking-wider opacity-80">Dean's Coaching Note</span>
                      <p className="text-[11px] italic">"{milestone.encouragingNote}"</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block font-black uppercase text-[10px] tracking-wider opacity-80">Required Capabilities</span>
                      {milestone.expectedCapabilities.map((cap, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-violet-200" : "text-emerald-600"}`} />
                          <span>{cap}</span>
                        </div>
                      ))}
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
