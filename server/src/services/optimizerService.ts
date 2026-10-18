/**
 * WealthWise Smart Budget Optimization Engine
 * Mathematical constraint-based allocation algorithm.
 */

export type CategoryType = 'need' | 'want' | 'savings' | 'debt';

export interface CategoryAllocationInput {
  id: string;
  name: string;
  type: CategoryType;
  currentBudget: number;
  actualSpend: number;
  minAllowed?: number;
  maxAllowed?: number;
  isLocked?: boolean; // User chose to pin this category
}

export type OptimizationStrategy = 
  | 'balanced_50_30_20' 
  | 'aggressive_savings' 
  | 'debt_accelerator' 
  | 'gentle_cutback';

export interface OptimizationRequest {
  monthlyNetIncome: number;
  strategy: OptimizationStrategy;
  categories: CategoryAllocationInput[];
  monthlyDebtObligations?: number;
  targetMonthlySavingsGoal?: number;
}

export interface OptimizedCategoryResult {
  id: string;
  name: string;
  type: CategoryType;
  currentBudget: number;
  actualSpend: number;
  recommendedBudget: number;
  difference: number; // positive = increase, negative = decrease
  percentageOfIncome: number;
  rationale: string;
  actionableTip: string;
}

export interface OptimizationResponse {
  isFeasible: boolean;
  status: 'optimal' | 'feasible_with_adjustments' | 'deficit_warning' | 'infeasible';
  monthlyNetIncome: number;
  totalCurrentBudget: number;
  totalRecommendedBudget: number;
  totalProjectedSavings: number;
  currentSavingsRate: number;
  optimizedSavingsRate: number;
  breakdown: {
    needs: { amount: number; percentage: number };
    wants: { amount: number; percentage: number };
    savings: { amount: number; percentage: number };
    debt: { amount: number; percentage: number };
  };
  projectedAnnualWealthIncrease: number;
  categories: OptimizedCategoryResult[];
  macroInsights: string[];
  tradeOffSummary: string;
}

export function runSmartBudgetOptimizer(request: OptimizationRequest): OptimizationResponse {
  const {
    monthlyNetIncome,
    strategy,
    categories,
    monthlyDebtObligations = 0,
    targetMonthlySavingsGoal = 0,
  } = request;

  // 1. Calculate base totals from inputs
  let totalCurrentBudget = 0;
  let totalCurrentActual = 0;
  let lockedAmount = 0;

  for (const cat of categories) {
    totalCurrentBudget += cat.currentBudget;
    totalCurrentActual += cat.actualSpend;
    if (cat.isLocked) {
      lockedAmount += cat.currentBudget;
    }
  }

  // 2. Identify absolute minimum requirements (needs floor + debt obligations)
  let minEssentialNeeds = 0;
  for (const cat of categories) {
    if (cat.type === 'need' || cat.type === 'debt') {
      const floor = cat.minAllowed ?? Math.round(cat.currentBudget * 0.75);
      minEssentialNeeds += cat.isLocked ? cat.currentBudget : floor;
    }
  }

  // 3. Infeasibility check: If mandatory needs exceed total net income
  const mandatoryObligations = minEssentialNeeds + monthlyDebtObligations;
  if (mandatoryObligations > monthlyNetIncome) {
    const deficit = mandatoryObligations - monthlyNetIncome;
    return {
      isFeasible: false,
      status: 'infeasible',
      monthlyNetIncome,
      totalCurrentBudget,
      totalRecommendedBudget: mandatoryObligations,
      totalProjectedSavings: 0,
      currentSavingsRate: 0,
      optimizedSavingsRate: 0,
      breakdown: {
        needs: { amount: mandatoryObligations, percentage: 100 },
        wants: { amount: 0, percentage: 0 },
        savings: { amount: 0, percentage: 0 },
        debt: { amount: monthlyDebtObligations, percentage: Math.round((monthlyDebtObligations / monthlyNetIncome) * 100) },
      },
      projectedAnnualWealthIncrease: 0,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        currentBudget: c.currentBudget,
        actualSpend: c.actualSpend,
        recommendedBudget: c.currentBudget,
        difference: 0,
        percentageOfIncome: Math.round((c.currentBudget / monthlyNetIncome) * 100),
        rationale: 'Income is insufficient to cover mandatory obligations.',
        actionableTip: 'Urgent debt restructuring or secondary income generation needed.',
      })),
      macroInsights: [
        `Mandatory living essentials and debt exceed your monthly income by ₹${deficit.toLocaleString('en-IN')}.`,
        'No realistic budget can be generated without addressing fixed obligations or supplementing income.',
      ],
      tradeOffSummary: 'Immediate financial triage required: prioritize non-negotiable shelter, utilities, and high-interest debt.',
    };
  }

  // 4. Set Strategy Targets (Target ratios for Needs / Wants / Savings)
  let targetNeedsRatio = 0.5;
  let targetWantsRatio = 0.3;
  let targetSavingsRatio = 0.2;

  switch (strategy) {
    case 'aggressive_savings':
      targetNeedsRatio = 0.45;
      targetWantsRatio = 0.15;
      targetSavingsRatio = 0.40;
      break;
    case 'debt_accelerator':
      targetNeedsRatio = 0.45;
      targetWantsRatio = 0.20;
      targetSavingsRatio = 0.35; // Directed primarily towards debt and emergency fund
      break;
    case 'gentle_cutback':
      targetNeedsRatio = 0.52;
      targetWantsRatio = 0.30;
      targetSavingsRatio = 0.18;
      break;
    case 'balanced_50_30_20':
    default:
      targetNeedsRatio = 0.50;
      targetWantsRatio = 0.30;
      targetSavingsRatio = 0.20;
      break;
  }

  // Target rupee amounts
  const targetNeedsBudget = Math.round(monthlyNetIncome * targetNeedsRatio);
  const targetWantsBudget = Math.round(monthlyNetIncome * targetWantsRatio);
  const targetSavingsBudget = Math.round(monthlyNetIncome * targetSavingsRatio);

  // 5. Category-by-category optimization
  const results: OptimizedCategoryResult[] = [];
  let allocatedNeeds = 0;
  let allocatedWants = 0;
  let allocatedSavings = 0;
  let allocatedDebt = 0;

  // Separate categories
  const needCats = categories.filter((c) => c.type === 'need');
  const wantCats = categories.filter((c) => c.type === 'want');
  const savingsCats = categories.filter((c) => c.type === 'savings');
  const debtCats = categories.filter((c) => c.type === 'debt');

  // Total current by type
  const totalNeedCurrent = needCats.reduce((sum, c) => sum + c.currentBudget, 0);
  const totalWantCurrent = wantCats.reduce((sum, c) => sum + c.currentBudget, 0);
  const totalSavingsCurrent = savingsCats.reduce((sum, c) => sum + c.currentBudget, 0);

  // Optimize NEEDS
  for (const cat of needCats) {
    if (cat.isLocked) {
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'need',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: cat.currentBudget,
        difference: 0,
        percentageOfIncome: Math.round((cat.currentBudget / monthlyNetIncome) * 100),
        rationale: 'User locked allocation preserved.',
        actionableTip: 'Review utility contracts periodically for competitive rates.',
      });
      allocatedNeeds += cat.currentBudget;
      continue;
    }

    // Benchmark scaling
    let recommended = cat.currentBudget;
    let rationale = 'Aligned with essential living standard.';
    let actionableTip = 'Track monthly bills to prevent utility leakage.';

    // If total current needs exceed target needs, shave off non-locked fat
    if (totalNeedCurrent > targetNeedsBudget) {
      const reductionRatio = Math.max(0.85, targetNeedsBudget / totalNeedCurrent);
      recommended = Math.max(cat.minAllowed ?? Math.round(cat.currentBudget * 0.8), Math.round(cat.currentBudget * reductionRatio));
      rationale = `Trimmed slightly to adhere to the ${Math.round(targetNeedsRatio * 100)}% essentials limit.`;
      actionableTip = 'Shop with a planned grocery list and review utility tariffs.';
    } else {
      // If comfortably below, preserve current budget
      recommended = cat.currentBudget;
      rationale = 'Maintained within safe essential envelope.';
    }

    allocatedNeeds += recommended;
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'need',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: recommended - cat.currentBudget,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale,
      actionableTip,
    });
  }

  // Optimize WANTS (Discretionary)
  for (const cat of wantCats) {
    if (cat.isLocked) {
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'want',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: cat.currentBudget,
        difference: 0,
        percentageOfIncome: Math.round((cat.currentBudget / monthlyNetIncome) * 100),
        rationale: 'User locked discretionary allocation preserved.',
        actionableTip: 'Monitor frequency of impulse transactions.',
      });
      allocatedWants += cat.currentBudget;
      continue;
    }

    let recommended = cat.currentBudget;
    let rationale = '';
    let actionableTip = '';

    if (totalWantCurrent > targetWantsBudget) {
      // Cutback wants to fit within target
      const cutbackRatio = Math.max(0.60, targetWantsBudget / (totalWantCurrent || 1));
      recommended = Math.max(cat.minAllowed ?? 500, Math.round(cat.currentBudget * cutbackRatio));
      rationale = `Discretionary reduction of ₹${(cat.currentBudget - recommended).toLocaleString('en-IN')} to free cashflow for wealth building.`;
      actionableTip = 'Apply the 48-hour rule on non-essential purchases.';
    } else {
      recommended = cat.currentBudget;
      rationale = 'Discretionary spend is well within healthy bounds.';
      actionableTip = 'Enjoy your entertainment guilt-free within this boundary.';
    }

    allocatedWants += recommended;
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'want',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: recommended - cat.currentBudget,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale,
      actionableTip,
    });
  }

  // Optimize DEBT
  for (const cat of debtCats) {
    const recommended = cat.currentBudget;
    allocatedDebt += recommended;
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'debt',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: 0,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale: 'Non-negotiable debt service obligation.',
      actionableTip: strategy === 'debt_accelerator' ? 'Allocate surplus savings to this high-interest principal.' : 'Pay on time to protect CIBIL credit score.',
    });
  }

  // Optimize SAVINGS & INVESTMENTS (absorbs remaining cash flow)
  const remainingForSavings = Math.max(0, monthlyNetIncome - allocatedNeeds - allocatedWants - allocatedDebt);
  allocatedSavings = remainingForSavings;

  if (savingsCats.length === 0) {
    // If no explicit savings category existed, create a default Recommended Wealth Fund
    results.push({
      id: 'cat_savings_auto',
      name: 'Emergency & Wealth Fund',
      type: 'savings',
      currentBudget: 0,
      actualSpend: 0,
      recommendedBudget: remainingForSavings,
      difference: remainingForSavings,
      percentageOfIncome: Math.round((remainingForSavings / monthlyNetIncome) * 100),
      rationale: 'Automated allocation to secure emergency resilience and long-term compounding.',
      actionableTip: 'Set up an automatic recurring SIP on salary credit day.',
    });
  } else {
    // Distribute remaining across user's savings categories proportionally
    const totalExistingSavingsWeight = savingsCats.reduce((s, c) => s + (c.currentBudget || 1), 0);
    for (const cat of savingsCats) {
      const weight = (cat.currentBudget || 1) / (totalExistingSavingsWeight || 1);
      const recommended = Math.round(remainingForSavings * weight);
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'savings',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: recommended,
        difference: recommended - cat.currentBudget,
        percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
        rationale: `Boosted monthly savings by ₹${Math.max(0, recommended - cat.currentBudget).toLocaleString('en-IN')}.`,
        actionableTip: 'Keep high-yield liquid instruments for emergencies, equity index funds for goals > 3 years.',
      });
    }
  }

  const totalRecommendedBudget = allocatedNeeds + allocatedWants + allocatedSavings + allocatedDebt;
  const currentSavingsRate = monthlyNetIncome > 0 ? Math.round((totalSavingsCurrent / monthlyNetIncome) * 100) : 0;
  const optimizedSavingsRate = monthlyNetIncome > 0 ? Math.round((allocatedSavings / monthlyNetIncome) * 100) : 0;
  const projectedAnnualWealthIncrease = allocatedSavings * 12;

  // Macro Insights
  const macroInsights: string[] = [
    `Your optimized budget unlocks ₹${allocatedSavings.toLocaleString('en-IN')}/month in pure wealth generation.`,
    `Projected 12-month wealth accumulation: ₹${projectedAnnualWealthIncrease.toLocaleString('en-IN')} (before compounding).`,
    `Needs consume ${Math.round((allocatedNeeds / monthlyNetIncome) * 100)}% (benchmark: ${Math.round(targetNeedsRatio * 100)}%), Wants consume ${Math.round((allocatedWants / monthlyNetIncome) * 100)}%.`,
  ];

  if (targetMonthlySavingsGoal > 0 && allocatedSavings < targetMonthlySavingsGoal) {
    macroInsights.push(
      `Your savings target of ₹${targetMonthlySavingsGoal.toLocaleString('en-IN')} has a shortfall of ₹${(targetMonthlySavingsGoal - allocatedSavings).toLocaleString('en-IN')}. Consider trimming discretionary wants further.`
    );
  }

  let tradeOffSummary = `By trimming non-essential dining and shopping by ₹${Math.max(0, totalWantCurrent - allocatedWants).toLocaleString('en-IN')}, your monthly savings rate increases from ${currentSavingsRate}% to ${optimizedSavingsRate}%.`;
  if (totalWantCurrent <= allocatedWants) {
    tradeOffSummary = `Your discretionary spending is already lean. The optimizer balanced your cashflow perfectly without drastic lifestyle compromises.`;
  }

  return {
    isFeasible: true,
    status: totalRecommendedBudget <= monthlyNetIncome ? 'optimal' : 'feasible_with_adjustments',
    monthlyNetIncome,
    totalCurrentBudget,
    totalRecommendedBudget,
    totalProjectedSavings: allocatedSavings,
    currentSavingsRate,
    optimizedSavingsRate,
    breakdown: {
      needs: {
        amount: allocatedNeeds,
        percentage: Math.round((allocatedNeeds / monthlyNetIncome) * 100),
      },
      wants: {
        amount: allocatedWants,
        percentage: Math.round((allocatedWants / monthlyNetIncome) * 100),
      },
      savings: {
        amount: allocatedSavings,
        percentage: Math.round((allocatedSavings / monthlyNetIncome) * 100),
      },
      debt: {
        amount: allocatedDebt,
        percentage: Math.round((allocatedDebt / monthlyNetIncome) * 100),
      },
    },
    projectedAnnualWealthIncrease,
    categories: results,
    macroInsights,
    tradeOffSummary,
  };
}
