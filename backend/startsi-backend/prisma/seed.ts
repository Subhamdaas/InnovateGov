import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.decision.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.pilot.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.department.deleteMany();

  await prisma.department.createMany({
    data: [
      { id: 'dept-1', name: 'Public Works Department' },
      { id: 'dept-2', name: 'Municipal Corporation' },
      { id: 'dept-3', name: 'Water Resources Dept.' },
    ],
  });

  await prisma.startup.createMany({
    data: [
      { id: 'start-1', name: 'GreenTech Solutions Pvt. Ltd.', sectorTags: ['Water Tech', 'IoT', 'Smart City'], capabilitySummary: 'Acoustic sensor & AI/ML powered real-time water leakage detection network for urban distribution infrastructure.', foundedYear: 2020, teamSize: 18, location: 'Pune, Maharashtra' },
      { id: 'start-2', name: 'EcoTrash Systems', sectorTags: ['Waste Management', 'CleanTech', 'Sustainability'], capabilitySummary: 'Smart IoT-enabled waste bin monitoring, dynamic collection route optimization, and automated segregation telemetry.', foundedYear: 2021, teamSize: 12, location: 'Mumbai, Maharashtra' },
      { id: 'start-3', name: 'AgriTech Labs', sectorTags: ['Agri-Tech', 'Computer Vision', 'AI/ML'], capabilitySummary: 'Hyperspectral imagery and drone camera analysis for hyper-local early disease prediction in regional crop varieties.', foundedYear: 2019, teamSize: 25, location: 'Nagpur, Maharashtra' },
      { id: 'start-4', name: 'HealthPulse Diagnostics', sectorTags: ['HealthTech', 'Telemedicine', 'MedDevice'], capabilitySummary: 'Portable diagnostic kiosks with non-invasive vitals monitoring for rural primary health centers.', foundedYear: 2022, teamSize: 15, location: 'Nashik, Maharashtra' },
      { id: 'start-5', name: 'FinBridge GovPay', sectorTags: ['FinTech', 'Blockchain', 'GovTech'], capabilitySummary: 'Automated milestone-based direct benefit transfer and vendor escrow audit trail system for public tenders.', foundedYear: 2021, teamSize: 20, location: 'Bengaluru, Karnataka' },
      { id: 'start-6', name: 'SkillGov AI', sectorTags: ['Ed-Tech', 'Skill Development', 'Analytics'], capabilitySummary: 'Adaptive learning platform and vocational job placement matching engine for municipal youth employment drives.', foundedYear: 2023, teamSize: 10, location: 'Thane, Maharashtra' },
    ],
  });

  const defaultPasswordHash = hashPassword('Password123!');

  await prisma.user.createMany({
    data: [
      { id: 'usr-1', name: 'Amit Sharma', email: 'amit.sharma@gov.in', password: defaultPasswordHash, role: 'GOVERNMENT', departmentId: 'dept-1' },
      { id: 'usr-2', name: 'Riya Sharma', email: 'founder@techstartup.in', password: defaultPasswordHash, role: 'STARTUP', startupId: 'start-1' },
      { id: 'usr-3', name: 'Dr. Priya Sharma', email: 'priya.sharma@evaluator.org', password: defaultPasswordHash, role: 'EVALUATOR', departmentId: 'dept-2' },
    ],
  });

  await prisma.challenge.createMany({
    data: [
      { id: 'chal-1', departmentId: 'dept-1', title: 'Water Leakage Detection System', problemStatement: 'Current urban water distribution networks suffer high non-revenue water loss due to unidentified underground pipe bursts and illegal tapping.', expectedOutcome: 'Deploy AI/IoT solution to reduce distribution water leakage by at least 20% within 6 months across pilot wards.', status: 'ACTIVE', createdById: 'usr-1', createdAt: new Date('2026-08-15T09:30:00Z') },
      { id: 'chal-2', departmentId: 'dept-2', title: 'Smart Waste Management', problemStatement: 'Inefficient garbage collection schedules lead to overflowing community bins and high diesel consumption by municipal trucks.', expectedOutcome: 'Implement real-time bin level monitoring and dynamic collection routes to cut overflow complaints by 50%.', status: 'ACTIVE', createdById: 'usr-1', createdAt: new Date('2026-08-20T11:00:00Z') },
      { id: 'chal-3', departmentId: 'dept-1', title: 'AI Based Crop Disease Prediction', problemStatement: 'Delayed pest detection causes major crop yield losses for smallholder farmers before agricultural officers can intervene.', expectedOutcome: 'Deliver early warning mobile alerts with >85% accuracy 7 days prior to infestation outbreak.', status: 'DRAFT', createdById: 'usr-1', createdAt: new Date('2026-09-01T14:15:00Z') },
    ],
  });

  await prisma.recommendation.createMany({
    data: [
      { id: 'rec-1', challengeId: 'chal-1', startupId: 'start-1', matchScore: 94, matchReason: 'Strong water-tech + IoT capability and relevant deployment experience.' },
      { id: 'rec-2', challengeId: 'chal-1', startupId: 'start-3', matchScore: 84, matchReason: 'Strong sensor, AI/ML and drone analytics overlap.' },
      { id: 'rec-3', challengeId: 'chal-1', startupId: 'start-2', matchScore: 68, matchReason: 'Partial IoT match; primary focus is waste logistics.' },
      { id: 'rec-4', challengeId: 'chal-1', startupId: 'start-5', matchScore: 56, matchReason: 'Strong GovTech payment auditing but weak sensor fit.' },
      { id: 'rec-6', challengeId: 'chal-2', startupId: 'start-2', matchScore: 93, matchReason: 'Direct waste-management and IoT match.' },
      { id: 'rec-7', challengeId: 'chal-3', startupId: 'start-3', matchScore: 95, matchReason: 'Direct agricultural computer-vision and AI capability.' },
    ],
  });

  const a = await prisma.application.create({
    data: {
      id: 'app-101',
      shortId: 'APP-101',
      challengeId: 'chal-1',
      startupId: 'start-1',
      recommendationId: 'rec-1',
      submittedAt: new Date('2026-08-18T10:15:00Z'),
    },
  });

  await prisma.application.create({
    data: {
      id: 'app-102',
      shortId: 'APP-102',
      challengeId: 'chal-1',
      startupId: 'start-3',
      recommendationId: 'rec-2',
      submittedAt: new Date('2026-08-20T14:30:00Z'),
    },
  });

  await prisma.evaluation.create({
    data: {
      id: 'eval-1',
      challengeId: 'chal-1',
      startupId: 'start-1',
      evaluatorId: 'usr-3',
      scores: { innovation: { weight: 1, score: 9 }, feasibility: { weight: 1, score: 8 }, cost: { weight: 1, score: 8 }, scalability: { weight: 1, score: 9 } },
      totalScore: 34,
      comment: 'Strong technical fit and scalability.',
      status: 'SUBMITTED',
    },
  });

  const p = await prisma.pilot.create({
    data: {
      id: 'pilot-1',
      challengeId: 'chal-1',
      startupId: 'start-1',
      applicationId: a.id,
      status: 'ACTIVE',
      startDate: new Date('2026-08-25'),
      endDate: new Date('2027-02-25'),
      baselineValue: 35,
      targetValue: 20,
      actualValue: 17,
      milestones: {
        create: [
          { id: 'ms-1', title: 'Initial Hardware & Telemetry Setup', amount: 250000, status: 'COMPLETED', completedAt: new Date('2026-08-31') },
          { id: 'ms-2', title: 'Field Deployment & Baseline Data Calibration', amount: 300000, status: 'IN_PROGRESS' },
          { id: 'ms-3', title: 'Final Impact Audit & Scale-Up Proposal', amount: 250000, status: 'PENDING' },
        ],
      },
    },
  });

  await prisma.decision.create({
    data: {
      id: 'dec-1',
      pilotId: p.id,
      outcome: 'SCALE',
      recommendedBy: 'usr-3',
      recommendedAt: new Date('2026-09-05'),
    },
  });

  console.log('Seed complete: Demo users populated with hashed passwords (Password123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
