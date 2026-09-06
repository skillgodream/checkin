import React, { useState, useEffect, useRef } from "react";
import { NewHire, DailySignal } from "../types";
import { analyzeDailyReport } from "../services/intelligence";
import { speakMessage, stopSpeaking } from "../utils/speech";
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
  ChevronRight,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

interface NewHireViewProps {
  newHire: NewHire;
  currentDay: number;
  onDailySignalSubmitted: (signal: DailySignal) => void;
  onAskHelp: (question: string) => Promise<string>;
  onSelectDay: (day: number) => void;
}

export const NewHireView: React.FC<NewHireViewProps> = ({
  newHire,
  currentDay,
  onDailySignalSubmitted,
  onAskHelp,
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
  const [isHindi, setIsHindi] = useState<boolean>(true);

  // Active quick action modal
  const [activeModal, setActiveModal] = useState<"map" | "buddy" | "scanner" | "target" | null>(null);
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

  // Derive simple human state
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
            ? "Vikram will help you with Aisles 4 to 8 today. Accuracy is 98%, no stress!"
            : "Shift reported! Great work keeping accuracy at 98%."),
        timestamp: currentRecord.dailySignal.timestamp || "Today",
      });
    } else {
      setLatestInteraction(null);
    }
    setBuddyAlertSent(false);
    setInputText("");
    setShowTextInput(false);
  }, [currentDay, newHire.id, currentRecord.dailySignal, isNeedsHelp]);

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
            ? `समझ गया ${newHire.name.split(" ")[0]}! विक्रम भैया को बता दिया है, वो आपको फ्लोर पर समझा देंगे।`
            : `Got it, ${newHire.name.split(" ")[0]}! Buddy Vikram has been alerted to walk through with you.`);

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

  // Status card content based on state & language
  const getStatusContent = () => {
    if (isSupportCompleted) {
      return {
        badge: isHindi ? "बहुत बढ़िया! 👍" : "Great Recovery! 👍",
        title: isHindi
          ? "वॉकथ्रू पूरा हो गया!"
          : "Walkthrough Completed!",
        desc: isHindi
          ? "विक्रम भैया के साथ प्रैक्टिस के बाद आपकी स्पीड 48 सामान/घंटा हो गई। अब आप आराम से अकेले ऑर्डर ले सकते हैं।"
          : "After practicing with Vikram, your speed jumped to 48 items/hr with zero missing items. You're ready for solo picking!",
        bgGradient: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/20",
        badgeBg: "bg-white/20 text-white backdrop-blur-xs",
        icon: <CheckCircle2 className="w-6 h-6 text-white shrink-0" />,
        stat: isHindi ? "स्पीड: 48/घंटा • 0 गलती" : "Speed: 48/hr • 0 Errors",
      };
    }
    if (isSupportAssigned) {
      return {
        badge: isHindi ? "मदद तय हो गई 🤝" : "Support Planned 🤝",
        title: isHindi
          ? "विक्रम भैया मदद करेंगे"
          : "Vikram will guide you",
        desc: isHindi
          ? "सुबह 8:30 बजे आइसल 4 से 8 का 15 मिनट का वॉकथ्रू होगा। स्पीड की चिंता मत करो, सही सामान उठाना सबसे जरूरी है।"
          : "15-min walkthrough before peak shift. Your scanning accuracy is 98% (great job) — speed will follow naturally!",
        bgGradient: "from-blue-600 to-indigo-600 text-white shadow-blue-500/20",
        badgeBg: "bg-white/20 text-white backdrop-blur-xs",
        icon: <UserCheck className="w-6 h-6 text-white shrink-0" />,
        stat: isHindi ? "8:30 AM • 15 मिनट वॉकथ्रू" : "8:30 AM • 15-min walk",
      };
    }
    if (isNeedsHelp) {
      return {
        badge: isHindi ? "चिंता मत करो 🤝" : "Don't Panic 🤝",
        title: isHindi
          ? "आइसल 4 से 8 में देर लग रही है?"
          : "Taking longer in Aisles 4-8?",
        desc: isHindi
          ? "शुरुआत में हर नए साथी को टाइम लगता है। आपकी एक्यूरेसी 98% है जो बेहतरीन है! विक्रम भैया आपकी मदद करेंगे।"
          : "Every new picker takes time in dark stores. Your scanning accuracy is 98% (great job!). Vikram is ready to help.",
        bgGradient: "from-amber-500 to-orange-600 text-white shadow-amber-500/20",
        badgeBg: "bg-white/20 text-white backdrop-blur-xs",
        icon: <AlertCircle className="w-6 h-6 text-white shrink-0" />,
        stat: isHindi ? "एक्यूरेसी: 98% (बहुत अच्छी)" : "Accuracy: 98% (Great)",
      };
    }
    return {
      badge: isHindi ? "सब ठीक चल रहा है 👍" : "On Track 👍",
      title: isHindi
        ? "आराम से सही सामान स्कैन करें"
        : "Steady picking & scanning",
      desc: isHindi
        ? "आपकी एक्यूरेसी 98% है। जल्दबाजी में गलत सामान मत उठाना। कोई भी परेशानी हो तो नीचे बटन दबाएं।"
        : "Your item scanning accuracy is 98%. Always check barcode before placing in tote. We are here to support you!",
      bgGradient: "from-emerald-600 to-teal-700 text-white shadow-emerald-500/20",
      badgeBg: "bg-white/20 text-white backdrop-blur-xs",
      icon: <ThumbsUp className="w-6 h-6 text-white shrink-0" />,
      stat: isHindi ? "एक्यूरेसी: 98% • 0 गलत सामान" : "Accuracy: 98% • 0 wrong items",
    };
  };

  const status = getStatusContent();

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-28 select-none">
      {/* ========================================================= */}
      {/* 1. TOP GREETING HEADER (Clean, Spacious like Reference)   */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{isHindi ? "नमस्ते," : "Hello,"}</span>
            <span className="text-slate-950 font-black">{newHire.name.split(" ")[0]}!</span>
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isHindi ? `फ्लोर पिकर • दिन ${currentDay}` : `Floor Picker • Day ${currentDay}`}
          </p>
        </div>

        {/* Language Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setIsHindi(true)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isHindi
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setIsHindi(false)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !isHindi
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Eng
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO STATUS CARD (Vibrant, Bold & Reassuring)          */}
      {/* ========================================================= */}
      <div
        className={`bg-gradient-to-br ${status.bgGradient} rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all`}
      >
        {/* Subtle decorative circles for depth */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Header Row with Badge and Audio Listen Pill */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${status.badgeBg}`}
            >
              {status.badge}
            </span>

            {/* Tap to Listen Audio Pill */}
            <button
              onClick={() => handlePlayAudio("status-card", `${status.title}. ${status.desc}`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              title="Listen aloud"
            >
              <Volume2
                className={`w-4 h-4 ${
                  playingAudioId === "status-card" ? "text-emerald-600 animate-bounce" : "text-slate-700"
                }`}
              />
              <span>{isHindi ? "सुनिए" : "Listen"}</span>
            </button>
          </div>

          {/* Title & Human Description */}
          <div>
            <h2 className="text-lg sm:text-xl font-black leading-snug tracking-tight">
              {status.title}
            </h2>
            <p className="text-xs sm:text-sm font-normal text-white/90 leading-relaxed mt-1">
              {status.desc}
            </p>
          </div>

          {/* Key Stat / Reassurance Pill */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white/95">
            <span>{status.stat}</span>
            <span className="text-[11px] font-medium text-white/80">
              Buddy: {newHire.buddy.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK ACTION TILES (2x2 Chunky Squircle Grid)          */}
      {/* Reference: Smart Home & SpaceApp 2x2 Squircle Cards       */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isHindi ? "त्वरित सहायता" : "Quick Help"}
          </span>
          <span className="text-[11px] text-slate-400">
            {isHindi ? "1-टच सहायता" : "1-touch actions"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Tile 1: Item & Aisle Map (Blue) */}
          <button
            onClick={() => setActiveModal("map")}
            className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 shadow-xs active:scale-97 transition-all cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                {isHindi ? "सामान कहां है?" : "Find Item"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                {isHindi ? "आइसल और शेल्फ मैप" : "Aisle & shelf guide"}
              </span>
            </div>
          </button>

          {/* Tile 2: Call Buddy Vikram (Emerald) */}
          <button
            onClick={() => setActiveModal("buddy")}
            className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-xs active:scale-97 transition-all cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                {isHindi ? "विक्रम भैया" : "Call Buddy"}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
                {isHindi ? "मदद बुलाओ (Floor)" : "Ask Vikram on Floor"}
              </span>
            </div>
          </button>

          {/* Tile 3: Scanner Troubleshooting (Purple) */}
          <button
            onClick={() => setActiveModal("scanner")}
            className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs active:scale-97 transition-all cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-3">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                {isHindi ? "स्कैनर प्रॉब्लम" : "Scanner Fix"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                {isHindi ? "2 मिनट का आसान हल" : "Quick troubleshooting"}
              </span>
            </div>
          </button>

          {/* Tile 4: Today's Target & Ramp Goal (Amber/Orange) */}
          <button
            onClick={() => setActiveModal("target")}
            className="flex flex-col items-start justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/40 shadow-xs active:scale-97 transition-all cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-3">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                {isHindi ? "आज का लक्ष्य" : "Today's Target"}
              </span>
              <span className="text-[11px] text-amber-700 font-bold mt-0.5 block">
                {isHindi ? "98% एक्यूरेसी 👍" : "98% Accuracy 👍"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. COMPANION INTERACTION CARD (Minimal, Clean Feedback)   */}
      {/* ========================================================= */}
      {latestInteraction ? (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2.5 animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isHindi ? "साथी का जवाब" : "Floor Companion"}
            </span>
            <button
              onClick={() => handlePlayAudio("latest-interaction", latestInteraction.replyText)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isHindi ? "दोबारा सुनें" : "Replay"}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
            🗣️ "{latestInteraction.userText}"
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
            {latestInteraction.replyText}
          </p>
        </div>
      ) : (
        /* Friendly greeting tip when no message sent yet */
        <div className="bg-white/80 rounded-2xl p-3 border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="leading-snug">
            {isHindi
              ? "कोई भी दिक्कत हो या सामान ना मिले, नीचे माइक दबाकर बोलें।"
              : "Facing any issue or can't locate an item? Tap the mic below to speak."}
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. 1-TAP QUICK QUESTIONS (Spoken Chips)                   */}
      {/* ========================================================= */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {(isHindi
          ? [
              "आइसल 4 से 8 में सामान नहीं मिल रहा",
              "दही और दूध का कोल्ड रूम कहां है?",
              "स्कैनर बारकोड नहीं पढ़ रहा",
            ]
          : [
              "Aisles 4 to 8 taking too long",
              "Where is the cold dairy room?",
              "Barcode scanner disconnected",
            ]
        ).map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-[11px] font-medium bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border border-slate-200/90 px-3 py-1.5 rounded-full shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
          >
            🗣️ "{chip}"
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 6. BIG TOUCH-FRIENDLY VOICE ACTION BAR (WhatsApp Style)   */}
      {/* ========================================================= */}
      <div className="pt-1">
        <button
          id="big-voice-speak-btn"
          type="button"
          onClick={handleToggleVoice}
          disabled={isProcessing}
          className={`w-full py-3.5 px-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer ${
            isListening
              ? "bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-spin" />
              <span>{isHindi ? "🔴 सुन रहा हूं... बोलिए" : "🔴 Listening... Speak now"}</span>
            </>
          ) : isProcessing ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{isHindi ? "समझ रहा हूं..." : "Understanding report..."}</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>{isHindi ? "बोल कर बताएं (Tap to Speak)" : "Tap to Speak (Voice Report)"}</span>
            </>
          )}
        </button>

        {/* Subtle toggle for typing */}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 cursor-pointer"
          >
            {showTextInput
              ? isHindi ? "टाइपिंग छुपाएं" : "Hide text input"
              : isHindi ? "या टाइप करके लिखें" : "Or type text report"}
          </button>
        </div>

        {/* Optional Collapsible Text Input */}
        {showTextInput && (
          <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-100">
            <input
              id="learner-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isHindi ? "सवाल या शिफ्ट रिपोर्ट लिखें..." : "Type question or report..."}
              disabled={isProcessing}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isProcessing || !inputText.trim()}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
    </div>
  );
};
