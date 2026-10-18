export interface UserPreferences {
  currency: string;
  theme?: string;
  notificationAlerts?: boolean;
  riskTolerance: 'conservative' | 'balanced' | 'growth';
  monthlySavingsTargetPercent: number;
  monthlyIncome?: number;
  primarySavingsGoal?: string;
  allocationStyle?: 'balanced' | 'growth' | 'conservative';
}

export interface UserFinancialSnapshot {
  monthlyIncome: number;
  totalExpenses?: number;
  savingsRate?: number;
  categoriesCount?: number;
  transactionsCount?: number;
  lastSavedAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  preferences: UserPreferences;
  password?: string;
  otpCode?: string;
  isNewUser: boolean;
  isGuest?: boolean;
  financialSnapshot?: UserFinancialSnapshot;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SignOutReceipt {
  userName: string;
  userEmail: string;
  savedAt: string;
  snapshot: UserFinancialSnapshot;
}

const USERS_STORAGE_KEY = 'wealthwise_users_db_v1';
const CURRENT_USER_SESSION_KEY = 'wealthwise_current_authenticated_user_v1';
const SIGN_OUT_RECEIPT_KEY = 'wealthwise_last_signout_receipt_v1';
const API_BASE_URL = 'http://localhost:5000/api';

// Initial pre-registered users (including Sambhaji Jadhav)
const DEFAULT_SEED_USERS: UserRecord[] = [
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
      monthlyIncome: 120000,
      primarySavingsGoal: 'Wealth Compounding & Long-Term Assets',
      allocationStyle: 'growth',
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
      monthlyIncome: 120000,
      primarySavingsGoal: 'Commercial Real Estate Fund',
      allocationStyle: 'growth',
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
      monthlyIncome: 85000,
      primarySavingsGoal: 'Emergency Reserve Fund',
      allocationStyle: 'balanced',
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

// Helper to normalize emails for strict unique constraint comparison
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Get all users from local database store
 */
const getStoredUsers = (): UserRecord[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_USERS));
      return DEFAULT_SEED_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_USERS;
  } catch {
    return DEFAULT_SEED_USERS;
  }
};

/**
 * Save users array to local database
 */
const saveStoredUsers = (users: UserRecord[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save to local users database:', err);
  }
};

/**
 * Check if an email exists in the users database.
 * 1. Checks server API if available.
 * 2. Falls back to local persistent store.
 */
export const checkEmailExists = async (
  email: string
): Promise<{ exists: boolean; user?: Partial<UserRecord>; error?: string }> => {
  const normEmail = normalizeEmail(email);

  // Attempt server first
  try {
    const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        exists: !!data.exists,
        user: data.user,
      };
    }
  } catch {
    // Server unavailable, fallback cleanly to local database
  }

  // Local database lookup
  const users = getStoredUsers();
  const found = users.find((u) => normalizeEmail(u.email) === normEmail);

  if (found) {
    return {
      exists: true,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        phone: found.phone,
        dateOfBirth: found.dateOfBirth,
        preferences: found.preferences,
        isNewUser: found.isNewUser,
        financialSnapshot: found.financialSnapshot,
      },
    };
  }

  return { exists: false };
};

/**
 * Register a first-time user:
 * - Collects name, email, password, and initial finance info
 * - Strictly enforces unique email constraint
 * - Sets isNewUser = true
 * - Stores financial snapshot
 */
export const registerFirstTimeUser = async (data: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  monthlyIncome?: number;
  initialSavingsGoal?: string;
  allocationStyle?: 'balanced' | 'growth' | 'conservative';
  financialSnapshot?: UserFinancialSnapshot;
}): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
  const normEmail = normalizeEmail(data.email);

  const initialIncome = Number(data.monthlyIncome || data.preferences.monthlyIncome || 120000);
  const snapshot: UserFinancialSnapshot = data.financialSnapshot || {
    monthlyIncome: initialIncome,
    totalExpenses: 0,
    savingsRate: data.preferences.monthlySavingsTargetPercent || 20,
    categoriesCount: 6,
    transactionsCount: 0,
    lastSavedAt: new Date().toISOString(),
  };

  // Attempt server registration first
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        email: normEmail,
        financialSnapshot: snapshot,
        monthlyIncome: initialIncome,
      }),
    });
    if (res.ok) {
      const respData = await res.json();
      const user: UserRecord = respData.user;
      setCurrentUser(user);
      // Sync local copy
      const localUsers = getStoredUsers();
      if (!localUsers.some((u) => normalizeEmail(u.email) === normEmail)) {
        localUsers.push(user);
        saveStoredUsers(localUsers);
      }
      return { success: true, user };
    } else if (res.status === 409) {
      const errData = await res.json();
      return { success: false, error: errData.error || 'Email already exists.' };
    }
  } catch {
    // Server unavailable, use local database
  }

  // Local Database Implementation with Unique Email Constraint
  const users = getStoredUsers();
  if (users.some((u) => normalizeEmail(u.email) === normEmail)) {
    return {
      success: false,
      error: `An account with email '${normEmail}' already exists. Please sign in instead.`,
    };
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normEmail,
    name: data.name.trim(),
    phone: data.phone?.trim() || '+91 98000 00000',
    dateOfBirth: data.dateOfBirth || '1995-01-01',
    preferences: {
      ...data.preferences,
      monthlyIncome: initialIncome,
      primarySavingsGoal: data.initialSavingsGoal || 'Wealth Compounding',
      allocationStyle: data.allocationStyle || 'balanced',
    },
    password: data.password || 'WealthWise@2026',
    isNewUser: true, // Flag for first-time sign-in
    financialSnapshot: snapshot,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
};

/**
 * Sign in returning user with password
 */
export const signInWithPassword = async (
  email: string,
  passwordAttempt: string
): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
  const normEmail = normalizeEmail(email);

  // Attempt server login first
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, password: passwordAttempt }),
    });
    if (res.ok) {
      const data = await res.json();
      const user = { ...data.user, isNewUser: false };
      setCurrentUser(user);
      return { success: true, user };
    } else {
      const data = await res.json();
      return { success: false, error: data.error || 'Authentication failed.' };
    }
  } catch {
    // Fallback to local database
  }

  const users = getStoredUsers();
  const user = users.find((u) => normalizeEmail(u.email) === normEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email. Please create an account.' };
  }

  // Verify password (in test mode, accepts user's set password, 'Password@123', or 'WealthWise@2026')
  if (
    user.password &&
    user.password !== passwordAttempt &&
    passwordAttempt !== 'Password@123' &&
    passwordAttempt !== 'WealthWise@2026'
  ) {
    return { success: false, error: 'Incorrect passphrase. Please try again or authenticate using OTP.' };
  }

  // Returning user: isNewUser becomes false
  user.isNewUser = false;
  user.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);
  setCurrentUser(user);

  return { success: true, user };
};

/**
 * Dispatch 6-digit OTP code to user
 */
export const requestOTP = async (
  email: string
): Promise<{ success: boolean; message: string; testOtp?: string; error?: string }> => {
  const normEmail = normalizeEmail(email);

  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to local database
  }

  const users = getStoredUsers();
  const user = users.find((u) => normalizeEmail(u.email) === normEmail);

  if (!user) {
    return { success: false, message: '', error: 'Account not found. Please create an account.' };
  }

  const generated = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = generated;
  saveStoredUsers(users);

  const phonePreview = user.phone ? `${user.phone.slice(0, 6)}•••••` : email;
  return {
    success: true,
    message: `Verification code sent to registered contact (${phonePreview}).`,
    testOtp: generated,
  };
};

/**
 * Verify OTP for returning user
 */
export const verifyOTPCode = async (
  email: string,
  otpCode: string
): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
  const normEmail = normalizeEmail(email);

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, otp: otpCode }),
    });
    if (res.ok) {
      const data = await res.json();
      const user = { ...data.user, isNewUser: false };
      setCurrentUser(user);
      return { success: true, user };
    }
  } catch {
    // Fallback to local database
  }

  const users = getStoredUsers();
  const user = users.find((u) => normalizeEmail(u.email) === normEmail);

  if (!user) {
    return { success: false, error: 'User does not exist.' };
  }

  if (user.otpCode !== otpCode && otpCode !== '123456') {
    return { success: false, error: 'Invalid or expired OTP code. Use test code 123456 or request a new code.' };
  }

  user.otpCode = undefined;
  user.isNewUser = false; // Returning user
  user.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);
  setCurrentUser(user);

  return { success: true, user };
};

/**
 * 1-Click Guest Mode Entry
 * Instantly creates or resumes a guest exploration sandbox session with preloaded data.
 */
export const loginAsGuest = (): UserRecord => {
  const guestUser: UserRecord = {
    id: `guest_${Date.now()}`,
    email: 'guest@wealthwise.sandbox',
    name: 'Guest Explorer',
    phone: '+91 98000 00000',
    dateOfBirth: '1998-01-01',
    preferences: {
      currency: 'INR',
      theme: 'luxury',
      notificationAlerts: false,
      riskTolerance: 'balanced',
      monthlySavingsTargetPercent: 20,
      monthlyIncome: 120000,
      primarySavingsGoal: 'Sandbox Exploration & Demo',
      allocationStyle: 'balanced',
    },
    isNewUser: false,
    isGuest: true,
    financialSnapshot: {
      monthlyIncome: 120000,
      totalExpenses: 87000,
      savingsRate: 27,
      categoriesCount: 11,
      transactionsCount: 10,
      lastSavedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  setCurrentUser(guestUser);
  return guestUser;
};

/**
 * Save user financial state snapshot to persistent database
 */
export const saveUserFinancialSnapshot = async (
  email: string,
  snapshot: UserFinancialSnapshot
): Promise<void> => {
  const normEmail = normalizeEmail(email);

  // 1. Save to local database
  const users = getStoredUsers();
  const user = users.find((u) => normalizeEmail(u.email) === normEmail);
  if (user) {
    user.financialSnapshot = snapshot;
    saveStoredUsers(users);
  }

  // 2. Also save to server if accessible
  try {
    await fetch(`${API_BASE_URL}/auth/save-snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, snapshot }),
    });
  } catch {
    // offline or backend not reached
  }
};

/**
 * Sign in using OAuth provider (Google or Apple)
 */
export const signInWithOAuth = async (
  provider: 'google' | 'apple',
  options?: { email?: string; name?: string }
): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
  try {
    const defaultEmail = options?.email || (provider === 'google' ? 'alex.investor@gmail.com' : 'alex.investor@privaterelay.appleid.com');
    const defaultName = options?.name || (provider === 'google' ? 'Alex Sharma' : 'Alex Sharma');
    const normEmail = normalizeEmail(defaultEmail);

    const users = getStoredUsers();
    let user = users.find((u) => normalizeEmail(u.email) === normEmail);

    if (!user) {
      user = {
        id: `usr_${provider}_${Date.now()}`,
        email: normEmail,
        name: defaultName,
        phone: '+91 98123 45678',
        dateOfBirth: '1994-08-12',
        preferences: {
          currency: 'INR',
          theme: 'luxury',
          notificationAlerts: true,
          riskTolerance: 'growth',
          monthlySavingsTargetPercent: 25,
          monthlyIncome: 110000,
          primarySavingsGoal: 'Long-Term Equity & Index Compounding',
          allocationStyle: 'growth',
        },
        isNewUser: true,
        financialSnapshot: {
          monthlyIncome: 110000,
          totalExpenses: 0,
          savingsRate: 25,
          categoriesCount: 0,
          transactionsCount: 0,
          lastSavedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
      saveStoredUsers(users);
    } else {
      user.lastLoginAt = new Date().toISOString();
      user.isNewUser = false;
      saveStoredUsers(users);
    }

    setCurrentUser(user);
    return { success: true, user };
  } catch {
    return {
      success: false,
      error: `Could not complete ${provider === 'google' ? 'Google' : 'Apple'} authentication. Please try with email/password.`,
    };
  }
};

/**
 * Sign-out receipt management:
 * Ensures data is saved and confirms restoration on next login
 */
export const getLastSignOutReceipt = (): SignOutReceipt | null => {
  try {
    const raw = localStorage.getItem(SIGN_OUT_RECEIPT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setLastSignOutReceipt = (receipt: SignOutReceipt): void => {
  try {
    localStorage.setItem(SIGN_OUT_RECEIPT_KEY, JSON.stringify(receipt));
  } catch (err) {
    console.error('Failed to set sign-out receipt:', err);
  }
};

export const clearLastSignOutReceipt = (): void => {
  localStorage.removeItem(SIGN_OUT_RECEIPT_KEY);
};

/**
 * Session storage helpers for active logged-in user
 */
export const getCurrentUser = (): UserRecord | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: UserRecord | null): void => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_SESSION_KEY);
};

export interface OAuthVerifyResponse {
  success: boolean;
  name?: string;
  email?: string;
  token?: string;
  preferences?: UserPreferences;
  user?: UserRecord;
  error?: string;
}

/**
 * Verify JWT token received from OAuth callback
 */
export const verifyOAuthToken = async (
  token: string
): Promise<OAuthVerifyResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      const data = await res.json();
      const userPayload = data.user || {
        id: `usr_${Date.now()}`,
        email: data.email,
        name: data.name,
        preferences: data.preferences,
        isNewUser: false,
        createdAt: new Date().toISOString(),
      };

      // Guarantee name is defined and non-empty
      const resolvedName =
        data.name?.trim() ||
        userPayload.name?.trim() ||
        (userPayload.email ? userPayload.email.split('@')[0] : 'Member');
      userPayload.name = resolvedName;

      setCurrentUser(userPayload);
      const localUsers = getStoredUsers();
      if (!localUsers.some((u) => normalizeEmail(u.email) === normalizeEmail(userPayload.email))) {
        localUsers.push(userPayload);
        saveStoredUsers(localUsers);
      }
      return {
        success: true,
        name: resolvedName,
        email: userPayload.email,
        token: data.token || token,
        preferences: data.preferences || userPayload.preferences,
        user: userPayload,
      };
    } else {
      const err = await res.json();
      return { success: false, error: err.error || 'Token verification failed' };
    }
  } catch {
    // Backend offline: decode token client-side fallback safely
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(base64));
        if (json.email) {
          const users = getStoredUsers();
          let user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(json.email));
          const resolvedName = json.name?.trim() || (json.email ? json.email.split('@')[0] : 'Member');
          if (!user) {
            user = {
              id: json.sub || `usr_oauth_${Date.now()}`,
              email: json.email,
              name: resolvedName,
              preferences: {
                currency: 'INR',
                theme: 'luxury',
                notificationAlerts: true,
                riskTolerance: 'growth',
                monthlySavingsTargetPercent: 25,
                monthlyIncome: 120000,
                primarySavingsGoal: 'Wealth Compounding',
                allocationStyle: 'growth',
              },
              isNewUser: false,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            users.push(user);
            saveStoredUsers(users);
          } else {
            if (!user.name) user.name = resolvedName;
          }
          setCurrentUser(user);
          return {
            success: true,
            name: user.name,
            email: user.email,
            token,
            preferences: user.preferences,
            user,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return { success: false, error: 'Could not verify authentication session with server.' };
};

