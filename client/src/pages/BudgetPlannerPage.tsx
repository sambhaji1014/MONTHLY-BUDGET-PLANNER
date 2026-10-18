import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StickyNote } from '../components/ui/StickyNote';
import {
  calculate50_30_20Split,
  evaluateToleranceBand,
  calculateCompoundWealthProjection,
  calculateCategoryActualSpent,
  calculate50_30_20ActualSpent,
} from '../utils/financialCalculations';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import {
  PieChart,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  PlusCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BudgetPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    monthlyIncome,
    categories,
    updateCategoryBudget,
    toggleCategoryLock,
    totalBudgetAllocated,
    totalExpenses,
    transactions,
  } = useFinance();

  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');

  const split50_30_20 = calculate50_30_20Split(monthlyIncome);
  const unallocatedAmount = monthlyIncome - totalBudgetAllocated;

  // Actual allocated totals per pillar (budget plan)
  const allocatedNeeds = categories
    .filter((c) => c.type === 'need' || c.type === 'debt')
    .reduce((s, c) => s + c.allocatedAmount, 0);

  const allocatedWants = categories
    .filter((c) => c.type === 'want')
    .reduce((s, c) => s + c.allocatedAmount, 0);

  const allocatedSavings = categories
    .filter((c) => c.type === 'savings')
    .reduce((s, c) => s + c.allocatedAmount, 0);

  const plannedNeedsPercent = monthlyIncome > 0 ? Math.round((allocatedNeeds / monthlyIncome) * 100) : 0;
  const plannedWantsPercent = monthlyIncome > 0 ? Math.round((allocatedWants / monthlyIncome) * 100) : 0;
  const plannedSavingsPercent = monthlyIncome > 0 ? Math.round((allocatedSavings / monthlyIncome) * 100) : 0;

  // Live actual spent dynamically aggregated from current month ledger transactions
  const actuals50_30_20 = calculate50_30_20ActualSpent(monthlyIncome, categories, transactions);

  // Dynamic tolerance evaluations reflecting live ledger expenditures
  const needsEval = evaluateToleranceBand('needs', actuals50_30_20.needsPercent);
  const wantsEval = evaluateToleranceBand('wants', actuals50_30_20.wantsPercent);
  const savingsEval = evaluateToleranceBand('savings', actuals50_30_20.savingsPercent);

  // Wealth Compounding Projection based on allocated savings
  const wealthProjection = calculateCompoundWealthProjection(Math.max(allocatedSavings, 5000));

  const handleStartEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setTempAmount(currentAmount.toString());
  };

  const handleSaveEdit = (id: string) => {
    const parsed = parseFloat(tempAmount);
    if (!isNaN(parsed) && parsed >= 0) {
      updateCategoryBudget(id, parsed);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-gold-champagne" />
              Allocation Architecture
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">Zero-Based Envelope Method in INR (₹)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Monthly Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal max-w-2xl">
            Assign every rupee an intentional role. Category envelopes prevent lifestyle creep, while
            calibrated tolerance bands give you breathing room without false alarms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsAddEntryOpen(true)}
            icon={<PlusCircle className="w-4 h-4 text-gold-dark" />}
            className="shadow-xs bg-white hover:bg-cream-100"
          >
            + Add Entry
          </Button>
          <Button
            variant="blush"
            size="md"
            onClick={() => navigate('/optimizer')}
            icon={<Sparkles className="w-4 h-4 text-blush-deep" />}
            className="shadow-sticky-pink"
          >
            Run Smart Optimizer
          </Button>
        </div>
      </div>

      {/* Allocation Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Net Monthly Income</span>
            <span className="p-1 rounded bg-cream-200 text-gold-dark text-[10px] font-bold">Baseline</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(monthlyIncome)}
          </div>
          <div className="text-xs text-espresso-light mt-1">
            Baseline for all category envelopes
          </div>
        </Card>

        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Allocated</span>
            <Badge variant="gold" size="sm">
              {Math.round((totalBudgetAllocated / (monthlyIncome || 1)) * 100)}% Assigned
            </Badge>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(totalBudgetAllocated)}
          </div>
          <div className="text-xs text-espresso-light mt-1">
            Across {categories.length} active budget envelopes
          </div>
        </Card>

        <Card
          className={`p-5 ${
            unallocatedAmount < 0
              ? 'bg-expense-soft/60 border-expense-border'
              : 'bg-gradient-to-br from-white to-pearl-50 border-silver-soft'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-espresso-muted mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Unallocated Buffer</span>
            <Badge variant={unallocatedAmount === 0 ? 'sage' : unallocatedAmount > 0 ? 'blush' : 'red'} size="sm">
              {unallocatedAmount === 0 ? 'Zero-Based' : unallocatedAmount > 0 ? 'Cash Cushion' : 'Over Limit'}
            </Badge>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-serif font-bold mt-1 ${
              unallocatedAmount < 0 ? 'text-expense-muted' : 'text-sage-muted'
            }`}
          >
            {formatINR(unallocatedAmount)}
          </div>
          <div className="text-xs text-espresso-muted mt-1 font-medium">
            {unallocatedAmount === 0
              ? '✨ Perfect Zero-Based Balance'
              : unallocatedAmount > 0
              ? 'Available surplus ready to fund wealth goals'
              : 'Over-budgeted: adjust envelopes to balance'}
          </div>
        </Card>
      </div>

      {/* Prominently Highlighted Wealth Compounding Card */}
      <Card className="p-6 bg-gradient-to-br from-pearl-50 via-cream-100/70 to-blush-50/60 border border-blush-rose/40 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blush-100 text-blush-deep border border-blush-rose/50">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blush-deep">
                Wealth Velocity & Compounding Acceleration (12% CAGR)
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-espresso-charcoal leading-snug">
              Allocating {formatINR(allocatedSavings)}/mo produces{' '}
              <span className="text-gold-dark font-serif underline decoration-gold-champagne/50">
                {formatINR(wealthProjection.tenYears)}
              </span>{' '}
              in 10 years
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Every rupee committed to savings and debt reduction compounds exponentially. Here is your portfolio trajectory before taxes:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
            <div className="p-3 bg-white/90 rounded-xl border border-silver-soft text-center shadow-2xs">
              <span className="text-[10px] text-espresso-muted uppercase font-bold block">1-Year Capital</span>
              <span className="text-sm font-serif font-bold text-espresso-charcoal block mt-0.5">
                {formatINR(wealthProjection.oneYear)}
              </span>
              <span className="text-[9px] text-espresso-light">12 pay cycles</span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-silver-soft text-center shadow-2xs">
              <span className="text-[10px] text-espresso-muted uppercase font-bold block">5-Year SIP Value</span>
              <span className="text-sm font-serif font-bold text-sage-muted block mt-0.5">
                {formatINR(wealthProjection.fiveYears)}
              </span>
              <span className="text-[9px] text-sage-muted font-semibold">+₹{Math.round(wealthProjection.fiveYears - allocatedSavings * 60).toLocaleString('en-IN')} gain</span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-gold-champagne/40 text-center shadow-2xs sm:col-span-1 col-span-2">
              <span className="text-[10px] text-gold-dark uppercase font-bold block">10-Year Pure Gain</span>
              <span className="text-sm font-serif font-bold text-gold-dark block mt-0.5">
                +{formatINR(wealthProjection.wealthGainTenYears)}
              </span>
              <span className="text-[9px] text-gold-dark font-semibold">{wealthProjection.growthMultiplier}x Principal</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 50/30/20 Standard Guideline Cards with Live Tolerance Bands & Instant Reactive Progress Bars */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="font-serif font-bold text-base text-espresso-charcoal flex items-center gap-2">
            <span>50 / 30 / 20 Structural Balance & Tolerance Bands</span>
          </h3>
          <span className="text-xs text-espresso-light">
            Live ledger spending vs monthly allocation guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs Pillar */}
          <div className="p-5 rounded-2xl bg-cream-100 border border-silver-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-silver-soft">
              <div>
                <span className="font-serif font-bold text-sm text-espresso-charcoal block">
                  Needs (50% Guideline)
                </span>
                <span className="text-[11px] text-espresso-muted">
                  Band: 46% – 54% (±4%)
                </span>
              </div>
              <Badge variant={needsEval.badgeVariant} size="sm">
                {actuals50_30_20.needsPercent}% ({needsEval.label})
              </Badge>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-espresso-muted font-medium">Actual Spent:</span>
              <span className="font-serif font-bold text-espresso-charcoal text-sm">
                {formatINR(actuals50_30_20.needsSpent)}{' '}
                <span className="font-normal text-xs text-espresso-light">
                  / {formatINR(allocatedNeeds)} planned
                </span>
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="h-2.5 w-full bg-silver-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gold-champagne"
                style={{ width: `${Math.min(100, actuals50_30_20.needsPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-espresso-light">
              <span>Remaining: {formatINR(allocatedNeeds - actuals50_30_20.needsSpent)}</span>
              <span>Target: {formatINR(split50_30_20.needs.targetAmount)} (50%)</span>
            </div>

            <p className="text-[11px] text-espresso-charcoal/80 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-silver-soft/80">
              💡 <span className="font-medium text-espresso-charcoal">{needsEval.reassurance}</span> {split50_30_20.needs.description}.
            </p>
          </div>

          {/* Wants Pillar */}
          <div className="p-5 rounded-2xl bg-cream-100 border border-silver-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-silver-soft">
              <div>
                <span className="font-serif font-bold text-sm text-espresso-charcoal block">
                  Wants (30% Guideline)
                </span>
                <span className="text-[11px] text-espresso-muted">
                  Band: 26% – 34% (±4%)
                </span>
              </div>
              <Badge variant={wantsEval.badgeVariant} size="sm">
                {actuals50_30_20.wantsPercent}% ({wantsEval.label})
              </Badge>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-espresso-muted font-medium">Actual Spent:</span>
              <span className="font-serif font-bold text-espresso-charcoal text-sm">
                {formatINR(actuals50_30_20.wantsSpent)}{' '}
                <span className="font-normal text-xs text-espresso-light">
                  / {formatINR(allocatedWants)} planned
                </span>
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="h-2.5 w-full bg-silver-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-blush-rose"
                style={{ width: `${Math.min(100, actuals50_30_20.wantsPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-espresso-light">
              <span>Remaining: {formatINR(allocatedWants - actuals50_30_20.wantsSpent)}</span>
              <span>Target: {formatINR(split50_30_20.wants.targetAmount)} (30%)</span>
            </div>

            <p className="text-[11px] text-espresso-charcoal/80 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-silver-soft/80">
              💡 <span className="font-medium text-espresso-charcoal">{wantsEval.reassurance}</span> {split50_30_20.wants.description}.
            </p>
          </div>

          {/* Savings Pillar */}
          <div className="p-5 rounded-2xl bg-cream-100 border border-silver-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-silver-soft">
              <div>
                <span className="font-serif font-bold text-sm text-espresso-charcoal block">
                  Wealth & Debt (20%+)
                </span>
                <span className="text-[11px] text-espresso-muted">
                  Band: 17% – 25%+ (Higher celebrated)
                </span>
              </div>
              <Badge variant={savingsEval.badgeVariant} size="sm">
                {actuals50_30_20.savingsPercent}% ({savingsEval.label})
              </Badge>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-espresso-muted font-medium">Actual Funded:</span>
              <span className="font-serif font-bold text-sage-muted text-sm">
                {formatINR(actuals50_30_20.savingsSpent)}{' '}
                <span className="font-normal text-xs text-espresso-light">
                  / {formatINR(allocatedSavings)} planned
                </span>
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="h-2.5 w-full bg-silver-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-sage-muted"
                style={{ width: `${Math.min(100, actuals50_30_20.savingsPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-espresso-light">
              <span>Remaining to Fund: {formatINR(Math.max(0, allocatedSavings - actuals50_30_20.savingsSpent))}</span>
              <span>Target: {formatINR(split50_30_20.savings.targetAmount)} (20%)</span>
            </div>

            <p className="text-[11px] text-espresso-charcoal/80 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-silver-soft/80">
              💡 <span className="font-medium text-espresso-charcoal">{savingsEval.reassurance}</span> {split50_30_20.savings.description}.
            </p>
          </div>
        </div>
      </div>

      {/* Category Budget Table with Inline Editing and Locks */}
      <Card className="p-6">
        <CardHeader
          title="Active Category Envelopes"
          subtitle="Click on any planned rupee amount to adjust envelope limits. Protect obligations like Rent and EMI with locks."
          action={
            <div className="flex items-center gap-3">
              <span className="text-xs text-espresso-muted hidden sm:inline">
                {categories.filter((c) => c.isLocked).length} Locked
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddEntryOpen(true)}
                icon={<PlusCircle className="w-3.5 h-3.5 text-gold-dark" />}
              >
                + Add Entry
              </Button>
            </div>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Category Envelopes Table">
              <thead>
                <tr className="border-b border-silver-soft text-espresso-muted uppercase tracking-wider text-[10px]">
                  <th scope="col" className="pb-3 font-semibold">Envelope Category</th>
                  <th scope="col" className="pb-3 font-semibold">Pillar</th>
                  <th scope="col" className="pb-3 font-semibold text-right">Planned Budget (₹)</th>
                  <th scope="col" className="pb-3 font-semibold text-right">Actual Spent (₹)</th>
                  <th scope="col" className="pb-3 font-semibold text-right">Remaining (₹)</th>
                  <th scope="col" className="pb-3 font-semibold pl-4">Utilization</th>
                  <th scope="col" className="pb-3 font-semibold text-center">Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver-soft/60">
                {categories.map((cat) => {
                  const actualSpent = calculateCategoryActualSpent(cat.name, transactions);
                  const remaining = cat.allocatedAmount - actualSpent;
                  const isOver = remaining < 0;
                  const percent = cat.allocatedAmount > 0
                    ? Math.min(100, Math.round((actualSpent / cat.allocatedAmount) * 100))
                    : 0;
                  const rawPercent = cat.allocatedAmount > 0
                    ? Math.round((actualSpent / cat.allocatedAmount) * 100)
                    : 0;

                  return (
                    <tr key={cat.id} className="hover:bg-cream-100/50 transition-colors">
                      <td className="py-3.5 font-semibold text-espresso-charcoal flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          cat.type === 'savings'
                            ? 'bg-sage-soft text-sage-muted'
                            : cat.type === 'want'
                            ? 'bg-blush-100 text-blush-deep'
                            : 'bg-silver-soft text-espresso-muted'
                        }`}>
                          {cat.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-serif font-bold text-espresso-charcoal">
                        {editingId === cat.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={tempAmount}
                              onChange={(e) => setTempAmount(e.target.value)}
                              className="w-24 px-2 py-1 text-xs border border-gold-champagne rounded bg-white text-espresso-charcoal font-serif font-bold"
                              autoFocus
                              aria-label={`Edit ${cat.name} budget amount`}
                            />
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              className="px-2.5 py-1 bg-gold-champagne text-espresso-deep rounded-md text-[10px] font-bold shadow-xs hover:bg-gold-hover transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(cat.id, cat.allocatedAmount)}
                            title="Click to edit planned amount"
                            className="hover:underline hover:text-gold-dark cursor-pointer font-serif text-sm transition-colors"
                            aria-label={`Edit ${cat.name} budget currently ${formatINR(cat.allocatedAmount)}`}
                          >
                            {formatINR(cat.allocatedAmount)}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 text-right font-serif text-espresso-muted font-medium">
                        {formatINR(actualSpent)}
                      </td>
                      <td className={`py-3.5 text-right font-serif font-bold ${isOver ? 'text-expense-muted' : 'text-sage-muted'}`}>
                        {formatINR(remaining)}
                      </td>
                      <td className="py-3.5 pl-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-silver-soft rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: isOver ? '#BA5A5A' : cat.color,
                              }}
                            />
                          </div>
                          <span className={`text-[10px] w-9 text-right font-medium ${isOver ? 'text-expense-muted font-bold' : 'text-espresso-muted'}`}>
                            {rawPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => toggleCategoryLock(cat.id)}
                          title={cat.isLocked ? 'Protected from automated optimization' : 'Unlocked (optimizer can adjust)'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            cat.isLocked
                              ? 'bg-gold-light/60 text-gold-dark border-gold-champagne/40 shadow-xs'
                              : 'bg-white text-espresso-light border-silver-soft hover:text-espresso-charcoal'
                          }`}
                          aria-label={cat.isLocked ? `Unlock ${cat.name}` : `Lock ${cat.name}`}
                        >
                          {cat.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Modal for Instant Reactive Budget Updates */}
      <AddTransactionModal
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
      />
    </div>
  );
};
