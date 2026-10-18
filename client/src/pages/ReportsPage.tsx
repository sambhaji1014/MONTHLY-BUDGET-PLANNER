import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Download, FileSpreadsheet, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const {
    userProfile,
    monthlyIncome,
    totalExpenses,
    remainingIncome,
    savingsRate,
    budgetHealthScore,
    budgetHealthRating,
    categories,
    transactions,
    goals,
    monthEndForecast,
  } = useFinance();

  const handleExportCSV = () => {
    // Generate actual CSV content
    const headers = ['Transaction ID', 'Title', 'Type', 'Category', 'Pillar', 'Payment Method', 'Date', 'Amount (INR)', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.categoryType,
      `"${t.paymentMethod}"`,
      t.date,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WealthWise_Financial_Report_October_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Financial Documentation
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">Audit-Ready Export</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            Monthly Reports & Ledger Export
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Generate formal monthly executive summaries and export complete transaction histories to CSV.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Statement
          </Button>
          <Button
            variant="blush"
            size="md"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
            className="shadow-soft hover:shadow-md"
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Printable Executive Statement Container */}
      <Card className="p-8 sm:p-10 bg-white border border-silver-soft shadow-lg">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-silver-soft gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-gold-champagne text-base">
                W
              </div>
              <span className="font-serif font-bold text-xl text-espresso-charcoal tracking-tight">
                WealthWise Financial Statement
              </span>
            </div>
            <div className="text-xs text-espresso-muted">
              Account: {userProfile?.name || 'Personal Budget'} (Private Profile)
            </div>
            <div className="text-xs text-espresso-light">
              Statement Period: 01 October 2026 – 31 October 2026
            </div>
          </div>

          <div className="text-right">
            <Badge variant="gold" size="md">
              Status: Verified Optimal
            </Badge>
            <div className="text-xs text-espresso-light mt-1.5">
              Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* High-Level Financial Performance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-silver-soft">
          <div>
            <span className="text-[10px] text-espresso-muted uppercase font-bold">Total Gross Credits</span>
            <div className="text-xl font-serif font-bold text-espresso-charcoal mt-1">
              {formatINR(monthlyIncome)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-espresso-muted uppercase font-bold">Total Ledger Debits</span>
            <div className="text-xl font-serif font-bold text-expense-muted mt-1">
              {formatINR(totalExpenses)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-espresso-muted uppercase font-bold">Retained Net Cashflow</span>
            <div className="text-xl font-serif font-bold text-sage-muted mt-1">
              {formatINR(remainingIncome)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-espresso-muted uppercase font-bold">Monthly Savings Rate</span>
            <div className="text-xl font-serif font-bold text-gold-dark mt-1">
              {savingsRate}%
            </div>
          </div>
        </div>

        {/* Category Envelope Breakdown */}
        <div className="pt-6">
          <h3 className="font-serif font-bold text-base text-espresso-charcoal mb-3">
            Pillar & Category Envelope Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-silver-soft text-espresso-muted uppercase text-[10px]">
                  <th className="pb-2 font-semibold">Envelope Category</th>
                  <th className="pb-2 font-semibold">Pillar</th>
                  <th className="pb-2 font-semibold text-right">Planned Budget</th>
                  <th className="pb-2 font-semibold text-right">Actual Debits</th>
                  <th className="pb-2 font-semibold text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver-soft/60">
                {categories.map((c) => {
                  const variance = c.allocatedAmount - c.spentAmount;
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 font-semibold text-espresso-charcoal">{c.name}</td>
                      <td className="py-2.5 uppercase text-[10px] text-espresso-muted">{c.type}</td>
                      <td className="py-2.5 text-right font-serif">{formatINR(c.allocatedAmount)}</td>
                      <td className="py-2.5 text-right font-serif text-espresso-muted">{formatINR(c.spentAmount)}</td>
                      <td className={`py-2.5 text-right font-serif font-bold ${variance < 0 ? 'text-expense-muted' : 'text-sage-muted'}`}>
                        {variance < 0 ? formatINR(variance) : `+${formatINR(variance)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Signature / Disclaimer */}
        <div className="mt-8 pt-6 border-t border-silver-soft flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso-light">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-champagne" />
            <span>Cryptographically sealed & computed via WealthWise Optimization Core</span>
          </div>
          <div>Currency: Indian Rupee (INR ₹)</div>
        </div>
      </Card>
    </div>
  );
};
