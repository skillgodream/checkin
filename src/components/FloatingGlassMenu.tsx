import React from "react";
import {
  Home,
  BookOpen,
  Milestone,
  Gauge,
  User,
} from "lucide-react";

export type LearnerSection = "home" | "modules" | "journey" | "dial" | "dashboard" | "buddy";

interface FloatingGlassMenuProps {
  activeSection: LearnerSection;
  onSelectSection: (section: LearnerSection) => void;
  isHindi?: boolean;
  hasAttention?: boolean;
  buddyAssigned?: boolean;
}

export const FloatingGlassMenu: React.FC<FloatingGlassMenuProps> = ({
  activeSection,
  onSelectSection,
  isHindi = false,
  hasAttention = false,
  buddyAssigned = false,
}) => {
  const items: {
    id: LearnerSection;
    labelEn: string;
    labelHi: string;
    icon: React.ReactNode;
    badge?: boolean;
  }[] = [
    {
      id: "home",
      labelEn: "Home",
      labelHi: "होम",
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />,
      badge: hasAttention,
    },
    {
      id: "modules",
      labelEn: "Modules",
      labelHi: "पाठ्यक्रम",
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />,
    },
    {
      id: "dial",
      labelEn: "Telemetry",
      labelHi: "डायल",
      icon: <Gauge className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />,
    },
    {
      id: "dashboard",
      labelEn: "Dashboard",
      labelHi: "हुनर",
      icon: <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />,
    },
  ];

  return (
    <div
      id="floating-glass-menu-container"
      className="fixed bottom-4 sm:bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
    >
      <nav
        id="floating-apple-glass-menu"
        aria-label="Learner Bottom Navigation"
        className="pointer-events-auto max-w-md w-full sm:max-w-lg bg-[#141822]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-full p-2 sm:p-2.5 flex items-center justify-between gap-1 sm:gap-2 transition-all"
      >
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-full font-bold transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 scale-[1.03]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#141822] animate-pulse" />
                )}
              </div>
              <span className="text-xs sm:text-[13px] font-black leading-tight mt-1 whitespace-nowrap">
                {isHindi ? item.labelHi : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
