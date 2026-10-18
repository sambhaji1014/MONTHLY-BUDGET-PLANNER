
async function runTest() {
  console.log('🔄 Starting Cross-Browser Sync & Restoration Roundtrip Test...');

  const userEmail = 'browser_test_' + Date.now() + '@wealthwise.io';
  const payload = {
    email: userEmail,
    monthlyIncome: 175000,
    categories: [
      {
        id: 'cat-cb-1',
        name: 'Fine Dining & Hospitality',
        type: 'want',
        allocatedAmount: 30000,
        spentAmount: 8500,
        color: '#E0A899',
        icon: 'Utensils',
        isLocked: false,
      },
      {
        id: 'cat-cb-2',
        name: 'Equities & SIP Portfolio',
        type: 'savings',
        allocatedAmount: 50000,
        spentAmount: 50000,
        color: '#3A6046',
        icon: 'TrendingUp',
        isLocked: true,
      },
    ],
    transactions: [
      {
        id: 'tx-cb-101',
        title: 'Nifty 50 Index Fund SIP',
        amount: 50000,
        type: 'expense',
        category: 'Equities & SIP Portfolio',
        date: '2026-10-18',
        paymentMethod: 'NetBanking',
      },
    ],
    goals: [
      {
        id: 'goal-cb-1',
        title: 'Penthouse Down Payment',
        targetAmount: 5000000,
        currentAmount: 1200000,
        targetDate: '2028-12-31',
        category: 'Real Estate',
        monthlyContributionRequired: 150000,
      },
    ],
    bills: [
      {
        id: 'bill-cb-1',
        name: 'Private Club Membership',
        amount: 15000,
        billingCycle: 'monthly',
        dueDate: '2026-11-01',
        status: 'upcoming',
      },
    ],
  };

  // Step 1: Simulate Browser 1 saving data once
  console.log(`📡 [Browser A] Saving portfolio for user: ${userEmail}...`);
  const postRes = await fetch('http://localhost:5000/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const postJson: any = await postRes.json();
  if (!postJson.success) {
    throw new Error('POST /api/sync failed: ' + JSON.stringify(postJson));
  }
  console.log('✅ [Browser A] Data successfully saved to backend server at:', postJson.savedAt);

  // Step 2: Simulate Browser 2 (or incognito tab) querying and restoring the data
  console.log(`🌐 [Browser B] Querying GET /api/sync?email=${userEmail} (clean slate restoration)...`);
  const getRes = await fetch(`http://localhost:5000/api/sync?email=${encodeURIComponent(userEmail)}`);
  const getJson: any = await getRes.json();

  if (!getJson.success || !getJson.data) {
    throw new Error('GET /api/sync failed: ' + JSON.stringify(getJson));
  }

  const restored = getJson.data;
  console.log('✅ [Browser B] Received restored data payload:');
  console.log(`   - Monthly Income: ₹${restored.monthlyIncome}`);
  console.log(`   - Categories Restored: ${restored.categories.length}`);
  console.log(`   - Transactions Restored: ${restored.transactions.length}`);
  console.log(`   - Goals Restored: ${restored.goals.length}`);
  console.log(`   - Bills Restored: ${restored.bills.length}`);

  // Step 3: Assert 100% data fidelity
  if (restored.monthlyIncome !== 175000) throw new Error('Monthly income mismatch!');
  if (restored.categories.length !== 2) throw new Error('Categories count mismatch!');
  if (restored.categories[0].name !== 'Fine Dining & Hospitality') throw new Error('Category name mismatch!');
  if (restored.transactions.length !== 1) throw new Error('Transactions count mismatch!');
  if (restored.transactions[0].title !== 'Nifty 50 Index Fund SIP') throw new Error('Transaction title mismatch!');
  if (restored.goals.length !== 1) throw new Error('Goals count mismatch!');
  if (restored.goals[0].title !== 'Penthouse Down Payment') throw new Error('Goal title mismatch!');
  if (restored.bills.length !== 1) throw new Error('Bills count mismatch!');
  if (restored.bills[0].name !== 'Private Club Membership') throw new Error('Bill name mismatch!');

  console.log('🎉 100% Cross-Browser Data Synchronization & Restoration SUCCESSFUL!');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
