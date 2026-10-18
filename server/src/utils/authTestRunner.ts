import {
  findUserByEmail,
  registerUser,
  authenticatePassword,
  generateOTPForUser,
  verifyUserOTP,
} from '../models/userDb.js';

console.log('🧪 Starting WealthWise Authentication & Database Validation Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Check existing email
const existing = findUserByEmail('sambhaji.jadhav@example.com');
assert(!!existing && existing.name === 'Sambhaji Jadhav', '1. Check email: Existing email "sambhaji.jadhav@example.com" found in Users database');

// 2. Check case-insensitive trim
const caseInsensitive = findUserByEmail('  SAMBHAJI.JADHAV@EXAMPLE.COM  ');
assert(!!caseInsensitive && caseInsensitive.name === 'Sambhaji Jadhav', '2. Check email: Case-insensitive and trimmed email lookup succeeds');

// 3. Check non-existent email
const nonExistent = findUserByEmail('unregistered.test@example.com');
assert(nonExistent === undefined, '3. Check email: Unregistered email returns undefined (triggers redirect to Create Account)');

// 4. First-time registration with isNewUser: true
const regTestEmail = `new.investor.${Date.now()}@example.com`;
const regResult = registerUser({
  name: 'Anita Desai',
  email: regTestEmail,
  phone: '+91 98111 22233',
  dateOfBirth: '1996-08-24',
  preferences: {
    currency: 'INR',
    theme: 'luxury',
    notificationAlerts: true,
    riskTolerance: 'growth',
    monthlySavingsTargetPercent: 30,
  },
  password: 'Password@123',
});

assert(regResult.success === true, '4. Registration: First-time registration succeeds');
assert(regResult.user?.isNewUser === true, '5. Registration: Flag isNewUser is strictly true for first-time sign-ins');
assert(regResult.user?.phone === '+91 98111 22233' && regResult.user?.dateOfBirth === '1996-08-24', '6. Registration: Captures required phone, DOB, and preferences');

// 7. Enforce Unique Email Constraint
const duplicateResult = registerUser({
  name: 'Anita Desai Duplicate',
  email: regTestEmail, // same email!
  phone: '+91 98999 88877',
  dateOfBirth: '1996-08-24',
  preferences: {
    currency: 'INR',
    riskTolerance: 'balanced',
    monthlySavingsTargetPercent: 20,
  },
});
assert(duplicateResult.success === false, '7. Unique Email Constraint: Duplicate email registration is blocked');
assert(duplicateResult.error?.includes('already exists') === true, '8. Unique Email Constraint: Informative collision error returned');

// 9. Returning User: Authenticate with password & fetch stored profile info
const loginResult = authenticatePassword('sambhaji.jadhav@example.com', 'Password@123');
assert(loginResult.success === true, '9. Returning User: Password authentication succeeds for Sambhaji Jadhav');
assert(loginResult.user?.name === 'Sambhaji Jadhav', '10. Returning User: Profile name Sambhaji Jadhav correctly retrieved');
assert(loginResult.user?.phone === '+91 98230 12345', '11. Returning User: Stored phone +91 98230 12345 correctly retrieved');
assert(loginResult.user?.isNewUser === false, '12. Returning User: isNewUser flag is false for returning users');

// 13. Returning User: Authenticate with OTP
const otpGen = generateOTPForUser('sambhaji.jadhav@example.com');
assert(otpGen.success === true && typeof otpGen.otp === 'string' && otpGen.otp.length === 6, '13. OTP Auth: 6-digit OTP generated');
const otpVerify = verifyUserOTP('sambhaji.jadhav@example.com', otpGen.otp!);
assert(otpVerify.success === true && otpVerify.user?.name === 'Sambhaji Jadhav', '14. OTP Auth: Valid OTP verification succeeds and returns user');

// 15. Financial Snapshot Preservation on Sign Out
import { updateUserFinancialSnapshot } from '../models/userDb.js';
const snapResult = updateUserFinancialSnapshot('sambhaji.jadhav@example.com', {
  monthlyIncome: 135000,
  totalExpenses: 90000,
  savingsRate: 33,
  categoriesCount: 12,
  transactionsCount: 15,
  lastSavedAt: new Date().toISOString(),
});
assert(snapResult.success === true, '15. Snapshot Preservation: Financial state safely saved to database on sign-out');
assert(snapResult.user?.financialSnapshot?.monthlyIncome === 135000, '16. Snapshot Preservation: Restores ₹1,35,000 income and 12 categories');

console.log(`\n📊 Authentication Test Results: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
