import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import billRoutes from './billRoutes.js';
import goalRoutes from './goalRoutes.js';
import optimizerRoutes from './optimizerRoutes.js';
import syncRoutes from './syncRoutes.js';

import { getDashboardSummary } from '../controllers/dashboardControllers.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import {
  initiateGoogleOAuth,
  handleGoogleCallback,
  initiateAppleOAuth,
  handleAppleCallback,
  verifyAuthToken,
  logClientError,
} from '../controllers/oauthControllers.js';

const router = Router();

// ================= MODULAR RESOURCE ROUTES =================
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/budget', budgetRoutes);
router.use('/categories', budgetRoutes); // Also mounted at /api/categories for REST standards
router.use('/transactions', transactionRoutes);
router.use('/bills', billRoutes);
router.use('/goals', goalRoutes);
router.use('/optimizer', optimizerRoutes);
router.use('/sync', syncRoutes);
router.use('/user/sync', syncRoutes);

// ================= BACKWARD-COMPATIBLE ENDPOINTS =================
// Frontend calls /api/summary directly
router.get('/summary', optionalAuth, getDashboardSummary);

// OAuth Endpoints (under /api/auth)
router.get('/auth/google', initiateGoogleOAuth);
router.get('/auth/google/callback', handleGoogleCallback);
router.get('/auth/apple', initiateAppleOAuth);
router.get('/auth/apple/callback', handleAppleCallback);
router.post('/auth/apple/callback', handleAppleCallback);
router.post('/auth/verify-token', verifyAuthToken);
router.post('/auth/log-error', logClientError);

export default router;
