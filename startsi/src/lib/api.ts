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
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
  password: string
): Promise<{ token: string; user: User }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(data: {
  email: string;
  name: string;
  password: string;
  role: "GOVERNMENT" | "STARTUP" | "EVALUATOR";
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
  role?: "GOVERNMENT" | "STARTUP" | "EVALUATOR";
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
  return request("/challenges");
}

export async function getChallenge(id: string): Promise<Challenge> {
  return request(`/challenges/${encodeURIComponent(id)}`);
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
  return request<{
    totalChallenges: number;
    applications: number;
    activePilots: number;
    pendingEvaluations: number;
    scaleUpCandidates: number;
    recentChallenges: Challenge[];
  }>("/dashboard/summary");
}

// ---------------- RECOMMENDATIONS / AI ----------------
export async function getRecommendations(
  challengeId: string
): Promise<Recommendation[]> {
  return request(`/ai/recommendations/${encodeURIComponent(challengeId)}`);
}

// ---------------- STARTUPS ----------------
export async function getStartup(id: string): Promise<Startup> {
  return request(`/startups/${encodeURIComponent(id)}`);
}

export async function compareStartups(startupIds: string[]): Promise<Startup[]> {
  return request(`/startups?ids=${encodeURIComponent(startupIds.join(","))}`);
}

// ---------------- EVALUATIONS ----------------
export async function getEvaluations(): Promise<Evaluation[]> {
  return request("/evaluations");
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
  return request("/pilots");
}

export async function getPilot(pilotId: string): Promise<Pilot> {
  return request(`/pilots/${encodeURIComponent(pilotId)}`);
}

export async function getPilotDetail(id: string): Promise<Pilot> {
  return request(`/pilots/${encodeURIComponent(id)}`);
}

export async function getMyPilots(startupId: string): Promise<Pilot[]> {
  return request(`/pilots?startupId=${encodeURIComponent(startupId)}`);
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
  return request("/applications");
}

export async function getApplicationDetail(id: string): Promise<Application> {
  return request(`/applications/${encodeURIComponent(id)}`);
}

export async function getMyApplications(startupId: string): Promise<Application[]> {
  return request(`/applications?startupId=${encodeURIComponent(startupId)}`);
}

export async function getStartupDashboardStats(startupId: string) {
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
}

export async function getOpenChallengesForStartup(startupId: string) {
  return request<{
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
