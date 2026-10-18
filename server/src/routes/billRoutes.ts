import { Router } from 'express';
import {
  getBills,
  createBill,
  markBillPaid,
} from '../controllers/billControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Recurring bills & subscriptions
router.get('/', optionalAuth, getBills);
router.post('/', optionalAuth, createBill);
router.patch('/:id/pay', optionalAuth, markBillPaid);

export default router;
