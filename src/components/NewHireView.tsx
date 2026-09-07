import React, { useState, useEffect } from "react";
import { NewHire, DailySignal, DARK_STORE_CAPABILITIES } from "../types";
import { analyzeDailyReport } from "../services/intelligence";
import { speakMessage, stopSpeaking } from "../utils/speech";
import { CircularDialWidget } from "./CircularDialWidget";
import { StoreZonesGrid } from "./StoreZonesGrid";
import { JobReadyHumanFigure } from "./JobReadyHumanFigure";
import { ModulesView } from "./ModulesView";
import { FloatingGlassMenu, LearnerSection } from "./FloatingGlassMenu";
import { LearnerJourneyRoadmap } from "./LearnerJourneyRoadmap";
import { LearnerDailyReportCard } from "./LearnerDailyReportCard";
import { YesterdayShiftDetailModal } from "./YesterdayShiftDetailModal";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Phone,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MapPin,
  ScanLine,
  UserCheck,
  X,
  Sparkles,
  Target,
  Zap,
  Home,
  BookOpen,
  Briefcase,
  MessageCircle,
  User,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Clock,
  Compass,
} from "lucide-react";

interface NewHireViewProps {
  newHire: NewHire;
  currentDay: number;
  onDailySignalSubmitted: (signal: DailySignal) => void;
  onAskHelp: (question: string) => Promise<string>;
  onSelectDay: (day: number) => void;
  onUpdateHire?: (updatedHire: NewHire) => void;
  isHindi?: boolean;
  onToggleLanguage?: () => void;
  setIsHindi?: (isHindi: boolean) => void;
  activeSection?: LearnerSection;
  onSelectSection?: (section: LearnerSection) => void;
}

export const NewHireView: React.FC<NewHireViewProps> = ({
  newHire,
  currentDay,
  onDailySignalSubmitted,
  onAskHelp,
  onUpdateHire,
  isHindi: propIsHindi,
  setIsHindi: propSetIsHindi,
  activeSection: propActiveSection,
  onSelectSection: propOnSelectSection,
}) => {
  // Current day record from authoritative state
  const currentRecord = newHire.daysHistory.find((d) => d.dayNumber === currentDay) || {
    dayNumber: currentDay,
    date: `Day ${currentDay}`,
    workSignal: {
      dayNumber: currentDay,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 44,
      targetOrders: 65,
    },
    statusAtEnd: newHire.status,
    statusReason: newHire.statusReason,
  };

  // Language state: true = Hindi / Hinglish, false = Simple English
  const [localIsHindi, setLocalIsHindi] = useState<boolean>(true);
  const isHindi = propIsHindi !== undefined ? propIsHindi : localIsHindi;
  const setIsHindi = propSetIsHindi || setLocalIsHindi;

  // Active learner navigation tab: "home" | "modules" | "dial" | "dashboard" | "buddy"
  const [localActiveSection, setLocalActiveSection] = useState<LearnerSection>("home");
  const activeSection = propActiveSection !== undefined ? propActiveSection : localActiveSection;
  const setActiveSection = propOnSelectSection || setLocalActiveSection;

  // Active quick action modal
  const [activeModal, setActiveModal] = useState<"map" | "buddy" | "scanner" | "target" | "work" | "yesterday_detail" | null>(null);
  const [buddyAlertSent, setBuddyAlertSent] = useState<boolean>(false);

  // Voice recording & input states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Latest companion exchange (minimalist conversation card instead of heavy chat wall)
  const [latestInteraction, setLatestInteraction] = useState<{
    userText: string;
    replyText: string;
    timestamp: string;
  } | null>(null);

  // Derive simple human state from existing intelligence ledger
  const isSupportCompleted = Boolean(
    currentRecord.actionOutcome && currentRecord.actionOutcome.improved
  );
  const isSupportAssigned = Boolean(
    !isSupportCompleted &&
      currentRecord.recommendedAction &&
      currentRecord.recommendedAction.status !== "completed"
  );
  const isNeedsHelp = Boolean(
    !isSupportCompleted &&
      !isSupportAssigned &&
      (currentRecord.statusAtEnd === "Needs attention" ||
        currentRecord.statusAtEnd === "At risk" ||
        (currentRecord.dailySignal && currentRecord.dailySignal.confidence === "Low"))
  );

  // Synchronize latest exchange on day change
  useEffect(() => {
    if (currentRecord.dailySignal) {
      setLatestInteraction({
        userText: currentRecord.dailySignal.rawText,
        replyText:
          currentRecord.dailySignal.companionResponse ||
          (isNeedsHelp
            ? `${newHire.buddy.split(" ")[0]} will help you with floor picking today. Accuracy is ${currentRecord.workSignal?.accuracyRate ?? 98}%, no stress!`
            : "Shift reported! Great work keeping high accuracy."),
        timestamp: currentRecord.dailySignal.timestamp || "Today",
      });
    } else {
      setLatestInteraction(null);
    }
    setBuddyAlertSent(false);
    setInputText("");
    setShowTextInput(false);
  }, [currentDay, newHire.id, newHire.buddy, currentRecord.dailySignal, currentRecord.workSignal, isNeedsHelp]);

  // Audio speech player
  const handlePlayAudio = (id: string, text: string) => {
    if (playingAudioId === id) {
      stopSpeaking();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      speakMessage(text, isHindi);
      const wordCount = text.split(" ").length;
      const durationMs = Math.max(2500, (wordCount / 2.5) * 1000);
      setTimeout(() => {
        setPlayingAudioId((curr) => (curr === id ? null : curr));
      }, durationMs);
    }
  };

  // WhatsApp-style Voice Toggle
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Friendly fallback in sandbox environments
      const sampleSpokenReports = isHindi
        ? [
            "भैया मुझे आइसल 4 से 8 में सामान ढूंढने में बहुत टाइम लग रहा है।",
            "दही और दूध का कोल्ड रूम कहां पर है?",
            "स्कैनर बारकोड नहीं पढ़ रहा है, लाल लाइट जल रही है।",
            "आज शिफ्ट अच्छी रही, 48 पैकेट फटाफट पैक कर दिए।",
          ]
        : [
            "I am taking too long to find items in Aisles 4 to 8.",
            "Where is the cold dairy room?",
            "The barcode scanner is not reading labels.",
            "Smooth shift today, picked items easily.",
          ];
      const randomText =
        sampleSpokenReports[Math.floor(Math.random() * sampleSpokenReports.length)];
      handleSendMessage(randomText);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? "hi-IN" : "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) handleSendMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
      handleSendMessage(
        isHindi
          ? "मुझे आइसल 4 से 8 में सामान ढूंढने में देर लग रही है।"
          : "I am taking too long in aisles 4 to 8."
      );
    }
  };

  // Message dispatcher
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isProcessing) return;

    setIsProcessing(true);
    setInputText("");

    try {
      const lower = text.toLowerCase();
      const isQuestion =
        text.includes("?") ||
        lower.includes("kahan") ||
        lower.includes("where") ||
        lower.includes("how") ||
        lower.includes("kya") ||
        lower.includes("kaise") ||
        lower.startsWith("can i");

      if (isQuestion) {
        const answer = await onAskHelp(text);
        setLatestInteraction({
          userText: text,
          replyText: answer,
          timestamp: "Just now",
        });
        handlePlayAudio("latest-interaction", answer);
      } else {
        const analyzed = await analyzeDailyReport(text, newHire.name, currentDay);
        const replyText =
          analyzed.companionResponse ||
          (isHindi
            ? `समझ गया ${newHire.name.split(" ")[0]}! ${newHire.buddy.split(" ")[0]} भैया को बता दिया है, वो आपको फ्लोर पर समझा देंगे।`
            : `Got it, ${newHire.name.split(" ")[0]}! Buddy ${newHire.buddy.split(" ")[0]} has been alerted to walk through with you.`);

        const signal: DailySignal = {
          id: `sig-${Date.now()}`,
          dayNumber: currentDay,
          rawText: text,
          inputMethod: "voice",
          issue: analyzed.issue || "Floor experience",
          confidence: (analyzed.confidence as any) || "Medium",
          possibleImpact: analyzed.possibleImpact || "Ramp adjustment",
          category: (analyzed.category as any) || "General",
          summary: analyzed.summary || text.slice(0, 80),
          companionResponse: replyText,
          timestamp: "Just now",
        };

        onDailySignalSubmitted(signal);
        setLatestInteraction({
          userText: text,
          replyText,
          timestamp: "Just now",
        });
        handlePlayAudio("latest-interaction", replyText);
      }
    } catch (err) {
      console.error(err);
      const fallbackReply = isHindi
        ? "आपकी बात नोट कर ली गई है।"
        : "I heard you! Noted for your shift.";
      setLatestInteraction({
        userText: text,
        replyText: fallbackReply,
        timestamp: "Just now",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced status & intelligent prescription content answering the 6 core questions
  const getStatusContent = () => {
    const accuracy = currentRecord.workSignal?.accuracyRate ?? 98;
    const actualPace = currentRecord.workSignal?.actualPickRate ?? 35;
    const targetPace = currentRecord.workSignal?.targetPickRate ?? 50;
    const buddyName = newHire.buddy.split(" ")[0];
    const supervisorName = newHire.supervisor.split(" ")[0];

    // 1. Tool / Hardware obstacle
    if (
      currentRecord.dailySignal?.category === "Tool" ||
      currentRecord.recommendedAction?.decisionType === "tool_remedy" ||
      currentRecord.identifiedPattern?.category === "Tool"
    ) {
      return {
        badge: isHindi ? "डिवाइस 🛠️" : "EQUIPMENT 🛠️",
        duration: "2 min",
        action: isHindi ? "स्कैनर लेंस साफ करें या बदलें" : "Clean scanner or swap at desk",
        shortWhy: isHindi ? "बारकोड पढ़ने में देरी सुधारें" : "Fix barcode read delay",
        target: isHindi ? "बीप के साथ तुरंत स्कैन होना चाहिए" : "Quick beep on every scan",
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => setActiveModal("scanner"),
        secondaryBtnText: isHindi ? `${buddyName} को बताएं` : `Tell ${buddyName}`,
        secondaryAction: () => setActiveSection("buddy"),
      };
    }

    // 2. External store / facility bottleneck
    if (
      currentRecord.workSignal?.externalBottleneck ||
      currentRecord.identifiedPattern?.patternName.includes("Bottleneck") ||
      currentRecord.recommendedAction?.decisionType === "environment_support"
    ) {
      return {
        badge: isHindi ? "फ्लोर सूचना 🏢" : "FLOOR NOTICE 🏢",
        duration: isHindi ? "शिफ्ट लक्ष्य" : "This wave",
        action: isHindi ? "सावधानी से पिकिंग जारी रखें" : "Keep picking steady & safe",
        shortWhy: isHindi ? "कन्वेयर पर थोड़ा जाम है" : "Conveyor is moving slow",
        target: isHindi ? "98%+ सही स्कैन रखें" : "Keep 98%+ accuracy",
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => setActiveModal("work"),
        secondaryBtnText: isHindi ? "स्टोर मैप" : "Store Map",
        secondaryAction: () => setActiveModal("map"),
      };
    }

    // 3. Support Completed / Intervention Succeeded (Intervention Memory)
    if (isSupportCompleted) {
      return {
        badge: isHindi ? "शाबाश 👍" : "SOLO READY 👍",
        duration: isHindi ? "सोलो शिफ्ट" : "Solo shift",
        action: isHindi ? "अकेले सोलो पिकिंग शुरू करें" : "Start solo order picking",
        shortWhy: isHindi ? "आपकी स्पीड अच्छी हो गई है" : "Pace is up with zero errors",
        target: isHindi ? "5 ऑर्डर अकेले पूरे करें" : "Pick 5 orders solo",
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => setActiveModal("work"),
        secondaryBtnText: isHindi ? "साथी से बात करें" : `Talk to ${buddyName}`,
        secondaryAction: () => setActiveSection("buddy"),
      };
    }

    const targetCapId = currentRecord?.recommendedAction?.targetCapabilityId || newHire.currentCapabilityId || 3;
    const targetCapDef = DARK_STORE_CAPABILITIES.find((c) => c.id === targetCapId);
    const targetCapName = targetCapDef ? (targetCapDef.id === 3 ? "Finding locations" : targetCapDef.name) : "Finding locations";

    // 4. Support Assigned / Prescribed Walkthrough
    if (isSupportAssigned) {
      return {
        badge: isHindi ? "आज का मुख्य कदम 🤝" : "TODAY'S MAIN STEP 🤝",
        duration: "15 min",
        action: isHindi ? `${buddyName} भैया के साथ फ्लोर वॉक` : "Floor walk with Buddy",
        shortWhy: isHindi ? "सामान ढूंढने में सुधार करें" : "Improve location finding",
        target: isHindi ? "5 सामान बिना भटके पिक करें" : "Pick 5 items without backtracking",
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => {
          setBuddyAlertSent(true);
          setActiveModal("buddy");
        },
        secondaryBtnText: isHindi ? "स्टोर मैप" : "Store Map",
        secondaryAction: () => setActiveModal("map"),
      };
    }

    // 5. Needs Help / Early Foundation
    if (isNeedsHelp) {
      return {
        badge: isHindi ? "अभ्यास 🤝" : "PRACTICE 🤝",
        duration: "10 min",
        action: isHindi ? "सामान ढूंढने का अभ्यास" : "Practice finding items",
        shortWhy: isHindi ? "शेल्फ कोड समझने में मदद लें" : "Learn shelf codes faster",
        target: isHindi ? "अगले 3 ऑर्डर सही पहचानें" : "Get next 3 shelf codes right",
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => setActiveSection("buddy"),
        secondaryBtnText: isHindi ? "शिफ्ट टूल्स" : "Floor Tools",
        secondaryAction: () => setActiveModal("work"),
      };
    }

    // 6. Default Steady Ramp
    return {
      badge: isHindi ? "आज का मुख्य काम 👍" : "TODAY'S FOCUS 👍",
      duration: isHindi ? "आज की शिफ्ट" : "Shift goal",
      action: isHindi ? "सही सामान पिक और स्कैन करें" : "Pick & scan orders accurately",
      shortWhy: isHindi ? "स्पीड अपने आप बढ़ जाएगी" : "Accuracy builds good speed",
      target: isHindi ? "98%+ सही स्कैन रखें" : "Keep 98%+ accuracy",
      primaryBtnText: isHindi ? "शुरू करें" : "START",
      primaryAction: () => setActiveModal("work"),
      secondaryBtnText: isHindi ? "मॉड्यूल" : "Modules",
      secondaryAction: () => setActiveSection("modules"),
    };
  };

  const status = getStatusContent();

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-28 select-none">
      {/* ========================================================= */}
      {/* 1. HOME: WHERE AM I? WHAT TO DO NOW? WHY? WHO HELPS?       */}
      {/* ========================================================= */}
      {activeSection === "home" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. PRIMARY: WHAT DO I NEED TO DO NOW? (DOMINANT PRESCRIPTION CARD) */}
          <div
            id="todays-focus-card"
            className="bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 rounded-[28px] p-5 sm:p-6 text-white shadow-xl shadow-purple-950/15 relative overflow-hidden space-y-4"
          >
            {/* Top Bar: Badge, Duration, Listen */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/20 text-white backdrop-blur-xs">
                  {status.badge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-purple-100 backdrop-blur-xs">
                  ⏱️ {status.duration}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handlePlayAudio(
                    "status-card",
                    `${status.action}. ${status.duration}. ${status.shortWhy}. ${status.target || ""}`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-950 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Listen aloud"
              >
                <Volume2
                  className={`w-4 h-4 ${
                    playingAudioId === "status-card" ? "text-purple-600 animate-bounce" : "text-slate-800"
                  }`}
                />
                <span>{isHindi ? "सुनिए" : "Listen"}</span>
              </button>
            </div>

            {/* MAIN ACTION: Largest / strongest text */}
            <div className="space-y-1.5 pt-0.5">
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                {status.action}
              </h2>
              {/* SHORT REASON: Medium text */}
              <p className="text-base sm:text-lg font-semibold text-purple-100 leading-snug">
                {status.shortWhy}
              </p>
              {/* TARGET: Supporting info */}
              {status.target && (
                <p className="text-xs sm:text-sm font-medium text-purple-200/90 pt-0.5">
                  🎯 {status.target}
                </p>
              )}
            </div>

            {/* START BUTTON: Large, prominent, and clear */}
            <div className="pt-1 space-y-2.5">
              <button
                id="home-primary-cta-btn"
                type="button"
                onClick={status.primaryAction}
                className="w-full py-4 px-6 rounded-2xl bg-white text-slate-950 hover:bg-slate-50 font-black text-base sm:text-lg shadow-lg shadow-black/15 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-white"
              >
                <span>{status.primaryBtnText}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              {status.secondaryBtnText && (
                <div className="flex justify-center pt-0.5">
                  <button
                    type="button"
                    onClick={status.secondaryAction}
                    className="text-xs sm:text-sm font-bold text-white/80 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    {status.secondaryBtnText} →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. YESTERDAY — QUICK SNAPSHOT & WHAT IT MEANS */}
          <LearnerDailyReportCard
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
            onOpenDashboard={() => setActiveSection("dashboard")}
            onOpenWorkTools={() => setActiveModal("work")}
            onOpenBuddy={() => setActiveSection("buddy")}
            onOpenModules={() => setActiveSection("modules")}
          />

          {/* 3. NEED HELP? 1-TAP BUDDY ASSIST */}
          <div className="bg-white rounded-[24px] p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0 font-bold text-base">
                🤝
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {isHindi ? `साथी ${newHire.buddy.split(" ")[0]} फ्लोर पर हैं` : `Buddy ${newHire.buddy.split(" ")[0]} is on floor`}
                </h4>
                <p className="text-xs text-slate-500 truncate font-medium mt-0.5">
                  {isHindi ? "कोई सवाल हो तो तुरंत पूछें" : "Need help? Tap to talk or call to rack"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection("buddy")}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              {isHindi ? "पूछें 🗣️" : "Ask 🗣️"}
            </button>
          </div>

          {/* 4. MY JOB-READY JOURNEY AT THE BOTTOM */}
          <LearnerJourneyRoadmap
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
            onSelectStage={() => setActiveSection("dashboard")}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODULES: 10-DAY LMS TRAINING JOURNEY                   */}
      {/* ========================================================= */}
      {activeSection === "modules" && (
        <ModulesView
          newHire={newHire}
          onUpdateHire={onUpdateHire}
          isHindi={isHindi}
        />
      )}

      {/* ========================================================= */}
      {/* 3. DIAL: FLOOR TELEMETRY & SPEED DIAL GAUGE               */}
      {/* ========================================================= */}
      {activeSection === "dial" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Dial Gauge Widget */}
          <CircularDialWidget
            pickRate={currentRecord.workSignal?.actualPickRate ?? 35}
            targetPickRate={currentRecord.workSignal?.targetPickRate ?? 50}
            accuracyRate={currentRecord.workSignal?.accuracyRate ?? 98}
            readinessScore={newHire.readinessScore ?? 74}
            onCallBuddy={() => setActiveSection("buddy")}
            onScannerFix={() => setActiveModal("scanner")}
            onAisleMap={() => setActiveModal("map")}
            onOpenTarget={() => setActiveModal("target")}
            isHindi={isHindi}
          />

          {/* Store Zone Bottlenecks & Route Intelligence */}
          <StoreZonesGrid
            currentPickRate={currentRecord.workSignal?.actualPickRate ?? 35}
            targetPickRate={currentRecord.workSignal?.targetPickRate ?? 50}
            onSelectZone={(zoneId) => {
              if (zoneId === "scanner_dock") {
                setActiveModal("scanner");
              } else if (zoneId === "buddy_desk") {
                setActiveSection("buddy");
              } else {
                setActiveModal("map");
              }
            }}
            isHindi={isHindi}
            activeZoneId={currentDay === 3 ? "aisles_4_8" : "aisles_1_3"}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BUDDY: LET ME TALK TO SOMEONE (VOICE-FIRST & NATURAL)  */}
      {/* ========================================================= */}
      {activeSection === "buddy" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Buddy Profile & Live Floor Stance */}
          <div className="bg-white rounded-[28px] p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Buddy Vikram"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div>
                <h3 className="text-base font-black text-slate-900">{newHire.buddy}</h3>
                <p className="text-xs text-slate-500 font-medium">Senior Floor Buddy</p>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
                  🟢 {isHindi ? "फ्लोर पर हैं (Aisles 4-8)" : "On Floor (Aisles 4-8)"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setBuddyAlertSent(true);
                setActiveModal("buddy");
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>{isHindi ? "बुलाएं" : "Call to Rack"}</span>
            </button>
          </div>

          {/* Voice-First Push-to-Talk Action Bar */}
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-white rounded-[28px] p-4 sm:p-5 border border-purple-100/90 shadow-2xs space-y-3.5">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {isHindi ? "विक्रम भैया से पूछें" : "Talk to Buddy Vikram"}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {isHindi
                  ? "माइक दबाकर सवाल बोलें, विक्रम भैया जवाब देंगे:"
                  : "Tap the mic and speak naturally. Vikram answers aloud:"}
              </p>
            </div>

            <button
              id="big-voice-speak-btn"
              type="button"
              onClick={handleToggleVoice}
              disabled={isProcessing}
              className={`w-full py-4 px-4 rounded-[26px] font-black text-base flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse"
                  : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:opacity-95 text-white shadow-purple-500/25"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-spin" />
                  <span>{isHindi ? "🔴 सुन रहा हूं... बोलिए" : "🔴 Listening... Speak now"}</span>
                </>
              ) : isProcessing ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{isHindi ? "समझ रहा हूं..." : "Understanding question..."}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>{isHindi ? "बोल कर पूछें (Tap to Speak)" : "Tap to Speak"}</span>
                </>
              )}
            </button>

            {/* Collapsible text typing fallback for noisy floor */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowTextInput(!showTextInput)}
                className="text-xs text-slate-500 hover:text-purple-700 font-semibold underline underline-offset-2 cursor-pointer"
              >
                {showTextInput
                  ? isHindi ? "टाइपिंग छुपाएं" : "Hide typing"
                  : isHindi ? "या लिख कर पूछें" : "Or type question"}
              </button>
            </div>

            {showTextInput && (
              <div className="flex items-center gap-2 animate-in fade-in duration-100">
                <input
                  id="learner-text-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={isHindi ? "सवाल लिखें..." : "Type your question..."}
                  disabled={isProcessing}
                  className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs font-medium"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputText.trim()}
                  className="p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-30 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Conversation Exchange Card */}
          {latestInteraction ? (
            <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-purple-100/90 shadow-md space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  {isHindi ? "विक्रम भैया का जवाब" : "Vikram's Answer"}
                </span>
                <button
                  onClick={() => handlePlayAudio("latest-interaction", latestInteraction.replyText)}
                  className="flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 bg-purple-50 px-3 py-1 rounded-full cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? "दोबारा सुनें" : "Replay"}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 italic">
                🗣️ "{latestInteraction.userText}"
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {latestInteraction.replyText}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleToggleVoice}
                  className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isHindi ? "दूसरा सवाल पूछें" : "Ask follow-up question"}</span>
                </button>
                <span className="text-xs text-slate-400 font-medium">{latestInteraction.timestamp}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-4 border border-purple-100/80 text-xs sm:text-sm text-slate-700 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="leading-snug font-medium">
                {isHindi
                  ? "माइक दबाकर बोलें या नीचे दिए गए आम सवालों में से एक चुनें।"
                  : "Tap the mic above or tap any quick question below."}
              </p>
            </div>
          )}

          {/* Voice Practice Situation Chips */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              {isHindi ? "आम सवाल (टैप करें):" : "Quick Questions (Tap to Ask):"}
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(isHindi
                ? [
                    "आइसल 4 से 8 में सामान ढूंढना",
                    "दूध और दही का कोल्ड रूम कहां है?",
                    "स्कैनर बारकोड नहीं पढ़ रहा",
                    "सामान का पैकेट फटा हुआ है",
                    "भारी सामान टोट में कैसे रखें?",
                  ]
                : [
                    "Finding Aisles 4 to 8 items",
                    "Where is cold dairy?",
                    "Scanner not reading barcode",
                    "Damaged package check",
                    "Heavy items tote packing",
                  ]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-full bg-white hover:bg-violet-50 text-slate-800 hover:text-violet-900 border border-slate-200 text-xs font-semibold whitespace-nowrap shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DASHBOARD: WHAT HAVE I LEARNED & JOB READINESS VISUAL  */}
      {/* ========================================================= */}
      {activeSection === "dashboard" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. INTERACTIVE 6-STAGE ROADMAP */}
          <LearnerJourneyRoadmap
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
          />

          {/* 2. THE PRIMARY VISUAL: THE JOB-READY HUMAN FIGURE */}
          <JobReadyHumanFigure
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
          />

          {/* 3. DAILY SHIFT REPORT & CONTINUITY (CLICKABLE FOR FULL SUMMARY MODAL) */}
          <LearnerDailyReportCard
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
            isDashboardVariant={true}
            onOpenDetailedModal={() => setActiveModal("yesterday_detail")}
            onOpenWorkTools={() => setActiveModal("work")}
            onOpenBuddy={() => setActiveSection("buddy")}
            onOpenModules={() => setActiveSection("modules")}
          />

          {/* Quick Bridge Card to Floor Shift & Training Modules */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 rounded-[26px] p-4 text-white shadow-md border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isHindi ? "शिफ्ट टूल्स" : "Floor Shift"}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium leading-tight">
                  {isHindi ? "पिक रेट डायल, स्टोर मैप व गाइड" : "Pick dial, store zone map & guides"}
                </p>
              </div>
              <button
                onClick={() => setActiveModal("work")}
                className="w-full py-2 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-transform hover:bg-slate-100"
              >
                {isHindi ? "टूल्स खोलें 🛠️" : "Floor Tools 🛠️"}
              </button>
            </div>

            <div className="bg-violet-900 rounded-[26px] p-4 text-white shadow-md border border-violet-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-violet-300 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isHindi ? "एलएमएस मॉड्यूल" : "LMS Training"}</span>
                </div>
                <p className="text-xs text-violet-200 mt-1 font-medium leading-tight">
                  {newHire.modulesCompleted ?? 3}/10 {isHindi ? "मॉड्यूल पूरे" : "Modules done"}
                </p>
              </div>
              <button
                onClick={() => setActiveSection("modules")}
                className="w-full py-2 rounded-xl bg-white text-violet-950 text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-transform hover:bg-violet-50"
              >
                {isHindi ? "मॉड्यूल देखें 📚" : "View Modules 📚"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING BAR MENU: APPLE GLASS TRANSLUCENT                */}
      {/* ========================================================= */}
      <FloatingGlassMenu
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isHindi={isHindi}
        hasAttention={isNeedsHelp || isSupportAssigned}
        buddyAssigned={isSupportAssigned}
      />

      {/* ========================================================= */}
      {/* MODAL 1: DARK STORE AISLE & ITEM MAP                      */}
      {/* ========================================================= */}
      {activeModal === "map" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHindi ? "डार्क स्टोर गाइड" : "Dark Store Aisle Map"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Dark Store #104</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {isHindi
                ? "सामान का प्रकार चुनें, साथी तुरंत दिशा बताएगा:"
                : "Select an item to get instant floor directions:"}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveModal(null);
                  handleSendMessage(
                    isHindi
                      ? "दही, दूध और पनीर का कोल्ड रूम कहां है?"
                      : "Where is the cold dairy section?"
                  );
                }}
                className="p-3 rounded-2xl border border-blue-200 bg-blue-50/70 text-left hover:bg-blue-100 cursor-pointer"
              >
                <span className="font-bold text-blue-950 block">🥛 Dairy & Milk</span>
                <span className="text-[10px] text-blue-700 font-semibold">Aisle 8 (Cold Room)</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleSendMessage(
                    isHindi
                      ? "चिप्स, बिस्कुट और स्नैक्स कहां रखे हैं?"
                      : "Where are chips and snacks?"
                  );
                }}
                className="p-3 rounded-2xl border border-amber-200 bg-amber-50/70 text-left hover:bg-amber-100 cursor-pointer"
              >
                <span className="font-bold text-amber-950 block">🍪 Snacks & Maggi</span>
                <span className="text-[10px] text-amber-700 font-semibold">Aisles 1 & 2 (Front)</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleSendMessage(
                    isHindi
                      ? "आटा, चावल और तेल की बोरियां कहां हैं?"
                      : "Where is flour, rice and oil?"
                  );
                }}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-left hover:bg-emerald-100 cursor-pointer"
              >
                <span className="font-bold text-emerald-950 block">🌾 Atta, Rice & Oil</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Aisles 4, 5, 6</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleSendMessage(
                    isHindi
                      ? "साबुन और सर्फ कहां रखे हैं?"
                      : "Where are soaps and cleaning?"
                  );
                }}
                className="p-3 rounded-2xl border border-purple-200 bg-purple-50/70 text-left hover:bg-purple-100 cursor-pointer"
              >
                <span className="font-bold text-purple-950 block">🧼 Soaps & Surf</span>
                <span className="text-[10px] text-purple-700 font-semibold">Aisle 7</span>
              </button>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Close Guide"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CALL BUDDY VIKRAM                                */}
      {/* ========================================================= */}
      {activeModal === "buddy" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150 text-center">
            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Buddy Vikram"
                className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md mb-2"
              />
              <h3 className="text-base font-bold text-slate-900">
                {newHire.buddy}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Senior Floor Buddy</p>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1.5 border border-emerald-200">
                🟢 {isHindi ? "फ्लोर पर एक्टिव हैं" : "On Duty on Floor"}
              </span>
            </div>

            {buddyAlertSent ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-emerald-900">
                  {isHindi ? "✅ विक्रम भैया को सूचना भेज दी गई!" : "✅ Alert sent to Vikram!"}
                </p>
                <p className="text-[11px] text-emerald-800">
                  {isHindi
                    ? "वो 2 मिनट में आपके रैक के पास पहुंच रहे हैं।"
                    : "He will walk over to your rack in 2 minutes."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setBuddyAlertSent(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {isHindi ? "विक्रम भैया को यहां बुलाओ" : "Call Vikram to My Rack"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-500">
                  {isHindi
                    ? "अगर कोई सामान नहीं मिल रहा तो तुरंत पूछें, झिझकें नहीं।"
                    : "Never hesitate to ask your buddy. They are here to help you ramp up!"}
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
            >
              {isHindi ? "वापस जाएं" : "Back to Shift"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SCANNER TROUBLESHOOTING                          */}
      {/* ========================================================= */}
      {activeModal === "scanner" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHindi ? "स्कैनर काम ना करे तो?" : "Scanner Troubleshooting"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? "2 मिनट का आसान हल" : "2 quick fixes"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-purple-950 block font-bold">
                    {isHindi ? "लाल शीशा साफ करें" : "Clean red laser glass"}
                  </strong>
                  <p className="text-[11px] text-purple-900 mt-0.5">
                    {isHindi
                      ? "स्कैनर के आगे का ग्लास अपनी टी-शर्ट या सूखे कपड़े से पोंछें।"
                      : "Dust often blocks the laser. Wipe the front glass with a dry cloth."}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-blue-950 block font-bold">
                    {isHindi ? "दूरी सही रखें (15 सेमी)" : "Hold 15cm from barcode"}
                  </strong>
                  <p className="text-[11px] text-blue-900 mt-0.5">
                    {isHindi
                      ? "स्कैनर को पैकेट से बहुत चिपकाएं नहीं, 15 सेमी दूर रखकर ट्रिगर दबाएं।"
                      : "Don't press against the label. Keep 15cm distance."}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {isHindi ? "फिर भी ना चले?" : "Still not working?"}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isHindi
                      ? "डिस्पैच टेबल पर जाएं और 1 मिनट में दूसरा चार्जर/स्कैनर ले लें।"
                      : "Swap device at the main packing desk immediately."}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
            >
              {isHindi ? "समझ गया 👍" : "Got it 👍"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: TODAY'S TARGET & RAMP GOAL                      */}
      {/* ========================================================= */}
      {activeModal === "target" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHindi ? "आज का पिकिंग लक्ष्य" : "Today's Target"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Day {currentDay} of 14</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    {isHindi ? "एक्यूरेसी (सही सामान)" : "Scanning Accuracy"}
                  </span>
                  <span className="text-[11px] text-emerald-700">Target: 95%+</span>
                </div>
                <span className="text-lg font-black text-emerald-700">98% 👍</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-950 block">
                    {isHindi ? "पिक स्पीड (सामान/घंटा)" : "Pick Speed"}
                  </span>
                  <span className="text-[11px] text-blue-700">
                    {isSupportCompleted ? "After walkthrough" : "Day 3 ramp expectation"}
                  </span>
                </div>
                <span className="text-lg font-black text-blue-700">
                  {isSupportCompleted ? "48/hr" : "35 / 50"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                {isHindi
                  ? "💡 याद रखें: शुरुआत में एक्यूरेसी (सही सामान उठाना) स्पीड से ज्यादा जरूरी है। स्पीड अपने आप बढ़ जाएगी!"
                  : "💡 Remember: High accuracy is more important than raw speed. Speed naturally builds up as you memorize the aisles."}
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
            >
              {isHindi ? "समझ गया 👍" : "Got it 👍"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: FULL FLOOR REFERENCE TOOLS MODAL                */}
      {/* ========================================================= */}
      {activeModal === "work" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl max-w-md w-full p-4 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isHindi ? "ऑन-फ्लोर शिफ्ट टूल्स" : "On-Floor Shift Tools"}
                  </h3>
                  <p className="text-[10px] text-slate-500">Dark Store #104 • Day {currentDay}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Dial */}
            <CircularDialWidget
              pickRate={currentRecord.pickRate || 35}
              targetPickRate={50}
              accuracyRate={currentRecord.errorRate === 0 ? 100 : Math.max(88, Math.round(100 - (currentRecord.errorRate || 2) * 4))}
              readinessScore={Math.round((newHire.rampProgress || 0.65) * 100)}
              onCallBuddy={() => setActiveModal("buddy")}
              onScannerFix={() => setActiveModal("scanner")}
              onAisleMap={() => setActiveModal("map")}
              onOpenTarget={() => setActiveModal("target")}
              isHindi={isHindi}
            />

            {/* Store Zones Grid */}
            <StoreZonesGrid
              onSelectZone={(zoneId, zoneName) => {
                setActiveModal(null);
                if (zoneId === "aisles_4_8") {
                  handleSendMessage(
                    isHindi
                      ? "आइसल 4 से 8 में सामान ढूंढने में देर लग रही है, मदद चाहिए।"
                      : "Taking longer in Aisles 4-8. Where are the bulk grocery items?"
                  );
                } else if (zoneId === "cold_room") {
                  handleSendMessage(
                    isHindi
                      ? "दूध और दही का कोल्ड रूम कहां है?"
                      : "Where is the cold room for dairy and frozen milk?"
                  );
                } else if (zoneId === "scanner_dock") {
                  setActiveModal("scanner");
                } else if (zoneId === "buddy_desk") {
                  setActiveModal("buddy");
                } else {
                  handleSendMessage(
                    isHindi
                      ? `${zoneName} के बारे में बताएं`
                      : `Guide me to ${zoneName}`
                  );
                }
              }}
              isHindi={isHindi}
              activeZoneId={currentDay === 3 ? "aisles_4_8" : "aisles_1_3"}
            />

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Close Floor Tools"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: YESTERDAY SHIFT FULL DETAIL MODAL               */}
      {/* ========================================================= */}
      {activeModal === "yesterday_detail" && (
        <YesterdayShiftDetailModal
          newHire={newHire}
          currentDay={currentDay}
          isHindi={isHindi}
          onClose={() => setActiveModal(null)}
          onOpenWorkTools={() => {
            setActiveModal("work");
          }}
          onOpenModules={() => {
            setActiveModal(null);
            setActiveSection("modules");
          }}
          onOpenBuddy={() => {
            setActiveModal(null);
            setActiveSection("buddy");
          }}
        />
      )}
    </div>
  );
};
