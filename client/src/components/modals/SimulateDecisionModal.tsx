import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import { calculateBudgetHealthScore } from '../../utils/financialCalculations';
import confetti from 'canvas-confetti';
import {
  Calculator,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Tag,
  Undo2,
} from 'lucide-react';

interface SimulateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateDecisionModal: React.FC<SimulateDecisionModalProps> = ({ isOpen, onClose }) => {
  const {
    monthlyIncome,
    totalExpenses,
    savingsRate,
    budgetHealthScore,
    categories,
    addTransaction,
    updateCategoryBudget,
    addBill,
  } = useFinance();

  const [decisionType, setDecisionType] = useState<'one_time_purchase' | 'recurring_emi' | 'lifestyle_cutback'>('one_time_purchase');
  const [amount, setAmount] = useState('25000');
  const [description, setDescription] = useState('New Smartphone Upgrade');
  const [targetCategory, setTargetCategory] = useState(categories[6]?.name || 'Personal Shopping');
  const [isApplied, setIsApplied] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState('');

  const numAmount = parseFloat(amount) || 0;

  // Simulate metrics
  let simulatedExpenses = totalExpenses;
  let simulatedSavingsRate = savingsRate;

  if (decisionType === 'one_time_purchase' || decisionType === 'recurring_emi') {
    simulatedExpenses += numAmount;
  } else {
    simulatedExpenses = Math.max(0, simulatedExpenses - numAmount);
  }

  const simulatedRemaining = monthlyIncome - simulatedExpenses;

  // Approximate simulated health score
  const simulatedNeedsRatio = monthlyIncome > 0 ? Math.round(((simulatedExpenses * 0.55) / monthlyIncome) * 100) : 50;
  const simulatedHealth = calculateBudgetHealthScore({
    savingsRate: decisionType === 'lifestyle_cutback' ? savingsRate + 5 : Math.max(0, savingsRate - 8),
    needsRatio: simulatedNeedsRatio,
    debtToIncomeRatio: decisionType === 'recurring_emi' ? 25 : 15,
    hasEmergencyFund: true,
    overspendingCategoriesCount: simulatedRemaining < 0 ? 3 : 1,
  });

  const isDeficit = simulatedRemaining < 0;
  const impactDelta = simulatedRemaining - (monthlyIncome - totalExpenses);

  // Wealth gain over 1, 3, and 5 years if cutback or invested
  const annualSavingsGain = numAmount * 12;
  const fiveYearSIPValue = Math.round(numAmount * ((Math.pow(1 + 0.12 / 12, 60) - 1) / (0.12 / 12)));

  const handleApplyMove = () => {
    if (numAmount <= 0) return;

    if (decisionType === 'one_time_purchase') {
      const matchedCat = categories.find((c) => c.name.toLowerCase() === targetCategory.toLowerCase()) || categories[0];
      addTransaction({
        title: description || 'Simulated Purchase',
        amount: numAmount,
        type: 'expense',
        category: matchedCat.name,
        categoryType: matchedCat.type,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI / Bank Transfer',
        isRecurring: false,
        notes: 'Applied from Decision Simulator move',
      });
      setAppliedMessage(`Logged ₹${numAmount.toLocaleString('en-IN')} expense into ${matchedCat.name} envelope.`);
    } else if (decisionType === 'recurring_emi') {
      const matchedCat = categories.find((c) => c.name.toLowerCase().includes('emi') || c.type === 'debt') || categories[0];
      addBill({
        name: description || 'Recurring EMI Commit',
        amount: numAmount,
        billingCycle: 'monthly',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        category: matchedCat.name,
        paymentMethod: 'Auto Debit (ECS)',
        isAutoDebit: true,
      });
      setAppliedMessage(`Scheduled ₹${numAmount.toLocaleString('en-IN')}/month recurring commitment in Bills & Obligations.`);
    } else if (decisionType === 'lifestyle_cutback') {
      const matchedCat = categories.find((c) => c.name.toLowerCase() === targetCategory.toLowerCase());
      if (matchedCat) {
        const newBudget = Math.max(0, matchedCat.allocatedAmount - numAmount);
        updateCategoryBudget(matchedCat.id, newBudget);
        setAppliedMessage(`Adjusted ${matchedCat.name} envelope limit down by ₹${numAmount.toLocaleString('en-IN')}, unlocking ₹${(numAmount * 12).toLocaleString('en-IN')} in annual wealth acceleration!`);
      } else {
        setAppliedMessage(`Optimized lifestyle envelope, freeing ₹${numAmount.toLocaleString('en-IN')} for long-term investments.`);
      }
    }

    setIsApplied(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5A15B', '#FAF7F0', '#D99AA6', '#4E775B'],
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setIsApplied(false);
    setAppliedMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Financial Decision Simulator"
      description="Test any financial move before executing it to preview instant impacts on cashflow, savings rate, and portfolio resilience."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Success Feedback Banner when move is applied */}
        {isApplied ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-sage-soft/90 to-pearl-50 border border-sage-border/80 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-white border border-sage-border text-sage-muted flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-espresso-charcoal">
              Move Applied to Active Portfolio!
            </h3>
            <p className="text-xs text-espresso-muted max-w-md mx-auto leading-relaxed">
              {appliedMessage}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleReset} icon={<Undo2 className="w-3.5 h-3.5" />}>
                Simulate Another Move
              </Button>
              <Button variant="primary" size="sm" onClick={onClose} className="shadow-gold-glow">
                View Updated Dashboard →
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Decision Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-silver-soft rounded-xl border border-silver-border">
              <button
                type="button"
                onClick={() => {
                  setDecisionType('one_time_purchase');
                  setDescription('Luxury Gadget / Shopping');
                  setAmount('25000');
                  setTargetCategory(categories.find((c) => c.type === 'want')?.name || 'Personal Shopping');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  decisionType === 'one_time_purchase'
                    ? 'bg-pearl-50 text-espresso-charcoal shadow-sm'
                    : 'text-espresso-muted hover:text-espresso-charcoal'
                }`}
              >
                One-Time Purchase
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionType('recurring_emi');
                  setDescription('New Vehicle / Loan EMI');
                  setAmount('8500');
                  setTargetCategory(categories.find((c) => c.type === 'debt')?.name || 'Loan & EMI');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  decisionType === 'recurring_emi'
                    ? 'bg-pearl-50 text-espresso-charcoal shadow-sm'
                    : 'text-espresso-muted hover:text-espresso-charcoal'
                }`}
              >
                Recurring Monthly EMI
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionType('lifestyle_cutback');
                  setDescription('Subscription & Dining Audit');
                  setAmount('4500');
                  setTargetCategory(categories.find((c) => c.name.toLowerCase().includes('dining'))?.name || 'Dining Out');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  decisionType === 'lifestyle_cutback'
                    ? 'bg-pearl-50 text-espresso-charcoal shadow-sm'
                    : 'text-espresso-muted hover:text-espresso-charcoal'
                }`}
              >
                Expense Cutback
              </button>
            </div>

            {/* Inputs: Title, Amount & Target Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flight tickets"
                  className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
                  Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-muted font-serif text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-espresso-muted" /> Envelope
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} ({cat.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Simulation Comparison Preview */}
            <div className="p-5 rounded-2xl bg-cream-100 border border-silver-brushed/60">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-silver-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-espresso-muted flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-gold-champagne" />
                  Live Simulated Outcome
                </span>
                <Badge variant={isDeficit ? 'red' : decisionType === 'lifestyle_cutback' ? 'sage' : 'blush'}>
                  {isDeficit ? 'Deficit Warning' : decisionType === 'lifestyle_cutback' ? 'Positive Wealth Gain' : 'Feasible'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white/80 rounded-xl border border-silver-soft">
                  <div className="text-[11px] text-espresso-muted font-medium">Available Cash</div>
                  <div className={`text-base font-serif font-bold mt-1 ${isDeficit ? 'text-expense-muted' : 'text-espresso-charcoal'}`}>
                    {formatINR(simulatedRemaining)}
                  </div>
                  <div className="text-[10px] text-espresso-light mt-0.5">
                    Current: {formatINR(monthlyIncome - totalExpenses)}
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-silver-soft">
                  <div className="text-[11px] text-espresso-muted font-medium">Monthly Delta</div>
                  <div className={`text-base font-serif font-bold mt-1 ${impactDelta < 0 ? 'text-expense-muted' : 'text-sage-muted'}`}>
                    {impactDelta > 0 ? `+${formatINR(impactDelta)}` : formatINR(impactDelta)}
                  </div>
                  <div className="text-[10px] text-espresso-light mt-0.5">Cashflow Shift</div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-silver-soft">
                  <div className="text-[11px] text-espresso-muted font-medium">Health Rating</div>
                  <div className="text-base font-serif font-bold mt-1 text-gold-dark">
                    {simulatedHealth.score}/100
                  </div>
                  <div className="text-[10px] text-espresso-light mt-0.5">
                    Was {budgetHealthScore}/100
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-silver-soft">
                  <div className="text-[11px] text-espresso-muted font-medium">Verdict</div>
                  <div className="text-xs font-semibold mt-2 flex items-center justify-center gap-1">
                    {isDeficit ? (
                      <span className="text-expense-muted flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Deficit Risk
                      </span>
                    ) : (
                      <span className="text-sage-muted flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Safe Move
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Prominent Wealth Compounding Highlight for Cutbacks or Healthy Moves */}
              {decisionType === 'lifestyle_cutback' && numAmount > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-pearl-50 via-blush-50/80 to-cream-100 border border-blush-rose/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blush-100 border border-blush-rose/50 flex items-center justify-center text-blush-deep">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blush-deep block">
                        Compound Wealth Multiplier (12% CAGR)
                      </span>
                      <div className="text-xs text-espresso-charcoal">
                        Reinvesting this ₹{numAmount.toLocaleString('en-IN')}/mo yields <strong className="font-serif font-bold text-sm text-gold-dark">₹{fiveYearSIPValue.toLocaleString('en-IN')}</strong> in 5 years!
                      </div>
                    </div>
                  </div>
                  <Badge variant="rose" size="sm">
                    +₹{annualSavingsGain.toLocaleString('en-IN')}/yr
                  </Badge>
                </div>
              )}

              {/* Simulator Advice Box with luxury pink accent */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-blush-50 to-pearl-50 rounded-xl border border-blush-rose/40 text-xs text-espresso-charcoal leading-relaxed flex items-start gap-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-blush-deep flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-blush-deep block mb-0.5">Decision Intelligence Rationale:</strong>
                  {isDeficit
                    ? `Executing this ₹${numAmount.toLocaleString('en-IN')} commitment causes a monthly cash deficit of ₹${Math.abs(simulatedRemaining).toLocaleString('en-IN')}. Consider staggering the payment across two pay periods or rebalancing flexible dining.`
                    : decisionType === 'lifestyle_cutback'
                    ? `Trimming ₹${numAmount.toLocaleString('en-IN')} immediately lifts your monthly savings rate to ${simulatedHealth.score > 80 ? 'Exceptional' : 'Healthy'} territory without impacting essential needs.`
                    : `This ₹${numAmount.toLocaleString('en-IN')} commitment is sustainable and preserves your primary cashflow buffer.`}
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel and the prominent "Apply Move" button */}
            <div className="flex items-center justify-between pt-2 border-t border-silver-soft">
              <Button variant="ghost" onClick={onClose} size="md">
                Cancel
              </Button>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="blush"
                  size="md"
                  onClick={handleApplyMove}
                  disabled={numAmount <= 0}
                  icon={<CheckCircle2 className="w-4 h-4 text-blush-deep" />}
                  className="shadow-sticky-pink"
                >
                  Apply Move
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
