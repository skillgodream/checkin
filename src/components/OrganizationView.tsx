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
    <div className="max-w-lg mx-auto pb-28 pt-4 px-3 sm:px-4 space-y-4">
      {/* Mobile Organization Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {summary.name} • {summary.storeName}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Store Ramp Operations
            </h2>
          </div>

          <button
            onClick={onOpenLoopModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Loop Flow</span>
          </button>
        </div>

        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-medium block">Total New Hires</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900">{newHires.length}</span>
              <span className="text-[10px] text-slate-500">Pickers</span>
            </div>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80">
            <span className="text-[10px] text-emerald-800 font-semibold block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Doing Well
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-950">{doingWellCount}</span>
              <span className="text-[10px] text-emerald-700">On curve</span>
            </div>
          </div>

          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
            <span className="text-[10px] text-amber-800 font-semibold block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Needs Attention
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-amber-950">{needsAttentionCount}</span>
              <span className="text-[10px] text-amber-700">Pending</span>
            </div>
          </div>

          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200/80">
            <span className="text-[10px] text-rose-800 font-semibold block flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-rose-600" />
              At Risk
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-rose-950">{atRiskCount}</span>
              <span className="text-[10px] text-rose-700">Action</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Loop Flow Mobile Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            Central Intelligence Loop
          </span>
          <span className="text-[10px] text-slate-400">14-Day Loop</span>
        </div>

        {/* Scrollable / Stacked 5 Steps */}
        <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-lg">
            <span className="font-bold text-blue-400 block text-[9px]">1. OBSERVE</span>
            <span className="text-slate-300 text-[8px] leading-tight block mt-0.5">Worker & stats</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-lg">
            <span className="font-bold text-blue-400 block text-[9px]">2. UNDERSTAND</span>
            <span className="text-slate-300 text-[8px] leading-tight block mt-0.5">Structured</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-lg">
            <span className="font-bold text-blue-400 block text-[9px]">3. CONNECT</span>
            <span className="text-slate-300 text-[8px] leading-tight block mt-0.5">Synthesis</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-lg">
            <span className="font-bold text-blue-400 block text-[9px]">4. ACT</span>
            <span className="text-slate-300 text-[8px] leading-tight block mt-0.5">Smallest step</span>
          </div>
          <div className="bg-slate-800/90 border border-slate-700/80 p-1.5 rounded-lg">
            <span className="font-bold text-blue-400 block text-[9px]">5. CHECK</span>
            <span className="text-slate-300 text-[8px] leading-tight block mt-0.5">Outcome</span>
          </div>
        </div>
      </div>

      {/* Urgent Attention Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            Pickers Needing Attention Today
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Sorted by urgency</span>
        </div>

        <div className="space-y-2">
          {newHires
            .filter((h) => h.status !== "Doing well")
            .map((hire) => (
              <div
                key={hire.id}
                onClick={() => onSelectHireForManager(hire.id)}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={hire.avatar}
                      alt={hire.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{hire.name}</h4>
                      <span className="text-[10px] text-slate-500">Day {hire.currentDay} of 14</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      hire.status === "Needs attention"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {hire.status}
                  </span>
                </div>

                <div className="mt-1.5 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-900">Why: </span>
                  {hire.statusReason}
                </div>

                {hire.recommendedActionSnippet && (
                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[11px]">
                    <span className="text-blue-700 font-semibold line-clamp-1">
                      👉 Action: {hire.recommendedActionSnippet}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Common Dark Store Friction Points */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Common Dark Store Friction Points (Aggregated)
        </h3>
        <div className="space-y-2">
          {summary.commonProblems.map((prob, i) => (
            <div
              key={i}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-900 text-[11px]">{prob.problem}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-bold">
                  {prob.count} pickers
                </span>
              </div>
              <p className="text-slate-600 text-[10px]">{prob.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Network Patterns */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Emerging Store Patterns
        </h3>
        <div className="space-y-2">
          {summary.emergingPatterns.map((pat, i) => (
            <div
              key={i}
              className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-100 text-xs"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-blue-950 text-[11px]">{pat.pattern}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white border border-blue-200 text-blue-800 text-[9px] font-bold">
                  {pat.impactedCount} active
                </span>
              </div>
              <p className="text-slate-600 text-[10px]">{pat.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
