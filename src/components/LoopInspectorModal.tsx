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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Logo size="sm" textColor="text-white" />
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  5-Stage Loop
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Observe → Understand → Connect → Act → Check • Active for {newHire.name} (Day {currentDay})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Step 1: OBSERVE */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                OBSERVE (Raw Multi-Signal Ingestion)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">3 Separate Signal Sources</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  1. Daily/Experience Signal
                </span>
                <p className="text-slate-800 font-medium italic">
                  "{dayRecord?.dailySignal?.rawText || "I know how to scan but I am still confused where products are."}"
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  2. Manager Signal
                </span>
                <div className="text-slate-800 font-medium">
                  State: <strong className="text-amber-800">{dayRecord?.managerSignal?.state || "Needs support"}</strong>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  Issue: {dayRecord?.managerSignal?.issueCategory || "Process / Aisle Navigation"}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  3. Work Signal
                </span>
                <div className="text-slate-800 font-medium">
                  Pick Rate: <strong>{dayRecord?.workSignal?.actualPickRate || 35}/hr</strong> (Target: {dayRecord?.workSignal?.targetPickRate || 50}/hr)
                </div>
                <div className="text-emerald-700 font-medium text-[11px] mt-0.5">
                  Accuracy: {dayRecord?.workSignal?.accuracyRate || 98}%
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: UNDERSTAND */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                UNDERSTAND (Structured Signal Extraction)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">NLP / AI Engine</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Issue</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dayRecord?.dailySignal?.issue || "Location navigation"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence Level</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dayRecord?.dailySignal?.confidence || "Low"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Possible Impact</span>
                <span className="font-bold text-amber-700 text-sm">
                  {dayRecord?.dailySignal?.possibleImpact || "Slow picking"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                <span className="font-bold text-slate-900 text-sm">
                  {dayRecord?.dailySignal?.category || "Environment"}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: CONNECT */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                CONNECT (Pattern Detection)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Pattern: {dayRecord?.identifiedPattern?.patternName || "Environmental/process familiarity issue"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <p className="text-slate-800 font-medium leading-relaxed">
                <strong>Why it is happening: </strong>
                {dayRecord?.identifiedPattern?.diagnosis ||
                  "New hire says they are confused + manager says they need frequent help + speed has stopped improving. System detects spatial dark store layout unfamiliarity, NOT lack of effort."}
              </p>
            </div>
          </div>

          {/* Step 4: ACT */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                ACT (Smallest Practical Recommendation)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Not a course / Not an LMS module
              </span>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                {dayRecord?.recommendedAction?.title ||
                  "Manager/buddy walkthrough of location navigation + short re-demonstration"}
              </h4>
              <p className="text-slate-700">
                {dayRecord?.recommendedAction?.description ||
                  "Pair with Senior Picker (Vikram) for a 15-minute floor walkthrough focusing on Aisles 4-8 rack codes."}
              </p>
              <div className="pt-2 flex items-center justify-between text-slate-600 font-medium border-t border-blue-100">
                <span>
                  Target Actor: <strong>{dayRecord?.recommendedAction?.targetActor || "Buddy (Senior Picker)"}</strong>
                </span>
                <span className="font-bold text-blue-800">
                  Step: {dayRecord?.recommendedAction?.smallestPracticalStep || "15-min floor walkthrough"}
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: CHECK */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  5
                </span>
                CHECK (Outcome Recorded & Situation Updated)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Result: {dayRecord?.actionOutcome?.improved ? dayRecord.actionOutcome.improved.toUpperCase() : "AWAITING CHECK"}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <p className="text-slate-800 font-medium">
                <strong>Did situation improve? </strong>
                {dayRecord?.actionOutcome?.notes ||
                  `Intervention scheduled. Once supervisor or buddy records check outcome, ${newHire.name.split(" ")[0]}'s ramp status is automatically updated.`}
              </p>
              <div className="mt-2 text-slate-600 flex items-center gap-3 font-semibold text-[11px]">
                <span>Updated Status: <strong className="text-slate-900">{dayRecord?.statusAtEnd || newHire.status}</strong></span>
                {dayRecord?.actionOutcome?.subsequentPickRate && (
                  <span className="text-emerald-700">
                    Pick Rate Recovered: {dayRecord.actionOutcome.subsequentPickRate} items/hr!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
          >
            Close Loop Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
