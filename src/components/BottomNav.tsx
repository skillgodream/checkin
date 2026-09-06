import React from "react";
import {
  Smartphone,
  Users,
  Building2,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { ActiveTab } from "./Header";

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLoopModal: () => void;
  needsAttentionCount?: number;
  atRiskCount?: number;
  currentDay: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenLoopModal,
  needsAttentionCount = 3,
  atRiskCount = 1,
  currentDay,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 py-1.5 max-w-lg mx-auto"
    >
      <div className="grid grid-cols-4 items-center justify-around">
        {/* Tab 1: New Hire Companion */}
        <button
          id="nav-tab-new-hire"
          onClick={() => setActiveTab("new_hire")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "new_hire"
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="relative">
            <Smartphone className="w-5 h-5" />
            {activeTab === "new_hire" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Companion
          </span>
          <span className="text-[9px] text-slate-400 font-normal">Day {currentDay}</span>
        </button>

        {/* Tab 2: Manager Console */}
        <button
          id="nav-tab-manager"
          onClick={() => setActiveTab("manager")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative ${
            activeTab === "manager"
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {(atRiskCount > 0 || needsAttentionCount > 0) && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                {needsAttentionCount + atRiskCount}
              </span>
            )}
            {activeTab === "manager" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Floor Triage
          </span>
          <span className="text-[9px] text-slate-400 font-normal">Supervisor</span>
        </button>

        {/* Tab 3: Store Operations */}
        <button
          id="nav-tab-organization"
          onClick={() => setActiveTab("organization")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "organization"
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5" />
            {activeTab === "organization" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Store Ops
          </span>
          <span className="text-[9px] text-slate-400 font-normal">Cohort</span>
        </button>

        {/* Tab 4: 5-Stage Loop Inspector */}
        <button
          id="nav-tab-loop"
          onClick={onOpenLoopModal}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-900 font-medium"
        >
          <div className="relative">
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap text-indigo-600 font-bold">
            Loop Flow
          </span>
          <span className="text-[9px] text-slate-400 font-normal">Inspect</span>
        </button>
      </div>
    </nav>
  );
};
