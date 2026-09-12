import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function runAuthSuite() {
  console.log('🚀 Booting StartSI NestJS Auth Test Suite...');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  const authService = app.get(AuthService);

  const testEmail = `tester_${Date.now()}@hackathon.org`;
  const testPassword = 'MySecretPassword123!';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  console.log('\n--- TEST 1: Login with Unknown Email (Must Reject) ---');
  try {
    await authService.login({ email: 'nonexistent_user_999@domain.com', password: 'AnyPassword123!' });
    assert(false, 'Unknown email login rejected', 'Expected login to throw 401 Unauthorized');
  } catch (err: any) {
    assert(err.status === 401, 'Unknown email rejected with 401 Unauthorized', `Got status ${err.status}: ${err.message}`);
  }

  console.log('\n--- TEST 2: Seed User Login with Wrong Password (Must Reject) ---');
  try {
    await authService.login({ email: 'amit.sharma@gov.in', password: 'WrongPassword999!' });
    assert(false, 'Wrong password rejected', 'Expected login to throw 401 Unauthorized');
  } catch (err: any) {
    assert(err.status === 401, 'Wrong password rejected with 401 Unauthorized', `Got status ${err.status}: ${err.message}`);
  }

  console.log('\n--- TEST 3: Seed User Login with Old Bypass "password123" (Must Reject) ---');
  try {
    await authService.login({ email: 'amit.sharma@gov.in', password: 'password123' });
    assert(false, 'Bypass password rejected', 'Expected login to throw 401 Unauthorized');
  } catch (err: any) {
    assert(err.status === 401, 'Old bypass password rejected with 401 Unauthorized', `Got status ${err.status}: ${err.message}`);
  }

  console.log('\n--- TEST 4: Seed User Login with Correct Password "Password123!" (Must Succeed) ---');
  let seedLoginResult: any = null;
  try {
    seedLoginResult = await authService.login({ email: 'amit.sharma@gov.in', password: 'Password123!' });
    assert(!!seedLoginResult.token && seedLoginResult.user.email === 'amit.sharma@gov.in', 'Seed user login succeeded with valid JWT');
  } catch (err: any) {
    assert(false, 'Seed user login succeeded', err.message);
  }

  console.log('\n--- TEST 5: Create New Account (Sign Up) in Supabase (Must Succeed) ---');
  let signupResult: any = null;
  try {
    signupResult = await authService.signup({
      name: 'Rohan Verma',
      email: testEmail,
      password: testPassword,
      role: 'STARTUP',
      orgName: 'Rohan Robotics',
    });
    assert(signupResult.success === true && signupResult.user.email === testEmail, 'New account created in Supabase database');
  } catch (err: any) {
    assert(false, 'New account created', err.message);
  }

  console.log('\n--- TEST 6: Duplicate Registration Attempt (Must Reject with 409 Conflict) ---');
  try {
    await authService.signup({
      name: 'Rohan Verma',
      email: testEmail,
      password: testPassword,
      role: 'STARTUP',
    });
    assert(false, 'Duplicate signup rejected', 'Expected 409 Conflict');
  } catch (err: any) {
    assert(err.status === 409, 'Duplicate signup rejected with 409 Conflict', `Got status ${err.status}: ${err.message}`);
  }

  console.log('\n--- TEST 7: Login with Newly Registered Account & Correct Password (Must Succeed) ---');
  let newLoginResult: any = null;
  try {
    newLoginResult = await authService.login({ email: testEmail, password: testPassword });
    assert(!!newLoginResult.token && newLoginResult.user.email === testEmail, 'Login succeeded for newly created account');
  } catch (err: any) {
    assert(false, 'Login with new account', err.message);
  }

  console.log('\n--- TEST 8: Login with Newly Registered Account & Wrong Password (Must Reject) ---');
  try {
    await authService.login({ email: testEmail, password: 'TotallyWrongPassword!' });
    assert(false, 'New account wrong password rejected', 'Expected 401 Unauthorized');
  } catch (err: any) {
    assert(err.status === 401, 'New account wrong password rejected with 401 Unauthorized', `Got status ${err.status}: ${err.message}`);
  }

  console.log('\n--- TEST 9: Validate JWT Token Verification (me endpoint) ---');
  try {
    const verifiedUser = await authService.me(newLoginResult.user.id);
    assert(verifiedUser.email === testEmail, 'Token verified user identity matches registered user');
  } catch (err: any) {
    assert(false, 'Token validation succeeded', err.message);
  }

  console.log('\n--- TEST 10: Validate Tampered JWT Token (Must Reject) ---');
  try {
    authService.verifyToken('invalid.tampered.token');
    assert(false, 'Tampered token rejected', 'Expected 401 Unauthorized');
  } catch (err: any) {
    assert(err.status === 401, 'Tampered token rejected with 401 Unauthorized');
  }

  console.log('\n--- TEST 11: Google OAuth Signup (New Account in Supabase) ---');
  const googleEmail = `google_user_${Date.now()}@gmail.com`;
  let googleAuthResult: any = null;
  try {
    googleAuthResult = await authService.googleAuth({
      email: googleEmail,
      name: 'Google Innovator',
      role: 'STARTUP',
      orgName: 'Google Ventures Lab',
    });
    assert(
      !!googleAuthResult.token && googleAuthResult.user.email === googleEmail,
      'New Google user account created in Supabase with valid JWT'
    );
  } catch (err: any) {
    assert(false, 'Google user creation succeeded', err.message);
  }

  console.log('\n--- TEST 12: Google OAuth Sign In (Existing Account) ---');
  try {
    const googleLoginResult = await authService.googleAuth({
      email: googleEmail,
      name: 'Google Innovator',
    });
    assert(
      !!googleLoginResult.token && googleLoginResult.user.id === googleAuthResult.user.id,
      'Existing Google user successfully authenticated'
    );
  } catch (err: any) {
    assert(false, 'Google login succeeded', err.message);
  }

  await app.close();

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
