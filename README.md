# WealthWise — Smart Monthly Budget Optimizer

> **"Plan Today. Brighter Tomorrows."**  
> A luxury financial planning journal paired with a constraint-satisfying budget optimization engine in **INR (₹)**.

---

## 🏛️ Executive Product Overview

WealthWise is built for high-earning professionals, students, and families looking for genuine financial optimization rather than generic charts or vague advice. Designed with an editorial aesthetic inspired by high-end financial journals, WealthWise calculates realistic monthly allocations based on hard mathematical constraints.

### Key Differentiators

- **Smart Budget Optimizer**: Real constraint-satisfaction algorithm with customizable strategies (*Balanced 50/30/20*, *Aggressive Wealth / FIRE*, *Debt Avalanche*, *Gentle Cutback*). Protects locked obligations (such as Rent and EMIs) while optimizing flexible lifestyle spending.
- **Decision Simulator ("What If")**: Test major purchases, EMI commitments, or expense cutbacks before executing them to view instant simulated impacts on month-end balance and financial health.
- **Zero-Based Budget Planner**: Category envelopes with inline adjustments, 50/30/20 benchmark guides, and real-time surplus/deficit warnings.
- **Predictive Month-End Forecasting**: Projects closing cash balances accounting for upcoming scheduled bills, remaining pay periods, and daily spending velocity.
- **Sinking Funds & Savings Goals**: Calculates exact required monthly contributions to hit milestone dates for emergencies, real estate down payments, or vacations.
- **Grounded AI Finance Assistant**: An advisor whose answers are grounded strictly in your verified transactions, income baseline, and health metrics.
- **Formal Audit Reports & CSV Export**: Export audit-ready transaction records to CSV and print formatted monthly statements.

---

## 🎨 Luxury Visual Identity & Design Tokens

WealthWise deliberately moves away from generic neon green and blue fintech dashboards, delivering a warm, refined editorial experience:

| Color Name | Hex Code | Role |
| :--- | :--- | :--- |
| **Pearl Ivory** | `#FAF7F0` | Primary journal canvas background |
| **Warm Cream** | `#F2EADF` | Secondary cards, pill containers, and warm accents |
| **Champagne Gold** | `#C5A15B` | Primary callouts, interactive highlights, and monograms |
| **Pale Gold** | `#E8D5A8` | Soft borders and metallic gradient accents |
| **Brushed Silver** | `#C7CBD1` | Crisp hairline borders and structural dividers |
| **Soft Silver** | `#ECEDEF` | Table header accents and pill backgrounds |
| **Blush Pink** | `#F5DDE3` | Sticky note insights and actionable financial reminders |
| **Dusty Rose** | `#D99AA6` | Secondary accent badges and subtle indicators |
| **Lavender Mist** | `#E9E1F5` | Bill alert sticky notes and renewal notifications |
| **Espresso Charcoal** | `#302C2B` | Primary editorial typography with maximum legibility |
| **Muted Sage** | `#4E775B` | Positive cashflow surplus, savings, and verified badges |
| **Soft Muted Red** | `#BA5A5A` | Expense outflow badges, over-budget alerts, and warnings |

### Typography
- **Headings**: *Playfair Display* (Editorial serif)
- **UI & Numbers**: *Manrope* / *Inter* (Clean geometric sans-serif)

---

## 🏗️ Technical Architecture

The repository is structured with clean separation of concerns:

```
WealthWise/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── public/                 # Static assets & branding
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, responsive sidebar & mobile navigation
│   │   │   ├── modals/         # AddTransactionModal, SimulateDecisionModal
│   │   │   └── ui/             # Button, Badge, Card, StickyNote, Modal
│   │   ├── context/            # FinanceContext (reactive state & persistence)
│   │   ├── data/               # Realistic INR demo dataset
│   │   ├── pages/              # 15 Complete application pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── OptimizerPage.tsx
│   │   │   ├── BudgetPlannerPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── BillsPage.tsx
│   │   │   ├── AIAssistantPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── AuthPages.tsx (Login, SignUp, Onboarding)
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/           # Client-side optimizer service
│   │   └── utils/              # formatINR, calculateBudgetHealthScore, forecasting
│   ├── tailwind.config.js      # Custom WealthWise theme tokens
│   ├── tsconfig.json           # Strict TypeScript configuration
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/        # REST API controllers
│   │   ├── models/             # Domain models, types & mock DB
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Optimization mathematical service
│   │   └── utils/              # Financial calculation engine & test runner
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example                # Configuration template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd WealthWise
   ```

2. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

### Running Locally

1. **Start the Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

2. **Start the Backend API Server:**
   ```bash
   cd server
   npm run dev
   ```
   Server will start on [http://localhost:5000](http://localhost:5000) (Health check: `/health`, API root: `/api/summary`).

3. **Run Mathematical Financial Tests:**
   ```bash
   cd server
   npx tsx src/utils/testRunner.ts
   ```

---

## 🧪 Verification & Checks Performed

| Check | Tool / Command | Result |
| :--- | :--- | :--- |
| **Client Production Build** | `npm run build` (tsc & vite) | ✅ Passed (3.04s, 0 errors) |
| **Server TypeScript Compile** | `tsc` | ✅ Passed (0 errors) |
| **Financial Calculations & Optimizer Unit Tests** | `npx tsx src/utils/testRunner.ts` | ✅ 13/13 Passed (50/30/20, health score, feasibility, constraint locks) |
| **HTTP Dev Server Health** | `Invoke-WebRequest http://localhost:5173/` | ✅ HTTP 200 OK |

---

## 🛡️ License
Private & Proprietary. Created for portfolio and demonstration purposes.
