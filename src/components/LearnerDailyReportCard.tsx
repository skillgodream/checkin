import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
} from "lucide-react";
import { NewHire, DayRecord, DARK_STORE_CAPABILITIES } from "../types";
import { speakMessage, stopSpeaking } from "../utils/speech";

interface LearnerDailyReportCardProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
  onOpenWorkTools?: () => void;
  onOpenBuddy?: () => void;
  onOpenModules?: () => void;
}

export const LearnerDailyReportCard: React.FC<LearnerDailyReportCardProps> = ({
  newHire,
  currentDay,
  isHindi = false,
  onOpenWorkTools,
  onOpenBuddy,
  onOpenModules,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

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

  const previousRecord = newHire.daysHistory.find((d) => d.dayNumber === currentDay - 1);

  const actualPace = currentRecord.workSignal?.actualPickRate ?? 35;
  const targetPace = currentRecord.workSignal?.targetPickRate ?? 50;
  const accuracy = currentRecord.workSignal?.accuracyRate ?? 98;
  const ordersDone = currentRecord.workSignal?.ordersCompleted ?? 44;
  const buddyName = newHire.buddy.split(" ")[0];
  const supervisorName = newHire.supervisor.split(" ")[0];

  // Derive simple human interpretation without technical jargon
  const getInterventionContinuity = () => {
    // 1. Check if previous day had an intervention and its outcome
    if (previousRecord?.actionOutcome) {
      if (previousRecord.actionOutcome.improved === "yes") {
        return {
          badge: isHindi ? "सपोर्ट का अच्छा असर 👍" : "Prior Support Succeeded 👍",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          textEn: `You practised earlier with ${buddyName}. Your speed improved to ${actualPace}/hr with ${accuracy}% accuracy, so we are reducing support for more independent picking!`,
          textHi: `आपने पहले ${buddyName} भैया के साथ अभ्यास किया था। आपकी स्पीड बढ़कर ${actualPace}/घंटा हो गई और एक्यूरेसी ${accuracy}% है, इसलिए अब आप अकेले अधिक ऑर्डर पिक कर सकते हैं!`,
        };
      }
      if (previousRecord.actionOutcome.improved === "no") {
        return {
          badge: isHindi ? "सपोर्ट में बदलाव 🔄" : "Adjusting Support 🔄",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          textEn: `The earlier practice on shelf locations did not fully resolve the speed delay, so Supervisor ${supervisorName} is giving a direct 10-minute floor demonstration on the fastest pick route.`,
          textHi: `पहले शेल्फ नंबर के अभ्यास से स्पीड पूरी तरह नहीं बढ़ी, इसलिए सुपरवाइजर ${supervisorName} सीधे 10 मिनट का डेमो देकर सबसे तेज़ रूट दिखाएंगे।`,
        };
      }
    }

    // 2. Hardware / Tool issue (Symptom != Root cause)
    if (
      currentRecord.dailySignal?.category === "Tool" ||
      currentRecord.recommendedAction?.decisionType === "tool_remedy" ||
      (currentRecord.identifiedPattern?.category === "Tool")
    ) {
      return {
        badge: isHindi ? "डिवाइस/टूल स्थिति 🛠️" : "Device/Tool Notice 🛠️",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        textEn: `This is a tool issue, not a training problem. Your barcode scanner optical lens or battery needs maintenance. You do not need to repeat training for a device issue.`,
        textHi: `यह स्कैनर डिवाइस की समस्या है, आपकी ट्रेनिंग की नहीं। डिस्पैच टेबल पर स्कैनर की जांच करवाएं। डिवाइस की समस्या के लिए दोबारा ट्रेनिंग की जरूरत नहीं है।`,
      };
    }

    // 3. External store / facility bottleneck
    if (
      currentRecord.workSignal?.externalBottleneck ||
      currentRecord.identifiedPattern?.patternName.includes("Bottleneck") ||
      currentRecord.recommendedAction?.decisionType === "environment_support"
    ) {
      return {
        badge: isHindi ? "स्टोर वातावरण 🏢" : "Facility Notice 🏢",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        textEn: `A conveyor / store facility delay was logged during this wave. The speed drop was caused by the facility, NOT your diligence or competence.`,
        textHi: `शिफ्ट के दौरान कन्वेयर/स्टोर में रुकावट दर्ज हुई। गति में कमी स्टोर की समस्या के कारण थी, आपकी क्षमता में कोई कमी नहीं है।`,
      };
    }

    // 4. Insufficient floor work telemetry
    if (currentRecord.workSignal?.hasWorkEvidence === false || ordersDone === 0) {
      return {
        badge: isHindi ? "अवलोकन जारी 👁️" : "Observing Shift 👁️",
        badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        textEn: `We're still observing your floor work. Continue your scheduled shift orders and we will keep checking.`,
        textHi: `हम अभी आपके शिफ्ट काम का अवलोकन कर रहे हैं। अपना काम सामान्य रूप से जारी रखें, हम चेक करते रहेंगे।`,
      };
    }

    // 5. Steady Ramp
    return {
      badge: isHindi ? "स्थिर प्रगति ⭐" : "Steady Ramp ⭐",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      textEn: `Your pick speed (${actualPace}/hr) and accuracy (${accuracy}%) are progressing smoothly along the ramp curve. Keep up the great focus!`,
      textHi: `आपकी पिकिंग स्पीड (${actualPace}/घंटा) और एक्यूरेसी (${accuracy}%) बहुत अच्छी तरह बढ़ रही है। इसी तरह ध्यान से काम करते रहें!`,
    };
  };

  const continuity = getInterventionContinuity();

  const handlePlayAudio = () => {
    if (playingAudio) {
      stopSpeaking();
      setPlayingAudio(false);
      return;
    }
    const text = isHindi
      ? `डे ${currentDay} की शिफ्ट रिपोर्ट। एक्यूरेसी ${accuracy} प्रतिशत, स्पीड ${actualPace} सामान प्रति घंटा। ${continuity.textHi}`
      : `Day ${currentDay} Shift Report. Accuracy ${accuracy} percent, speed ${actualPace} items per hour. ${continuity.textEn}`;

    setPlayingAudio(true);
    speakMessage(text, isHindi, () => {
      setPlayingAudio(false);
    });
  };

  return (
    <div
      id="learner-daily-report-card"
      className="bg-white rounded-[26px] p-4 border border-slate-200/90 shadow-2xs space-y-3 select-none"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? "दैनिक शिफ्ट समझ" : "DAILY SHIFT REPORT"}
            </span>
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              {isHindi ? `डे ${currentDay} का समग्र विश्लेषण` : `Day ${currentDay} Summary & Meaning`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            title="Listen aloud"
          >
            <Volume2 className={`w-3.5 h-3.5 ${playingAudio ? "animate-bounce text-violet-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          {/* 1. TODAY'S SIGNALS STRIP */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                {isHindi ? "पिक स्पीड" : "Pick Speed"}
              </span>
              <span className="text-base font-black text-slate-900 block mt-0.5">
                {actualPace}
                <span className="text-[10px] text-slate-400 font-normal"> / {targetPace}</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 block">
                {ordersDone} {isHindi ? "ऑर्डर" : "orders"}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                {isHindi ? "एक्यूरेसी" : "Accuracy"}
              </span>
              <span className="text-base font-black text-emerald-950 block mt-0.5">
                {accuracy}%
              </span>
              <span className="text-[9px] font-bold text-emerald-600 block">
                {accuracy >= 98 ? (isHindi ? "✓ बहुत बढ़िया" : "✓ On Target") : (isHindi ? "सुधार आवश्यक" : "Attention")}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/70">
              <span className="text-[10px] font-bold text-purple-700 block uppercase">
                {isHindi ? "ट्रेनिंग" : "Training"}
              </span>
              <span className="text-base font-black text-purple-950 block mt-0.5">
                {newHire.modulesCompleted ?? 3}
                <span className="text-[10px] text-purple-400 font-normal"> / 10</span>
              </span>
              <span className="text-[9px] font-bold text-purple-600 block">
                {isHindi ? "मॉड्यूल" : "Modules"}
              </span>
            </div>
          </div>

          {/* 2. INTERVENTION CONTINUITY & WHAT IT MEANS */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-purple-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {isHindi ? "💡 इसका क्या अर्थ है?" : "💡 WHAT THIS MEANS"}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${continuity.badgeColor}`}>
                {continuity.badge}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium">
              {isHindi ? continuity.textHi : continuity.textEn}
            </p>
          </div>

          {/* 3. WHAT MATTERS MOST */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="font-bold block">
                {isHindi ? "आज सबसे ज्यादा क्या महत्वपूर्ण है:" : "What Matters Most Today:"}
              </strong>
              <span className="text-[11px] text-amber-900 mt-0.5 block">
                {accuracy < 98
                  ? isHindi
                    ? "स्पीड से पहले सही सामान स्कैन करना जरूरी है। हमेशा बारकोड चेक करके ही टोट में रखें।"
                    : "Accuracy is foundational before speed. Always verify the barcode before placing item into tote."
                  : isHindi
                  ? "आपकी एक्यूरेसी मजबूत है (98%)। अब बिना भटके सीधे शेल्फ पर पहुंचने पर ध्यान दें।"
                  : "Your accuracy is strong (98%). Focus on smooth aisle navigation without backtracking."}
              </span>
            </div>
          </div>

          {/* 4. WHAT HAPPENS NEXT */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="text-[11px]">
                <strong className="font-bold text-slate-800">{isHindi ? "आगे क्या होगा: " : "Next Step: "}</strong>
                {isHindi
                  ? "अगले 10 ऑर्डरों में गति व सटीकता की जांच होगी।"
                  : "Pacing and accuracy will be checked across next 10 orders."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
