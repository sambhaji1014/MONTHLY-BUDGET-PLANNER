import { Router } from 'express';
import { getFullSync, saveFullSync } from '../controllers/syncController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Full cloud synchronization endpoints
router.get('/', optionalAuth, getFullSync);
router.post('/', optionalAuth, saveFullSync);

export default router;
