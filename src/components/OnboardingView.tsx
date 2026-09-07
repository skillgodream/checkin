import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, ChevronRight, CheckCircle2, Play } from "lucide-react";
import { Logo } from "./Logo";

interface OnboardingViewProps {
  onStartDay: () => void;
  learnerName?: string;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
}

const SCROLLING_SENTENCES = [
  { id: "s1", en: "Direct buddy walkthroughs", hi: "साथी के साथ वॉकथ्रू" },
  { id: "s2", en: "Master aisle coordinates", hi: "आइसल लोकेशन मास्टर करें" },
  { id: "s3", en: "Stay on floor standard", hi: "फ्लोर मानकों का पालन" },
  { id: "s4", en: "Pick orders at 45+ items/hr", hi: "45+ आइटम प्रति घंटा पिक करें", highlight: true },
  { id: "s5", en: "Draft daily shift logs", hi: "दैनिक शिफ्ट लॉग दर्ज करें" },
  { id: "s6", en: "Scan barcodes with 0 errors", hi: "बिना किसी गलती के स्कैन करें" },
  { id: "s7", en: "Instant supervisor assist", hi: "सुपरवाइजर से तुरंत मदद" },
  { id: "s8", en: "Scale peak rush waves", hi: "व्यस्त समय में तेजी से पिकिंग" },
  { id: "s9", en: "Verify safety & PPE protocols", hi: "सुरक्षा व पीपीई नियम जांचें" },
  { id: "s10", en: "Track whole-job readiness", hi: "जॉब-रेडी प्रगति ट्रैक करें" },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartDay,
  learnerName = "Rahul",
  isHindi = false,
  onToggleLanguage,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(3); // starts at highlighted item
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll loop every 2.4 seconds
  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SCROLLING_SENTENCES.length);
    }, 2400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const firstName = learnerName.split(" ")[0] || "Rahul";

  return (
    <div className="relative min-h-screen w-full bg-[#1e080d] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* 1. ATMOSPHERIC CINEMATIC DUSK/SUNSET BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Deep red-orange twilight gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b080f] via-[#52131e] to-[#150407]" />

        {/* Layer 2: Radiant warm dusk sun glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(235, 70, 70, 0.45) 0%, rgba(180, 30, 50, 0.2) 60%, transparent 80%)",
          }}
        />

        {/* Layer 3: Warm horizon line glow */}
        <div className="absolute top-1/2 left-0 right-0 h-48 bg-gradient-to-r from-transparent via-[#eb4646]/25 to-transparent blur-2xl opacity-60" />

        {/* Layer 4: Stylized dark store silhouette & twilight foliage reflections */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-64 md:h-80 opacity-40 object-cover"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#0d0204"
          />
          <path
            d="M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,261.3C672,267,768,245,864,240C960,235,1056,245,1152,250.7C1248,256,1344,256,1392,256L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#070102"
          />
        </svg>

        {/* Center silhouette figure aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-96 bg-gradient-to-t from-transparent via-[#ff5252]/10 to-transparent blur-xl pointer-events-none" />
      </div>

      {/* 2. MINIMALIST TOP BAR: ONLY CHECKIN CHECKOUT LOGO */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Clean White Checkin Checkout Logo */}
          <Logo textColor="text-white" size="md" />
        </div>

        {/* Optional language quick switch if provided */}
        {onToggleLanguage && (
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 backdrop-blur-md transition-all flex items-center gap-1.5"
            title="Toggle Language"
          >
            <span className="text-[10px] uppercase tracking-wider">{isHindi ? "HI / EN" : "EN / HI"}</span>
          </button>
        )}
      </header>

      {/* 3. MAIN HERO CONTENT AREA (DESKTOP SPLIT / MOBILE FIRST STACK) */}
      <main className="relative z-20 flex-1 w-full max-w-6xl mx-auto px-6 py-6 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        {/* Left / Hero Column */}
        <div className="w-full lg:max-w-xl flex flex-col items-start text-left space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all cursor-default">
            <span className="text-xs font-semibold text-white/90">
              {isHindi ? "नंबर 1 डार्क स्टोर प्लेटफॉर्म" : "Ranked #1 Floor Readiness Platform"}
            </span>
            <span className="text-xs text-white/60 font-medium">
              {isHindi ? "शिफ्ट इंटेलिजेंस" : "Dark Store AI"}
            </span>
            <ArrowRight className="w-3 h-3 text-pink-400" />
          </div>

          {/* Big Bold Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
            {isHindi ? (
              <>
                अपनी सबसे बेहतरीन शिफ्ट का <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-300">
                  संचालन करें
                </span>
              </>
            ) : (
              <>
                The intelligent platform to <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-300">
                  direct your best shift
                </span>
              </>
            )}
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-white/75 font-normal leading-relaxed max-w-lg">
            {isHindi
              ? "पिकिंग, एक्यूरेसी और फ्लोर सुरक्षा के लिए रीयल-टाइम मार्गदर्शन। साथी सहयोग और तैयारी के साथ पूरे आत्मविश्वास से अपनी शिफ्ट शुरू करें।"
              : "Every automated coordination loop for picking, accuracy, and floor safety. Real-time guidance and buddy collaboration on any wave."}
          </p>

          {/* Single Action Button: "Start my day" (NO other tabs) */}
          <div className="pt-2 w-full sm:w-auto">
            <button
              id="btn-start-my-day"
              onClick={onStartDay}
              className="group w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-rose-50 text-slate-950 font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{isHindi ? "दिन शुरू करें (Start my day)" : "Start my day"}</span>
              <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Right / Vertical Auto-scrolling Sentences (Magnific Style) */}
        <div
          className="w-full lg:max-w-md flex flex-col justify-center items-start lg:items-end pt-4 lg:pt-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Auto-scrolling vertical list viewport */}
          <div className="relative w-full h-[320px] sm:h-[360px] flex flex-col justify-center overflow-hidden mask-fade-vertical">
            {/* Soft vertical gradient masks */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#20080d] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#150407] to-transparent z-10 pointer-events-none" />

            {/* Sliding container */}
            <div
              className="flex flex-col space-y-3 sm:space-y-4 transition-transform duration-700 ease-out"
              style={{
                transform: `translateY(${-activeIndex * 48 + 120}px)`,
              }}
            >
              {SCROLLING_SENTENCES.map((item, index) => {
                const isActive = index === activeIndex;
                const distance = Math.abs(index - activeIndex);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-500 cursor-pointer ${
                      isActive
                        ? "text-white text-2xl sm:text-3xl lg:text-4xl font-black scale-105 opacity-100"
                        : distance === 1
                        ? "text-white/50 text-xl sm:text-2xl font-bold opacity-50 hover:opacity-80"
                        : "text-white/25 text-lg sm:text-xl font-semibold opacity-25"
                    }`}
                  >
                    {/* Pink/Magenta Play Triangle Indicator for active item (like Magnific) */}
                    {isActive ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 shrink-0 animate-pulse flex items-center justify-center">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-pink-500 text-pink-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 opacity-0" />
                    )}

                    <span className="whitespace-nowrap truncate tracking-tight">
                      {isHindi ? item.hi : item.en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER: TRUST BADGE */}
      <footer className="relative z-20 w-full px-6 py-6 text-center text-xs sm:text-sm text-white/50 font-medium border-t border-white/5">
        <p>
          {isHindi
            ? "120+ डार्क स्टोर हब में 10,000+ पिकर्स, बडीज और शिफ्ट मैनेजर्स द्वारा उपयोग किया जाता है"
            : "Trusted by 10,000+ dark store pickers, buddies, leads and shift managers across 120+ hubs"}
        </p>
      </footer>
    </div>
  );
};
