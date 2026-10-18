import { PrismaClient } from '@prisma/client';
import { ENV } from '../config/env.js';

let prisma: PrismaClient | null = null;

if (ENV.DATABASE_URL) {
  try {
    prisma = new PrismaClient({
      log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    console.log('🐘 Initialized Prisma Client configured for PostgreSQL');
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL via Prisma. Falling back to persistent in-memory repository.', err);
    prisma = null;
  }
} else {
  console.log('ℹ️ No DATABASE_URL provided. Operating in high-performance resilient in-memory repository mode.');
}

export { prisma };
