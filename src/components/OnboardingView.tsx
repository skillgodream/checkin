import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface OnboardingViewProps {
  onStartDay: () => void;
  learnerName?: string;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
}

const SENTENCES = [
  { id: "s1", en: "Set your pace", hi: "अपनी गति तय करें" },
  { id: "s2", en: "Pick your topics", hi: "अपने विषय चुनें" },
  { id: "s3", en: "Adapts each lesson", hi: "हर पाठ को अनुकूलित करता है" },
  { id: "s4", en: "Build your streak", hi: "अपनी स्ट्रीक बनाएं" },
  { id: "s5", en: "Track your growth", hi: "अपनी प्रगति ट्रैक करें" },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartDay,
  isHindi = false,
  onToggleLanguage,
}) => {
  // Starts at index 2 ("Adapts each lesson"), matching the screenshot preview
  const [activeIndex, setActiveIndex] = useState<number>(2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll loop: advances through sentences continuously every 2.6s
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SENTENCES.length);
    }, 2600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  return (
    <div
      id="onboarding-screen-container"
      className="relative w-full h-full min-h-screen md:min-h-[812px] flex flex-col justify-between overflow-hidden select-none font-sans text-white"
      style={{
        background: "linear-gradient(180deg, #181324 0%, #281523 32%, #4a202c 54%, #32151d 78%, #14090e 100%)",
      }}
    >
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC ARTWORK: DAWN SUN, ROLLING DUNES, & WALKING SILHOUETTE      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radiant Sunset/Dawn Sun Orb (upper center, behind figure) */}
        <div
          className="absolute top-[32%] left-[44%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 222, 202, 0.95) 0%, rgba(246, 163, 130, 0.75) 28%, rgba(196, 78, 92, 0.45) 55%, transparent 75%)",
            filter: "blur(20px)",
          }}
        />

        {/* Dune hills and walking silhouette figure in precise vector paths */}
        <svg
          viewBox="0 0 400 480"
          className="absolute bottom-[20%] left-0 right-0 w-full h-[380px] pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="backDuneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#46222b" />
              <stop offset="100%" stopColor="#2e141a" />
            </linearGradient>
            <linearGradient id="frontDuneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#251117" />
              <stop offset="100%" stopColor="#14080d" />
            </linearGradient>
          </defs>

          {/* Back rolling dune hill */}
          <path
            d="M 0 240 Q 130 190 220 220 T 400 205 L 400 480 L 0 480 Z"
            fill="url(#backDuneGradient)"
          />

          {/* Front rolling dune hill */}
          <path
            d="M 0 280 Q 150 250 270 285 T 400 265 L 400 480 L 0 480 Z"
            fill="url(#frontDuneGradient)"
          />

          {/* Minimalist walking silhouette figure positioned on dune crest right under the sun */}
          <g transform="translate(192, 178)" fill="#0d0508">
            {/* Round Head */}
            <circle cx="8" cy="8" r="7" />
            {/* Slender Torso */}
            <path d="M 4 17 C 4 14, 12 14, 12 17 L 14 42 C 14 44, 2 44, 2 42 Z" />
            {/* Left Walking Leg */}
            <path d="M 3 42 C 3 42, -1 64, -2 78 C -3 81, 2 81, 3 78 L 7 44 Z" />
            {/* Right Walking Leg */}
            <path d="M 9 42 C 9 42, 14 62, 16 78 C 17 81, 22 81, 21 78 L 13 44 Z" />
          </g>
        </svg>

        {/* Soft bottom darkening gradient to give high contrast for typography */}
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#14080d] via-[#14080d]/85 to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP SECTION: LOGO ON LEFT + PILL BADGE & OPTIONAL LANGUAGE TOGGLE      */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-5 pt-6 sm:pt-7">
        <div className="flex items-center justify-between">
          {/* Top Left: App logo replacing Pathwise */}
          <div id="onboarding-brand-logo" className="flex items-center gap-2.5 select-none">
            {/* Pink squircle app icon matching screenshot icon style */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] bg-[#ff3377] flex items-center justify-center text-white shadow-xs font-black text-xs">
              <span className="text-[10px] tracking-tighter">✓</span>
            </div>

            {/* CHECKIN CHECKOUT text in clean, geometric uppercase bold typography */}
            <span
              className="font-extrabold text-white text-sm sm:text-base tracking-[0.14em] uppercase leading-none"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "0.15em",
              }}
            >
              CHECKIN CHECKOUT
            </span>
          </div>

          {/* Optional language toggle on top right */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 backdrop-blur-md transition-all cursor-pointer active:scale-95"
              title="Toggle Language"
            >
              {isHindi ? "हिंदी • EN" : "EN • हिंदी"}
            </button>
          )}
        </div>

        {/* Pill Badge under logo: "Built to learn how you learn  See how" */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 hover:bg-black/35 border border-white/10 backdrop-blur-md text-xs text-white/90 transition-colors">
          <span className="text-[#ff386b] text-xs">✦</span>
          <span className="font-medium text-[11px] sm:text-xs">
            {isHindi ? "सीखने के तरीके से सीखें" : "Built to learn how you learn"}
          </span>
          <button
            onClick={() => setShowHowItWorksModal(true)}
            className="text-white/60 hover:text-white underline underline-offset-2 ml-1 cursor-pointer font-medium text-[11px] sm:text-xs"
          >
            {isHindi ? "देखें" : "See how"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MID-UPPER RIGHT: AUTO-SCROLLABLE SIDE SENTENCES (NO SHADOW, CLEAN LOOP)  */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex justify-end px-5 my-auto pt-4 pb-2">
        <div
          id="auto-scrollable-sentences-loop"
          className="flex items-center gap-2 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Vertical list of side sentences (NO box-shadow or drop-shadow, floating transparently) */}
          <div className="flex flex-col items-end space-y-2.5 sm:space-y-3 text-right">
            {SENTENCES.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex items-center justify-end gap-1.5 transition-all duration-300 cursor-pointer text-right ${
                    isActive
                      ? "text-white font-bold text-sm sm:text-[15px] opacity-100 scale-100"
                      : "text-white/40 hover:text-white/70 font-medium text-xs sm:text-sm opacity-60 scale-95"
                  }`}
                >
                  {/* Vibrant pink triangle indicator for active sentence */}
                  {isActive && (
                    <span className="text-[#ff3377] text-[10px] sm:text-xs leading-none shrink-0 inline-block mr-0.5">
                      ▶
                    </span>
                  )}
                  <span className="whitespace-nowrap tracking-normal">
                    {isHindi ? item.hi : item.en}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vertical progress indicator track line on far right */}
          <div className="w-[2px] h-28 sm:h-32 bg-white/20 rounded-full relative ml-1.5 shrink-0 overflow-hidden">
            {/* Active pink slider marker traveling smoothly along the track */}
            <div
              className="w-full bg-[#ff3377] rounded-full transition-all duration-500 ease-out absolute"
              style={{
                height: "22px",
                top: `${(activeIndex / (SENTENCES.length - 1)) * 80}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM SECTION: HEADLINE, SUBTITLE, DUAL ACTION BUTTONS & FOOTER NOTE  */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-5 pb-6 sm:pb-7 space-y-3.5">
        {/* Large Bold Display Heading */}
        <h1 className="text-[26px] sm:text-[30px] font-black text-white leading-[1.12] tracking-tight max-w-sm">
          {isHindi ? (
            <>अपने दिन की सही शुरुआत करने का लर्निंग प्लेटफॉर्म</>
          ) : (
            <>The learning platform to start your day right</>
          )}
        </h1>

        {/* Subtitle Paragraph */}
        <p className="text-xs sm:text-[13px] text-white/75 font-normal leading-relaxed max-w-sm">
          {isHindi
            ? "एक त्वरित चेक-इन और Checkin Checkout आपकी गति, आपके लक्ष्यों और उपलब्ध दस मिनटों के अनुसार आज का पाठ तैयार करता है।"
            : "One quick check-in and Checkin Checkout builds today's lesson around your pace, your goals, and the ten minutes you actually have."}
        </p>

        {/* Dual Pill CTA Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          {/* Primary Button: "Start my day" */}
          <button
            id="btn-start-my-day"
            onClick={onStartDay}
            className="flex-1 py-3.5 px-4 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-black text-sm text-center transition-all cursor-pointer shadow-none"
          >
            {isHindi ? "दिन शुरू करें" : "Start my day"}
          </button>

          {/* Secondary Button: "▶ How it works" */}
          <button
            id="btn-how-it-works"
            onClick={() => setShowHowItWorksModal(true)}
            className="flex-1 py-3.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/25 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-none"
          >
            <span className="text-[10px] leading-none">▶</span>
            <span>{isHindi ? "यह कैसे काम करता है" : "How it works"}</span>
          </button>
        </div>

        {/* Trust Caption at Bottom */}
        <p className="text-[11px] text-white/50 text-center font-medium pt-1">
          {isHindi
            ? "दैनिक आदत बनाने वाले 500K+ शिक्षार्थियों का भरोसा"
            : "Trusted by 500K+ learners building a daily habit"}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. "HOW IT WORKS" EXPLAINER MODAL (WHEN "HOW IT WORKS" OR "SEE HOW" TAPPED) */}
      {/* ========================================================================= */}
      {showHowItWorksModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowHowItWorksModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#1b1220] border border-white/15 rounded-t-[32px] sm:rounded-[32px] p-6 text-white space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? "लर्निंग लूप कैसे काम करता है" : "How The Loop Works"}</span>
              </div>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer text-xs transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-white">
              {isHindi ? "Checkin Checkout लूप" : "The Checkin Checkout Loop"}
            </h3>

            <div className="space-y-3 text-xs text-white/80 leading-relaxed">
              <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#ff3377] text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {isHindi ? "त्वरित चेक-इन (1 मिनट)" : "Quick Check-in (1 min)"}
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {isHindi
                      ? "बताएं कि आप आज कैसा महसूस कर रहे हैं। सिस्टम तुरंत आपका दिन अनुकूलित करता है।"
                      : "Share how you feel and your focus for the shift. The system adapts instantly."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#ff3377] text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {isHindi ? "अनुकूलित माइक्रो-पाठ (10 मिनट)" : "Adaptive Lesson (10 min)"}
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {isHindi
                      ? "आपके पिक रेट और कमजोर क्षेत्रों के अनुसार आज का सबसे महत्वपूर्ण विषय।"
                      : "Today's targeted micro-lesson tailored to your current speed and accuracy."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#ff3377] text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {isHindi ? "फ्लोर टेलीमेट्री और बडी सहायता" : "Live Floor Practice & Buddy"}
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {isHindi
                      ? "लाइव पिक रेट डायल और कभी भी बडी विक्रम से 1-टैप वॉयस सहायता।"
                      : "Real-time pick rate telemetry dial and 1-tap voice support from Senior Buddy Vikram."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#ff3377] text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {isHindi ? "चेक-आउट और प्रगति (Shift End)" : "Check-out & Growth"}
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {isHindi
                      ? "शिफ्ट का दैनिक सारांश और जॉब-रेडिनेस फिगर पर वास्तविक प्रगति।"
                      : "Review your daily shift achievements and watch your Job-Ready figure level up."}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowHowItWorksModal(false);
                onStartDay();
              }}
              className="w-full py-3 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isHindi ? "दिन शुरू करें" : "Start My Day"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
