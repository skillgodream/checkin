import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Dumbbell,
  FlaskConical,
  FileCheck2,
  Award,
  ChevronRight,
  Building2,
  PackageCheck,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import {
  NewHire,
  CapabilityState,
  DARK_STORE_CAPABILITIES,
} from "../types";
import { evaluateDay10Outcome, assessReadiness } from "../services/intelligence";

interface JobReadyHumanFigureProps {
  newHire: NewHire;
  currentDay: number;
  isHindi?: boolean;
}

interface CapabilityCategory {
  id: "learning" | "practice" | "simulation" | "assessment";
  title: string;
  titleHi: string;
  weight: number;
  completedText: string;
  completedTextHi: string;
  color: string;
  gradientId: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ReactNode;
  ratio: number;
  completedCount: number;
  totalCount: number;
}

export const JobReadyHumanFigure: React.FC<JobReadyHumanFigureProps> = ({
  newHire,
  currentDay,
  isHindi = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "learning" | "practice" | "simulation" | "assessment"
  >("practice");

  const [activePillarModal, setActivePillarModal] = useState<CapabilityCategory | null>(null);
  const [activeCriteriaModal, setActiveCriteriaModal] = useState<any | null>(null);

  const capabilities = newHire.capabilities || {};
  const currentCapId = newHire.currentCapabilityId || 3;

  // Calculate demonstrated capabilities
  const demonstratedCount = (
    Object.values(capabilities) as CapabilityState[]
  ).filter(
    (c) =>
      c &&
      (c.evidence === "demonstrated" ||
        c.mastery === "proficient" ||
        c.mastery === "mastered")
  ).length;

  // Modules completed (out of 10)
  const modulesCompleted = newHire.modulesCompleted ?? Math.min(10, currentDay);
  const quizAvg = newHire.quizAverageScore ?? 94;

  // 4 Core Reference Image Pillars calculated from real intelligence state:
  // 1. Learning (20% weight) - Video & Theory LMS modules
  const learningCompleted = Math.min(12, Math.round((modulesCompleted / 10) * 12));
  const learningRatio = Math.min(1, modulesCompleted / 10);
  const learningPct = Math.round(learningRatio * 20);

  // 2. Practice (25% weight) - Floor exercises & Aisle drills
  const practiceTotal = 10;
  const practiceCompleted = Math.min(
    practiceTotal,
    Math.round((demonstratedCount / 20) * 10) + (currentDay >= 3 ? 2 : 1)
  );
  const practiceRatio = Math.min(1, practiceCompleted / practiceTotal);
  const practicePct = Math.round(practiceRatio * 25);

  // 3. Simulation (25% weight) - Practical terminal activities & mock orders
  const simTotal = 8;
  const simCompleted = Math.min(
    simTotal,
    Math.round((demonstratedCount / 20) * 8) + (currentDay >= 4 ? 2 : 1)
  );
  const simRatio = Math.min(1, simCompleted / simTotal);
  const simPct = Math.round(simRatio * 25);

  // 4. Assessment (30% weight) - Real floor shift verification & solo SLA tests
  const assessTotal = 3;
  const assessCompleted =
    currentDay >= 5 && demonstratedCount >= 10
      ? 3
      : currentDay >= 4
      ? 2
      : currentDay >= 3
      ? 1
      : 0;
  const assessRatio = assessCompleted / assessTotal;
  const assessPct = Math.round(assessRatio * 30);

  // Authoritative Overall Job Readiness calculation
  const overallReadiness = typeof newHire.overallReadinessScore === "number"
    ? (newHire.overallReadinessScore <= 1 ? Math.round(newHire.overallReadinessScore * 100) : Math.round(newHire.overallReadinessScore))
    : assessReadiness(capabilities, newHire);

  const categories: CapabilityCategory[] = [
    {
      id: "learning",
      title: "Learning",
      titleHi: "थ्योरी और वीडियो",
      weight: 20,
      completedText: `Video modules completed ${learningCompleted}/12`,
      completedTextHi: `वीडियो मॉड्यूल पूर्ण ${learningCompleted}/12`,
      color: "#3b82f6",
      gradientId: "grad-learning-blue",
      bgClass: "bg-blue-500",
      textClass: "text-blue-600",
      borderClass: "border-blue-200",
      icon: <Play className="w-3.5 h-3.5 fill-current" />,
      ratio: learningRatio,
      completedCount: learningCompleted,
      totalCount: 12,
    },
    {
      id: "practice",
      title: "Practice",
      titleHi: "फ्लोर अभ्यास",
      weight: 25,
      completedText: `Exercises completed ${practiceCompleted}/${practiceTotal}`,
      completedTextHi: `अभ्यास ड्रिल पूर्ण ${practiceCompleted}/${practiceTotal}`,
      color: "#10b981",
      gradientId: "grad-practice-green",
      bgClass: "bg-emerald-500",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-200",
      icon: <Dumbbell className="w-3.5 h-3.5" />,
      ratio: practiceRatio,
      completedCount: practiceCompleted,
      totalCount: practiceTotal,
    },
    {
      id: "simulation",
      title: "Simulation",
      titleHi: "सिमुलेशन लैब",
      weight: 25,
      completedText: `Practical activities completed ${simCompleted}/${simTotal}`,
      completedTextHi: `प्रैक्टिकल एक्टिविटी पूर्ण ${simCompleted}/${simTotal}`,
      color: "#8b5cf6",
      gradientId: "grad-sim-purple",
      bgClass: "bg-purple-500",
      textClass: "text-purple-600",
      borderClass: "border-purple-200",
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      ratio: simRatio,
      completedCount: simCompleted,
      totalCount: simTotal,
    },
    {
      id: "assessment",
      title: "Assessment",
      titleHi: "फ्लोर टेस्ट",
      weight: 30,
      completedText: `Final assessment passed ${assessCompleted}/${assessTotal}`,
      completedTextHi: `फाइनल टेस्ट पास ${assessCompleted}/${assessTotal}`,
      color: "#f59e0b",
      gradientId: "grad-assess-orange",
      bgClass: "bg-amber-500",
      textClass: "text-amber-600",
      borderClass: "border-amber-200",
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
      ratio: assessRatio,
      completedCount: assessCompleted,
      totalCount: assessTotal,
    },
  ];

  const getPillarModalDetails = (id: string, score: number) => {
    switch (id) {
      case "learning":
        return {
          statusText: score >= 25 ? (isHindi ? "🏆 उत्कृष्ट प्रगति" : "🏆 Excellent Progress") : (isHindi ? "⚠️ ध्यान देने की आवश्यकता" : "⚠️ Needs Focus"),
          statusColor: score >= 25 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-405 text-amber-400 bg-amber-500/10 border border-amber-500/20",
          onTrack: score >= 25 ? (isHindi ? "ट्रैक पर" : "ON TRACK") : (isHindi ? "सुधार आवश्यक" : "NEEDS IMPROVEMENT"),
          onTrackColor: score >= 25 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300",
          desc: isHindi 
            ? "यह श्रेणी आपके सिद्धांत और वीडियो-आधारित एलएमएस मॉड्यूल प्रगति को मापती है।"
            : "This category measures your digital micro-module completion in our learning system (LMS).",
          currentStats: isHindi
            ? `आपके 3/10 मॉड्यूल्स पूरे हैं, जिससे आपका स्कोर 9% (कुल वेटेज: 20%) है।`
            : `You have completed 3 of 10 micro-modules, giving you a 6% score (out of 20% category weight).`,
          targetStats: isHindi
            ? "सर्टिफिकेशन के लिए न्यूनतम 8 मॉड्यूल्स (16% स्कोर) आवश्यक हैं।"
            : "Target requires at least 8 completed modules (16% score) to clear Day 10 handover.",
          guidance: isHindi
            ? "कृपया रोज़ाना 1 वीडियो मॉड्यूल पूरा करने पर ध्यान दें। शेल्फ और स्कैनर केयर गाइड को प्राथमिकता दें।"
            : "Focus on completing 1 learning module per day. Prioritize Shelf Alignment and Scanner Care guides to stay on track."
        };
      case "practice":
        return {
          statusText: score >= 20 ? (isHindi ? "🏆 उत्कृष्ट" : "🏆 Excellent") : (isHindi ? "⚠️ सुधार की आवश्यकता" : "⚠️ Needs Focus"),
          statusColor: score >= 20 ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10",
          onTrack: score >= 20 ? (isHindi ? "ट्रैक पर" : "ON TRACK") : (isHindi ? "ट्रैक से बाहर" : "NOT ON TRACK"),
          onTrackColor: score >= 20 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300",
          desc: isHindi
            ? "यह आपके फ्लोर पिकिंग गति और बारकोड स्कैनिंग सटीकता अभ्यास को मापता है।"
            : "This monitors your actual floor picking pace, transit accuracy, and scan success rates during exercises.",
          currentStats: isHindi
            ? `आप 114 PPH (पिक्स प्रति घंटा) की शानदार गति बनाए हुए हैं, जिससे आपका स्कोर 23% (कुल वेटेज: 25%) है।`
            : `You are averaging an outstanding 114 PPH (Picks Per Hour), giving you a 23% score (out of 25% category weight).`,
          targetStats: isHindi
            ? "लक्ष्य: 110+ पिक्स प्रति घंटा।"
            : "Target: Average above 110 picks per hour comfortably.",
          guidance: isHindi
            ? "आप पहले से ही बेहतरीन प्रदर्शन कर रहे हैं! Aisles 4-8 में सामान ढूंढते वक्त अपनी गति पर थोड़ा और ध्यान दें।"
            : "Your floor navigation is clean. Keep practicing in cold room zones to reduce searching lag even further."
        };
      case "simulation":
        return {
          statusText: score >= 15 ? (isHindi ? "🏆 अच्छा प्रदर्शन" : "🏆 Good Progress") : (isHindi ? "⚠️ अभ्यास करें" : "⚠️ Needs Focus"),
          statusColor: score >= 15 ? "text-cyan-300 bg-cyan-500/10" : "text-amber-400 bg-amber-500/10",
          onTrack: score >= 15 ? (isHindi ? "ट्रैक पर" : "ON TRACK") : (isHindi ? "ट्रैक से बाहर" : "NOT ON TRACK"),
          onTrackColor: score >= 15 ? "bg-cyan-500/20 text-cyan-300" : "bg-amber-500/20 text-amber-300",
          desc: isHindi
            ? "यह श्रेणी आपके सिम्युलेटेड वॉकथ्रू और मॉक ऑर्डर्स को पूरा करने को दर्शाती है।"
            : "This tracks simulated shelf alignment, complex orders, and virtual system diagnostics walkthroughs.",
          currentStats: isHindi
            ? `आपके 5/8 सिमुलेशन लैब अभ्यास पूरे हैं, जिससे आपका स्कोर 16% (कुल वेटेज: 25%) है।`
            : `You have cleared 5 of 8 simulation lab challenges, giving you a 16% score (out of 25% category weight).`,
          targetStats: isHindi
            ? "लक्ष्य: कम से कम 6 सिमुलेशन पूरे करना।"
            : "Target: Reach at least 6 completed simulations.",
          guidance: isHindi
            ? "अगला सिमुलेशन 'कठिन रैक और भारी सामान' पर आधारित है। इसे आज ही पूरा करें।"
            : "Your next simulation is 'Heavy Goods & High-Racks' navigation. Complete it today to boost this further."
        };
      case "assessment":
        return {
          statusText: score >= 15 ? (isHindi ? "🏆 स्वीकृत" : "🏆 Qualified") : (isHindi ? "⚠️ अधूरा" : "⚠️ Incomplete"),
          statusColor: score >= 15 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10 border border-rose-500/20",
          onTrack: score >= 15 ? (isHindi ? "ट्रैक पर" : "ON TRACK") : (isHindi ? "कार्रवाई आवश्यक" : "ACTION REQUIRED"),
          onTrackColor: score >= 15 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300",
          desc: isHindi
            ? "यह श्रेणी आपकी मुख्य क्विज़ और floor buddy द्वारा किए गए लाइव आकलन को ट्रैक करती है।"
            : "This reflects your scores on core quizzes and floor-buddy signoffs for solo shift readiness.",
          currentStats: isHindi
            ? `आपका स्कोर 10% (कुल वेटेज: 30%) है। 1 क्विज़ लंबित है।`
            : `Your score is 10% (out of 30% weight) because you have 1 pending device assessment.`,
          targetStats: isHindi
            ? "लक्ष्य: 85% से अधिक औसत अंक।"
            : "Target: Average above 85% score in all tests and buddy signoffs.",
          guidance: isHindi
            ? "स्कैनर बैटरी केयर और होल्स्टर सेफ्टी क्विज़ को आज पूरा करें ताकि इस श्रेणी में प्रगति बढ़ सके।"
            : "Complete the pending scanner care quiz today. This is the only hurdle preventing your Assessment certification."
        };
      default:
        return null;
    }
  };

  const getCriteriaModalDetails = (critName: string) => {
    switch (critName) {
      case "Attendance":
      case "शिफ्ट अटेंडेंस":
        return {
          name: isHindi ? "शिफ्ट अटेंडेंस" : "Shift Attendance",
          status: "Completed ✓",
          statusColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-emerald-500/20 text-emerald-300",
          desc: isHindi
            ? "10-दिवसीय ऑनबोर्डिंग कार्यक्रम के दौरान आपकी शिफ्ट में उपस्थिति दर्ज की गई।"
            : "Attendance track during your 10-day training onboarding phase.",
          metrics: isHindi ? "उपस्थिति: 100% (लक्ष्य: >95%)" : "Attendance: 100% (Target: >95%)",
          guidance: isHindi
            ? "शानदार! आपने कोई शिफ्ट मिस नहीं की है। इसी तरह अनुशासन बनाए रखें।"
            : "Excellent! You have had zero missed shifts or late check-ins. Keep up this perfect discipline!"
        };
      case "Device Care":
      case "उपकरण की देखभाल":
        return {
          name: isHindi ? "उपकरण की देखभाल" : "Standard Device Care",
          status: "Completed ✓",
          statusColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-emerald-500/20 text-emerald-300",
          desc: isHindi
            ? "ज़ेबरा स्कैनर डिवाइस को सही ढंग से संभालने और चार्जिंग डॉक पर लगाने की क्षमता।"
            : "Demonstrated safe handling of Zebra barcode scanning terminals, holsters, and proper battery dock checkouts.",
          metrics: isHindi ? "स्थिति: स्वीकृत (Passed)" : "Status: Verified & Passed",
          guidance: isHindi
            ? "आप डिवाइस को बहुत अच्छी तरह संभाल रहे हैं। काम समाप्त होने पर इसे डॉक करना न भूलें।"
            : "Device checkout and docking protocols are fully met. Continue using the safety holster at all times."
        };
      case "Pace Target":
      case "गति का लक्ष्य":
        return {
          name: isHindi ? "गति का लक्ष्य" : "Pace Target (Speed)",
          status: "Action Required ⚠️",
          statusColor: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
          onTrack: "NOT ON TRACK",
          onTrackColor: "bg-amber-500/20 text-amber-300",
          desc: isHindi
            ? "प्रति घंटे किए गए औसत पिक का न्यूनतम लक्ष्य।"
            : "Your average picking speed measured over active mock shifts.",
          metrics: isHindi ? "वर्तमान गति: 114 PPH (लक्ष्य: 115 PPH)" : "Current: 114 PPH (Target: 115 PPH)",
          guidance: isHindi
            ? "आप लक्ष्य के बहुत करीब हैं! Aisles 4-8 (आटा और भारी रैक) में अपनी गति को थोड़ा बढ़ाने से यह लक्ष्य पार हो जाएगा।"
            : "You are exceptionally close! Spend a little more time navigating Aisles 4-8 to push past the 115 PPH benchmark."
        };
      case "Scan Accuracy":
      case "स्कैन सटीकता":
        return {
          name: isHindi ? "स्कैन सटीकता" : "Scan Accuracy",
          status: "Completed ✓",
          statusColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-emerald-500/20 text-emerald-300",
          desc: isHindi
            ? "पिकिंग के दौरान बिना किसी गलत स्कैन के सही सामान चुनने की दर।"
            : "The percentage of items scanned and picked successfully on the first attempt without mis-scans.",
          metrics: isHindi ? "आपकी सटीकता: 99.1% (लक्ष्य: >99%)" : "Accuracy: 99.1% (Target: >99.0%)",
          guidance: isHindi
            ? "प्रशंसनीय सटीकता! आप लगभग कोई गलती नहीं कर रहे हैं। इसे इसी तरह बनाए रखें।"
            : "Superb! Your scan accuracy exceeds the operational threshold, keeping customer orders perfect."
        };
      case "Safety Record":
      case "सुरक्षा रिकॉर्ड":
        return {
          name: isHindi ? "सुरक्षा रिकॉर्ड" : "Safety Compliance",
          status: "Completed ✓",
          statusColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-emerald-500/20 text-emerald-300",
          desc: isHindi
            ? "फ्लोर पर ट्रॉली ले जाने और भारी वजन उठाने की सुरक्षा गाइडलाइंस का पालन।"
            : "Adherence to dark store floor safety, trolley handling, and safe lifting/bending guidelines.",
          metrics: isHindi ? "सुरक्षा उल्लंघन: 0 (शून्य)" : "Violations: 0 (Zero)",
          guidance: isHindi
            ? "सुरक्षित काम ही सही काम है। परफेक्ट सुरक्षा रिकॉर्ड!"
            : "Perfect score! You've maintained safe warehouse posture and trolley discipline. Keep yourself safe!"
        };
      case "LMS Progress":
      case "LMS प्रोग्रेस":
        return {
          name: isHindi ? "LMS प्रोग्रेस" : "LMS Progress",
          status: "Action Required ⚠️",
          statusColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
          onTrack: "ACTION REQUIRED",
          onTrackColor: "bg-rose-500/20 text-rose-300",
          desc: isHindi
            ? "10-दिवसीय ऑनबोर्डिंग कोर्स में आपके पूरे किए गए वीडियो कोर्स।"
            : "Your overall digital course micro-module completions in the LMS.",
          metrics: isHindi ? "पूर्ण: 3/10 (लक्ष्य: कम से कम 8)" : "Completed: 3/10 (Target: At least 8)",
          guidance: isHindi
            ? "सर्टिफिकेशन से पहले आपको कम से कम 8 मॉड्यूल्स पूरे करने होंगे। आज ही 1 नया मॉड्यूल पूरा करें।"
            : "LMS completion is your primary certification blocker. Please clear outstanding micro-modules to resolve."
        };
      case "Buddy Feedback":
      case "बडी फीडबैक":
        return {
          name: isHindi ? "बडी फीडबैक" : "Floor Buddy Feedback",
          status: "Completed ✓",
          statusColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-emerald-500/20 text-emerald-300",
          desc: isHindi
            ? "सीनियर गाइड (विक्रम भैया) द्वारा आपकी संचार, टीमवर्क और फ्लोर व्यवहार पर रेटिंग।"
            : "Live floor assessment feedback and signoff from senior guide Vikram bhaiya.",
          metrics: isHindi ? "बडी फीडबैक: स्वीकृत (Passed)" : "Feedback: Verified & Signed Off",
          guidance: isHindi
            ? "विक्रम भैया आपके संवाद और फ्लोर व्यवहार से बहुत खुश हैं! आप पूरी तरह से रेडी हैं।"
            : "Vikram signed off on your communication, aisle behavior, and readiness to pick independently. Great teamwork!"
        };
      default:
        return {
          name: critName,
          status: "Check Status",
          statusColor: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20",
          onTrack: "ON TRACK",
          onTrackColor: "bg-cyan-500/20 text-cyan-300",
          desc: "Review this criteria to stay on track for Day 10 Certification.",
          metrics: "Target Met",
          guidance: "Continue your excellent effort across all dark store zones."
        };
    }
  };

  // Learning journey stages matching reference image bottom bar
  const journeyStages = [
    {
      id: 1,
      title: isHindi ? "लर्निंग वीडियो" : "Learning Videos",
      sub: isHindi ? "ज्ञान बढ़ाएं" : "Build your knowledge",
      status: currentDay >= 1 ? "completed" : "locked",
      icon: <Play className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: 2,
      title: isHindi ? "फ्लोर प्रैक्टिस" : "Practice",
      sub: isHindi ? "हुनर तराशें" : "Sharpen your skills",
      status: currentDay >= 2 ? "completed" : "locked",
      icon: <Dumbbell className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: 3,
      title: isHindi ? "सिमुलेशन लैब" : "Simulation Lab",
      sub: isHindi ? "प्रैक्टिकल अनुभव" : "Get hands-on experience",
      status: currentDay === 3 ? "active" : currentDay > 3 ? "completed" : "locked",
      icon: <FlaskConical className="w-4 h-4" />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: 4,
      title: isHindi ? "वर्कप्लेस इंग्लिश" : "Workplace Hindi/Eng",
      sub: isHindi ? "आत्मविश्वास से बोलें" : "Speak with confidence",
      status: currentDay >= 4 ? "completed" : "locked",
      icon: <Volume2 className="w-4 h-4" />,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      id: 5,
      title: isHindi ? "शिफ्ट इंटरव्यू" : "Interview Prep",
      sub: isHindi ? "तैयारी पूरी करें" : "Practice & get ready",
      status: currentDay >= 5 ? "completed" : "locked",
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
    {
      id: 6,
      title: isHindi ? "फाइनल असेसमेंट" : "Final Assessment",
      sub: isHindi ? "अपनी क्षमता दिखाएं" : "Show what you can do",
      status: currentDay >= 5 && overallReadiness >= 70 ? "completed" : "locked",
      icon: <FileCheck2 className="w-4 h-4" />,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: 7,
      title: isHindi ? "जॉब सर्टिफिकेट" : "Certificate",
      sub: isHindi ? "सर्टिफाइड बनें" : "Get your credential",
      status: overallReadiness >= 85 ? "completed" : "locked",
      icon: <Award className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const activeCategoryData =
    categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <section
      id="job-ready-human-dashboard"
      className="bg-white/5 border border-white/10 text-white rounded-[24px] p-3 sm:p-4 shadow-xl space-y-4 select-none backdrop-blur-md"
    >
      {/* SLEEK COMPACT HERO & CATEGORIES */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Readiness % Widget */}
        <div className="bg-gradient-to-br from-violet-600/90 via-purple-600/90 to-indigo-700/90 rounded-[20px] p-3 shadow-lg shadow-purple-900/15 flex items-center gap-3 sm:w-1/3">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
              <circle
                cx="50" cy="50" r="40" stroke="#34d399" strokeWidth="8" strokeLinecap="round" fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - overallReadiness / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black tracking-tighter text-white">{overallReadiness}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">{isHindi ? "रेडीनेस" : "Readiness"}</div>
            <div className="text-[11px] font-semibold text-purple-100 truncate">{isHindi ? "वेयरहाउस एसोसिएट" : "Warehouse Associate"}</div>
          </div>
        </div>

        {/* 4 Sleek Learning Pillars */}
        <div className="flex-1 grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const catScore = Math.round(cat.ratio * cat.weight);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActivePillarModal(cat);
                }}
                className={`rounded-[16px] border p-2 flex flex-col justify-between items-center text-center cursor-pointer active:scale-95 transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-cyan-400 to-blue-600 border-transparent text-slate-950 shadow-md ring-1 ring-cyan-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mb-1 ${
                  isSelected ? "bg-slate-950/10 text-slate-950" : "bg-white/10 text-cyan-300"
                }`}>
                  {cat.icon}
                </div>
                <div className="w-full">
                  <div className={`text-[10px] font-black mb-1 ${isSelected ? "text-slate-950" : "text-white"}`}>{catScore}%</div>
                  <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? "bg-slate-950/20" : "bg-white/10"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-slate-950" : "bg-cyan-400"}`}
                      style={{ width: `${Math.round(cat.ratio * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DAY 10 COMMERCIAL CERTIFICATION AUDIT (7 CRITERIA)            */}
      {/* ------------------------------------------------------------- */}
      {(() => {
        const day10Audit = evaluateDay10Outcome(newHire);
        return (
          <div className="bg-white/5 rounded-3xl p-4 sm:p-5 border border-white/10 shadow-md space-y-3">
            {/* Clean Header Card */}
            <div className="bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent rounded-2xl p-3 sm:p-3.5 border border-cyan-400/20 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                    {isHindi ? "डे 10 कमर्शियल सर्टिफिकेशन (7 क्राइटेरिया)" : "Day 10 Commercial Certification"}
                  </h3>
                  <p className="text-[10px] text-slate-350 font-bold uppercase tracking-wider mt-0.5">
                    {isHindi ? "7 आवश्यक व्यावसायिक मानदंड" : "7 Core Operational Criteria Audit"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {day10Audit.isReady ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHindi ? "जॉब रेडी" : "JOB READY"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isHindi ? "नॉट रेडी" : "NOT READY"}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              {day10Audit.summary}
            </p>

            {/* 7 Criteria Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {day10Audit.verifiedCriteria.map((crit, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveCriteriaModal(crit)}
                  className={`p-2.5 rounded-2xl border flex items-start gap-2 cursor-pointer transition-all duration-200 active:scale-95 select-none hover:bg-white/10 hover:border-white/20 ${
                    crit.met
                      ? "bg-white/10 border-white/10 text-slate-200"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-200"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {crit.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/10" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs">{crit.name}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{crit.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {!day10Audit.isReady && day10Audit.unresolvedBlockers.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 font-semibold">
                <div className="font-black text-amber-300 mb-0.5">
                  {isHindi ? "मुख्य रुकावट → आवश्यक अगला कदम:" : "Main blocker → Required next action:"}
                </div>
                <div>
                  {day10Audit.unresolvedBlockers[0]} • {day10Audit.recommendedAction}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SECTION: "Your Learning Journey" (Slim Compact Bar)      */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white tracking-tight">
            {isHindi ? "आपकी लर्निंग जर्नी" : "Your Learning Journey"}
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">7 Stages</span>
        </div>

        {/* Slim Horizontal Scrollable Stage Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          {journeyStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                className={`px-3 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-2.5 ${
                  stage.status === "completed"
                    ? "bg-white/10 border-emerald-500/30 text-slate-200 hover:bg-white/15 shadow-2xs"
                    : stage.status === "active"
                    ? "bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border-cyan-400 text-white ring-2 ring-cyan-400/30 shadow-xs font-bold"
                    : "bg-[#111317]/40 border-white/5 text-slate-500 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    stage.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : stage.status === "active"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-950/20 text-slate-500"
                  }`}
                >
                  {stage.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black truncate leading-tight">
                    {stage.title}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-wider ${
                    stage.status === "completed"
                      ? "text-emerald-400"
                      : stage.status === "active"
                      ? "text-cyan-300"
                      : "text-slate-500"
                  }`}>
                    {stage.status === "completed"
                      ? (isHindi ? "पूर्ण" : "Completed")
                      : stage.status === "active"
                      ? (isHindi ? "सक्रिय" : "In Progress")
                      : (isHindi ? "आगामी" : "Upcoming")}
                  </div>
                </div>
              </div>

              {idx < journeyStages.length - 1 && (
                <div className="w-3 h-0.5 bg-white/10 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. PILLAR (CATEGORY) DRILLDOWN POPUP TAB   */}
      {/* ========================================== */}
      {activePillarModal && (() => {
        const catScore = Math.round(activePillarModal.ratio * activePillarModal.weight);
        const details = getPillarModalDetails(activePillarModal.id, catScore);
        if (!details) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#181b21] border border-white/10 p-5 sm:p-6 rounded-[28px] max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden text-white animate-in zoom-in-95 duration-200">
              {/* Top Decor Glow */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 text-cyan-400 flex items-center justify-center">
                    {activePillarModal.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {isHindi ? activePillarModal.titleHi : activePillarModal.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {isHindi ? `वेटेज: ${activePillarModal.weight}%` : `Weight: ${activePillarModal.weight}%`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActivePillarModal(null)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Status Header Block */}
              <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    {isHindi ? "वर्तमान स्कोर" : "Current Score"}
                  </span>
                  <span className="text-2xl font-black text-cyan-400">{catScore}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    {isHindi ? "ट्रैक स्थिति" : "Track Status"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase inline-block ${details.onTrackColor}`}>
                    {details.onTrack}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2.5 text-xs text-slate-200">
                <div>
                  <strong className="text-slate-400 block font-bold">
                    {isHindi ? "विवरण:" : "Description:"}
                  </strong>
                  <p className="font-medium leading-relaxed">{details.desc}</p>
                </div>

                <div>
                  <strong className="text-slate-400 block font-bold">
                    {isHindi ? "स्थिति विश्लेषण:" : "Status Analysis:"}
                  </strong>
                  <p className="font-semibold text-cyan-300 leading-relaxed">{details.currentStats}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{details.targetStats}</p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px]">
                  <strong className={`font-black uppercase tracking-wider block mb-1 ${details.statusColor}`}>
                    {details.statusText}
                  </strong>
                  <p className="font-semibold text-slate-200 leading-relaxed">{details.guidance}</p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setActivePillarModal(null)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
                >
                  {isHindi ? "ठीक है, समझ गया!" : "Alright, Got It!"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================== */}
      {/* 2. CRITERIA DRILLDOWN POPUP TAB            */}
      {/* ========================================== */}
      {activeCriteriaModal && (() => {
        const details = getCriteriaModalDetails(activeCriteriaModal.name);
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#181b21] border border-white/10 p-5 sm:p-6 rounded-[28px] max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden text-white animate-in zoom-in-95 duration-200">
              {/* Top Decor Glow */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeCriteriaModal.met ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {activeCriteriaModal.met ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">
                      {details.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {isHindi ? "व्यावसायिक ऑडिट" : "Core Operational Criteria"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveCriteriaModal(null)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Status Header Block */}
              <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    {isHindi ? "ऑडिट स्थिति" : "Audit Status"}
                  </span>
                  <span className={`text-sm font-black ${activeCriteriaModal.met ? "text-emerald-400" : "text-rose-400"}`}>
                    {details.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    {isHindi ? "ट्रैक स्थिति" : "Track Status"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase inline-block ${details.onTrackColor}`}>
                    {details.onTrack}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 text-xs text-slate-200">
                <div>
                  <strong className="text-slate-400 block font-bold">
                    {isHindi ? "मापदंड विवरण:" : "Criterion Standard:"}
                  </strong>
                  <p className="font-medium leading-relaxed">{details.desc}</p>
                </div>

                <div>
                  <strong className="text-slate-400 block font-bold">
                    {isHindi ? "आपका वास्तविक प्रदर्शन:" : "Your Measured Performance:"}
                  </strong>
                  <p className="font-bold text-purple-300 leading-relaxed text-sm">{details.metrics}</p>
                </div>

                <div className="p-3 bg-[#111317]/50 border border-white/5 rounded-xl space-y-1">
                  <strong className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                    {isHindi ? "सुझाव व अगला कदम:" : "Coach Guidance & Next Step:"}
                  </strong>
                  <p className="font-semibold text-slate-200 leading-relaxed text-[11px]">{details.guidance}</p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setActiveCriteriaModal(null)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
                >
                  {isHindi ? "ठीक है, बंद करें" : "Alright, Close"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};

