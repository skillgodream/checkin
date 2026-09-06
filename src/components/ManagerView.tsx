import React, { useState, useEffect } from "react";
import {
  NewHire,
  ManagerSignal,
  WorkSignal,
  ActionOutcome,
  ManagerIssueType,
} from "../types";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  User,
  Zap,
  Sparkles,
  Sliders,
  FileCheck2,
  ChevronRight,
} from "lucide-react";

interface ManagerViewProps {
  newHires: NewHire[];
  activeHireId: string;
  onSelectHire: (id: string) => void;
  currentDay: number;
  onManagerSignalSubmitted: (hireId: string, signal: ManagerSignal) => void;
  onWorkSignalUpdated: (hireId: string, workSignal: WorkSignal) => void;
  onActionOutcomeRecorded: (hireId: string, outcome: ActionOutcome) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  newHires,
  activeHireId,
  onSelectHire,
  currentDay,
  onManagerSignalSubmitted,
  onWorkSignalUpdated,
  onActionOutcomeRecorded,
}) => {
  const activeHire = newHires.find((h) => h.id === activeHireId) || newHires[0];

  // Find record for current day
  const currentRecord = activeHire.daysHistory.find((d) => d.dayNumber === currentDay) || {
    dayNumber: currentDay,
    date: `Day ${currentDay}`,
    workSignal: {
      dayNumber: currentDay,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 44,
      targetOrders: 65,
    },
    statusAtEnd: activeHire.status,
    statusReason: activeHire.statusReason,
  };

  // Manager 5-second fast input state
  const [managerState, setManagerState] = useState<"Doing well" | "Needs support" | "Struggling">(
    currentRecord.managerSignal?.state || "Needs support"
  );
  const [issueType, setIssueType] = useState<ManagerIssueType>(
    currentRecord.managerSignal?.issueCategory || "Process"
  );
  const [managerNote, setManagerNote] = useState(
    currentRecord.managerSignal?.notes ||
      (currentDay === 3 ? "Rahul asks for location help repeatedly on multi-aisle grocery orders." : "")
  );
  const [isSavingManagerSignal, setIsSavingManagerSignal] = useState(false);

  // Work Signal manual inputs
  const [targetRate, setTargetRate] = useState(currentRecord.workSignal.targetPickRate || 50);
  const [actualRate, setActualRate] = useState(currentRecord.workSignal.actualPickRate || 35);
  const [accuracyRate, setAccuracyRate] = useState(currentRecord.workSignal.accuracyRate || 98);
  const [isUpdatingWorkSignal, setIsUpdatingWorkSignal] = useState(false);

  // Action Check / Outcome state
  const [outcomeStatus, setOutcomeStatus] = useState<"yes" | "no" | "partial">("yes");
  const [outcomeNotes, setOutcomeNotes] = useState(
    `Buddy ${activeHire.buddy.split(" ")[0]} walked aisles with ${activeHire.name.split(" ")[0]}. Navigation improved and pick pace recovered.`
  );
  const [isRecordingOutcome, setIsRecordingOutcome] = useState(false);
  const [showOutcomeDrawer, setShowOutcomeDrawer] = useState(false);

  // Synchronize internal form fields when active employee or day changes
  useEffect(() => {
    setManagerState(
      currentRecord.managerSignal?.state || (activeHire.status === "Doing well" ? "Doing well" : "Needs support")
    );
    setIssueType(currentRecord.managerSignal?.issueCategory || "Process");
    setManagerNote(
      currentRecord.managerSignal?.notes ||
        (currentDay === 3 && activeHire.id === "nh-rahul-01"
          ? "Rahul asks for location help repeatedly on multi-aisle grocery orders."
          : "")
    );
    setTargetRate(currentRecord.workSignal.targetPickRate || 50);
    setActualRate(currentRecord.workSignal.actualPickRate || 35);
    setAccuracyRate(currentRecord.workSignal.accuracyRate || 98);
    setOutcomeStatus(currentRecord.actionOutcome?.improved || "yes");
    setOutcomeNotes(
      currentRecord.actionOutcome?.notes ||
        `Buddy ${activeHire.buddy.split(" ")[0]} walked aisles with ${activeHire.name.split(" ")[0]}. Navigation improved and pick pace recovered.`
    );
  }, [currentDay, activeHire.id, currentRecord.managerSignal, currentRecord.workSignal, currentRecord.actionOutcome]);

  const handleSaveManagerSignal = () => {
    setIsSavingManagerSignal(true);
    const signal: ManagerSignal = {
      id: `mgr-${Date.now()}`,
      dayNumber: currentDay,
      managerName: `${activeHire.supervisor.split(" ")[0]} (Shift Supervisor)`,
      state: managerState,
      issueCategory: managerState !== "Doing well" ? issueType : undefined,
      notes: managerNote,
      timestamp: "Just now",
    };
    onManagerSignalSubmitted(activeHire.id, signal);
    setTimeout(() => setIsSavingManagerSignal(false), 300);
  };

  const handleSaveWorkSignal = () => {
    setIsUpdatingWorkSignal(true);
    const workSignal: WorkSignal = {
      dayNumber: currentDay,
      targetPickRate: Number(targetRate),
      actualPickRate: Number(actualRate),
      accuracyRate: Number(accuracyRate),
      ordersCompleted: Math.round(Number(actualRate) * 1.2),
      targetOrders: Math.round(Number(targetRate) * 1.3),
      gapIdentified:
        Number(targetRate) - Number(actualRate) > 8
          ? `${Number(targetRate) - Number(actualRate)} picks/hr below expected ramp curve`
          : "Within expected ramp curve",
    };
    onWorkSignalUpdated(activeHire.id, workSignal);
    setTimeout(() => setIsUpdatingWorkSignal(false), 300);
  };

  const handleRecordOutcome = () => {
    setIsRecordingOutcome(true);
    const outcome: ActionOutcome = {
      id: `out-${Date.now()}`,
      actionId: currentRecord.recommendedAction?.id || "act-default",
      dayNumber: currentDay,
      performedBy: `${activeHire.supervisor.split(" ")[0]} (Supervisor) & ${activeHire.buddy.split(" ")[0]} (Buddy)`,
      performedAt: "Floor Check completed",
      improved: outcomeStatus,
      notes: outcomeNotes,
      subsequentPickRate:
        outcomeStatus === "yes"
          ? Math.max(48, Number(targetRate) - 2)
          : outcomeStatus === "partial"
          ? Math.max(Number(actualRate) + 5, 41)
          : Number(actualRate),
      subsequentAccuracy: outcomeStatus === "yes" ? 99 : 98,
    };
    onActionOutcomeRecorded(activeHire.id, outcome);
    setShowOutcomeDrawer(false);
    setTimeout(() => setIsRecordingOutcome(false), 300);
  };

  return (
    <div className="max-w-lg mx-auto pb-28 pt-4 px-3 sm:px-4 space-y-4">
      {/* Mobile Question Header: Which new hire needs my attention today? */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Shift Supervisor Console
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Which new hire needs attention today?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Synthesizes worker feedback, floor metrics, and observations to isolate real friction.
        </p>

        {/* Quick Triage Status Filter Pills */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="bg-amber-50 border border-amber-200/80 p-2 rounded-xl">
            <span className="text-[10px] font-semibold text-amber-700 block">Attention</span>
            <span className="text-sm font-bold text-amber-900">
              {newHires.filter((h) => h.status === "Needs attention").length} New Hire
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-200/80 p-2 rounded-xl">
            <span className="text-[10px] font-semibold text-rose-700 block">At Risk</span>
            <span className="text-sm font-bold text-rose-900">
              {newHires.filter((h) => h.status === "At risk").length} New Hire
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-xl">
            <span className="text-[10px] font-semibold text-emerald-700 block">Doing Well</span>
            <span className="text-sm font-bold text-emerald-900">
              {newHires.filter((h) => h.status === "Doing well").length} New Hires
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Mobile Carousel / Picker List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Floor Pickers ({newHires.length})
          </span>
          <span className="text-[11px] text-slate-400">Tap to inspect</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {newHires.map((hire) => {
            const isSelected = hire.id === activeHire.id;
            const hireRecord = hire.daysHistory.find((d) => d.dayNumber === currentDay) || hire.daysHistory[0];

            return (
              <button
                key={hire.id}
                id={`hire-chip-${hire.id}`}
                onClick={() => onSelectHire(hire.id)}
                className={`snap-start min-w-[210px] p-3 rounded-2xl border text-left transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white border-slate-200/80 text-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={hire.avatar}
                      alt={hire.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate leading-tight">{hire.name}</h4>
                      <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        Day {hire.currentDay}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                      hire.status === "Doing well"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : hire.status === "Needs attention"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {hire.status}
                  </span>
                </div>

                <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-slate-200" : "text-slate-600"}`}>
                  {hire.statusReason}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/30">
                  <span className={isSelected ? "text-slate-300" : "text-slate-500"}>
                    Picks: <strong>{hireRecord?.workSignal?.actualPickRate || 35}/h</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {hireRecord?.workSignal?.accuracyRate || 98}% Acc
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active New Hire Detailed Dossier */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
        {/* Profile row with Check Outcome action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img
              src={activeHire.avatar}
              alt={activeHire.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{activeHire.name}</h3>
                <span
                  className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    activeHire.status === "Doing well"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : activeHire.status === "Needs attention"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
                >
                  {activeHire.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Buddy: {activeHire.buddy.split(" ")[0]} • Supervisor: {activeHire.supervisor.split(" ")[0]}
              </p>
            </div>
          </div>

          <button
            id="open-check-outcome-btn"
            onClick={() => setShowOutcomeDrawer(!showOutcomeDrawer)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Check</span>
          </button>
        </div>

        {/* 3. Pattern Detection Synthesis Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Pattern Detection (Synthesis)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-blue-100 text-blue-800">
              {currentRecord.identifiedPattern?.patternConfidence || "High"} Confidence
            </span>
          </div>

          <h4 className="text-xs font-bold text-slate-900">
            {currentRecord.identifiedPattern?.patternName || "Layout Familiarity Bottleneck"}
          </h4>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            {currentRecord.identifiedPattern?.diagnosis ||
              "Rahul is experiencing dark store rack navigation friction in Aisles 4-8. High accuracy (98%) indicates strong care, but location searches slow down pick pace."}
          </p>

          {/* Connected Signals Mini Chips */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
            <div className="text-slate-700">
              <strong className="text-slate-900">🗣️ Worker:</strong> "{currentRecord.dailySignal?.rawText || "Confused where products are"}"
            </div>
            <div className="text-slate-700">
              <strong className="text-slate-900">👔 Manager:</strong> {currentRecord.managerSignal?.state || "Needs support"} ({currentRecord.managerSignal?.issueCategory || "Process"})
            </div>
            <div className="text-slate-700">
              <strong className="text-slate-900">📊 Work:</strong> {currentRecord.workSignal.actualPickRate}/hr (Target {currentRecord.workSignal.targetPickRate}/hr), Accuracy {currentRecord.workSignal.accuracyRate}%
            </div>
          </div>
        </div>

        {/* 4. Smallest Practical Action Card */}
        {currentRecord.recommendedAction && (
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Smallest Practical Action
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white text-blue-700 border border-blue-200">
                For: {currentRecord.recommendedAction.targetActor}
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-900">
              {currentRecord.recommendedAction.title}
            </h4>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentRecord.recommendedAction.description}
            </p>

            <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">
                Step: <strong>{currentRecord.recommendedAction.smallestPracticalStep}</strong>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                  currentRecord.recommendedAction.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {currentRecord.recommendedAction.status.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Action Outcome Banner if recorded */}
        {currentRecord.actionOutcome && (
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Check Result (Loop Closed)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-white text-emerald-800 border border-emerald-200">
                {currentRecord.actionOutcome.improved.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              "{currentRecord.actionOutcome.notes}"
            </p>
            {currentRecord.actionOutcome.subsequentPickRate && (
              <p className="text-[11px] font-bold text-emerald-800 mt-1">
                ⚡ Pick pace recovered to {currentRecord.actionOutcome.subsequentPickRate} items/hr!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Outcome Check Drawer/Modal */}
      {showOutcomeDrawer && (
        <div className="bg-white rounded-2xl border-2 border-blue-500 p-4 shadow-md text-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Did the situation improve after the intervention?
            </h4>
            <button
              onClick={() => setShowOutcomeDrawer(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(["yes", "partial", "no"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOutcomeStatus(st)}
                className={`py-2 px-1 rounded-xl text-center font-bold text-xs cursor-pointer transition-all ${
                  outcomeStatus === st
                    ? st === "yes"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : st === "partial"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-rose-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {st === "yes" ? "Yes (Improved)" : st === "partial" ? "Partial" : "No (Stalled)"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Floor Observation Notes:
            </label>
            <textarea
              id="outcome-notes-input"
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowOutcomeDrawer(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-outcome-btn"
              onClick={handleRecordOutcome}
              disabled={isRecordingOutcome}
              className="px-4 py-1.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold cursor-pointer transition-colors shadow-2xs"
            >
              {isRecordingOutcome ? "Saving..." : "Save Outcome"}
            </button>
          </div>
        </div>
      )}

      {/* 5-Second Supervisor Floor Check-in */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs text-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            Manager 5-Second Observation
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Single-tap evaluation</span>
        </div>

        {/* 3 Large Touch State Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["Doing well", "Needs support", "Struggling"] as const).map((st) => (
            <button
              key={st}
              id={`mgr-state-${st.toLowerCase().replace(" ", "-")}`}
              onClick={() => setManagerState(st)}
              className={`py-2.5 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                managerState === st
                  ? st === "Doing well"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : st === "Needs support"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-rose-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Issue Category Chips */}
        {managerState !== "Doing well" && (
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Issue Category:
            </span>
            <div className="flex flex-wrap gap-1">
              {(["Speed", "Accuracy", "Process", "Tool", "Confidence"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setIssueType(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                    issueType === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Floor Note */}
        <div>
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Floor Observation Note:
          </span>
          <input
            id="mgr-note-input"
            type="text"
            value={managerNote}
            onChange={(e) => setManagerNote(e.target.value)}
            placeholder="e.g. Needs help locating items in Aisles 4-8"
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          id="submit-mgr-signal-btn"
          onClick={handleSaveManagerSignal}
          disabled={isSavingManagerSignal}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-2xs"
        >
          {isSavingManagerSignal ? "Synthesizing signals..." : "Save Observation & Re-evaluate"}
        </button>
      </div>

      {/* Manual Shift Work Signal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs text-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            Shift Performance Metrics
          </h4>
          <span className="text-[10px] text-slate-400">Picks/hour & accuracy</span>
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-700 font-medium text-[11px]">
            <span>Current Pick Rate:</span>
            <span className="font-bold text-slate-900">{actualRate} items/hr (Target {targetRate})</span>
          </div>
          <input
            type="range"
            min={15}
            max={70}
            value={actualRate}
            onChange={(e) => setActualRate(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 text-slate-700 font-medium text-[11px]">
            <span>Pick Accuracy:</span>
            <span className="font-bold text-emerald-700">{accuracyRate}% (Target 98%)</span>
          </div>
          <input
            type="range"
            min={80}
            max={100}
            value={accuracyRate}
            onChange={(e) => setAccuracyRate(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <button
          id="update-work-signal-btn"
          onClick={handleSaveWorkSignal}
          disabled={isUpdatingWorkSignal}
          className="w-full py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          {isUpdatingWorkSignal ? "Recalculating..." : "Update Performance Metrics"}
        </button>
      </div>
    </div>
  );
};
