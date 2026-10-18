import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { calculateBudgetHealthScore, calculateMonthEndForecast } from '../utils/financialCalculations.js';

/**
 * GET /api/dashboard/summary
 * Aggregated endpoint calculating:
 * - monthly take-home income
 * - total spent
 * - remaining safe cushion
 * - financial health score (0-100)
 * - category envelopes and month-end forecast
 */
export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const month = (req.query.month as string) || new Date().toISOString().substring(0, 7); // YYYY-MM

    // 1. Fetch user data
    const user = await repository.findUserById(userId);
    const monthlyTakeHome = user?.preferences?.monthlyIncome || 120000;

    // 2. Fetch categories and transactions
    const categories = await repository.getCategories(userId);
    const transactions = await repository.getTransactions(userId, { month });
    const bills = await repository.getBills(userId);
    const goals = await repository.getGoals(userId);

    // 3. Compute income & expenses
    const loggedIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const effectiveIncome = loggedIncome > 0 ? loggedIncome : monthlyTakeHome;

    const totalSpent = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsSpent = transactions
      .filter((t) => t.type === 'expense' && t.categoryType === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);

    const needsSpent = transactions
      .filter((t) => t.type === 'expense' && t.categoryType === 'need')
      .reduce((sum, t) => sum + t.amount, 0);

    const wantsSpent = transactions
      .filter((t) => t.type === 'expense' && t.categoryType === 'want')
      .reduce((sum, t) => sum + t.amount, 0);

    const debtSpent = transactions
      .filter((t) => t.type === 'expense' && t.categoryType === 'debt')
      .reduce((sum, t) => sum + t.amount, 0);

    // 4. Calculate safe cushion & savings rate
    const remainingSafeCushion = effectiveIncome - totalSpent;
    const savingsRate = effectiveIncome > 0 ? Math.round((savingsSpent / effectiveIncome) * 100) : 0;

    // 5. Evaluate comprehensive Financial Health Score (0-100)
    const healthResult = calculateBudgetHealthScore({
      savingsRate,
      needsRatio: effectiveIncome > 0 ? Math.round((needsSpent / effectiveIncome) * 100) : 50,
      debtToIncomeRatio: effectiveIncome > 0 ? Math.round((debtSpent / effectiveIncome) * 100) : 10,
      hasEmergencyFund: goals.some((g) => g.currentAmount >= 100000),
      overspendingCategoriesCount: categories.filter((c) => c.spentAmount > c.allocatedAmount).length,
    });

    // 6. Upcoming scheduled bills
    const upcomingBillsAmount = bills
      .filter((b) => b.status === 'upcoming')
      .reduce((sum, b) => sum + b.amount, 0);

    // 7. Month-End Forecast
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - currentDay);

    const forecast = calculateMonthEndForecast({
      currentBalance: Math.max(0, remainingSafeCushion),
      expectedRemainingIncome: 0,
      upcomingScheduledBills: upcomingBillsAmount,
      projectedDailyDiscretionary: Math.round(Math.max(0, remainingSafeCushion - upcomingBillsAmount) / daysRemaining),
      daysRemainingInMonth: daysRemaining,
    });

    return res.json({
      success: true,
      data: {
        currency: 'INR',
        month,
        monthlyTakeHome: effectiveIncome,
        totalSpent,
        remainingSafeCushion,
        savingsPutAside: Math.max(0, remainingSafeCushion),
        savingsRate,
        financialHealth: {
          score: healthResult.score,
          rating: healthResult.rating,
          summary: healthResult.summary,
          insights: healthResult.insights,
        },
        breakdown: {
          needs: { amount: needsSpent, percentage: effectiveIncome > 0 ? Math.round((needsSpent / effectiveIncome) * 100) : 0 },
          wants: { amount: wantsSpent, percentage: effectiveIncome > 0 ? Math.round((wantsSpent / effectiveIncome) * 100) : 0 },
          savings: { amount: savingsSpent, percentage: effectiveIncome > 0 ? Math.round((savingsSpent / effectiveIncome) * 100) : 0 },
          debt: { amount: debtSpent, percentage: effectiveIncome > 0 ? Math.round((debtSpent / effectiveIncome) * 100) : 0 },
        },
        forecast: {
          daysRemainingInMonth: daysRemaining,
          dailySafeSpend: forecast.dailySafeSpend,
          projectedClosingBalance: forecast.projectedClosingBalance,
          status: forecast.status,
        },
        categoriesCount: categories.length,
        transactionsCount: transactions.length,
      },
    });
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate dashboard summary.' });
  }
};
