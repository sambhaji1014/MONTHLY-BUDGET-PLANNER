import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { verifyOAuthToken, clearLastSignOutReceipt } from '../services/authService';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { formatINR, formatCompactINR, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StickyNote } from '../components/ui/StickyNote';
import { evaluateToleranceBand } from '../utils/financialCalculations';
import { getTailoredCategoryAdvice } from '../services/optimizer';
import {
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  PlusCircle,
  CheckCircle2,
  Wallet,
  PiggyBank,
  Lightbulb,
  Check,
  Compass,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPageContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    userProfile,
    isUserLoading,
    refetchUser,
    loginUser,
    dashboardMode,
    setDashboardMode,
    monthlyIncome,
    totalExpenses,
    remainingIncome,
    savingsRate,
    budgetHealthScore,
    monthEndForecast,
    categories,
    transactions,
    goals,
    bills,
    toggleBillPaid,
  } = useFinance();

  // Task: Initialize user state with safe defaults in DashboardPage.tsx
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    token?: string | null;
    preferences?: any;
  }>(() => ({
    name: user?.name || userProfile?.name || 'Member',
    email: user?.email || userProfile?.email || '',
    token: user?.token || null,
    preferences: user?.preferences || userProfile?.preferences,
  }));

  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // If redirected directly to /dashboard?token=... from OAuth callback, verify and hydrate
  useEffect(() => {
    const token = searchParams.get('token');
    const queryName = searchParams.get('name');
    const queryEmail = searchParams.get('email');

    if (token) {
      setIsVerifyingToken(true);
      verifyOAuthToken(token)
        .then((res) => {
          if (res.success && (res.user || res.name)) {
            clearLastSignOutReceipt();
            const resolvedName =
              res.name?.trim() ||
              res.user?.name?.trim() ||
              queryName?.trim() ||
              (res.email ? res.email.split('@')[0] : 'Member');

            const safeUser = {
              ...(res.user || {}),
              id: res.user?.id || `usr_oauth_${Date.now()}`,
              name: resolvedName,
              email: res.email || res.user?.email || queryEmail || '',
              preferences: res.preferences || res.user?.preferences || {
                currency: 'INR',
                theme: 'luxury',
                notificationAlerts: true,
                riskTolerance: 'growth',
                monthlySavingsTargetPercent: 25,
                monthlyIncome: 120000,
                primarySavingsGoal: 'Wealth Compounding',
                allocationStyle: 'growth',
              },
              isNewUser: res.user?.isNewUser ?? false,
              createdAt: res.user?.createdAt || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };

            loginUser(safeUser);
            setCurrentUser(safeUser);

            // Clean query parameters from URL without page reload
            window.history.replaceState({}, '', '/dashboard');
          } else {
            setAuthError(res.error || 'Unable to authenticate session token.');
          }
        })
        .catch((err) => {
          setAuthError(err.message || 'Network error verifying OAuth token.');
        })
        .finally(() => {
          setIsVerifyingToken(false);
        });
    }
  }, [searchParams, loginUser]);

  // Keep local user state synchronized with context updates
  useEffect(() => {
    if (user?.name || userProfile?.name) {
      setCurrentUser({
        name: user?.name || userProfile?.name || 'Member',
        email: user?.email || userProfile?.email || '',
        token: user?.token || null,
        preferences: user?.preferences || userProfile?.preferences,
      });
    }
  }, [user, userProfile]);

  const isBeginner = dashboardMode === 'beginner';

  // Task: Use optional chaining (user?.name) to prevent undefined errors
  const displayName = user?.name?.trim() || currentUser?.name?.trim() || userProfile?.name?.trim() || 'Member';

  // Task: Add error boundary and loading fallback instead of blank or "Unable to load page"
  if (isUserLoading || isVerifyingToken) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-gold-champagne/40 border-t-gold-champagne animate-spin mx-auto" />
        <h3 className="font-serif text-xl font-bold text-espresso-charcoal">
          Loading Financial Portfolio
        </h3>
        <p className="text-xs text-espresso-muted max-w-sm mx-auto leading-relaxed">
          Verifying your secure credentials and preparing your private budget records...
        </p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-6 shadow-xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-espresso-charcoal">Session Loading Notice</h3>
          <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl font-mono">{authError}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setAuthError(null);
                refetchUser();
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry Loading
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/login')}>
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fixed vs Variable vs Savings aggregates
  const fixedTotal = categories
    .filter((c) => c.type === 'need' || c.type === 'debt')
    .reduce((s, c) => s + c.spentAmount, 0);

  const variableTotal = categories
    .filter((c) => c.type === 'want')
    .reduce((s, c) => s + c.spentAmount, 0);

  const savingsTotal = categories
    .filter((c) => c.type === 'savings')
    .reduce((s, c) => s + c.spentAmount, 0);

  const needsPercent = monthlyIncome > 0 ? Math.round((fixedTotal / monthlyIncome) * 100) : 0;
  const wantsPercent = monthlyIncome > 0 ? Math.round((variableTotal / monthlyIncome) * 100) : 0;
  const savingsPercent = monthlyIncome > 0 ? Math.round((Math.max(0, remainingIncome) / monthlyIncome) * 100) : 0;

  // Tolerance evaluations
  const needsEval = evaluateToleranceBand('needs', needsPercent);
  const wantsEval = evaluateToleranceBand('wants', wantsPercent);
  const savingsEval = evaluateToleranceBand('savings', savingsPercent);

  // Simple 3-Bar Chart data for Beginner Mode with luxury pink and gold fills
  const simpleCashflowData = [
    { name: 'Income', amount: monthlyIncome, fill: '#C5A15B' },
    { name: 'Expenses', amount: totalExpenses, fill: '#BA5A5A' },
    { name: 'Savings Left', amount: Math.max(0, remainingIncome), fill: '#4E775B' },
  ];

  // Advanced Bar Chart data
  const advancedCashflowData = [
    { name: 'Net Income', amount: monthlyIncome, fill: '#C5A15B' },
    { name: 'Budget Plan', amount: categories.reduce((s, c) => s + c.allocatedAmount, 0), fill: '#C7CBD1' },
    { name: 'Actual Spent', amount: totalExpenses, fill: '#BA5A5A' },
    { name: 'Retained Surplus', amount: Math.max(0, remainingIncome), fill: '#4E775B' },
  ];

  // Where Your Money Goes - Donut Data with Rose/Blush accents
  const simplePieData = [
    { name: 'Fixed Shelter & Rent', value: fixedTotal || 1, color: '#C5A15B' },
    { name: 'Flexible Lifestyle', value: variableTotal || 1, color: '#D99AA6' },
    { name: 'Dedicated Wealth & Goals', value: Math.max(0, remainingIncome) || 1, color: '#4E775B' },
  ];

  const categoryPieData = categories
    .filter((c) => c.spentAmount > 0)
    .map((c) => ({
      name: c.name,
      value: c.spentAmount,
      color: c.color,
      type: c.type,
    }));

  const upcomingBills = bills.filter((b) => b.status === 'upcoming');
  const recentTransactions = transactions.slice(0, 5);

  // Find top discretionary spending category for tailored advice
  const topWantCategory = categories
    .filter((c) => c.type === 'want')
    .sort((a, b) => b.spentAmount - a.spentAmount)[0] || categories[0];

  const tailoredTopAdvice = getTailoredCategoryAdvice(
    topWantCategory?.name || 'Dining Out',
    'want',
    -Math.round((topWantCategory?.spentAmount || 3000) * 0.15),
    false
  );

  // Friendly health message based on plain savings percentage & tolerance
  const getFriendlyHealthFeedback = () => {
    const percentSpent = monthlyIncome > 0 ? Math.round((totalExpenses / monthlyIncome) * 100) : 0;
    if (percentSpent <= 70) {
      return {
        badge: 'Exceptional Balance',
        badgeVariant: 'sage' as const,
        message: `You've used ${percentSpent}% of your income. Your allocations stay comfortably within healthy tolerance bands with strong wealth momentum.`,
      };
    } else if (percentSpent <= 85) {
      return {
        badge: 'On Track (±3% Tolerance)',
        badgeVariant: 'gold' as const,
        message: `You've used ${percentSpent}% of your income. Normal living variance observed; savings pace remains positive and stable.`,
      };
    } else if (percentSpent <= 100) {
      return {
        badge: 'Within High-Spend Tolerance',
        badgeVariant: 'blush' as const,
        message: `Spending is at ${percentSpent}% of income. Reassuring: commitments are covered, but keep discretionary purchases light.`,
      };
    } else {
      return {
        badge: 'Review Overflows',
        badgeVariant: 'red' as const,
        message: `Outflows slightly exceed monthly earnings. Run the Smart Optimizer to rebalance flexible categories safely.`,
      };
    }
  };

  const friendlyHealth = getFriendlyHealthFeedback();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Editorial Luxury Header - Clutter-Free */}
      <div className="pb-4 border-b border-silver-soft/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
            {isBeginner ? 'Personal Budget Overview' : 'Executive Financial Analysis'}
          </span>
          <span className="text-silver-brushed">•</span>
          <span className="text-xs text-espresso-light">
            Current Period: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
          {userProfile?.isNewUser ? `Welcome to WealthWise, ${displayName} ✨` : `Welcome back, ${displayName} 👋`}
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal max-w-2xl">
          {userProfile?.isNewUser
            ? `Your new profile is initialized. Here is your baseline plan aligned with your ${userProfile?.preferences?.monthlySavingsTargetPercent || 25}% savings goal.`
            : `Here is a clear look at your earnings, spending, and category envelopes this month.`}
        </p>
      </div>

      {/* Top 4 Core Metric Cards with Integrated Budget Health Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Income */}
        <Card className="p-5 bg-white border border-silver-soft/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Monthly Take-Home</span>
            <span className="p-1.5 rounded-lg bg-cream-200 text-gold-dark">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-bold text-espresso-charcoal">
            {formatINR(monthlyIncome)}
          </div>
          <div className="mt-2 text-xs text-sage-muted flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Income baseline
          </div>
        </Card>

        {/* Metric 2: Spent so far */}
        <Card className="p-5 bg-white border border-silver-soft/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Spent So Far</span>
            <span className="p-1.5 rounded-lg bg-expense-soft text-expense-muted">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-bold text-espresso-charcoal">
            {formatINR(totalExpenses)}
          </div>
          <div className="mt-2 text-xs text-espresso-muted flex items-center justify-between">
            <span>
              {monthlyIncome > 0
                ? `${Math.round((totalExpenses / monthlyIncome) * 100)}% of income used`
                : 'No income logged'}
            </span>
          </div>
        </Card>

        {/* Metric 3: Money Left for the Month */}
        <Card className="p-5 bg-white border border-silver-soft/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Money Left to Spend</span>
            <span className="p-1.5 rounded-lg bg-sage-soft text-sage-muted">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl lg:text-3xl font-serif font-bold ${remainingIncome < 0 ? 'text-expense-muted' : 'text-sage-muted'}`}>
            {formatINR(remainingIncome)}
          </div>
          <div className="mt-2 text-xs text-espresso-muted">
            {remainingIncome >= 0 ? 'Remaining safe cushion' : 'Over budget'}
          </div>
        </Card>

        {/* Metric 4: Planned Savings with Compact Budget Health Pill */}
        <Card className="p-5 bg-gradient-to-br from-white to-pearl-50 border border-gold-champagne/40 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Savings Put Aside</span>
            <Badge variant={friendlyHealth.badgeVariant} size="sm">
              {friendlyHealth.badge}
            </Badge>
          </div>
          <div className="text-2xl lg:text-3xl font-serif font-bold text-gold-dark">
            {formatINR(Math.max(0, remainingIncome))}
          </div>
          <div className="mt-2 text-xs text-espresso-muted flex items-center justify-between">
            <span>{savingsRate}% saved · {budgetHealthScore}/100 Health</span>
            <span
              className="text-gold-champagne font-semibold hover:underline cursor-pointer text-[11px]"
              onClick={() => navigate('/goals')}
            >
              Goals →
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Category Envelopes Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Category Envelopes & Cashflow Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Spending Progress Bars (Active Envelopes) */}
          <Card className="p-6">
            <CardHeader
              title="This Month's Spending by Category"
              subtitle="Active envelope utilization against monthly limits"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/budget-planner')}>
                  Edit Limits →
                </Button>
              }
            />
            <CardContent className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-6 text-xs text-espresso-muted">
                  No category envelopes set yet. Use the top "+ Add Entry" button to record an expense.
                </div>
              ) : (
                categories.slice(0, 6).map((cat) => {
                  const percent = Math.min(
                    100,
                    Math.round((cat.spentAmount / (cat.allocatedAmount || 1)) * 100)
                  );
                  const isOver = cat.spentAmount > cat.allocatedAmount;

                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-semibold text-espresso-charcoal">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-semibold ${
                              isOver ? 'text-expense-muted' : 'text-espresso-charcoal'
                            }`}
                          >
                            {formatINR(cat.spentAmount)}
                          </span>
                          <span className="text-espresso-muted">
                            {' '}
                            spent of {formatINR(cat.allocatedAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-silver-soft rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: isOver ? '#BA5A5A' : cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Simple / Advanced Cashflow Bar Chart */}
          <Card className="p-6">
            <CardHeader
              title={isBeginner ? 'Income vs Spending vs Savings' : 'Monthly Cashflow Balance'}
              subtitle={
                isBeginner
                  ? 'A quick look at what came in, what was spent, and what is left (₹)'
                  : 'Income versus Budget Allocation, Actual Expenses, and Retained Surplus (₹)'
              }
              action={
                <Badge variant="gold">
                  {isBeginner ? `${savingsRate}% Saved` : `Savings Rate: ${savingsRate}%`}
                </Badge>
              }
            />
            <CardContent>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={isBeginner ? simpleCashflowData : advancedCashflowData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#615A58', fontSize: 11 }}
                      axisLine={{ stroke: '#ECEDEF' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => formatCompactINR(val)}
                      tick={{ fill: '#615A58', fontSize: 11 }}
                      axisLine={{ stroke: '#ECEDEF' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatINR(Number(val) || 0), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #C7CBD1',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(48,44,43,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {(isBeginner ? simpleCashflowData : advancedCashflowData).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-silver-soft/80 text-center">
                <div>
                  <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                    Income
                  </span>
                  <span className="text-xs font-serif font-bold text-espresso-charcoal">
                    {formatINR(monthlyIncome)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                    Spent
                  </span>
                  <span className="text-xs font-serif font-bold text-expense-muted">
                    {formatINR(totalExpenses)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                    Saved
                  </span>
                  <span className="text-xs font-serif font-bold text-sage-muted">
                    {formatINR(Math.max(0, remainingIncome))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Donut, Tips, and Upcoming Bills */}
        <div className="space-y-6">
          {/* Donut Chart: Where Your Money Goes */}
          <Card className="p-6">
            <CardHeader
              title="Where Your Money Goes"
              subtitle={isBeginner ? 'Fixed bills vs daily spending vs savings' : 'Category distribution'}
            />
            <CardContent>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={isBeginner ? simplePieData : categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {(isBeginner ? simplePieData : categoryPieData).map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatINR(Number(val) || 0), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #C7CBD1',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend preview */}
              <div className="grid grid-cols-1 gap-1.5 mt-2 pt-3 border-t border-silver-soft text-xs">
                {(isBeginner ? simplePieData : categoryPieData.slice(0, 4)).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-espresso-muted truncate">{c.name}</span>
                    </div>
                    <span className="font-semibold text-espresso-charcoal">{formatINR(c.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Friendly Blush-Pink Sticky Note with Tailored Category Advice */}
          <StickyNote
            variant="pink"
            tag={`Tailored: ${topWantCategory.name}`}
            title={`Optimizing ${topWantCategory.name}`}
            action={{
              label: 'Audit in Budget Planner',
              onClick: () => navigate('/budget-planner'),
            }}
          >
            <div className="space-y-1.5">
              <p className="font-medium text-espresso-charcoal leading-snug">
                {tailoredTopAdvice.actionableTip}
              </p>
              <p className="text-xs text-espresso-muted leading-relaxed">
                {tailoredTopAdvice.rationale}
              </p>
            </div>
          </StickyNote>

          {/* Upcoming Bills Checklist */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-silver-soft">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-espresso-muted" />
                <h4 className="font-serif font-bold text-sm text-espresso-charcoal">
                  Upcoming Bills to Pay
                </h4>
              </div>
              <span className="text-xs text-espresso-light">{upcomingBills.length} scheduled</span>
            </div>

            <div className="divide-y divide-silver-soft/80 mt-2">
              {upcomingBills.length === 0 ? (
                <div className="text-center py-4 text-xs text-espresso-muted">
                  No pending bills right now. All caught up!
                </div>
              ) : (
                upcomingBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-espresso-charcoal">{bill.name}</div>
                      <div className="text-[11px] text-espresso-light">Due {formatDate(bill.dueDate)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-espresso-charcoal">
                        {formatINR(bill.amount)}
                      </span>
                      <button
                        onClick={() => toggleBillPaid(bill.id)}
                        title="Mark as paid"
                        className="p-1 rounded text-espresso-muted hover:text-sage-muted hover:bg-sage-soft transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions List */}
      <Card className="p-6">
        <CardHeader
          title="Recent Activity"
          subtitle="Latest entries in your budget"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View All Entries →
            </Button>
          }
        />
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-espresso-muted">
              No recent entries yet. Click "+ Add Expense or Income" above to log your first transaction!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-silver-soft text-espresso-muted uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Payment Method</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver-soft/60">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3 font-medium text-espresso-charcoal flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-sage-soft text-sage-muted'
                              : 'bg-expense-soft text-expense-muted'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-espresso-charcoal">
                            {tx.title}
                          </div>
                          {tx.notes && (
                            <div className="text-[10px] text-espresso-light truncate max-w-xs">
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-espresso-muted">
                        <span className="px-2 py-0.5 rounded-md bg-silver-soft text-[11px] font-medium text-espresso-charcoal">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-espresso-light">{formatDate(tx.date)}</td>
                      <td className="py-3 text-espresso-muted">{tx.paymentMethod}</td>
                      <td
                        className={`py-3 text-right font-serif font-bold text-sm ${
                          tx.type === 'income' ? 'text-sage-muted' : 'text-espresso-charcoal'
                        }`}
                      >
                        {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackTitle="Dashboard Display Issue"
      fallbackMessage="WealthWise caught a momentary display issue. You can retry safely."
    >
      <DashboardPageContent />
    </ErrorBoundary>
  );
};
