/**
 * WealthWise Financial Calculation Engine
 * Reusable, mathematically sound financial utilities with zero external dependencies.
 */

export interface BudgetHealthFactors {
  savingsRate: number; // percentage (0-100)
  needsRatio: number; // percentage (0-100)
  debtToIncomeRatio: number; // percentage (0-100)
  hasEmergencyFund: boolean;
  overspendingCategoriesCount: number;
}

export interface BudgetHealthResult {
  score: number; // 0 to 100
  rating: 'Exceptional' | 'Healthy' | 'Moderate' | 'Vulnerable' | 'Critical';
  summary: string;
  insights: string[];
}

export interface MonthEndForecastInput {
  currentBalance: number;
  expectedRemainingIncome: number;
  upcomingScheduledBills: number;
  projectedDailyDiscretionary: number;
  daysRemainingInMonth: number;
}

export interface MonthEndForecastResult {
  projectedClosingBalance: number;
  projectedTotalSpend: number;
  projectedSavings: number;
  dailySafeSpend: number;
  status: 'Surplus' | 'On Track' | 'Deficit Risk';
}

/**
 * Calculates a comprehensive budget health score (0 - 100)
 */
export function calculateBudgetHealthScore(factors: BudgetHealthFactors): BudgetHealthResult {
  let score = 50; // base score

  // 1. Savings Rate assessment (up to +25 points)
  if (factors.savingsRate >= 25) {
    score += 25;
  } else if (factors.savingsRate >= 20) {
    score += 20;
  } else if (factors.savingsRate >= 10) {
    score += 12;
  } else if (factors.savingsRate > 0) {
    score += 5;
  } else {
    score -= 15;
  }

  // 2. Needs / Essential ratio assessment (up to +15 points)
  // Ideal: 50% or less
  if (factors.needsRatio <= 50) {
    score += 15;
  } else if (factors.needsRatio <= 65) {
    score += 5;
  } else {
    score -= 15;
  }

  // 3. Debt to Income Ratio (DTI) assessment (up to +15 points)
  // Ideal: <= 15% safe, 16-35% manageable, >36% heavy
  if (factors.debtToIncomeRatio <= 15) {
    score += 15;
  } else if (factors.debtToIncomeRatio <= 30) {
    score += 8;
  } else if (factors.debtToIncomeRatio <= 45) {
    score -= 5;
  } else {
    score -= 20;
  }

  // 4. Emergency Fund presence (+10 points)
  if (factors.hasEmergencyFund) {
    score += 10;
  } else {
    score -= 5;
  }

  // 5. Overspending penalties (-5 points per overspent category, max -20)
  score -= Math.min(20, factors.overspendingCategoriesCount * 5);

  // Clamp score to 0 - 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let rating: BudgetHealthResult['rating'] = 'Moderate';
  let summary = '';
  const insights: string[] = [];

  if (finalScore >= 85) {
    rating = 'Exceptional';
    summary = 'Your finances are in pristine balance with strong savings and minimal vulnerability.';
    insights.push('Optimal 50/30/20 alignment maintained.');
    insights.push('Well positioned for long-term compounding and goal realization.');
  } else if (finalScore >= 70) {
    rating = 'Healthy';
    summary = 'Your budget is well-managed with a comfortable cushion for unexpected expenses.';
    insights.push('Savings rate meets recommended financial standards.');
    insights.push('Keep discretionary spending within planned category envelopes.');
  } else if (finalScore >= 50) {
    rating = 'Moderate';
    summary = 'Financially stable, but essential expenses or debt are consuming a sizable portion of cash flow.';
    insights.push('Review non-essential subscriptions and entertainment allocations.');
    insights.push('Aim to boost savings contributions by 3-5% next pay cycle.');
  } else if (finalScore >= 35) {
    rating = 'Vulnerable';
    summary = 'Tight margins between monthly income and recurring obligations.';
    insights.push('Debt obligations or essential bills are above optimal thresholds.');
    insights.push('Execute a Smart Optimization to rebalance flexible spending.');
  } else {
    rating = 'Critical';
    summary = 'Spending is outpacing income or debt load requires urgent restructuring.';
    insights.push('Immediate reduction in discretionary spend required.');
    insights.push('Prioritize essential shelter, food, and high-interest liabilities.');
  }

  return {
    score: finalScore,
    rating,
    summary,
    insights,
  };
}

/**
 * Computes 50/30/20 standard guideline allocations for a net monthly income
 */
export function calculate50_30_20Split(monthlyNetIncome: number) {
  const needs = Math.round(monthlyNetIncome * 0.5);
  const wants = Math.round(monthlyNetIncome * 0.3);
  const savings = Math.round(monthlyNetIncome * 0.2);

  return {
    monthlyNetIncome,
    needs: {
      percentage: 50,
      targetAmount: needs,
      description: 'Housing, Groceries, Utilities, Healthcare, Minimum Debt',
    },
    wants: {
      percentage: 30,
      targetAmount: wants,
      description: 'Dining, Entertainment, Shopping, Hobbies, Subscriptions',
    },
    savings: {
      percentage: 20,
      targetAmount: savings,
      description: 'Emergency Fund, Investments, Retirement, Accelerated Debt',
    },
  };
}

/**
 * Projects month-end closing cash balance and daily safe discretionary limit
 */
export function calculateMonthEndForecast(input: MonthEndForecastInput): MonthEndForecastResult {
  const projectedDiscretionarySpend = input.projectedDailyDiscretionary * input.daysRemainingInMonth;
  const projectedTotalSpend = input.upcomingScheduledBills + projectedDiscretionarySpend;
  const projectedClosingBalance = input.currentBalance + input.expectedRemainingIncome - projectedTotalSpend;

  // Safe daily spend is whatever remaining discretionary budget is divided by days left
  const availableDiscretionary = Math.max(0, input.currentBalance + input.expectedRemainingIncome - input.upcomingScheduledBills);
  const dailySafeSpend = input.daysRemainingInMonth > 0
    ? Math.round((availableDiscretionary / input.daysRemainingInMonth) * 100) / 100
    : 0;

  let status: MonthEndForecastResult['status'] = 'On Track';
  if (projectedClosingBalance < 0) {
    status = 'Deficit Risk';
  } else if (projectedClosingBalance >= input.currentBalance * 1.15) {
    status = 'Surplus';
  }

  return {
    projectedClosingBalance: Math.round(projectedClosingBalance),
    projectedTotalSpend: Math.round(projectedTotalSpend),
    projectedSavings: Math.max(0, Math.round(projectedClosingBalance)),
    dailySafeSpend,
    status,
  };
}

/**
 * Calculate required monthly savings to achieve a goal by a target date
 */
export function calculateGoalMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date | string
): { monthsRemaining: number; monthlyContribution: number; isFeasible: boolean } {
  const target = new Date(targetDate);
  const now = new Date();
  const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const months = Math.max(1, diffMonths);

  const shortfall = Math.max(0, targetAmount - currentAmount);
  const monthlyContribution = Math.round((shortfall / months) * 100) / 100;

  return {
    monthsRemaining: months,
    monthlyContribution,
    isFeasible: months > 0 && shortfall >= 0,
  };
}
