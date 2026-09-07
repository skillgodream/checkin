import React, { useState } from "react";
import {
  Zap,
  Target,
  Award,
  Lightbulb,
  ScanLine,
  Phone,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";

interface CircularDialWidgetProps {
  pickRate: number;
  targetPickRate: number;
  accuracyRate: number;
  readinessScore?: number;
  onCallBuddy?: () => void;
  onScannerFix?: () => void;
  onAisleMap?: () => void;
  onOpenTarget?: () => void;
  isHindi?: boolean;
}

export type DialMode = "speed" | "accuracy" | "readiness";

export const CircularDialWidget: React.FC<CircularDialWidgetProps> = ({
  pickRate = 35,
  targetPickRate = 50,
  accuracyRate = 98,
  readinessScore = 74,
  onCallBuddy,
  onScannerFix,
  onAisleMap,
  onOpenTarget,
  isHindi = false,
}) => {
  const [mode, setMode] = useState<DialMode>("speed");
  const [terminalConnected, setTerminalConnected] = useState<boolean>(true);
  const [activeCircleAction, setActiveCircleAction] = useState<string>("gauge");

  // Determine value and max for the dial based on mode
  let currentValue = pickRate;
  let targetValue = targetPickRate;
  let unit = isHindi ? "सामान/घंटा" : "picks/hr";
  let modeLabel = isHindi ? "पिक स्पीड" : "Pick Speed";
  let statusBadge = pickRate >= targetPickRate ? "Target Met" : "Ramping Steady";

  if (mode === "accuracy") {
    currentValue = accuracyRate;
    targetValue = 100;
    unit = "%";
    modeLabel = isHindi ? "स्कैन एक्यूरेसी" : "Scan Accuracy";
    statusBadge = accuracyRate >= 95 ? "Excellent (98%)" : "Needs Care";
  } else if (mode === "readiness") {
    currentValue = readinessScore;
    targetValue = 100;
    unit = "% ready";
    modeLabel = isHindi ? "फ्लोर रेडीनेस" : "Floor Readiness";
    statusBadge = readinessScore >= 70 ? "On Track" : "Attention";
  }

  // Calculate angle for SVG arc (240 degree sweep from -120 to +120 or full 360)
  const percentage = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Sweep around 280 degrees for an open gauge, or 360
  const sweepDegree = 280;
  const strokeDashoffset = circumference - (percentage / 100) * (sweepDegree / 360) * circumference;

  // Generate 28 tick marks around the perimeter
  const totalTicks = 32;
  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    // Start angle at 130 deg, sweep around to 410 deg (280 degree arc)
    const angle = 130 + (i / (totalTicks - 1)) * sweepDegree;
    const rad = (angle * Math.PI) / 180;
    const x1 = 100 + 82 * Math.cos(rad);
    const y1 = 100 + 82 * Math.sin(rad);
    const x2 = 100 + 90 * Math.cos(rad);
    const y2 = 100 + 90 * Math.sin(rad);
    const isActive = (i / (totalTicks - 1)) * 100 <= percentage;
    return { x1, y1, x2, y2, isActive, key: i };
  });

  return (
    <div
      id="circular-telemetry-dial-widget"
      className="bg-white rounded-[28px] p-4 sm:p-5 border border-purple-100/80 shadow-md shadow-purple-900/5 space-y-4 select-none relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-fuchsia-400/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* 1. Mode Pill Selector (Matching "Temperature" pill from reference) */}
      <div className="flex items-center justify-center gap-1.5 bg-slate-100/90 p-1 rounded-full max-w-xs mx-auto">
        <button
          onClick={() => setMode("speed")}
          className={`flex-1 py-1 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer truncate ${
            mode === "speed"
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isHindi ? "⚡ स्पीड" : "⚡ Speed"}
        </button>
        <button
          onClick={() => setMode("accuracy")}
          className={`flex-1 py-1 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer truncate ${
            mode === "accuracy"
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isHindi ? "🎯 एक्यूरेसी" : "🎯 Accuracy"}
        </button>
        <button
          onClick={() => setMode("readiness")}
          className={`flex-1 py-1 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer truncate ${
            mode === "readiness"
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isHindi ? "📈 रेडीनेस" : "📈 Readiness"}
        </button>
      </div>

      {/* 2. Four Quick Action Circular Buttons (Light, Lock/Scanner, Dial/Pace, Fan/Buddy) */}
      <div className="flex items-center justify-center gap-4 pt-1">
        {/* Action 1: Aisle Light / Map */}
        <button
          onClick={() => {
            setActiveCircleAction("light");
            if (onAisleMap) onAisleMap();
          }}
          title={isHindi ? "आइसल मैप" : "Aisle Guide"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activeCircleAction === "light"
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30 scale-105"
              : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        {/* Action 2: Scanner Lock / Fix */}
        <button
          onClick={() => {
            setActiveCircleAction("scanner");
            if (onScannerFix) onScannerFix();
          }}
          title={isHindi ? "स्कैनर चेक" : "Scanner Terminal"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activeCircleAction === "scanner"
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30 scale-105"
              : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
        >
          <ScanLine className="w-4 h-4" />
        </button>

        {/* Action 3: Gauge / Pace Goal */}
        <button
          onClick={() => {
            setActiveCircleAction("gauge");
            if (onOpenTarget) onOpenTarget();
          }}
          title={isHindi ? "पिक टारगेट" : "Ramp Target"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activeCircleAction === "gauge"
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30 scale-105"
              : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Action 4: Floor Buddy */}
        <button
          onClick={() => {
            setActiveCircleAction("buddy");
            if (onCallBuddy) onCallBuddy();
          }}
          title={isHindi ? "विक्रम भैया को बुलाएं" : "Call Floor Buddy"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activeCircleAction === "buddy"
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-purple-500/30 scale-105"
              : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
          }`}
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* 3. The Circular Dial / Gauge (Thermostat-style with radial ticks) */}
      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox="0 0 200 200"
          className="w-56 h-56 max-w-full drop-shadow-sm select-none"
        >
          <defs>
            <linearGradient id="purplePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="centerCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Radial Tick Marks */}
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isActive ? "#9333ea" : "#e2e8f0"}
              strokeWidth={tick.isActive ? "2.5" : "1.8"}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          ))}

          {/* Background Track Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="5"
            strokeDasharray={`${(sweepDegree / 360) * circumference} ${circumference}`}
            transform="rotate(130 100 100)"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#purplePinkGradient)"
            strokeWidth="5"
            strokeDasharray={`${(sweepDegree / 360) * circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(130 100 100)"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Glowing Center Disc */}
          <circle
            cx="100"
            cy="100"
            r="46"
            fill="url(#centerCircleGradient)"
            filter="url(#purpleGlow)"
          />

          {/* Center Text (Value & Unit) */}
          <text
            x="100"
            y="94"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            className="font-black text-3xl tracking-tight"
            style={{ fontWeight: 900 }}
          >
            {currentValue}
            {mode === "accuracy" || mode === "readiness" ? "%" : ""}
          </text>
          <text
            x="100"
            y="118"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fae8ff"
            className="text-xs font-bold tracking-wider uppercase"
          >
            {unit}
          </text>
        </svg>

        {/* Floating Indicator Pill at Bottom */}
        <div className="absolute bottom-1 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-200/80 shadow-xs flex items-center gap-1.5 text-xs font-bold text-purple-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{statusBadge}</span>
        </div>
      </div>

      {/* 4. Terminal / Station Connection Row with Purple Toggle (Matching Bosch AC from reference) */}
      <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
              {isHindi ? "हैंडहेल्ड टर्मिनल #104" : "Zebra Terminal #104"}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {terminalConnected
                ? isHindi
                  ? "फ्लोर वाई-फाई कनेक्टेड"
                  : "Floor Wi-Fi Synced"
                : isHindi
                ? "डिस्कनेक्टेड"
                : "Disconnected"}
            </p>
          </div>
        </div>

        {/* Purple Toggle Switch */}
        <button
          type="button"
          onClick={() => setTerminalConnected(!terminalConnected)}
          className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
            terminalConnected
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
              : "bg-slate-300"
          }`}
        >
          <div
            className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              terminalConnected ? "translate-x-5.5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
