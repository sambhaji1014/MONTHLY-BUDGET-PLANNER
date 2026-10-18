import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { PlusCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, categories } = useFinance();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[1]?.name || 'Groceries & Provisions');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a descriptive title');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    // Auto-detect category type
    let categoryType: 'need' | 'want' | 'savings' | 'debt' = 'want';
    const foundCat = categories.find((c) => c.name.toLowerCase() === category.toLowerCase());
    if (foundCat) {
      categoryType = foundCat.type;
    } else if (type === 'income') {
      categoryType = 'savings';
    }

    addTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: type === 'income' ? 'Income / Salary' : category,
      categoryType,
      date,
      paymentMethod,
      isRecurring,
      note: notes.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: [type, category.toLowerCase().split(' ')[0]],
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Financial Entry"
      description="Record an income or expense transaction to keep your budget calculations accurate."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-expense-soft text-expense-muted border border-expense-border text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Transaction Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-silver-soft rounded-xl border border-silver-border">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-pearl-50 text-expense-muted shadow-sm'
                : 'text-espresso-muted hover:text-espresso-charcoal'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-expense-muted" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-pearl-50 text-sage-muted shadow-sm'
                : 'text-espresso-muted hover:text-espresso-charcoal'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-sage-muted" />
            Income
          </button>
        </div>

        {/* Amount in INR */}
        <div>
          <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
            Amount (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-muted font-serif text-lg">
              ₹
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 3500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal placeholder-espresso-light/60 text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
            />
          </div>
        </div>

        {/* Title / Description */}
        <div>
          <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
            Description / Payee *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Organic Produce & Daily Pantry"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal placeholder-espresso-light/60 text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
          />
        </div>

        {/* Category (for Expense) */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Method & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Auto Debit">Auto Debit / NACH</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
            />
          </div>
        </div>

        {/* Recurring Switch */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded text-gold-champagne focus:ring-gold-champagne/40 border-silver-border"
          />
          <label htmlFor="isRecurring" className="text-xs text-espresso-muted cursor-pointer select-none">
            Mark as monthly recurring obligation
          </label>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-espresso-charcoal uppercase tracking-wider mb-1">
            Notes / Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Invoice #8492 or shared expense split"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-silver-border rounded-xl text-espresso-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-soft">
          <Button type="button" variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            Add {type === 'expense' ? 'Expense' : 'Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
