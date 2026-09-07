import React, { useState } from "react";
import { CircularDialWidget } from "./CircularDialWidget";
import { StoreZonesGrid } from "./StoreZonesGrid";
import { X, Briefcase, Sparkles, MapPin, ScanLine, Phone } from "lucide-react";
import { NewHire } from "../types";

interface TelemetryDialModalProps {
  isOpen: boolean;
  onClose: () => void;
  newHire: NewHire;
  currentDay: number;
}

export const TelemetryDialModal: React.FC<TelemetryDialModalProps> = ({
  isOpen,
  onClose,
  newHire,
  currentDay,
}) => {
  const [isHindi, setIsHindi] = useState<boolean>(true);
  const [subModal, setSubModal] = useState<"map" | "scanner" | "buddy" | "target" | null>(null);
  const [buddyAlertSent, setBuddyAlertSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentRecord = newHire.daysHistory.find((d) => d.dayNumber === currentDay) || {
    workSignal: { actualPickRate: 35, targetPickRate: 50, accuracyRate: 98 },
    pickRate: 35,
    targetPickRate: 50,
    errorRate: 2,
  };

  const actualPickRate = currentRecord.workSignal?.actualPickRate || currentRecord.pickRate || 35;
  const targetPickRate = currentRecord.workSignal?.targetPickRate || currentRecord.targetPickRate || 50;
  const accuracyRate = currentRecord.workSignal?.accuracyRate || 98;
  const readinessScore = Math.round((newHire.overallReadinessScore || newHire.rampProgress || 0.74) * 100);

  return (
    <div
      id="telemetry-dial-page-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-slate-50 rounded-3xl max-w-md w-full p-4 sm:p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-purple-200/80">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {isHindi ? "फ्लोर टेलीमेट्री डायल" : "Floor Telemetry Dial"}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Day {currentDay}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {newHire.name} • {newHire.role} • Dark Store #104
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="text-[11px] font-bold px-2 py-1 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            >
              {isHindi ? "English" : "हिंदी"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Round Circle Temperature / Gauge Widget */}
        <CircularDialWidget
          pickRate={actualPickRate}
          targetPickRate={targetPickRate}
          accuracyRate={accuracyRate}
          readinessScore={readinessScore}
          onCallBuddy={() => setSubModal("buddy")}
          onScannerFix={() => setSubModal("scanner")}
          onAisleMap={() => setSubModal("map")}
          onOpenTarget={() => setSubModal("target")}
          isHindi={isHindi}
        />

        {/* Store Zones Grid */}
        <StoreZonesGrid
          onSelectZone={(zoneId) => {
            if (zoneId === "scanner_dock") {
              setSubModal("scanner");
            } else if (zoneId === "buddy_desk") {
              setSubModal("buddy");
            } else {
              setSubModal("map");
            }
          }}
          isHindi={isHindi}
          activeZoneId={currentDay === 3 ? "aisles_4_8" : "aisles_1_3"}
        />

        {/* Quick Done / Back Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <span>{isHindi ? "वापस जाएं • ठीक है" : "Back to Screen"}</span>
        </button>
      </div>

      {/* Sub-modals for quick triggers from within the dial */}
      {subModal === "map" && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-violet-600" />
                {isHindi ? "स्टोर नेविगेशन गाइड" : "Store Layout Guide"}
              </span>
              <button onClick={() => setSubModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {isHindi
                ? "आइसल 1-3: स्नैक्स व बिस्कुट | आइसल 4-8: बल्क दाल व तेल | कोल्ड रूम: डेयरी व दूध"
                : "Aisles 1-3: Snacks & Beverages | Aisles 4-8: Bulk Staple & Flour | Cold Room: Dairy"}
            </p>
            <button
              onClick={() => setSubModal(null)}
              className="w-full py-2 bg-violet-600 text-white font-bold rounded-xl text-xs"
            >
              {isHindi ? "समझ गया" : "Got it"}
            </button>
          </div>
        </div>
      )}

      {subModal === "scanner" && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-violet-600" />
                {isHindi ? "स्कैनर ट्रबलशूट" : "Scanner Terminal Quick Fix"}
              </span>
              <button onClick={() => setSubModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isHindi
                ? "1. ग्लास लेंस को कपड़े से साफ करें।\n2. 15 सेमी की दूरी से बारकोड स्कैन करें।\n3. लाल बत्ती आने पर डॉक #2 से नई बैटरी लें।"
                : "1. Wipe laser glass clean with cloth.\n2. Hold at 15cm distance at 45° angle.\n3. Swap battery at Dock #2 if red light blinks."}
            </p>
            <button
              onClick={() => setSubModal(null)}
              className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              {isHindi ? "ठीक है" : "Close"}
            </button>
          </div>
        </div>
      )}

      {subModal === "buddy" && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                {isHindi ? "विक्रम भैया को कॉल" : "Call Floor Buddy"}
              </span>
              <button onClick={() => setSubModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {buddyAlertSent
                ? isHindi
                  ? "✅ विक्रम भैया को अलर्ट भेजा गया है! वे 2 मिनट में आइसल पर आ रहे हैं।"
                  : "✅ Vikram has been alerted! He is heading to your aisle in 2 mins."
                : isHindi
                ? "क्या आप विक्रम भैया (फ्लोर बडी) को तुरंत सहायता के लिए बुलाना चाहते हैं?"
                : "Would you like to send an instant ping to Floor Buddy Vikram?"}
            </p>
            {!buddyAlertSent ? (
              <button
                onClick={() => setBuddyAlertSent(true)}
                className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
              >
                {isHindi ? "हाँ, बडी को अलर्ट भेजें 🚨" : "Send Urgent Ping 🚨"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setBuddyAlertSent(false);
                  setSubModal(null);
                }}
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                {isHindi ? "बंद करें" : "Done"}
              </button>
            )}
          </div>
        </div>
      )}

      {subModal === "target" && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {isHindi ? "पिक टारगेट विवरण" : "Shift Target Breakdown"}
              </span>
              <button onClick={() => setSubModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{isHindi ? "वर्तमान गति" : "Current Rate"}:</span>
                <span className="font-bold text-slate-900">{actualPickRate} picks/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{isHindi ? "डे 3 लक्ष्य" : "Day 3 Target"}:</span>
                <span className="font-bold text-slate-900">{targetPickRate} picks/hr</span>
              </div>
              <div className="flex justify-between py-1">
                <span>{isHindi ? "डे 5 अंतिम लक्ष्य" : "Day 5 Target"}:</span>
                <span className="font-bold text-purple-700">65 picks/hr</span>
              </div>
            </div>
            <button
              onClick={() => setSubModal(null)}
              className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              {isHindi ? "ठीक है" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
