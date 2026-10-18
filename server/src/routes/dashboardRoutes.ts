import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/dashboard/summary (supports ?month=YYYY-MM)
router.get('/summary', optionalAuth, getDashboardSummary);

export default router;
