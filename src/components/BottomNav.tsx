import React from "react";
import {
  Smartphone,
  Users,
  Building2,
  Activity,
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg px-3 py-2 max-w-md mx-auto"
    >
      <div className="grid grid-cols-4 items-center justify-around gap-1">
        {/* Tab 1: New Hire Companion */}
        <button
          id="nav-tab-new-hire"
          onClick={() => setActiveTab("new_hire")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === "new_hire"
              ? "bg-slate-900 text-white shadow-xs font-black"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold"
          }`}
        >
          <div className="relative">
            <Smartphone className={`w-5 h-5 ${activeTab === "new_hire" ? "text-emerald-400" : ""}`} />
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Companion
          </span>
        </button>

        {/* Tab 2: Manager Console */}
        <button
          id="nav-tab-manager"
          onClick={() => setActiveTab("manager")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer relative active:scale-95 ${
            activeTab === "manager"
              ? "bg-slate-900 text-white shadow-xs font-black"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold"
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === "manager" ? "text-blue-400" : ""}`} />
            {(atRiskCount > 0 || needsAttentionCount > 0) && (
              <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white ring-2 ring-white">
                {needsAttentionCount + atRiskCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Supervisor
          </span>
        </button>

        {/* Tab 3: Store Operations */}
        <button
          id="nav-tab-organization"
          onClick={() => setActiveTab("organization")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeTab === "organization"
              ? "bg-slate-900 text-white shadow-xs font-black"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold"
          }`}
        >
          <div className="relative">
            <Building2 className={`w-5 h-5 ${activeTab === "organization" ? "text-indigo-400" : ""}`} />
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
            Store Ops
          </span>
        </button>

        {/* Tab 4: 5-Stage Loop Inspector */}
        <button
          id="nav-tab-loop"
          onClick={onOpenLoopModal}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 font-bold active:scale-95"
        >
          <div className="relative">
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap text-indigo-600 font-black">
            Loop Flow
          </span>
        </button>
      </div>
    </nav>
  );
};
