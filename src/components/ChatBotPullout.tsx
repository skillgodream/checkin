import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { askCompanion } from "../services/intelligence";
import { speakMessage } from "../utils/speech";

interface ChatBotPulloutProps {
  currentDay: number;
  learnerName?: string;
  buddyName?: string;
  isHindi?: boolean;
  onAlertBuddy?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export const ChatBotPullout: React.FC<ChatBotPulloutProps> = ({
  currentDay,
  learnerName = "Rahul",
  buddyName = "Vikram",
  isHindi = true,
  onAlertBuddy,
}) => {
  // Pill state: whether the pull-out pill is expanded or tucked (hidden)
  const [isTucked, setIsTucked] = useState<boolean>(false);
  // Drawer state: whether the full chatbot drawer is open
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Chat conversation state
  const firstName = (learnerName || "Rahul").split(" ")[0];
  const buddyFirstName = (buddyName || "Vikram").split(" ")[0];

  const initialGreeting = isHindi
    ? `नमस्ते ${firstName}! 👋 मैं आपका AI फ्लोर साथी हूँ। मुझसे स्टोर के किसी भी काम, रैक लोकेशन, स्कैनर या सुरक्षा के बारे में कुछ भी पूछें!`
    : `Hello ${firstName}! 👋 I am your AI Floor Assistant. Ask me anything about store aisles, scanner fixes, cold rooms, or safety SOPs!`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: initialGreeting,
      timestamp: "Just now",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [buddyAlerted, setBuddyAlerted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isDrawerOpen]);

  // Focus input when opening drawer
  useEffect(() => {
    if (isDrawerOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isDrawerOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const botReply = await askCompanion(text, currentDay);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speakMessage(botReply, isHindi);
    } catch (err) {
      const fallback = isHindi
        ? "माफ कीजियेगा, दोबारा पूछें या नीचे दिए गए आम सवालों में से चुनें।"
        : "Sorry, I could not process that. Please try again or tap a quick question.";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleSendMessage(
        isHindi
          ? "आइसल 4 से 8 में सामान ढूंढने में मदद चाहिए।"
          : "I need help finding items in Aisles 4 to 8."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? "hi-IN" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) handleSendMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      handleSendMessage(
        isHindi
          ? "दूध और दही का कोल्ड रूम कहां है?"
          : "Where is the cold dairy room?"
      );
    }
  };

  const quickQuestions = isHindi
    ? [
        "दूध और दही का कोल्ड रूम कहां है?",
        "आइसल 4 से 8 में सामान कैसे ढूंढें?",
        "स्कैनर बारकोड नहीं पढ़ रहा",
        "सामान का पैकेट फटा हुआ है",
        "भारी सामान टोट में कैसे रखें?",
      ]
    : [
        "Where is the cold dairy room?",
        "How to locate items in Aisles 4-8?",
        "Scanner not reading barcode",
        "Damaged item protocol",
        "Heavy items tote packing order",
      ];

  const handleAlertFloorBuddy = () => {
    setBuddyAlerted(true);
    onAlertBuddy?.();
    const alertMsg: Message = {
      id: `buddy-alert-${Date.now()}`,
      sender: "bot",
      text: isHindi
        ? `🚨 आपके साथी ${buddyFirstName} को नोटिफिकेशन भेज दिया गया है! वो जल्द ही आपकी रैक पर आ रहे हैं।`
        : `🚨 Floor Buddy ${buddyFirstName} has been notified! They are heading to your aisle now.`,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, alertMsg]);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* PULL-OUT TAB: DOCKED ON THE RIGHT SIDE OF THE SCREEN       */}
      {/* ========================================================= */}
      {!isDrawerOpen && (
        <div
          id="chatbot-pullout-container"
          className={`fixed right-0 top-[52%] -translate-y-1/2 z-40 transition-transform duration-300 ease-out select-none ${
            isTucked ? "translate-x-[calc(100%-42px)]" : "translate-x-0"
          }`}
        >
          <div className="flex items-center">
            {/* The Main Pill Button: Exactly matches user reference image */}
            <button
              id="chatbot-pullout-btn"
              type="button"
              onClick={() => {
                if (isTucked) {
                  setIsTucked(false);
                } else {
                  setIsDrawerOpen(true);
                }
              }}
              title={isHindi ? "कुछ भी पूछें! (AI बॉट)" : "Ask me anything! (AI Chatbot)"}
              aria-label="Ask me anything Chatbot"
              className="group flex items-center bg-white hover:bg-slate-50 border border-slate-200/90 shadow-[0_10px_30px_rgba(30,10,60,0.18)] rounded-l-full py-1.5 pl-1.5 pr-4.5 cursor-pointer active:scale-98 transition-all ring-1 ring-black/5"
            >
              {/* Cute Robot Mascot Avatar Circle (as in user's image) */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-blue-50 via-white to-blue-100/70 border-2 border-white shadow-md flex items-center justify-center overflow-hidden ring-1 ring-slate-200/60">
                  {/* SVG Robot Avatar matching reference image */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-xs"
                    aria-hidden="true"
                  >
                    {/* Head base */}
                    <rect
                      x="18"
                      y="18"
                      width="64"
                      height="54"
                      rx="27"
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth="2.5"
                    />
                    {/* Left ear antenna */}
                    <rect x="11" y="38" width="8" height="14" rx="4" fill="#3B82F6" />
                    {/* Right ear antenna */}
                    <rect x="81" y="38" width="8" height="14" rx="4" fill="#3B82F6" />
                    {/* Blue visor screen */}
                    <rect
                      x="25"
                      y="30"
                      width="50"
                      height="28"
                      rx="14"
                      fill="#1E3A8A"
                    />
                    {/* Left glowing eye */}
                    <path
                      d="M37 42 Q42 37 47 42"
                      stroke="#38BDF8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Right glowing eye */}
                    <path
                      d="M53 42 Q58 37 63 42"
                      stroke="#38BDF8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Body collar */}
                    <path
                      d="M32 74 C32 74 38 88 50 88 C62 88 68 74 68 74 Z"
                      fill="#F1F5F9"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Subtle active ping dot */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs animate-pulse" />
              </div>

              {/* Bold Purple Text: "Ask me anything!" */}
              <div className="pl-2.5 flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#6534C7] font-black text-sm sm:text-[15px] tracking-tight">
                  {isHindi ? "कुछ भी पूछें!" : "Ask me anything!"}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </button>

            {/* Small tuck/pull toggle handle on the right edge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTucked((prev) => !prev);
              }}
              title={isTucked ? "Pull out (खोलें)" : "Hide (छुपाएं)"}
              className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-1.5 rounded-l-md border-y border-l border-slate-300 shadow-2xs cursor-pointer transition-colors"
            >
              {isTucked ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL CHAT BOT SLIDE-OUT DRAWER / OVERLAY                  */}
      {/* ========================================================= */}
      {isDrawerOpen && (
        <div
          id="chatbot-drawer-overlay"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            id="chatbot-drawer-panel"
            className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Robot Avatar in Header */}
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-8 h-8" aria-hidden="true">
                    <rect
                      x="18"
                      y="18"
                      width="64"
                      height="54"
                      rx="27"
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth="2.5"
                    />
                    <rect x="11" y="38" width="8" height="14" rx="4" fill="#3B82F6" />
                    <rect x="81" y="38" width="8" height="14" rx="4" fill="#3B82F6" />
                    <rect x="25" y="30" width="50" height="28" rx="14" fill="#1E3A8A" />
                    <path
                      d="M37 42 Q42 37 47 42"
                      stroke="#38BDF8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M53 42 Q58 37 63 42"
                      stroke="#38BDF8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M32 74 C32 74 38 88 50 88 C62 88 68 74 68 74 Z"
                      fill="#F1F5F9"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight flex items-center gap-1.5">
                    <span>{isHindi ? "फ्लोर AI साथी" : "Floor AI Assistant"}</span>
                    <span className="text-[10px] font-bold bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200 font-medium">
                    {isHindi ? "Ask me anything • हमेशा उपलब्ध" : "Ask me anything • 24/7 Floor Companion"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Person Buddy Alert Banner */}
            <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-purple-900 font-semibold truncate">
                <UserCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span className="truncate">
                  {isHindi
                    ? `साथी ${buddyFirstName} फ्लोर पर तैनात हैं`
                    : `Floor Buddy ${buddyFirstName} is nearby`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAlertFloorBuddy}
                disabled={buddyAlerted}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                  buddyAlerted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-2xs active:scale-95"
                }`}
              >
                {buddyAlerted
                  ? isHindi
                    ? "बुलाया गया ✓"
                    : "Alerted ✓"
                  : isHindi
                  ? "फ्लोर पर बुलाएं"
                  : "Call to Aisle"}
              </button>
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"} space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isBot
                          ? "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                          : "bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-tr-xs"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isBot && (
                        <button
                          type="button"
                          onClick={() => speakMessage(msg.text, isHindi)}
                          className="hover:text-purple-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                          title="Listen to answer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isHindi ? "सुनें" : "Play"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl p-3 max-w-[70%] shadow-2xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-200" />
                  <span>{isHindi ? "सोच रहा हूँ..." : "Checking store guide..."}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 px-1 mb-1.5 flex items-center justify-between">
                <span>{isHindi ? "आम सवाल (टैप करें):" : "Quick Questions (Tap to ask):"}</span>
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    disabled={isThinking}
                    className="text-[11px] font-semibold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 border border-slate-200/80 px-2.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar: Voice + Text */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isThinking}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                  }`}
                  title={isHindi ? "बोलकर पूछें" : "Tap to speak"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? isHindi
                        ? "सुन रहा हूँ... बोलिए"
                        : "Listening... speak now"
                      : isHindi
                      ? "कोई भी सवाल लिखें..."
                      : "Ask me anything..."
                  }
                  disabled={isThinking || isListening}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isThinking || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white disabled:opacity-40 shadow-xs hover:opacity-95 transition-all cursor-pointer shrink-0 active:scale-95"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
