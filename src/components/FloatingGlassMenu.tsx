import React from "react";
import {
  Home,
  BookOpen,
  MessageCircle,
  User,
} from "lucide-react";

export type LearnerSection = "home" | "modules" | "buddy" | "dashboard";

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
      icon: <Home className="w-4 h-4 stroke-[2.2]" />,
      badge: hasAttention,
    },
    {
      id: "modules",
      labelEn: "Modules",
      labelHi: "पाठ्यक्रम",
      icon: <BookOpen className="w-4 h-4 stroke-[2.2]" />,
    },
    {
      id: "buddy",
      labelEn: "Buddy",
      labelHi: "साथी",
      icon: <MessageCircle className="w-4 h-4 stroke-[2.2]" />,
      badge: buddyAssigned,
    },
    {
      id: "dashboard",
      labelEn: "Dashboard",
      labelHi: "हुनर",
      icon: <User className="w-4 h-4 stroke-[2.2]" />,
    },
  ];

  return (
    <div
      id="floating-glass-menu-container"
      className="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
    >
      <nav
        id="floating-apple-glass-menu"
        aria-label="Learner Bottom Navigation"
        className="pointer-events-auto max-w-sm w-full bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_12px_36px_rgba(30,10,60,0.18)] rounded-full p-1.5 flex items-center justify-between ring-1 ring-black/5 transition-all"
      >
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/60"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-fuchsia-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] leading-tight mt-0.5 whitespace-nowrap">
                {isHindi ? item.labelHi : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

