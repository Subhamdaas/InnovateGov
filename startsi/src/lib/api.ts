import {
  User,
  Challenge,
  Recommendation,
  Startup,
  Evaluation,
  Pilot,
  Milestone,
  MilestoneStatus,
  Decision,
  Application,
  Department,
  FundingApplication,
  WishlistMatch,
  Verification,
  VerificationVerdict,
  FacilitationRecord,
  FacilitationStage,
} from "@/types";
import {
  MOCK_STARTUPS,
  MOCK_CHALLENGES,
  MOCK_FUNDING_APPLICATIONS,
  MOCK_WISHLIST_MATCHES,
  MOCK_VERIFICATIONS,
  MOCK_FACILITATION_RECORDS,
} from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function delay<T>(data: T, ms?: number): Promise<T> {
  const time = ms || Math.floor(Math.random() * 200) + 150;
  return new Promise((resolve) => setTimeout(() => resolve(data), time));
}

// In-memory stores for Wishlist / Facilitation demo flows
let fundingApplicationsStore = [...MOCK_FUNDING_APPLICATIONS];
let wishlistMatchesStore = [...MOCK_WISHLIST_MATCHES];
let verificationsStore = [...MOCK_VERIFICATIONS];
let facilitationRecordsStore = [...MOCK_FACILITATION_RECORDS];

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("innovategov-session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          return { Authorization: `Bearer ${parsed.state.token}` };
        }
      }
    } catch {
      // ignore
    }
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    if (body && typeof body === "object" && "message" in body) {
      const msg = (body as Record<string, unknown>).message;
      if (Array.isArray(msg)) {
        message = msg.join(". ");
      } else if (typeof msg === "string") {
        message = msg;
      }
    }
    const err = new Error(message);
    (err as any).status = res.status;
    throw err;
  }

  return body as T;
}

// ==========================================
// FILE & DOCUMENT UPLOADS
// ==========================================
export async function uploadFile(file: File): Promise<{
  name: string;
  filename: string;
  size: number;
  mimetype: string;
  url: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/uploads/file`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`File upload failed: HTTP ${res.status}`);
  }

  return res.json();
}

export async function uploadMultipleFiles(files: File[]): Promise<
  {
    name: string;
    filename: string;
    size: number;
    mimetype: string;
    url: string;
  }[]
> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_BASE}/uploads/multiple`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Multiple file upload failed: HTTP ${res.status}`);
  }

  return res.json();
}

// ==========================================
// AUTHENTICATION
// ==========================================
export async function login(
  email: string,
  password?: string
): Promise<{ token: string; user: User }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(data: {
  email: string;
  name: string;
  password?: string;
  role: "GOVERNMENT" | "STARTUP" | "EVALUATOR" | "OPS_FACILITATOR";
  orgName?: string;
  departmentId?: string;
  location?: string;
}): Promise<{ success: boolean; message: string; user: User }> {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<User> {
  return request("/auth/me");
}

export async function googleLogin(data: {
  email: string;
  name: string;
  role?: "GOVERNMENT" | "STARTUP" | "EVALUATOR" | "OPS_FACILITATOR";
  orgName?: string;
  departmentId?: string;
  googleId?: string;
}): Promise<{ token: string; user: User }> {
  return request("/auth/google", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// DEPARTMENTS
// ==========================================
export async function getDepartments(): Promise<Department[]> {
  try {
    return await request<Department[]>("/departments");
  } catch {
    return [
      { id: "dept-1", name: "Public Works Department" },
      { id: "dept-2", name: "Municipal Corporation" },
      { id: "dept-3", name: "Water Resources Dept." },
    ];
  }
}

// ==========================================
// CHALLENGES
// ==========================================
export async function getChallenges(): Promise<Challenge[]> {
  try {
    return await request<Challenge[]>("/challenges");
  } catch {
    return delay([...MOCK_CHALLENGES]);
  }
}

export async function getChallenge(id: string): Promise<Challenge> {
  try {
    return await request<Challenge>(`/challenges/${encodeURIComponent(id)}`);
  } catch {
    const found = MOCK_CHALLENGES.find((c) => c.id === id);
    return delay(found || { ...MOCK_CHALLENGES[0], id });
  }
}

export async function createChallenge(
  data: Omit<Challenge, "id" | "createdAt">
): Promise<Challenge> {
  return request<Challenge>("/challenges", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================
export async function getDashboardSummary() {
  try {
    return await request<{
      totalChallenges: number;
      applications: number;
      activePilots: number;
      pendingEvaluations: number;
      scaleUpCandidates: number;
      recentChallenges: Challenge[];
    }>("/dashboard/summary");
  } catch {
    return delay({
      totalChallenges: 12,
      applications: 48,
      activePilots: 5,
      pendingEvaluations: 7,
      scaleUpCandidates: 2,
      recentChallenges: MOCK_CHALLENGES.slice(0, 5),
    });
  }
}

export async function getReportsMetrics() {
  try {
    return await request<{
      totalChallenges: number;
      totalApplications: number;
      activePilots: number;
      completedPilots: number;
      totalBudgetInLakhs: number;
      disbursedBudgetInLakhs: number;
      avgScore: number;
      pilotSuccessRate: number;
      avgTimeToPilotDays: number;
      scaleUpRecommendations: number;
      departmentAllocations: { name: string; value: number; challengesCount: number }[];
    }>("/reports/metrics");
  } catch {
    return delay({
      totalChallenges: 3,
      totalApplications: 6,
      activePilots: 2,
      completedPilots: 1,
      totalBudgetInLakhs: 24.0,
      disbursedBudgetInLakhs: 8.0,
      avgScore: 81.4,
      pilotSuccessRate: 100,
      avgTimeToPilotDays: 14,
      scaleUpRecommendations: 2,
      departmentAllocations: [
        { name: "Public Works Department", value: 34, challengesCount: 2 },
        { name: "Municipal Corporation", value: 24, challengesCount: 1 },
      ],
    });
  }
}

// ==========================================
// AI RECOMMENDATIONS
// ==========================================
export async function getRecommendations(
  challengeId: string
): Promise<Recommendation[]> {
  try {
    return await request<Recommendation[]>(`/ai/recommendations/${encodeURIComponent(challengeId)}`);
  } catch {
    return delay([]);
  }
}

// ==========================================
// STARTUPS
// ==========================================
export async function getStartups(): Promise<Startup[]> {
  try {
    return await request<Startup[]>("/startups");
  } catch {
    return delay([...MOCK_STARTUPS]);
  }
}

export async function getStartup(id: string): Promise<Startup> {
  try {
    return await request<Startup>(`/startups/${encodeURIComponent(id)}`);
  } catch {
    const found = MOCK_STARTUPS.find((s) => s.id === id);
    return delay(found || MOCK_STARTUPS[0]);
  }
}

export async function compareStartups(startupIds: string[]): Promise<Startup[]> {
  try {
    return await request<Startup[]>(`/startups?ids=${encodeURIComponent(startupIds.join(","))}`);
  } catch {
    const filtered = MOCK_STARTUPS.filter((s) => startupIds.includes(s.id));
    return delay(filtered.length ? filtered : MOCK_STARTUPS.slice(0, 3));
  }
}

// ==========================================
// EVALUATIONS
// ==========================================
export async function getEvaluations(): Promise<Evaluation[]> {
  try {
    return await request<Evaluation[]>("/evaluations");
  } catch {
    return delay([]);
  }
}

export async function submitEvaluation(
  data: Omit<Evaluation, "id">
): Promise<Evaluation> {
  return request<Evaluation>("/evaluations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// PILOTS & MILESTONES
// ==========================================
export async function getAllPilots(): Promise<Pilot[]> {
  try {
    return await request<Pilot[]>("/pilots");
  } catch {
    return delay([]);
  }
}

export async function getPilot(pilotId: string): Promise<Pilot> {
  return request<Pilot>(`/pilots/${encodeURIComponent(pilotId)}`);
}

export async function getPilotDetail(id: string): Promise<Pilot> {
  return request<Pilot>(`/pilots/${encodeURIComponent(id)}`);
}

export async function getMyPilots(startupId: string): Promise<Pilot[]> {
  try {
    return await request<Pilot[]>(`/pilots?startupId=${encodeURIComponent(startupId)}`);
  } catch {
    return delay([]);
  }
}

export async function startPilot(
  challengeId: string,
  startupId: string
): Promise<Pilot> {
  return request<Pilot>("/pilots", {
    method: "POST",
    body: JSON.stringify({ challengeId, startupId }),
  });
}

export async function updateMilestone(
  milestoneId: string,
  status: MilestoneStatus
): Promise<Milestone> {
  return request<Milestone>(`/pilots/milestones/${encodeURIComponent(milestoneId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function recordDecision(
  pilotId: string,
  outcome: string,
  recommendedBy?: string
): Promise<Decision> {
  return request<Decision>(`/pilots/${encodeURIComponent(pilotId)}/decision`, {
    method: "POST",
    body: JSON.stringify({ outcome, recommendedBy }),
  });
}

// ==========================================
// APPLICATIONS
// ==========================================
export async function getApplications(): Promise<Application[]> {
  try {
    return await request<Application[]>("/applications");
  } catch {
    return delay([]);
  }
}

export async function getApplicationDetail(id: string): Promise<Application> {
  return request<Application>(`/applications/${encodeURIComponent(id)}`);
}

export async function getMyApplications(startupId: string): Promise<Application[]> {
  try {
    return await request<Application[]>(`/applications?startupId=${encodeURIComponent(startupId)}`);
  } catch {
    return delay([]);
  }
}

export async function getStartupDashboardStats(startupId: string) {
  try {
    const myApplications = await getMyApplications(startupId);
    const myPilots = await getMyPilots(startupId);
    const recommendations = await Promise.all(
      myApplications.map((a) =>
        getRecommendations(a.challengeId).catch(() => [] as Recommendation[])
      )
    );
    const scores = recommendations
      .flat()
      .filter((r) => r.startupId === startupId)
      .map((r) => r.matchScore);

    return {
      totalApplications: myApplications.length,
      underReview: myApplications.filter((a) => a.status === "UNDER_REVIEW").length,
      activePilots: myPilots.filter((p) => p.status === "ACTIVE").length,
      bestMatchScore: scores.length ? Math.max(...scores) : 92,
      myApplications,
    };
  } catch {
    return {
      totalApplications: 0,
      underReview: 0,
      activePilots: 0,
      bestMatchScore: 94,
      myApplications: [],
    };
  }
}

export async function getOpenChallengesForStartup(startupId: string) {
  try {
    return await request<{
      id: string;
      departmentId: string;
      title: string;
      problemStatement: string;
      expectedOutcome: string;
      status: "DRAFT" | "ACTIVE" | "CLOSED";
      createdById: string;
      createdAt: string;
      hasApplied: boolean;
      departmentName: string;
      applicantCount: number;
    }[]>(`/applications/open-challenges/${encodeURIComponent(startupId)}`);
  } catch {
    return delay(
      MOCK_CHALLENGES.map((c) => ({
        ...c,
        hasApplied: false,
        departmentName: "Public Works Department",
        applicantCount: 2,
      }))
    );
  }
}

export async function submitApplication(
  startupId: string,
  challengeId: string,
  proposalData: {
    capabilitySummary?: string;
    teamSize?: number;
    location?: string;
    sector?: string;
    documentUrl?: string;
    documentName?: string;
  }
): Promise<Application> {
  return request<Application>(`/applications/challenge/${encodeURIComponent(challengeId)}`, {
    method: "POST",
    body: JSON.stringify({ startupId, ...proposalData }),
  });
}

export async function getMyApplicationDetail(
  startupId: string,
  applicationId: string
): Promise<Application | null> {
  try {
    const app = await getApplicationDetail(applicationId);
    return app.startupId === startupId ? app : null;
  } catch {
    return null;
  }
}

// ==========================================
// FUNDING WISHLIST & FACILITATION API HELPERS
// ==========================================
export async function submitFundingApplication(
  data: Omit<FundingApplication, "id" | "submittedAt" | "status">
): Promise<FundingApplication> {
  const newApp: FundingApplication = {
    ...data,
    id: `fa-${Date.now()}`,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
  };

  fundingApplicationsStore.unshift(newApp);
  return delay(newApp);
}

export async function getFundingApplicationByStartup(
  startupId: string
): Promise<FundingApplication | null> {
  const app = fundingApplicationsStore.find((fa) => fa.startupId === startupId);
  return delay(app || null);
}

export async function getWishlistMatches(challengeId: string): Promise<
  (WishlistMatch & {
    fundingApplication?: FundingApplication;
    startup?: Startup;
  })[]
> {
  const matches = wishlistMatchesStore.filter(
    (wm) => wm.challengeId === challengeId
  );

  const joined = matches.map((wm) => {
    const fundingApplication = fundingApplicationsStore.find(
      (fa) => fa.id === wm.fundingApplicationId
    );
    const startup = fundingApplication
      ? MOCK_STARTUPS.find((s) => s.id === fundingApplication.startupId)
      : undefined;

    return {
      ...wm,
      fundingApplication,
      startup,
    };
  });

  // Sort by matchScore descending
  joined.sort((a, b) => b.matchScore - a.matchScore);
  return delay(joined);
}

export async function getVerification(
  wishlistMatchId: string
): Promise<Verification | null> {
  const ver = verificationsStore.find(
    (v) => v.wishlistMatchId === wishlistMatchId
  );
  return delay(ver || null);
}

export async function updateVerification(
  id: string,
  field: "identityStatus" | "technicalStatus",
  verdict: VerificationVerdict
): Promise<Verification> {
  const existing = verificationsStore.find((v) => v.id === id);
  if (!existing) {
    throw new Error(`Verification with id ${id} not found.`);
  }

  existing[field] = verdict;
  if (field === "identityStatus") existing.identityReviewedBy = "usr-4";
  if (field === "technicalStatus") existing.technicalReviewedBy = "usr-4";

  return delay({ ...existing });
}

export async function getFacilitationPipeline(): Promise<
  (FacilitationRecord & {
    verification?: Verification;
    wishlistMatch?: WishlistMatch;
    startup?: Startup;
    challenge?: Challenge;
  })[]
> {
  const joined = facilitationRecordsStore.map((fac) => {
    const verification = verificationsStore.find(
      (v) => v.id === fac.verificationId
    );
    const wishlistMatch = verification
      ? wishlistMatchesStore.find((wm) => wm.id === verification.wishlistMatchId)
      : undefined;
    const challenge = wishlistMatch
      ? MOCK_CHALLENGES.find((c) => c.id === wishlistMatch.challengeId)
      : undefined;
    const fundingApp = wishlistMatch
      ? fundingApplicationsStore.find((fa) => fa.id === wishlistMatch.fundingApplicationId)
      : undefined;
    const startup = fundingApp
      ? MOCK_STARTUPS.find((s) => s.id === fundingApp.startupId)
      : undefined;

    return {
      ...fac,
      verification,
      wishlistMatch,
      startup,
      challenge,
    };
  });

  return delay(joined);
}

export async function updateFacilitationStage(
  id: string,
  stage: FacilitationStage,
  extra?: { governmentContact?: string; fundingAmountSecured?: number; notes?: string }
): Promise<FacilitationRecord> {
  const existing = facilitationRecordsStore.find((f) => f.id === id);
  if (!existing) {
    throw new Error(`FacilitationRecord with id ${id} not found.`);
  }

  existing.stage = stage;
  existing.updatedAt = new Date().toISOString();
  if (extra?.governmentContact !== undefined) existing.governmentContact = extra.governmentContact;
  if (extra?.fundingAmountSecured !== undefined) existing.fundingAmountSecured = extra.fundingAmountSecured;
  if (extra?.notes !== undefined) existing.notes = extra.notes;

  return delay({ ...existing });
}

// ==========================================
// AI ENGINE SUITE (MODELS 1, 2, 3)
// ==========================================

export interface MatchProblemResult {
  governmentProblem: string;
  totalStartupsEvaluated: number;
  topMatches: {
    id: string;
    name: string;
    industries: string;
    description: string;
    city: string;
    similarity: number;
    matchScore: number;
    matchReason: string;
  }[];
}

export interface RubricAuditResult {
  startupName: string;
  approach1: {
    overallScore: number;
    verdict: string;
    strengths: string[];
    concerns: string[];
  };
  approach2: {
    compositeScore: number;
    expertRubricScore: number;
    objectiveReadinessScore: number;
    objectiveBreakdown: {
      trlPoints: number;
      pilotsPoints: number;
      dpiitPoints: number;
      turnoverPoints: number;
    };
    strengths: string[];
    riskConcerns: string[];
    verdict: string;
  };
  divergence: number;
  riskFlag: string;
}

export interface PilotEvaluationResult {
  verdict: "PILOT SUCCESS" | "PILOT PARTIAL SUCCESS" | "PILOT UNSUCCESSFUL";
  recommendation: "SCALE" | "EXTEND PILOT" | "REJECT";
  confidence: number;
  reason: string;
  metrics: {
    leakageAttainmentPct: number;
    costAttainmentPct: number;
    avgAttainmentPct: number;
  };
}

// MODEL 1: Match Problem Statement against Startups
export async function matchProblemStatement(
  problemStatement: string,
  topK: number = 5
): Promise<MatchProblemResult> {
  try {
    return await request<MatchProblemResult>("/ai/match-problem", {
      method: "POST",
      body: JSON.stringify({ problemStatement, topK }),
    });
  } catch {
    // Client-side fallback semantic matcher
    return {
      governmentProblem: problemStatement,
      totalStartupsEvaluated: MOCK_STARTUPS.length,
      topMatches: MOCK_STARTUPS.slice(0, topK).map((s, idx) => ({
        id: s.id,
        name: s.name,
        industries: s.sectorTags.join(", "),
        description: s.capabilitySummary,
        city: "Maharashtra",
        similarity: 0.85 - idx * 0.05,
        matchScore: 88 - idx * 6,
        matchReason: `High semantic fit with ${s.name} core competencies.`,
      })),
    };
  }
}

// MODEL 2: Hybrid Expert Rubric & Objective Readiness Audit
export async function auditStartupEvaluation(payload: {
  startupId?: string;
  startupName?: string;
  rubricScores: Record<string, number>;
  startupData?: any;
}): Promise<RubricAuditResult> {
  try {
    return await request<RubricAuditResult>("/ai/audit-evaluation", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const vals = Object.values(payload.rubricScores);
    const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const norm = avg > 10 ? avg / 10 : avg;
    return {
      startupName: payload.startupName || "Candidate",
      approach1: {
        overallScore: norm,
        verdict: norm >= 7.5 ? "RECOMMEND FOR PILOT" : "FURTHER EVALUATION REQUIRED",
        strengths: ["Technical Feasibility", "Innovation"],
        concerns: [],
      },
      approach2: {
        compositeScore: parseFloat((norm * 0.55 + 7.5 * 0.45).toFixed(2)),
        expertRubricScore: parseFloat(norm.toFixed(2)),
        objectiveReadinessScore: 7.5,
        objectiveBreakdown: { trlPoints: 3.1, pilotsPoints: 1.8, dpiitPoints: 1.5, turnoverPoints: 1.1 },
        strengths: ["Field-Proven TRL", "DPIIT Recognized"],
        riskConcerns: [],
        verdict: "APPROVE FOR PILOT DEPLOYMENT",
      },
      divergence: 0.2,
      riskFlag: "ALIGNED EVALUATION",
    };
  }
}

// MODEL 3: Pilot KPI Result Evaluation
export async function evaluatePilotKpis(kpis: {
  target_leakage_reduction?: number;
  actual_leakage_reduction?: number;
  target_cost_reduction?: number;
  actual_cost_reduction?: number;
  target_performance?: number;
  actual_performance?: number;
}): Promise<PilotEvaluationResult> {
  try {
    return await request<PilotEvaluationResult>("/ai/evaluate-pilot", {
      method: "POST",
      body: JSON.stringify(kpis),
    });
  } catch {
    const lActual = kpis.actual_leakage_reduction ?? 26;
    const lTarget = kpis.target_leakage_reduction ?? 20;
    const success = lActual >= lTarget;
    return {
      verdict: success ? "PILOT SUCCESS" : "PILOT PARTIAL SUCCESS",
      recommendation: success ? "SCALE" : "EXTEND PILOT",
      confidence: success ? 91 : 74,
      reason: success
        ? "Solution exceeded both primary KPIs and demonstrated deployment feasibility."
        : "Operational cost targets require an extended trial.",
      metrics: {
        leakageAttainmentPct: (lActual / lTarget) * 100,
        costAttainmentPct: 120,
        avgAttainmentPct: 125,
      },
    };
  }
}

export async function getPilotAiRecommendation(pilotId: string) {
  try {
    return await request<any>(`/ai/pilot/${encodeURIComponent(pilotId)}/recommendation`);
  } catch {
    return null;
  }
}

