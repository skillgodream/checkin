import { executeCoordinationLoop } from "./src/services/intelligence";
import { initialRahul, createDefaultCapabilitiesLedger } from "./src/data/seedData";
import { NewHire, DayRecord, WorkSignal, DailySignal, ManagerSignal } from "./src/types";

console.log("=== RUNNING CHECKIN CHECKOUT ADAPTIVE INTELLIGENCE TEST SUITE ===\n");

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------------------------------
// CASE 1: Normal Progression
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    capabilities: createDefaultCapabilitiesLedger(),
  };
  hire.capabilities[1].mastery = "mastered";
  hire.capabilities[2].mastery = "mastered";

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 52,
      accuracyRate: 99,
      ordersCompleted: 70,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c1",
      dayNumber: 3,
      rawText: "Shift was smooth and fast. Pacing felt great.",
      inputMethod: "text",
      issue: "None",
      confidence: "High",
      possibleImpact: "Normal ramp",
      category: "General",
      summary: "Pacing smooth",
      companionResponse: "Great job!",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c1",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Doing well",
      issueCategory: undefined,
      notes: "Steady and fast.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "advance_default",
    "Case 1: Normal progression selects 'advance_default'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.updatedStatus === "Doing well",
    "Case 1: Status is 'Doing well'",
    `Received: ${result.updatedStatus}`
  );
}

// ----------------------------------------------------------------------------
// CASE 2: Reinforcement
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 3,
    capabilities: createDefaultCapabilitiesLedger(),
  };
  // Cap 1 & 2 are proficient
  hire.capabilities[1].mastery = "proficient";
  hire.capabilities[2].mastery = "proficient";
  hire.capabilities[2].evidence = "demonstrated";

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 44,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c2",
      dayNumber: 3,
      rawText: "I was confused finding products in Aisles 4-8, searching took long.",
      inputMethod: "voice",
      issue: "Location navigation",
      confidence: "Low",
      possibleImpact: "Slow picking",
      category: "Environment",
      summary: "Aisle confusion",
      companionResponse: "Take your time.",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c2",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Needs support",
      issueCategory: "Process",
      notes: "Searching for shelf bins in Aisles 4-8.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "reinforce_current",
    "Case 2: Reinforcement selects 'reinforce_current'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.action.targetCapabilityId === 3,
    "Case 2: Targets Capability 3 (Location Navigation)",
    `Received: ${result.action.targetCapabilityId}`
  );
  assert(
    result.updatedStatus === "Needs attention",
    "Case 2: Status is 'Needs attention'",
    `Received: ${result.updatedStatus}`
  );
}

// ----------------------------------------------------------------------------
// CASE 3: Prerequisite Failure
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 3,
    capabilities: createDefaultCapabilitiesLedger(),
  };
  // Scanner basics (Cap 2) was exposed but inconsistent (never mastered)
  hire.capabilities[2].exposure = "exposed";
  hire.capabilities[2].evidence = "inconsistent";
  hire.capabilities[2].mastery = "in_progress";

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 32,
      accuracyRate: 96,
      ordersCompleted: 40,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c3",
      dayNumber: 3,
      rawText: "I get confused where items are because I don't understand the scanner coordinate numbers.",
      inputMethod: "voice",
      issue: "Location confusion",
      confidence: "Low",
      possibleImpact: "Order lag",
      category: "Environment",
      summary: "Location confusion",
      companionResponse: "We will help you.",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c3",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Needs support",
      issueCategory: "Process",
      notes: "Struggling with rack coordinates.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "return_prerequisite",
    "Case 3: Prerequisite failure selects 'return_prerequisite'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.action.targetCapabilityId === 2,
    "Case 3: Steps back to Capability 2 (Scanner Basics)",
    `Received: ${result.action.targetCapabilityId}`
  );
}

// ----------------------------------------------------------------------------
// CASE 4: Jump Ahead
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 2,
    capabilities: createDefaultCapabilitiesLedger(),
  };
  hire.capabilities[1].mastery = "mastered";
  hire.capabilities[2].mastery = "mastered";

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 64, // Exceeds target by 14 items/hr!
      accuracyRate: 99,
      ordersCompleted: 85,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c4",
      dayNumber: 3,
      rawText: "I finished all assigned shelves early and picked with zero errors.",
      inputMethod: "text",
      issue: "None",
      confidence: "High",
      possibleImpact: "Accelerated ramp",
      category: "General",
      summary: "High performance",
      companionResponse: "Outstanding work!",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c4",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Doing well",
      issueCategory: undefined,
      notes: "Exceptional picking pace and accuracy.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "jump_ahead",
    "Case 4: High performance selects 'jump_ahead'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.action.targetCapabilityId === 8,
    "Case 4: Leaps ahead to Capability 8 (Advanced Batching)",
    `Received: ${result.action.targetCapabilityId}`
  );
}

// ----------------------------------------------------------------------------
// CASE 5: Non-Training Problem (Hardware / Tool)
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    capabilities: createDefaultCapabilitiesLedger(),
  };

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 34,
      accuracyRate: 98,
      ordersCompleted: 42,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c5",
      dayNumber: 3,
      rawText: "The barcode scanner Bluetooth keeps disconnecting and battery died twice.",
      inputMethod: "voice",
      issue: "Scanner battery disconnection",
      confidence: "Medium",
      possibleImpact: "Delay",
      category: "Tool",
      summary: "Scanner battery disconnection",
      companionResponse: "Swap battery with buddy.",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c5",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Needs support",
      issueCategory: "Tool",
      notes: "Hardware scanner disconnects.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "tool_remedy",
    "Case 5: Non-training tool friction selects 'tool_remedy'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.action.targetActor.includes("Maintenance") || result.action.targetActor.includes("Buddy"),
    "Case 5: Targets Tool / Hardware actor instead of curriculum",
    `Received: ${result.action.targetActor}`
  );
}

// ----------------------------------------------------------------------------
// CASE 6: Successful Intervention
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 3,
    status: "Needs attention",
    capabilities: createDefaultCapabilitiesLedger(),
  };

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 4,
    workSignal: {
      dayNumber: 4,
      targetPickRate: 50,
      actualPickRate: 48,
      accuracyRate: 99,
      ordersCompleted: 64,
      targetOrders: 65,
    },
    actionOutcome: {
      id: "out-c6",
      actionId: "act-c6",
      dayNumber: 4,
      performedBy: "Vikram R. (Buddy)",
      performedAt: "03:30 PM",
      improved: "yes",
      notes: "Rahul navigated Aisles 4-8 smoothly after buddy walkthrough.",
      subsequentPickRate: 48,
      subsequentAccuracy: 99,
    },
  });

  assert(
    result.updatedStatus === "Doing well",
    "Case 6: Successful intervention updates status to 'Doing well'",
    `Received: ${result.updatedStatus}`
  );
  assert(
    result.updatedCapabilities[3].mastery === "proficient",
    "Case 6: Target Capability 3 is now marked 'proficient'",
    `Received: ${result.updatedCapabilities[3].mastery}`
  );
  assert(
    result.updatedCapabilities[3].evidence === "demonstrated",
    "Case 6: Target Capability 3 evidence is 'demonstrated'",
    `Received: ${result.updatedCapabilities[3].evidence}`
  );
}

// ----------------------------------------------------------------------------
// CASE 7: Failed Intervention
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 3,
    status: "Needs attention",
    capabilities: createDefaultCapabilitiesLedger(),
  };

  // Day 4: Prior buddy walkthrough failed
  const previousRecord: DayRecord = {
    dayNumber: 3,
    date: "Day 3",
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 35,
      accuracyRate: 98,
      ordersCompleted: 44,
      targetOrders: 65,
    },
    actionOutcome: {
      id: "out-c7-prev",
      actionId: "act-c7-prev",
      dayNumber: 3,
      performedBy: "Vikram R.",
      performedAt: "04:00 PM",
      improved: "no",
      notes: "Aisle confusion persists despite walkthrough.",
      subsequentPickRate: 34,
      subsequentAccuracy: 97,
    },
    statusAtEnd: "At risk",
    statusReason: "Intervention failed to close gap.",
  };

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 4,
    previousRecord,
    existingAction: {
      id: "act-c7-prev",
      dayNumber: 3,
      actionType: "buddy_walkthrough",
      title: "Buddy walkthrough of Aisles 4-8",
      description: "Guided run",
      targetActor: "Buddy Vikram",
      urgency: "Next Shift",
      smallestPracticalStep: "15 min walkthrough",
      status: "completed",
      createdAt: "Yesterday",
    },
    workSignal: {
      dayNumber: 4,
      targetPickRate: 50,
      actualPickRate: 34,
      accuracyRate: 97,
      ordersCompleted: 43,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c7",
      dayNumber: 4,
      rawText: "Still getting lost in Aisles 4-8 racks.",
      inputMethod: "voice",
      issue: "Location confusion",
      confidence: "Low",
      possibleImpact: "Slow picking",
      category: "Environment",
      summary: "Location confusion",
      companionResponse: "Checking floor layout.",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c7",
      dayNumber: 4,
      managerName: "Suresh K.",
      state: "Struggling",
      issueCategory: "Process",
      notes: "Still confused in Aisles 4-8.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.adaptiveDecision === "environment_support",
    "Case 7: Failed buddy walkthrough does NOT repeat identical action; escalates to 'environment_support'",
    `Received: ${result.adaptiveDecision}`
  );
  assert(
    result.action.targetActor.includes("Supervisor"),
    "Case 7: Escalates actor to Supervisor instead of repeating buddy",
    `Received: ${result.action.targetActor}`
  );
}

// ----------------------------------------------------------------------------
// CASE 8: Completion vs Mastery
// ----------------------------------------------------------------------------
{
  const hire: NewHire = {
    ...initialRahul,
    currentCapabilityId: 3,
    capabilities: createDefaultCapabilitiesLedger(),
  };
  // Worker was exposed/completed training on Cap 3
  hire.capabilities[3].exposure = "exposed";
  hire.capabilities[3].mastery = "in_progress";

  const result = executeCoordinationLoop({
    hire,
    dayNumber: 3,
    workSignal: {
      dayNumber: 3,
      targetPickRate: 50,
      actualPickRate: 32, // Stalled on floor!
      accuracyRate: 97,
      ordersCompleted: 40,
      targetOrders: 65,
    },
    dailySignal: {
      id: "sig-c8",
      dayNumber: 3,
      rawText: "I completed the module on aisles, but on the floor I still can't find shelf codes quickly.",
      inputMethod: "voice",
      issue: "Location confusion",
      confidence: "Low",
      possibleImpact: "Slow picking",
      category: "Environment",
      summary: "Location confusion",
      companionResponse: "We will practice on the floor.",
      timestamp: "02:00 PM",
    },
    managerSignal: {
      id: "mgr-c8",
      dayNumber: 3,
      managerName: "Suresh K.",
      state: "Needs support",
      issueCategory: "Process",
      notes: "Needs support finding racks.",
      timestamp: "02:30 PM",
    },
  });

  assert(
    result.updatedCapabilities[3].mastery !== "mastered",
    "Case 8: Capability is NOT marked mastered merely because module was exposed/completed",
    `Received: ${result.updatedCapabilities[3].mastery}`
  );
  assert(
    result.pattern.diagnosis.includes("Module exposure does NOT equal floor mastery") ||
    result.pattern.diagnosis.includes("Module exposure"),
    "Case 8: Diagnosis explicitly notes that module exposure does not equal floor mastery",
    `Received: ${result.pattern.diagnosis}`
  );
}

console.log("\n=== ALL TEST CASES EVALUATED SUCCESSFULLY! ===");
