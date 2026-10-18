export type CategoryType = 'need' | 'want' | 'savings' | 'debt';

export interface CategoryAllocationInput {
  id: string;
  name: string;
  type: CategoryType;
  currentBudget: number;
  actualSpend: number;
  minAllowed?: number;
  maxAllowed?: number;
  isLocked?: boolean;
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
  difference: number;
  percentageOfIncome: number;
  rationale: string;
  actionableTip: string;
}

export function getTailoredCategoryAdvice(
  categoryName: string,
  categoryType: CategoryType,
  difference: number,
  isLocked = false
): { rationale: string; actionableTip: string } {
  const name = categoryName.toLowerCase();

  if (isLocked) {
    if (name.includes('rent') || name.includes('housing')) {
      return {
        rationale: 'Core housing shelter allocation locked and fully protected.',
        actionableTip: 'Ensure rent/mortgage stays within 28–30% of take-home pay; audit society dues annually.',
      };
    }
    if (name.includes('emi') || name.includes('loan') || categoryType === 'debt') {
      return {
        rationale: 'Mandatory debt obligation locked to safeguard credit score.',
        actionableTip: 'Prioritize prompt auto-debit payments to maintain a strong 750+ CIBIL score.',
      };
    }
    return {
      rationale: `User-locked allocation of ₹${Math.abs(difference === 0 ? 0 : difference).toLocaleString('en-IN')} preserved without disruption.`,
      actionableTip: 'Locked categories are excluded from automated budget trimming.',
    };
  }

  // Tailored by category topic
  if (name.includes('rent') || name.includes('housing') || name.includes('mortgage')) {
    return {
      rationale: difference < 0 ? `Housing allocation maintained near minimum viable shelter standard.` : 'Essential housing budget steady.',
      actionableTip: 'Audit electricity tariffs, property tax, and maintenance charges annually for hidden leaks.',
    };
  }

  if (name.includes('grocer') || name.includes('food') || name.includes('pantry') || name.includes('supermarket')) {
    return {
      rationale: difference < 0
        ? `Optimized groceries by ₹${Math.abs(difference).toLocaleString('en-IN')} via smart batch planning.`
        : 'Nutritional pantry baseline well-aligned with take-home pay.',
      actionableTip: 'Plan weekly meals around seasonal produce; bulk buying staple grains saves ~18% annually.',
    };
  }

  if (name.includes('dining') || name.includes('restaurant') || name.includes('zomato') || name.includes('swiggy') || name.includes('cafe')) {
    return {
      rationale: difference < 0
        ? `Curtailed takeout & dining by ₹${Math.abs(difference).toLocaleString('en-IN')}/mo (unlocking ₹${(Math.abs(difference) * 12).toLocaleString('en-IN')}/yr for wealth goals).`
        : 'Social dining within healthy flexible boundary.',
      actionableTip: 'Limit app deliveries to 2 weekend social milestones; try home-gourmet dinners on weeknights.',
    };
  }

  if (name.includes('shopping') || name.includes('fashion') || name.includes('gadget') || name.includes('lifestyle')) {
    return {
      rationale: difference < 0
        ? `Trimmed flexible shopping by ₹${Math.abs(difference).toLocaleString('en-IN')} to accelerate capital reserves.`
        : 'Personal shopping allowance in healthy balance with cashflow.',
      actionableTip: 'Use a 14-day cooling-off wishlist rule for non-essential purchases above ₹2,000.',
    };
  }

  if (name.includes('utilit') || name.includes('power') || name.includes('electricity') || name.includes('water')) {
    return {
      rationale: 'Core utility baseline maintained for home operations.',
      actionableTip: 'Audit home Wi-Fi tier and mobile recharge packs against actual data consumption.',
    };
  }

  if (name.includes('transport') || name.includes('commute') || name.includes('fuel') || name.includes('petrol') || name.includes('cab')) {
    return {
      rationale: difference < 0
        ? `Transit costs optimized by ₹${Math.abs(difference).toLocaleString('en-IN')}.`
        : 'Transit and commute budget matches typical working routines.',
      actionableTip: 'Combine weekend errands into single multi-stop routes; utilize metro passes during peak traffic.',
    };
  }

  if (name.includes('subscript') || name.includes('ott') || name.includes('stream') || name.includes('netflix')) {
    return {
      rationale: difference < 0
        ? `Pruned recurring digital subscriptions by ₹${Math.abs(difference).toLocaleString('en-IN')}/mo.`
        : 'Digital entertainment stack lean and active.',
      actionableTip: 'Rotate OTT platforms: keep only one active streaming service at a time, then switch.',
    };
  }

  if (name.includes('sip') || name.includes('invest') || name.includes('mutual') || name.includes('wealth') || categoryType === 'savings') {
    return {
      rationale: `Compounding allocation boosted to ₹${difference > 0 ? `+${difference.toLocaleString('en-IN')}` : 'steady target'}/mo for long-term wealth acceleration.`,
      actionableTip: 'Automate broad-market equity index SIPs on salary credit day for friction-free compounding.',
    };
  }

  if (name.includes('emergency') || name.includes('contingency')) {
    return {
      rationale: 'Liquid reserve allocation to shield your household from unexpected volatility.',
      actionableTip: 'Park emergency funds in sweep-in bank FDs or high-grade liquid mutual funds.',
    };
  }

  if (name.includes('emi') || name.includes('loan') || categoryType === 'debt') {
    return {
      rationale: 'Non-negotiable debt liability prioritized to reduce long-term interest churn.',
      actionableTip: 'Prepay 5% principal on annual bonus receipt to eliminate multiple loan tenures early.',
    };
  }

  if (name.includes('health') || name.includes('gym') || name.includes('fitness') || name.includes('medical')) {
    return {
      rationale: 'Wellness and medical protection preserved as a core foundation.',
      actionableTip: 'Prioritize annual preventive health checkups and comprehensive base health insurance.',
    };
  }

  // Fallbacks by CategoryType
  if (categoryType === 'want') {
    return {
      rationale: difference < 0
        ? `Rebalanced flexible discretionary spend by ₹${Math.abs(difference).toLocaleString('en-IN')} to safeguard monthly surplus.`
        : 'Discretionary comfort spending within recommended limits.',
      actionableTip: 'Review flexible envelopes mid-month to stay comfortably ahead of planned targets.',
    };
  }

  if (categoryType === 'need') {
    return {
      rationale: difference < 0
        ? `Needs envelope trimmed to maintain the healthy 50% essentials benchmark.`
        : 'Essential household commitments fully covered.',
      actionableTip: 'Audit recurring bills periodically to secure competitive market pricing.',
    };
  }

  return {
    rationale: 'Allocation optimized for balanced mathematical cashflow harmony.',
    actionableTip: 'Keep automated tracking active to maintain effortless budget awareness.',
  };
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

export function runClientOptimizer(request: OptimizationRequest): OptimizationResponse {
  const {
    monthlyNetIncome,
    strategy,
    categories,
    monthlyDebtObligations = 0,
    targetMonthlySavingsGoal = 0,
  } = request;

  let totalCurrentBudget = 0;
  let totalCurrentActual = 0;

  for (const cat of categories) {
    totalCurrentBudget += cat.currentBudget;
    totalCurrentActual += cat.actualSpend;
  }

  let minEssentialNeeds = 0;
  for (const cat of categories) {
    if (cat.type === 'need' || cat.type === 'debt') {
      const floor = cat.minAllowed ?? Math.round(cat.currentBudget * 0.75);
      minEssentialNeeds += cat.isLocked ? cat.currentBudget : floor;
    }
  }

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
      targetSavingsRatio = 0.35;
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

  const targetNeedsBudget = Math.round(monthlyNetIncome * targetNeedsRatio);
  const targetWantsBudget = Math.round(monthlyNetIncome * targetWantsRatio);

  const results: OptimizedCategoryResult[] = [];
  let allocatedNeeds = 0;
  let allocatedWants = 0;
  let allocatedSavings = 0;
  let allocatedDebt = 0;

  const needCats = categories.filter((c) => c.type === 'need');
  const wantCats = categories.filter((c) => c.type === 'want');
  const savingsCats = categories.filter((c) => c.type === 'savings');
  const debtCats = categories.filter((c) => c.type === 'debt');

  const totalNeedCurrent = needCats.reduce((sum, c) => sum + c.currentBudget, 0);
  const totalWantCurrent = wantCats.reduce((sum, c) => sum + c.currentBudget, 0);
  const totalSavingsCurrent = savingsCats.reduce((sum, c) => sum + c.currentBudget, 0);

  // NEEDS
  for (const cat of needCats) {
    if (cat.isLocked) {
      const advice = getTailoredCategoryAdvice(cat.name, 'need', 0, true);
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'need',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: cat.currentBudget,
        difference: 0,
        percentageOfIncome: Math.round((cat.currentBudget / monthlyNetIncome) * 100),
        rationale: advice.rationale,
        actionableTip: advice.actionableTip,
      });
      allocatedNeeds += cat.currentBudget;
      continue;
    }

    let recommended = cat.currentBudget;
    if (totalNeedCurrent > targetNeedsBudget) {
      const reductionRatio = Math.max(0.85, targetNeedsBudget / totalNeedCurrent);
      recommended = Math.max(cat.minAllowed ?? Math.round(cat.currentBudget * 0.8), Math.round(cat.currentBudget * reductionRatio));
    }

    const diff = recommended - cat.currentBudget;
    const advice = getTailoredCategoryAdvice(cat.name, 'need', diff, false);
    allocatedNeeds += recommended;
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'need',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: diff,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale: advice.rationale,
      actionableTip: advice.actionableTip,
    });
  }

  // WANTS
  for (const cat of wantCats) {
    if (cat.isLocked) {
      const advice = getTailoredCategoryAdvice(cat.name, 'want', 0, true);
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'want',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: cat.currentBudget,
        difference: 0,
        percentageOfIncome: Math.round((cat.currentBudget / monthlyNetIncome) * 100),
        rationale: advice.rationale,
        actionableTip: advice.actionableTip,
      });
      allocatedWants += cat.currentBudget;
      continue;
    }

    let recommended = cat.currentBudget;
    if (totalWantCurrent > targetWantsBudget) {
      const cutbackRatio = Math.max(0.55, targetWantsBudget / (totalWantCurrent || 1));
      recommended = Math.max(cat.minAllowed ?? 500, Math.round(cat.currentBudget * cutbackRatio));
    }

    const diff = recommended - cat.currentBudget;
    const advice = getTailoredCategoryAdvice(cat.name, 'want', diff, false);
    allocatedWants += recommended;
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'want',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: diff,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale: advice.rationale,
      actionableTip: advice.actionableTip,
    });
  }

  // DEBT
  for (const cat of debtCats) {
    const recommended = cat.currentBudget;
    allocatedDebt += recommended;
    const advice = getTailoredCategoryAdvice(cat.name, 'debt', 0, cat.isLocked);
    results.push({
      id: cat.id,
      name: cat.name,
      type: 'debt',
      currentBudget: cat.currentBudget,
      actualSpend: cat.actualSpend,
      recommendedBudget: recommended,
      difference: 0,
      percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
      rationale: advice.rationale,
      actionableTip: advice.actionableTip,
    });
  }

  // SAVINGS
  const remainingForSavings = Math.max(0, monthlyNetIncome - allocatedNeeds - allocatedWants - allocatedDebt);
  allocatedSavings = remainingForSavings;

  if (savingsCats.length === 0) {
    const advice = getTailoredCategoryAdvice('Emergency & Wealth Fund', 'savings', remainingForSavings, false);
    results.push({
      id: 'cat_savings_auto',
      name: 'Emergency & Wealth Fund',
      type: 'savings',
      currentBudget: 0,
      actualSpend: 0,
      recommendedBudget: remainingForSavings,
      difference: remainingForSavings,
      percentageOfIncome: Math.round((remainingForSavings / monthlyNetIncome) * 100),
      rationale: advice.rationale,
      actionableTip: advice.actionableTip,
    });
  } else {
    const totalExistingSavingsWeight = savingsCats.reduce((s, c) => s + (c.currentBudget || 1), 0);
    for (const cat of savingsCats) {
      const weight = (cat.currentBudget || 1) / (totalExistingSavingsWeight || 1);
      const recommended = Math.round(remainingForSavings * weight);
      const diff = recommended - cat.currentBudget;
      const advice = getTailoredCategoryAdvice(cat.name, 'savings', diff, cat.isLocked);
      results.push({
        id: cat.id,
        name: cat.name,
        type: 'savings',
        currentBudget: cat.currentBudget,
        actualSpend: cat.actualSpend,
        recommendedBudget: recommended,
        difference: diff,
        percentageOfIncome: Math.round((recommended / monthlyNetIncome) * 100),
        rationale: advice.rationale,
        actionableTip: advice.actionableTip,
      });
    }
  }

  const totalRecommendedBudget = allocatedNeeds + allocatedWants + allocatedSavings + allocatedDebt;
  const currentSavingsRate = monthlyNetIncome > 0 ? Math.round((totalSavingsCurrent / monthlyNetIncome) * 100) : 0;
  const optimizedSavingsRate = monthlyNetIncome > 0 ? Math.round((allocatedSavings / monthlyNetIncome) * 100) : 0;
  const projectedAnnualWealthIncrease = allocatedSavings * 12;

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
