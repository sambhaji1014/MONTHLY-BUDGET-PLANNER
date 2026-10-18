import { prisma } from './prisma.js';
import {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  BillSubscription,
  UserRecord,
} from '../models/types.js';
import { loadStoredData, saveStoredData, StoredData } from './fileStorage.js';

// Resilient persistent state store
const memStore: StoredData = loadStoredData();

function resolveUserId(idOrEmail: string): string {
  if (!idOrEmail) return 'usr_sambhaji_jadhav';
  const clean = idOrEmail.trim().toLowerCase();
  const user = memStore.users.find(
    (u) => u.id === idOrEmail || u.email.toLowerCase() === clean
  );
  if (user) return user.id;
  if (clean.includes('sambhaji') || clean.includes('jadhav')) {
    return 'usr_sambhaji_jadhav';
  }
  return idOrEmail;
}

export const repository = {
  // ================= USERS =================
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    if (prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { email: normalized } });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            phone: u.phone || undefined,
            dateOfBirth: u.dateOfBirth || undefined,
            password: u.passwordHash || undefined,
            preferences: (u.preferences as any) || {
              currency: 'INR',
              theme: 'luxury',
              riskTolerance: 'growth',
              monthlySavingsTargetPercent: 25,
            },
            isNewUser: u.isNewUser,
            isGuest: u.isGuest,
            createdAt: u.createdAt.toISOString(),
            lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : undefined,
          };
        }
      } catch (err) {
        console.warn('Prisma query error in findUserByEmail, checking in-memory fallback:', err);
      }
    }
    const memUser = memStore.users.find((u) => u.email.trim().toLowerCase() === normalized);
    return memUser ? { ...memUser } : null;
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    if (prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            phone: u.phone || undefined,
            dateOfBirth: u.dateOfBirth || undefined,
            password: u.passwordHash || undefined,
            preferences: (u.preferences as any) || {
              currency: 'INR',
              theme: 'luxury',
              riskTolerance: 'growth',
              monthlySavingsTargetPercent: 25,
            },
            isNewUser: u.isNewUser,
            isGuest: u.isGuest,
            createdAt: u.createdAt.toISOString(),
            lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : undefined,
          };
        }
      } catch (err) {
        console.warn('Prisma query error in findUserById, falling back:', err);
      }
    }
    const memUser = memStore.users.find((u) => u.id === id);
    return memUser ? { ...memUser } : null;
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    phone?: string;
    preferences?: any;
  }): Promise<UserRecord> {
    const normalized = data.email.trim().toLowerCase();
    const newUserRecord: UserRecord = {
      id: `usr_${Date.now()}`,
      email: normalized,
      name: data.name.trim(),
      phone: data.phone,
      password: data.passwordHash,
      preferences: data.preferences || {
        currency: 'INR',
        theme: 'luxury',
        notificationAlerts: true,
        riskTolerance: 'growth',
        monthlySavingsTargetPercent: 25,
        monthlyIncome: 120000,
      },
      isNewUser: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    if (prisma) {
      try {
        const created = await prisma.user.create({
          data: {
            id: newUserRecord.id,
            email: normalized,
            name: data.name.trim(),
            passwordHash: data.passwordHash,
            phone: data.phone,
            preferences: newUserRecord.preferences as any,
            isNewUser: false,
          },
        });
        newUserRecord.id = created.id;
      } catch (err) {
        console.warn('Prisma createUser failed, storing in in-memory store:', err);
      }
    }

    memStore.users.push(newUserRecord);

    // Seed default standard category envelopes for new user
    const defaultCategories: BudgetCategory[] = [
      { id: `cat-${Date.now()}-1`, name: 'Rent & Housing', type: 'need', allocatedAmount: 28000, spentAmount: 0, color: '#C5A15B', icon: 'Home', isLocked: true },
      { id: `cat-${Date.now()}-2`, name: 'Bills & Utilities', type: 'need', allocatedAmount: 7000, spentAmount: 0, color: '#6A7F94', icon: 'Zap' },
      { id: `cat-${Date.now()}-3`, name: 'Groceries & Food', type: 'need', allocatedAmount: 14000, spentAmount: 0, color: '#4E775B', icon: 'ShoppingBag' },
      { id: `cat-${Date.now()}-4`, name: 'Travel & Commute', type: 'need', allocatedAmount: 6500, spentAmount: 0, color: '#88929A', icon: 'Car' },
      { id: `cat-${Date.now()}-5`, name: 'Shopping & Leisure', type: 'want', allocatedAmount: 7000, spentAmount: 0, color: '#BA5A5A', icon: 'Tag' },
      { id: `cat-${Date.now()}-6`, name: 'Subscriptions & Entertainment', type: 'want', allocatedAmount: 3500, spentAmount: 0, color: '#A080C0', icon: 'Film' },
    ];
    defaultCategories.forEach((c) => {
      memStore.categories.push({ ...c, userId: newUserRecord.id });
    });

    saveStoredData(memStore);
    return newUserRecord;
  },

  async updateUserRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const resolvedId = resolveUserId(userId);
    if (prisma) {
      try {
        await prisma.user.update({
          where: { id: resolvedId },
          data: { refreshToken },
        });
        return;
      } catch (err) {
        console.warn('Prisma updateUserRefreshToken failed, using in-memory store:', err);
      }
    }
    const user = memStore.users.find((u) => u.id === resolvedId);
    if (user) {
      (user as any).refreshToken = refreshToken;
      saveStoredData(memStore);
    }
  },

  // ================= CATEGORIES / ENVELOPES =================
  async getCategories(userIdOrEmail: string): Promise<BudgetCategory[]> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const cats = await prisma.category.findMany({
          where: { userId: resolvedId },
          orderBy: { createdAt: 'asc' },
        });
        if (cats.length > 0) {
          return cats.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
            allocatedAmount: c.allocatedAmount,
            spentAmount: c.spentAmount,
            color: c.color,
            icon: c.icon,
            isLocked: c.isLocked,
          }));
        }
      } catch (err) {
        console.warn('Prisma getCategories failed, falling back to in-memory store:', err);
      }
    }

    let userCats = memStore.categories.filter((c) => c.userId === resolvedId);
    if (userCats.length === 0 && resolvedId === 'usr_sambhaji_jadhav') {
      userCats = memStore.categories.filter((c) => c.userId === 'usr_sambhaji_jadhav');
    }
    return userCats.map(({ userId: _, ...rest }) => ({ ...rest }));
  },

  async createCategory(userIdOrEmail: string, data: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const resolvedId = resolveUserId(userIdOrEmail);
    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: data.name || 'New Envelope',
      type: data.type || 'want',
      allocatedAmount: Number(data.allocatedAmount || 0),
      spentAmount: Number(data.spentAmount || 0),
      color: data.color || '#C5A15B',
      icon: data.icon || 'Tag',
      isLocked: Boolean(data.isLocked),
    };

    if (prisma) {
      try {
        const created = await prisma.category.create({
          data: {
            id: newCat.id,
            userId: resolvedId,
            name: newCat.name,
            type: newCat.type as any,
            allocatedAmount: newCat.allocatedAmount,
            spentAmount: newCat.spentAmount,
            color: newCat.color,
            icon: newCat.icon,
            isLocked: newCat.isLocked,
          },
        });
        return {
          id: created.id,
          name: created.name,
          type: created.type as any,
          allocatedAmount: created.allocatedAmount,
          spentAmount: created.spentAmount,
          color: created.color,
          icon: created.icon,
          isLocked: created.isLocked,
        };
      } catch (err) {
        console.warn('Prisma createCategory failed, using in-memory store:', err);
      }
    }

    memStore.categories.push({ ...newCat, userId: resolvedId });
    saveStoredData(memStore);
    return newCat;
  },

  async updateCategory(userIdOrEmail: string, categoryId: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory | null> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const updated = await prisma.category.update({
          where: { id: categoryId },
          data: {
            ...(updates.name && { name: updates.name }),
            ...(updates.type && { type: updates.type as any }),
            ...(updates.allocatedAmount !== undefined && { allocatedAmount: Number(updates.allocatedAmount) }),
            ...(updates.spentAmount !== undefined && { spentAmount: Number(updates.spentAmount) }),
            ...(updates.color && { color: updates.color }),
            ...(updates.icon && { icon: updates.icon }),
            ...(updates.isLocked !== undefined && { isLocked: updates.isLocked }),
          },
        });
        return {
          id: updated.id,
          name: updated.name,
          type: updated.type as any,
          allocatedAmount: updated.allocatedAmount,
          spentAmount: updated.spentAmount,
          color: updated.color,
          icon: updated.icon,
          isLocked: updated.isLocked,
        };
      } catch (err) {
        console.warn('Prisma updateCategory failed, using in-memory store:', err);
      }
    }

    const cat = memStore.categories.find((c) => c.id === categoryId);
    if (!cat) return null;
    if (updates.name !== undefined) cat.name = updates.name;
    if (updates.type !== undefined) cat.type = updates.type;
    if (updates.allocatedAmount !== undefined) cat.allocatedAmount = Number(updates.allocatedAmount);
    if (updates.spentAmount !== undefined) cat.spentAmount = Number(updates.spentAmount);
    if (updates.color !== undefined) cat.color = updates.color;
    if (updates.icon !== undefined) cat.icon = updates.icon;
    if (updates.isLocked !== undefined) cat.isLocked = updates.isLocked;
    saveStoredData(memStore);
    const { userId: _, ...clean } = cat;
    return clean;
  },

  async deleteCategory(userIdOrEmail: string, categoryId: string): Promise<boolean> {
    if (prisma) {
      try {
        await prisma.category.delete({ where: { id: categoryId } });
        return true;
      } catch (err) {
        console.warn('Prisma deleteCategory failed, using in-memory store:', err);
      }
    }
    const idx = memStore.categories.findIndex((c) => c.id === categoryId);
    if (idx !== -1) {
      memStore.categories.splice(idx, 1);
      saveStoredData(memStore);
      return true;
    }
    return false;
  },

  // ================= TRANSACTIONS =================
  async getTransactions(userIdOrEmail: string, filters?: { month?: string; type?: string; category?: string }): Promise<Transaction[]> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const whereClause: any = { userId: resolvedId };
        if (filters?.type) whereClause.type = filters.type as any;
        if (filters?.category) whereClause.category = filters.category;
        if (filters?.month) {
          whereClause.date = { startsWith: filters.month };
        }
        const txs = await prisma.transaction.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
        });
        if (txs.length > 0) {
          return txs.map((t) => ({
            id: t.id,
            title: t.title,
            amount: t.amount,
            type: t.type as any,
            category: t.category,
            categoryType: t.categoryType as any,
            date: t.date,
            paymentMethod: t.paymentMethod,
            isRecurring: t.isRecurring,
            notes: t.notes || undefined,
            tags: t.tags,
            createdAt: t.createdAt.toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Prisma getTransactions failed, using in-memory store:', err);
      }
    }

    let txs = memStore.transactions.filter((t) => t.userId === resolvedId);
    if (txs.length === 0 && resolvedId === 'usr_sambhaji_jadhav') {
      txs = memStore.transactions.filter((t) => t.userId === 'usr_sambhaji_jadhav');
    }

    if (filters?.type) {
      txs = txs.filter((t) => t.type === filters.type);
    }
    if (filters?.category) {
      txs = txs.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.month) {
      txs = txs.filter((t) => t.date.startsWith(filters.month!));
    }
    return txs.map(({ userId: _, ...rest }) => ({ ...rest }));
  },

  async createTransaction(userIdOrEmail: string, data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const resolvedId = resolveUserId(userIdOrEmail);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: data.title,
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      categoryType: data.categoryType || 'want',
      date: data.date || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'UPI',
      isRecurring: Boolean(data.isRecurring),
      notes: data.notes,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
    };

    if (prisma) {
      try {
        const created = await prisma.transaction.create({
          data: {
            id: newTx.id,
            userId: resolvedId,
            title: newTx.title,
            amount: newTx.amount,
            type: newTx.type as any,
            category: newTx.category,
            categoryType: newTx.categoryType as any,
            date: newTx.date,
            paymentMethod: newTx.paymentMethod,
            isRecurring: newTx.isRecurring,
            notes: newTx.notes,
            tags: newTx.tags,
          },
        });

        if (newTx.type === 'expense') {
          await prisma.category.updateMany({
            where: {
              userId: resolvedId,
              name: { equals: newTx.category, mode: 'insensitive' },
            },
            data: {
              spentAmount: { increment: newTx.amount },
            },
          });
        }

        return {
          id: created.id,
          title: created.title,
          amount: created.amount,
          type: created.type as any,
          category: created.category,
          categoryType: created.categoryType as any,
          date: created.date,
          paymentMethod: created.paymentMethod,
          isRecurring: created.isRecurring,
          notes: created.notes || undefined,
          tags: created.tags,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma createTransaction failed, using in-memory store:', err);
      }
    }

    memStore.transactions.unshift({ ...newTx, userId: resolvedId });

    if (newTx.type === 'expense') {
      const cat = memStore.categories.find(
        (c) =>
          c.userId === resolvedId &&
          c.name.toLowerCase() === newTx.category.toLowerCase()
      );
      if (cat) {
        cat.spentAmount += newTx.amount;
      }
    }

    saveStoredData(memStore);
    return newTx;
  },

  async deleteTransaction(userIdOrEmail: string, txId: string): Promise<Transaction | null> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const tx = await prisma.transaction.findUnique({ where: { id: txId } });
        if (tx) {
          await prisma.transaction.delete({ where: { id: txId } });

          if (tx.type === 'expense') {
            await prisma.category.updateMany({
              where: {
                userId: resolvedId,
                name: { equals: tx.category, mode: 'insensitive' },
              },
              data: {
                spentAmount: { decrement: tx.amount },
              },
            });
          }

          return {
            id: tx.id,
            title: tx.title,
            amount: tx.amount,
            type: tx.type as any,
            category: tx.category,
            categoryType: tx.categoryType as any,
            date: tx.date,
            paymentMethod: tx.paymentMethod,
            isRecurring: tx.isRecurring,
            notes: tx.notes || undefined,
            tags: tx.tags,
            createdAt: tx.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('Prisma deleteTransaction failed, using in-memory store:', err);
      }
    }

    const idx = memStore.transactions.findIndex((t) => t.id === txId);
    if (idx === -1) return null;
    const [deleted] = memStore.transactions.splice(idx, 1);

    if (deleted.type === 'expense') {
      const cat = memStore.categories.find(
        (c) =>
          c.userId === resolvedId &&
          c.name.toLowerCase() === deleted.category.toLowerCase()
      );
      if (cat) {
        cat.spentAmount = Math.max(0, cat.spentAmount - deleted.amount);
      }
    }

    saveStoredData(memStore);
    const { userId: _, ...clean } = deleted;
    return clean;
  },

  // ================= BILLS & SUBSCRIPTIONS =================
  async getBills(userIdOrEmail: string): Promise<BillSubscription[]> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const bills = await prisma.billSubscription.findMany({
          where: { userId: resolvedId },
          orderBy: { dueDate: 'asc' },
        });
        if (bills.length > 0) {
          return bills.map((b) => ({
            id: b.id,
            name: b.name,
            amount: b.amount,
            billingCycle: b.billingCycle as any,
            dueDate: b.dueDate,
            category: b.category,
            paymentMethod: b.paymentMethod,
            isAutoDebit: b.isAutoDebit,
            status: b.status as any,
            lastPaidDate: b.lastPaidDate || undefined,
          }));
        }
      } catch (err) {
        console.warn('Prisma getBills failed, using in-memory store:', err);
      }
    }
    let userBills = memStore.bills.filter((b) => b.userId === resolvedId);
    if (userBills.length === 0 && resolvedId === 'usr_sambhaji_jadhav') {
      userBills = memStore.bills.filter((b) => b.userId === 'usr_sambhaji_jadhav');
    }
    return userBills.map(({ userId: _, ...rest }) => ({ ...rest }));
  },

  async createBill(userIdOrEmail: string, data: Partial<BillSubscription>): Promise<BillSubscription> {
    const resolvedId = resolveUserId(userIdOrEmail);
    const newBill: BillSubscription = {
      id: `bill-${Date.now()}`,
      name: data.name || 'Recurring Bill',
      amount: Number(data.amount || 0),
      billingCycle: data.billingCycle || 'monthly',
      dueDate: data.dueDate || '2026-10-25',
      category: data.category || 'Bills & Utilities',
      paymentMethod: data.paymentMethod || 'Auto Debit',
      isAutoDebit: data.isAutoDebit ?? true,
      status: data.status || 'upcoming',
      lastPaidDate: data.lastPaidDate,
    };

    if (prisma) {
      try {
        const created = await prisma.billSubscription.create({
          data: {
            id: newBill.id,
            userId: resolvedId,
            name: newBill.name,
            amount: newBill.amount,
            billingCycle: newBill.billingCycle as any,
            dueDate: newBill.dueDate,
            category: newBill.category,
            paymentMethod: newBill.paymentMethod,
            isAutoDebit: newBill.isAutoDebit,
            status: newBill.status as any,
            lastPaidDate: newBill.lastPaidDate,
          },
        });
        return {
          id: created.id,
          name: created.name,
          amount: created.amount,
          billingCycle: created.billingCycle as any,
          dueDate: created.dueDate,
          category: created.category,
          paymentMethod: created.paymentMethod,
          isAutoDebit: created.isAutoDebit,
          status: created.status as any,
          lastPaidDate: created.lastPaidDate || undefined,
        };
      } catch (err) {
        console.warn('Prisma createBill failed, using in-memory store:', err);
      }
    }

    memStore.bills.push({ ...newBill, userId: resolvedId });
    saveStoredData(memStore);
    return newBill;
  },

  async markBillPaid(userIdOrEmail: string, billId: string): Promise<BillSubscription | null> {
    const today = new Date().toISOString().split('T')[0];
    if (prisma) {
      try {
        const updated = await prisma.billSubscription.update({
          where: { id: billId },
          data: { status: 'paid', lastPaidDate: today },
        });
        return {
          id: updated.id,
          name: updated.name,
          amount: updated.amount,
          billingCycle: updated.billingCycle as any,
          dueDate: updated.dueDate,
          category: updated.category,
          paymentMethod: updated.paymentMethod,
          isAutoDebit: updated.isAutoDebit,
          status: updated.status as any,
          lastPaidDate: updated.lastPaidDate || undefined,
        };
      } catch (err) {
        console.warn('Prisma markBillPaid failed, using in-memory store:', err);
      }
    }

    const bill = memStore.bills.find((b) => b.id === billId);
    if (!bill) return null;
    bill.status = 'paid';
    bill.lastPaidDate = today;
    saveStoredData(memStore);
    const { userId: _, ...clean } = bill;
    return clean;
  },

  // ================= SAVINGS GOALS =================
  async getGoals(userIdOrEmail: string): Promise<SavingsGoal[]> {
    const resolvedId = resolveUserId(userIdOrEmail);
    if (prisma) {
      try {
        const goals = await prisma.savingsGoal.findMany({
          where: { userId: resolvedId },
          orderBy: { targetDate: 'asc' },
        });
        if (goals.length > 0) {
          return goals.map((g) => ({
            id: g.id,
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.targetDate,
            category: g.category,
            monthlyContributionRequired: g.monthlyContributionRequired,
            color: g.color,
            isCompleted: g.isCompleted,
            priority: g.priority as any,
          }));
        }
      } catch (err) {
        console.warn('Prisma getGoals failed, using in-memory store:', err);
      }
    }
    let userGoals = memStore.goals.filter((g) => g.userId === resolvedId);
    if (userGoals.length === 0 && resolvedId === 'usr_sambhaji_jadhav') {
      userGoals = memStore.goals.filter((g) => g.userId === 'usr_sambhaji_jadhav');
    }
    return userGoals.map(({ userId: _, ...rest }) => ({ ...rest }));
  },

  async createGoal(userIdOrEmail: string, data: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const resolvedId = resolveUserId(userIdOrEmail);
    const targetAmount = Number(data.targetAmount || 100000);
    const currentAmount = Number(data.currentAmount || 0);
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: data.title || 'Target Savings Goal',
      targetAmount,
      currentAmount,
      targetDate: data.targetDate || '2027-12-31',
      category: data.category || 'General Savings',
      monthlyContributionRequired: Number(data.monthlyContributionRequired || Math.round(targetAmount / 12)),
      color: data.color || '#3A6046',
      isCompleted: Boolean(currentAmount >= targetAmount),
      priority: data.priority || 'medium',
    };

    if (prisma) {
      try {
        const created = await prisma.savingsGoal.create({
          data: {
            id: newGoal.id,
            userId: resolvedId,
            title: newGoal.title,
            targetAmount: newGoal.targetAmount,
            currentAmount: newGoal.currentAmount,
            targetDate: newGoal.targetDate,
            category: newGoal.category,
            monthlyContributionRequired: newGoal.monthlyContributionRequired,
            color: newGoal.color,
            isCompleted: newGoal.isCompleted,
            priority: newGoal.priority as any,
          },
        });
        return {
          id: created.id,
          title: created.title,
          targetAmount: created.targetAmount,
          currentAmount: created.currentAmount,
          targetDate: created.targetDate,
          category: created.category,
          monthlyContributionRequired: created.monthlyContributionRequired,
          color: created.color,
          isCompleted: created.isCompleted,
          priority: created.priority as any,
        };
      } catch (err) {
        console.warn('Prisma createGoal failed, using in-memory store:', err);
      }
    }

    memStore.goals.push({ ...newGoal, userId: resolvedId });
    saveStoredData(memStore);
    return newGoal;
  },

  async contributeToGoal(userIdOrEmail: string, goalId: string, amount: number): Promise<SavingsGoal | null> {
    if (prisma) {
      try {
        const goal = await prisma.savingsGoal.findUnique({ where: { id: goalId } });
        if (goal) {
          const newCurrent = goal.currentAmount + amount;
          const updated = await prisma.savingsGoal.update({
            where: { id: goalId },
            data: {
              currentAmount: newCurrent,
              isCompleted: newCurrent >= goal.targetAmount,
            },
          });
          return {
            id: updated.id,
            title: updated.title,
            targetAmount: updated.targetAmount,
            currentAmount: updated.currentAmount,
            targetDate: updated.targetDate,
            category: updated.category,
            monthlyContributionRequired: updated.monthlyContributionRequired,
            color: updated.color,
            isCompleted: updated.isCompleted,
            priority: updated.priority as any,
          };
        }
      } catch (err) {
        console.warn('Prisma contributeToGoal failed, using in-memory store:', err);
      }
    }

    const goal = memStore.goals.find((g) => g.id === goalId);
    if (!goal) return null;
    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    saveStoredData(memStore);
    const { userId: _, ...clean } = goal;
    return clean;
  },

  // ================= FULL CROSS-BROWSER CLOUD SYNC =================
  async getUserFullSync(userIdOrEmail: string) {
    const user = (await this.findUserById(userIdOrEmail)) || (await this.findUserByEmail(userIdOrEmail));
    const resolvedId = user ? user.id : resolveUserId(userIdOrEmail);
    const resolvedEmail = user ? user.email : (userIdOrEmail.includes('@') ? userIdOrEmail : 'sambhaji.jadhav@example.com');

    const categories = await this.getCategories(resolvedId);
    const transactions = await this.getTransactions(resolvedId);
    const goals = await this.getGoals(resolvedId);
    const bills = await this.getBills(resolvedId);
    const monthlyIncome = user?.preferences?.monthlyIncome ?? (resolvedId === 'usr_sambhaji_jadhav' ? 120000 : 0);

    return {
      userProfile: {
        id: resolvedId,
        name: user?.name || (resolvedEmail.includes('sambhaji') ? 'Sambhaji Jadhav' : 'Member'),
        email: resolvedEmail,
        phone: user?.phone,
        dateOfBirth: user?.dateOfBirth,
        preferences: user?.preferences || {
          currency: 'INR',
          theme: 'luxury',
          riskTolerance: 'growth',
          monthlySavingsTargetPercent: 25,
          monthlyIncome,
        },
        monthlyIncome,
        isOnboarded: user ? !user.isNewUser : true,
        isNewUser: user ? user.isNewUser : false,
        dashboardMode: 'beginner' as const,
        createdAt: user?.createdAt || new Date().toISOString(),
        lastLoginAt: user?.lastLoginAt || new Date().toISOString(),
      },
      monthlyIncome,
      categories,
      transactions,
      goals,
      bills,
      lastSavedAt: new Date().toISOString(),
    };
  },

  async saveUserFullSync(userIdOrEmail: string, payload: any) {
    let user = (await this.findUserById(userIdOrEmail)) || (await this.findUserByEmail(userIdOrEmail));
    const resolvedId = user ? user.id : resolveUserId(userIdOrEmail);
    const resolvedEmail = user ? user.email : (userIdOrEmail.includes('@') ? userIdOrEmail : `${resolvedId}@wealthwise.io`);

    if (!user) {
      user = {
        id: resolvedId,
        email: resolvedEmail,
        name: payload.userProfile?.name || resolvedEmail.split('@')[0],
        phone: payload.userProfile?.phone,
        dateOfBirth: payload.userProfile?.dateOfBirth,
        preferences: {
          currency: 'INR',
          theme: 'luxury',
          riskTolerance: 'growth',
          monthlySavingsTargetPercent: 25,
          monthlyIncome: Number(payload.monthlyIncome || 0),
          ...(payload.userProfile?.preferences || {}),
        },
        isNewUser: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      memStore.users.push(user);
    } else {
      user.preferences = {
        ...user.preferences,
        ...(payload.userProfile?.preferences || {}),
        monthlyIncome: payload.monthlyIncome !== undefined ? Number(payload.monthlyIncome) : (user.preferences?.monthlyIncome || 0),
      };
      if (payload.userProfile?.name) {
        user.name = payload.userProfile.name;
      }
    }

    if (Array.isArray(payload.categories)) {
      memStore.categories = memStore.categories.filter((c) => c.userId !== resolvedId);
      payload.categories.forEach((cat: any) => {
        memStore.categories.push({
          id: cat.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cat.name,
          type: cat.type || 'want',
          allocatedAmount: Number(cat.allocatedAmount || 0),
          spentAmount: Number(cat.spentAmount || 0),
          color: cat.color || '#C5A15B',
          icon: cat.icon || 'Tag',
          isLocked: Boolean(cat.isLocked),
          userId: resolvedId,
        });
      });
    }

    if (Array.isArray(payload.transactions)) {
      memStore.transactions = memStore.transactions.filter((t) => t.userId !== resolvedId);
      payload.transactions.forEach((tx: any) => {
        memStore.transactions.push({
          id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: tx.title || tx.note || tx.category || 'Transaction',
          amount: Number(tx.amount || 0),
          type: tx.type || 'expense',
          category: tx.category || 'General',
          categoryType: tx.categoryType || 'want',
          date: tx.date || new Date().toISOString().split('T')[0],
          paymentMethod: tx.paymentMethod || 'UPI',
          isRecurring: Boolean(tx.isRecurring),
          notes: tx.notes || tx.note,
          tags: tx.tags || [],
          createdAt: tx.createdAt || new Date().toISOString(),
          userId: resolvedId,
        });
      });
    }

    if (Array.isArray(payload.goals)) {
      memStore.goals = memStore.goals.filter((g) => g.userId !== resolvedId);
      payload.goals.forEach((g: any) => {
        memStore.goals.push({
          id: g.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: g.title,
          targetAmount: Number(g.targetAmount || 0),
          currentAmount: Number(g.currentAmount || 0),
          targetDate: g.targetDate || '2027-12-31',
          category: g.category || 'General Savings',
          monthlyContributionRequired: Number(g.monthlyContributionRequired || 0),
          color: g.color || '#3A6046',
          isCompleted: Boolean(g.isCompleted),
          priority: g.priority || 'medium',
          userId: resolvedId,
        });
      });
    }

    if (Array.isArray(payload.bills)) {
      memStore.bills = memStore.bills.filter((b) => b.userId !== resolvedId);
      payload.bills.forEach((b: any) => {
        memStore.bills.push({
          id: b.id || `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: b.name,
          amount: Number(b.amount || 0),
          billingCycle: b.billingCycle || 'monthly',
          dueDate: b.dueDate || '2026-10-25',
          category: b.category || 'Bills & Utilities',
          paymentMethod: b.paymentMethod || 'Auto Debit',
          isAutoDebit: Boolean(b.isAutoDebit),
          status: b.status || 'upcoming',
          lastPaidDate: b.lastPaidDate,
          userId: resolvedId,
        });
      });
    }

    saveStoredData(memStore);
    return { success: true, savedAt: new Date().toISOString() };
  },
};
