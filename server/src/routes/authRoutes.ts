import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  checkEmail,
} from '../controllers/authControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/login-password', login); // Alias for compatibility
router.post('/refresh-token', refreshToken);
router.post('/check-email', checkEmail);

// Protected Authentication Endpoints
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
