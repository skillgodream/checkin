export type NewHireStatus = "Doing well" | "Needs attention" | "At risk";

export type SignalCategory =
  | "Environment"
  | "Process"
  | "Tool"
  | "Confidence"
  | "Physical"
  | "General";

export type ManagerIssueType =
  | "Speed"
  | "Accuracy"
  | "Process"
  | "Tool"
  | "Confidence"
  | "Other";

export type ActionType =
  | "buddy_walkthrough"
  | "manager_observation"
  | "demonstrate_task"
  | "explain_process"
  | "provide_sop"
  | "let_try_again"
  | "practice"
  | "clarify_expectations"
  | "escalate_issue"
  | "no_action";

export interface DailySignal {
  id: string;
  dayNumber: number;
  rawText: string;
  inputMethod: "voice" | "text" | "quick_select";
  issue: string;
  confidence: "Low" | "Medium" | "High";
  possibleImpact: string;
  category: SignalCategory;
  summary: string;
  companionResponse?: string;
  timestamp: string;
}

export interface ManagerSignal {
  id: string;
  dayNumber: number;
  managerName: string;
  state: "Doing well" | "Needs support" | "Struggling";
  issueCategory?: ManagerIssueType;
  notes?: string;
  timestamp: string;
}

export interface WorkSignal {
  dayNumber: number;
  targetPickRate: number; // e.g. 50 items/hr
  actualPickRate: number; // e.g. 35 items/hr
  accuracyRate: number; // e.g. 98%
  ordersCompleted: number;
  targetOrders: number;
  gapIdentified?: string;
}

export interface IdentifiedPattern {
  id: string;
  dayNumber: number;
  patternName: string;
  patternConfidence: "High" | "Medium" | "Low";
  diagnosis: string;
  category: SignalCategory;
  connectedSignalSummary: string[];
  detectedAt: string;
}

export interface RecommendedAction {
  id: string;
  dayNumber: number;
  actionType: ActionType;
  title: string;
  description: string;
  targetActor: string;
  urgency: "Immediate" | "Next Shift" | "Monitor";
  smallestPracticalStep: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  createdAt: string;
}

export interface ActionOutcome {
  id: string;
  actionId: string;
  dayNumber: number;
  performedBy: string;
  performedAt: string;
  improved: "yes" | "no" | "partial";
  notes: string;
  subsequentPickRate?: number;
  subsequentAccuracy?: number;
}

export interface DayRecord {
  dayNumber: number;
  date: string;
  dailySignal?: DailySignal;
  managerSignal?: ManagerSignal;
  workSignal: WorkSignal;
  identifiedPattern?: IdentifiedPattern;
  recommendedAction?: RecommendedAction;
  actionOutcome?: ActionOutcome;
  statusAtEnd: NewHireStatus;
  statusReason: string;
}

export interface NewHire {
  id: string;
  name: string;
  roleId: string;
  roleTitle: string;
  storeLocation: string;
  avatar: string;
  startDate: string;
  currentDay: number;
  shift: string;
  supervisor: string;
  buddy: string;
  status: NewHireStatus;
  statusReason: string;
  recommendedActionSnippet?: string;
  daysHistory: DayRecord[];
}

export interface OrganizationSummary {
  id: string;
  name: string;
  storeName: string;
  totalNewHires: number;
  doingWellCount: number;
  needsAttentionCount: number;
  atRiskCount: number;
  commonProblems: { problem: string; count: number; impact: string }[];
  emergingPatterns: { pattern: string; trend: string; impactedCount: number }[];
  urgentAttentionIds: string[];
}
