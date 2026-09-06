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
  DARK_STORE_CAPABILITIES,
  CapabilityDefinition,
  CapabilityState,
  AdaptiveGearDecision,
  ExposureState,
  EvidenceLevel,
  PerformanceHealth,
  MasteryStatus,
  SignalCategory,
} from "../types";
import { createDefaultCapabilitiesLedger } from "../data/seedData";

export interface PatternSynthesisResult {
  pattern: IdentifiedPattern;
  action: RecommendedAction;
  updatedStatus: NewHireStatus;
  statusReason: string;
  updatedCapabilities: Record<number, CapabilityState>;
  overallReadinessScore: number;
  currentCapabilityId: number;
  adaptiveDecision: AdaptiveGearDecision;
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
 * Calculates overall job readiness (0-100%) based on verified capability states.
 * IMPORTANT: This score is an informational summary, NOT the decision engine.
 * The intelligence makes all decisions from underlying evidence.
 */
export function calculateReadinessScore(capabilities: Record<number, CapabilityState>): number {
  if (!capabilities) return 0;
  let scoreSum = 0;
  const totalCaps = DARK_STORE_CAPABILITIES.length; // 20 capabilities

  for (const cap of DARK_STORE_CAPABILITIES) {
    const state = capabilities[cap.id];
    if (!state) continue;

    if (state.mastery === "mastered") {
      scoreSum += 1.0;
    } else if (state.mastery === "proficient") {
      scoreSum += 0.85;
    } else if (state.evidence === "demonstrated") {
      scoreSum += 0.6;
    } else if (state.evidence === "emerging") {
      scoreSum += 0.3;
    } else if (state.exposure === "exposed" || state.exposure === "reinforced") {
      scoreSum += 0.1;
    }
  }

  return Math.min(100, Math.round((scoreSum / totalCaps) * 100));
}

/**
 * AUTHORITATIVE CORE LOOP EXECUTION
 * SINGLE EXECUTION AUTHORITY for CheckIn CheckOut
 *
 * Coordinates 6 bounded specialists internally:
 * 1. OBSERVE   - Collects & normalizes multi-signal evidence
 * 2. UNDERSTAND - Diagnoses root cause; distinguishes Exposure from Mastery
 * 3. CONNECT   - Connects to capability prerequisite graph & store actors
 * 4. DECIDE    - The Adaptive Core: selects gear shift (advance, reinforce, return, jump, non-training)
 * 5. ACT       - Dispatches smallest practical floor intervention
 * 6. CHECK     - Evaluates before/after outcome; updates Capability Ledger
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

  const hireName = hire.name || "Worker";
  const firstName = hireName.split(" ")[0];
  const buddyName = (hire.buddy || "Senior Picker").split(" ")[0];
  const supervisorName = (hire.supervisor || "Shift In-charge").split(" ")[0];
  const roleTitle = hire.roleTitle || "Dark Store Picker";

  // -------------------------------------------------------------
  // 1. OBSERVE: Ingest & normalize multi-signal evidence
  // -------------------------------------------------------------
  const currentPickRate = workSignal?.actualPickRate ?? 35;
  const targetPickRate = workSignal?.targetPickRate ?? 50;
  const accuracy = workSignal?.accuracyRate ?? 98;
  const speedGap = targetPickRate - currentPickRate;
  const previousPickRate = previousRecord?.workSignal?.actualPickRate;

  // Active capabilities ledger (cloned to mutate safely)
  const currentCapabilities: Record<number, CapabilityState> = {
    ...(hire.capabilities || createDefaultCapabilitiesLedger()),
  };

  const textContent = `${dailySignal?.issue || ""} ${dailySignal?.rawText || ""} ${dailySignal?.category || ""}`.toLowerCase();
  const managerNotes = (managerSignal?.notes || "").toLowerCase();

  const workerReportsConfusion =
    textContent.includes("location") ||
    textContent.includes("confused") ||
    textContent.includes("where") ||
    textContent.includes("find") ||
    textContent.includes("aisle") ||
    textContent.includes("shelf") ||
    textContent.includes("rack");

  const workerReportsTool =
    dailySignal?.category === "Tool" ||
    textContent.includes("bluetooth") ||
    textContent.includes("battery") ||
    textContent.includes("hardware") ||
    (textContent.includes("scanner") &&
      (textContent.includes("disconnect") ||
        textContent.includes("died") ||
        textContent.includes("won't scan") ||
        textContent.includes("broken") ||
        textContent.includes("lens"))) ||
    managerSignal?.issueCategory === "Tool";

  const workerReportsVariant =
    textContent.includes("variant") ||
    textContent.includes("packaging") ||
    textContent.includes("packet") ||
    textContent.includes("weight") ||
    textContent.includes("gram") ||
    textContent.includes("wrong item");

  const managerObservesSupport = managerSignal?.state === "Needs support";
  const managerObservesStruggle = managerSignal?.state === "Struggling";
  const managerObservesAccuracy = managerSignal?.issueCategory === "Accuracy";
  const managerObservesSpeed = managerSignal?.issueCategory === "Speed";

  // -------------------------------------------------------------
  // 2. UNDERSTAND: Root cause diagnosis (Exposure != Mastery)
  // -------------------------------------------------------------
  type RootCauseType =
    | "tool_hardware"
    | "environment_spatial"
    | "variant_quality"
    | "prerequisite_gap"
    | "capability_practice"
    | "steady_ramp";

  let rootCause: RootCauseType = "steady_ramp";
  let targetCapId = existingAction?.targetCapabilityId || hire.currentCapabilityId || 3;
  let diagnosisText = "";
  let patternCategory: SignalCategory = "General";
  let patternName = "Steady Ramp Progression";

  // Check prior intervention failure to prevent repeating failed actions
  const previousInterventionFailed =
    (existingAction?.status === "completed" || previousRecord?.actionOutcome?.improved === "no") &&
    previousRecord?.actionOutcome &&
    previousRecord.actionOutcome.improved === "no";

  if (workerReportsTool) {
    rootCause = "tool_hardware";
    targetCapId = 2; // DSP-02-SCANNER-BASICS
    patternCategory = "Tool";
    patternName = "Hardware / Barcode Scanner Friction";
    diagnosisText = `Friction is caused by device hardware or barcode scan connectivity delays, NOT worker comprehension or diligence. Training another module will not fix a technical hardware obstacle.`;
  } else if (accuracy < 90 || managerObservesAccuracy || workerReportsVariant) {
    rootCause = "variant_quality";
    targetCapId = 6; // DSP-06-VARIANT-CHECK
    patternCategory = "Process";
    patternName = "Item Variant Differentiation & Verification Rush";
    diagnosisText = `Accuracy is at ${accuracy}% (critically below 98% threshold). ${firstName} is moving at pace but mis-picking visually identical packaging variants (e.g. 200g vs 500g pouches). Real-world accuracy requires immediate standard clarification.`;
  } else if (
    (workerReportsConfusion || managerNotes.includes("location") || managerNotes.includes("aisle")) &&
    (speedGap >= 8 || managerObservesSupport || managerObservesStruggle)
  ) {
    // Check if prerequisite capability (DSP-02 Scanner Basics) is weak
    const cap2State = currentCapabilities[2];
    const isCap2Weak =
      cap2State &&
      cap2State.exposure !== "not_exposed" &&
      cap2State.evidence === "inconsistent";

    if (isCap2Weak) {
      rootCause = "prerequisite_gap";
      targetCapId = 2; // Return to Prerequisite DSP-02
      patternCategory = "Process";
      patternName = "Prerequisite Gap in Scanner Device Proficiency";
      diagnosisText = `${firstName} is struggling with aisle location navigation because basic scanner coordinate reading and terminal operation was never solidly grounded. Returning to prerequisite capability 2 is necessary before continuing location navigation.`;
    } else {
      rootCause = "environment_spatial";
      targetCapId = 3; // DSP-03-LOCATION-NAV
      patternCategory = "Environment";
      patternName = "Dark Store Spatial & Rack Coordinate Friction";
      const cap3State = currentCapabilities[3];
      const exposureNote =
        cap3State?.exposure === "exposed"
          ? "Worker was already exposed to location content, but real-world navigation on the floor is lagging. Module exposure does NOT equal floor mastery."
          : "Initial floor navigation in high-density aisles requires spatial familiarization.";
      diagnosisText = `${firstName} (${roleTitle}) reports aisle/rack navigation confusion in Aisles 4-8. Accuracy is high (${accuracy}%), confirming strong diligence, but search time slows pick pace to ${currentPickRate}/hr (target: ${targetPickRate}/hr). ${exposureNote}`;
    }
  } else if (speedGap > 10 && (managerObservesSupport || managerObservesSpeed)) {
    rootCause = "capability_practice";
    targetCapId = hire.currentCapabilityId || 5;
    patternCategory = "Process";
    patternName = "Floor Pacing & Route Practice Gap";
    diagnosisText = `Pick pace (${currentPickRate}/hr) lags target (${targetPickRate}/hr). The worker understands store rules, but requires supervised floor repetition to build picking rhythm and route efficiency.`;
  } else if (speedGap <= 5 && accuracy >= 95) {
    rootCause = "steady_ramp";
    patternCategory = "General";
    patternName = "Steady Ramp Progression";
    diagnosisText = `Pick rate (${currentPickRate}/hr) and accuracy (${accuracy}%) are meeting or exceeding the ramp curve. ${firstName} is working independently with high consistency.`;
  } else {
    rootCause = "steady_ramp";
    patternCategory = "General";
    patternName = "Standard Ramp Adaptation";
    diagnosisText = `${firstName} is progressing through standard shift ramp-up. Current pick pace is ${currentPickRate}/hr with ${accuracy}% accuracy.`;
  }

  // -------------------------------------------------------------
  // 3. CONNECT: Capability mapping, prerequisites & store actors
  // -------------------------------------------------------------
  const capDef = DARK_STORE_CAPABILITIES.find((c) => c.id === targetCapId) || DARK_STORE_CAPABILITIES[2];

  // -------------------------------------------------------------
  // 4. DECIDE: The Adaptive Core (Gear Shifting Logic)
  // -------------------------------------------------------------
  let decisionType: AdaptiveGearDecision = "advance_default";
  let targetActor = `Buddy (${buddyName} - Senior Picker)`;
  let urgency: "Immediate" | "Next Shift" | "Monitor" = "Next Shift";
  let actionTitle = "";
  let actionDesc = "";
  let practicalStep = "";
  let decisionRationale = "";
  let interimStatus: NewHireStatus = "Doing well";
  let interimStatusReason = "";

  if (rootCause === "tool_hardware") {
    decisionType = "tool_remedy";
    targetActor = `Buddy (${buddyName}) & Maintenance`;
    urgency = "Immediate";
    actionTitle = "Scanner Hardware Check & Lens Cleaning Protocol";
    actionDesc = `Inspect handheld terminal Bluetooth connection, replace aging battery pack, and review fallback 4-digit short SKU manual entry.`;
    practicalStep = "5-minute hardware check and terminal re-pairing before shift.";
    decisionRationale = "Problem is hardware tool connectivity, not worker competence. Tool remedy avoids useless training.";
    interimStatus = "Needs attention";
    interimStatusReason = `Tool friction detected on scanner; hardware check scheduled with ${buddyName}.`;
  } else if (rootCause === "variant_quality") {
    decisionType = "supervisor_demo";
    targetActor = `Supervisor (${supervisorName} - Shift In-charge)`;
    urgency = "Immediate";
    actionTitle = "Demonstrate 3-Point Variant Check (Brand, Weight, Barcode)";
    actionDesc = `Supervisor ${supervisorName} conducts a 10-minute floor demonstration on tricky SKU packaging variants (200g vs 500g pouches). Clarify that quality takes strict priority over speed during ramp.`;
    practicalStep = "10-minute demonstration with 5 tricky product variant sets.";
    decisionRationale = "Accuracy below 98% quality floor. Requires supervisor authority to re-establish quality standard.";
    interimStatus = "At risk";
    interimStatusReason = `Critical accuracy alert (${accuracy}%); supervisor 3-point variant check demo required.`;
  } else if (rootCause === "prerequisite_gap") {
    decisionType = "return_prerequisite";
    targetActor = `Supervisor (${supervisorName}) & Buddy (${buddyName})`;
    urgency = "Immediate";
    actionTitle = `Return to Prerequisite: ${DARK_STORE_CAPABILITIES[1].name}`;
    actionDesc = `Pause higher-level picking until handheld scanner basics and coordinate interpretation (Capability 2) are solidly mastered.`;
    practicalStep = "10-minute terminal coordinate walkthrough before attempting solo grocery orders.";
    decisionRationale = "Capability 3 failing because prerequisite Capability 2 was weak. Stepping back is required.";
    interimStatus = "Needs attention";
    interimStatusReason = `Prerequisite gap identified in scanner basics; returning to Capability 2 with ${buddyName}.`;
  } else if (rootCause === "environment_spatial") {
    // Check if this was already attempted and failed
    if (previousInterventionFailed) {
      // Adaptive reassessment: DO NOT repeat the same buddy walkthrough! Escalate to supervisor floor layout review
      decisionType = "environment_support";
      targetActor = `Supervisor (${supervisorName} - Shift In-charge)`;
      urgency = "Immediate";
      actionTitle = "Supervisor Floor Layout & Shelf Label Verification";
      actionDesc = `Previous buddy walkthrough did not resolve aisle confusion. Supervisor ${supervisorName} will directly verify shelf coordinate signage in Aisles 4-8 with ${firstName}.`;
      practicalStep = "10-minute supervisor aisle review focusing on bin coordinate labeling errors.";
      decisionRationale = "Previous buddy walkthrough failed to close gap. Escalating to supervisor floor layout intervention instead of repeating identical action.";
      interimStatus = "At risk";
      interimStatusReason = `Aisle confusion persisted after buddy walkthrough; escalated to supervisor layout check.`;
    } else {
      decisionType = "reinforce_current";
      targetActor = `Buddy (${buddyName} - Senior Picker)`;
      urgency = "Next Shift";
      actionTitle = `Buddy Walkthrough of Aisles 4-8 Rack Coordinates (${capDef.name})`;
      actionDesc = `Pair ${firstName} with Senior Picker ${buddyName} for a 15-minute floor walkthrough focusing on Aisles 4-8 shelf numbering (Rack-Bay-Level).`;
      practicalStep = `15-minute floor walkthrough before morning peak wave with ${buddyName}.`;
      decisionRationale = "Exposure occurred, but real-world capability is inconsistent. Reinforce capability 3 via floor buddy.";
      interimStatus = "Needs attention";
      interimStatusReason = `Pick rate (${currentPickRate}/${targetPickRate}) delayed by aisle navigation; buddy walkthrough scheduled.`;
    }
  } else if (rootCause === "capability_practice") {
    decisionType = "reinforce_current";
    targetActor = `Buddy (${buddyName})`;
    urgency = "Next Shift";
    actionTitle = `Targeted Route Pacing Practice (${capDef.name})`;
    actionDesc = `Allow ${firstName} 30 minutes of guided picking with buddy ${buddyName} to practice serpentine route pacing without backtracking.`;
    practicalStep = "30-minute guided picking run on core grocery aisles.";
    decisionRationale = "Worker understands process but requires structured repetition to reach speed threshold.";
    interimStatus = "Needs attention";
    interimStatusReason = `Pacing practice assigned on Capability ${targetCapId} to close speed gap.`;
  } else {
    // Worker is performing well on curve (speedGap <= 5 && accuracy >= 95)
    // Check if worker demonstrated advanced capabilities or can advance
    const currentMasteredCount = Object.values(currentCapabilities).filter((c) => c.mastery === "mastered" || c.mastery === "proficient").length;

    if (currentMasteredCount >= 18) {
      decisionType = "no_action_monitor";
      targetActor = "Self & Supervisor";
      urgency = "Monitor";
      actionTitle = "Maintain Standard Autonomous Picking";
      actionDesc = `All core capabilities demonstrated with high consistency (${currentPickRate}/hr, ${accuracy}% accuracy). Continue regular shift observation.`;
      practicalStep = "Routine end-of-shift check.";
      decisionRationale = "Worker has achieved consistent operational performance across all store zones.";
      interimStatus = "Doing well";
      interimStatusReason = `Sustaining target performance (${currentPickRate} picks/hr, ${accuracy}% accuracy).`;
    } else if (currentPickRate >= targetPickRate + 10 && accuracy >= 98 && (hire.currentCapabilityId || 1) < 8) {
      // Worker is significantly outpacing ramp target; jump ahead to advanced multi-order batching
      const advancedCap = DARK_STORE_CAPABILITIES.find((c) => c.id === 8) || DARK_STORE_CAPABILITIES[7];
      targetCapId = advancedCap.id;
      decisionType = "jump_ahead";
      targetActor = `Supervisor (${supervisorName})`;
      urgency = "Monitor";
      actionTitle = `Fast-Track Jump to Capability ${advancedCap.id}: ${advancedCap.name}`;
      actionDesc = `${firstName} is significantly exceeding standard ramp pace (${currentPickRate}/hr vs target ${targetPickRate}/hr, ${accuracy}% accuracy). System approves jumping directly to multi-order batching.`;
      practicalStep = "Assign multi-order batch cart for next shift wave.";
      decisionRationale = "Exceptional performance evidence justifies jumping ahead past routine single-order practice.";
      interimStatus = "Doing well";
      interimStatusReason = `Exceeding pace curve (${currentPickRate}/hr); fast-tracked to Capability ${advancedCap.id}.`;
    } else {
      // Find next capability in 1..20 sequence that needs exposure or mastery
      const nextUnmastered = DARK_STORE_CAPABILITIES.find((c) => {
        const st = currentCapabilities[c.id];
        return !st || st.mastery !== "mastered";
      });

      if (nextUnmastered) {
        targetCapId = nextUnmastered.id;
        decisionType = "advance_default";
        targetActor = `Self & Buddy (${buddyName})`;
        urgency = "Monitor";
        actionTitle = `Advance to Capability ${nextUnmastered.id}: ${nextUnmastered.name}`;
        actionDesc = `${firstName} has demonstrated solid performance on prior capabilities. Begin floor introduction to ${nextUnmastered.name}.`;
        practicalStep = `Brief 5-minute pre-shift overview of ${nextUnmastered.name}.`;
        decisionRationale = "Performance is stable and prior prerequisites are mastered; advancing along capability path.";
        interimStatus = "Doing well";
        interimStatusReason = `Ramp curve on track; advancing to Capability ${nextUnmastered.id}.`;
      } else {
        decisionType = "no_action_monitor";
        targetActor = "Self & Supervisor";
        urgency = "Monitor";
        actionTitle = "Continue Shift Pacing";
        actionDesc = "Standard shift operation without intervention.";
        practicalStep = "Standard daily logging.";
        decisionRationale = "Consistent performance on target.";
        interimStatus = "Doing well";
        interimStatusReason = `Performing on curve (${currentPickRate}/hr, ${accuracy}% accuracy).`;
      }
    }
  }

  // -------------------------------------------------------------
  // 5. ACT: Dispatched smallest practical floor intervention
  // -------------------------------------------------------------
  const pattern: IdentifiedPattern = {
    id: `pat-${hire.id}-d${dayNumber}`,
    dayNumber,
    patternName,
    patternConfidence: "High",
    diagnosis: diagnosisText,
    category: patternCategory,
    connectedSignalSummary: [
      `🗣️ Worker: "${dailySignal?.rawText || dailySignal?.issue || "Floor check-in logged"}"`,
      `👔 Manager: ${managerSignal?.state || "Active observation"} (${managerSignal?.issueCategory || "General"})`,
      `📊 Work Telemetry: ${currentPickRate} picks/hr (target ${targetPickRate}), ${accuracy}% accuracy`,
      `🎯 Target Capability: ${capDef.code} - ${capDef.name}`,
    ],
    detectedAt: "Just now",
  };

  const action: RecommendedAction = {
    id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
    dayNumber,
    actionType:
      decisionType === "reinforce_current"
        ? "buddy_walkthrough"
        : decisionType === "supervisor_demo"
        ? "demonstrate_task"
        : decisionType === "tool_remedy"
        ? "practice"
        : decisionType === "no_action_monitor"
        ? "no_action"
        : "practice",
    title: actionTitle,
    description: actionDesc,
    targetActor,
    urgency,
    smallestPracticalStep: practicalStep,
    status: existingAction?.status === "completed" ? "completed" : "pending",
    createdAt: existingAction?.createdAt || "Just now",
    decisionType,
    targetCapabilityId: targetCapId,
    rationale: decisionRationale,
  };

  // -------------------------------------------------------------
  // 6. CHECK: Outcome verification & Capability Ledger updates
  // -------------------------------------------------------------
  let finalStatus: NewHireStatus = interimStatus;
  let finalStatusReason = interimStatusReason;

  // Initialize or retrieve target capability state in ledger
  const outcomeCapId = existingAction?.targetCapabilityId || hire.currentCapabilityId || targetCapId;
  if (!currentCapabilities[outcomeCapId]) {
    currentCapabilities[outcomeCapId] = {
      capabilityId: outcomeCapId,
      exposure: "not_exposed",
      evidence: "none",
      performance: "unknown",
      mastery: "locked",
      lastAssessedAt: `Day ${dayNumber}`,
      reinforcementCount: 0,
    };
  }

  const capState = currentCapabilities[outcomeCapId];
  capState.lastAssessedAt = `Day ${dayNumber}`;

  // If action outcome is recorded (closing the loop)
  if (actionOutcome) {
    const outcomePickRate = actionOutcome.subsequentPickRate ?? currentPickRate;
    const outcomeAccuracy = actionOutcome.subsequentAccuracy ?? accuracy;

    const isImproved =
      actionOutcome.improved === "yes" ||
      (outcomePickRate >= targetPickRate - 4 && outcomeAccuracy >= 95);

    const isPartial =
      actionOutcome.improved === "partial" ||
      (previousPickRate !== undefined && outcomePickRate > previousPickRate);

    if (isImproved) {
      finalStatus = "Doing well";
      finalStatusReason = `Intervention succeeded. Pick rate recovered to ${outcomePickRate}/hr with ${outcomeAccuracy}% accuracy.`;
      action.status = "completed";

      // Update capability ledger: Real-world mastery confirmed
      capState.exposure = "reinforced";
      capState.evidence = "demonstrated";
      capState.performance = outcomePickRate >= targetPickRate ? "on_target" : "exceeding";
      capState.mastery = "proficient";
      capState.notes = `Intervention closed: ${actionOutcome.notes || "Standard met on floor"}`;
    } else if (isPartial) {
      finalStatus = "Needs attention";
      finalStatusReason = `Pick rate partially improved to ${outcomePickRate}/hr; continued buddy practice on Capability ${targetCapId} recommended.`;
      action.status = "completed";

      capState.exposure = "reinforced";
      capState.evidence = "emerging";
      capState.performance = "below_target";
      capState.mastery = "in_progress";
      capState.reinforcementCount += 1;
      capState.notes = `Partial recovery (${outcomePickRate}/hr). Continued practice required.`;
    } else {
      finalStatus = "At risk";
      finalStatusReason = `Performance stalled at ${outcomePickRate}/hr despite intervention; reassessing root cause for next shift.`;
      action.status = "completed";

      capState.exposure = "reinforced";
      capState.evidence = "inconsistent";
      capState.performance = "below_target";
      capState.mastery = "in_progress";
      capState.reinforcementCount += 1;
      capState.notes = `Intervention failed to close gap. Must reassess approach.`;
    }
  } else {
    // No outcome yet: record current assessed capability evidence
    if (decisionType === "reinforce_current" || decisionType === "return_prerequisite") {
      capState.exposure = capState.exposure === "not_exposed" ? "exposed" : "reinforced";
      capState.evidence = "inconsistent";
      capState.performance = "below_target";
      capState.reinforcementCount += 1;
    } else if (decisionType === "advance_default" || decisionType === "no_action_monitor") {
      capState.exposure = "exposed";
      capState.evidence = "demonstrated";
      capState.performance = currentPickRate >= targetPickRate ? "on_target" : "exceeding";
      if (capState.mastery === "locked" || capState.mastery === "in_progress") {
        capState.mastery = "proficient";
      }
    }
  }

  const overallReadinessScore = calculateReadinessScore(currentCapabilities);

  return {
    pattern,
    action,
    updatedStatus: finalStatus,
    statusReason: finalStatusReason,
    updatedCapabilities: currentCapabilities,
    overallReadinessScore,
    currentCapabilityId: targetCapId,
    adaptiveDecision: decisionType,
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
    capabilities: createDefaultCapabilitiesLedger(),
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

