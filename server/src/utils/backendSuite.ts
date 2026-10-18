/**
 * Automated Verification Suite for WealthWise Backend API
 * Tests all 7 modules against the live HTTP server
 */

const BASE_URL = 'http://localhost:5000';

async function runTestSuite() {
  console.log('🧪 Starting WealthWise Production Backend Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health Endpoint
  await test('Health Check Endpoint (GET /health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error(`Expected status 200 and status: ok, got ${res.status}`);
    }
  });

  // 2. Auth Module: Register
  let userToken = '';
  let refreshToken = '';
  const testEmail = `test_user_${Date.now()}@wealthwise.io`;

  await test('Auth: User Registration with bcrypt & JWT (POST /api/auth/register)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@2026',
        name: 'Aarav Patel',
        phone: '+91 98765 43210',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.accessToken || !data.refreshToken) {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
    userToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // 3. Auth Module: Login
  await test('Auth: User Login with Password Verification (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@2026',
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    userToken = data.accessToken;
  });

  // 4. Auth Module: Token Refresh
  await test('Auth: Refresh Token Exchange (POST /api/auth/refresh-token)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.accessToken) {
      throw new Error(`Refresh failed: ${JSON.stringify(data)}`);
    }
    userToken = data.accessToken;
  });

  // 5. Auth Module: Protected Profile (GET /api/auth/me)
  await test('Auth: Protected User Profile Route (GET /api/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.user.email !== testEmail) {
      throw new Error(`Profile fetch failed: ${JSON.stringify(data)}`);
    }
  });

  // 6. Dashboard Module: Summary Calculations
  await test('Dashboard: Aggregated Calculations (GET /api/dashboard/summary)', async () => {
    const res = await fetch(`${BASE_URL}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.data || json.data.monthlyTakeHome <= 0) {
      throw new Error(`Dashboard summary failed: ${JSON.stringify(json)}`);
    }
    if (typeof json.data.financialHealth.score !== 'number') {
      throw new Error('Missing health score in dashboard summary');
    }
  });

  // 7. Budget Planner Module: Category Envelopes
  let createdCatId = '';
  await test('Budget Planner: Create Category Envelope (POST /api/budget/categories)', async () => {
    const res = await fetch(`${BASE_URL}/api/budget/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Artisan Coffee & Snacks',
        type: 'want',
        allocatedAmount: 4500,
        color: '#D99AA6',
        icon: 'Coffee',
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data.id) {
      throw new Error(`Failed to create category: ${JSON.stringify(json)}`);
    }
    createdCatId = json.data.id;
  });

  // 8. Transactions Module: Add Transaction & Category Consumption Counter Sync
  let createdTxId = '';
  await test('Transactions: Record Entry & Sync Category Counter (POST /api/transactions)', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Specialty Roast Beans',
        amount: 850,
        type: 'expense',
        category: 'Artisan Coffee & Snacks',
        categoryType: 'want',
        paymentMethod: 'UPI (GPay)',
        notes: 'Monthly roast subscription',
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data.id) {
      throw new Error(`Failed to create transaction: ${JSON.stringify(json)}`);
    }
    createdTxId = json.data.id;

    // Verify envelope spent amount incremented to 850
    const budgetRes = await fetch(`${BASE_URL}/api/budget`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const budgetJson = await budgetRes.json();
    const targetCat = budgetJson.data.categories.find((c: any) => c.id === createdCatId);
    if (!targetCat || targetCat.spentAmount !== 850) {
      throw new Error(`Expected category spentAmount to be 850, got ${targetCat?.spentAmount}`);
    }
  });

  // 9. Transactions Module: Delete Transaction & Revert Category Counter
  await test('Transactions: Delete Entry & Revert Category Counter (DELETE /api/transactions/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/transactions/${createdTxId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const json = await res.json();
    if (res.status !== 200 || !json.success) {
      throw new Error(`Failed to delete transaction: ${JSON.stringify(json)}`);
    }

    // Verify envelope spent amount reverted back to 0
    const budgetRes = await fetch(`${BASE_URL}/api/budget`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const budgetJson = await budgetRes.json();
    const targetCat = budgetJson.data.categories.find((c: any) => c.id === createdCatId);
    if (!targetCat || targetCat.spentAmount !== 0) {
      throw new Error(`Expected category spentAmount to revert to 0, got ${targetCat?.spentAmount}`);
    }
  });

  // 10. Bills & Subscriptions Module: Create & Mark Paid
  let createdBillId = '';
  await test('Bills: Create & Mark Paid (POST & PATCH /api/bills)', async () => {
    const createRes = await fetch(`${BASE_URL}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'Airtel Broadband Fiber',
        amount: 1199,
        billingCycle: 'monthly',
        dueDate: '2026-10-28',
        category: 'Bills & Utilities',
      }),
    });
    const createJson = await createRes.json();
    if (createRes.status !== 201 || !createJson.data.id) {
      throw new Error(`Failed to create bill: ${JSON.stringify(createJson)}`);
    }
    createdBillId = createJson.data.id;

    // Mark paid
    const payRes = await fetch(`${BASE_URL}/api/bills/${createdBillId}/pay`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const payJson = await payRes.json();
    if (payRes.status !== 200 || payJson.data.status !== 'paid') {
      throw new Error(`Failed to mark bill paid: ${JSON.stringify(payJson)}`);
    }
  });

  // 11. Savings Goals Module: Create & Contribute
  let createdGoalId = '';
  await test('Goals: Create & Contribute (POST & PATCH /api/goals)', async () => {
    const createRes = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Emergency Rainy Day Fund',
        targetAmount: 150000,
        currentAmount: 20000,
        targetDate: '2027-06-30',
        category: 'Safety Net',
      }),
    });
    const createJson = await createRes.json();
    if (createRes.status !== 201 || !createJson.data.id) {
      throw new Error(`Failed to create goal: ${JSON.stringify(createJson)}`);
    }
    createdGoalId = createJson.data.id;

    // Contribute ₹10,000
    const contRes = await fetch(`${BASE_URL}/api/goals/${createdGoalId}/contribute`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ amount: 10000 }),
    });
    const contJson = await contRes.json();
    if (contRes.status !== 200 || contJson.data.currentAmount !== 30000) {
      throw new Error(`Expected goal balance 30000, got ${contJson?.data?.currentAmount}`);
    }
  });

  // 12. Smart Optimizer & Simulation Module: Insights & Simulate Move
  await test('Optimizer: Overspending Insights (POST /api/optimizer/insights)', async () => {
    const res = await fetch(`${BASE_URL}/api/optimizer/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ strategy: 'balanced_50_30_20' }),
    });
    const json = await res.json();
    if (res.status !== 200 || !json.data || !json.data.recommendations) {
      throw new Error(`Optimizer insights failed: ${JSON.stringify(json)}`);
    }
  });

  await test('Optimizer: Simulate Move What-If Scenario (POST /api/optimizer/simulate-move)', async () => {
    const res = await fetch(`${BASE_URL}/api/optimizer/simulate-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        proposedIncome: 135000,
        hypotheticalExpense: {
          title: 'Ergonomic Desk & Chair',
          amount: 35000,
          category: 'Shopping & Leisure',
        },
      }),
    });
    const json = await res.json();
    if (res.status !== 200 || !json.data || !json.data.simulated || !json.data.assessment) {
      throw new Error(`Simulate move failed: ${JSON.stringify(json)}`);
    }
  });

  console.log(`\n🏁 Test Suite Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
