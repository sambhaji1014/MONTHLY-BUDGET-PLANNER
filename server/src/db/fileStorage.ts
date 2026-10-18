import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  BillSubscription,
  UserRecord,
} from '../models/types.js';
import { initialCategories, initialTransactions, initialGoals, initialBills } from '../models/mockDb.js';
import { initialUsers } from '../models/userDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface StoredData {
  users: UserRecord[];
  categories: (BudgetCategory & { userId: string })[];
  transactions: (Transaction & { userId: string })[];
  goals: (SavingsGoal & { userId: string })[];
  bills: (BillSubscription & { userId: string })[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadStoredData(): StoredData {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.categories)) {
        return parsed;
      }
    } catch (err) {
      console.warn('⚠️ Error reading persistent db.json, re-initializing with seeds:', err);
    }
  }

  // Initial Seed
  const initialData: StoredData = {
    users: [...initialUsers],
    categories: initialCategories.map((c) => ({
      ...c,
      userId: 'usr_sambhaji_jadhav',
    })),
    transactions: initialTransactions.map((t) => ({
      ...t,
      userId: 'usr_sambhaji_jadhav',
    })),
    goals: initialGoals.map((g) => ({
      ...g,
      userId: 'usr_sambhaji_jadhav',
    })),
    bills: initialBills.map((b) => ({
      ...b,
      userId: 'usr_sambhaji_jadhav',
    })),
  };

  saveStoredData(initialData);
  return initialData;
}

export function saveStoredData(data: StoredData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to persist db.json:', err);
  }
}
