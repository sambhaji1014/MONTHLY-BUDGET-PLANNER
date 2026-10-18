import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import {
  initiateGoogleOAuth,
  handleGoogleCallback,
  initiateAppleOAuth,
  handleAppleCallback,
  verifyAuthToken,
} from './controllers/oauthControllers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'WealthWise API Service',
    currency: 'INR (₹)',
    timestamp: new Date().toISOString(),
  });
});

// Top-level OAuth Routes (e.g. /auth/google, /auth/apple)
app.get('/auth/google', initiateGoogleOAuth);
app.get('/auth/google/callback', handleGoogleCallback);
app.get('/auth/apple', initiateAppleOAuth);
app.get('/auth/apple/callback', handleAppleCallback);
app.post('/auth/apple/callback', handleAppleCallback);
app.post('/auth/verify-token', verifyAuthToken);

// Mount REST API (e.g. /api/...)
app.use('/api', apiRoutes);

// Error Handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('WealthWise Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✨ WealthWise Server running on port ${PORT}`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/health`);
  console.log(`💰 API Root: http://localhost:${PORT}/api/summary`);
  console.log(`🔐 Google OAuth Endpoint: http://localhost:${PORT}/auth/google`);
  console.log(`🍎 Apple OAuth Endpoint: http://localhost:${PORT}/auth/apple`);
});

export default app;
