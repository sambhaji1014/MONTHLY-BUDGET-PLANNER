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

export function calculateBudgetHealthScore(factors: BudgetHealthFactors): BudgetHealthResult {
  let score = 50;

  // 1. Savings Rate assessment
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

  // 2. Needs ratio assessment
  if (factors.needsRatio <= 50) {
    score += 15;
  } else if (factors.needsRatio <= 65) {
    score += 5;
  } else {
    score -= 15;
  }

  // 3. Debt to Income Ratio
  if (factors.debtToIncomeRatio <= 15) {
    score += 15;
  } else if (factors.debtToIncomeRatio <= 30) {
    score += 8;
  } else if (factors.debtToIncomeRatio <= 45) {
    score -= 5;
  } else {
    score -= 20;
  }

  // 4. Emergency Fund
  if (factors.hasEmergencyFund) {
    score += 10;
  } else {
    score -= 5;
  }

  // 5. Overspending penalties
  score -= Math.min(20, factors.overspendingCategoriesCount * 5);

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

export interface ToleranceBand {
  minPercentage: number;
  maxPercentage: number;
  toleranceDelta: number; // e.g. 4 for ±4%
  minAmount: number;
  maxAmount: number;
}

export interface SplitEvaluation {
  status: 'optimal' | 'within_tolerance' | 'elevated' | 'under' | 'critical';
  label: string;
  badgeVariant: 'sage' | 'gold' | 'blush' | 'red' | 'rose';
  reassurance: string;
}

export function evaluateToleranceBand(
  pillar: 'needs' | 'wants' | 'savings',
  actualPercentage: number
): SplitEvaluation {
  if (pillar === 'needs') {
    if (actualPercentage >= 46 && actualPercentage <= 54) {
      return {
        status: 'within_tolerance',
        label: 'Healthy Tolerance (±4%)',
        badgeVariant: 'sage',
        reassurance: 'Comfortably balanced within normal living variance.',
      };
    }
    if (actualPercentage < 46) {
      return {
        status: 'optimal',
        label: 'Lean Essentials (<46%)',
        badgeVariant: 'sage',
        reassurance: 'Exceptionally low fixed burden unlocks major wealth agility.',
      };
    }
    if (actualPercentage <= 60) {
      return {
        status: 'elevated',
        label: 'Mild Variance (55–60%)',
        badgeVariant: 'blush',
        reassurance: 'Manageable deviation. Reassuring: no immediate alarm if wants are restrained.',
      };
    }
    return {
      status: 'critical',
      label: 'Elevated Fixed Commitments',
      badgeVariant: 'red',
      reassurance: 'Essential obligations exceed 60% of income; review utility tariffs or fixed rent.',
    };
  }

  if (pillar === 'wants') {
    if (actualPercentage >= 26 && actualPercentage <= 34) {
      return {
        status: 'within_tolerance',
        label: 'Balanced Comfort (±4%)',
        badgeVariant: 'sage',
        reassurance: 'Discretionary lifestyle is in steady, guilt-free harmony.',
      };
    }
    if (actualPercentage < 26) {
      return {
        status: 'optimal',
        label: 'Frugal Discipline (<26%)',
        badgeVariant: 'gold',
        reassurance: 'Low lifestyle churn directly compounds your net worth.',
      };
    }
    if (actualPercentage <= 38) {
      return {
        status: 'elevated',
        label: 'Mild Lifestyle Creep',
        badgeVariant: 'blush',
        reassurance: 'Slightly above benchmark; audit 1-2 dining apps to return to 30%.',
      };
    }
    return {
      status: 'critical',
      label: 'High Discretionary Burn',
      badgeVariant: 'red',
      reassurance: 'Flexible spending is crowding out savings; activate smart optimization.',
    };
  }

  // Savings
  if (actualPercentage >= 25) {
    return {
      status: 'optimal',
      label: 'High Wealth Velocity (25%+)',
      badgeVariant: 'rose',
      reassurance: 'Pristine wealth trajectory; compounding momentum is exceptional.',
    };
  }
  if (actualPercentage >= 17 && actualPercentage <= 24) {
    return {
      status: 'within_tolerance',
      label: 'Solid Accumulation (±3%)',
      badgeVariant: 'sage',
      reassurance: 'On-track wealth building meets institutional wealth standards.',
    };
  }
  if (actualPercentage >= 10) {
    return {
      status: 'elevated',
      label: 'Building Buffer (10–16%)',
      badgeVariant: 'gold',
      reassurance: 'Positive savings cushion; strive to step up SIP by 3–5% on next increment.',
    };
  }
  return {
    status: 'critical',
    label: 'Under-Allocated Wealth',
    badgeVariant: 'blush',
    reassurance: 'Savings below 10%; aim to establish at least 1 month liquid emergency reserve.',
  };
}

export function calculate50_30_20Split(monthlyNetIncome: number) {
  const needsTarget = Math.round(monthlyNetIncome * 0.5);
  const wantsTarget = Math.round(monthlyNetIncome * 0.3);
  const savingsTarget = Math.round(monthlyNetIncome * 0.2);

  return {
    monthlyNetIncome,
    needs: {
      percentage: 50,
      targetAmount: needsTarget,
      tolerance: {
        minPercentage: 46,
        maxPercentage: 54,
        toleranceDelta: 4,
        minAmount: Math.round(monthlyNetIncome * 0.46),
        maxAmount: Math.round(monthlyNetIncome * 0.54),
      },
      description: 'Housing, Groceries, Utilities, Healthcare, Essential Transit',
      guidance: 'Healthy tolerance band: 46% – 54% (±4%)',
    },
    wants: {
      percentage: 30,
      targetAmount: wantsTarget,
      tolerance: {
        minPercentage: 26,
        maxPercentage: 34,
        toleranceDelta: 4,
        minAmount: Math.round(monthlyNetIncome * 0.26),
        maxAmount: Math.round(monthlyNetIncome * 0.34),
      },
      description: 'Dining Out, Entertainment, Personal Shopping, Hobbies, Subscriptions',
      guidance: 'Healthy tolerance band: 26% – 34% (±4%)',
    },
    savings: {
      percentage: 20,
      targetAmount: savingsTarget,
      tolerance: {
        minPercentage: 17,
        maxPercentage: 25,
        toleranceDelta: 3,
        minAmount: Math.round(monthlyNetIncome * 0.17),
        maxAmount: Math.round(monthlyNetIncome * 0.25),
      },
      description: 'Emergency Reserves, Equity SIPs, Sinking Funds, Accelerated Principal',
      guidance: 'Healthy tolerance band: 17% – 25%+ (Higher is celebrated)',
    },
  };
}

export function calculateCompoundWealthProjection(monthlyContribution: number, annualReturnRate = 0.12) {
  const monthlyRate = annualReturnRate / 12;
  const projectValue = (years: number) => {
    const months = years * 12;
    if (monthlyRate === 0) return monthlyContribution * months;
    return Math.round(monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  };

  const oneYear = monthlyContribution * 12;
  const threeYears = projectValue(3);
  const fiveYears = projectValue(5);
  const tenYears = projectValue(10);
  const tenYearPrincipal = monthlyContribution * 120;
  const wealthGainTenYears = Math.max(0, tenYears - tenYearPrincipal);

  return {
    monthlyContribution,
    oneYear,
    threeYears,
    fiveYears,
    tenYears,
    tenYearPrincipal,
    wealthGainTenYears,
    growthMultiplier: tenYearPrincipal > 0 ? (tenYears / tenYearPrincipal).toFixed(1) : '1.0',
  };
}

export function calculateMonthEndForecast(input: MonthEndForecastInput): MonthEndForecastResult {
  const projectedDiscretionarySpend = input.projectedDailyDiscretionary * input.daysRemainingInMonth;
  const projectedTotalSpend = input.upcomingScheduledBills + projectedDiscretionarySpend;
  const projectedClosingBalance = input.currentBalance + input.expectedRemainingIncome - projectedTotalSpend;

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

export interface TransactionLike {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  note?: string;
  notes?: string;
  categoryType?: 'need' | 'want' | 'savings' | 'debt';
}

/**
 * Checks whether a given transaction date string falls in the target month & year.
 * Defaults to current month & year.
 */
export function isSameMonthAndYear(dateStr: string, targetDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const targetPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  if (dateStr.startsWith(targetPrefix)) return true;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() === targetYear && d.getMonth() === targetDate.getMonth();
}

/**
 * Dynamically calculates 'Actual Spent' for a specific category envelope
 * by filtering and summing 'expense' transactions matching that category and the current month.
 */
export function calculateCategoryActualSpent(
  categoryName: string,
  transactions: TransactionLike[],
  targetDate: Date = new Date()
): number {
  if (!categoryName || !Array.isArray(transactions)) return 0;
  const targetClean = categoryName.trim().toLowerCase();

  return transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      if (!isSameMonthAndYear(tx.date, targetDate)) return false;
      const txCat = (tx.category || '').trim().toLowerCase();
      return txCat === targetClean;
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
}

export interface EnvelopeCalculation {
  allocatedAmount: number;
  actualSpent: number;
  remaining: number;
  isOver: boolean;
  utilizationPercent: number;
}

/**
 * Dynamically calculates envelope utilization, remaining balance, and status.
 */
export function calculateCategoryEnvelope(
  allocatedAmount: number,
  categoryName: string,
  transactions: TransactionLike[],
  targetDate: Date = new Date()
): EnvelopeCalculation {
  const actualSpent = calculateCategoryActualSpent(categoryName, transactions, targetDate);
  const remaining = allocatedAmount - actualSpent;
  const isOver = remaining < 0;
  const utilizationPercent = allocatedAmount > 0
    ? Math.round((actualSpent / allocatedAmount) * 100)
    : 0;

  return {
    allocatedAmount,
    actualSpent,
    remaining,
    isOver,
    utilizationPercent,
  };
}

export interface PillarActualsSummary {
  needsSpent: number;
  wantsSpent: number;
  savingsSpent: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

/**
 * Dynamically aggregates live monthly expense transactions across 50/30/20 pillars.
 */
export function calculate50_30_20ActualSpent(
  monthlyIncome: number,
  categories: { name: string; type: 'need' | 'want' | 'savings' | 'debt' }[],
  transactions: TransactionLike[],
  targetDate: Date = new Date()
): PillarActualsSummary {
  let needsSpent = 0;
  let wantsSpent = 0;
  let savingsSpent = 0;

  const catTypeMap = new Map<string, 'need' | 'want' | 'savings' | 'debt'>();
  if (Array.isArray(categories)) {
    categories.forEach((c) => {
      if (c && c.name) {
        catTypeMap.set(c.name.trim().toLowerCase(), c.type);
      }
    });
  }

  if (Array.isArray(transactions)) {
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      if (!isSameMonthAndYear(tx.date, targetDate)) return;

      const txCat = (tx.category || '').trim().toLowerCase();
      const type = tx.categoryType || catTypeMap.get(txCat) || 'want';
      const amt = Number(tx.amount) || 0;

      if (type === 'need' || type === 'debt') {
        needsSpent += amt;
      } else if (type === 'want') {
        wantsSpent += amt;
      } else if (type === 'savings') {
        savingsSpent += amt;
      }
    });
  }

  const needsPercent = monthlyIncome > 0 ? Math.round((needsSpent / monthlyIncome) * 100) : 0;
  const wantsPercent = monthlyIncome > 0 ? Math.round((wantsSpent / monthlyIncome) * 100) : 0;
  const savingsPercent = monthlyIncome > 0 ? Math.round((savingsSpent / monthlyIncome) * 100) : 0;

  return {
    needsSpent,
    wantsSpent,
    savingsSpent,
    needsPercent,
    wantsPercent,
    savingsPercent,
  };
}
