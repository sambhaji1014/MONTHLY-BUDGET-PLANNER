import { Router } from 'express';
import {
  getOptimizerInsights,
  simulateMove,
} from '../controllers/optimizerControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Overspending analytics & automated financial insights
router.post('/insights', optionalAuth, getOptimizerInsights);
router.post('/', optionalAuth, getOptimizerInsights); // Alias for compatibility

// What-If financial move simulation
router.post('/simulate-move', optionalAuth, simulateMove);

export default router;
