export type Role = "GOVERNMENT" | "STARTUP" | "EVALUATOR" | "OPS_FACILITATOR";
export type ChallengeStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type EvalStatus = "DRAFT" | "SUBMITTED";
export type PilotStatus = "ACTIVE" | "COMPLETED";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type ApplicationStatus = "UNDER_REVIEW" | "EVALUATED" | "SELECTED";

export type FundingAppStatus =
  | "PENDING"
  | "MATCHED"
  | "VERIFYING"
  | "VERIFIED"
  | "REJECTED";
export type VerificationVerdict = "PENDING" | "APPROVED" | "REJECTED";
export type FacilitationStage =
  | "VERIFIED"
  | "OUTREACH"
  | "NEGOTIATING"
  | "FUNDED"
  | "CLOSED_NOT_FUNDED";

export interface FundingApplication {
  id: string;
  startupId: string;
  capabilitySummary: string;
  fundingAskAmount: number;
  fundingPurpose: string;
  documents: { name: string; type: string }[];
  status: FundingAppStatus;
  submittedAt: string;
}

export interface WishlistMatch {
  id: string;
  challengeId: string;
  fundingApplicationId: string;
  matchScore: number;
  matchReason: string;
  rank: number; // 1 or 2 = auto-shortlisted
}

export interface Verification {
  id: string;
  wishlistMatchId: string;
  identityStatus: VerificationVerdict;
  technicalStatus: VerificationVerdict;
  identityReviewedBy?: string;
  technicalReviewedBy?: string;
  identityDocs: { name: string; approved: boolean }[];
}

export interface FacilitationRecord {
  id: string;
  verificationId: string;
  stage: FacilitationStage;
  governmentContact?: string;
  fundingAmountSecured?: number;
  notes: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  startupId?: string;
}

export interface Startup {
  id: string;
  name: string;
  sectorTags: string[];
  capabilitySummary: string;
  foundedYear?: number;
  teamSize?: number;
  location?: string;
}

export interface Challenge {
  id: string;
  departmentId: string;
  title: string;
  problemStatement: string;
  expectedOutcome: string;
  status: ChallengeStatus;
  createdById: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  challengeId: string;
  startupId: string;
  matchScore: number;
  matchReason: string;
  startup?: Startup;
}

export interface Evaluation {
  id: string;
  challengeId: string;
  startupId: string;
  evaluatorId: string;
  scores: Record<string, { weight: number; score: number }>;
  totalScore: number;
  comment?: string;
  status: EvalStatus;
  startup?: Startup;
  challenge?: Challenge;
  evaluator?: User;
}

export interface Milestone {
  id: string;
  pilotId: string;
  title: string;
  amount: number;
  status: MilestoneStatus;
  completedAt?: string;
}

export interface Pilot {
  id: string;
  challengeId: string;
  startupId: string;
  status: PilotStatus;
  startDate: string;
  endDate?: string;
  baselineValue?: number;
  targetValue?: number;
  actualValue?: number;
  milestones: Milestone[];
  challenge?: Challenge;
  startup?: Startup;
  departmentName?: string;
  decision?: Decision;
}

export interface Decision {
  id: string;
  pilotId: string;
  outcome: string;
  recommendedBy: string;
  recommendedAt: string;
}

export interface Application {
  id: string;
  shortId: string;
  challengeId: string;
  startupId: string;
  recommendationId?: string;
  submittedAt: string;
  status: ApplicationStatus;
  challenge?: Challenge;
  startup?: Startup;
  evaluation?: Evaluation;
  pilot?: Pilot;
  recommendation?: Recommendation;
}

export interface GovtScheme {
  id: string;
  name: string;
  agency: string;
  benefits: string;
  eligibility: string;
  link: string;
  category: "NATIONAL" | "STATE";
  state?: string;
}
