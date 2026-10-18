import React, { useState } from 'react';
import { useFinance, SavingsGoal } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { StickyNote } from '../components/ui/StickyNote';
import {
  Target,
  PlusCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Trash2,
  PiggyBank,
  Sparkles,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('5000');

  // Form states for adding goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [category, setCategory] = useState('Wealth');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalMonthlyNeeded = goals.reduce((s, g) => s + g.monthlyContributionRequired, 0);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(currentAmount) || 0;
    if (!title || isNaN(target) || target <= 0) return;

    // Calculate required monthly contribution
    const dTarget = new Date(targetDate);
    const dNow = new Date();
    const months = Math.max(1, (dTarget.getFullYear() - dNow.getFullYear()) * 12 + (dTarget.getMonth() - dNow.getMonth()));
    const shortfall = Math.max(0, target - initial);
    const monthlyNeeded = Math.round(shortfall / months);

    addGoal({
      title,
      targetAmount: target,
      currentAmount: initial,
      targetDate,
      category,
      monthlyContributionRequired: monthlyNeeded,
      color: '#C5A15B',
      priority,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setIsAddOpen(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contributeAmount);
    if (contributeGoalId && !isNaN(amt) && amt > 0) {
      updateGoalProgress(contributeGoalId, amt);
    }
    setContributeGoalId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Wealth Acceleration
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">{goals.length} Active Targets</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Target Savings & Sinking Funds
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Track tangible financial milestones. WealthWise calculates required monthly contributions
            and alerts you when timelines risk feasibility.
          </p>
        </div>

        <Button
          variant="blush"
          size="md"
          onClick={() => setIsAddOpen(true)}
          icon={<PlusCircle className="w-4 h-4" />}
          className="shadow-soft hover:shadow-md"
        >
          Create Savings Goal
        </Button>
      </div>

      {/* Aggregate Goal Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Goal Progress Summary">
        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-blush-accent/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Total Capital Accumulated</span>
          <div className="text-2xl font-serif font-bold text-blush-deep mt-1">
            {formatINR(totalSaved)}
          </div>
          <span className="text-xs text-espresso-light mt-0.5 block">
            Across all {goals.length} active goals
          </span>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-gold-dark/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Aggregate Target Goal</span>
          <div className="text-2xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(totalTarget)}
          </div>
          <span className="text-xs text-sage-muted font-semibold mt-0.5 block">
            {Math.round((totalSaved / (totalTarget || 1)) * 100)}% overall completion
          </span>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-gold-dark/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Monthly Required Run-Rate</span>
          <div className="text-2xl font-serif font-bold text-gold-dark mt-1">
            {formatINR(totalMonthlyNeeded)}/mo
          </div>
          <span className="text-xs text-espresso-light mt-0.5 block">
            Integrated into optimizer engine
          </span>
        </Card>
      </div>

      {/* Goal Compounding Accelerator Banner */}
      <Card className="p-5 bg-gradient-to-r from-cream-100 via-blush-soft/25 to-cream-50 border border-gold-dark/25 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blush-soft flex items-center justify-center border border-blush-accent/30 text-blush-deep shrink-0">
              <Sparkles className="w-5 h-5 text-blush-deep" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-espresso-charcoal text-base">
                Yield Accelerator on Active Reserves
              </h4>
              <p className="text-xs text-espresso-muted mt-0.5">
                Your accumulated <strong>{formatINR(totalSaved)}</strong> parked in 7.2% liquid funds earns approx.{' '}
                <strong className="text-blush-deep">{formatINR(Math.round(totalSaved * 0.072))}/year</strong> in passive yield, accelerating milestone dates by up to 2.4 months.
              </p>
            </div>
          </div>
          <Badge variant="blush" size="md" className="shrink-0">
            Passive Accrual Active
          </Badge>
        </div>
      </Card>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-label="Active Goals List">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <Card key={goal.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-silver-soft">
                  <Badge variant={goal.priority === 'high' ? 'gold' : goal.priority === 'medium' ? 'blush' : 'silver'}>
                    {goal.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete goal "${goal.title}"?`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="p-1 rounded text-espresso-light hover:text-expense-muted transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-serif font-bold text-lg text-espresso-charcoal mt-4 mb-1">
                  {goal.title}
                </h3>
                <span className="text-xs text-espresso-light block mb-4">
                  Target Date: {formatDate(goal.targetDate)}
                </span>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-espresso-charcoal">
                      {formatINR(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-espresso-muted">
                      of {formatINR(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-silver-soft rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-espresso-muted pt-1">
                    <span>{percent}% achieved</span>
                    <span>{formatINR(remaining)} to go</span>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-cream-100 border border-silver-soft text-xs text-espresso-charcoal flex items-center justify-between">
                  <span className="text-espresso-muted">Monthly contribution needed:</span>
                  <strong className="font-serif font-bold text-gold-dark">
                    {formatINR(goal.monthlyContributionRequired)}/mo
                  </strong>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-silver-soft flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContributeGoalId(goal.id)}
                  className="w-full text-xs"
                  icon={<PiggyBank className="w-3.5 h-3.5" />}
                >
                  Deposit Funds
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Sinking Fund / Savings Goal"
        description="Establish a clear milestone with a target date and target amount."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Higher Education or Home Interior"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Target Amount (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Already Saved (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              >
                <option value="high">High (Essential)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (Aspirational)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-silver-soft">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={!!contributeGoalId}
        onClose={() => setContributeGoalId(null)}
        title="Deposit Towards Goal"
        description="Add funds to simulate progress towards your milestone."
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Deposit Amount (₹ INR)
            </label>
            <input
              type="number"
              required
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setContributeGoalId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
