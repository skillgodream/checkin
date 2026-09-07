import React from "react";
import { NewHire } from "../types";
import { Logo } from "./Logo";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  User,
  ShieldCheck,
  FileCheck2,
  Sliders,
  X,
  Eye,
  Brain,
  Link,
  Target,
} from "lucide-react";

interface LoopInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  newHire: NewHire;
  currentDay: number;
}

export const LoopInspectorModal: React.FC<LoopInspectorModalProps> = ({
  isOpen,
  onClose,
  newHire,
  currentDay,
}) => {
  if (!isOpen) return null;

  const dayRecord =
    newHire.daysHistory.find((d) => d.dayNumber === currentDay) ||
    newHire.daysHistory[newHire.daysHistory.length - 1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Logo size="sm" textColor="text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Continuous Loop
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Observe → Understand → Connect → Decide → Act → Check • {newHire.name} (Day {currentDay})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 6 Steps as Chunky Squircles */}
        <div className="p-4 sm:p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: OBSERVE */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </div>
                <span>OBSERVE (Raw Multi-Signal Ingestion)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold">3 Separate Signals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  1. Spoken Signal
                </span>
                <p className="text-slate-800 font-medium italic">
                  "{dayRecord?.dailySignal?.rawText || "Confused where products are located in Aisles 4-8."}"
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  2. Manager Signal
                </span>
                <div className="text-slate-800 font-medium">
                  State: <strong className="text-amber-800">{dayRecord?.managerSignal?.state || "Needs support"}</strong>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {dayRecord?.managerSignal?.issueCategory || "Process Navigation"}
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  3. Work Signal
                </span>
                <div className="text-slate-800 font-medium">
                  Pick Rate: <strong>{dayRecord?.workSignal?.actualPickRate || 35}/hr</strong>
                </div>
                <div className="text-emerald-700 font-bold text-[11px] mt-0.5">
                  Accuracy: {dayRecord?.workSignal?.accuracyRate || 98}%
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: UNDERSTAND */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </div>
                <span>UNDERSTAND (Root Cause Diagnosis & Signal Extraction)</span>
              </span>
              <span className="text-[11px] text-indigo-700 font-bold">NLP Engine</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Issue</span>
                <span className="font-bold text-slate-900 text-xs">
                  {dayRecord?.dailySignal?.issue || "Rack navigation"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
                <span className="font-bold text-slate-900 text-xs">
                  {dayRecord?.dailySignal?.confidence || "High"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Impact</span>
                <span className="font-bold text-amber-700 text-xs">
                  {dayRecord?.dailySignal?.possibleImpact || "Slow picking pace"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-bold text-slate-900 text-xs">
                  {dayRecord?.dailySignal?.category || "Environment"}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: CONNECT */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </div>
                <span>CONNECT (Capability Graph & Prerequisite Mapping)</span>
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {dayRecord?.identifiedPattern?.patternName || "Layout Familiarity"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
              <p className="text-slate-800 font-medium leading-relaxed">
                <strong className="text-purple-950">Why it is happening: </strong>
                {dayRecord?.identifiedPattern?.diagnosis ||
                  "New hire reports spatial confusion in Aisles 4-8. Accuracy remains high (98%), confirming strong diligence. System links friction to Capability 3 (Location Navigation) rather than a motivation problem."}
              </p>
            </div>
          </div>

          {/* Step 4: DECIDE */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                  4
                </div>
                <span>DECIDE (Adaptive Gear Shift Selection)</span>
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                {dayRecord?.recommendedAction?.decisionType ? dayRecord.recommendedAction.decisionType.replace(/_/g, " ") : "REINFORCE CURRENT"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Selected Path Decision:</span>
                <span className="font-black text-amber-800">
                  Target Capability #{dayRecord?.recommendedAction?.targetCapabilityId || 3}
                </span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                <strong className="text-amber-950">Adaptive Rationale: </strong>
                {dayRecord?.recommendedAction?.rationale ||
                  "Worker was exposed to aisle numbering, but real-world floor navigation is inconsistent. Intelligence chooses targeted floor reinforcement rather than generic advancement."}
              </p>
            </div>
          </div>

          {/* Step 5: ACT */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  5
                </div>
                <span>ACT (Smallest Practical Action)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                Floor Intervention
              </span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                  {dayRecord?.recommendedAction?.title ||
                    "Buddy walkthrough of location navigation in Aisles 4-8"}
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {dayRecord?.recommendedAction?.urgency || "Next Shift"}
                </span>
              </div>
              <p className="text-emerald-900">
                {dayRecord?.recommendedAction?.description ||
                  "Pair with Senior Picker (Vikram) for a 15-minute floor walkthrough focusing on Aisles 4-8 rack codes."}
              </p>
              <div className="pt-2 flex items-center justify-between text-emerald-800 font-bold border-t border-emerald-200">
                <span>
                  Actor: {dayRecord?.recommendedAction?.targetActor || "Buddy Vikram"}
                </span>
                <span className="text-emerald-900">
                  Step: {dayRecord?.recommendedAction?.smallestPracticalStep || "15-min walkthrough"}
                </span>
              </div>
            </div>
          </div>

          {/* Step 6: CHECK */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-teal-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                  6
                </div>
                <span>CHECK (Outcome Recorded & Loop Closed)</span>
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {dayRecord?.actionOutcome?.improved ? dayRecord.actionOutcome.improved.toUpperCase() : "AWAITING CHECK"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs space-y-1.5">
              <p className="text-slate-800 font-medium">
                <strong>Did situation improve? </strong>
                {dayRecord?.actionOutcome?.notes ||
                  `Intervention scheduled. Once supervisor or buddy records check outcome, ${newHire.name.split(" ")[0]}'s capability ledger and ramp status are automatically updated.`}
              </p>
              <div className="text-slate-600 flex items-center gap-3 font-bold text-[11px] pt-1">
                <span>Updated Status: <strong className="text-slate-900">{dayRecord?.statusAtEnd || newHire.status}</strong></span>
                {dayRecord?.actionOutcome?.subsequentPickRate && (
                  <span className="text-emerald-700">
                    Pick Pace: {dayRecord.actionOutcome.subsequentPickRate} items/hr!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Close Loop Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
