import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * GET /api/transactions
 * Lists transactions with optional filtering by month (YYYY-MM), type, and category
 */
export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { month, type, category } = req.query;

    const transactions = await repository.getTransactions(userId, {
      month: typeof month === 'string' ? month : undefined,
      type: typeof type === 'string' ? type : undefined,
      category: typeof category === 'string' ? category : undefined,
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return res.json({
      success: true,
      count: transactions.length,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        netCashflow: totalIncome - totalExpense,
      },
      data: transactions,
    });
  } catch (error: any) {
    console.error('getTransactions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve transactions.' });
  }
};

/**
 * POST /api/transactions
 * Creates a financial entry (income or expense).
 * Automatically increments category consumption counter.
 */
export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const {
      title,
      amount,
      type,
      category,
      categoryType,
      date,
      paymentMethod,
      isRecurring,
      notes,
      tags,
    } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, amount, type, and category are required fields.',
      });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number.',
      });
    }

    const transaction = await repository.createTransaction(userId, {
      title,
      amount: Number(amount),
      type,
      category,
      categoryType: categoryType || 'want',
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'UPI',
      isRecurring: Boolean(isRecurring),
      notes,
      tags: tags || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded and category counter synchronized.',
      data: transaction,
    });
  } catch (error: any) {
    console.error('createTransaction error:', error);
    return res.status(500).json({ success: false, error: 'Failed to record transaction.' });
  }
};

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction and automatically reverses category consumption counter.
 */
export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const id = String(req.params.id);

    const deleted = await repository.deleteTransaction(userId, id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Transaction not found.' });
    }

    return res.json({
      success: true,
      message: 'Transaction deleted and category consumption counter adjusted.',
      data: deleted,
    });
  } catch (error: any) {
    console.error('deleteTransaction error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete transaction.' });
  }
};
