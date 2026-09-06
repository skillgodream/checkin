import {
  DailySignal,
  ManagerSignal,
  WorkSignal,
  IdentifiedPattern,
  RecommendedAction,
  NewHireStatus,
  NewHire,
  DayRecord,
  ActionOutcome,
} from "../types";

export interface PatternSynthesisResult {
  pattern: IdentifiedPattern;
  action: RecommendedAction;
  updatedStatus: NewHireStatus;
  statusReason: string;
}

export interface LoopExecutionInput {
  hire: NewHire;
  dayNumber: number;
  dailySignal?: DailySignal;
  managerSignal?: ManagerSignal;
  workSignal: WorkSignal;
  actionOutcome?: ActionOutcome;
  previousRecord?: DayRecord;
  existingAction?: RecommendedAction;
}

export async function analyzeDailyReport(
  text: string,
  newHireName: string = "Rahul",
  dayNumber: number = 3
): Promise<Partial<DailySignal>> {
  try {
    const res = await fetch("/api/signals/understand-daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, newHireName, dayNumber }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        issue: data.issue,
        confidence: data.confidence,
        possibleImpact: data.possibleImpact,
        category: data.category,
        summary: data.summary,
        companionResponse: data.companionResponse,
      };
    }
  } catch (err) {
    console.warn("Client fallback for daily report analysis:", err);
  }

  // Robust deterministic fallback
  const lower = text.toLowerCase();
  if (
    lower.includes("confused") ||
    lower.includes("where") ||
    lower.includes("find") ||
    lower.includes("aisle") ||
    lower.includes("shelf") ||
    lower.includes("rack") ||
    lower.includes("location")
  ) {
    return {
      issue: "Location navigation in high-frequency aisles",
      confidence: "High",
      possibleImpact: "Slow picking, elevated search time",
      category: "Environment",
      summary: "Worker understands scanning and device usage, but experiences friction locating specific product bins in Aisles 4-8.",
      companionResponse:
        `Don't worry, ${newHireName}! Floor layouts in high-frequency aisles take 2-3 shifts to memorize. High pick accuracy is your priority.`,
    };
  }

  if (
    lower.includes("scan") ||
    lower.includes("device") ||
    lower.includes("battery") ||
    lower.includes("bluetooth") ||
    lower.includes("disconnect") ||
    lower.includes("gun") ||
    lower.includes("barcode")
  ) {
    return {
      issue: "Handheld scanner & tool handling friction",
      confidence: "High",
      possibleImpact: "Order delays, re-scanning loops",
      category: "Tool",
      summary: "Worker encountered scanner connection or barcode reading delays on floor.",
      companionResponse:
        `Understood ${newHireName}. Clean the scanner optical lens with microfiber and alert your buddy if Bluetooth drops again.`,
    };
  }

  if (
    lower.includes("tired") ||
    lower.includes("feet") ||
    lower.includes("heavy") ||
    lower.includes("pain") ||
    lower.includes("exhausted") ||
    lower.includes("break")
  ) {
    return {
      issue: "Physical stamina pacing during shift peak",
      confidence: "Medium",
      possibleImpact: "Mid-shift fatigue, late order lag",
      category: "Physical",
      summary: "Worker is adjusting to floor walking distances and crate lifting volume.",
      companionResponse:
        `Great stamina effort today ${newHireName}. Remember to take your micro-breaks and use proper crate lifting posture!`,
    };
  }

  if (
    lower.includes("smooth") ||
    lower.includes("fast") ||
    lower.includes("good") ||
    lower.includes("confident") ||
    lower.includes("hit target") ||
    lower.includes("paced") ||
    lower.includes("easy")
  ) {
    return {
      issue: "Steady ramp progression",
      confidence: "High",
      possibleImpact: "Positive curve acceleration",
      category: "General",
      summary: "Worker is navigating smoothly and hitting expected ramp pace.",
      companionResponse:
        `Fantastic shift, ${newHireName}! You are building great muscle memory on the floor.`,
    };
  }

  return {
    issue: "General floor onboarding observation",
    confidence: "Medium",
    possibleImpact: "Standard ramp curve progress",
    category: "General",
    summary: text.slice(0, 100),
    companionResponse: `Thanks for checking in, ${newHireName}. Your floor buddy and team have your back!`,
  };
}

export async function askCompanion(
  question: string,
  dayNumber: number = 3
): Promise<string> {
  try {
    const res = await fetch("/api/companion/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, dayNumber, role: "Dark Store Picker" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn("Companion ask fallback used:", err);
  }

  // Deterministic helpful answer
  const q = question.toLowerCase();
  if (q.includes("dairy") || q.includes("cold") || q.includes("frozen") || q.includes("ice")) {
    return "Chilled and frozen dairy items are located in Aisle 8 Chiller Zone. Pick these items last on your order list so cold chain temperature is maintained!";
  }
  if (q.includes("barcode") || q.includes("scan") || q.includes("not working")) {
    return "If the barcode won't scan after two attempts: wipe the scanner lens, flatten the packaging, or enter the 4-digit short SKU code directly on your screen.";
  }
  if (q.includes("missing") || q.includes("not on shelf") || q.includes("out of stock")) {
    return "Spend no more than 30 seconds searching a single bin. If empty, tap 'Bin Empty' on your scanner to trigger inventory backstock check, and move to your next pick.";
  }
  return "Remember the 3 rules for today: 1. Confirm product name and weight before scanning. 2. Keep heavy items at bottom of the tote. 3. Ask your buddy Vikram if you ever get turned around in Aisles 4-8!";
}

/**
 * AUTHORITATIVE CORE LOOP EXECUTION
 * Handles the complete 5-stage loop:
 * 1. OBSERVE   - Ingests worker daily signal, manager observation, and telemetry work signal.
 * 2. UNDERSTAND - Interprets friction category, confidence, severity, and whether attention is needed.
 * 3. CONNECT   - Integrates real employee context (name, buddy, supervisor, role, previous metrics).
 * 4. ACT       - Produces targeted smallest practical floor action for the designated actor.
 * 5. CHECK     - Compares before vs after metrics / outcome records to verify improvement.
 */
export function executeCoordinationLoop(input: LoopExecutionInput): PatternSynthesisResult {
  const {
    hire,
    dayNumber,
    dailySignal,
    managerSignal,
    workSignal,
    actionOutcome,
    previousRecord,
    existingAction,
  } = input;

  const currentPickRate = workSignal?.actualPickRate ?? 35;
  const targetPickRate = workSignal?.targetPickRate ?? 50;
  const accuracy = workSignal?.accuracyRate ?? 98;
  const speedGap = targetPickRate - currentPickRate;

  const hireName = hire.name || "Worker";
  const firstName = hireName.split(" ")[0];
  const buddyName = (hire.buddy || "Senior Buddy").split(" ")[0];
  const supervisorName = (hire.supervisor || "Supervisor").split(" ")[0];
  const roleTitle = hire.roleTitle || "Picker";
  const previousPickRate = previousRecord?.workSignal?.actualPickRate;

  // 1. OBSERVE & 2. UNDERSTAND: Signal interpretation & severity detection
  const textContent = `${dailySignal?.issue || ""} ${dailySignal?.rawText || ""} ${dailySignal?.category || ""}`.toLowerCase();
  const managerNotes = (managerSignal?.notes || "").toLowerCase();

  const hasLocationConfusion =
    textContent.includes("location") ||
    textContent.includes("confused") ||
    textContent.includes("where") ||
    textContent.includes("aisle") ||
    textContent.includes("shelf") ||
    textContent.includes("rack") ||
    managerNotes.includes("location") ||
    managerNotes.includes("aisle");

  const hasToolFriction =
    dailySignal?.category === "Tool" ||
    textContent.includes("scan") ||
    textContent.includes("device") ||
    textContent.includes("battery") ||
    textContent.includes("barcode") ||
    managerSignal?.issueCategory === "Tool";

  const hasVariantQualityFriction =
    accuracy < 90 ||
    managerSignal?.issueCategory === "Accuracy" ||
    textContent.includes("variant") ||
    textContent.includes("wrong item");

  const isAccuracyCritical = accuracy < 90;
  const managerStruggling = managerSignal?.state === "Struggling";
  const managerNeedsSupport = managerSignal?.state === "Needs support";

  let pattern: IdentifiedPattern;
  let action: RecommendedAction;
  let interimStatus: NewHireStatus = "Doing well";
  let interimStatusReason = "";

  // 3. CONNECT & 4. ACT: Derive pattern and targeted smallest practical action
  if (hasLocationConfusion && (speedGap >= 8 || managerNeedsSupport || managerStruggling)) {
    pattern = {
      id: `pat-${hire.id}-d${dayNumber}`,
      dayNumber,
      patternName: "Environmental/process familiarity issue",
      patternConfidence: "High",
      diagnosis: `${firstName} (${roleTitle}) reports aisle/rack navigation confusion. High accuracy (${accuracy}%) confirms strong diligence, but search time in high-frequency aisles slows pick pace to ${currentPickRate}/hr (Target: ${targetPickRate}/hr). Friction is spatial familiarity, not capability.`,
      category: "Environment",
      connectedSignalSummary: [
        `🗣️ Worker: "${dailySignal?.rawText || "Confused where items are located in high aisles"}"`,
        `👔 Manager: ${managerSignal?.state || "Needs support"} (${managerSignal?.issueCategory || "Process"})`,
        `📊 Work Telemetry: ${currentPickRate} picks/hr vs ${targetPickRate} target (${speedGap} gap), ${accuracy}% accuracy`,
      ],
      detectedAt: "Just now",
    };

    action = {
      id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
      dayNumber,
      actionType: "buddy_walkthrough",
      title: "Buddy walkthrough of location navigation & rack numbering",
      description: `Pair ${firstName} with Senior Picker ${buddyName} for a 15-minute floor walkthrough focusing on high-frequency rack labeling, bin codes, and fast aisle access.`,
      targetActor: `Buddy (${buddyName} - Senior Picker)`,
      urgency: "Next Shift",
      smallestPracticalStep: `15-minute floor walkthrough before the peak order window with buddy ${buddyName}.`,
      status: existingAction?.status === "completed" ? "completed" : "pending",
      createdAt: existingAction?.createdAt || "Just now",
    };

    interimStatus = "Needs attention";
    interimStatusReason = `Pick pace (${currentPickRate}/${targetPickRate}) delayed by aisle navigation friction; buddy walkthrough with ${buddyName} scheduled.`;
  } else if (hasVariantQualityFriction || isAccuracyCritical || (managerStruggling && managerSignal?.issueCategory === "Accuracy")) {
    pattern = {
      id: `pat-${hire.id}-d${dayNumber}`,
      dayNumber,
      patternName: "Item variant differentiation & verification rush",
      patternConfidence: "High",
      diagnosis: `Accuracy is at ${accuracy}% (below 98% quality threshold). ${firstName} is rushing pick pace and scanning incorrect packaging sizes or SKU variants.`,
      category: "Process",
      connectedSignalSummary: [
        `🗣️ Worker: ${dailySignal?.issue || "Item variants look identical"}`,
        `👔 Manager: ${managerSignal?.state || "Struggling"} on Accuracy`,
        `📊 Work Telemetry: ${accuracy}% accuracy (quality threshold 98%)`,
      ],
      detectedAt: "Just now",
    };

    action = {
      id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
      dayNumber,
      actionType: "demonstrate_task",
      title: "Demonstrate 3-point check (Brand, Weight Grammage, Barcode)",
      description: `Floor supervisor ${supervisorName} demonstrates the 3-point physical check for variant-heavy categories (biscuits, detergents, spices). Clarify that accuracy takes priority over speed during ramp-up.`,
      targetActor: `Supervisor (${supervisorName} - Shift In-charge)`,
      urgency: "Immediate",
      smallestPracticalStep: "10-minute floor demonstration with 5 tricky product variant sets.",
      status: existingAction?.status === "completed" ? "completed" : "pending",
      createdAt: existingAction?.createdAt || "Just now",
    };

    interimStatus = "At risk";
    interimStatusReason = `Critical accuracy alert (${accuracy}%); supervisor floor demo required before next shift.`;
  } else if (hasToolFriction) {
    pattern = {
      id: `pat-${hire.id}-d${dayNumber}`,
      dayNumber,
      patternName: "Tool / scanner operation friction",
      patternConfidence: "High",
      diagnosis: `${firstName} encountered barcode scanner or terminal connectivity delays during peak pick cycles, causing repeated rescans.`,
      category: "Tool",
      connectedSignalSummary: [
        `🗣️ Worker: "${dailySignal?.rawText || "Scanner disconnected during picking"}"`,
        `👔 Manager: ${managerSignal?.state || "Observing"} (${managerSignal?.issueCategory || "Tool"})`,
        `📊 Work Telemetry: ${currentPickRate} picks/hr, ${accuracy}% accuracy`,
      ],
      detectedAt: "Just now",
    };

    action = {
      id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
      dayNumber,
      actionType: "practice",
      title: "Scanner cleaning & manual SKU entry practice",
      description: `Review scanner lens maintenance, Bluetooth pairing check, and fallback manual SKU entry with buddy ${buddyName}.`,
      targetActor: `Buddy (${buddyName})`,
      urgency: "Next Shift",
      smallestPracticalStep: "5-minute device check and re-pairing sequence before shift.",
      status: existingAction?.status === "completed" ? "completed" : "pending",
      createdAt: existingAction?.createdAt || "Just now",
    };

    interimStatus = "Needs attention";
    interimStatusReason = `Tool friction detected; scanner check-in with buddy ${buddyName} recommended.`;
  } else if (speedGap <= 5 && accuracy >= 95) {
    pattern = {
      id: `pat-${hire.id}-d${dayNumber}`,
      dayNumber,
      patternName: "Steady Ramp Progression",
      patternConfidence: "High",
      diagnosis: `Pick rate (${currentPickRate}/hr) is aligned with ramp curve and accuracy is high (${accuracy}%). ${firstName} is navigating the store confidently.`,
      category: "General",
      connectedSignalSummary: [
        `🗣️ Worker: "${dailySignal?.rawText || "Pacing is feeling smooth"}"`,
        `👔 Manager: ${managerSignal?.state || "Doing well"}`,
        `📊 Work Telemetry: ${currentPickRate} picks/hr (target ${targetPickRate}), ${accuracy}% accuracy`,
      ],
      detectedAt: "Just now",
    };

    action = {
      id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
      dayNumber,
      actionType: "no_action",
      title: "Maintain Standard Ramp Progression",
      description: "No special intervention needed. Continue regular shift monitoring.",
      targetActor: "Self & Supervisor",
      urgency: "Monitor",
      smallestPracticalStep: "Regular shift review at end of day.",
      status: "completed",
      createdAt: existingAction?.createdAt || "Just now",
    };

    interimStatus = "Doing well";
    interimStatusReason = `Performing on curve (${currentPickRate} picks/hr, ${accuracy}% accuracy).`;
  } else {
    pattern = {
      id: `pat-${hire.id}-d${dayNumber}`,
      dayNumber,
      patternName: "Standard Ramp-up Adjustment",
      patternConfidence: "Medium",
      diagnosis: `${firstName} is continuing standard floor adjustment. Signals show normal pacing progression typical of early ramp shifts.`,
      category: "General",
      connectedSignalSummary: [
        `📊 Pick rate: ${currentPickRate}/${targetPickRate}`,
        `🎯 Accuracy: ${accuracy}%`,
      ],
      detectedAt: "Just now",
    };

    action = {
      id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
      dayNumber,
      actionType: "practice",
      title: "Guided Solo Practice on Core Aisles",
      description: `Allow ${firstName} to continue independent picking with regular buddy check-ins from ${buddyName}.`,
      targetActor: `Buddy (${buddyName})`,
      urgency: "Monitor",
      smallestPracticalStep: `Brief 5-min mid-shift check-in with ${buddyName}.`,
      status: existingAction?.status === "completed" ? "completed" : "pending",
      createdAt: existingAction?.createdAt || "Just now",
    };

    interimStatus = managerNeedsSupport ? "Needs attention" : "Doing well";
    interimStatusReason = `Standard progression monitoring. Pick rate: ${currentPickRate}/${targetPickRate}.`;
  }

  // 5. CHECK: Evaluate before vs after metrics and outcome records
  let finalStatus: NewHireStatus = interimStatus;
  let finalStatusReason = interimStatusReason;

  if (actionOutcome) {
    const outcomePickRate = actionOutcome.subsequentPickRate ?? currentPickRate;
    const outcomeAccuracy = actionOutcome.subsequentAccuracy ?? accuracy;

    // Compare before vs after:
    const improvedCondition =
      actionOutcome.improved === "yes" ||
      (outcomePickRate >= targetPickRate - 4 && outcomeAccuracy >= 95);

    const partialCondition =
      actionOutcome.improved === "partial" ||
      (previousPickRate !== undefined && outcomePickRate > previousPickRate);

    if (improvedCondition) {
      finalStatus = "Doing well";
      finalStatusReason = `Intervention succeeded. Pick pace recovered to ${outcomePickRate} items/hr (target ${targetPickRate}) with ${outcomeAccuracy}% accuracy.`;
      action.status = "completed";
    } else if (partialCondition) {
      finalStatus = "Needs attention";
      finalStatusReason = `Pick pace partially improved to ${outcomePickRate} items/hr; continued buddy support with ${buddyName} recommended.`;
      action.status = "completed";
    } else {
      finalStatus = "At risk";
      finalStatusReason = `Performance stalled at ${outcomePickRate} items/hr despite intervention; supervisor floor intervention required.`;
      action.status = "completed";
    }
  }

  return {
    pattern,
    action,
    updatedStatus: finalStatus,
    statusReason: finalStatusReason,
  };
}

/**
 * Backward-compatible wrapper that delegates to executeCoordinationLoop
 */
export function synthesizePattern(
  dayNumber: number,
  dailySignal?: DailySignal,
  managerSignal?: ManagerSignal,
  workSignal?: WorkSignal,
  hire?: NewHire,
  actionOutcome?: ActionOutcome,
  previousRecord?: DayRecord,
  existingAction?: RecommendedAction
): PatternSynthesisResult {
  const fallbackHire: NewHire = hire || {
    id: "nh-rahul-01",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    roleId: "role-picker-01",
    roleTitle: "Dark Store Picker",
    storeLocation: "Dark Store #104 (Indiranagar Central)",
    shift: "Morning (07:00 - 15:30)",
    startDate: "2025-02-17",
    currentDay: dayNumber,
    buddy: "Vikram R. (Senior Picker)",
    supervisor: "Suresh K. (Shift In-charge)",
    status: "Needs attention",
    statusReason: "Aisle navigation friction",
    recommendedActionSnippet: "Buddy walkthrough of Aisles 4-8",
    daysHistory: [],
  };

  const currentWorkSignal: WorkSignal = workSignal || {
    dayNumber,
    targetPickRate: 50,
    actualPickRate: 35,
    accuracyRate: 98,
    ordersCompleted: 44,
    targetOrders: 65,
  };

  return executeCoordinationLoop({
    hire: fallbackHire,
    dayNumber,
    dailySignal,
    managerSignal,
    workSignal: currentWorkSignal,
    actionOutcome,
    previousRecord,
    existingAction,
  });
}

