import {
  calculate50_30_20Split,
  calculateBudgetHealthScore,
  calculateMonthEndForecast,
} from './financialCalculations.js';
import { runSmartBudgetOptimizer } from '../services/optimizerService.js';
import { initialCategories } from '../models/mockDb.js';

console.log('====================================================');
console.log('🧪 WealthWise Financial Calculation & Optimizer Test');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// 1. 50/30/20 Guideline Test
const income = 120000;
const split = calculate50_30_20Split(income);
assert(split.needs.targetAmount === 60000, '50% Needs calculation equals ₹60,000');
assert(split.wants.targetAmount === 36000, '30% Wants calculation equals ₹36,000');
assert(split.savings.targetAmount === 24000, '20% Savings calculation equals ₹24,000');
assert(split.needs.targetAmount + split.wants.targetAmount + split.savings.targetAmount === income, 'Split sum equals 100% of income');

// 2. Budget Health Score Test
const health = calculateBudgetHealthScore({
  savingsRate: 26,
  needsRatio: 45,
  debtToIncomeRatio: 10,
  hasEmergencyFund: true,
  overspendingCategoriesCount: 0,
});
assert(health.score >= 80, `Healthy portfolio yields high score (Got: ${health.score})`);
assert(health.rating === 'Exceptional', `High score receives Exceptional rating (Got: ${health.rating})`);

// 3. Month-End Forecast Test
const forecast = calculateMonthEndForecast({
  currentBalance: 32000,
  expectedRemainingIncome: 0,
  upcomingScheduledBills: 6998,
  projectedDailyDiscretionary: 850,
  daysRemainingInMonth: 14,
});
assert(forecast.projectedClosingBalance > 0, 'Projected balance is positive with surplus');
assert(forecast.dailySafeSpend > 0, 'Daily safe spend limit is calculated');

// 4. Optimizer: Balanced Strategy & Locked Category Preservation
const optResult = runSmartBudgetOptimizer({
  monthlyNetIncome: 120000,
  strategy: 'balanced_50_30_20',
  categories: initialCategories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    currentBudget: c.allocatedAmount,
    actualSpend: c.spentAmount,
    isLocked: c.isLocked,
  })),
  monthlyDebtObligations: 10000,
});

assert(optResult.isFeasible === true, 'Balanced budget optimization is feasible');
assert(optResult.totalRecommendedBudget <= 120000, `Total recommended budget does not exceed net income (Got: ₹${optResult.totalRecommendedBudget})`);

const lockedRent = optResult.categories.find((c) => c.name === 'Housing & Rent');
assert(lockedRent?.recommendedBudget === 28000, 'Locked Housing & Rent remains unchanged at ₹28,000');

// 5. Optimizer: Infeasible Budget Deficit Detection (No Inventing Money)
const infeasibleResult = runSmartBudgetOptimizer({
  monthlyNetIncome: 30000, // unrealistically low for 28k rent + 10k emi
  strategy: 'balanced_50_30_20',
  categories: initialCategories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    currentBudget: c.allocatedAmount,
    actualSpend: c.spentAmount,
    isLocked: c.isLocked,
  })),
  monthlyDebtObligations: 10000,
});
assert(infeasibleResult.isFeasible === false, 'Detects mathematically impossible budget deficit');
assert(infeasibleResult.status === 'infeasible', 'Marks status as infeasible');

console.log(`\nResults: ${passedTests}/${totalTests} tests passed successfully.`);
if (passedTests === totalTests) {
  console.log('🎉 ALL FINANCIAL TESTS PASSED MATHEMATICALLY!');
} else {
  process.exit(1);
}
