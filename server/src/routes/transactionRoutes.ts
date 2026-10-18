import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../controllers/transactionControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Transactions CRUD with automated category consumption counter sync
router.get('/', optionalAuth, getTransactions);
router.post('/', optionalAuth, createTransaction);
router.delete('/:id', optionalAuth, deleteTransaction);

export default router;
