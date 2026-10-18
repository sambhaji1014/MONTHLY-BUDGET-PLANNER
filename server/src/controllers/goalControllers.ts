import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * GET /api/goals
 * Lists user savings goals with progress percentages and balances
 */
export const getGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const goals = await repository.getGoals(userId);

    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalAccumulated = goals.reduce((s, g) => s + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

    const enrichedGoals = goals.map((g) => ({
      ...g,
      progressPercent: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0,
      remainingAmount: Math.max(0, g.targetAmount - g.currentAmount),
    }));

    return res.json({
      success: true,
      count: goals.length,
      totals: {
        target: totalTarget,
        accumulated: totalAccumulated,
        overallProgress,
      },
      data: enrichedGoals,
    });
  } catch (error: any) {
    console.error('getGoals error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve savings goals.' });
  }
};

/**
 * POST /api/goals
 * Creates a new targeted savings goal
 */
export const createGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { title, targetAmount, currentAmount, targetDate, category, priority, color } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Title and target amount are required.',
      });
    }

    const goal = await repository.createGoal(userId, {
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: targetDate || '2027-12-31',
      category: category || 'General Wealth',
      priority: priority || 'medium',
      color: color || '#3A6046',
    });

    return res.status(201).json({
      success: true,
      message: `Savings goal "${goal.title}" created.`,
      data: goal,
    });
  } catch (error: any) {
    console.error('createGoal error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create goal.' });
  }
};

/**
 * PATCH /api/goals/:id/contribute
 * Records a contribution to a savings goal
 */
export const contributeToGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const id = String(req.params.id);
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please specify a positive contribution amount.',
      });
    }

    const updated = await repository.contributeToGoal(userId, id, Number(amount));
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Goal not found.' });
    }

    return res.json({
      success: true,
      message: `Contributed ₹${Number(amount).toLocaleString('en-IN')} toward ${updated.title}.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('contributeToGoal error:', error);
    return res.status(500).json({ success: false, error: 'Failed to record contribution.' });
  }
};
