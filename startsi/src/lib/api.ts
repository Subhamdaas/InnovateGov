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

// ---------------- AUTH ----------------
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

// ---------------- CHALLENGES ----------------
export async function getChallenges(): Promise<Challenge[]> {
  try {
    return await request("/challenges");
  } catch {
    return delay([...MOCK_CHALLENGES]);
  }
}

export async function getChallenge(id: string): Promise<Challenge> {
  try {
    return await request(`/challenges/${encodeURIComponent(id)}`);
  } catch {
    const found = MOCK_CHALLENGES.find((c) => c.id === id);
    return delay(found || { ...MOCK_CHALLENGES[0], id });
  }
}

export async function createChallenge(
  data: Omit<Challenge, "id" | "createdAt">
): Promise<Challenge> {
  return request("/challenges", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------- DASHBOARD ----------------
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

// ---------------- RECOMMENDATIONS / AI ----------------
export async function getRecommendations(
  challengeId: string
): Promise<Recommendation[]> {
  try {
    return await request(`/ai/recommendations/${encodeURIComponent(challengeId)}`);
  } catch {
    return delay([]);
  }
}

// ---------------- STARTUPS ----------------
export async function getStartup(id: string): Promise<Startup> {
  try {
    return await request(`/startups/${encodeURIComponent(id)}`);
  } catch {
    const found = MOCK_STARTUPS.find((s) => s.id === id);
    return delay(found || MOCK_STARTUPS[0]);
  }
}

export async function compareStartups(startupIds: string[]): Promise<Startup[]> {
  try {
    return await request(`/startups?ids=${encodeURIComponent(startupIds.join(","))}`);
  } catch {
    const filtered = MOCK_STARTUPS.filter((s) => startupIds.includes(s.id));
    return delay(filtered.length ? filtered : MOCK_STARTUPS.slice(0, 3));
  }
}

// ---------------- EVALUATIONS ----------------
export async function getEvaluations(): Promise<Evaluation[]> {
  try {
    return await request("/evaluations");
  } catch {
    return delay([]);
  }
}

export async function submitEvaluation(
  data: Omit<Evaluation, "id">
): Promise<Evaluation> {
  return request("/evaluations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------- PILOTS ----------------
export async function getAllPilots(): Promise<Pilot[]> {
  try {
    return await request("/pilots");
  } catch {
    return delay([]);
  }
}

export async function getPilot(pilotId: string): Promise<Pilot> {
  return request(`/pilots/${encodeURIComponent(pilotId)}`);
}

export async function getPilotDetail(id: string): Promise<Pilot> {
  return request(`/pilots/${encodeURIComponent(id)}`);
}

export async function getMyPilots(startupId: string): Promise<Pilot[]> {
  try {
    return await request(`/pilots?startupId=${encodeURIComponent(startupId)}`);
  } catch {
    return delay([]);
  }
}

export async function startPilot(
  challengeId: string,
  startupId: string
): Promise<Pilot> {
  return request("/pilots", {
    method: "POST",
    body: JSON.stringify({ challengeId, startupId }),
  });
}

export async function updateMilestone(
  milestoneId: string,
  status: MilestoneStatus
): Promise<Milestone> {
  return request(`/pilots/milestones/${encodeURIComponent(milestoneId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function recordDecision(
  pilotId: string,
  outcome: string
): Promise<Decision> {
  return request(`/pilots/${encodeURIComponent(pilotId)}/decision`, {
    method: "POST",
    body: JSON.stringify({ outcome, recommendedBy: "usr-1" }),
  });
}

// ---------------- APPLICATIONS ----------------
export async function getApplications(): Promise<Application[]> {
  try {
    return await request("/applications");
  } catch {
    return delay([]);
  }
}

export async function getApplicationDetail(id: string): Promise<Application> {
  return request(`/applications/${encodeURIComponent(id)}`);
}

export async function getMyApplications(startupId: string): Promise<Application[]> {
  try {
    return await request(`/applications?startupId=${encodeURIComponent(startupId)}`);
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
      bestMatchScore: scores.length ? Math.max(...scores) : 0,
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
  }
): Promise<Application> {
  return request(`/applications/challenge/${encodeURIComponent(challengeId)}`, {
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
