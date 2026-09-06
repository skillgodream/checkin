import React from "react";
import { OrganizationSummary, NewHire } from "../types";
import {
  Users,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Zap,
  Activity,
  ChevronRight,
  Store,
  Layers,
  Sparkles,
  Target,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface OrganizationViewProps {
  summary: OrganizationSummary;
  newHires: NewHire[];
  onSelectHireForManager: (hireId: string) => void;
  onOpenLoopModal: () => void;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({
  summary,
  newHires,
  onSelectHireForManager,
  onOpenLoopModal,
}) => {
  const doingWellCount = newHires.filter((h) => h.status === "Doing well").length;
  const needsAttentionCount = newHires.filter((h) => h.status === "Needs attention").length;
  const atRiskCount = newHires.filter((h) => h.status === "At risk").length;

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-28 select-none">
      {/* ========================================================= */}
      {/* 1. TOP GREETING HEADER (Matches Unified App Style)        */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Store Operations</span>
            <span className="text-lg">🏬</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {summary.storeName} • 14-Day Ramp Cohort
          </p>
        </div>

        {/* 5-Stage Loop Flow Action Pill */}
        <button
          onClick={onOpenLoopModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Loop Flow</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO STATUS CARD (Ops Health & Cohort Velocity)       */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/15 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/15 text-white backdrop-blur-xs">
              Cohort Ramp Velocity
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              92% Retention Target
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black leading-snug tracking-tight">
              Dark Store #104 Ramp Health
            </h2>
            <p className="text-xs sm:text-sm font-normal text-white/90 leading-relaxed mt-1">
              Early signal synthesis has reduced ramp-drop by catching aisle navigation bottlenecks on Day 3 before shift burnout.
            </p>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white/95">
            <span>Store Avg Accuracy: 98.4%</span>
            <span className="text-[11px] font-medium text-white/80">
              Active Pickers: {newHires.length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 2x2 CHUNKY SQUIRCLE METRIC GRID (Unified Design)       */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cohort Breakdown
          </span>
          <span className="text-[11px] text-slate-400">Live floor census</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Tile 1: Total New Hires (Blue) */}
          <div className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-none">
                {newHires.length}
              </span>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                Total Floor Pickers
              </span>
            </div>
          </div>

          {/* Tile 2: Doing Well (Emerald) */}
          <div className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-600 block leading-none">
                {doingWellCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                On Expected Ramp
              </span>
            </div>
          </div>

          {/* Tile 3: Needs Attention (Amber) */}
          <div className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-amber-600 block leading-none">
                {needsAttentionCount}
              </span>
              <span className="text-[11px] text-amber-700 font-bold mt-1 block">
                Floor Support Assigned
              </span>
            </div>
          </div>

          {/* Tile 4: At Risk (Rose) */}
          <div className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs mb-3">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-rose-600 block leading-none">
                {atRiskCount}
              </span>
              <span className="text-[11px] text-rose-700 font-bold mt-1 block">
                Urgent Attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. PICKERS NEEDING ATTENTION (Chunky Squircle Cards)       */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pickers Needing Attention Today
          </span>
          <span className="text-[11px] text-slate-400">Sorted by urgency</span>
        </div>

        <div className="space-y-2.5">
          {newHires
            .filter((h) => h.status !== "Doing well")
            .map((hire) => (
              <div
                key={hire.id}
                onClick={() => onSelectHireForManager(hire.id)}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={hire.avatar}
                      alt={hire.name}
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-slate-200 shrink-0 group-hover:border-blue-500 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {hire.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Day {hire.currentDay} of 14 • Buddy: {hire.buddy.split(" ")[0]}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                      hire.status === "Needs attention"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {hire.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Diagnosis: </strong>
                  {hire.statusReason}
                </p>

                {hire.recommendedActionSnippet && (
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-blue-700 font-bold line-clamp-1">
                      👉 {hire.recommendedActionSnippet}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 flex items-center gap-0.5 shrink-0">
                      Triage <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. 5-STAGE CENTRAL LOOP STRIP                             */}
      {/* ========================================================= */}
      <div
        onClick={onOpenLoopModal}
        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs cursor-pointer hover:border-indigo-400 transition-all active:scale-98"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Continuous Coordination Loop
              </h3>
              <p className="text-[10px] text-slate-400">Observe → Understand → Connect → Act → Check</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
            View Flow <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { step: "1", title: "Observe", color: "bg-blue-50 text-blue-800 border-blue-200" },
            { step: "2", title: "Understand", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
            { step: "3", title: "Connect", color: "bg-purple-50 text-purple-800 border-purple-200" },
            { step: "4", title: "Act", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { step: "5", title: "Check", color: "bg-teal-50 text-teal-800 border-teal-200" },
          ].map((s) => (
            <div key={s.step} className={`p-2 rounded-2xl border ${s.color}`}>
              <span className="text-[9px] font-black block">{s.step}</span>
              <span className="text-[10px] font-bold block truncate">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. COMMON DARK STORE FRICTION POINTS (2x2 Grid)           */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Aggregated Store Friction
          </span>
          <span className="text-[11px] text-slate-400">Store #104 bottlenecks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {summary.commonProblems.map((prob, i) => (
            <div
              key={i}
              className="p-3.5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                  {prob.problem}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {prob.count} pickers
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {prob.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
