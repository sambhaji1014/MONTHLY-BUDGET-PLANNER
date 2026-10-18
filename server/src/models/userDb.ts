import { UserRecord } from './types.js';

// Initial preloaded users database
export const initialUsers: UserRecord[] = [
  {
    id: 'usr_sambhaji_jadhav',
    email: 'sambhaji.jadhav@example.com',
    name: 'Sambhaji Jadhav',
    phone: '+91 98230 12345',
    dateOfBirth: '1992-06-15',
    password: 'Password@123',
    preferences: {
      currency: 'INR',
      theme: 'luxury',
      notificationAlerts: true,
      riskTolerance: 'growth',
      monthlySavingsTargetPercent: 25,
    },
    isNewUser: false,
    financialSnapshot: {
      monthlyIncome: 120000,
      totalExpenses: 87000,
      savingsRate: 27,
      categoriesCount: 11,
      transactionsCount: 10,
      lastSavedAt: '2026-10-18T09:30:00.000Z',
    },
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLoginAt: '2026-10-18T09:30:00.000Z',
  },
  {
    id: 'usr_jadhav_wealthwise',
    email: 'jadhav@wealthwise.com',
    name: 'Sambhaji Jadhav',
    phone: '+91 98230 12345',
    dateOfBirth: '1992-06-15',
    password: 'Password@123',
    preferences: {
      currency: 'INR',
      theme: 'luxury',
      notificationAlerts: true,
      riskTolerance: 'growth',
      monthlySavingsTargetPercent: 30,
    },
    isNewUser: false,
    financialSnapshot: {
      monthlyIncome: 120000,
      totalExpenses: 87000,
      savingsRate: 27,
      categoriesCount: 11,
      transactionsCount: 10,
      lastSavedAt: '2026-10-17T14:20:00.000Z',
    },
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLoginAt: '2026-10-17T14:20:00.000Z',
  },
  {
    id: 'usr_priya_sharma',
    email: 'priya.sharma@example.com',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    dateOfBirth: '1995-11-20',
    password: 'Password@123',
    preferences: {
      currency: 'INR',
      theme: 'luxury',
      notificationAlerts: true,
      riskTolerance: 'balanced',
      monthlySavingsTargetPercent: 20,
    },
    isNewUser: false,
    financialSnapshot: {
      monthlyIncome: 85000,
      totalExpenses: 62000,
      savingsRate: 27,
      categoriesCount: 8,
      transactionsCount: 6,
      lastSavedAt: '2026-10-16T11:00:00.000Z',
    },
    createdAt: '2026-03-15T09:00:00.000Z',
    lastLoginAt: '2026-10-16T11:00:00.000Z',
  },
];

// In-memory database of registered users
let usersDatabase: UserRecord[] = [...initialUsers];

// Normalized helper
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Check if email exists in database
 */
export const findUserByEmail = (email: string): UserRecord | undefined => {
  const norm = normalizeEmail(email);
  return usersDatabase.find((u) => normalizeEmail(u.email) === norm);
};

/**
 * Register a brand new user with unique email constraint
 */
export const registerUser = (userData: {
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: UserRecord['preferences'];
  password?: string;
  financialSnapshot?: UserRecord['financialSnapshot'];
}): { success: boolean; user?: UserRecord; error?: string } => {
  const normEmail = normalizeEmail(userData.email);

  // Constraint check: enforce uniqueness
  if (findUserByEmail(normEmail)) {
    return {
      success: false,
      error: `An account with email '${normEmail}' already exists. Please sign in instead.`,
    };
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normEmail,
    name: userData.name.trim(),
    phone: userData.phone?.trim() || '+91 98000 00000',
    dateOfBirth: userData.dateOfBirth || '1995-01-01',
    preferences: userData.preferences || {
      currency: 'INR',
      theme: 'luxury',
      notificationAlerts: true,
      riskTolerance: 'balanced',
      monthlySavingsTargetPercent: 20,
    },
    password: userData.password || 'WealthWise@2026',
    isNewUser: true, // First-time sign-in flag
    financialSnapshot: userData.financialSnapshot || {
      monthlyIncome: 120000,
      totalExpenses: 0,
      savingsRate: 20,
      categoriesCount: 6,
      transactionsCount: 0,
      lastSavedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: undefined,
  };

  usersDatabase.push(newUser);
  return { success: true, user: newUser };
};

/**
 * Update user's saved financial snapshot (called on sign-out / auto-save)
 */
export const updateUserFinancialSnapshot = (
  email: string,
  snapshot: NonNullable<UserRecord['financialSnapshot']>
): { success: boolean; user?: UserRecord; error?: string } => {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User does not exist with this email address.' };
  }

  user.financialSnapshot = snapshot;
  return { success: true, user };
};

/**
 * Authenticate returning user with password
 */
export const authenticatePassword = (
  email: string,
  passwordAttempt: string
): { success: boolean; user?: UserRecord; error?: string } => {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User does not exist with this email address.' };
  }

  // Check password (simple comparison for mock database, accepts any test password if default)
  if (user.password && user.password !== passwordAttempt && passwordAttempt !== 'Password@123' && passwordAttempt !== 'WealthWise@2026') {
    return { success: false, error: 'Incorrect passphrase. Please try again or authenticate using OTP.' };
  }

  // Update last login & flag
  user.lastLoginAt = new Date().toISOString();
  // Returning user authenticated, isNewUser becomes false upon returning
  const responseUser = { ...user };
  user.isNewUser = false;

  return { success: true, user: responseUser };
};

/**
 * Generate 6-digit OTP for email/phone login
 */
export const generateOTPForUser = (email: string): { success: boolean; otp?: string; error?: string } => {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otp;

  return { success: true, otp };
};

/**
 * Verify OTP code
 */
export const verifyUserOTP = (
  email: string,
  otpCode: string
): { success: boolean; user?: UserRecord; error?: string } => {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User does not exist.' };
  }

  // Accept generated OTP or universal test OTP 123456
  if (user.otpCode !== otpCode && otpCode !== '123456') {
    return { success: false, error: 'Invalid or expired OTP code. Please enter the 6-digit verification code.' };
  }

  // Clear OTP after successful verification
  user.otpCode = undefined;
  user.lastLoginAt = new Date().toISOString();
  const responseUser = { ...user };
  user.isNewUser = false;

  return { success: true, user: responseUser };
};

/**
 * List all users (admin / debug helper)
 */
export const getAllUsers = (): UserRecord[] => {
  return usersDatabase;
};
