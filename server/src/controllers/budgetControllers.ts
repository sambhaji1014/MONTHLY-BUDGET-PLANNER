import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * GET /api/budget
 * Retrieves monthly take-home income and all active category spending envelopes
 */
export const getBudget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const user = await repository.findUserById(userId);
    const monthlyIncome = user?.preferences?.monthlyIncome || 120000;
    const categories = await repository.getCategories(userId);

    const totalAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.spentAmount, 0);
    const unallocatedCushion = monthlyIncome - totalAllocated;

    return res.json({
      success: true,
      data: {
        monthlyIncome,
        categories,
        totalAllocated,
        totalSpent,
        unallocatedCushion,
        allocationRatio: monthlyIncome > 0 ? Math.round((totalAllocated / monthlyIncome) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('getBudget error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve budget plan.' });
  }
};

/**
 * PUT /api/budget/income
 * Updates the user's monthly baseline take-home income
 */
export const updateIncome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { monthlyIncome } = req.body;

    if (!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid monthly income number.' });
    }

    const user = await repository.findUserById(userId);
    if (user) {
      user.preferences = {
        ...user.preferences,
        monthlyIncome: Number(monthlyIncome),
      };
    }

    return res.json({
      success: true,
      message: 'Monthly take-home income updated successfully.',
      monthlyIncome: Number(monthlyIncome),
    });
  } catch (error: any) {
    console.error('updateIncome error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update monthly income.' });
  }
};

/**
 * POST /api/categories
 * Creates a new category spending envelope
 */
export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { name, type, allocatedAmount, color, icon, isLocked } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Category name and type are required.' });
    }

    const category = await repository.createCategory(userId, {
      name,
      type,
      allocatedAmount: Number(allocatedAmount || 0),
      color: color || '#C5A15B',
      icon: icon || 'Tag',
      isLocked: Boolean(isLocked),
    });

    return res.status(201).json({
      success: true,
      message: `Category envelope "${category.name}" created.`,
      data: category,
    });
  } catch (error: any) {
    console.error('createCategory error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create category envelope.' });
  }
};

/**
 * PUT /api/categories/:id
 * Updates an existing category envelope (spending limit, color, lock state)
 */
export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const id = String(req.params.id);
    const { name, type, allocatedAmount, color, icon, isLocked } = req.body;

    const updated = await repository.updateCategory(userId, id, {
      ...(name && { name }),
      ...(type && { type }),
      ...(allocatedAmount !== undefined && { allocatedAmount: Number(allocatedAmount) }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(isLocked !== undefined && { isLocked: Boolean(isLocked) }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    return res.json({
      success: true,
      message: `Category envelope updated.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('updateCategory error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update category.' });
  }
};

/**
 * DELETE /api/categories/:id
 * Removes a category envelope
 */
export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const id = String(req.params.id);

    const success = await repository.deleteCategory(userId, id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    return res.json({ success: true, message: 'Category envelope deleted successfully.' });
  } catch (error: any) {
    console.error('deleteCategory error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete category.' });
  }
};
