import { Router } from 'express';
import {
  getBudget,
  updateIncome,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/budgetControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Budget overview & income configuration
router.get('/', optionalAuth, getBudget);
router.put('/income', optionalAuth, updateIncome);

// Category spending envelopes
router.post('/categories', optionalAuth, createCategory);
router.put('/categories/:id', optionalAuth, updateCategory);
router.delete('/categories/:id', optionalAuth, deleteCategory);

export default router;
