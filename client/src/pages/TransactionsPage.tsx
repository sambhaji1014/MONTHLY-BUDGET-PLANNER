import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AddTransactionModal } from '../components/modals/AddTransactionModal';
import {
  Search,
  Filter,
  PlusCircle,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
  Download,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, deleteTransaction, categories } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.tags && tx.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalFilteredAmount = filtered.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
  }, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Ledger Management
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">{transactions.length} Total Records</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Financial Transactions
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Real-time ledger entries categorized by essential needs, discretionary wants, and wealth allocations.
          </p>
        </div>

        <Button
          variant="blush"
          size="md"
          onClick={() => setIsAddOpen(true)}
          icon={<PlusCircle className="w-4 h-4" />}
          className="shadow-soft hover:shadow-md"
        >
          Add New Entry
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-silver-soft flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, merchant, notes or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-pearl-50 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedType === t
                  ? 'bg-espresso-charcoal text-white shadow-xs'
                  : 'bg-silver-soft text-espresso-muted hover:text-espresso-charcoal'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 bg-pearl-50 border border-silver-border rounded-xl text-xs text-espresso-charcoal focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs text-espresso-muted px-1">
        <span>Showing {filtered.length} entries</span>
        <span>
          Net Filtered Cashflow:{' '}
          <strong className={`font-serif text-sm ${totalFilteredAmount >= 0 ? 'text-sage-muted' : 'text-expense-muted'}`}>
            {totalFilteredAmount >= 0 ? `+${formatINR(totalFilteredAmount)}` : formatINR(totalFilteredAmount)}
          </strong>
        </span>
      </div>

      {/* Table */}
      <Card className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ReceiptText className="w-12 h-12 text-espresso-light mx-auto mb-3 opacity-40" />
            <h3 className="font-serif font-bold text-base text-espresso-charcoal">
              No transactions found
            </h3>
            <p className="text-xs text-espresso-muted mt-1 max-w-sm mx-auto">
              No ledger entries match your filter criteria. Try clearing your search or add a new entry.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-silver-soft text-espresso-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Transaction / Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Pillar</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold text-right">Amount (₹)</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver-soft/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="py-3.5 font-medium text-espresso-charcoal flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'income' 
                            ? 'bg-sage-soft text-sage-muted' 
                            : tx.categoryType === 'want'
                              ? 'bg-blush-soft text-blush-deep'
                              : 'bg-expense-soft text-expense-muted'
                        }`}
                      >
                        {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-espresso-charcoal">{tx.title}</div>
                        {tx.notes && <div className="text-[10px] text-espresso-light truncate max-w-xs">{tx.notes}</div>}
                      </div>
                    </td>
                    <td className="py-3.5 text-espresso-muted">
                      <span className="px-2 py-0.5 rounded-md bg-silver-soft text-[11px] font-medium text-espresso-charcoal">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={tx.categoryType === 'want' ? 'blush' : tx.categoryType === 'savings' ? 'gold' : tx.categoryType === 'need' ? 'sage' : 'silver'}
                        size="sm"
                      >
                        {tx.categoryType}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-espresso-light">{formatDate(tx.date)}</td>
                    <td className="py-3.5 text-espresso-muted">{tx.paymentMethod}</td>
                    <td className={`py-3.5 text-right font-serif font-bold text-sm ${
                      tx.type === 'income' ? 'text-sage-muted' : 'text-espresso-charcoal'
                    }`}>
                      {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Delete entry"
                        className="p-1 rounded text-espresso-light hover:text-expense-muted hover:bg-expense-soft transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddTransactionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
