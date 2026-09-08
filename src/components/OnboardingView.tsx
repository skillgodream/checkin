import React, { useState } from "react";

interface OnboardingViewProps {
  onStartDay: () => void;
  learnerName?: string;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartDay,
  isHindi = false,
  onToggleLanguage,
}) => {
  const [account, setAccount] = useState("mygoalsw@gmail.com");
  const [password, setPassword] = useState("••••");

  return (
    <div
      id="login-screen-container"
      className="relative w-full h-full min-h-screen md:min-h-[812px] flex flex-col justify-between p-6 sm:p-8 overflow-hidden select-none font-sans text-white"
      style={{
        background: "linear-gradient(180deg, #2b1442 0%, #1e0e2e 45%, #13071d 100%)",
      }}
    >
      {/* Background Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-fuchsia-500/25 filter blur-xl" />
        <div className="absolute top-24 right-12 w-28 h-28 rounded-full bg-purple-500/20 filter blur-xl" />
        <div className="absolute bottom-32 left-1/4 w-36 h-36 rounded-full bg-pink-500/15 filter blur-2xl" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between pt-2">
        {/* iOS top handle indicator */}
        <div className="w-16 h-1.5 bg-white/30 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-1.5 ml-auto text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Center Logo & Branding */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto space-y-4 pt-4">
        {/* Large Circular Checkmark Badge */}
        <div className="relative">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-600/50 ring-4 ring-white/10">
            <span className="text-white text-4xl sm:text-5xl font-black">✓</span>
          </div>
          {/* Small floating orb */}
          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-fuchsia-400 shadow-md" />
          <div className="absolute bottom-2 -right-3 w-5 h-5 rounded-full bg-purple-400 shadow-md" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white lowercase">
          mygoals
        </h1>
      </div>

      {/* Form Container */}
      <div className="relative z-25 max-w-sm mx-auto w-full space-y-4 pb-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-purple-300/80 px-4 block">
            CARD.ACCOUNT
          </label>
          <div className="relative">
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full py-3.5 px-6 rounded-full bg-[#1b0d28]/90 border border-purple-800/60 text-white placeholder-purple-300/40 text-sm font-medium outline-none focus:border-fuchsia-500 transition-colors shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-purple-300/80 px-4 block">
            PASSWORD
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3.5 px-6 rounded-full bg-[#1b0d28]/90 border border-purple-800/60 text-white placeholder-purple-300/40 text-sm font-medium outline-none focus:border-fuchsia-500 transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* GET STARTED CTA Button */}
        <div className="pt-2">
          <button
            onClick={onStartDay}
            className="w-full py-4 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-purple-600/40 transition-all cursor-pointer active:scale-98"
          >
            {isHindi ? "शुरू करें (GET STARTED)" : "GET STARTED"}
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-3">
          <button
            onClick={onStartDay}
            className="text-[11px] font-bold tracking-widest text-purple-300/70 hover:text-white uppercase transition-colors cursor-pointer"
          >
            NEED HELP?
          </button>
        </div>
      </div>

      {/* Bottom bar handle */}
      <div className="relative z-20 w-32 h-1 bg-white/30 rounded-full mx-auto" />
    </div>
  );
};
