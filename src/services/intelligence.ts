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
 * The intelligence makes all decisions from underlying multi-signal evidence.
 */
export function assessReadiness(capabilities: Record<number, CapabilityState>): number {
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

// Backward-compatible alias for assessReadiness
export const calculateReadinessScore = assessReadiness;

// Internal data structures for the single authoritative pipeline
interface ObservedSignals {
  currentPickRate: number;
  targetPickRate: number;
  accuracy: number;
  speedGap: number;
  previousPickRate?: number;
  currentCapabilities: Record<number, CapabilityState>;
  workerReportsConfusion: boolean;
  workerReportsTool: boolean;
  workerReportsVariant: boolean;
  workerReportsCommunication: boolean;
  workerReportsExternalBottleneck: boolean;
  externalBottleneckDescription?: string;
  hasWorkEvidence: boolean;
  helpRequestsCount: number;
  workerChronicHelpDependency: boolean;
  managerObservesSupport: boolean;
  managerObservesStruggle: boolean;
  managerObservesAccuracy: boolean;
  managerObservesSpeed: boolean;
  previousInterventionFailed: boolean;
  dailySignal?: DailySignal;
  managerSignal?: ManagerSignal;
}

type RootCauseType =
  | "tool_hardware"
  | "communication_confidence"
  | "environment_spatial"
  | "variant_quality"
  | "safety_blocker"
  | "prerequisite_gap"
  | "capability_practice"
  | "steady_ramp"
  | "environment_bottleneck"
  | "no_evidence"
  | "chronic_dependency";

interface UnderstoodDiagnosis {
  rootCause: RootCauseType;
  targetCapId: number;
  diagnosisText: string;
  patternCategory: SignalCategory;
  patternName: string;
}

interface ConnectedContext {
  targetCapDef: CapabilityDefinition;
  prerequisites: CapabilityDefinition[];
  buddyName: string;
  supervisorName: string;
  firstName: string;
  roleTitle: string;
}

interface DecidedAction {
  decisionType: AdaptiveGearDecision;
  targetCapId: number;
  targetActor: string;
  urgency: "Immediate" | "Next Shift" | "Monitor";
  actionTitle: string;
  actionDesc: string;
  practicalStep: string;
  decisionRationale: string;
  interimStatus: NewHireStatus;
  interimStatusReason: string;
}

// -------------------------------------------------------------
// INTERNAL HELPER 1: observe() - Normalize multi-signal evidence
// -------------------------------------------------------------
function observe(input: LoopExecutionInput): ObservedSignals {
  const { hire, dailySignal, managerSignal, workSignal, previousRecord, existingAction, actionOutcome } = input;

  const currentPickRate = workSignal?.actualPickRate ?? 35;
  const targetPickRate = workSignal?.targetPickRate ?? 50;
  const accuracy = workSignal?.accuracyRate ?? 98;
  const speedGap = targetPickRate - currentPickRate;
  const previousPickRate = previousRecord?.workSignal?.actualPickRate;

  const currentCapabilities: Record<number, CapabilityState> = {
    ...(hire.capabilities || createDefaultCapabilitiesLedger()),
  };

  const textContent = `${dailySignal?.issue || ""} ${dailySignal?.rawText || ""} ${dailySignal?.category || ""}`.toLowerCase();
  const managerNotes = (managerSignal?.notes || "").toLowerCase();

  const externalBottleneckText = `${workSignal?.externalBottleneck || ""} ${dailySignal?.rawText || ""} ${managerNotes}`.toLowerCase();
  const workerReportsExternalBottleneck =
    Boolean(workSignal?.externalBottleneck) ||
    externalBottleneckText.includes("conveyor") ||
    externalBottleneckText.includes("liquid spill") ||
    externalBottleneckText.includes("spill") ||
    externalBottleneckText.includes("power outage") ||
    externalBottleneckText.includes("network outage") ||
    externalBottleneckText.includes("system down") ||
    externalBottleneckText.includes("facility bottleneck");

  const externalBottleneckDescription =
    workSignal?.externalBottleneck ||
    (workerReportsExternalBottleneck ? "facility/conveyor disruption" : undefined);

  const hasWorkEvidence =
    workSignal?.hasWorkEvidence !== false &&
    !(workSignal?.ordersCompleted === 0 && (workSignal?.gapIdentified === "No shift orders logged" || (workSignal?.actualPickRate === 0 && workSignal?.accuracyRate === 0)));

  const helpRequestsCount = workSignal?.helpRequestsCount ?? dailySignal?.helpRequestsCount ?? 0;
  const workerChronicHelpDependency =
    helpRequestsCount >= 4 ||
    textContent.includes("called buddy 6 times") ||
    textContent.includes("couldn't pick without buddy") ||
    textContent.includes("high help dependency") ||
    textContent.includes("unable to pick solo") ||
    textContent.includes("cannot pick solo") ||
    textContent.includes("need buddy with me on every single order") ||
    managerNotes.includes("help dependency") ||
    managerNotes.includes("unable to pick solo") ||
    managerNotes.includes("needs independent picking");

  const workerReportsConfusion =
    !workerChronicHelpDependency &&
    (textContent.includes("location") ||
      textContent.includes("confused") ||
      textContent.includes("where") ||
      textContent.includes("find") ||
      textContent.includes("aisle") ||
      textContent.includes("shelf") ||
      textContent.includes("rack"));

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

  const workerReportsCommunication =
    textContent.includes("nervous") ||
    textContent.includes("hesitant") ||
    textContent.includes("afraid") ||
    textContent.includes("shy") ||
    textContent.includes("scared to ask") ||
    managerSignal?.issueCategory === "Confidence";

  const managerObservesSupport = managerSignal?.state === "Needs support";
  const managerObservesStruggle = managerSignal?.state === "Struggling";
  const managerObservesAccuracy = managerSignal?.issueCategory === "Accuracy";
  const managerObservesSpeed = managerSignal?.issueCategory === "Speed";

  const previousInterventionFailed =
    Boolean(
      (actionOutcome && actionOutcome.improved === "no") ||
      ((existingAction?.status === "completed" || previousRecord?.actionOutcome?.improved === "no") &&
        previousRecord?.actionOutcome &&
        previousRecord.actionOutcome.improved === "no")
    );

  return {
    currentPickRate,
    targetPickRate,
    accuracy,
    speedGap,
    previousPickRate,
    currentCapabilities,
    workerReportsConfusion,
    workerReportsTool,
    workerReportsVariant,
    workerReportsCommunication,
    workerReportsExternalBottleneck,
    externalBottleneckDescription,
    hasWorkEvidence,
    helpRequestsCount,
    workerChronicHelpDependency,
    managerObservesSupport,
    managerObservesStruggle,
    managerObservesAccuracy,
    managerObservesSpeed,
    previousInterventionFailed,
    dailySignal,
    managerSignal,
  };
}

// -------------------------------------------------------------
// INTERNAL HELPER 2: understand() - Root cause & Exposure vs Mastery
// -------------------------------------------------------------
function understand(
  observed: ObservedSignals,
  hire: NewHire,
  capabilities: Record<number, CapabilityState>,
  existingAction?: RecommendedAction
): UnderstoodDiagnosis {
  const firstName = (hire.name || "Worker").split(" ")[0];
  const roleTitle = hire.roleTitle || "Dark Store Picker";
  let targetCapId = existingAction?.targetCapabilityId || hire.currentCapabilityId || 3;

  // 1. Check for lack of floor work evidence
  if (!observed.hasWorkEvidence) {
    return {
      rootCause: "no_evidence",
      targetCapId: hire.currentCapabilityId || 1,
      patternCategory: "General",
      patternName: "Awaiting Floor Work Telemetry",
      diagnosisText:
        "Insufficient floor work evidence collected yet. Continue shift observation before assessing capability mastery.",
    };
  }

  // 2. Check for external facility bottleneck (context overrides raw metric)
  if (observed.workerReportsExternalBottleneck) {
    return {
      rootCause: "environment_bottleneck",
      targetCapId: hire.currentCapabilityId || 3,
      patternCategory: "Environment",
      patternName: "External Dark Store Facility Bottleneck",
      diagnosisText:
        `Shift pick rate drop (${observed.currentPickRate}/hr) was caused by an external facility bottleneck (${observed.externalBottleneckDescription || "facility issue"}), NOT worker competence or diligence. Core capability remains solid.`,
    };
  }

  // 3. Critical safety blocker (explicit safety hazard signal)
  const textRaw = `${observed.dailySignal?.rawText || ""} ${observed.dailySignal?.issue || ""}`.toLowerCase();
  const mgrNotes = (observed.managerSignal?.notes || "").toLowerCase();
  const isSafetyRiskReported =
    (textRaw.includes("safety") && (textRaw.includes("hazard") || textRaw.includes("injury") || textRaw.includes("blocked exit"))) ||
    (mgrNotes.includes("safety") && (mgrNotes.includes("hazard") || mgrNotes.includes("ppe violation") || mgrNotes.includes("critical safety risk")));

  if (isSafetyRiskReported) {
    return {
      rootCause: "safety_blocker",
      targetCapId: 1, // DSP-01-SAFETY-ZONES
      patternCategory: "Process",
      patternName: "Critical Floor Safety Protocol Blocker",
      diagnosisText:
        `Critical safety hazard reported on floor. Floor safety protocols (Capability 1: Store Safety & PPE) must be immediately verified with supervisor before independent fulfillment can proceed.`,
    };
  }

  // 4. Critical accuracy failure takes precedence (quality floor is paramount)
  if (observed.accuracy < 90 || observed.managerObservesAccuracy || observed.workerReportsVariant) {
    return {
      rootCause: "variant_quality",
      targetCapId: 6, // DSP-06-VARIANT-CHECK
      patternCategory: "Process",
      patternName: "Item Variant Differentiation & Verification Rush",
      diagnosisText:
        `Accuracy is at ${observed.accuracy}% (critically below 98% threshold). ${firstName} is moving at pace but mis-picking visually identical packaging variants (e.g. 200g vs 500g pouches). Real-world accuracy requires immediate standard clarification.`,
    };
  }

  // 5. Hardware / Tool issue (Symptom != Root Cause)
  if (observed.workerReportsTool) {
    return {
      rootCause: "tool_hardware",
      targetCapId: 2, // DSP-02-SCANNER-BASICS
      patternCategory: "Tool",
      patternName: "Hardware / Barcode Scanner Friction",
      diagnosisText:
        "Friction is caused by device hardware or barcode scan connectivity delays, NOT worker comprehension or diligence. Training another module will not fix a technical hardware obstacle.",
    };
  }

  // 6. Chronic help dependency (distinguished from healthy occasional question)
  if (observed.workerChronicHelpDependency && (observed.speedGap > 5 || observed.managerObservesSupport || observed.managerObservesStruggle)) {
    return {
      rootCause: "chronic_dependency",
      targetCapId: hire.currentCapabilityId || 5,
      patternCategory: "Process",
      patternName: "Floor Independence & Help Dependency Gap",
      diagnosisText:
        `${firstName} logged ${observed.helpRequestsCount || "multiple"} repeated help requests and is unable to complete tote pick cycles independently on the floor. Structured practice required to build solo autonomy.`,
    };
  }

  // 7. Communication / confidence barrier
  if (observed.workerReportsCommunication) {
    return {
      rootCause: "communication_confidence",
      targetCapId: 18, // DSP-18-TEAM-ESCALATION
      patternCategory: "Confidence",
      patternName: "Floor Escalation & Peer Communication Hesitation",
      diagnosisText:
        `${firstName} demonstrates adequate task knowledge but reports hesitation asking shift supervisors or peers for help during peak floor rushes. Non-training buddy support is required.`,
    };
  }

  // 8. Aisle & Location navigation
  const pacingText = `${observed.dailySignal?.rawText || ""} ${observed.dailySignal?.issue || ""}`.toLowerCase();
  const isPacingIssue =
    observed.speedGap > 5 &&
    (pacingText.includes("pacing fatigue") ||
      pacingText.includes("pacing lag") ||
      pacingText.includes("route backtracking") ||
      (pacingText.includes("pace") && (pacingText.includes("struggl") || pacingText.includes("drop") || pacingText.includes("slow"))));

  if (
    !isPacingIssue &&
    (observed.workerReportsConfusion ||
      (observed.managerSignal?.notes || "").toLowerCase().includes("location") ||
      observed.previousInterventionFailed ||
      (existingAction?.targetCapabilityId === 3 && observed.speedGap >= 8)) &&
    (observed.speedGap >= 8 || observed.managerObservesSupport || observed.managerObservesStruggle || observed.previousInterventionFailed)
  ) {
    const cap2State = capabilities[2];
    const isCap2Weak =
      cap2State &&
      cap2State.exposure !== "not_exposed" &&
      cap2State.evidence === "inconsistent";

    if (isCap2Weak) {
      return {
        rootCause: "prerequisite_gap",
        targetCapId: 2,
        patternCategory: "Process",
        patternName: "Prerequisite Gap in Scanner Device Proficiency",
        diagnosisText:
          `${firstName} is struggling with aisle location navigation because basic scanner coordinate reading and terminal operation was never solidly grounded. Returning to prerequisite capability 2 is necessary before continuing location navigation.`,
      };
    }

    const cap3State = capabilities[3];
    const exposureNote =
      hire.modulesCompleted === 10 || cap3State?.exposure === "exposed"
        ? "Worker completed mandatory training modules (10/10), but real-world floor navigation is lagging. Module exposure does NOT equal floor mastery."
        : "Initial floor navigation in high-density aisles requires spatial familiarization.";

    return {
      rootCause: "environment_spatial",
      targetCapId: 3,
      patternCategory: "Environment",
      patternName: "Dark Store Spatial & Rack Coordinate Friction",
      diagnosisText:
        `${firstName} (${roleTitle}) reports aisle/rack navigation confusion in Aisles 4-8. Accuracy is high (${observed.accuracy}%), confirming strong diligence, but search time slows pick pace to ${observed.currentPickRate}/hr (target: ${observed.targetPickRate}/hr). ${exposureNote}`,
    };
  }

  // 8. General pacing / floor route practice
  if (
    isPacingIssue ||
    (observed.speedGap > 10 && (observed.managerObservesSupport || observed.managerObservesSpeed || hire.modulesCompleted === 10))
  ) {
    const modulePrefix = hire.modulesCompleted === 10
      ? "Training modules (10/10) are 100% complete, but real-world floor readiness is not yet demonstrated. "
      : "";

    return {
      rootCause: "capability_practice",
      targetCapId: hire.currentCapabilityId || 5,
      patternCategory: "Process",
      patternName: "Floor Pacing & Route Practice Gap",
      diagnosisText:
        `${modulePrefix}Pick pace (${observed.currentPickRate}/hr) lags target (${observed.targetPickRate}/hr). The worker understands store rules, but requires supervised floor repetition to build picking rhythm and route efficiency.`,
    };
  }

  return {
    rootCause: "steady_ramp",
    targetCapId,
    patternCategory: "General",
    patternName: "Steady Ramp Progression",
    diagnosisText:
      `Pick rate (${observed.currentPickRate}/hr) and accuracy (${observed.accuracy}%) are meeting or exceeding the ramp curve. ${firstName} is working independently with high consistency.`,
  };
}

// -------------------------------------------------------------
// INTERNAL HELPER 3: connect() - Connect to capability graph & actors
// -------------------------------------------------------------
function connect(
  understood: UnderstoodDiagnosis,
  hire: NewHire
): ConnectedContext {
  const targetCapDef =
    DARK_STORE_CAPABILITIES.find((c) => c.id === understood.targetCapId) || DARK_STORE_CAPABILITIES[2];

  const prerequisites = targetCapDef.prerequisites
    .map((prereqId) => DARK_STORE_CAPABILITIES.find((c) => c.id === prereqId))
    .filter((c): c is CapabilityDefinition => Boolean(c));

  const buddyName = (hire.buddy || "Senior Picker").split(" ")[0];
  const supervisorName = (hire.supervisor || "Shift In-charge").split(" ")[0];
  const firstName = (hire.name || "Worker").split(" ")[0];
  const roleTitle = hire.roleTitle || "Dark Store Picker";

  return {
    targetCapDef,
    prerequisites,
    buddyName,
    supervisorName,
    firstName,
    roleTitle,
  };
}

// -------------------------------------------------------------
// INTERNAL HELPER 4: chooseNextAction() - The Adaptive Core
// -------------------------------------------------------------
function chooseNextAction(
  understood: UnderstoodDiagnosis,
  connected: ConnectedContext,
  hire: NewHire,
  observed: ObservedSignals,
  capabilities: Record<number, CapabilityState>
): DecidedAction {
  const { firstName, buddyName, supervisorName, targetCapDef } = connected;
  const { currentPickRate, targetPickRate, accuracy } = observed;

  if (understood.rootCause === "no_evidence") {
    return {
      decisionType: "no_action_monitor",
      targetCapId: targetCapDef.id,
      targetActor: "Shift Supervisor",
      urgency: "Monitor",
      actionTitle: "Observe Shift Execution & Collect Telemetry",
      actionDesc: "Awaiting floor pick telemetry before evaluating capability mastery.",
      practicalStep: "Log first floor shift wave telemetry.",
      decisionRationale: "No evidence does not equal poor performance. Gather observation first.",
      interimStatus: "Doing well",
      interimStatusReason: "Awaiting shift telemetry; observing standard ramp.",
    };
  }

  if (understood.rootCause === "environment_bottleneck") {
    return {
      decisionType: "no_action_monitor",
      targetCapId: targetCapDef.id,
      targetActor: "Store Operations & Maintenance",
      urgency: "Monitor",
      actionTitle: "Standard Shift Operations (Post-Facility Resolution)",
      actionDesc:
        "Performance drop was caused by facility/conveyor downtime. Resume standard picking monitoring under normal conditions.",
      practicalStep: "Standard shift monitoring on next wave.",
      decisionRationale:
        "Context overrides raw metric. External environmental disruption does not require capability retraining.",
      interimStatus: "Doing well",
      interimStatusReason: "Temporary drop caused by external facility bottleneck; worker capability on track.",
    };
  }

  if (understood.rootCause === "chronic_dependency") {
    return {
      decisionType: "reinforce_current",
      targetCapId: hire.currentCapabilityId || 5,
      targetActor: `Buddy (${buddyName}) & Supervisor (${supervisorName})`,
      urgency: "Next Shift",
      actionTitle: `Structured Solo-Picking Practice with Fading Buddy Support`,
      actionDesc:
        `Allow ${firstName} 30 minutes of independent picking with buddy ${buddyName} on standby observation from 5 meters away to transition from help dependency to solo autonomy.`,
      practicalStep: "30-minute solo pick run with buddy observation.",
      decisionRationale:
        "Worker is overly reliant on peer prompts. Guided fading of support will build floor independence.",
      interimStatus: "Needs attention",
      interimStatusReason: "High help dependency detected; structured solo practice assigned.",
    };
  }

  if (understood.rootCause === "tool_hardware") {
    return {
      decisionType: "tool_remedy",
      targetCapId: 2,
      targetActor: `Buddy (${buddyName}) & Maintenance`,
      urgency: "Immediate",
      actionTitle: "Scanner Hardware Check & Lens Cleaning Protocol",
      actionDesc:
        "Inspect handheld terminal Bluetooth connection, replace aging battery pack, and review fallback 4-digit short SKU manual entry.",
      practicalStep: "5-minute hardware check and terminal re-pairing before shift.",
      decisionRationale:
        "Problem is hardware tool connectivity, not worker competence. Tool remedy avoids useless training.",
      interimStatus: "Needs attention",
      interimStatusReason: `Tool friction detected on scanner; hardware check scheduled with ${buddyName}.`,
    };
  }

  if (understood.rootCause === "communication_confidence") {
    return {
      decisionType: "communication_support",
      targetCapId: 18,
      targetActor: `Buddy (${buddyName} - Senior Picker)`,
      urgency: "Immediate",
      actionTitle: "Buddy Pre-Shift Communication & Escalation Check-in",
      actionDesc:
        `Pair ${firstName} with buddy ${buddyName} for a 5-minute pre-shift check-in to build comfort reporting inventory bottlenecks and asking supervisor questions.`,
      practicalStep: "5-minute informal check-in before shift briefing.",
      decisionRationale:
        "Non-training confidence/communication barrier. Peer buddy support builds floor engagement without course lecturing.",
      interimStatus: "Needs attention",
      interimStatusReason: `Communication hesitation detected; buddy check-in scheduled.`,
    };
  }

  if (understood.rootCause === "variant_quality") {
    return {
      decisionType: "supervisor_demo",
      targetCapId: 6,
      targetActor: `Supervisor (${supervisorName} - Shift In-charge)`,
      urgency: "Immediate",
      actionTitle: "Demonstrate 3-Point Variant Check (Brand, Weight, Barcode)",
      actionDesc:
        `Supervisor ${supervisorName} conducts a 10-minute floor demonstration on tricky SKU packaging variants (200g vs 500g pouches). Clarify that quality takes strict priority over speed during ramp.`,
      practicalStep: "10-minute demonstration with 5 tricky product variant sets.",
      decisionRationale:
        "Accuracy below 98% quality floor. Requires supervisor authority to re-establish quality standard.",
      interimStatus: "At risk",
      interimStatusReason: `Critical accuracy alert (${accuracy}%); supervisor 3-point variant check demo required.`,
    };
  }

  if (understood.rootCause === "safety_blocker") {
    return {
      decisionType: "supervisor_demo",
      targetCapId: 1,
      targetActor: `Supervisor (${supervisorName}) & Safety Lead`,
      urgency: "Immediate",
      actionTitle: `Critical Safety & Zone Protocol Floor Verification`,
      actionDesc:
        `Pause fulfillment advancement until Supervisor ${supervisorName} conducts on-floor verification of PPE compliance, emergency exit locations, and slip-hazard safety protocols (Capability 1).`,
      practicalStep: "15-minute floor safety review and PPE verification before shift start.",
      decisionRationale:
        "Safety is a zero-tolerance non-negotiable prerequisite. Unresolved safety capability halts independent progression.",
      interimStatus: "At risk",
      interimStatusReason: "Critical safety protocol unresolved; supervisor safety verification required.",
    };
  }

  if (understood.rootCause === "prerequisite_gap") {
    return {
      decisionType: "return_prerequisite",
      targetCapId: 2,
      targetActor: `Supervisor (${supervisorName}) & Buddy (${buddyName})`,
      urgency: "Immediate",
      actionTitle: `Return to Prerequisite: ${DARK_STORE_CAPABILITIES[1].name}`,
      actionDesc:
        "Pause higher-level picking until handheld scanner basics and coordinate interpretation (Capability 2) are solidly mastered.",
      practicalStep: "10-minute terminal coordinate walkthrough before attempting solo grocery orders.",
      decisionRationale:
        "Capability 3 failing because prerequisite Capability 2 was weak. Stepping back is required.",
      interimStatus: "Needs attention",
      interimStatusReason: `Prerequisite gap identified in scanner basics; returning to Capability 2 with ${buddyName}.`,
    };
  }

  if (understood.rootCause === "environment_spatial") {
    if (observed.previousInterventionFailed) {
      return {
        decisionType: "environment_support",
        targetCapId: 3,
        targetActor: `Supervisor (${supervisorName} - Shift In-charge)`,
        urgency: "Immediate",
        actionTitle: "Supervisor Floor Layout & Shelf Label Verification",
        actionDesc:
          `Previous buddy walkthrough did not resolve aisle confusion. Supervisor ${supervisorName} will directly verify shelf coordinate signage in Aisles 4-8 with ${firstName}.`,
        practicalStep: "10-minute supervisor aisle review focusing on bin coordinate labeling errors.",
        decisionRationale:
          "Previous buddy walkthrough failed to close gap. Escalating to supervisor floor layout intervention instead of repeating identical action.",
        interimStatus: "At risk",
        interimStatusReason: "Aisle confusion persisted after buddy walkthrough; escalated to supervisor layout check.",
      };
    }

    return {
      decisionType: "reinforce_current",
      targetCapId: 3,
      targetActor: `Buddy (${buddyName} - Senior Picker)`,
      urgency: "Next Shift",
      actionTitle: `Buddy Walkthrough of Aisles 4-8 Rack Coordinates (${targetCapDef.name})`,
      actionDesc:
        `Pair ${firstName} with Senior Picker ${buddyName} for a 15-minute floor walkthrough focusing on Aisles 4-8 shelf numbering (Rack-Bay-Level).`,
      practicalStep: `15-minute floor walkthrough before morning peak wave with ${buddyName}.`,
      decisionRationale:
        "Exposure occurred, but real-world capability is inconsistent. Reinforce capability 3 via floor buddy.",
      interimStatus: "Needs attention",
      interimStatusReason: `Pick rate (${currentPickRate}/${targetPickRate}) delayed by aisle navigation; buddy walkthrough scheduled.`,
    };
  }

  if (understood.rootCause === "capability_practice") {
    return {
      decisionType: "reinforce_current",
      targetCapId: hire.currentCapabilityId || 5,
      targetActor: `Buddy (${buddyName})`,
      urgency: "Next Shift",
      actionTitle: `Targeted Route Pacing Practice (${targetCapDef.name})`,
      actionDesc:
        `Allow ${firstName} 30 minutes of guided picking with buddy ${buddyName} to practice serpentine route pacing without backtracking.`,
      practicalStep: "30-minute guided picking run on core grocery aisles.",
      decisionRationale:
        "Worker understands process but requires structured repetition to reach speed threshold.",
      interimStatus: "Needs attention",
      interimStatusReason: `Pacing practice assigned on Capability ${understood.targetCapId} to close speed gap.`,
    };
  }

  // Steady Ramp / Outpacing
  const currentMasteredCount = Object.values(capabilities).filter(
    (c) => c.mastery === "mastered" || c.mastery === "proficient"
  ).length;

  if (currentMasteredCount >= 18) {
    return {
      decisionType: "no_action_monitor",
      targetCapId: targetCapDef.id,
      targetActor: "Self & Supervisor",
      urgency: "Monitor",
      actionTitle: "Maintain Standard Autonomous Picking",
      actionDesc:
        `All core capabilities demonstrated with high consistency (${currentPickRate}/hr, ${accuracy}% accuracy). Continue regular shift observation.`,
      practicalStep: "Routine end-of-shift check.",
      decisionRationale: "Worker has achieved consistent operational performance across all store zones.",
      interimStatus: "Doing well",
      interimStatusReason: `Sustaining target performance (${currentPickRate} picks/hr, ${accuracy}% accuracy).`,
    };
  }

  if (currentPickRate >= targetPickRate + 10 && accuracy >= 98 && (hire.currentCapabilityId || 1) < 8) {
    const advancedCap = DARK_STORE_CAPABILITIES.find((c) => c.id === 8) || DARK_STORE_CAPABILITIES[7];
    return {
      decisionType: "jump_ahead",
      targetCapId: advancedCap.id,
      targetActor: `Supervisor (${supervisorName})`,
      urgency: "Monitor",
      actionTitle: `Fast-Track Jump to Capability ${advancedCap.id}: ${advancedCap.name}`,
      actionDesc:
        `${firstName} is significantly exceeding standard ramp pace (${currentPickRate}/hr vs target ${targetPickRate}/hr, ${accuracy}% accuracy). System approves jumping directly to multi-order batching.`,
      practicalStep: "Assign multi-order batch cart for next shift wave.",
      decisionRationale:
        "Exceptional performance evidence justifies jumping ahead past routine single-order practice.",
      interimStatus: "Doing well",
      interimStatusReason: `Exceeding pace curve (${currentPickRate}/hr); fast-tracked to Capability ${advancedCap.id}.`,
    };
  }

  // Normal progression: find next unmastered capability in sequence respecting required prerequisites
  const isMasteredOrProficient = (capId: number): boolean => {
    const st = capabilities[capId];
    return Boolean(st && (st.mastery === "mastered" || st.mastery === "proficient"));
  };

  const nextUnmastered = DARK_STORE_CAPABILITIES.find((c) => {
    const st = capabilities[c.id];
    const isUnmastered = !st || (st.mastery !== "mastered" && st.mastery !== "proficient");
    if (!isUnmastered) return false;
    // Must respect prerequisites already defined in the capability catalog
    return c.prerequisites.every((prereqId) => isMasteredOrProficient(prereqId));
  });

  if (nextUnmastered) {
    return {
      decisionType: "advance_default",
      targetCapId: nextUnmastered.id,
      targetActor: `Self & Buddy (${buddyName})`,
      urgency: "Monitor",
      actionTitle: `Advance to Capability ${nextUnmastered.id}: ${nextUnmastered.name}`,
      actionDesc:
        `${firstName} has demonstrated solid performance on prior capabilities. Begin floor introduction to ${nextUnmastered.name}.`,
      practicalStep: `Brief 5-minute pre-shift overview of ${nextUnmastered.name}.`,
      decisionRationale:
        "Performance is stable and prior prerequisites are mastered; advancing along capability path.",
      interimStatus: "Doing well",
      interimStatusReason: `Ramp curve on track; advancing to Capability ${nextUnmastered.id}.`,
    };
  }

  return {
    decisionType: "no_action_monitor",
    targetCapId: targetCapDef.id,
    targetActor: "Self & Supervisor",
    urgency: "Monitor",
    actionTitle: "Continue Shift Pacing",
    actionDesc: "Standard shift operation without intervention.",
    practicalStep: "Standard daily logging.",
    decisionRationale: "Consistent performance on target.",
    interimStatus: "Doing well",
    interimStatusReason: `Performing on curve (${currentPickRate}/hr, ${accuracy}% accuracy).`,
  };
}

// -------------------------------------------------------------
// INTERNAL HELPER 5: act() - Dispatch smallest practical action
// -------------------------------------------------------------
function act(
  decided: DecidedAction,
  connected: ConnectedContext,
  hire: NewHire,
  dayNumber: number,
  existingAction: RecommendedAction | undefined,
  observed: ObservedSignals,
  understood: UnderstoodDiagnosis
): { pattern: IdentifiedPattern; action: RecommendedAction } {
  const { targetCapDef } = connected;

  const pattern: IdentifiedPattern = {
    id: `pat-${hire.id}-d${dayNumber}`,
    dayNumber,
    patternName: understood.patternName,
    patternConfidence: "High",
    diagnosis: understood.diagnosisText,
    category: understood.patternCategory,
    connectedSignalSummary: [
      `🗣️ Worker: "${observed.dailySignal?.rawText || observed.dailySignal?.issue || "Floor check-in logged"}"`,
      `👔 Manager: ${observed.managerSignal?.state || "Active observation"} (${observed.managerSignal?.issueCategory || "General"})`,
      `📊 Work Telemetry: ${observed.currentPickRate} picks/hr (target ${observed.targetPickRate}), ${observed.accuracy}% accuracy`,
      `🎯 Target Capability: ${targetCapDef.code} - ${targetCapDef.name}`,
    ],
    detectedAt: "Just now",
  };

  const action: RecommendedAction = {
    id: existingAction?.id || `act-${hire.id}-d${dayNumber}`,
    dayNumber,
    actionType:
      decided.decisionType === "reinforce_current"
        ? "buddy_walkthrough"
        : decided.decisionType === "supervisor_demo"
        ? "demonstrate_task"
        : decided.decisionType === "tool_remedy" || decided.decisionType === "communication_support"
        ? "practice"
        : decided.decisionType === "no_action_monitor"
        ? "no_action"
        : "practice",
    title: decided.actionTitle,
    description: decided.actionDesc,
    targetActor: decided.targetActor,
    urgency: decided.urgency,
    smallestPracticalStep: decided.practicalStep,
    status: existingAction?.status === "completed" ? "completed" : "pending",
    createdAt: existingAction?.createdAt || "Just now",
    decisionType: decided.decisionType,
    targetCapabilityId: decided.targetCapId,
    rationale: decided.decisionRationale,
  };

  return { pattern, action };
}

// -------------------------------------------------------------
// INTERNAL HELPER 6: check() - Outcome check & ledger update
// -------------------------------------------------------------
interface CheckStageInput {
  actionOutcome?: ActionOutcome;
  action: RecommendedAction;
  interimStatus: NewHireStatus;
  interimStatusReason: string;
  currentCapabilities: Record<number, CapabilityState>;
  targetCapId: number;
  observed: ObservedSignals;
  dayNumber: number;
  decisionType: AdaptiveGearDecision;
  existingAction?: RecommendedAction;
  hire: NewHire;
  understoodRootCause?: RootCauseType;
}

function check(stageInput: CheckStageInput): {
  finalStatus: NewHireStatus;
  finalStatusReason: string;
  updatedCapabilities: Record<number, CapabilityState>;
  action: RecommendedAction;
} {
  const {
    actionOutcome,
    action,
    interimStatus,
    interimStatusReason,
    currentCapabilities,
    targetCapId,
    observed,
    dayNumber,
    decisionType,
    existingAction,
    hire,
    understoodRootCause,
  } = stageInput;

  let finalStatus: NewHireStatus = interimStatus;
  let finalStatusReason = interimStatusReason;

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

  if (actionOutcome) {
    const outcomePickRate = actionOutcome.subsequentPickRate ?? observed.currentPickRate;
    const outcomeAccuracy = actionOutcome.subsequentAccuracy ?? observed.accuracy;

    const isImproved =
      actionOutcome.improved === "yes" ||
      (outcomePickRate >= observed.targetPickRate - 4 && outcomeAccuracy >= 95);

    const isPartial =
      actionOutcome.improved === "partial" ||
      (observed.previousPickRate !== undefined && outcomePickRate > observed.previousPickRate);

    if (isImproved) {
      finalStatus = "Doing well";
      finalStatusReason = `Intervention succeeded. Pick rate recovered to ${outcomePickRate}/hr with ${outcomeAccuracy}% accuracy.`;
      action.status = "completed";

      capState.exposure = "reinforced";
      capState.evidence = "demonstrated";
      capState.performance =
        outcomePickRate > observed.targetPickRate
          ? "exceeding"
          : outcomePickRate === observed.targetPickRate
          ? "on_target"
          : "below_target";
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
      capState.notes = "Intervention failed to close gap. Must reassess approach.";
    }
  } else {
    if (decisionType === "reinforce_current" || decisionType === "return_prerequisite") {
      capState.exposure = capState.exposure === "not_exposed" ? "exposed" : "reinforced";
      capState.evidence = "inconsistent";
      capState.performance = "below_target";
      capState.reinforcementCount += 1;
    } else if (decisionType === "advance_default" || decisionType === "no_action_monitor") {
      if (observed.hasWorkEvidence && understoodRootCause !== "environment_bottleneck") {
        capState.exposure = "exposed";
        capState.evidence = "demonstrated";
        capState.performance =
          observed.currentPickRate > observed.targetPickRate
            ? "exceeding"
            : observed.currentPickRate === observed.targetPickRate
            ? "on_target"
            : "below_target";
        if (capState.mastery === "locked" || capState.mastery === "in_progress") {
          capState.mastery = "proficient";
        }
      } else {
        // No telemetry or external environmental bottleneck: keep evidence as is
        capState.exposure = "exposed";
        if (capState.evidence === "none") {
          capState.performance = "unknown";
        }
      }
    }
  }

  return {
    finalStatus,
    finalStatusReason,
    updatedCapabilities: currentCapabilities,
    action,
  };
}

/**
 * AUTHORITATIVE CORE LOOP EXECUTION
 * SINGLE EXECUTION AUTHORITY for CheckIn CheckOut
 *
 * Coordinates 6 bounded stages internally:
 * 1. OBSERVE   - Collects & normalizes multi-signal evidence
 * 2. UNDERSTAND - Diagnoses root cause; distinguishes Exposure from Mastery
 * 3. CONNECT   - Connects to capability prerequisite graph & store actors
 * 4. DECIDE    - The Adaptive Core: selects gear shift (advance, reinforce, return, jump, non-training)
 * 5. ACT       - Dispatches smallest practical floor intervention
 * 6. CHECK     - Evaluates before/after outcome; updates Capability Ledger
 */
export function executeCoordinationLoop(input: LoopExecutionInput): PatternSynthesisResult {
  // 1. OBSERVE
  const observed = observe(input);

  // 2. UNDERSTAND
  const understood = understand(observed, input.hire, observed.currentCapabilities, input.existingAction);

  // 3. CONNECT
  const connected = connect(understood, input.hire);

  // 4. DECIDE
  const decided = chooseNextAction(
    understood,
    connected,
    input.hire,
    observed,
    observed.currentCapabilities
  );

  // 5. ACT
  const actionPackage = act(
    decided,
    connected,
    input.hire,
    input.dayNumber,
    input.existingAction,
    observed,
    understood
  );

  // 6. CHECK
  const checkResult = check({
    actionOutcome: input.actionOutcome,
    action: actionPackage.action,
    interimStatus: decided.interimStatus,
    interimStatusReason: decided.interimStatusReason,
    currentCapabilities: observed.currentCapabilities,
    targetCapId: decided.targetCapId,
    observed,
    dayNumber: input.dayNumber,
    decisionType: decided.decisionType,
    existingAction: input.existingAction,
    hire: input.hire,
    understoodRootCause: understood.rootCause,
  });

  const overallReadinessScore = assessReadiness(checkResult.updatedCapabilities);

  return {
    pattern: actionPackage.pattern,
    action: checkResult.action,
    updatedStatus: checkResult.finalStatus,
    statusReason: checkResult.finalStatusReason,
    updatedCapabilities: checkResult.updatedCapabilities,
    overallReadinessScore,
    currentCapabilityId: decided.targetCapId,
    adaptiveDecision: decided.decisionType,
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

