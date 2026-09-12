import {
  Department,
  User,
  Startup,
  Challenge,
  Recommendation,
  Evaluation,
  Pilot,
  Decision,
  GovtScheme,
  FundingApplication,
  WishlistMatch,
  Verification,
  FacilitationRecord,
} from "@/types";

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Public Works Department" },
  { id: "dept-2", name: "Municipal Corporation" },
  { id: "dept-3", name: "Water Resources Dept." },
];

export const MOCK_USERS: User[] = [
  {
    id: "usr-1",
    name: "Amit Sharma",
    email: "amit.sharma@gov.in",
    role: "GOVERNMENT",
    departmentId: "dept-1",
  },
  {
    id: "usr-2",
    name: "Riya Sharma",
    email: "founder@techstartup.in",
    role: "STARTUP",
    startupId: "start-1",
  },
  {
    id: "usr-3",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@evaluator.org",
    role: "EVALUATOR",
    departmentId: "dept-2",
  },
  {
    id: "usr-4",
    name: "Vikram Malhotra",
    email: "ops@innovategov.in",
    role: "OPS_FACILITATOR",
    departmentId: "dept-1",
  },
];

export const MOCK_STARTUPS: Startup[] = [
  {
    id: "start-1",
    name: "GreenTech Solutions Pvt. Ltd.",
    sectorTags: ["Water Tech", "IoT", "Smart City"],
    capabilitySummary:
      "Acoustic sensor & AI/ML powered real-time water leakage detection network for urban distribution infrastructure.",
    foundedYear: 2020,
    teamSize: 18,
    location: "Pune, Maharashtra",
  },
  {
    id: "start-2",
    name: "EcoTrash Systems",
    sectorTags: ["Waste Management", "CleanTech", "Sustainability"],
    capabilitySummary:
      "Smart IoT-enabled waste bin monitoring, dynamic collection route optimization, and automated segregation telemetry.",
    foundedYear: 2021,
    teamSize: 12,
    location: "Mumbai, Maharashtra",
  },
  {
    id: "start-3",
    name: "AgriTech Labs",
    sectorTags: ["Agri-Tech", "Computer Vision", "AI/ML"],
    capabilitySummary:
      "Hyperspectral imagery and drone camera analysis for hyper-local early disease prediction in regional crop varieties.",
    foundedYear: 2019,
    teamSize: 25,
    location: "Nagpur, Maharashtra",
  },
  {
    id: "start-4",
    name: "HealthPulse Diagnostics",
    sectorTags: ["HealthTech", "Telemedicine", "MedDevice"],
    capabilitySummary:
      "Portable diagnostic kiosks with non-invasive vitals monitoring for rural primary health centers.",
    foundedYear: 2022,
    teamSize: 15,
    location: "Nashik, Maharashtra",
  },
  {
    id: "start-5",
    name: "FinBridge GovPay",
    sectorTags: ["FinTech", "Blockchain", "GovTech"],
    capabilitySummary:
      "Automated milestone-based direct benefit transfer and vendor escrow audit trail system for public tenders.",
    foundedYear: 2021,
    teamSize: 20,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "start-6",
    name: "SkillGov AI",
    sectorTags: ["Ed-Tech", "Skill Development", "Analytics"],
    capabilitySummary:
      "Adaptive learning platform and vocational job placement matching engine for municipal youth employment drives.",
    foundedYear: 2023,
    teamSize: 10,
    location: "Thane, Maharashtra",
  },
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "chal-1",
    departmentId: "dept-1",
    title: "Water Leakage Detection System",
    problemStatement:
      "Current urban water distribution networks suffer high non-revenue water loss (over 35%) due to unidentified underground pipe bursts and illegal tapping.",
    expectedOutcome:
      "Deploy AI/IoT solution to reduce distribution water leakage by at least 20% within 6 months across pilot wards.",
    status: "ACTIVE",
    createdById: "usr-1",
    createdAt: "2026-08-15T09:30:00Z",
  },
  {
    id: "chal-2",
    departmentId: "dept-2",
    title: "Smart Waste Management",
    problemStatement:
      "Inefficient garbage collection schedules lead to overflowing community bins and high diesel consumption by municipal trucks.",
    expectedOutcome:
      "Implement real-time bin level monitoring and dynamic collection routes to cut overflow complaints by 50%.",
    status: "ACTIVE",
    createdById: "usr-1",
    createdAt: "2026-08-20T11:00:00Z",
  },
  {
    id: "chal-3",
    departmentId: "dept-1",
    title: "AI Based Crop Disease Prediction",
    problemStatement:
      "Delayed pest detection causes major crop yield losses for smallholder farmers before agricultural officers can intervene.",
    expectedOutcome:
      "Deliver early warning mobile alerts with >85% accuracy 7 days prior to infestation outbreak.",
    status: "DRAFT",
    createdById: "usr-1",
    createdAt: "2026-09-01T14:15:00Z",
  },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    challengeId: "chal-1",
    startupId: "start-1",
    matchScore: 94,
    matchReason:
      "High domain match: 18 acoustic sensor deployments with proven 92% leak localization accuracy in urban pipes.",
    startup: MOCK_STARTUPS[0],
  },
  {
    id: "rec-2",
    challengeId: "chal-1",
    startupId: "start-3",
    matchScore: 84,
    matchReason:
      "Advanced IoT computer vision & drone sensor telemetry; adaptable for above-ground pipeline thermal mapping.",
    startup: MOCK_STARTUPS[2],
  },
  {
    id: "rec-3",
    challengeId: "chal-1",
    startupId: "start-2",
    matchScore: 68,
    matchReason:
      "Partial IoT sensor overlap, but primary focus is solid waste logistics rather than hydraulic telemetry.",
    startup: MOCK_STARTUPS[1],
  },
  {
    id: "rec-4",
    challengeId: "chal-1",
    startupId: "start-5",
    matchScore: 56,
    matchReason:
      "Strong fintech escrow auditing capabilities, but limited hardware sensor integration experience.",
    startup: MOCK_STARTUPS[4],
  },
  {
    id: "rec-5",
    challengeId: "chal-1",
    startupId: "start-6",
    matchScore: 42,
    matchReason:
      "Ed-Tech platform focus; low hardware/hydraulic alignment, but useful for municipal field staff training.",
    startup: MOCK_STARTUPS[5],
  },
  {
    id: "rec-6",
    challengeId: "chal-2",
    startupId: "start-2",
    matchScore: 96,
    matchReason:
      "Direct fit: EcoTrash route optimization engine demonstrated 40% fuel reduction in municipal trials.",
    startup: MOCK_STARTUPS[1],
  },
];

export const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: "eval-1",
    challengeId: "chal-1",
    startupId: "start-1",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 85 },
      Innovation: { weight: 20, score: 90 },
      Impact: { weight: 20, score: 88 },
      "Cost Effectiveness": { weight: 15, score: 75 },
      Scalability: { weight: 10, score: 78 },
      Security: { weight: 10, score: 82 },
    },
    totalScore: 83.1,
    comment:
      "Strong technical architecture and sensor battery longevity. Vendor demonstrated successful field pilot in Solapur.",
    status: "SUBMITTED",
  },
  {
    id: "eval-2",
    challengeId: "chal-1",
    startupId: "start-3",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 75 },
      Innovation: { weight: 20, score: 82 },
      Impact: { weight: 20, score: 78 },
      "Cost Effectiveness": { weight: 15, score: 70 },
      Scalability: { weight: 10, score: 72 },
      Security: { weight: 10, score: 80 },
    },
    totalScore: 76.5,
    comment:
      "Hyperspectral imaging is promising for surface pipeline leaks, but requires thermal drone calibration.",
    status: "SUBMITTED",
  },
  {
    id: "eval-3",
    challengeId: "chal-2",
    startupId: "start-2",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 92 },
      Innovation: { weight: 20, score: 88 },
      Impact: { weight: 20, score: 90 },
      "Cost Effectiveness": { weight: 15, score: 84 },
      Scalability: { weight: 10, score: 78 },
      Security: { weight: 10, score: 82 },
    },
    totalScore: 86.4,
    comment:
      "Excellent dynamic route optimization and fill-level telemetry for smart waste collection.",
    status: "SUBMITTED",
  },
  {
    id: "eval-4",
    challengeId: "chal-1",
    startupId: "start-2",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 55 },
      Innovation: { weight: 20, score: 60 },
      Impact: { weight: 20, score: 50 },
      "Cost Effectiveness": { weight: 15, score: 58 },
      Scalability: { weight: 10, score: 52 },
      Security: { weight: 10, score: 65 },
    },
    totalScore: 56.4,
    comment:
      "Limited direct hydraulic sensing capabilities. Waste sensor hardware does not meet pipe acoustic requirements.",
    status: "SUBMITTED",
  },
  {
    id: "eval-5",
    challengeId: "chal-2",
    startupId: "start-4",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 70 },
      Innovation: { weight: 20, score: 65 },
      Impact: { weight: 20, score: 72 },
      "Cost Effectiveness": { weight: 15, score: 68 },
      Scalability: { weight: 10, score: 60 },
      Security: { weight: 10, score: 75 },
    },
    totalScore: 68.5,
    comment: "Draft evaluation saved during preliminary technical review.",
    status: "DRAFT",
  },
  {
    id: "eval-6",
    challengeId: "chal-3",
    startupId: "start-3",
    evaluatorId: "usr-3",
    scores: {
      "Technical Feasibility": { weight: 25, score: 88 },
      Innovation: { weight: 20, score: 94 },
      Impact: { weight: 20, score: 92 },
      "Cost Effectiveness": { weight: 15, score: 85 },
      Scalability: { weight: 10, score: 80 },
      Security: { weight: 10, score: 84 },
    },
    totalScore: 88.0,
    comment: "High alignment with agricultural disease prediction metrics.",
    status: "DRAFT",
  },
];

export const MOCK_PILOTS: Pilot[] = [
  {
    id: "pilot-1",
    challengeId: "chal-1",
    startupId: "start-1",
    status: "ACTIVE",
    startDate: "2026-09-01",
    endDate: "2027-02-28",
    baselineValue: 35,
    targetValue: 20,
    actualValue: 17,
    challenge: MOCK_CHALLENGES[0],
    startup: MOCK_STARTUPS[0],
    milestones: [
      {
        id: "ms-1",
        pilotId: "pilot-1",
        title: "Deploy Sensors in 5 Wards",
        amount: 250000,
        status: "COMPLETED",
        completedAt: "2026-09-05T16:00:00Z",
      },
      {
        id: "ms-2",
        pilotId: "pilot-1",
        title: "Telemetry Data Calibration & Baseline Report",
        amount: 300000,
        status: "IN_PROGRESS",
      },
      {
        id: "ms-3",
        pilotId: "pilot-1",
        title: "Final Leak Mitigation Audit & Scale-up Proposal",
        amount: 250000,
        status: "PENDING",
      },
    ],
  },
  {
    id: "pilot-2",
    challengeId: "chal-2",
    startupId: "start-2",
    status: "COMPLETED",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    baselineValue: 40,
    targetValue: 20,
    actualValue: 14,
    challenge: MOCK_CHALLENGES[1],
    startup: MOCK_STARTUPS[1],
    milestones: [
      {
        id: "ms-201",
        pilotId: "pilot-2",
        title: "IoT Bin Sensor Deployment across Ward 4",
        amount: 200000,
        status: "COMPLETED",
        completedAt: "2026-04-15T10:00:00Z",
      },
      {
        id: "ms-202",
        pilotId: "pilot-2",
        title: "Dynamic Truck Route Telemetry Calibration",
        amount: 250000,
        status: "COMPLETED",
        completedAt: "2026-06-20T14:30:00Z",
      },
      {
        id: "ms-203",
        pilotId: "pilot-2",
        title: "Final Waste Audit & Fuel Reduction Verification",
        amount: 200000,
        status: "COMPLETED",
        completedAt: "2026-08-28T16:00:00Z",
      },
    ],
  },
  {
    id: "pilot-3",
    challengeId: "chal-1",
    startupId: "start-3",
    status: "ACTIVE",
    startDate: "2026-08-15",
    endDate: "2027-01-31",
    baselineValue: 30,
    targetValue: 15,
    actualValue: 22,
    challenge: MOCK_CHALLENGES[0],
    startup: MOCK_STARTUPS[2],
    milestones: [
      {
        id: "ms-301",
        pilotId: "pilot-3",
        title: "Thermal Imagery Camera Installation",
        amount: 180000,
        status: "COMPLETED",
        completedAt: "2026-08-30T11:00:00Z",
      },
      {
        id: "ms-302",
        pilotId: "pilot-3",
        title: "Drone Flight Route Mapping & Telemetry",
        amount: 220000,
        status: "COMPLETED",
        completedAt: "2026-09-08T15:00:00Z",
      },
      {
        id: "ms-303",
        pilotId: "pilot-3",
        title: "Final Leak Prediction Accuracy Audit",
        amount: 200000,
        status: "IN_PROGRESS",
      },
    ],
  },
];

export const MOCK_DECISIONS: Decision[] = [
  {
    id: "dec-1",
    pilotId: "pilot-1",
    outcome:
      "Recommended for Scale-Up across 12 remaining municipal water zones.",
    recommendedBy: "usr-1",
    recommendedAt: "2026-09-10T10:00:00Z",
  },
  {
    id: "dec-2",
    pilotId: "pilot-2",
    outcome: "Scale-Up Recommended — 46% waste truck fuel reduction achieved.",
    recommendedBy: "usr-1",
    recommendedAt: "2026-08-30T14:00:00Z",
  },
];

export const MOCK_GOVT_SCHEMES: GovtScheme[] = [
  // NATIONAL (6 entries)
  {
    id: "scheme-nat-1",
    name: "Startup India Seed Fund Scheme (SISFS)",
    agency: "DPIIT",
    benefits: "Up to ₹20L grant for PoC/prototype, plus up to ₹50L convertible debt for commercialization",
    eligibility: "DPIIT-recognised startups, less than 2 years old",
    link: "https://startupindia.gov.in",
    category: "NATIONAL",
  },
  {
    id: "scheme-nat-2",
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    agency: "DPIIT / NCGTC",
    benefits: "Collateral-free loan guarantee cover up to ₹20 crore",
    eligibility: "DPIIT-recognised startups seeking debt financing",
    link: "https://startupindia.gov.in",
    category: "NATIONAL",
  },
  {
    id: "scheme-nat-3",
    name: "Fund of Funds for Startups (FoF 2.0)",
    agency: "SIDBI",
    benefits: "₹10,000 crore corpus invested into SEBI-registered VC funds (AIFs), which then invest in startups",
    eligibility: "Startups raising from FoF-backed VC funds",
    link: "https://sidbi.in",
    category: "NATIONAL",
  },
  {
    id: "scheme-nat-4",
    name: "Atal Innovation Mission (AIM)",
    agency: "NITI Aayog",
    benefits: "Access to 70+ Atal Incubation Centres offering mentorship, ideation and early-stage support",
    eligibility: "Early-stage founders, students, deep-tech ventures",
    link: "https://aim.gov.in",
    category: "NATIONAL",
  },
  {
    id: "scheme-nat-5",
    name: "Stand-Up India",
    agency: "Dept. of Financial Services (banks)",
    benefits: "Bank loans between ₹10 lakh and ₹1 crore",
    eligibility: "SC/ST and women entrepreneurs",
    link: "https://standupmitra.in",
    category: "NATIONAL",
  },
  {
    id: "scheme-nat-6",
    name: "Women Entrepreneurship Platform (WEP)",
    agency: "NITI Aayog",
    benefits: "Mentoring, networking, and funding-access support",
    eligibility: "Women-led startups",
    link: "https://wep.gov.in",
    category: "NATIONAL",
  },

  // STATE (6 entries)
  {
    id: "scheme-st-1",
    name: "ELEVATE / ELEVATE NxT",
    agency: "Govt. of Karnataka",
    state: "Karnataka",
    benefits: "Seed and prototype grants up to ₹50 lakh (up to ₹1 crore for deep-tech)",
    eligibility: "Karnataka-based registered startups",
    link: "https://karnatakastartups.in",
    category: "STATE",
  },
  {
    id: "scheme-st-2",
    name: "T-Fund / T-Hub",
    agency: "Govt. of Telangana / T-Hub",
    state: "Telangana",
    benefits: "State-backed ₹1,000 crore fund supporting seed funding and incubation",
    eligibility: "Telangana-based startups & incubatees",
    link: "https://telangana.gov.in",
    category: "STATE",
  },
  {
    id: "scheme-st-3",
    name: "TANSEED",
    agency: "StartupTN",
    state: "Tamil Nadu",
    benefits: "Early-stage funding up to ₹15 lakh",
    eligibility: "Tamil Nadu registered early-stage startups",
    link: "https://startuptn.in",
    category: "STATE",
  },
  {
    id: "scheme-st-4",
    name: "MSInS Seed Fund / CM MahaFund",
    agency: "MSInS",
    state: "Maharashtra",
    benefits: "₹500 crore state corpus; up to ₹10 crore in VC support; Startup Week work orders up to ₹15 lakh",
    eligibility: "Maharashtra-registered startups",
    link: "https://msins.in",
    category: "STATE",
  },
  {
    id: "scheme-st-5",
    name: "SSIP 2.0",
    agency: "Govt. of Gujarat",
    state: "Gujarat",
    benefits: "Seed funding up to ₹30 lakh plus patent-cost reimbursement, focused on student founders",
    eligibility: "Student founders & young innovators in Gujarat",
    link: "https://ssipgujarat.in",
    category: "STATE",
  },
  {
    id: "scheme-st-6",
    name: "KSUM Seed Fund",
    agency: "Kerala Startup Mission (KSUM)",
    state: "Kerala",
    benefits: "Grants and incubation support for early-stage and student founders",
    eligibility: "Kerala-based early-stage startups & student founders",
    link: "https://ksum.kerala.gov.in",
    category: "STATE",
  },
];

export const MOCK_FUNDING_APPLICATIONS: FundingApplication[] = [
  {
    id: "fa-101",
    startupId: "start-1",
    capabilitySummary: "Acoustic sensor & AI/ML powered real-time water leakage detection network for urban distribution infrastructure.",
    fundingAskAmount: 2500000,
    fundingPurpose: "Commercial pilot deployment of 50 acoustic sensors across municipal water zones.",
    documents: [
      { name: "DPIIT_Certificate.pdf", type: "application/pdf" },
      { name: "Technical_Architecture_Deck.pdf", type: "application/pdf" },
      { name: "Financial_Audit_FY25.pdf", type: "application/pdf" },
    ],
    status: "VERIFIED",
    submittedAt: "2026-08-16T10:00:00Z",
  },
  {
    id: "fa-102",
    startupId: "start-2",
    capabilitySummary: "Smart IoT-enabled waste bin monitoring, dynamic collection route optimization, and automated segregation telemetry.",
    fundingAskAmount: 3000000,
    fundingPurpose: "Scaling smart bin sensors and fleet route optimization software for municipal waste management.",
    documents: [
      { name: "DPIIT_Certificate.pdf", type: "application/pdf" },
      { name: "IoT_Sensor_Compliance.pdf", type: "application/pdf" },
    ],
    status: "VERIFYING",
    submittedAt: "2026-08-21T14:30:00Z",
  },
  {
    id: "fa-103",
    startupId: "start-3",
    capabilitySummary: "Thermal drone imaging & AI computer vision for real-time canal seepage and embankment fracture analysis.",
    fundingAskAmount: 3500000,
    fundingPurpose: "Deploying autonomous drone surveillance units for irrigation canal monitoring.",
    documents: [
      { name: "DGCA_Drone_Permit.pdf", type: "application/pdf" },
      { name: "DPIIT_Certificate.pdf", type: "application/pdf" },
    ],
    status: "MATCHED",
    submittedAt: "2026-08-25T11:15:00Z",
  },
  {
    id: "fa-104",
    startupId: "start-4",
    capabilitySummary: "Solar-powered smart water quality monitoring buoys with real-time turbidity and pH telemetry.",
    fundingAskAmount: 1800000,
    fundingPurpose: "Manufacturing 20 solar sensor buoys for municipal reservoir testing.",
    documents: [
      { name: "Lab_Testing_Report.pdf", type: "application/pdf" },
    ],
    status: "MATCHED",
    submittedAt: "2026-08-28T09:00:00Z",
  },
  {
    id: "fa-105",
    startupId: "start-5",
    capabilitySummary: "AI thermal camera surveillance & automated toll lane clearance for emergency vehicles.",
    fundingAskAmount: 4000000,
    fundingPurpose: "Pilot hardware integration at 10 major city arterial corridors.",
    documents: [
      { name: "Hardware_Spec_Sheet.pdf", type: "application/pdf" },
    ],
    status: "PENDING",
    submittedAt: "2026-09-02T16:00:00Z",
  },
  {
    id: "fa-106",
    startupId: "start-6",
    capabilitySummary: "Adaptive learning platform and vocational job placement matching engine for youth employment drives.",
    fundingAskAmount: 1500000,
    fundingPurpose: "Curriculum localization and regional language portal deployment.",
    documents: [
      { name: "EdTech_Impact_Study.pdf", type: "application/pdf" },
    ],
    status: "PENDING",
    submittedAt: "2026-09-05T12:00:00Z",
  },
];

export const MOCK_WISHLIST_MATCHES: WishlistMatch[] = [
  // Challenge 1: Water Leakage Detection System
  {
    id: "wm-101",
    challengeId: "chal-1",
    fundingApplicationId: "fa-101", // GreenTech (start-1)
    matchScore: 94.5,
    matchReason: "Acoustic sensor technology matches underground water pipe leakage criteria with 94% confidence.",
    rank: 1, // Auto-shortlisted
  },
  {
    id: "wm-102",
    challengeId: "chal-1",
    fundingApplicationId: "fa-103", // Drone Seepage (start-3)
    matchScore: 88.2,
    matchReason: "Thermal imaging drone capability complements pipe seepage detection with high precision.",
    rank: 2, // Auto-shortlisted
  },
  {
    id: "wm-103",
    challengeId: "chal-1",
    fundingApplicationId: "fa-104", // Solar Sensor (start-4)
    matchScore: 76.4,
    matchReason: "Water quality buoys provide supplementary pressure and turbidity telemetry.",
    rank: 3,
  },

  // Challenge 2: Smart Waste Management
  {
    id: "wm-201",
    challengeId: "chal-2",
    fundingApplicationId: "fa-102", // EcoTrash Systems (start-2)
    matchScore: 92.8,
    matchReason: "Smart bin IoT sensors & fleet route optimization directly resolve municipal collection delays.",
    rank: 1, // Auto-shortlisted
  },
  {
    id: "wm-202",
    challengeId: "chal-2",
    fundingApplicationId: "fa-105", // Traffic AI (start-5)
    matchScore: 84.0,
    matchReason: "Corridor traffic telemetry enables priority routing for municipal waste trucks.",
    rank: 2, // Auto-shortlisted
  },
  {
    id: "wm-203",
    challengeId: "chal-2",
    fundingApplicationId: "fa-106", // SkillGov AI (start-6)
    matchScore: 65.0,
    matchReason: "Vocational training module for sanitation workforce management.",
    rank: 3,
  },

  // Challenge 3: AI Based Crop Disease Prediction
  {
    id: "wm-301",
    challengeId: "chal-3",
    fundingApplicationId: "fa-103", // Drone Seepage (start-3)
    matchScore: 89.5,
    matchReason: "Multispectral aerial drone imagery ideal for early crop pest & disease spot detection.",
    rank: 1, // Auto-shortlisted
  },
  {
    id: "wm-302",
    challengeId: "chal-3",
    fundingApplicationId: "fa-101", // GreenTech (start-1)
    matchScore: 82.1,
    matchReason: "Soil moisture & acoustic root sensor data assists disease vulnerability mapping.",
    rank: 2, // Auto-shortlisted
  },
];

export const MOCK_VERIFICATIONS: Verification[] = [
  {
    id: "ver-101",
    wishlistMatchId: "wm-101", // GreenTech on Chal-1
    identityStatus: "APPROVED",
    technicalStatus: "APPROVED",
    identityReviewedBy: "usr-4",
    technicalReviewedBy: "usr-3",
    identityDocs: [
      { name: "DPIIT Recognition Certificate", approved: true },
      { name: "Certificate of Incorporation", approved: true },
      { name: "PAN & GST Compliance", approved: true },
    ],
  },
  {
    id: "ver-102",
    wishlistMatchId: "wm-201", // EcoTrash on Chal-2
    identityStatus: "PENDING",
    technicalStatus: "APPROVED",
    technicalReviewedBy: "usr-4",
    identityDocs: [
      { name: "DPIIT Recognition Certificate", approved: true },
      { name: "Director KYC Documents", approved: false },
    ],
  },
];

export const MOCK_FACILITATION_RECORDS: FacilitationRecord[] = [
  {
    id: "fac-101",
    verificationId: "ver-101",
    stage: "NEGOTIATING",
    governmentContact: "Amit Sharma (Public Works Department)",
    fundingAmountSecured: 2500000,
    notes: "Pilot terms drafted for 50 sensor deployment across 5 municipal water zones. MoA review in progress with Chief Engineer.",
    updatedAt: "2026-09-10T14:30:00Z",
  },
];
