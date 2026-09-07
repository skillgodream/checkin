import React, { useState } from "react";
import {
  FileSpreadsheet,
  Send,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  X,
  Play,
  ArrowRight,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  GoogleFormFeedPayload,
  DEMO_FEED_PRESETS,
  adaptGoogleFormFeedRow,
} from "../services/googleFormFeedAdapter";
import { NewHire } from "../types";

interface GoogleFormFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  newHires: NewHire[];
  onIngestFeed: (payload: GoogleFormFeedPayload) => void;
  isHindi?: boolean;
}

export const GoogleFormFeedModal: React.FC<GoogleFormFeedModalProps> = ({
  isOpen,
  onClose,
  newHires,
  onIngestFeed,
  isHindi = false,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("scenario-a-friction");
  const [formData, setFormData] = useState<GoogleFormFeedPayload>(() => DEMO_FEED_PRESETS[0].payload);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"preset" | "form" | "sheet_csv">("preset");
  const [csvText, setCsvText] = useState<string>("");

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = DEMO_FEED_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.payload);
    }
  };

  const handleFieldChange = (field: keyof GoogleFormFeedPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onIngestFeed(formData);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1100);
  };

  const handleCsvImport = () => {
    if (!csvText.trim()) return;
    // Split lines
    const lines = csvText.trim().split("\n");
    const lastRow = lines[lines.length - 1];
    const cols = lastRow.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length >= 6) {
      const parsed: GoogleFormFeedPayload = {
        newHireNameOrId: cols[0] || "Rahul Verma",
        dayOfRamp: Number(cols[1]) || 3,
        shiftActualPickRate: Number(cols[2]) || 35,
        shiftTargetPickRate: Number(cols[3]) || 50,
        scanningAccuracyPercent: Number(cols[4]) || 98,
        ordersCompleted: Number(cols[5]) || 44,
        helpRequests: Number(cols[6]) || 0,
        learnerVoiceShiftLog: cols[7] || "Imported from Sheet row",
        learnerConfidence: cols[8] || "Medium",
        supervisorObservationState: cols[9] || "Needs support",
        supervisorObservedCategory: cols[10] || "Speed",
        supervisorFloorNotes: cols[11] || "",
      };
      setFormData(parsed);
      onIngestFeed(parsed);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1100);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Client Demo Work-Signal Feed</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-emerald-950">
                  Google Sheet Ingestor
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-normal">
                Feeds raw operational telemetry into existing <code className="font-mono text-[11px] bg-emerald-900/50 px-1 py-0.5 rounded">executeCoordinationLoop()</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("preset")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "preset"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scenario Presets (A vs B)</span>
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "form"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>12-Field Live Form</span>
          </button>
          <button
            onClick={() => setActiveTab("sheet_csv")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "sheet_csv"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sheet CSV Paste</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PRESETS (Instantly demonstrate Scenario A vs Scenario B) */}
          {activeTab === "preset" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Dynamic Intelligence Proof: </span>
                  Select <strong>Scenario A</strong> (friction) to see the engine prescribe floor buddy navigation support, then trigger <strong>Scenario B</strong> (recovery) to verify the SAME engine reduces support automatically.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_FEED_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-black text-xs text-slate-900">{preset.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              preset.id.includes("recovery")
                                ? "bg-emerald-100 text-emerald-800"
                                : preset.id.includes("friction")
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{preset.description}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Pick: {preset.payload.shiftActualPickRate}/{preset.payload.shiftTargetPickRate}</span>
                        <span>Acc: {preset.payload.scanningAccuracyPercent}%</span>
                        <span>Help: {preset.payload.helpRequests}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Payload Preview */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Prepared Feed Record (12 Raw Fields)</span>
                  <span className="text-[10px] font-mono text-emerald-400">Target: {formData.newHireNameOrId} • Day {formData.dayOfRamp}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-800 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[9px]">ACTUAL PICK</span>
                    <span className="text-amber-300 font-bold">{formData.shiftActualPickRate} /hr</span>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[9px]">TARGET PICK</span>
                    <span className="text-white font-bold">{formData.shiftTargetPickRate} /hr</span>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[9px]">ACCURACY</span>
                    <span className="text-emerald-300 font-bold">{formData.scanningAccuracyPercent}%</span>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[9px]">HELP REQ</span>
                    <span className="text-rose-300 font-bold">{formData.helpRequests}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 pt-1">
                  <span className="text-slate-400 font-semibold">Learner Voice: </span>
                  "{formData.learnerVoiceShiftLog}"
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-400 font-semibold">Supervisor: </span>
                  [{formData.supervisorObservationState}] {formData.supervisorFloorNotes}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 12-FIELD EDITABLE FORM */}
          {activeTab === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. New Hire */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. New Hire</label>
                  <select
                    value={formData.newHireNameOrId}
                    onChange={(e) => handleFieldChange("newHireNameOrId", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {newHires.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} ({h.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Day of Ramp */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Day of Ramp (1-14)</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={formData.dayOfRamp}
                    onChange={(e) => handleFieldChange("dayOfRamp", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 3. Shift Actual Pick Rate */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Shift Actual Pick Rate (UPH)</label>
                  <input
                    type="number"
                    value={formData.shiftActualPickRate}
                    onChange={(e) => handleFieldChange("shiftActualPickRate", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 4. Shift Target Pick Rate */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Shift Target Pick Rate (UPH)</label>
                  <input
                    type="number"
                    value={formData.shiftTargetPickRate}
                    onChange={(e) => handleFieldChange("shiftTargetPickRate", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 5. Scanning Accuracy % */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Scanning Accuracy %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.scanningAccuracyPercent}
                    onChange={(e) => handleFieldChange("scanningAccuracyPercent", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 6. Orders Completed */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Orders Completed</label>
                  <input
                    type="number"
                    value={formData.ordersCompleted}
                    onChange={(e) => handleFieldChange("ordersCompleted", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 7. Help Requests */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">7. Help Requests</label>
                  <input
                    type="number"
                    value={formData.helpRequests}
                    onChange={(e) => handleFieldChange("helpRequests", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 9. Learner Confidence */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">9. Learner Confidence</label>
                  <select
                    value={formData.learnerConfidence || "Medium"}
                    onChange={(e) => handleFieldChange("learnerConfidence", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* 8. Learner Voice / Daily Shift Log */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">8. Learner Voice / Daily Shift Log</label>
                <textarea
                  rows={2}
                  value={formData.learnerVoiceShiftLog}
                  onChange={(e) => handleFieldChange("learnerVoiceShiftLog", e.target.value)}
                  placeholder="e.g. Hard to find items in aisle 6..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 10. Supervisor Observation State */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">10. Supervisor Observation State</label>
                  <select
                    value={formData.supervisorObservationState || "Needs support"}
                    onChange={(e) => handleFieldChange("supervisorObservationState", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Doing well">Doing well</option>
                    <option value="Needs support">Needs support</option>
                    <option value="Struggling">Struggling</option>
                  </select>
                </div>

                {/* 11. Supervisor Observed Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">11. Supervisor Observed Category</label>
                  <select
                    value={formData.supervisorObservedCategory || "Speed"}
                    onChange={(e) => handleFieldChange("supervisorObservedCategory", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Speed">Speed</option>
                    <option value="Accuracy">Accuracy</option>
                    <option value="Process">Process</option>
                    <option value="Tool">Tool</option>
                    <option value="Confidence">Confidence</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 12. Supervisor Floor Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">12. Supervisor Floor Notes</label>
                <textarea
                  rows={2}
                  value={formData.supervisorFloorNotes || ""}
                  onChange={(e) => handleFieldChange("supervisorFloorNotes", e.target.value)}
                  placeholder="e.g. Needed constant help locating rack bins..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </form>
          )}

          {/* TAB 3: CSV ROW INGESTOR */}
          {activeTab === "sheet_csv" && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Paste a comma-separated row exported from your Google Sheet (Columns: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">Name, Day, ActualPick, TargetPick, Accuracy, Orders, HelpReqs, LearnerLog, Confidence, SupState, SupCategory, SupNotes</code>):
              </p>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Rahul Verma, 3, 35, 50, 98, 44, 4, Hard to find items in aisle 6, Low, Needs support, Speed, Needed constant help"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleCsvImport}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Parse & Ingest Row</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {showSuccessToast && (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Signal Ingested & Coordination Loop Executed!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-feed-ingest-run-loop"
              onClick={() => handleSubmit()}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Feed & Run Coordination Loop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
