import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { runSmartBudgetOptimizer } from '../services/optimizerService.js';
import { calculateBudgetHealthScore } from '../utils/financialCalculations.js';

/**
 * POST /api/optimizer/insights
 * Evaluates category overspending and generates automated financial insights
 */
export const getOptimizerInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { strategy = 'balanced_50_30_20' } = req.body;

    const user = await repository.findUserById(userId);
    const monthlyIncome = user?.preferences?.monthlyIncome || 120000;
    const categories = await repository.getCategories(userId);

    const optimizationResult = runSmartBudgetOptimizer({
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
    });

    // Detect overspent envelopes
    const overspentCategories = categories
      .filter((c) => c.spentAmount > c.allocatedAmount)
      .map((c) => ({
        id: c.id,
        name: c.name,
        allocatedAmount: c.allocatedAmount,
        spentAmount: c.spentAmount,
        overage: c.spentAmount - c.allocatedAmount,
        utilizationPercent: c.allocatedAmount > 0 ? Math.round((c.spentAmount / c.allocatedAmount) * 100) : 0,
      }));

    return res.json({
      success: true,
      data: {
        strategy,
        monthlyNetIncome: monthlyIncome,
        overspentCategoriesCount: overspentCategories.length,
        overspentCategories,
        recommendations: optimizationResult.categories,
        breakdown: optimizationResult.breakdown,
        savingsRateCurrent: optimizationResult.currentSavingsRate,
        savingsRateOptimized: optimizationResult.optimizedSavingsRate,
        status: optimizationResult.status,
      },
    });
  } catch (error: any) {
    console.error('getOptimizerInsights error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate optimizer insights.' });
  }
};

/**
 * POST /api/optimizer/simulate-move
 * Calculates the hypothetical impact of modifying category budgets or adding large expenses
 * on the user's overall net surplus and financial health score.
 */
export const simulateMove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const {
      proposedIncome,
      categoryAdjustments, // e.g. [{ id: 'cat-1', name: 'Shopping & Leisure', proposedAmount: 5000 }]
      hypotheticalExpense, // e.g. { title: 'MacBook Pro', amount: 120000, category: 'Shopping & Leisure', isOneOff: true }
    } = req.body;

    const user = await repository.findUserById(userId);
    const baselineIncome = proposedIncome ? Number(proposedIncome) : (user?.preferences?.monthlyIncome || 120000);
    const categories = await repository.getCategories(userId);

    // Current baseline metrics
    const baselineTotalAllocated = categories.reduce((s, c) => s + c.allocatedAmount, 0);
    const baselineTotalSpent = categories.reduce((s, c) => s + c.spentAmount, 0);
    const baselineSurplus = baselineIncome - baselineTotalSpent;
    const baselineSavingsRate = baselineIncome > 0 ? Math.round((Math.max(0, baselineSurplus) / baselineIncome) * 100) : 0;

    // Simulate adjustments
    let simulatedSpent = baselineTotalSpent;
    let simulatedAllocated = baselineTotalAllocated;

    const simulatedCategories = categories.map((cat) => {
      const adjustment = (categoryAdjustments || []).find(
        (adj: any) => adj.id === cat.id || adj.name?.toLowerCase() === cat.name.toLowerCase()
      );
      const newAllocation = adjustment ? Number(adjustment.proposedAmount) : cat.allocatedAmount;
      simulatedAllocated += (newAllocation - cat.allocatedAmount);

      return {
        ...cat,
        baselineAllocation: cat.allocatedAmount,
        simulatedAllocation: newAllocation,
        allocationDelta: newAllocation - cat.allocatedAmount,
      };
    });

    let extraExpenseImpact = 0;
    if (hypotheticalExpense && Number(hypotheticalExpense.amount) > 0) {
      extraExpenseImpact = Number(hypotheticalExpense.amount);
      simulatedSpent += extraExpenseImpact;
    }

    const simulatedSurplus = baselineIncome - simulatedSpent;
    const simulatedSavingsRate = baselineIncome > 0 ? Math.round((Math.max(0, simulatedSurplus) / baselineIncome) * 100) : 0;
    const surplusDelta = simulatedSurplus - baselineSurplus;

    // Evaluate health score under simulation
    const simulatedHealth = calculateBudgetHealthScore({
      savingsRate: simulatedSavingsRate,
      needsRatio: 50,
      debtToIncomeRatio: 10,
      hasEmergencyFund: true,
      overspendingCategoriesCount: simulatedCategories.filter((c) => c.spentAmount > c.simulatedAllocation).length,
    });

    let feasibility: 'Safe & Sustainable' | 'Manageable with Trims' | 'Deficit Warning' = 'Safe & Sustainable';
    if (simulatedSurplus < 0) {
      feasibility = 'Deficit Warning';
    } else if (simulatedSavingsRate < 15) {
      feasibility = 'Manageable with Trims';
    }

    return res.json({
      success: true,
      data: {
        baseline: {
          monthlyIncome: baselineIncome,
          totalSpent: baselineTotalSpent,
          totalAllocated: baselineTotalAllocated,
          netSurplus: baselineSurplus,
          savingsRate: baselineSavingsRate,
        },
        simulated: {
          monthlyIncome: baselineIncome,
          totalSpent: simulatedSpent,
          totalAllocated: simulatedAllocated,
          netSurplus: simulatedSurplus,
          savingsRate: simulatedSavingsRate,
          surplusDelta,
          extraExpenseAdded: extraExpenseImpact,
        },
        assessment: {
          feasibility,
          projectedHealthScore: simulatedHealth.score,
          rating: simulatedHealth.rating,
          actionableAdvice: simulatedSurplus >= 0
            ? `Your cushion remains positive (+₹${simulatedSurplus.toLocaleString('en-IN')}). You can comfortably absorb this move.`
            : `Warning: This scenario results in a monthly deficit of ₹${Math.abs(simulatedSurplus).toLocaleString('en-IN')}. Consider spreading over multiple months or trimming flexible wants.`,
        },
        categories: simulatedCategories,
      },
    });
  } catch (error: any) {
    console.error('simulateMove error:', error);
    return res.status(500).json({ success: false, error: 'Simulation calculation failed.' });
  }
};
