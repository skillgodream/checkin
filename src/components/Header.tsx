import React from "react";
import {
  Calendar,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { Logo } from "./Logo";
export type ActiveTab = "new_hire" | "manager" | "organization";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentDay: number;
  onSelectDay: (day: number) => void;
  onResetDemo: () => void;
  onOpenLoopModal: () => void;
  hasApiKey: boolean;
  doingWellCount?: number;
  needsAttentionCount?: number;
  atRiskCount?: number;
  isFramed?: boolean;
  onToggleFrame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentDay,
  onSelectDay,
  onResetDemo,
  onOpenLoopModal,
  hasApiKey,
  doingWellCount = 8,
  needsAttentionCount = 3,
  atRiskCount = 1,
  isFramed = true,
  onToggleFrame,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-md mx-auto px-4 py-2.5">
        {/* Top bar: Brand + Live Tag + Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Identity with Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Logo size="sm" />
                {hasApiKey ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    AI Live
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                    Floor Demo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {activeTab === "new_hire"
                  ? "Floor Companion • Dark Store #104"
                  : activeTab === "manager"
                  ? "Floor Triage • Dark Store #104"
                  : "Store Operations • Dark Store #104"}
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleFrame && (
              <button
                onClick={onToggleFrame}
                title={isFramed ? "Switch to fluid mobile" : "Switch to phone chassis"}
                className="p-2 rounded-2xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xs:inline">{isFramed ? "Chassis" : "Fluid"}</span>
              </button>
            )}

            <button
              id="header-reset-btn"
              onClick={onResetDemo}
              title="Reset Demo Scenario"
              className="p-2 rounded-2xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row: Scenario Stepper */}
        {activeTab !== "new_hire" ? (
          <>
            {/* Scenario Day Stepper (Rounded Squircles) */}
            <div className="mt-2.5 flex items-center justify-between gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 text-xs">
              <span className="px-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 text-slate-400" />
                Day:
              </span>

              <div className="grid grid-cols-4 gap-1 flex-1">
                <button
                  id="btn-day-1"
                  onClick={() => onSelectDay(1)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all text-center truncate ${
                    currentDay === 1
                      ? "bg-white text-slate-900 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 1
                </button>
                <button
                  id="btn-day-3"
                  onClick={() => onSelectDay(3)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all text-center truncate ${
                    currentDay === 3
                      ? "bg-amber-500 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 3 ⚠️
                </button>
                <button
                  id="btn-day-4"
                  onClick={() => onSelectDay(4)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all text-center truncate ${
                    currentDay === 4
                      ? "bg-blue-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 4 🤝
                </button>
                <button
                  id="btn-day-5"
                  onClick={() => onSelectDay(5)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all text-center truncate ${
                    currentDay === 5
                      ? "bg-emerald-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 5 🎉
                </button>
              </div>
            </div>

            {/* Micro Status Badges (Supervisor & Ops) */}
            <div className="mt-2 flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  <strong className="text-slate-900">{doingWellCount}</strong> On Track
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>
                  <strong className="text-slate-900">{needsAttentionCount}</strong> Attention
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>
                  <strong className="text-slate-900">{atRiskCount}</strong> At Risk
                </span>
              </div>
              <button
                onClick={onOpenLoopModal}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Activity className="w-3 h-3" />
                Loop
              </button>
            </div>
          </>
        ) : (
          /* Clean, quiet learner scenario switcher */
          <div className="mt-2 flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800">Store Buddy Connected</span>
            </div>
            {/* Minimal scenario testing switcher for demo */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-[11px]">
              {[1, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => onSelectDay(d)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    currentDay === d
                      ? "bg-white text-slate-900 shadow-2xs font-black"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
