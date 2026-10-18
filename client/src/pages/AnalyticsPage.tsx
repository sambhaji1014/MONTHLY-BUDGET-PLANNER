import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StickyNote } from '../components/ui/StickyNote';
import {
  TrendingUp,
  PieChart as PieIcon,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const {
    monthlyIncome,
    totalExpenses,
    savingsRate,
    budgetHealthScore,
    categories,
    transactions,
    monthEndForecast,
  } = useFinance();

  // 6-Month cashflow trend simulation
  const trendData = [
    { month: 'May 26', income: 110000, expenses: 84000, savings: 26000 },
    { month: 'Jun 26', income: 110000, expenses: 89000, savings: 21000 },
    { month: 'Jul 26', income: 115000, expenses: 86000, savings: 29000 },
    { month: 'Aug 26', income: 115000, expenses: 92000, savings: 23000 },
    { month: 'Sep 26', income: 120000, expenses: 87000, savings: 33000 },
    { month: 'Oct 26 (Current)', income: monthlyIncome, expenses: totalExpenses, savings: Math.max(0, monthlyIncome - totalExpenses) },
  ];

  // Pillar allocations
  const needsSpend = categories
    .filter((c) => c.type === 'need')
    .reduce((s, c) => s + c.spentAmount, 0);
  const wantsSpend = categories
    .filter((c) => c.type === 'want')
    .reduce((s, c) => s + c.spentAmount, 0);
  const savingsSpend = categories
    .filter((c) => c.type === 'savings')
    .reduce((s, c) => s + c.spentAmount, 0);
  const debtSpend = categories
    .filter((c) => c.type === 'debt')
    .reduce((s, c) => s + c.spentAmount, 0);

  const needsPercent = monthlyIncome > 0 ? Math.round((needsSpend / monthlyIncome) * 100) : 0;
  const wantsPercent = monthlyIncome > 0 ? Math.round((wantsSpend / monthlyIncome) * 100) : 0;
  const savingsPercent = monthlyIncome > 0 ? Math.round((savingsSpend / monthlyIncome) * 100) : 0;
  const debtPercent = monthlyIncome > 0 ? Math.round((debtSpend / monthlyIncome) * 100) : 0;

  const pillarData = [
    { name: 'Needs & Shelter', value: needsSpend, color: '#4E775B' },
    { name: 'Wants & Lifestyle', value: wantsSpend, color: '#D99AA6' },
    { name: 'Wealth & SIPs', value: savingsSpend, color: '#C5A15B' },
    { name: 'Debt Amortization', value: debtSpend, color: '#BA5A5A' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Financial Intelligence
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">Multi-Month Analytics & Trends</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Cashflow & Spending Analytics
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Deep-dive metrics measuring long-term savings velocity, 50/30/20 guideline compliance, and burn rate.
          </p>
        </div>

        <Badge variant="gold" size="md">
          October 2026 Assessment
        </Badge>
      </div>

      {/* 4 Pillar Compliance Overview with Tolerance Bands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="50/30/20 Pillar Overview with Tolerance Bands">
        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-gold-dark/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-espresso-muted font-medium">Needs (Essentials)</span>
            <Badge variant={needsPercent <= 54 ? 'sage' : 'gold'}>
              {needsPercent}% / 50%
            </Badge>
          </div>
          <div className="text-xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(needsSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sage-muted" />
            <p className="text-[11px] text-espresso-muted">
              {needsPercent >= 46 && needsPercent <= 54 
                ? 'Within healthy tolerance band (46–54%)' 
                : needsPercent < 46 
                  ? 'Lean essentials: surplus available' 
                  : 'Slightly elevated fixed overhead (±4% range)'}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-blush-accent/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-espresso-muted font-medium">Wants (Discretionary)</span>
            <Badge variant={wantsPercent <= 34 ? 'blush' : 'red'}>
              {wantsPercent}% / 30%
            </Badge>
          </div>
          <div className="text-xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(wantsSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blush-accent" />
            <p className="text-[11px] text-espresso-muted">
              {wantsPercent >= 26 && wantsPercent <= 34 
                ? 'Safe lifestyle band (26–34%)' 
                : wantsPercent < 26 
                  ? 'Frugal lifestyle: room for joy' 
                  : 'Above 34% tolerance threshold'}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-gold-dark/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-espresso-muted font-medium">Wealth (Savings & SIP)</span>
            <Badge variant={savingsPercent >= 17 ? 'gold' : 'silver'}>
              {savingsPercent}% / 20%
            </Badge>
          </div>
          <div className="text-xl font-serif font-bold text-gold-dark mt-1">
            {formatINR(savingsSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gold-dark" />
            <p className="text-[11px] text-gold-dark font-medium">
              {savingsPercent >= 20 
                ? `+${savingsPercent - 20}% wealth acceleration` 
                : savingsPercent >= 17 
                  ? 'Acceptable savings runway (17–25%)' 
                  : 'Under 17% minimum wealth threshold'}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-silver-brushed/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-espresso-muted font-medium">Debt Obligations</span>
            <Badge variant={debtPercent <= 15 ? 'sage' : 'red'}>
              {debtPercent}% DTI
            </Badge>
          </div>
          <div className="text-xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(debtSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-silver-brushed" />
            <p className="text-[11px] text-espresso-muted">
              {debtPercent <= 15 ? 'Manageable DTI ratio (<15%)' : 'High leverage risk detected'}
            </p>
          </div>
        </Card>
      </div>

      {/* Prominent Wealth Compounding Horizon Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-r from-cream-100 via-blush-soft/30 to-cream-50 border border-gold-dark/25 shadow-soft">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blush-deep animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blush-deep">
                Long-Term Compounding Potential (12% CAGR)
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-espresso-charcoal">
              Monthly Savings of {formatINR(savingsSpend)} Expands Into{' '}
              <span className="text-blush-deep">{formatINR(Math.round(savingsSpend * 12 * ((Math.pow(1.12, 10) - 1) / 0.12)))}</span> in 10 Years
            </h3>
            <p className="text-xs sm:text-sm text-espresso-muted max-w-2xl font-normal">
              Small discretionary shifts redirected into equity SIPs compound exponentially. Minor trims of ₹2,500/mo create over ₹5.7 Lakhs in personal net worth.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-silver-soft text-center">
              <span className="text-[10px] uppercase font-bold text-espresso-muted block">3-Yr Value</span>
              <span className="text-base font-serif font-bold text-espresso-charcoal">
                {formatINR(Math.round(savingsSpend * 12 * ((Math.pow(1.12, 3) - 1) / 0.12)))}
              </span>
            </div>
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-silver-soft text-center">
              <span className="text-[10px] uppercase font-bold text-espresso-muted block">5-Yr Value</span>
              <span className="text-base font-serif font-bold text-gold-dark">
                {formatINR(Math.round(savingsSpend * 12 * ((Math.pow(1.12, 5) - 1) / 0.12)))}
              </span>
            </div>
            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blush-accent/40 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-blush-deep block">10-Yr Compounded</span>
              <span className="text-base font-serif font-bold text-blush-deep">
                {formatINR(Math.round(savingsSpend * 12 * ((Math.pow(1.12, 10) - 1) / 0.12)))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Cashflow Area Chart */}
      <Card className="p-6" role="region" aria-label="6-Month Cashflow and Wealth Retention Trajectory">
        <CardHeader
          title="6-Month Income, Expense & Savings Trajectory"
          subtitle="Longitudinal progression of wealth retention in INR (₹)"
        />
        <CardContent>
          <div className="h-72 w-full pt-2" tabIndex={0} aria-label="Interactive Area Chart displaying monthly income, expenses, and net savings from May to October 2026">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A15B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C5A15B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C46D7E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C46D7E" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4E775B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4E775B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#615A58', fontSize: 11 }} axisLine={{ stroke: '#ECEDEF' }} />
                <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fill: '#615A58', fontSize: 11 }} axisLine={{ stroke: '#ECEDEF' }} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #C7CBD1',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="income" name="Net Income" stroke="#C5A15B" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Total Expenses" stroke="#C46D7E" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                <Area type="monotone" dataKey="savings" name="Net Saved" stroke="#4E775B" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pillar Donut & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader
            title="Macro Allocation Pillars"
            subtitle="Current rupee breakdown across the 4 core pillars"
          />
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pillarData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {pillarData.map((entry, index) => (
                      <Cell key={`pillar-${index}`} fill={entry.color} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Insights */}
        <div className="space-y-4">
          <StickyNote
            variant="pink"
            tag="Discretionary Velocity"
            title="Dining Out is Your Most Elastic Lever"
          >
            Dining Out and Cafes accounts for <strong>{formatINR(8400)}</strong> this month. 
            Historically, your dining varies by ±₹3,500. Trimming 2 weekend restaurant outings 
            instantly recovers 3% in monthly savings rate without touching essential pantry staples.
          </StickyNote>

          <StickyNote
            variant="lavender"
            tag="Forecast Horizon"
            title="Safe Daily Spend Limit"
          >
            With <strong>{formatINR(monthEndForecast.dailySafeSpend)}</strong> available per day 
            for the remainder of October, your projected month-end closing cash balance will land at 
            <strong> {formatINR(monthEndForecast.projectedClosingBalance)}</strong>, well above safety threshold.
          </StickyNote>
        </div>
      </div>
    </div>
  );
};
