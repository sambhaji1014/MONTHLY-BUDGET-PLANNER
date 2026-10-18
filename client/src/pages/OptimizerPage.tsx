import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StickyNote } from '../components/ui/StickyNote';
import { OptimizationStrategy, OptimizationResponse } from '../services/optimizer';
import { calculateCompoundWealthProjection } from '../utils/financialCalculations';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Scale,
  Zap,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const OptimizerPage: React.FC = () => {
  const {
    monthlyIncome,
    categories,
    toggleCategoryLock,
    runOptimizer,
    applyOptimizedBudget,
  } = useFinance();

  const [strategy, setStrategy] = useState<OptimizationStrategy>('balanced_50_30_20');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse>(() => {
    return runOptimizer('balanced_50_30_20');
  });
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleRunOptimizer = (selectedStrat: OptimizationStrategy) => {
    setStrategy(selectedStrat);
    const res = runOptimizer(selectedStrat);
    setOptimizationResult(res);
    setAppliedSuccess(false);
  };

  const handleApply = () => {
    if (!optimizationResult.isFeasible) return;
    applyOptimizedBudget(optimizationResult);
    setAppliedSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5A15B', '#FAF7F0', '#D99AA6', '#4E775B'],
      });
    } catch {
      // ignore
    }
  };

  // Chart comparison data
  const comparisonChartData = optimizationResult.categories.map((c) => ({
    name: c.name.length > 14 ? `${c.name.slice(0, 12)}…` : c.name,
    Current: c.currentBudget,
    Recommended: c.recommendedBudget,
    diff: c.difference,
  }));

  const wealthProjection = calculateCompoundWealthProjection(optimizationResult.totalProjectedSavings || 5000);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
              Mathematical Optimization Engine
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">Zero Guesses · Hard Mathematical Constraints</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Smart Monthly Budget Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal max-w-2xl">
            Rebalances your monthly ₹{monthlyIncome.toLocaleString('en-IN')} income using constraint satisfaction.
            Locks protect non-negotiables like Rent and EMI, while flexible wants are trimmed to accelerate wealth.
          </p>
        </div>

        {/* Apply CTA */}
        <div className="flex items-center gap-3">
          {appliedSuccess && (
            <span className="text-xs font-semibold text-sage-muted flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Applied to Live Budget
            </span>
          )}
          <Button
            variant="blush"
            size="md"
            onClick={handleApply}
            disabled={!optimizationResult.isFeasible || appliedSuccess}
            icon={<CheckCircle2 className="w-4 h-4 text-blush-deep" />}
            className="shadow-sticky-pink"
          >
            {appliedSuccess ? 'Changes Applied' : 'Accept & Apply Budget'}
          </Button>
        </div>
      </div>

      {/* Strategy Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => handleRunOptimizer('balanced_50_30_20')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            strategy === 'balanced_50_30_20'
              ? 'bg-cream-200 border-gold-champagne shadow-sm'
              : 'bg-white border-silver-soft hover:border-gold-champagne/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm text-espresso-charcoal">
              Balanced 50/30/20
            </span>
            <Badge variant="gold" size="sm">Standard</Badge>
          </div>
          <p className="text-xs text-espresso-muted leading-relaxed">
            50% Needs, 30% Wants, 20% Wealth. Timeless financial harmony for long-term compounding.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleRunOptimizer('aggressive_savings')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            strategy === 'aggressive_savings'
              ? 'bg-cream-200 border-gold-champagne shadow-sm'
              : 'bg-white border-silver-soft hover:border-gold-champagne/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm text-espresso-charcoal">
              Aggressive Wealth
            </span>
            <Badge variant="sage" size="sm">Max FIRE</Badge>
          </div>
          <p className="text-xs text-espresso-muted leading-relaxed">
            Trims discretionary dining and shopping to 15%. Boosts savings to 40% for rapid financial freedom.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleRunOptimizer('debt_accelerator')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            strategy === 'debt_accelerator'
              ? 'bg-cream-200 border-gold-champagne shadow-sm'
              : 'bg-white border-silver-soft hover:border-gold-champagne/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm text-espresso-charcoal">
              Debt Paydown
            </span>
            <Badge variant="red" size="sm">Avalanche</Badge>
          </div>
          <p className="text-xs text-espresso-muted leading-relaxed">
            Directs freed cashflow into principal debt reduction to extinguish high-interest EMIs fast.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleRunOptimizer('gentle_cutback')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            strategy === 'gentle_cutback'
              ? 'bg-cream-200 border-gold-champagne shadow-sm'
              : 'bg-white border-silver-soft hover:border-gold-champagne/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm text-espresso-charcoal">
              Gentle Cutback
            </span>
            <Badge variant="silver" size="sm">Gradual</Badge>
          </div>
          <p className="text-xs text-espresso-muted leading-relaxed">
            Minimal disruption. Trims just 10% from flexible shopping while protecting lifestyle joy.
          </p>
        </button>
      </div>

      {/* Prominent Wealth Compounding Engine Banner */}
      <Card className="p-6 bg-gradient-to-br from-pearl-50 via-cream-100/70 to-blush-50/70 border border-blush-rose/50 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blush-100 text-blush-deep border border-blush-rose/50">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blush-deep">
                Compound Wealth Horizon (12% CAGR Projection)
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-espresso-charcoal">
              This Strategy Unlocks{' '}
              <span className="text-gold-dark font-serif underline decoration-gold-champagne/40">
                {formatINR(wealthProjection.tenYears)}
              </span>{' '}
              Over 10 Years
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              By preserving locked obligations and trimming minor discretionary leaks, you divert +{formatINR(optimizationResult.totalProjectedSavings)}/month into compounding assets.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center flex-shrink-0">
            <div className="p-3 bg-white/90 rounded-xl border border-silver-soft shadow-2xs">
              <span className="text-[10px] text-espresso-muted uppercase font-bold block">1-Yr Capital</span>
              <span className="text-sm font-serif font-bold text-espresso-charcoal mt-0.5 block">
                {formatINR(wealthProjection.oneYear)}
              </span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-silver-soft shadow-2xs">
              <span className="text-[10px] text-espresso-muted uppercase font-bold block">5-Yr SIP</span>
              <span className="text-sm font-serif font-bold text-sage-muted mt-0.5 block">
                {formatINR(wealthProjection.fiveYears)}
              </span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-gold-champagne/40 shadow-2xs">
              <span className="text-[10px] text-gold-dark uppercase font-bold block">Pure Gain</span>
              <span className="text-sm font-serif font-bold text-gold-dark mt-0.5 block">
                +{formatINR(wealthProjection.wealthGainTenYears)}
              </span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-silver-soft shadow-2xs">
              <span className="text-[10px] text-espresso-muted uppercase font-bold block">Multiplier</span>
              <span className="text-sm font-serif font-bold text-espresso-charcoal mt-0.5 block">
                {wealthProjection.growthMultiplier}x
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Optimizer Macro Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[11px] text-espresso-muted uppercase font-bold">Recommended Total</span>
          <div className="text-2xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(optimizationResult.totalRecommendedBudget)}
          </div>
          <span className="text-[11px] text-espresso-light mt-0.5 block">
            100% of ₹{monthlyIncome.toLocaleString('en-IN')} income
          </span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] text-espresso-muted uppercase font-bold">Optimized Savings Rate</span>
          <div className="text-2xl font-serif font-bold text-sage-muted mt-1">
            {optimizationResult.optimizedSavingsRate}%
          </div>
          <span className="text-[11px] text-sage-muted font-semibold mt-0.5 block">
            From current {optimizationResult.currentSavingsRate}%
          </span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] text-espresso-muted uppercase font-bold">Monthly Wealth Addition</span>
          <div className="text-2xl font-serif font-bold text-gold-dark mt-1">
            +{formatINR(optimizationResult.totalProjectedSavings)}
          </div>
          <span className="text-[11px] text-gold-dark font-medium mt-0.5 block">
            Dedicated capital accumulation
          </span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] text-espresso-muted uppercase font-bold">12-Month Projection</span>
          <div className="text-2xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(optimizationResult.projectedAnnualWealthIncrease)}
          </div>
          <span className="text-[11px] text-espresso-light mt-0.5 block">
            Pure principal accumulated
          </span>
        </Card>
      </div>

      {/* Sticky Note Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StickyNote
          variant="pink"
          tag="Trade-off Explanation"
          title="Executive Optimization Verdict"
        >
          {optimizationResult.tradeOffSummary}
        </StickyNote>

        <StickyNote
          variant="gold"
          tag="Macro Distribution"
          title="50 / 30 / 20 Target Compliance"
        >
          <div className="space-y-1">
            {optimizationResult.macroInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs">
                <span>•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </StickyNote>
      </div>

      {/* Side-by-Side Visual Chart */}
      <Card className="p-6">
        <CardHeader
          title="Current Budget vs. Smart Recommendation"
          subtitle="Visualize the exact rupee shift across every spending category"
        />
        <CardContent>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#615A58', fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  axisLine={{ stroke: '#ECEDEF' }}
                />
                <YAxis
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fill: '#615A58', fontSize: 11 }}
                  axisLine={{ stroke: '#ECEDEF' }}
                />
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
                <Bar dataKey="Current" fill="#C7CBD1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recommended" fill="#C5A15B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Itemized Category Recommendation Table */}
      <Card className="p-6">
        <CardHeader
          title="Itemized Optimization Rationale"
          subtitle="Every change is strictly explained. Use the lock icon to protect non-negotiable budgets."
          action={
            <span className="text-xs text-espresso-muted">
              {categories.filter((c) => c.isLocked).length} categories locked
            </span>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-silver-soft text-espresso-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold text-right">Current</th>
                  <th className="pb-3 font-semibold text-right">Recommended</th>
                  <th className="pb-3 font-semibold text-right">Difference</th>
                  <th className="pb-3 font-semibold pl-4">Optimization Rationale</th>
                  <th className="pb-3 font-semibold text-center">Lock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver-soft/60">
                {optimizationResult.categories.map((cat) => {
                  const isLocked = categories.find((c) => c.id === cat.id)?.isLocked;
                  const diff = cat.difference;

                  return (
                    <tr key={cat.id} className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3.5 font-semibold text-espresso-charcoal">
                        {cat.name}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-silver-soft text-espresso-muted">
                          {cat.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-espresso-muted font-serif">
                        {formatINR(cat.currentBudget)}
                      </td>
                      <td className="py-3.5 text-right font-serif font-bold text-espresso-charcoal">
                        {formatINR(cat.recommendedBudget)}
                      </td>
                      <td className={`py-3.5 text-right font-serif font-bold ${
                        diff > 0 ? 'text-sage-muted' : diff < 0 ? 'text-expense-muted' : 'text-espresso-muted'
                      }`}>
                        {diff > 0 ? `+${formatINR(diff)}` : diff < 0 ? formatINR(diff) : '—'}
                      </td>
                      <td className="py-3.5 pl-4 text-xs text-espresso-charcoal max-w-sm">
                        <div>{cat.rationale}</div>
                        <div className="text-[11px] text-espresso-light mt-0.5 italic">
                          Tip: {cat.actionableTip}
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => {
                            toggleCategoryLock(cat.id);
                            // Rerun optimizer automatically when lock toggled
                            setTimeout(() => handleRunOptimizer(strategy), 50);
                          }}
                          title={isLocked ? 'Unlock category for optimization' : 'Lock category to preserve current allocation'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isLocked
                              ? 'bg-gold-light/60 text-gold-dark border-gold-champagne/40'
                              : 'bg-white text-espresso-light border-silver-soft hover:text-espresso-charcoal'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-silver-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-espresso-muted">
              <strong>Tip:</strong> Locked categories (like Rent and EMI) will never be trimmed by the algorithm.
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
              disabled={!optimizationResult.isFeasible || appliedSuccess}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="shadow-gold-glow"
            >
              {appliedSuccess ? 'Changes Applied' : 'Accept & Apply Budget'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
