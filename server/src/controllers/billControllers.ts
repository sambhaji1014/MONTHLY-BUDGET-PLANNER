import { Response } from 'express';
import { repository } from '../db/repository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * GET /api/bills
 * Lists user recurring bills and subscriptions with statuses
 */
export const getBills = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const bills = await repository.getBills(userId);

    const upcomingTotal = bills
      .filter((b) => b.status === 'upcoming')
      .reduce((sum, b) => sum + b.amount, 0);

    const paidTotal = bills
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);

    return res.json({
      success: true,
      count: bills.length,
      upcomingTotal,
      paidTotal,
      data: bills,
    });
  } catch (error: any) {
    console.error('getBills error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve bills.' });
  }
};

/**
 * POST /api/bills
 * Creates a new recurring bill or subscription
 */
export const createBill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const { name, amount, billingCycle, dueDate, category, paymentMethod, isAutoDebit } = req.body;

    if (!name || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Bill name, amount, and due date are required.',
      });
    }

    const bill = await repository.createBill(userId, {
      name,
      amount: Number(amount),
      billingCycle: billingCycle || 'monthly',
      dueDate,
      category: category || 'Bills & Utilities',
      paymentMethod: paymentMethod || 'Auto Debit',
      isAutoDebit: isAutoDebit !== undefined ? Boolean(isAutoDebit) : true,
      status: 'upcoming',
    });

    return res.status(201).json({
      success: true,
      message: `Bill "${bill.name}" created.`,
      data: bill,
    });
  } catch (error: any) {
    console.error('createBill error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create bill.' });
  }
};

/**
 * PATCH /api/bills/:id/pay
 * Marks a bill as paid
 */
export const markBillPaid = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_sambhaji_jadhav';
    const id = String(req.params.id);

    const updated = await repository.markBillPaid(userId, id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Bill not found.' });
    }

    return res.json({
      success: true,
      message: `Bill "${updated.name}" marked as paid.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('markBillPaid error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update bill.' });
  }
};
