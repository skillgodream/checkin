import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Play, Info } from "lucide-react";
import { Logo } from "./Logo";

interface OnboardingViewProps {
  onStartDay: () => void;
  learnerName?: string;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
}

const SCROLLING_SENTENCES = [
  { id: "s1", en: "Direct walkthroughs", hi: "साथी के साथ वॉकथ्रू" },
  { id: "s2", en: "Master aisle coordinates", hi: "आइसल लोकेशन मास्टर करें" },
  { id: "s3", en: "Stay on floor standard", hi: "फ्लोर मानकों का पालन" },
  { id: "s4", en: "Pick 50+ items / hr", hi: "50+ आइटम प्रति घंटा पिक करें" },
  { id: "s5", en: "Zero barcode scan errors", hi: "बिना किसी गलती के स्कैन करें" },
  { id: "s6", en: "Draft daily shift logs", hi: "दैनिक शिफ्ट लॉग दर्ज करें" },
  { id: "s7", en: "Floor buddy quick assist", hi: "फ्लोर साथी से तुरंत सहायता" },
  { id: "s8", en: "Scale peak rush waves", hi: "व्यस्त समय में तेजी से पिकिंग" },
  { id: "s9", en: "Real-time pick rate dial", hi: "रीयल-टाइम स्पीड डायल" },
  { id: "s10", en: "Track job readiness", hi: "जॉब-रेडी प्रगति ट्रैक करें" },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartDay,
  learnerName = "Rahul",
  isHindi = false,
  onToggleLanguage,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(3); // starts at highlighted item
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
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

  return (
    <div className="relative min-h-screen w-full bg-[#120407] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* 1. ATMOSPHERIC CINEMATIC DUSK/SUNSET BACKGROUND (MATCHING SCREENSHOT DEPTH & CLARITY) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Photographic deep dusk scenery with rich crimson & rose tones */}
        <img
          src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=2400&auto=format&fit=crop"
          alt="Cinematic twilight scenery"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
        />

        {/* Layer 2: Deep rich red-wine / crimson gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#22070d]/90 via-[#3d0d17]/85 to-[#0e0205]/95" />

        {/* Layer 3: Warm radiant dusk sun glow centered */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, rgba(190, 24, 93, 0.25) 50%, transparent 80%)",
          }}
        />

        {/* Layer 4: Soft twilight horizon line reflection glow */}
        <div className="absolute top-[45%] left-0 right-0 h-64 bg-gradient-to-r from-transparent via-[#f43f5e]/20 to-transparent blur-3xl opacity-70" />

        {/* Layer 5: Cinematic subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
      </div>

      {/* 2. TOP BAR: CLEAN LOGO ON LEFT, NO MENU ITEMS, OPTIONAL LANGUAGE TOGGLE ON RIGHT */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Clean White Checkin Checkout Logo */}
          <Logo textColor="text-white" size="lg" />
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-3">
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Toggle Language"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {isHindi ? "हिंदी • EN" : "EN • हिंदी"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* 3. MAIN HERO CONTENT AREA (MATCHING THE SCREENSHOT PROPORTIONS & GRID EXACTLY) */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 my-auto">
        {/* Left Column: Pill Badge, Large Bold Display Heading, Subtitle & Dual Action Buttons */}
        <div className="w-full lg:max-w-2xl flex flex-col items-start text-left space-y-6">
          {/* Pill Badge (matches "Ranked #1 AI creative platform Read a16z report ->") */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all cursor-default text-xs font-medium text-white/90">
            <span>
              {isHindi ? "नंबर 1 फ्लोर रेडीनेस प्लेटफॉर्म" : "Ranked #1 Dark Store Readiness Platform"}
            </span>
            <span className="text-white/50">•</span>
            <span className="text-rose-300 font-semibold flex items-center gap-1">
              {isHindi ? "शिफ्ट इंटेलिजेंस" : "Floor Intelligence"}
              <ArrowRight className="w-3 h-3 text-[#f43f5e]" />
            </span>
          </div>

          {/* Large Display Headline (Matches "The creative platform to direct your best work") */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
            {isHindi ? (
              <>
                अपनी सबसे बेहतरीन शिफ्ट का <br className="hidden sm:inline" />
                संचालन करने का प्लेटफॉर्म
              </>
            ) : (
              <>
                The intelligent platform to <br className="hidden sm:inline" />
                direct your best shift
              </>
            )}
          </h1>

          {/* Clean Subtitle Paragraph (Matches "Every AI model for video, image, and audio...") */}
          <p className="text-base sm:text-lg text-white/80 font-normal leading-relaxed max-w-xl">
            {isHindi
              ? "पिकिंग, एक्यूरेसी और फ्लोर सुरक्षा के लिए हर इंटेलिजेंट कोऑर्डिनेशन लूप। रीयल-टाइम मार्गदर्शन और बडी सहयोग के साथ पूरे आत्मविश्वास से काम करें।"
              : "Every intelligent coordination loop for picking, accuracy, and floor safety. Real-time floor guidance and buddy collaboration on any wave."}
          </p>

          {/* Dual Pill CTA Buttons (Matches "Start creating" and "▶ Why Magnific?") */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {/* Primary Pill Button: "Start my day" (instead of "Start creating") */}
            <button
              id="btn-start-my-day-hero"
              onClick={onStartDay}
              className="px-6 py-3 rounded-xl bg-white hover:bg-rose-50 text-slate-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isHindi ? "दिन शुरू करें (Start my day)" : "Start my day"}</span>
            </button>

            {/* Secondary Outlined Pill Button: "Why Checkin Checkout?" (Matches "▶ Why Magnific?") */}
            <button
              onClick={() => setShowWhyModal(true)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              <span>{isHindi ? "Checkin Checkout क्यों?" : "Why Checkin Checkout?"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Auto-scrolling sentences with Authentic Solid Magenta Play Arrow (Matches Screenshot Exactly) */}
        <div
          className="w-full lg:max-w-md flex flex-col justify-center items-start lg:items-start select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Vertical scroll viewport with soft fade top & bottom */}
          <div className="relative w-full h-[360px] sm:h-[400px] flex flex-col justify-center overflow-hidden">
            {/* Top & bottom soft fade masks */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#120407] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#120407] to-transparent z-10 pointer-events-none" />

            {/* Animated translation container */}
            <div
              className="flex flex-col space-y-4 sm:space-y-5 transition-transform duration-700 ease-out"
              style={{
                transform: `translateY(${-activeIndex * 56 + 145}px)`,
              }}
            >
              {SCROLLING_SENTENCES.map((item, index) => {
                const isActive = index === activeIndex;
                const distance = Math.abs(index - activeIndex);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center gap-4 transition-all duration-500 cursor-pointer ${
                      isActive
                        ? "text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold scale-100 opacity-100"
                        : distance === 1
                        ? "text-white/45 text-xl sm:text-2xl lg:text-3xl font-bold opacity-45 hover:opacity-70"
                        : distance === 2
                        ? "text-white/20 text-lg sm:text-xl lg:text-2xl font-semibold opacity-20"
                        : "text-white/10 text-base sm:text-lg font-medium opacity-10"
                    }`}
                  >
                    {/* Pink/Magenta Solid Play Triangle Indicator on Active Sentence (like screenshot) */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isActive ? (
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[#ff3377] drop-shadow-[0_0_8px_rgba(255,51,119,0.8)]" />
                      ) : null}
                    </div>

                    <span className="whitespace-nowrap tracking-tight">
                      {isHindi ? item.hi : item.en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER: TRUSTED STATEMENT (Matches "Trusted by 1M+ subscribers—creatives, enterprises...") */}
      <footer className="relative z-20 w-full px-6 py-6 text-center text-xs sm:text-sm text-white/55 font-medium border-t border-white/5">
        <p>
          {isHindi
            ? "10,000+ डार्क स्टोर पिकर्स, फ्लोर बडीज और शिफ्ट मैनेजर्स द्वारा 120+ हब्स में उपयोग किया जाता है"
            : "Trusted by 10,000+ dark store pickers, buddies, leads and shift managers across 120+ hubs"}
        </p>
      </footer>

      {/* 5. MODAL: "WHY CHECKIN CHECKOUT?" EXPLAINER */}
      {showWhyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowWhyModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#1c080e] border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>{isHindi ? "प्लेटफॉर्म अवलोकन" : "Platform Overview"}</span>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isHindi ? "Checkin Checkout क्यों चुनें?" : "Why Checkin Checkout?"}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
              <p>
                {isHindi
                  ? "Checkin Checkout नए पिकर्स और वेयरहाउस साथियों को पहले 14 दिनों के भीतर आत्मविश्वास, रीयल-टाइम स्पीड और सुरक्षा मानकों के साथ तैयार करता है।"
                  : "Checkin Checkout is built specifically for dark store fast-fulfillment operations. It bridges the gap between training and live picking with zero anxiety."}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-lg font-black text-rose-400">45+ UPH</div>
                  <div className="text-[11px] text-white/60">Target Pick Rate</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-lg font-black text-emerald-400">99.2%</div>
                  <div className="text-[11px] text-white/60">Scanning Accuracy</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWhyModal(false);
                onStartDay();
              }}
              className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              {isHindi ? "शिफ्ट शुरू करें" : "Start Shift Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

