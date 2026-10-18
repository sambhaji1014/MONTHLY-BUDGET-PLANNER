import React, { useState } from 'react';
import { useFinance, BillSubscription } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  Clock,
  Trash2,
  CreditCard,
  Zap,
} from 'lucide-react';

export const BillsPage: React.FC = () => {
  const { bills, toggleBillPaid, addBill, deleteBill } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'paid'>('all');

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Utilities');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isAutoDebit, setIsAutoDebit] = useState(false);

  const filteredBills = bills.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const totalUpcoming = bills
    .filter((b) => b.status === 'upcoming')
    .reduce((s, b) => s + b.amount, 0);

  const totalMonthlyCommitment = bills
    .filter((b) => b.billingCycle === 'monthly')
    .reduce((s, b) => s + b.amount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!name || isNaN(parsed) || parsed <= 0) return;

    addBill({
      name,
      amount: parsed,
      billingCycle,
      dueDate,
      category,
      paymentMethod,
      isAutoDebit,
    });

    setName('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Cashflow Schedules
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">{bills.length} Tracked Commitments</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Bills & Subscriptions Calendar
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Track fixed commitments and renewals. WealthWise schedules cash deductions without double-counting paid bills.
          </p>
        </div>

        <Button
          variant="blush"
          size="md"
          onClick={() => setIsAddOpen(true)}
          icon={<PlusCircle className="w-4 h-4" />}
          className="shadow-soft hover:shadow-md"
        >
          Add Recurring Bill
        </Button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Commitment Summary">
        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-blush-accent/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Pending October Commitments</span>
          <div className="text-2xl font-serif font-bold text-blush-deep mt-1">
            {formatINR(totalUpcoming)}
          </div>
          <span className="text-xs text-espresso-light mt-0.5 block">
            {bills.filter((b) => b.status === 'upcoming').length} bills to be settled
          </span>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-gold-dark/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Fixed Monthly Run-Rate</span>
          <div className="text-2xl font-serif font-bold text-espresso-charcoal mt-1">
            {formatINR(totalMonthlyCommitment)}/mo
          </div>
          <span className="text-xs text-espresso-light mt-0.5 block">
            Baseline recurring commitments
          </span>
        </Card>

        <Card className="p-4 bg-white border border-silver-soft/80 hover:border-sage-muted/40 transition-all">
          <span className="text-xs text-espresso-muted font-medium">Auto-Debit Safeguards</span>
          <div className="text-2xl font-serif font-bold text-sage-muted mt-1">
            {bills.filter((b) => b.isAutoDebit).length} Active
          </div>
          <span className="text-xs text-espresso-light mt-0.5 block">
            Verified with cashflow buffers
          </span>
        </Card>
      </div>

      {/* Subscription Optimization Banner */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-cream-100 via-blush-soft/25 to-cream-50 border border-gold-dark/25 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blush-soft flex items-center justify-center border border-blush-accent/30 text-blush-deep shrink-0">
              <Zap className="w-4 h-4 text-blush-deep" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-espresso-charcoal text-sm">
                Subscription Leakage & Consolidation Scan
              </h4>
              <p className="text-xs text-espresso-muted mt-0.5">
                Switching quarterly/annual cycles on verified OTT and SaaS commitments generates 
                <strong className="text-blush-deep"> ~₹6,400/year</strong> in upfront discounted savings for your investment corpus.
              </p>
            </div>
          </div>
          <Badge variant="blush" size="sm" className="shrink-0">
            Audit Insight
          </Badge>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2" role="tablist" aria-label="Bill filter tabs">
        {(['all', 'upcoming', 'paid'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === t
                ? 'bg-espresso-charcoal text-white shadow-xs'
                : 'bg-silver-soft text-espresso-muted hover:text-espresso-charcoal'
            }`}
          >
            {t} ({bills.filter((b) => t === 'all' || b.status === t).length})
          </button>
        ))}
      </div>

      {/* Bills Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-silver-soft text-espresso-muted uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Service / Obligation</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Frequency</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Auto-Debit</th>
                <th className="pb-3 font-semibold text-right">Amount (₹)</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-soft/60">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-cream-100/50 transition-colors">
                  <td className="py-3.5 font-semibold text-espresso-charcoal">
                    {bill.name}
                  </td>
                  <td className="py-3.5 text-espresso-muted">
                    <span className="px-2 py-0.5 rounded bg-silver-soft text-[11px]">
                      {bill.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-espresso-muted capitalize">{bill.billingCycle}</td>
                  <td className="py-3.5 text-espresso-light">{formatDate(bill.dueDate)}</td>
                  <td className="py-3.5">
                    {bill.isAutoDebit ? (
                      <span className="text-sage-muted font-semibold flex items-center gap-1 text-[11px]">
                        <Zap className="w-3 h-3" /> Auto
                      </span>
                    ) : (
                      <span className="text-espresso-light text-[11px]">Manual</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-serif font-bold text-sm text-espresso-charcoal">
                    {formatINR(bill.amount)}
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className="cursor-pointer"
                    >
                      <Badge variant={bill.status === 'paid' ? 'sage' : 'red'}>
                        {bill.status === 'paid' ? 'Settled' : 'Due'}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete subscription "${bill.name}"?`)) {
                          deleteBill(bill.id);
                        }
                      }}
                      className="p-1 rounded text-espresso-light hover:text-expense-muted transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Bill Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Recurring Bill or Subscription"
        description="Schedule a recurring expense so it is automatically factored into your cashflow forecast."
      >
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Bill / Subscription Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Health Insurance or Gym Membership"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAutoDebit"
              checked={isAutoDebit}
              onChange={(e) => setIsAutoDebit(e.target.checked)}
              className="w-4 h-4 rounded text-gold-champagne focus:ring-gold-champagne/40"
            />
            <label htmlFor="isAutoDebit" className="text-xs text-espresso-muted cursor-pointer">
              Auto-debit enabled on credit card / bank
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-silver-soft">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Bill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
