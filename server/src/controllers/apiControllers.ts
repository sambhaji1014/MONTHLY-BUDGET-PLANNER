import { Request, Response } from 'express';
import {
  initialCategories,
  initialTransactions,
  initialGoals,
  initialBills,
} from '../models/mockDb.js';
import {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  BillSubscription,
  FinancialSummary,
} from '../models/types.js';
import { runSmartBudgetOptimizer } from '../services/optimizerService.js';
import {
  calculateBudgetHealthScore,
  calculateMonthEndForecast,
} from '../utils/financialCalculations.js';

// Server in-memory mutable store
let monthlyIncome = 120000;
let categories: BudgetCategory[] = [...initialCategories];
let transactions: Transaction[] = [...initialTransactions];
let goals: SavingsGoal[] = [...initialGoals];
let bills: BillSubscription[] = [...initialBills];

/**
 * GET /api/summary
 */
export const getSummary = (req: Request, res: Response) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0) || monthlyIncome;

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const totalSavings = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'savings')
    .reduce((s, t) => s + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? Math.round((totalSavings / monthlyIncome) * 100) : 0;
  const remainingCashflow = monthlyIncome - totalExpenses;

  const needsSpent = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'need')
    .reduce((s, t) => s + t.amount, 0);
  const wantsSpent = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'want')
    .reduce((s, t) => s + t.amount, 0);
  const debtSpent = transactions
    .filter((t) => t.type === 'expense' && t.categoryType === 'debt')
    .reduce((s, t) => s + t.amount, 0);

  const health = calculateBudgetHealthScore({
    savingsRate,
    needsRatio: monthlyIncome > 0 ? Math.round((needsSpent / monthlyIncome) * 100) : 50,
    debtToIncomeRatio: monthlyIncome > 0 ? Math.round((debtSpent / monthlyIncome) * 100) : 10,
    hasEmergencyFund: goals.some((g) => g.currentAmount > 100000),
    overspendingCategoriesCount: categories.filter((c) => c.spentAmount > c.allocatedAmount).length,
  });

  const upcomingBillsTotal = bills
    .filter((b) => b.status === 'upcoming')
    .reduce((s, b) => s + b.amount, 0);

  const forecast = calculateMonthEndForecast({
    currentBalance: Math.max(0, remainingCashflow),
    expectedRemainingIncome: 0,
    upcomingScheduledBills: upcomingBillsTotal,
    projectedDailyDiscretionary: 850,
    daysRemainingInMonth: 14,
  });

  const summary: FinancialSummary = {
    currency: 'INR',
    currentMonth: 'October 2026',
    monthlyIncome,
    totalExpenses,
    remainingCashflow,
    savingsRate,
    budgetHealthScore: health.score,
    projectedMonthEndBalance: forecast.projectedClosingBalance,
    dailySafeSpend: forecast.dailySafeSpend,
    needsSpent,
    wantsSpent,
    savingsSpent: totalSavings,
    debtSpent,
  };

  return res.json({ success: true, data: summary });
};

/**
 * GET /api/transactions
 */
export const getTransactions = (req: Request, res: Response) => {
  return res.json({ success: true, count: transactions.length, data: transactions });
};

/**
 * POST /api/transactions
 */
export const createTransaction = (req: Request, res: Response) => {
  const { title, amount, type, category, categoryType, date, paymentMethod, isRecurring, notes, tags } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    title,
    amount: Number(amount),
    type,
    category: category || 'General',
    categoryType: categoryType || 'want',
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'UPI',
    isRecurring: Boolean(isRecurring),
    notes,
    tags: tags || [],
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTx);

  // Update category spend
  if (newTx.type === 'expense') {
    const targetCat = categories.find((c) => c.name.toLowerCase() === newTx.category.toLowerCase());
    if (targetCat) {
      targetCat.spentAmount += newTx.amount;
    }
  }

  return res.status(201).json({ success: true, data: newTx });
};

/**
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = transactions.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }

  const [deleted] = transactions.splice(index, 1);
  if (deleted.type === 'expense') {
    const targetCat = categories.find((c) => c.name.toLowerCase() === deleted.category.toLowerCase());
    if (targetCat) {
      targetCat.spentAmount = Math.max(0, targetCat.spentAmount - deleted.amount);
    }
  }

  return res.json({ success: true, data: deleted });
};

/**
 * GET /api/budget
 */
export const getBudget = (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      monthlyIncome,
      categories,
      totalAllocated: categories.reduce((s, c) => s + c.allocatedAmount, 0),
      totalSpent: categories.reduce((s, c) => s + c.spentAmount, 0),
    },
  });
};

/**
 * POST /api/optimizer
 */
export const optimizeBudget = (req: Request, res: Response) => {
  const { strategy = 'balanced_50_30_20', debtObligations, targetSavingsGoal } = req.body;

  const result = runSmartBudgetOptimizer({
    monthlyNetIncome: monthlyIncome,
    strategy,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      currentBudget: c.allocatedAmount,
      actualSpend: c.spentAmount,
      isLocked: c.isLocked,
    })),
    monthlyDebtObligations: debtObligations || 10000,
    targetMonthlySavingsGoal: targetSavingsGoal,
  });

  return res.json({ success: true, data: result });
};

/**
 * GET /api/goals
 */
export const getGoals = (req: Request, res: Response) => {
  return res.json({ success: true, data: goals });
};

/**
 * GET /api/bills
 */
export const getBills = (req: Request, res: Response) => {
  return res.json({ success: true, data: bills });
};
