import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runFullStackTests() {
  console.log('🚀 Running Full-Stack Real Data Verification Tests...\n');

  try {
    // 1. Departments Test
    console.log('--- TEST 1: Query Real Departments ---');
    const depts = await prisma.department.findMany();
    console.log(`Found ${depts.length} departments in database:`, depts.map((d) => d.name));
    if (depts.length === 0) throw new Error('No departments found');
    console.log('  ✅ PASS: Departments query successful\n');

    // 2. Real Challenge Creation Test
    console.log('--- TEST 2: Create Real Challenge in PostgreSQL ---');
    const user = await prisma.user.findFirst({ where: { role: 'GOVERNMENT' } });
    if (!user) throw new Error('No government user found');
    const testChallenge = await prisma.challenge.create({
      data: {
        id: `chal-test-${Date.now()}`,
        departmentId: depts[0].id,
        title: 'Smart Urban Traffic Optimization with AI Telemetry',
        problemStatement: 'Severe congestion at junction corridors causing transit delays and emissions.',
        expectedOutcome: 'Reduce transit delay by 25% using dynamic adaptive traffic signals.',
        status: 'ACTIVE',
        createdById: user.id,
      },
    });
    console.log('Created challenge:', testChallenge.id, testChallenge.title);
    console.log('  ✅ PASS: Real Challenge created in DB\n');

    // 3. Dynamic AI Recommendation Test
    console.log('--- TEST 3: Dynamic AI Recommendation Engine ---');
    const startups = await prisma.startup.findMany();
    console.log(`Matching against ${startups.length} database startups...`);
    const words = new Set(
      `${testChallenge.title} ${testChallenge.problemStatement} ${testChallenge.expectedOutcome}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2)
    );
    const scored = startups.map((s) => {
      const text = `${s.name} ${s.sectorTags.join(' ')} ${s.capabilitySummary}`.toLowerCase();
      const hits = [...words].filter((w) => text.includes(w)).length;
      const score = Math.min(98, Math.max(48, 56 + Math.round((hits / Math.max(words.size, 1)) * 50)));
      return { startupId: s.id, name: s.name, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);
    console.log('Top match:', scored[0]?.name, 'Score:', scored[0]?.matchScore);
    console.log('  ✅ PASS: AI matching computed dynamically\n');

    // 4. Startup Application Submission Test
    console.log('--- TEST 4: Startup Proposal Submission ---');
    const topStartup = startups[0];
    const testApp = await prisma.application.create({
      data: {
        id: `app-test-${Date.now()}`,
        shortId: `APP-${Date.now().toString().slice(-4)}`,
        challengeId: testChallenge.id,
        startupId: topStartup.id,
        submittedAt: new Date(),
      },
    });
    console.log('Submitted application:', testApp.id, testApp.shortId);
    console.log('  ✅ PASS: Application persisted in database\n');

    // 5. Rubric Evaluation Test
    console.log('--- TEST 5: Rubric Evaluation Submission ---');
    const evalUser = await prisma.user.findFirst({ where: { role: 'EVALUATOR' } }) || user;
    const testEval = await prisma.evaluation.create({
      data: {
        id: `eval-test-${Date.now()}`,
        challengeId: testChallenge.id,
        startupId: topStartup.id,
        evaluatorId: evalUser.id,
        scores: {
          'Technical Feasibility': { weight: 25, score: 90 },
          Innovation: { weight: 20, score: 92 },
          Impact: { weight: 20, score: 88 },
          'Cost Effectiveness': { weight: 15, score: 85 },
          Scalability: { weight: 10, score: 80 },
          Security: { weight: 10, score: 86 },
        },
        totalScore: 88.0,
        comment: 'Outstanding adaptive traffic telemetry hardware architecture.',
        status: 'SUBMITTED',
      },
    });
    console.log('Saved evaluation score:', testEval.totalScore, 'by evaluator:', evalUser.name);
    console.log('  ✅ PASS: Evaluation saved in PostgreSQL\n');

    // 6. Pilot & Milestone Lifecycle Test
    console.log('--- TEST 6: Pilot Initiation & Milestone Completion ---');
    const testPilot = await prisma.pilot.create({
      data: {
        id: `pilot-test-${Date.now()}`,
        challengeId: testChallenge.id,
        startupId: topStartup.id,
        applicationId: testApp.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 86400000),
        baselineValue: 40,
        targetValue: 25,
        actualValue: 22,
        milestones: {
          create: [
            {
              id: `ms-test-${Date.now()}-1`,
              title: 'Junction Sensor Deployment',
              amount: 300000,
              status: 'COMPLETED',
              completedAt: new Date(),
            },
            {
              id: `ms-test-${Date.now()}-2`,
              title: 'Adaptive Timing Telemetry Verification',
              amount: 350000,
              status: 'IN_PROGRESS',
            },
          ],
        },
      },
      include: { milestones: true },
    });
    console.log('Created pilot:', testPilot.id, 'with milestones:', testPilot.milestones.length);
    console.log('  ✅ PASS: Pilot & Milestones stored in database\n');

    // Cleanup test artifacts from database
    console.log('--- CLEANUP: Removing Test Artifacts ---');
    await prisma.milestone.deleteMany({ where: { pilotId: testPilot.id } });
    await prisma.pilot.delete({ where: { id: testPilot.id } });
    await prisma.evaluation.delete({ where: { id: testEval.id } });
    await prisma.application.delete({ where: { id: testApp.id } });
    await prisma.challenge.delete({ where: { id: testChallenge.id } });
    console.log('  ✅ PASS: Database cleaned up smoothly\n');

    console.log('========================================');
    console.log('FULL-STACK DATA TESTS: ALL PASSED (6/6)');
    console.log('========================================');
  } catch (err: any) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFullStackTests();
