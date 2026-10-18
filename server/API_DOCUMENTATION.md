# WealthWise Backend API Documentation

A production-ready, secure REST backend for **WealthWise — Smart Monthly Budget Optimizer**.

## 🛠️ Tech Stack & Architecture
- **Runtime**: Node.js v20+ with Express & TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client`)
- **Security & Authentication**:
  - Passwords hashed with `bcryptjs` (salt rounds: 12)
  - JWT Authentication using Access Tokens (`1h`) and Refresh Tokens (`7d`)
  - Middleware for token validation and protected routes

---

## 📁 Directory Structure
```
server/
├── prisma/
│   └── schema.prisma             # PostgreSQL schema (User, Category, Transaction, BillSubscription, SavingsGoal)
├── src/
│   ├── config/
│   │   └── env.ts                # Environment variables and configuration
│   ├── db/
│   │   ├── prisma.ts             # Prisma client connection manager
│   │   └── repository.ts         # Resilient Data Access Layer (PostgreSQL with in-memory fallback)
│   ├── middleware/
│   │   └── authMiddleware.ts     # JWT authentication & optionalAuth middleware
│   ├── utils/
│   │   ├── auth.ts               # bcrypt hashing and JWT token generator/validator
│   │   ├── financialCalculations.ts # Health score, month-end forecast, and tolerances
│   │   └── backendSuite.ts       # Automated integration test suite
│   ├── controllers/
│   │   ├── authControllers.ts    # Register, login, refresh token, profile, logout
│   │   ├── dashboardControllers.ts # Aggregated monthly take-home, spent, cushion, health score
│   │   ├── budgetControllers.ts  # Category envelopes CRUD and monthly income
│   │   ├── transactionControllers.ts # Record, list, filter, delete (auto category counter sync)
│   │   ├── billControllers.ts    # Upcoming recurring bills, due dates, mark paid
│   │   ├── goalControllers.ts    # Savings goals target amounts, balances, contributions
│   │   └── optimizerControllers.ts # Overspending analytics & What-If simulation
│   ├── routes/
│   │   ├── authRoutes.ts         # /api/auth/*
│   │   ├── dashboardRoutes.ts    # /api/dashboard/*
│   │   ├── budgetRoutes.ts       # /api/budget/* & /api/categories/*
│   │   ├── transactionRoutes.ts  # /api/transactions/*
│   │   ├── billRoutes.ts         # /api/bills/*
│   │   ├── goalRoutes.ts         # /api/goals/*
│   │   ├── optimizerRoutes.ts    # /api/optimizer/*
│   │   └── apiRoutes.ts          # Central router index
│   └── index.ts                  # Server entry point
```

---

## 🗄️ Database Models (Prisma PostgreSQL)

### 1. `User`
- `id` (UUID, primary key)
- `email` (unique string)
- `name` (string)
- `passwordHash` (string)
- `phone` (optional string)
- `preferences` (JSON: currency, theme, monthlySavingsTargetPercent)
- `monthlyIncome` (float, default: 120,000)
- `isNewUser` (boolean)
- `refreshToken` (optional string)

### 2. `Category`
- `id` (UUID, primary key)
- `userId` (relation to User)
- `name` (string: Rent & Housing, Bills & Utilities, Groceries & Food, etc.)
- `type` (enum: `need`, `want`, `savings`, `debt`)
- `allocatedAmount` (float)
- `spentAmount` (float)
- `color` (string hex)
- `icon` (string)
- `isLocked` (boolean)

### 3. `Transaction`
- `id` (UUID, primary key)
- `userId` (relation to User)
- `categoryId` (optional relation to Category)
- `title` (string)
- `amount` (float)
- `type` (enum: `income`, `expense`)
- `category` (string)
- `categoryType` (enum: `need`, `want`, `savings`, `debt`)
- `date` (string: YYYY-MM-DD)
- `paymentMethod` (string: UPI, Bank Transfer, Auto Debit, Credit Card)
- `isRecurring` (boolean)
- `notes` (optional string)

### 4. `BillSubscription`
- `id` (UUID, primary key)
- `userId` (relation to User)
- `name` (string)
- `amount` (float)
- `billingCycle` (enum: `monthly`, `quarterly`, `yearly`)
- `dueDate` (string: YYYY-MM-DD or day of month)
- `category` (string)
- `paymentMethod` (string)
- `isAutoDebit` (boolean)
- `status` (enum: `upcoming`, `paid`, `overdue`)
- `lastPaidDate` (optional string)

### 5. `SavingsGoal`
- `id` (UUID, primary key)
- `userId` (relation to User)
- `title` (string)
- `targetAmount` (float)
- `currentAmount` (float)
- `targetDate` (string: YYYY-MM-DD)
- `category` (string)
- `monthlyContributionRequired` (float)
- `isCompleted` (boolean)
- `priority` (enum: `low`, `medium`, `high`)

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with bcrypt hash & JWT tokens | No |
| `POST` | `/api/auth/login` | Authenticate user & return Access + Refresh tokens | No |
| `POST` | `/api/auth/refresh-token` | Exchange refresh token for fresh access token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Revoke refresh token | Yes (Bearer) |
| `POST` | `/api/auth/check-email` | Check if account exists (sign-in vs register) | No |

### 2. Dashboard (`/api/dashboard` & `/api/summary`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary?month=YYYY-MM` | Calculates monthly take-home, total spent, safe cushion, savings rate, financial health score (0-100), and forecast |

### 3. Budget Planner (`/api/budget` & `/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budget` | Get take-home income, category envelopes, and allocation totals |
| `PUT` | `/api/budget/income` | Update monthly take-home income |
| `POST` | `/api/budget/categories` | Create new category spending envelope |
| `PUT` | `/api/budget/categories/:id` | Update category limits, color, lock state |
| `DELETE` | `/api/budget/categories/:id` | Delete category envelope |

### 4. Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions?month=YYYY-MM&type=expense` | List and filter transactions with net cash flow calculations |
| `POST` | `/api/transactions` | Record transaction. **Automatically increments category spentAmount** |
| `DELETE` | `/api/transactions/:id` | Delete transaction. **Automatically decrements category spentAmount** |

### 5. Bills & Subscriptions (`/api/bills`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bills` | List recurring bills, due dates, upcoming vs paid totals |
| `POST` | `/api/bills` | Create new recurring bill/subscription |
| `PATCH` | `/api/bills/:id/pay` | Mark bill as paid |

### 6. Savings Goals (`/api/goals`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/goals` | List savings goals with progress percentages and remaining balances |
| `POST` | `/api/goals` | Create target savings goal with target date |
| `PATCH` | `/api/goals/:id/contribute` | Add funds toward a goal |

### 7. Smart Optimizer & Simulation (`/api/optimizer`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/optimizer/insights` | Evaluate category overspending against 50/30/20 and return recommendations |
| `POST` | `/api/optimizer/simulate-move` | What-If simulation: calculates impact of budget changes or large expenses on net surplus and health score |

---

## 🧪 Automated Testing
Run the test suite against the live server:
```bash
cd server
npx tsx src/utils/backendSuite.ts
```
Result: **13/13 tests passing**.
