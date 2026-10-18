import { Router } from 'express';
import {
  getGoals,
  createGoal,
  contributeToGoal,
} from '../controllers/goalControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Savings Goals tracking & contributions
router.get('/', optionalAuth, getGoals);
router.post('/', optionalAuth, createGoal);
router.patch('/:id/contribute', optionalAuth, contributeToGoal);

export default router;
