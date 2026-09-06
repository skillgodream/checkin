import React, { useState, useEffect } from "react";
import { NewHire, DailySignal } from "../types";
import { analyzeDailyReport } from "../services/intelligence";
import { VoiceInputButton } from "./VoiceInputButton";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  UserCheck,
  MessageSquare,
} from "lucide-react";

interface NewHireViewProps {
  newHire: NewHire;
  currentDay: number;
  onDailySignalSubmitted: (signal: DailySignal) => void;
  onAskHelp: (question: string) => Promise<string>;
  onSelectDay: (day: number) => void;
}

interface ChatMessage {
  id: string;
  sender: "learner" | "companion";
  text: string;
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

  // State for companion messaging
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat conversation thread
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Synchronize conversation thread with current record
  useEffect(() => {
    const messages: ChatMessage[] = [];

    // If learner reported friction or signal exists today
    if (currentRecord.dailySignal) {
      messages.push({
        id: `user-${currentDay}`,
        sender: "learner",
        text: currentRecord.dailySignal.rawText,
      });

      if (currentRecord.dailySignal.companionResponse) {
        messages.push({
          id: `comp-${currentDay}`,
          sender: "companion",
          text: currentRecord.dailySignal.companionResponse,
        });
      }
    } else {
      // Friendly initial greeting from companion
      messages.push({
        id: `welcome-${currentDay}`,
        sender: "companion",
        text: `Namaste ${newHire.name.split(" ")[0]}! Tell me how your shift is going, or ask me anything about items or aisles.`,
      });
    }

    setChatMessages(messages);
    setInputText("");
  }, [currentDay, newHire.id, currentRecord.dailySignal]);

  // Quick conversation prompts
  const quickPrompts = [
    "I was slow today, couldn't find items in aisles 4 to 8.",
    "Where is the cold dairy section?",
    "The scanner stopped scanning barcodes.",
  ];

  // Primary unified message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isProcessing) return;

    // Show user message immediately
    setChatMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "learner", text },
    ]);
    setInputText("");
    setIsProcessing(true);

    try {
      const lower = text.toLowerCase();
      const isQuestion =
        text.includes("?") ||
        lower.startsWith("where") ||
        lower.startsWith("how") ||
        lower.startsWith("what") ||
        lower.startsWith("can i");

      if (isQuestion) {
        // Operational floor question -> Store companion
        const answer = await onAskHelp(text);
        setChatMessages((prev) => [
          ...prev,
          { id: `comp-${Date.now()}`, sender: "companion", text: answer },
        ]);
      } else {
        // Floor experience report -> Intelligence pipeline
        const analyzed = await analyzeDailyReport(text, newHire.name, currentDay);

        const signal: DailySignal = {
          id: `sig-${Date.now()}`,
          dayNumber: currentDay,
          rawText: text,
          inputMethod: "text",
          issue: analyzed.issue || "Floor experience",
          confidence: (analyzed.confidence as any) || "Medium",
          possibleImpact: analyzed.possibleImpact || "Ramp pacing",
          category: (analyzed.category as any) || "General",
          summary: analyzed.summary || text.slice(0, 80),
          companionResponse:
            analyzed.companionResponse ||
            `Got it, ${newHire.name.split(" ")[0]}. I've noted that so you get the right support today.`,
          timestamp: "Just now",
        };

        onDailySignalSubmitted(signal);

        setChatMessages((prev) => [
          ...prev,
          {
            id: `comp-${Date.now()}`,
            sender: "companion",
            text:
              analyzed.companionResponse ||
              `Thanks for sharing, ${newHire.name.split(" ")[0]}. We're here to help you get comfortable on the floor.`,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `comp-err-${Date.now()}`,
          sender: "companion",
          text: "I heard you! I've noted that for your shift.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // Dynamic State Derivation for "WHAT MATTERS NOW?"
  // -------------------------------------------------------------
  // STATE D: Support Completed (intervention outcome checked and verified)
  const isSupportCompleted = Boolean(
    currentRecord.actionOutcome && currentRecord.actionOutcome.improved
  );

  // STATE C: Support Assigned (recommended action exists and active)
  const isSupportAssigned = Boolean(
    !isSupportCompleted &&
      currentRecord.recommendedAction &&
      currentRecord.recommendedAction.status !== "completed"
  );

  // STATE B: Needs Help (reported friction or status needs attention, before action is checked)
  const isNeedsHelp = Boolean(
    !isSupportCompleted &&
      !isSupportAssigned &&
      (currentRecord.statusAtEnd === "Needs attention" ||
        currentRecord.statusAtEnd === "At risk" ||
        (currentRecord.dailySignal && currentRecord.dailySignal.confidence === "Low"))
  );

  // STATE A: Normal
  const isNormal = !isSupportCompleted && !isSupportAssigned && !isNeedsHelp;

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4 pb-20">
      {/* ========================================================= */}
      {/* 1. HOW AM I DOING? (Clean, human, open - no nested cards)  */}
      {/* ========================================================= */}
      <div className="pt-1">
        {/* Worker Greeting + Simple Reassurance Pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <img
              src={newHire.avatar}
              alt={newHire.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Namaste, {newHire.name.split(" ")[0]} 👋
              </h1>
              <p className="text-xs text-slate-500">
                Buddy: {newHire.buddy.split(" ")[0]} • Day {currentDay}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shrink-0 ${
              isSupportCompleted || isNormal
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : isSupportAssigned
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {isSupportCompleted || isNormal ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Doing well</span>
              </>
            ) : isSupportAssigned ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Support ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Needs a hand</span>
              </>
            )}
          </span>
        </div>

        {/* Natural Language Status Explanation */}
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          {isSupportCompleted ? (
            <>
              You're getting there! Your picking speed picked right up after the walkthrough, and your accuracy stayed strong at{" "}
              <strong className="text-slate-900">{currentRecord.workSignal.accuracyRate}%</strong>.
            </>
          ) : isSupportAssigned ? (
            <>
              We've got a plan. Your buddy <strong className="text-slate-900">{newHire.buddy.split(" ")[0]}</strong> is walking the racks with you. Your accuracy is solid!
            </>
          ) : isNeedsHelp ? (
            <>
              Let's work on this together. Finding items takes a few shifts to get used to. Your accuracy is strong at{" "}
              <strong className="text-slate-900">{currentRecord.workSignal.accuracyRate}%</strong>, so don't rush.
            </>
          ) : (
            <>
              You're doing well 👍 Your item accuracy is{" "}
              <strong className="text-slate-900">{currentRecord.workSignal.accuracyRate}%</strong> and your scanning rhythm is steady.
            </>
          )}
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. WHAT MATTERS NOW? (Single focused banner for current focus) */}
      {/* ========================================================= */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 px-0.5">
          What Matters Now
        </span>

        {/* STATE D: SUPPORT COMPLETED */}
        {isSupportCompleted && (
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WALKTHROUGH COMPLETED</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {newHire.buddy.split(" ")[0]} helped you with Aisles 4–8
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Speed jumped to <strong className="text-emerald-800 font-bold">48 items/hr</strong> with 98% accuracy. You're ready for solo picking!
            </p>
            <div className="mt-2.5 pt-2 border-t border-emerald-200/70 text-xs font-semibold text-emerald-900">
              Focus: Keep picking at your natural rhythm.
            </div>
          </div>
        )}

        {/* STATE C: SUPPORT ASSIGNED */}
        {isSupportAssigned && (
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-1">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>PLAN FOR TODAY</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {newHire.buddy.split(" ")[0]} will help you with Aisles 4–8
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              15-minute floor walkthrough before peak shift to review snack and cold rack numbering.
            </p>
            <div className="mt-2.5 pt-2 border-t border-blue-200/70 text-xs font-semibold text-blue-900">
              Focus: Just get familiar with rack bin codes today. Speed will follow.
            </div>
          </div>
        )}

        {/* STATE B: NEEDS HELP */}
        {isNeedsHelp && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>LET'S WORK ON THIS</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Aisle navigation takes time to learn
            </h2>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              We've noted that aisles 4 to 8 are taking longer. We're getting buddy {newHire.buddy.split(" ")[0]} to walk through them with you.
            </p>
            <div className="mt-2.5 pt-2 border-t border-amber-200/70 text-xs font-semibold text-amber-900">
              Focus: Keep your accuracy high ({currentRecord.workSignal.accuracyRate}%). Don't rush.
            </div>
          </div>
        )}

        {/* STATE A: NORMAL */}
        {isNormal && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>YOU'RE RIGHT ON TRACK</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Steady picking rhythm
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Keep focusing on your current orders. Your scanning and packing are solid.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
              Focus: Continue regular floor orders. Tell your companion anytime you need a hand.
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. TALK TO YOUR COMPANION (Clean conversation stream)      */}
      {/* ========================================================= */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-blue-600" />
            Talk to Your Companion
          </span>
          <span className="text-[10px] text-slate-400">Voice or text</span>
        </div>

        {/* Stream of messages (Compact & Clean) */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "learner" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  msg.sender === "learner"
                    ? "bg-slate-900 text-white rounded-tr-xs"
                    : "bg-white border border-slate-200/90 text-slate-800 shadow-2xs rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Conversation Prompts */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              "{prompt.slice(0, 28)}..."
            </button>
          ))}
        </div>

        {/* Clean Voice/Text Input Bar */}
        <div className="relative flex items-center gap-1.5 pt-0.5">
          <div className="relative flex-1">
            <input
              id="employee-companion-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tell your companion what happened..."
              disabled={isProcessing}
              className="w-full text-xs sm:text-sm pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setInputText(transcript);
                  handleSendMessage(transcript);
                }}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          <button
            id="submit-companion-message-btn"
            onClick={() => handleSendMessage()}
            disabled={isProcessing || !inputText.trim()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 cursor-pointer transition-all active:scale-95 shrink-0 shadow-2xs"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
