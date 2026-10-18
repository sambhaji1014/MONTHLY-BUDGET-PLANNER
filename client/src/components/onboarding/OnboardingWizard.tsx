import React, { useState } from 'react';
import { useFinance, OnboardingData } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Home,
  ShoppingBag,
  Target,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { completeOnboarding, userProfile } = useFinance();

  const [step, setStep] = useState(1);

  // Form states initialized with active user profile details
  const [name, setName] = useState(userProfile?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    userProfile?.monthlyIncome && userProfile.monthlyIncome > 0
      ? String(userProfile.monthlyIncome)
      : userProfile?.preferences?.monthlyIncome
      ? String(userProfile.preferences.monthlyIncome)
      : ''
  );

  // Fixed expenses - start empty so new profiles define their own numbers
  const [rent, setRent] = useState('');
  const [utilities, setUtilities] = useState('');
  const [subscriptions, setSubscriptions] = useState('');

  // Variable expenses - start empty for true new user isolation
  const [groceries, setGroceries] = useState('');
  const [travel, setTravel] = useState('');
  const [shopping, setShopping] = useState('');

  // Savings goal
  const [goalTitle, setGoalTitle] = useState('Emergency Safety Fund');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalSaved, setGoalSaved] = useState('');

  // Computed summary
  const numIncome = parseFloat(monthlyIncome) || 0;
  const numFixed = (parseFloat(rent) || 0) + (parseFloat(utilities) || 0) + (parseFloat(subscriptions) || 0);
  const numVariable = (parseFloat(groceries) || 0) + (parseFloat(travel) || 0) + (parseFloat(shopping) || 0);
  const numTotalExpenses = numFixed + numVariable;
  const numRemaining = numIncome - numTotalExpenses;
  const savingsPercent = numIncome > 0 ? Math.round((Math.max(0, numRemaining) / numIncome) * 100) : 0;

  const handleFinish = () => {
    const data: OnboardingData = {
      name: name.trim() || 'Friend',
      monthlyIncome: numIncome,
      fixedExpenses: {
        rent: parseFloat(rent) || 0,
        utilities: parseFloat(utilities) || 0,
        subscriptions: parseFloat(subscriptions) || 0,
      },
      variableExpenses: {
        groceries: parseFloat(groceries) || 0,
        travel: parseFloat(travel) || 0,
        shopping: parseFloat(shopping) || 0,
      },
      savingsGoal: {
        title: goalTitle.trim() || 'Emergency Fund',
        targetAmount: parseFloat(goalTarget) || 100000,
        alreadySaved: parseFloat(goalSaved) || 0,
        targetMonths: 12,
      },
    };

    completeOnboarding(data);

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

    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-deep/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-pearl-50 border border-silver-brushed/60 rounded-3xl p-6 sm:p-10 shadow-2xl relative my-8">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-silver-soft">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-gold-champagne text-sm shadow-xs">
              W
            </div>
            <div>
              <span className="font-serif font-bold text-espresso-charcoal text-base">
                Welcome to WealthWise
              </span>
              <span className="text-xs text-espresso-muted block">
                Quick 2-minute setup · No bank passwords needed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step === s
                    ? 'w-6 bg-gold-champagne'
                    : step > s
                    ? 'w-2 bg-sage-muted'
                    : 'w-2 bg-silver-soft'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Name & Income */}
        {step === 1 && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                Step 1 of 5 · About You
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal mt-1">
                What should we call you, and what is your monthly income?
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-2 leading-relaxed">
                Enter your name and your average monthly take-home salary or earnings in Indian Rupees (₹).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1.5">
                  Your First Name or Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya, Rahul, or Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-silver-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1.5">
                  Monthly Take-Home Income (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso-muted font-serif text-lg font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 65000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-silver-border rounded-xl text-base sm:text-lg font-serif font-bold text-espresso-charcoal focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                  />
                </div>
                <span className="text-[11px] text-espresso-light mt-1 block">
                  Tip: Use the amount deposited into your bank account after taxes.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-silver-soft">
              <div className="flex items-center gap-1.5 text-xs text-espresso-muted">
                <ShieldCheck className="w-4 h-4 text-gold-champagne flex-shrink-0" />
                <span>Isolated profile exclusively for your account</span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                disabled={!numIncome || numIncome <= 0}
                icon={<ArrowRight className="w-4 h-4" />}
                className="shadow-gold-glow"
              >
                Next: Fixed Expenses
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Fixed Expenses */}
        {step === 2 && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                Step 2 of 5 · Essential Commitments
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal mt-1">
                What are your monthly fixed expenses?
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-2 leading-relaxed">
                These are mandatory bills that remain roughly the same each month.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Rent or Home Loan EMI (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 18000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Utilities (Electricity, Broadband, Water) (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3500"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Recurring Subscriptions (Mobile, Netflix, Gym) (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={subscriptions}
                  onChange={(e) => setSubscriptions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-cream-100 rounded-xl text-xs text-espresso-muted flex items-center justify-between">
              <span>Total Fixed Bills:</span>
              <strong className="font-serif font-bold text-espresso-charcoal text-sm">
                {formatINR(numFixed)}
              </strong>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-silver-soft">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
                Next: Variable Expenses
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Variable Expenses */}
        {step === 3 && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                Step 3 of 5 · Flexible Spending
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal mt-1">
                Estimate your flexible day-to-day spending
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-2 leading-relaxed">
                Approximate how much you spend each month on daily living and lifestyle. You can always adjust these later.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Groceries, Dining Out & Food Delivery (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={groceries}
                  onChange={(e) => setGroceries(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Travel, Fuel, Cabs & Daily Commute (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4000"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Shopping, Weekend Outings & Leisure (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={shopping}
                  onChange={(e) => setShopping(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-cream-100 rounded-xl text-xs text-espresso-muted flex items-center justify-between">
              <span>Total Flexible Spending:</span>
              <strong className="font-serif font-bold text-espresso-charcoal text-sm">
                {formatINR(numVariable)}
              </strong>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-silver-soft">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                Next: Savings Goals
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Savings Goals */}
        {step === 4 && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                Step 4 of 5 · Financial Goals
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal mt-1">
                What are you saving towards?
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-2 leading-relaxed">
                Whether it's an emergency safety cushion, a vacation, or a down payment, having a target helps protect your cashflow.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Safety Fund"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-espresso-charcoal mb-1">
                    Already Saved So Far (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={goalSaved}
                    onChange={(e) => setGoalSaved(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blush-50 rounded-xl border border-blush-rose/30 text-xs text-espresso-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blush-rose flex-shrink-0" />
              <span>
                WealthWise will automatically calculate your required monthly contribution and keep you on track.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-silver-soft">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(5)} icon={<ArrowRight className="w-4 h-4" />}>
                View My Budget Summary →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: Personalized Budget Summary */}
        {step === 5 && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage-muted font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Personalized Plan Ready
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal mt-1">
                Here is your customized monthly budget summary
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-1 leading-relaxed">
                Calculated based on your ₹{numIncome.toLocaleString('en-IN')} income and estimated spending.
              </p>
            </div>

            {/* Visual 3-pillar breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-silver-soft text-center">
                <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                  Monthly Income
                </span>
                <div className="text-xl font-serif font-bold text-espresso-charcoal mt-1">
                  {formatINR(numIncome)}
                </div>
                <span className="text-[11px] text-espresso-light mt-0.5 block">100% Total</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-silver-soft text-center">
                <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                  Total Spending
                </span>
                <div className="text-xl font-serif font-bold text-expense-muted mt-1">
                  {formatINR(numTotalExpenses)}
                </div>
                <span className="text-[11px] text-espresso-light mt-0.5 block">
                  {Math.round((numTotalExpenses / (numIncome || 1)) * 100)}% of earnings
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-silver-soft text-center">
                <span className="text-[10px] text-espresso-muted uppercase font-bold block">
                  Monthly Savings Left
                </span>
                <div className={`text-xl font-serif font-bold mt-1 ${numRemaining >= 0 ? 'text-sage-muted' : 'text-expense-muted'}`}>
                  {formatINR(numRemaining)}
                </div>
                <span className="text-[11px] text-sage-muted font-semibold mt-0.5 block">
                  {savingsPercent}% savings rate
                </span>
              </div>
            </div>

            {/* Breakdown Envelope Details */}
            <div className="p-4 rounded-2xl bg-cream-100 border border-silver-soft space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-silver-soft/80">
                <span className="font-semibold text-espresso-charcoal">Fixed Essentials (Rent & Bills)</span>
                <span className="font-serif font-bold">{formatINR(numFixed)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-silver-soft/80">
                <span className="font-semibold text-espresso-charcoal">Flexible Daily Spending (Food & Travel)</span>
                <span className="font-serif font-bold">{formatINR(numVariable)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sage-muted">Available for Sinking Fund / Goals</span>
                <span className="font-serif font-bold text-sage-muted">{formatINR(Math.max(0, numRemaining))}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-silver-soft">
              <Button variant="ghost" size="sm" onClick={() => setStep(4)} icon={<ArrowLeft className="w-4 h-4" />}>
                Adjust Answers
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinish}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="shadow-gold-glow"
              >
                Launch My Personalized Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
