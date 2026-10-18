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

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  monthlyIncome: number;
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  savingsTarget: number;
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
  dueDate: string; // Day of month or next date
  category: string;
  paymentMethod: string;
  isAutoDebit: boolean;
  status: 'upcoming' | 'paid' | 'overdue';
  lastPaidDate?: string;
}

export interface FinancialSummary {
  currency: string;
  currentMonth: string;
  monthlyIncome: number;
  totalExpenses: number;
  remainingCashflow: number;
  savingsRate: number;
  budgetHealthScore: number;
  projectedMonthEndBalance: number;
  dailySafeSpend: number;
  needsSpent: number;
  wantsSpent: number;
  savingsSpent: number;
  debtSpent: number;
}

export interface UserPreferences {
  currency: string;
  theme?: string;
  notificationAlerts?: boolean;
  riskTolerance: 'conservative' | 'balanced' | 'growth';
  monthlySavingsTargetPercent: number;
  monthlyIncome?: number;
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
  isNewUser: boolean; // Flag to distinguish first-time sign-in vs returning user
  isGuest?: boolean;
  financialSnapshot?: UserFinancialSnapshot;
  createdAt: string;
  lastLoginAt?: string;
}
