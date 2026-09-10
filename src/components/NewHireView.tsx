import React, { useState, useEffect } from "react";
import { NewHire, DailySignal, DARK_STORE_CAPABILITIES } from "../types";
import { analyzeDailyReport, assessReadiness } from "../services/intelligence";
import { speakMessage, stopSpeaking } from "../utils/speech";
import { CircularDialWidget } from "./CircularDialWidget";
import { StoreZonesGrid } from "./StoreZonesGrid";
import { JobReadyHumanFigure } from "./JobReadyHumanFigure";
import { ModulesView } from "./ModulesView";
import { TenDaySkillJourneyView } from "./TenDaySkillJourneyView";
import { FloatingGlassMenu, LearnerSection } from "./FloatingGlassMenu";
import { LearnerJourneyRoadmap } from "./LearnerJourneyRoadmap";
import { LearnerDailyReportCard } from "./LearnerDailyReportCard";
import { YesterdayShiftDetailModal } from "./YesterdayShiftDetailModal";
import { TodaysGoalLandingView } from "./TodaysGoalLandingView";
import { DailyCoachReportView } from "./DailyCoachReportView";
import { DashboardHeader } from "./DashboardHeader";
import { CommercialCertificationCard } from "./CommercialCertificationCard";
import {  Mic,
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
  ChevronRight, ChevronUp,
  Footprints,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Clock,
  Compass,
  Eye,
  Globe,
  ChevronDown,
  Check,
  Bell,
  ArrowUpRight,
  ArrowDownUp,
  ArrowDownRight,
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
  onOpenOnboarding?: () => void;
  onOpenManagerConsole?: () => void;
  newHires?: NewHire[];
  onSelectHire?: (hireId: string) => void;
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
  onOpenOnboarding,
  onOpenManagerConsole,
  newHires,
  onSelectHire,
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

  // Language state: true = Hindi / Hinglish, false = Simple English (Default English)
  const [localIsHindi, setLocalIsHindi] = useState<boolean>(false);
  const isHindi = propIsHindi !== undefined ? propIsHindi : localIsHindi;
  const setIsHindi = propSetIsHindi || setLocalIsHindi;

  // Active learner navigation tab: "home" | "modules" | "dial" | "dashboard" | "buddy"
  const [localActiveSection, setLocalActiveSection] = useState<LearnerSection>("home");
  const activeSection = propActiveSection !== undefined ? propActiveSection : localActiveSection;
  const setActiveSection = propOnSelectSection || setLocalActiveSection;

  // Learner Switcher Dropdown local states
  const [isLearnerDropdownOpen, setIsLearnerDropdownOpen] = useState<boolean>(false);
  const [showNextStepModal, setShowNextStepModal] = useState<boolean>(false);
  const learnerDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const buttonEl = document.getElementById("home-learner-dropdown-btn");
      const popoverEl = document.getElementById("home-learner-dropdown-popover");
      if (
        buttonEl?.contains(event.target as Node) || 
        popoverEl?.contains(event.target as Node) ||
        (learnerDropdownRef.current && learnerDropdownRef.current.contains(event.target as Node))
      ) {
        return;
      }
      setIsLearnerDropdownOpen(false);
    };
    if (isLearnerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLearnerDropdownOpen]);

  // Active quick action modal
  const [activeModal, setActiveModal] = useState<"map" | "buddy" | "scanner" | "target" | "work" | "yesterday_detail" | null>(null);
  const [buddyAlertSent, setBuddyAlertSent] = useState<boolean>(false);
  const [showTodaysGoalView, setShowTodaysGoalView] = useState<boolean>(false);
  const [showDailyCoachReport, setShowDailyCoachReport] = useState<boolean>(false);
  const [selectedDeepLinkModuleId, setSelectedDeepLinkModuleId] = useState<string | null>(null);
  const [activeFloorTaskId, setActiveFloorTaskId] = useState<string | null>("t1");
  const [completedFloorTasks, setCompletedFloorTasks] = useState<Record<string, boolean>>({
    "t1_sub1": false,
    "t1_sub2": false,
    "t1_sub3": false,
    "t2_sub1": false,
    "t2_sub2": false,
    "t2_sub3": false,
    "t3_sub1": false,
    "t3_sub2": false,
    "t3_sub3": false,
    "t4_sub1": false,
    "t4_sub2": false,
  });

  const [completedWorkChecklist, setCompletedWorkChecklist] = useState<Record<string, boolean>>({
    walk: false,
    seal: false,
    pack: false,
  });
  const [completedScannerChecklist, setCompletedScannerChecklist] = useState<Record<string, boolean>>({
    laser: false,
    dist: false,
    battery: false,
  });
  const [completedTargetChecklist, setCompletedTargetChecklist] = useState<Record<string, boolean>>({
    orders: false,
    pacing: false,
    report: false,
  });

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

  // Authoritative Overall Job Readiness calculation
  const authoritativeReadiness = typeof newHire.overallReadinessScore === "number"
    ? (newHire.overallReadinessScore <= 1 ? Math.round(newHire.overallReadinessScore * 100) : Math.round(newHire.overallReadinessScore))
    : (newHire.capabilities ? assessReadiness(newHire.capabilities, newHire) : undefined);

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

    // 6. Insufficient Evidence
    if (
      currentRecord.recommendedAction?.decisionType === "no_action_monitor" ||
      currentRecord.identifiedPattern?.category === "insufficient_evidence"
    ) {
      return {
        badge: isHindi ? "सामान्य काम 👍" : "NORMAL WORK 👍",
        duration: isHindi ? "आज की शिफ्ट" : "Shift goal",
        action: isHindi ? "आज का सामान्य काम जारी रखें" : "Continue today's normal work",
        shortWhy: isHindi ? "हम अभी आपके प्रदर्शन को समझ रहे हैं।" : "We're still learning about your performance.",
        target: "", // No target
        primaryBtnText: isHindi ? "शुरू करें" : "START",
        primaryAction: () => setActiveModal("work"),
        secondaryBtnText: isHindi ? "मॉड्यूल" : "Modules",
        secondaryAction: () => setActiveSection("modules"),
      };
    }

    // 7. Default Steady Ramp
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

  if (showTodaysGoalView) {
    return (
      <TodaysGoalLandingView
        newHire={newHire}
        currentDay={currentDay}
        isHindi={isHindi}
        onToggleLanguage={() => setIsHindi(!isHindi)}
        onBack={() => setShowTodaysGoalView(false)}
        onSelectSection={setActiveSection}
        onUpdateHire={onUpdateHire}
        onOpenBuddy={() => setActiveSection("buddy")}
        onSelectModuleWithId={(modId) => {
          setSelectedDeepLinkModuleId(modId);
          setActiveSection("modules");
          setShowTodaysGoalView(false);
        }}
        onSelectFloorTask={(modalType) => {
          setActiveSection("dial");
          if (modalType === "map" || modalType === "buddy") {
            setActiveFloorTaskId("t1");
          } else if (modalType === "scanner") {
            setActiveFloorTaskId("t2");
          } else if (modalType === "work") {
            setActiveFloorTaskId("t3");
          } else if (modalType === "target") {
            setActiveFloorTaskId("t4");
          }
          setShowTodaysGoalView(false);
        }}
      />
    );
  }

  if (activeSection === "modules") {
    return (
      <div 
        id="modules-view-container" 
        className="max-w-md mx-auto pb-36 select-none min-h-screen relative bg-[#0a0b0e] text-white overflow-hidden animate-in fade-in duration-200"
      >
        {/* Subtle dark ambient accents */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 -right-16 w-80 h-80 bg-indigo-950/15 rounded-full blur-3xl pointer-events-none z-0" />
        
        {/* Content wrapper */}
        <div className="relative z-10">
          <ModulesView
            newHire={newHire}
            onUpdateHire={onUpdateHire}
            isHindi={isHindi}
            initialModuleId={selectedDeepLinkModuleId}
            currentDay={currentDay}
          />
        </div>
        <FloatingGlassMenu
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          isHindi={isHindi}
          hasAttention={isNeedsHelp || isSupportAssigned}
          buddyAssigned={isSupportAssigned}
        />
      </div>
    );
  }

  if (activeSection === "home") {
    return (
      <div 
        className="max-w-md mx-auto pb-36 select-none min-h-screen relative bg-[#14161d]"
      >
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-0" />
        
        {/* Content wrapper */}
        <div className="relative z-10 space-y-4">
          {/* 1. HERO BANNER: ADOPTING EXACT SCREENSHOT HERO CARD COLOR & STACKED DECK LAYOUT (ENLARGED) */}
          <div
            id="todays-focus-card"
            className="hero-card-screenshot-bg rounded-b-[54px] pt-9 pb-8 sm:pt-11 sm:pb-10 px-6 sm:px-8 text-white shadow-[0_24px_50px_-12px_rgba(14,64,156,0.65)] border-b border-white/20 relative space-y-6 sm:space-y-7 overflow-hidden"
          >
            {/* Luminous soft radial glow inside bottom of the card */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_92%,rgba(33,136,248,0.5)_0%,transparent_64%)] z-0" />

            {/* Top Bar: Profile Avatar (Left) & Notification Bell + Language Controls (Right) */}
            <div className="flex items-center justify-between relative z-30">
              {/* Profile selector avatar dropdown */}
              <div className="relative" ref={learnerDropdownRef}>
                <button
                  type="button"
                  id="home-learner-dropdown-btn"
                  onClick={() => setIsLearnerDropdownOpen((prev) => !prev)}
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shadow-lg cursor-pointer active:scale-95 transition-transform shrink-0 block"
                  title={newHire.name}
                >
                  <img
                    src={newHire.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={newHire.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {isLearnerDropdownOpen && newHires && (
                  <div
                    id="home-learner-dropdown-popover"
                    className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#092252]/95 border border-white/20 shadow-2xl py-1.5 z-50 text-white text-xs font-bold animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-blue-200/70 border-b border-white/10 mb-1">
                      {isHindi ? "प्रोफ़ाइल बदलें" : "Switch Profile"}
                    </div>
                    {newHires.map((hire) => (
                      <button
                        key={hire.id}
                        type="button"
                        onClick={() => {
                          if (onSelectHire) onSelectHire(hire.id);
                          setIsLearnerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer ${
                          hire.id === newHire.id ? "text-cyan-300 font-bold" : "text-blue-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30 shrink-0">
                            <img
                              src={hire.avatar}
                              alt={hire.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="truncate">{hire.name}</span>
                        </div>
                        {hire.id === newHire.id && <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Language toggle, Manager Console, and Bell Notification Icon */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsHindi(!isHindi)}
                  className="px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white cursor-pointer active:scale-95 transition-all text-xs font-bold shadow-xs backdrop-blur-md"
                  title="Toggle Language"
                >
                  <span>{isHindi ? "EN" : "HI"}</span>
                </button>

                {onOpenManagerConsole && (
                  <button
                    type="button"
                    onClick={onOpenManagerConsole}
                    className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center shadow-xs backdrop-blur-md"
                    title={isHindi ? "मैनेजर कंसोल" : "Manager Console"}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                )}

                {/* Frosted circular Bell button matching screenshot */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNextStepModal(true)}
                    className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow-xs"
                    title={isHindi ? "अलर्ट व अगला कदम" : "Alerts & Next Step"}
                  >
                    <Bell className="w-6 h-6 text-white stroke-[2.2]" />
                  </button>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#06296b] absolute top-1.5 right-1.5 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Center Area: Role Readiness label & 22% & Days Remaining Pill */}
            <div className="flex flex-col items-center justify-center text-center pt-2 relative z-10 space-y-2.5">
              <span className="text-base sm:text-lg font-semibold text-blue-200/90 tracking-wider uppercase">
                {isHindi ? "रोल रेडीनेस" : "Role Readiness"}
              </span>

              <div className="flex items-baseline justify-center">
                <span className="text-[72px] sm:text-[84px] font-black text-white tracking-tight leading-none drop-shadow-md font-sans">
                  {authoritativeReadiness ?? 22}%
                </span>
              </div>

              {/* Days Remaining Pill: e.g. 6 days remaining */}
              {(() => {
                const daysRemaining = Math.max(1, 10 - currentDay);
                return (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowNextStepModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-blue-100 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Clock className="w-4 h-4 text-cyan-300 stroke-[2.5]" />
                      <span>
                        {isHindi
                          ? `${daysRemaining} दिन शेष`
                          : `${daysRemaining} ${daysRemaining === 1 ? "day remaining" : "days remaining"}`}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Stacked Card Layers (Layered deck with Date and 'Start your day') */}
            <div className="pt-4 relative z-10">
              {/* Layer 1 - back-most card peek */}
              <div className="w-[82%] h-2.5 bg-white/10 rounded-t-xl mx-auto -mb-1 backdrop-blur-xs border-t border-white/10" />
              
              {/* Layer 2 - middle card peek */}
              <div className="w-[91%] h-2.5 bg-white/15 rounded-t-2xl mx-auto -mb-1 backdrop-blur-xs border-t border-white/15" />

              {/* Layer 3 - front card: numbers replaced to date (same fonts), VISA replaced to Start your day */}
              <div
                onClick={() => setShowTodaysGoalView(true)}
                className="w-full bg-white/[0.18] hover:bg-white/[0.24] backdrop-blur-md border border-white/30 rounded-2xl p-4 sm:p-5 text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
              >
                {/* Numbers replaced to date, keeping the exact same fonts */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-white/90 group-hover:text-white transition-colors">
                    {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white/80">
                    DAY {currentDay} / 10
                  </span>
                </div>

                {/* VISA text replaced with 'Start your day' keeping italic tracking-widest font */}
                <div className="flex items-center gap-1.5">
                  <span className="font-black italic tracking-widest text-xs sm:text-sm text-white/95 drop-shadow-xs uppercase">
                    {isHindi ? "दिन शुरू करें" : "Start your day"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Pop-up Modal for Next Step Highlights & Context */}
          {showNextStepModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div 
                className="relative w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-5 overflow-hidden text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Title and Close button */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                        {isHindi ? "आपका अगला कदम" : "YOUR NEXT STEP"}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {isHindi ? "कौशल और शिफ्ट संदर्भ" : "Action Highlights & Context"}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNextStepModal(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Target action highlight */}
                <div className="mb-4 bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3">
                  <span className="text-[9.5px] font-black text-cyan-400 uppercase tracking-widest block mb-1">
                    {isHindi ? "आज का मुख्य लक्ष्य" : "TODAY'S TARGET FOCUS"}
                  </span>
                  <p className="text-sm font-black text-white leading-snug">
                    {status.target || status.action}
                  </p>
                </div>

                {/* Highlights Content: Next Skill Focus & Yesterday → Today Impact */}
                <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/10 space-y-3.5">
                  {/* 1. Next Skill to Improve Highlight */}
                  {(() => {
                    const decisionType = currentRecord.recommendedAction?.decisionType;
                    const targetCapId = currentRecord.recommendedAction?.targetCapabilityId;
                    const targetCapDef = targetCapId ? DARK_STORE_CAPABILITIES.find((c) => c.id === targetCapId) : null;
                    
                    const isEnvironmentIssue = decisionType === "tool_remedy" || decisionType === "environment_support" || decisionType === "communication_support";
                    const isInsufficient = decisionType === "no_action_monitor" || currentRecord.identifiedPattern?.category === "insufficient_evidence";
                    
                    if (isInsufficient || isEnvironmentIssue || !targetCapDef) {
                      return (
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wide">
                              {isHindi ? "कौशल स्थिति" : "SKILL FOCUS"}
                            </span>
                          </div>
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {isHindi ? "आप अच्छा कर रहे हैं" : "On Track"}
                          </span>
                        </div>
                      );
                    }

                    const isLevelUp = decisionType === "advance_default" || decisionType === "jump_ahead";
                    const statusBadge = isLevelUp 
                      ? (isHindi ? "अगला स्तर" : "Ready for next level") 
                      : (isHindi ? "अभ्यास की जरूरत" : "Needs practice");

                    return (
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              {isHindi ? "सुधारने का कौशल" : "NEXT SKILL"}
                            </span>
                            <span className="text-sm font-bold text-white truncate block">
                              {targetCapDef.name}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                          isLevelUp 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {statusBadge}
                        </span>
                      </div>
                    );
                  })()}

                  {/* 2. Yesterday → Today Progression Context */}
                  {(() => {
                    const decisionType = currentRecord.recommendedAction?.decisionType;
                    const isInsufficient = decisionType === "no_action_monitor" || currentRecord.identifiedPattern?.category === "insufficient_evidence";
                    const isSteady = decisionType === "advance_default" || decisionType === "jump_ahead";
                    
                    if (isInsufficient) {
                      return (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                            {isHindi ? "कल से आज" : "YESTERDAY → TODAY"}
                          </span>
                          <p className="text-slate-200 text-xs leading-relaxed">
                            {isHindi ? "हम अभी भी आपके काम को समझ रहे हैं।" : "We're still observing your baseline shift patterns."}
                          </p>
                        </div>
                      );
                    }

                    if (isSteady) {
                      return (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                            {isHindi ? "कल से आज" : "YESTERDAY → TODAY"}
                          </span>
                          <p className="text-emerald-300 font-semibold text-xs leading-relaxed">
                            {isHindi ? "आप लगातार अच्छा कर रहे हैं। आज का लक्ष्य पूरा करें।" : "Consistent high performance. Keep working on today's goal."}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                            {isHindi ? "कल" : "YESTERDAY"}
                          </span>
                          <p className="text-slate-200 text-xs leading-snug">
                            {status.shortWhy}
                          </p>
                        </div>
                        <div className="bg-cyan-500/15 rounded-xl p-3 border border-cyan-500/30">
                          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
                            {isHindi ? "आज" : "TODAY"}
                          </span>
                          <p className="text-white font-bold text-xs leading-snug">
                            {status.action}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Pop-up Action Button */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNextStepModal(false);
                      setShowTodaysGoalView(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-400"
                  >
                    <span>{status.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNextStepModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer active:scale-98 transition-all"
                  >
                    {isHindi ? "बंद करें" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wrapper for remaining sections below the full-bleed banner */}
          <div className="px-4 space-y-4">
            {/* SLEEK STATUS TAB: CURRENT DAY & ON-TRACK STATUS */}
            {(() => {
              const totalDays = 10;
              const isOnTrack = newHire.status === "Doing well" || currentRecord.statusAtEnd === "Doing well";

              return (
                <div
                  id="learner-training-status-tab"
                  className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-2.5 flex items-center justify-between backdrop-blur-md shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {isHindi ? "ट्रेनिंग दिन" : "Day"}
                    </span>
                    <span className="text-sm font-black text-white">
                      {currentDay} <span className="text-slate-500 font-bold text-xs">/ {totalDays}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnTrack ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-black tracking-wide ${
                        isOnTrack ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {isOnTrack
                        ? isHindi
                          ? "ऑन ट्रैक"
                          : "On Track"
                        : isHindi
                        ? "सुधार की जरूरत"
                        : "Needs Attention"}
                    </span>
                  </div>
                </div>
              );
            })()}

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

            {/* Quick Access: Revisit Onboarding Welcome Walkthrough */}
            {onOpenOnboarding && (
              <div className="pt-2 pb-1 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-purple-700 hover:text-purple-800 text-xs font-bold transition-all border border-purple-200/80 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isHindi ? "ऑनबोर्डिंग स्क्रीन देखें (Walkthrough)" : "View Onboarding Screen"}</span>
                </button>
              </div>
            )}

            {/* Quick Actions Row Moved to Bottom of Screen (Deposit / Arrow Up & Down / Withdraw) */}
            <div id="home-bottom-quick-actions" className="pt-2 pb-1">
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="bottom-action-deposit"
                  onClick={() => setShowTodaysGoalView(true)}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3.5 px-2 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer group"
                >
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 stroke-[2.5] group-hover:scale-110 transition-transform" />
                  <span className="truncate">{isHindi ? "लक्ष्य" : "Deposit"}</span>
                </button>

                <button
                  type="button"
                  id="bottom-action-transfer"
                  onClick={() => setActiveModal("work")}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3.5 px-2 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer group"
                  title={isHindi ? "फ्लोर टूल्स" : "Shift Tools"}
                >
                  <ArrowDownUp className="w-5 h-5 text-cyan-400 stroke-[2.5] group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  id="bottom-action-withdraw"
                  onClick={() => setShowNextStepModal(true)}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl py-3.5 px-2 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer group"
                >
                  <ArrowDownRight className="w-4 h-4 text-cyan-400 stroke-[2.5] group-hover:scale-110 transition-transform" />
                  <span className="truncate">{isHindi ? "टूल्स" : "Withdraw"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <FloatingGlassMenu
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          isHindi={isHindi}
          hasAttention={isNeedsHelp || isSupportAssigned}
          buddyAssigned={isSupportAssigned}
        />
      </div>
    );
  }

  if (activeSection === "dial") {
    return (
      <div 
        className="max-w-md mx-auto pb-36 select-none min-h-screen relative bg-[#14161d] animate-in fade-in duration-200"
      >
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-0" />
        
        {/* Content wrapper */}
        <div className="relative z-10 px-4 pt-4 space-y-4">
          {/* Main Dial Gauge Widget */}
          <CircularDialWidget
            pickRate={currentRecord.workSignal?.actualPickRate ?? 35}
            targetPickRate={currentRecord.workSignal?.targetPickRate ?? 50}
            accuracyRate={currentRecord.workSignal?.accuracyRate ?? 98}
            readinessScore={authoritativeReadiness}
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

          {/* ========================================================= */}
          {/* ACTIONABLE SHIFT TASKS & INLINE DRILL EXPERIENCE          */}
          {/* ========================================================= */}
          <div className="bg-white/10 backdrop-blur-md rounded-[28px] p-4 border border-white/20 shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {isHindi ? "सक्रिय कार्यसूची और जांच" : "Active Floor Checklist & Drills"}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                {isHindi ? "फ्लोर पर लाइव" : "Live Floor Practice"}
              </span>
            </div>

            {/* Total Sub-tasks completion progress bar */}
            <div className="space-y-1.5 bg-black/20 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>{isHindi ? "आज की प्रगति" : "Today's Task Completion"}</span>
                <span>
                  {Object.values(completedFloorTasks).filter(Boolean).length} / {Object.keys(completedFloorTasks).length} Completed
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                  style={{
                    width: `${(Object.values(completedFloorTasks).filter(Boolean).length / Object.keys(completedFloorTasks).length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "t1",
                  title: isHindi ? "आइसल 4 से 8 का वॉकथ्रू" : "Aisle 4-8 physical walkthrough",
                  category: isHindi ? "साथी वॉकथ्रू" : "Buddy Walk",
                  desc: isHindi ? "सीनियर साथी विक्रम के साथ मुख्य रैक लेआउट की लाइव जांच" : "Review physical shelf heights and coordinates with your buddy",
                  badge: isHindi ? "मैप वॉक" : "Map Walk",
                  checklist: [
                    { key: "t1_sub1", label: isHindi ? "रैक लेआउट और बारकोड की संरेखण जांचें" : "Verify bin coordinates align with PDA guidelines" },
                    { key: "t1_sub2", label: isHindi ? "लेवल 1 से 5 के रैक पर लेबल की भौतिक जांच करें" : "Trace vertical level labels (Levels 1 to 5) in Aisles 4-8" },
                    { key: "t1_sub3", label: isHindi ? "साथी विक्रम के साथ लाइव पोजिशन कैलिब्रेट करें" : "Confirm floor barcode integrity with Buddy Vikram" },
                  ]
                },
                {
                  id: "t2",
                  title: isHindi ? "फिंगर-रिंग स्कैनर और ऑर्डर पिकिंग" : "Pick 50 orders via ring-scanner",
                  category: isHindi ? "फ्लोर पिकिंग" : "Floor Pick",
                  desc: isHindi ? "फिंगर स्कैनर से बिना किसी गलत स्कैन के तेजी से सामान उठाना" : "Pick with 0 mis-scans using lightweight ring tool",
                  badge: isHindi ? "स्कैनर" : "Scanner",
                  checklist: [
                    { key: "t2_sub1", label: isHindi ? "फिंगर स्कैनर के लाल शीशे को साफ करें" : "Wipe and clean red laser glass lens" },
                    { key: "t2_sub2", label: isHindi ? "बारकोड से 15 सेंटीमीटर की सही दूरी पर स्कैन करें" : "Test scan at exact 15cm distance" },
                    { key: "t2_sub3", label: isHindi ? "लाइट पीली होने पर बैटरी को बदलें" : "Swap ring battery if indicator status turns yellow" },
                  ]
                },
                {
                  id: "t3",
                  title: isHindi ? "कोल्ड रूम डेयरी 90-सेकंड एसओपी" : "Cold Room dairy 90-sec SOP",
                  category: isHindi ? "गुणवत्ता व सुरक्षा" : "Quality SOP",
                  desc: isHindi ? "कोल्ड चेन डेयरी बैग्स और टोट्स को इंसुलेटेड पैक में सील करना" : "Complete temperature-controlled dairy packing",
                  badge: isHindi ? "कोल्ड चेन" : "Cold Chain",
                  checklist: [
                    { key: "t3_sub1", label: isHindi ? "कोल्ड रूम में प्रवेश/निकास 90 सेकंड में पूरा करें" : "Keep entry speed within 90-second safety window" },
                    { key: "t3_sub2", label: isHindi ? "थर्मल बैग सील को अच्छी तरह बंद करें" : "Fasten thermal seal on insulated packaging totes" },
                    { key: "t3_sub3", label: isHindi ? "कोल्ड चेन रूट लेबल को डिस्पैच से मैच करें" : "Attach cold-chain route tags matching dispatch table" },
                  ]
                },
                {
                  id: "t4",
                  title: isHindi ? "पिक रेट और शिफ्ट रिपोर्ट" : "Speed pacing & Shift Report",
                  category: isHindi ? "रिपोर्ट" : "Pacing & Report",
                  desc: isHindi ? "45 से अधिक UPH की स्पीड बनाए रखें और अपनी रिपोर्ट भेजें" : "Ensure continuous high-speed pick pacing on active shift",
                  badge: isHindi ? "रिपोर्ट" : "Report KPI",
                  checklist: [
                    { key: "t4_sub1", label: isHindi ? "45 UPH से अधिक की गति बनाए रखें" : "Maintain speed pacing goal of >45 UPH" },
                    { key: "t4_sub2", label: isHindi ? "डीन को शिफ्ट के अंत की वॉइस रिपोर्ट सबमिट करें" : "Submit end-of-shift status update voice check-in" },
                  ]
                }
              ].map((task) => {
                const isExpanded = activeFloorTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? "bg-black/35 border-cyan-400/50 shadow-md ring-2 ring-cyan-500/10"
                        : "bg-white/5 border-white/10 hover:border-white/20 shadow-2xs text-white"
                    }`}
                  >
                    {/* Header trigger */}
                    <div
                      onClick={() => setActiveFloorTaskId(isExpanded ? null : task.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpanded ? "bg-cyan-500 text-slate-950 font-black" : "bg-white/10 text-slate-200"
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-white">{task.title}</p>
                          <p className="text-[10px] text-slate-300 font-medium truncate">{task.desc}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isExpanded ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-slate-300"
                      }`}>
                        {task.badge}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-0 border-t border-white/10 space-y-2.5 bg-black/20 text-xs">
                        <div className="space-y-2">
                          {task.checklist.map((item) => {
                            const isSubCompleted = !!completedFloorTasks[item.key];
                            return (
                              <div
                                key={item.key}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompletedFloorTasks(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                                }}
                                className={`p-2.5 border rounded-xl flex items-start gap-2.5 cursor-pointer transition-all active:scale-[0.99] ${
                                  isSubCompleted
                                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-200"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubCompleted}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded mt-0.5 accent-emerald-500 shrink-0 cursor-pointer"
                                />
                                <span className={isSubCompleted ? "line-through text-slate-400 font-medium" : "font-bold text-slate-200"}>
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Auto-check all items in this task
                              const updated = { ...completedFloorTasks };
                              task.checklist.forEach(item => {
                                updated[item.key] = true;
                              });
                              setCompletedFloorTasks(updated);
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold transition-all cursor-pointer border border-white/15"
                          >
                            {isHindi ? "सभी पूर्ण करें" : "Mark All Done"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <FloatingGlassMenu
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          isHindi={isHindi}
          hasAttention={isNeedsHelp || isSupportAssigned}
          buddyAssigned={isSupportAssigned}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-36 select-none">
      {/* ========================================================= */}
      {/* 1. HOME: WHERE AM I? WHAT TO DO NOW? WHY? WHO HELPS?       */}
      {/* ========================================================= */}


      {activeSection === "journey" && (
        <div className="-mx-4 -my-3 px-4 py-4 min-h-screen bg-[#eaedf2] pb-36">
          <TenDaySkillJourneyView
            newHires={[newHire]}
            activeHireId={newHire.id}
            onSelectHire={() => {}}
            currentDay={currentDay}
            isLearnerMode={true}
            isHindi={isHindi}
            onToggleLanguage={() => setIsHindi(!isHindi)}
            onNavigateToSection={(sec) => setActiveSection(sec)}
            onOpenTodaysGoal={() => setShowTodaysGoalView(true)}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BUDDY: LET ME TALK TO SOMEONE (VOICE-FIRST & NATURAL)  */}
      {/* ========================================================= */}
      {activeSection === "buddy" && (
        <div className="space-y-4 animate-in fade-in duration-200 text-white">
          {/* Buddy Profile & Live Floor Stance */}
          <div className="bg-[#1b1e26] rounded-[28px] p-4 border border-white/10 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/Vikram%20Pic.jpeg"
                alt="Buddy Vikram"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div>
                <h3 className="text-base font-black text-white">{newHire.buddy}</h3>
                <p className="text-xs text-slate-300 font-medium">Senior Floor Buddy</p>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-500/25">
                  🟢 {isHindi ? "फ्लोर पर हैं (Aisles 4-8)" : "On Floor (Aisles 4-8)"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setBuddyAlertSent(true);
                setActiveModal("buddy");
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-full text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Phone className="w-4 h-4 text-slate-950" />
              <span>{isHindi ? "बुलाएं" : "Call to Rack"}</span>
            </button>
          </div>

          {/* Voice-First Push-to-Talk Action Bar */}
          <div className="bg-[#1b1e26] rounded-[28px] p-4 sm:p-5 border border-white/10 shadow-xl space-y-3.5">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                {isHindi ? "विक्रम भैया से पूछें" : "Talk to Buddy Vikram"}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
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
                  ? "bg-rose-600 text-white ring-4 ring-rose-600/30 animate-pulse"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20"
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
                className="text-xs text-slate-400 hover:text-white font-semibold underline underline-offset-2 cursor-pointer"
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
                  className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-white/10 bg-black/35 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs font-medium text-white"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputText.trim()}
                  className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-30 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Conversation Exchange Card */}
          {latestInteraction ? (
            <div className="bg-[#1b1e26] rounded-[28px] p-4 sm:p-5 border border-white/10 shadow-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isHindi ? "विक्रम भैया का जवाब" : "Vikram's Answer"}
                </span>
                <button
                  onClick={() => handlePlayAudio("latest-interaction", latestInteraction.replyText)}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? "दोबारा सुनें" : "Replay"}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-xs sm:text-sm text-slate-200 italic">
                🗣️ "{latestInteraction.userText}"
              </div>

              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {latestInteraction.replyText}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={handleToggleVoice}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isHindi ? "दूसरा सवाल पूछें" : "Ask follow-up question"}</span>
                </button>
                <span className="text-xs text-slate-400 font-medium">{latestInteraction.timestamp}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#1b1e26] rounded-[24px] p-4 border border-white/10 text-xs sm:text-sm text-slate-300 flex items-center gap-3 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
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
            <h4 className="text-xs font-bold text-slate-400 px-1">
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
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold whitespace-nowrap shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      {activeSection === "dashboard" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Royal Blue Full-Bleed Dashboard Header */}
          <DashboardHeader
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
            onToggleLanguage={() => setIsHindi(!isHindi)}
          />

          {/* DAY 10 COMMERCIAL CERTIFICATION (7 CRITERIA) - 7 EXPANDABLE STEPS */}
          <CommercialCertificationCard
            newHire={newHire}
            currentDay={currentDay}
            isHindi={isHindi}
            onOpenModules={() => setActiveSection("modules")}
            onOpenWorkTools={() => setActiveModal("work")}
            onOpenBuddy={() => setActiveSection("buddy")}
          />

          {/* DAILY SHIFT REPORT & CONTINUITY (CLICKABLE FOR FULL SUMMARY MODAL) */}
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
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white/10 rounded-[28px] p-5 text-white shadow-xl border border-white/10 space-y-3 flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isHindi ? "शिफ्ट टूल्स" : "Floor Shift"}</span>
                </div>
                <p className="text-xs text-slate-350 mt-2 font-semibold leading-relaxed">
                  {isHindi ? "पिक रेट डायल, स्टोर मैप व गाइड" : "Pick dial, store zone map & guides"}
                </p>
              </div>
              <button
                onClick={() => setActiveModal("work")}
                className="w-full py-2.5 rounded-2xl bg-cyan-400 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-cyan-950/10 active:scale-95 transition-all hover:bg-cyan-300 uppercase tracking-wider"
              >
                {isHindi ? "टूल्स खोलें 🛠️" : "Floor Tools 🛠️"}
              </button>
            </div>

            <div className="bg-white/10 rounded-[28px] p-5 text-white shadow-xl border border-white/10 space-y-3 flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center gap-1.5 text-purple-300 text-xs font-black uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isHindi ? "एलएमएस मॉड्यूल" : "LMS Training"}</span>
                </div>
                <p className="text-xs text-slate-350 mt-2 font-semibold leading-relaxed">
                  {newHire.modulesCompleted ?? 3}/10 {isHindi ? "मॉड्यूल पूरे" : "Modules done"}
                </p>
              </div>
              <button
                onClick={() => setActiveSection("modules")}
                className="w-full py-2.5 rounded-2xl bg-purple-500 text-white text-xs font-black cursor-pointer shadow-md shadow-purple-950/10 active:scale-95 transition-all hover:bg-purple-400 uppercase tracking-wider"
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
                src="/Vikram%20Pic.jpeg"
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

            <div className="space-y-2.5 text-xs text-slate-700">
              <p className="text-[11px] font-black uppercase text-purple-700 tracking-wider">
                {isHindi ? "सामान उठाने की प्रक्रिया और जांच सूची" : "PICKING PROCESS & CHECKLIST"}
              </p>

              <div
                onClick={() => setCompletedScannerChecklist(prev => ({ ...prev, laser: !prev.laser }))}
                className={`p-3 border rounded-2xl flex items-start gap-2.5 cursor-pointer transition-all active:scale-98 ${
                  completedScannerChecklist.laser ? "bg-emerald-50 border-emerald-200" : "bg-purple-50/70 border-purple-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedScannerChecklist.laser}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 accent-emerald-600 shrink-0"
                />
                <div className="min-w-0">
                  <strong className={`block font-bold ${completedScannerChecklist.laser ? "line-through text-slate-500" : "text-purple-950"}`}>
                    {isHindi ? "लाल शीशा साफ करें" : "Clean red laser glass"}
                  </strong>
                  <p className="text-[11px] text-purple-900 mt-0.5">
                    {isHindi
                      ? "स्कैनर के आगे का ग्लास अपनी टी-शर्ट या सूखे कपड़े से पोंछें।"
                      : "Dust often blocks the laser. Wipe the front glass with a dry cloth."}
                  </p>
                </div>
              </div>

              <div
                onClick={() => setCompletedScannerChecklist(prev => ({ ...prev, dist: !prev.dist }))}
                className={`p-3 border rounded-2xl flex items-start gap-2.5 cursor-pointer transition-all active:scale-98 ${
                  completedScannerChecklist.dist ? "bg-emerald-50 border-emerald-200" : "bg-blue-50/70 border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedScannerChecklist.dist}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 accent-emerald-600 shrink-0"
                />
                <div className="min-w-0">
                  <strong className={`block font-bold ${completedScannerChecklist.dist ? "line-through text-slate-500" : "text-blue-950"}`}>
                    {isHindi ? "दूरी सही रखें (15 सेमी)" : "Hold 15cm from barcode"}
                  </strong>
                  <p className="text-[11px] text-blue-900 mt-0.5">
                    {isHindi
                      ? "स्कैनर को पैकेट से बहुत चिपकाएं नहीं, 15 सेमी दूर रखकर ट्रिगर दबाएं।"
                      : "Don't press against the label. Keep 15cm distance."}
                  </p>
                </div>
              </div>

              <div
                onClick={() => setCompletedScannerChecklist(prev => ({ ...prev, battery: !prev.battery }))}
                className={`p-3 border rounded-2xl flex items-start gap-2.5 cursor-pointer transition-all active:scale-98 ${
                  completedScannerChecklist.battery ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedScannerChecklist.battery}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 accent-emerald-600 shrink-0"
                />
                <div className="min-w-0">
                  <strong className={`block font-bold ${completedScannerChecklist.battery ? "line-through text-slate-500" : "text-slate-900"}`}>
                    {isHindi ? "बैटरी स्टेटस व रीसेट" : "Battery status & Reset"}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isHindi
                      ? "चेक करें कि लाइट हरी जल रही है या नहीं। जरूरत पड़ने पर रीसेट दबाएं।"
                      : "Check ring scanner green indicator light. Reset if needed."}
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

              {/* Actionable checklists inside Target card */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {isHindi ? "लक्ष्य प्राप्ति हेतु आवश्यक कदम" : "STEPS FOR TODAY'S GOAL"}
                </p>

                <div
                  onClick={() => setCompletedTargetChecklist(prev => ({ ...prev, orders: !prev.orders }))}
                  className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                    completedTargetChecklist.orders ? "bg-emerald-50/70 border-emerald-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedTargetChecklist.orders}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                  />
                  <span className={`text-xs font-bold ${completedTargetChecklist.orders ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {isHindi ? "फिंगर स्कैनर से 50 ऑर्डर पैक करें" : "Pick 50 orders via finger scanner"}
                  </span>
                </div>

                <div
                  onClick={() => setCompletedTargetChecklist(prev => ({ ...prev, pacing: !prev.pacing }))}
                  className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                    completedTargetChecklist.pacing ? "bg-emerald-50/70 border-emerald-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedTargetChecklist.pacing}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                  />
                  <span className={`text-xs font-bold ${completedTargetChecklist.pacing ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {isHindi ? "45 से अधिक UPH की स्पीड बनाए रखें" : "Maintain >45 UPH picking pace"}
                  </span>
                </div>
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
              readinessScore={authoritativeReadiness}
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

            {/* Daily Quality & Safety Checklists */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isHindi ? "गुणवत्ता व सुरक्षा एसओपी एक्टिविटी" : "QUALITY & SAFETY SOP CHECKLIST"}
              </p>

              <div
                onClick={() => setCompletedWorkChecklist(prev => ({ ...prev, walk: !prev.walk }))}
                className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                  completedWorkChecklist.walk ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedWorkChecklist.walk}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                />
                <span className={`text-xs font-bold ${completedWorkChecklist.walk ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {isHindi ? "कोल्ड रूम डेयरी 90-सेकंड एसओपी और सील" : "Cold Room dairy 90-sec retrieval SOP"}
                </span>
              </div>

              <div
                onClick={() => setCompletedWorkChecklist(prev => ({ ...prev, seal: !prev.seal }))}
                className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                  completedWorkChecklist.seal ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedWorkChecklist.seal}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                />
                <span className={`text-xs font-bold ${completedWorkChecklist.seal ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {isHindi ? "इंसुलेटेड बैग सीलिंग और टोट लेबल जांचें" : "Insulated bag sealing & tote check"}
                </span>
              </div>

              <div
                onClick={() => setCompletedWorkChecklist(prev => ({ ...prev, pack: !prev.pack }))}
                className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                  completedWorkChecklist.pack ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedWorkChecklist.pack}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded shrink-0"
                />
                <span className={`text-xs font-bold ${completedWorkChecklist.pack ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {isHindi ? "मल्टी-टोट्स पैकेजिंग SOP पूर्ण करें" : "Complete Multi-Totes Packaging SOP"}
                </span>
              </div>
            </div>

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

      {/* ========================================================= */}
      {/* DAILY COACH REPORT VIEW (SEPARATE SPART / REPORT PAGE)   */}
      {/* ========================================================= */}
      {showDailyCoachReport && (
        <DailyCoachReportView
          newHire={newHire}
          currentDay={currentDay}
          isHindi={isHindi}
          onClose={() => setShowDailyCoachReport(false)}
        />
      )}
    </div>
  );
};
