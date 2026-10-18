import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCategories, initialTransactions, initialGoals, initialBills, getSeedUserData } from '../data/sampleData';
import { runClientOptimizer, OptimizationResponse, OptimizationStrategy } from '../services/optimizer';
import { calculateBudgetHealthScore, calculateMonthEndForecast, calculateCategoryActualSpent } from '../utils/financialCalculations';
import {
  getCurrentUser,
  clearCurrentUser,
  setCurrentUser,
  saveUserFinancialSnapshot,
  setLastSignOutReceipt,
  UserRecord,
  UserPreferences,
  UserFinancialSnapshot,
} from '../services/authService';
import {
  fetchUserFullSync,
  saveUserFullSync,
  apiRecordTransaction,
  apiDeleteTransaction,
  apiUpdateCategory,
  apiUpdateMonthlyIncome,
  apiCreateBill,
  apiToggleBillPaid,
  apiCreateGoal,
  apiContributeGoal,
} from '../services/api';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryType: 'need' | 'want' | 'savings' | 'debt';
  date: string;
  paymentMethod: string;
  isRecurring: boolean;
  notes?: string;
  note?: string; // Central transaction schema requirement: { id, date, category, amount, type, note }
  tags?: string[];
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'need' | 'want' | 'savings' | 'debt';
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
  isLocked?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  monthlyContributionRequired: number;
  color: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface BillSubscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  dueDate: string;
  category: string;
  paymentMethod: string;
  isAutoDebit: boolean;
  status: 'upcoming' | 'paid' | 'overdue';
  lastPaidDate?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: UserPreferences;
  monthlyIncome: number;
  isOnboarded: boolean;
  isNewUser: boolean; // Flag to distinguish first-time sign-in vs returning user
  isGuest?: boolean;
  financialSnapshot?: UserFinancialSnapshot;
  dashboardMode: 'beginner' | 'advanced';
  createdAt: string;
  lastLoginAt?: string;
}

export interface OnboardingData {
  name: string;
  monthlyIncome: number;
  fixedExpenses: {
    rent: number;
    utilities: number;
    subscriptions: number;
  };
  variableExpenses: {
    groceries: number;
    travel: number;
    shopping: number;
  };
  savingsGoal: {
    title: string;
    targetAmount: number;
    alreadySaved: number;
    targetMonths?: number;
  };
}

export interface UserContextState {
  name: string;
  email: string;
  token: string | null;
  preferences?: UserPreferences;
}

interface FinanceContextType {
  // Task 3: User context initialized with default empty values { name: '', email: '', token: null }
  user: UserContextState;
  isUserLoading: boolean;
  refetchUser: () => Promise<void>;

  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  dashboardMode: 'beginner' | 'advanced';
  setDashboardMode: (mode: 'beginner' | 'advanced') => void;
  monthlyIncome: number;
  setMonthlyIncome: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'> | (Partial<Transaction> & { category: string; amount: number; type: TransactionType; date?: string; note?: string; notes?: string })) => void;
  deleteTransaction: (id: string) => void;
  categories: BudgetCategory[];
  updateCategoryBudget: (id: string, newAmount: number) => void;
  toggleCategoryLock: (id: string) => void;
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'isCompleted'>) => void;
  updateGoalProgress: (id: string, addedAmount: number) => void;
  deleteGoal: (id: string) => void;
  bills: BillSubscription[];
  toggleBillPaid: (id: string) => void;
  addBill: (bill: Omit<BillSubscription, 'id' | 'status'>) => void;
  deleteBill: (id: string) => void;
  activeOptimization: OptimizationResponse | null;
  runOptimizer: (strategy?: OptimizationStrategy) => OptimizationResponse;
  applyOptimizedBudget: (response: OptimizationResponse) => void;
  completeOnboarding: (data: OnboardingData) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
  loginUser: (user: UserRecord) => void | Promise<void>;
  signOut: () => void;
  
  // Restored session notification
  restorationNotice: string | null;
  dismissRestorationNotice: () => void;
  
  // Computed values
  totalExpenses: number;
  totalIncome: number;
  totalBudgetAllocated: number;
  remainingIncome: number;
  savingsRate: number;
  budgetHealthScore: number;
  budgetHealthRating: string;
  budgetHealthSummary: string;
  budgetHealthInsights: string[];
  monthEndForecast: ReturnType<typeof calculateMonthEndForecast>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/**
 * Returns a user-specific storage key to guarantee complete data isolation between accounts.
 * E.g. 'wealthwise_user_data_sambhaji.jadhav@example.com'
 */
export const getUserDataStorageKey = (email?: string, id?: string): string => {
  if (!email && !id) return 'wealthwise_user_data_guest_sandbox';
  const clean = (email || id || 'guest').trim().toLowerCase();
  return `wealthwise_user_data_${clean}`;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state keyed by active user, preventing cross-contamination (Requirement 1)
  const activeUser = getCurrentUser();
  const activeKey = activeUser ? getUserDataStorageKey(activeUser.email, activeUser.id) : null;

  const initialLoadedData = (() => {
    if (activeKey) {
      try {
        const item = localStorage.getItem(activeKey);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed && typeof parsed === 'object') {
            if (parsed.userProfile && typeof parsed.userProfile === 'object') {
              parsed.userProfile.name = parsed.userProfile.name || (activeUser?.name) || 'Member';
              return parsed;
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // No saved user data in storage yet -> check seed data
    const seed = getSeedUserData(activeUser?.email);
    return {
      userProfile: activeUser
        ? {
            id: activeUser.id,
            name: activeUser.name || 'Member',
            email: activeUser.email,
            phone: activeUser.phone,
            dateOfBirth: activeUser.dateOfBirth,
            preferences: activeUser.preferences,
            monthlyIncome: seed.monthlyIncome,
            isOnboarded: seed.isOnboarded,
            isNewUser: activeUser.isNewUser ?? !seed.isOnboarded,
            isGuest: !!activeUser.isGuest,
            dashboardMode: 'beginner' as const,
            createdAt: activeUser.createdAt,
            lastLoginAt: activeUser.lastLoginAt,
          }
        : {
            id: 'usr_sambhaji_jadhav',
            name: 'Sambhaji Jadhav',
            email: 'sambhaji.jadhav@example.com',
            phone: '+91 98230 12345',
            dateOfBirth: '1992-06-15',
            preferences: {
              currency: 'INR',
              theme: 'luxury',
              notificationAlerts: true,
              riskTolerance: 'growth' as const,
              monthlySavingsTargetPercent: 25,
            },
            monthlyIncome: 120000,
            isOnboarded: true,
            isNewUser: false,
            dashboardMode: 'beginner' as const,
            createdAt: '2026-01-10T08:00:00.000Z',
            lastLoginAt: '2026-10-18T09:30:00.000Z',
          },
      monthlyIncome: seed.monthlyIncome,
      transactions: seed.transactions,
      categories: seed.categories,
      goals: seed.goals,
      bills: seed.bills,
    };
  })();

  // Task 3: Initialize user context with default empty values: { name: '', email: '', token: null }
  const [user, setUser] = useState<UserContextState>({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    token: null,
    preferences: activeUser?.preferences,
  });
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);

  const refetchUser = async () => {
    setIsUserLoading(true);
    try {
      const active = getCurrentUser();
      if (active) {
        const safeName = active.name || (active.email ? active.email.split('@')[0] : 'Member');
        setUser({
          name: safeName,
          email: active.email || '',
          token: localStorage.getItem('wealthwise_auth_token') || null,
          preferences: active.preferences,
        });
        setUserProfile((prev) => ({
          ...prev,
          name: safeName,
          email: active.email || prev?.email,
        }));
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(() => initialLoadedData.userProfile);
  const [dashboardMode, setDashboardModeState] = useState<'beginner' | 'advanced'>(
    () => initialLoadedData.userProfile?.dashboardMode || 'beginner'
  );

  const [restorationNotice, setRestorationNotice] = useState<string | null>(null);
  const dismissRestorationNotice = () => setRestorationNotice(null);

  const [monthlyIncome, setMonthlyIncomeState] = useState<number>(() => initialLoadedData.monthlyIncome);
  const [transactions, setTransactions] = useState<Transaction[]>(() => initialLoadedData.transactions);
  const [categories, setCategories] = useState<BudgetCategory[]>(() => initialLoadedData.categories);
  const [goals, setGoals] = useState<SavingsGoal[]>(() => initialLoadedData.goals);
  const [bills, setBills] = useState<BillSubscription[]>(() => initialLoadedData.bills);

  const [activeOptimization, setActiveOptimization] = useState<OptimizationResponse | null>(null);
  const [isCloudSyncReady, setIsCloudSyncReady] = useState<boolean>(false);

  const setDashboardMode = (mode: 'beginner' | 'advanced') => {
    setDashboardModeState(mode);
    setUserProfile((prev) => ({ ...prev, dashboardMode: mode }));
  };

  const setMonthlyIncome = (amount: number) => {
    setMonthlyIncomeState(amount);
    setUserProfile((prev) => ({ ...prev, monthlyIncome: amount }));
    setIsCloudSyncReady(true);
    apiUpdateMonthlyIncome(amount);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    if (updates.monthlyIncome !== undefined) {
      setMonthlyIncomeState(updates.monthlyIncome);
      apiUpdateMonthlyIncome(updates.monthlyIncome);
    }
    if (updates.dashboardMode !== undefined) {
      setDashboardModeState(updates.dashboardMode);
    }
    setIsCloudSyncReady(true);
  };

  // Cross-browser cloud restoration on initial mount or when user changes
  useEffect(() => {
    let isCancelled = false;
    const emailOrId = userProfile.email || userProfile.id || activeUser?.email || activeUser?.id;
    if (!emailOrId) {
      setIsCloudSyncReady(true);
      return;
    }

    fetchUserFullSync(emailOrId).then((cloudData) => {
      if (isCancelled) return;

      if (cloudData) {
        if (cloudData.categories && cloudData.categories.length > 0) {
          setCategories(cloudData.categories);
        }
        if (cloudData.transactions) {
          setTransactions(cloudData.transactions);
        }
        if (cloudData.goals) {
          setGoals(cloudData.goals);
        }
        if (cloudData.bills) {
          setBills(cloudData.bills);
        }
        if (cloudData.monthlyIncome && cloudData.monthlyIncome > 0) {
          setMonthlyIncomeState(cloudData.monthlyIncome);
        }
        if (cloudData.userProfile) {
          setUserProfile((prev) => ({
            ...prev,
            ...cloudData.userProfile,
            name: cloudData.userProfile.name || prev.name,
            email: cloudData.userProfile.email || prev.email,
            isOnboarded: cloudData.userProfile.isOnboarded ?? prev.isOnboarded,
          }));
        }
      }
      setIsCloudSyncReady(true);
    });

    return () => {
      isCancelled = true;
    };
  }, [userProfile.email, userProfile.id]);

  // Sync state to local storage AND to server database for cross-browser restoration
  useEffect(() => {
    if (!userProfile.email && !userProfile.id) return;
    const userKey = getUserDataStorageKey(userProfile.email, userProfile.id);
    const payload = {
      userProfile,
      monthlyIncome,
      transactions,
      categories,
      goals,
      bills,
      email: userProfile.email,
      userId: userProfile.id,
    };

    // 1. Instant local storage cache
    try {
      localStorage.setItem(userKey, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save user data locally:', err);
    }

    // 2. Debounced background cloud sync to server
    if (!isCloudSyncReady && !userProfile.isOnboarded) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveUserFullSync(payload);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userProfile, monthlyIncome, transactions, categories, goals, bills, isCloudSyncReady]);

  // Dynamic calculation: Derive active category envelopes with real-time 'Actual Spent'
  // by filtering and summing 'expense' transactions matching each category and the current month.
  const categoriesWithActuals = React.useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      spentAmount: calculateCategoryActualSpent(cat.name, transactions),
    }));
  }, [categories, transactions]);

  // Derived financial metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || monthlyIncome;

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudgetAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const remainingIncome = monthlyIncome - totalExpenses;

  const totalSavingsSpend = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? Math.round((totalSavingsSpend / monthlyIncome) * 100) : 0;

  const needsSpent = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'need')
    .reduce((sum, t) => sum + t.amount, 0);
  const needsRatio = monthlyIncome > 0 ? Math.round((needsSpent / monthlyIncome) * 100) : 0;

  const debtSpent = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);
  const debtToIncomeRatio = monthlyIncome > 0 ? Math.round((debtSpent / monthlyIncome) * 100) : 0;

  const overspentCount = categoriesWithActuals.filter((c) => c.spentAmount > c.allocatedAmount).length;

  const health = calculateBudgetHealthScore({
    savingsRate: savingsRate || (monthlyIncome > totalExpenses ? 20 : 5),
    needsRatio: needsRatio || 45,
    debtToIncomeRatio: debtToIncomeRatio || 5,
    hasEmergencyFund: goals.some((g) => g.currentAmount > 20000),
    overspendingCategoriesCount: overspentCount,
  });

  // Month-end forecast
  const upcomingBillsTotal = bills
    .filter((b) => b.status === 'upcoming')
    .reduce((sum, b) => sum + b.amount, 0);

  const daysRemaining = Math.max(1, 31 - new Date().getDate());
  const monthEndForecast = calculateMonthEndForecast({
    currentBalance: Math.max(0, remainingIncome),
    expectedRemainingIncome: 0,
    upcomingScheduledBills: upcomingBillsTotal,
    projectedDailyDiscretionary: Math.max(200, Math.round(remainingIncome / Math.max(1, daysRemaining * 1.5))),
    daysRemainingInMonth: daysRemaining,
  });

  // Complete Onboarding with User's real input (NO hardcoded data)
  const completeOnboarding = (data: OnboardingData) => {
    const totalFixed = data.fixedExpenses.rent + data.fixedExpenses.utilities + data.fixedExpenses.subscriptions;
    const totalVariable = data.variableExpenses.groceries + data.variableExpenses.travel + data.variableExpenses.shopping;
    const estimatedSavings = Math.max(0, data.monthlyIncome - totalFixed - totalVariable);

    // Dynamic Categories tailored to the user's answers
    const dynamicCategories: BudgetCategory[] = [
      {
        id: 'cat-rent',
        name: 'Rent & Housing',
        type: 'need',
        allocatedAmount: data.fixedExpenses.rent,
        spentAmount: data.fixedExpenses.rent,
        color: '#C5A15B',
        icon: 'Home',
        isLocked: true,
      },
      {
        id: 'cat-utilities',
        name: 'Bills & Utilities',
        type: 'need',
        allocatedAmount: data.fixedExpenses.utilities,
        spentAmount: Math.round(data.fixedExpenses.utilities * 0.5),
        color: '#6A7F94',
        icon: 'Zap',
      },
      {
        id: 'cat-groceries',
        name: 'Groceries & Food',
        type: 'need',
        allocatedAmount: data.variableExpenses.groceries,
        spentAmount: Math.round(data.variableExpenses.groceries * 0.4),
        color: '#4E775B',
        icon: 'ShoppingBag',
      },
      {
        id: 'cat-travel',
        name: 'Travel & Commute',
        type: 'need',
        allocatedAmount: data.variableExpenses.travel,
        spentAmount: Math.round(data.variableExpenses.travel * 0.35),
        color: '#88929A',
        icon: 'Car',
      },
      {
        id: 'cat-shopping',
        name: 'Shopping & Leisure',
        type: 'want',
        allocatedAmount: data.variableExpenses.shopping,
        spentAmount: Math.round(data.variableExpenses.shopping * 0.3),
        color: '#D99AA6',
        icon: 'Coffee',
      },
      {
        id: 'cat-subscriptions',
        name: 'Subscriptions & Entertainment',
        type: 'want',
        allocatedAmount: data.fixedExpenses.subscriptions,
        spentAmount: data.fixedExpenses.subscriptions,
        color: '#A080C0',
        icon: 'Film',
      },
      {
        id: 'cat-savings',
        name: 'Target Savings & Fund',
        type: 'savings',
        allocatedAmount: estimatedSavings,
        spentAmount: estimatedSavings > 0 ? Math.round(estimatedSavings * 0.5) : 0,
        color: '#3A6046',
        icon: 'TrendingUp',
      },
    ];

    // Dynamic Goals
    const targetMonths = data.savingsGoal.targetMonths || 12;
    const dynamicGoals: SavingsGoal[] = [
      {
        id: 'goal-primary',
        title: data.savingsGoal.title || 'Emergency Buffer Fund',
        targetAmount: data.savingsGoal.targetAmount || 100000,
        currentAmount: data.savingsGoal.alreadySaved || 0,
        targetDate: new Date(Date.now() + targetMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Savings',
        monthlyContributionRequired: Math.max(1000, Math.round(Math.max(0, (data.savingsGoal.targetAmount || 100000) - (data.savingsGoal.alreadySaved || 0)) / targetMonths)),
        color: '#C5A15B',
        isCompleted: (data.savingsGoal.alreadySaved || 0) >= (data.savingsGoal.targetAmount || 100000),
        priority: 'high',
      },
    ];

    // Dynamic Recurring Bills
    const dynamicBills: BillSubscription[] = [];
    if (data.fixedExpenses.utilities > 0) {
      dynamicBills.push({
        id: 'bill-util',
        name: 'Monthly Electricity & Internet',
        amount: data.fixedExpenses.utilities,
        billingCycle: 'monthly',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Utilities',
        paymentMethod: 'UPI',
        isAutoDebit: false,
        status: 'upcoming',
      });
    }
    if (data.fixedExpenses.subscriptions > 0) {
      dynamicBills.push({
        id: 'bill-sub',
        name: 'Streaming & Digital Subscriptions',
        amount: data.fixedExpenses.subscriptions,
        billingCycle: 'monthly',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Subscriptions',
        paymentMethod: 'Credit Card',
        isAutoDebit: true,
        status: 'upcoming',
      });
    }

    // Dynamic Initial Transactions
    const dynamicTransactions: Transaction[] = [
      {
        id: 'tx-salary',
        title: 'Monthly Income Credit',
        amount: data.monthlyIncome,
        type: 'income',
        category: 'Salary',
        categoryType: 'savings',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Deposit',
        isRecurring: true,
        notes: 'Monthly earnings',
        tags: ['income'],
        createdAt: new Date().toISOString(),
      },
    ];

    if (data.fixedExpenses.rent > 0) {
      dynamicTransactions.push({
        id: 'tx-rent',
        title: 'Housing & Rent Payment',
        amount: data.fixedExpenses.rent,
        type: 'expense',
        category: 'Rent & Housing',
        categoryType: 'need',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI / Bank Transfer',
        isRecurring: true,
        notes: 'Monthly shelter payment',
        tags: ['rent', 'fixed'],
        createdAt: new Date().toISOString(),
      });
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: data.name.trim() || userProfile.name || 'Friend',
      monthlyIncome: data.monthlyIncome,
      isOnboarded: true,
      isNewUser: false,
      dashboardMode: 'beginner',
    };

    setUserProfile(updatedProfile);
    setMonthlyIncomeState(data.monthlyIncome);
    setCategories(dynamicCategories);
    setGoals(dynamicGoals);
    setBills(dynamicBills);
    setTransactions(dynamicTransactions);

    // Save baseline profile immediately to user's dedicated storage key (Requirement 2)
    if (updatedProfile.email || updatedProfile.id) {
      const userKey = getUserDataStorageKey(updatedProfile.email, updatedProfile.id);
      try {
        localStorage.setItem(
          userKey,
          JSON.stringify({
            userProfile: updatedProfile,
            monthlyIncome: data.monthlyIncome,
            transactions: dynamicTransactions,
            categories: dynamicCategories,
            goals: dynamicGoals,
            bills: dynamicBills,
          })
        );
      } catch (err) {
        console.error('Failed to save baseline profile:', err);
      }

      // Synchronize newly created personal budget to cloud backend
      saveUserFullSync({
        email: updatedProfile.email,
        userId: updatedProfile.id,
        userProfile: updatedProfile,
        monthlyIncome: data.monthlyIncome,
        transactions: dynamicTransactions,
        categories: dynamicCategories,
        goals: dynamicGoals,
        bills: dynamicBills,
      });
    }

    setRestorationNotice(`Baseline monthly budget created for ${updatedProfile.name}. Welcome to your dashboard!`);
  };

  // Optional: load demo data for users who want to see a pre-filled sample portfolio
  const loadDemoData = () => {
    const demoProfile: UserProfile = {
      name: 'Demo Explorer',
      email: 'demo@wealthwise.io',
      monthlyIncome: 120000,
      isOnboarded: true,
      isNewUser: false,
      dashboardMode: 'beginner',
      createdAt: new Date().toISOString(),
    };
    setUserProfile(demoProfile);
    setMonthlyIncomeState(120000);
    setCategories(initialCategories);
    setGoals(initialGoals);
    setBills(initialBills);
    setTransactions(initialTransactions);
    setActiveOptimization(null);
  };

  const resetAllData = () => {
    if (userProfile.email || userProfile.id) {
      const userKey = getUserDataStorageKey(userProfile.email, userProfile.id);
      localStorage.removeItem(userKey);
    }
    setUserProfile({
      name: '',
      email: '',
      phone: '',
      monthlyIncome: 0,
      isOnboarded: false,
      isNewUser: false,
      isGuest: false,
      dashboardMode: 'beginner',
      createdAt: new Date().toISOString(),
    });
    setMonthlyIncomeState(0);
    setTransactions([]);
    setCategories([]);
    setGoals([]);
    setBills([]);
    setActiveOptimization(null);
  };

  const addTransaction = (
    tx: Omit<Transaction, 'id' | 'createdAt'> | (Partial<Transaction> & { category: string; amount: number; type: TransactionType; date?: string; note?: string; notes?: string })
  ) => {
    const noteText = tx.note || tx.notes || tx.title || '';
    const dateText = tx.date || new Date().toISOString().split('T')[0];

    // Detect categoryType
    let detectedType: 'need' | 'want' | 'savings' | 'debt' = tx.categoryType || 'want';
    const foundCat = categories.find((c) => c.name.toLowerCase() === tx.category.toLowerCase());
    if (foundCat) {
      detectedType = foundCat.type;
    } else if (tx.type === 'income') {
      detectedType = 'savings';
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: tx.title || noteText || tx.category,
      amount: Number(tx.amount) || 0,
      type: tx.type,
      category: tx.category,
      categoryType: detectedType,
      date: dateText,
      paymentMethod: tx.paymentMethod || 'UPI',
      isRecurring: !!tx.isRecurring,
      notes: noteText,
      note: noteText,
      tags: tx.tags || [tx.type, tx.category.toLowerCase().split(' ')[0]],
      createdAt: new Date().toISOString(),
    };

    // Central state update instantly triggers categoriesWithActuals recalculation via useMemo
    setTransactions((prev) => [newTx, ...prev]);

    // Asynchronously synchronize with backend
    apiRecordTransaction(newTx);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    apiDeleteTransaction(id);
  };

  const updateCategoryBudget = (id: string, newAmount: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocatedAmount: Math.max(0, newAmount) } : c))
    );
    apiUpdateCategory(id, { allocatedAmount: newAmount });
  };

  const toggleCategoryLock = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'isCompleted'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      isCompleted: goal.currentAmount >= goal.targetAmount,
    };
    setGoals((prev) => [...prev, newGoal]);
    apiCreateGoal(newGoal);
  };

  const updateGoalProgress = (id: string, addedAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = g.currentAmount + addedAmount;
          return {
            ...g,
            currentAmount: updated,
            isCompleted: updated >= g.targetAmount,
          };
        }
        return g;
      })
    );
    apiContributeGoal(id, addedAmount);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleBillPaid = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newStatus = b.status === 'paid' ? 'upcoming' : 'paid';
          return {
            ...b,
            status: newStatus,
            lastPaidDate: newStatus === 'paid' ? new Date().toISOString() : b.lastPaidDate,
          };
        }
        return b;
      })
    );
    apiToggleBillPaid(id);
  };

  const addBill = (bill: Omit<BillSubscription, 'id' | 'status'>) => {
    const newBill: BillSubscription = {
      ...bill,
      id: `bill-${Date.now()}`,
      status: 'upcoming',
    };
    setBills((prev) => [...prev, newBill]);
    apiCreateBill(newBill);
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const runOptimizer = (strategy: OptimizationStrategy = 'balanced_50_30_20'): OptimizationResponse => {
    const inputCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      currentBudget: c.allocatedAmount,
      actualSpend: c.spentAmount,
      isLocked: c.isLocked,
    }));

    const result = runClientOptimizer({
      monthlyNetIncome: monthlyIncome,
      strategy,
      categories: inputCategories,
      monthlyDebtObligations: debtSpent,
    });

    setActiveOptimization(result);
    return result;
  };

  const applyOptimizedBudget = (response: OptimizationResponse) => {
    setCategories((prev) =>
      prev.map((cat) => {
        const match = response.categories.find((c) => c.id === cat.id);
        if (match) {
          return { ...cat, allocatedAmount: match.recommendedBudget };
        }
        return cat;
      })
    );
  };

  const loginUser = async (userParam: UserRecord) => {
    if (!userParam) return;
    const resolvedName =
      userParam.name?.trim() || (userParam.email ? userParam.email.split('@')[0] : 'Member');
    const safeUser: UserRecord = {
      ...userParam,
      name: resolvedName,
    };

    setCurrentUser(safeUser);

    // Update state only after successful API response / login (Task 3)
    setUser({
      name: safeUser.name,
      email: safeUser.email || '',
      token: localStorage.getItem('wealthwise_auth_token') || null,
      preferences: safeUser.preferences,
    });

    const userKey = getUserDataStorageKey(safeUser.email, safeUser.id);
    let loadedState: any = null;

    try {
      const raw = localStorage.getItem(userKey);
      if (raw) {
        loadedState = JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    if (loadedState && loadedState.userProfile && loadedState.userProfile.isOnboarded) {
      // Returning user with existing saved state -> Restore ONLY their own data (Requirement 1 & 3)
      const restoredProfile: UserProfile = {
        ...loadedState.userProfile,
        id: safeUser.id,
        name: safeUser.name || loadedState.userProfile.name || 'Member',
        email: safeUser.email,
        phone: safeUser.phone || loadedState.userProfile.phone,
        dateOfBirth: safeUser.dateOfBirth || loadedState.userProfile.dateOfBirth,
        preferences: safeUser.preferences || loadedState.userProfile.preferences,
        isNewUser: false,
        isGuest: !!safeUser.isGuest,
        isOnboarded: true,
        lastLoginAt: new Date().toISOString(),
      };
      setUserProfile(restoredProfile);
      setMonthlyIncomeState(loadedState.monthlyIncome ?? 120000);
      setCategories(loadedState.categories || []);
      setTransactions(loadedState.transactions || []);
      setGoals(loadedState.goals || []);
      setBills(loadedState.bills || []);
      setIsCloudSyncReady(true);

      setRestorationNotice(
        `Welcome back, ${safeUser.name}! Restored your saved monthly budget and records.`
      );

      // Also check cloud backend for any newer changes made from another browser
      fetchUserFullSync(safeUser.email || safeUser.id).then((cloudData) => {
        if (cloudData && cloudData.categories && cloudData.categories.length > 0) {
          setCategories(cloudData.categories);
          setTransactions(cloudData.transactions || []);
          setGoals(cloudData.goals || []);
          setBills(cloudData.bills || []);
          if (cloudData.monthlyIncome) {
            setMonthlyIncomeState(cloudData.monthlyIncome);
          }
        }
      });
      return;
    }

    // No local user data in this browser (e.g., opened in a new browser or incognito) -> Restore from server cloud storage!
    try {
      const cloudData = await fetchUserFullSync(safeUser.email || safeUser.id);
      if (
        cloudData &&
        ((cloudData.categories && cloudData.categories.length > 0) ||
          (cloudData.monthlyIncome && cloudData.monthlyIncome > 0) ||
          (cloudData.transactions && cloudData.transactions.length > 0))
      ) {
        const restoredProfile: UserProfile = {
          ...(cloudData.userProfile || {}),
          id: safeUser.id,
          name: safeUser.name || cloudData.userProfile?.name || 'Member',
          email: safeUser.email,
          phone: safeUser.phone || cloudData.userProfile?.phone,
          dateOfBirth: safeUser.dateOfBirth || cloudData.userProfile?.dateOfBirth,
          preferences: safeUser.preferences || cloudData.userProfile?.preferences,
          monthlyIncome: cloudData.monthlyIncome || cloudData.userProfile?.monthlyIncome || 0,
          isOnboarded: true,
          isNewUser: false,
          isGuest: !!safeUser.isGuest,
          dashboardMode: 'beginner',
          lastLoginAt: new Date().toISOString(),
        };
        setUserProfile(restoredProfile);
        setMonthlyIncomeState(cloudData.monthlyIncome || 0);
        setCategories(cloudData.categories || []);
        setTransactions(cloudData.transactions || []);
        setGoals(cloudData.goals || []);
        setBills(cloudData.bills || []);
        setIsCloudSyncReady(true);

        try {
          localStorage.setItem(
            userKey,
            JSON.stringify({
              userProfile: restoredProfile,
              monthlyIncome: cloudData.monthlyIncome,
              transactions: cloudData.transactions,
              categories: cloudData.categories,
              goals: cloudData.goals,
              bills: cloudData.bills,
            })
          );
        } catch {
          // ignore
        }

        setRestorationNotice(`Welcome back, ${safeUser.name}! Restored your saved portfolio from the cloud.`);
        return;
      }
    } catch (err) {
      console.warn('Cross-browser cloud restoration lookup encountered an issue:', err);
    }

    // No user data saved in active key yet -> check seed data
    const seed = getSeedUserData(safeUser.email);
    if (seed.isOnboarded) {
      // Pre-registered seed accounts (Sambhaji, Priya, Guest)
      const seedProfile: UserProfile = {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        phone: safeUser.phone,
        dateOfBirth: safeUser.dateOfBirth,
        preferences: safeUser.preferences,
        monthlyIncome: seed.monthlyIncome,
        isOnboarded: true,
        isNewUser: false,
        isGuest: !!safeUser.isGuest,
        dashboardMode: 'beginner',
        createdAt: safeUser.createdAt,
        lastLoginAt: new Date().toISOString(),
      };
      setUserProfile(seedProfile);
      setMonthlyIncomeState(seed.monthlyIncome);
      setCategories(seed.categories);
      setTransactions(seed.transactions);
      setGoals(seed.goals);
      setBills(seed.bills);
      setIsCloudSyncReady(true);

      localStorage.setItem(
        userKey,
        JSON.stringify({
          userProfile: seedProfile,
          monthlyIncome: seed.monthlyIncome,
          transactions: seed.transactions,
          categories: seed.categories,
          goals: seed.goals,
          bills: seed.bills,
        })
      );

      if (safeUser.isGuest) {
        setRestorationNotice('Welcome, Guest Explorer! Sandbox mode active with demo portfolio.');
      } else {
        setRestorationNotice(`Welcome back, ${safeUser.name}! Your saved profile has been restored.`);
      }
    } else {
      // BRAND NEW USER: Always start with a BLANK profile! (Requirement 1 & 2)
      const blankProfile: UserProfile = {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        phone: safeUser.phone,
        dateOfBirth: safeUser.dateOfBirth,
        preferences: safeUser.preferences,
        monthlyIncome: 0,
        isOnboarded: false, // Forces Onboarding Wizard!
        isNewUser: true,
        isGuest: false,
        dashboardMode: 'beginner',
        createdAt: safeUser.createdAt,
        lastLoginAt: new Date().toISOString(),
      };
      setUserProfile(blankProfile);
      setMonthlyIncomeState(0);
      setCategories([]);
      setTransactions([]);
      setGoals([]);
      setBills([]);
      setIsCloudSyncReady(true);

      setRestorationNotice(
        `Welcome, ${safeUser.name}! Please complete the onboarding steps to configure your personal monthly budget.`
      );
    }
  };

  const signOut = () => {
    const currentEmail = userProfile?.email;
    const currentName = userProfile?.name || 'Member';

    // Reset user context state
    setUser({ name: '', email: '', token: null });

    // Save active state to user-specific key (Requirement 1 & 6)
    if (currentEmail && !userProfile.isGuest) {
      const userKey = getUserDataStorageKey(currentEmail, userProfile.id);
      const snapshot: UserFinancialSnapshot = {
        monthlyIncome,
        totalExpenses,
        savingsRate,
        categoriesCount: categories.length,
        transactionsCount: transactions.length,
        lastSavedAt: new Date().toISOString(),
      };
      saveUserFinancialSnapshot(currentEmail, snapshot);
      setLastSignOutReceipt({
        userName: currentName || 'Member',
        userEmail: currentEmail,
        savedAt: new Date().toISOString(),
        snapshot,
      });

      try {
        localStorage.setItem(
          userKey,
          JSON.stringify({
            userProfile,
            monthlyIncome,
            transactions,
            categories,
            goals,
            bills,
          })
        );
      } catch {
        // ignore
      }

      // Persist state to backend database on sign out
      saveUserFullSync({
        userProfile,
        monthlyIncome,
        transactions,
        categories,
        goals,
        bills,
        email: currentEmail,
        userId: userProfile.id,
      }).catch(() => {});
    }

    clearCurrentUser();
    // Reset in-memory state so no cross-contamination remains for next login
    setUserProfile({
      name: '',
      email: '',
      phone: '',
      monthlyIncome: 0,
      isOnboarded: false,
      isNewUser: false,
      isGuest: false,
      dashboardMode: 'beginner',
      createdAt: new Date().toISOString(),
    });
    setMonthlyIncomeState(0);
    setTransactions([]);
    setCategories([]);
    setGoals([]);
    setBills([]);
    setRestorationNotice(null);
    try {
      localStorage.removeItem('wealthwise_auth_session');
    } catch {
      // ignore
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        isUserLoading,
        refetchUser,
        userProfile,
        setUserProfile,
        updateUserProfile,
        dashboardMode,
        setDashboardMode,
        monthlyIncome,
        setMonthlyIncome,
        transactions,
        addTransaction,
        deleteTransaction,
        categories: categoriesWithActuals,
        updateCategoryBudget,
        toggleCategoryLock,
        goals,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        bills,
        toggleBillPaid,
        addBill,
        deleteBill,
        activeOptimization,
        runOptimizer,
        applyOptimizedBudget,
        completeOnboarding,
        loadDemoData,
        resetAllData,
        loginUser,
        signOut,
        restorationNotice,
        dismissRestorationNotice,
        totalExpenses,
        totalIncome,
        totalBudgetAllocated,
        remainingIncome,
        savingsRate,
        budgetHealthScore: health.score,
        budgetHealthRating: health.rating,
        budgetHealthSummary: health.summary,
        budgetHealthInsights: health.insights,
        monthEndForecast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
