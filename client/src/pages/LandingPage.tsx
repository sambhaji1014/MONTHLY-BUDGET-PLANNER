import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StickyNote } from '../components/ui/StickyNote';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Target,
  CheckCircle2,
  Lock,
  Compass,
  Zap,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pearl-100 text-espresso-charcoal selection:bg-blush-100 selection:text-espresso-charcoal">
      {/* Top Luxury Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gold-champagne/50 shadow-sm flex items-center justify-center font-serif font-bold text-gold-champagne text-xl">
            W
          </div>
          <div>
            <span className="font-serif font-bold text-2xl tracking-tight text-espresso-charcoal">
              WealthWise
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest text-gold-dark px-2 py-0.5 rounded-full bg-gold-light/40 border border-gold-champagne/30">
              Smart Optimizer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-xs font-semibold"
          >
            Sign In
          </Button>
          <Button
            variant="blush"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold shadow-soft hover:shadow-md"
          >
            Launch Journal
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-gold-champagne/30 text-xs text-gold-dark font-medium mb-6 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
          <span>Intelligent Mathematical Financial Engineering in INR (₹)</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-espresso-charcoal leading-[1.1] tracking-tight mb-6">
          Plan Today. <br />
          <span className="italic font-normal text-gold-dark font-serif">
            Brighter Tomorrows.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-espresso-muted leading-relaxed font-normal mb-10">
          WealthWise pairs the tactile beauty of a luxury financial journal with a constraint-satisfying 
          budget optimization engine. Eliminate guesswork, align with realistic spending limits, and compound your wealth with certainty.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="blush"
            size="lg"
            onClick={() => navigate('/dashboard')}
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-soft hover:shadow-md"
          >
            Build My Budget
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto border-silver-border"
          >
            Explore Features
          </Button>
        </div>

        {/* Live Interactive Dashboard Preview Card */}
        <div className="mt-16 p-4 sm:p-7 rounded-3xl bg-white border border-silver-brushed/60 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-pale/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          {/* Header of Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-silver-soft gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="gold">October 2026 Plan</Badge>
                <Badge variant="sage">Health: 88/100 (Exceptional)</Badge>
              </div>
              <h2 className="font-serif text-2xl font-bold text-espresso-charcoal mt-2">
                Executive Portfolio & Cashflow Snapshot
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="blush"
                size="sm"
                onClick={() => navigate('/optimizer')}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Test Optimizer
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-pearl-50 border border-silver-soft">
              <span className="text-xs text-espresso-muted font-medium">Net Monthly Income</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-espresso-charcoal mt-1">
                {formatINR(120000)}
              </div>
              <span className="text-[11px] text-sage-muted font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Salary verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pearl-50 border border-silver-soft">
              <span className="text-xs text-espresso-muted font-medium">Allocated Budget</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-espresso-charcoal mt-1">
                {formatINR(118000)}
              </div>
              <span className="text-[11px] text-espresso-light font-medium mt-1 block">
                98.3% allocated
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pearl-50 border border-silver-soft">
              <span className="text-xs text-espresso-muted font-medium">Monthly Savings Rate</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-sage-muted mt-1">
                26.7%
              </div>
              <span className="text-[11px] text-sage-muted font-semibold mt-1 block">
                +6.7% over 50/30/20 target
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pearl-50 border border-silver-soft">
              <span className="text-xs text-espresso-muted font-medium">Safe Daily Spend</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-gold-dark mt-1">
                {formatINR(1420)}/day
              </div>
              <span className="text-[11px] text-espresso-light font-medium mt-1 block">
                Discretionary ceiling
              </span>
            </div>
          </div>

          {/* Sticky Notes Inside Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <StickyNote
              variant="pink"
              tag="Smart Insight"
              title="Optimizer Detected ₹4,200 Surplus"
              action={{
                label: 'View Optimized Budget',
                onClick: () => navigate('/optimizer'),
              }}
            >
              Your dining out expenses have plateaued at ₹8,400. Re-routing ₹3,500 to your 
              <strong> Kyoto Vacation Goal</strong> shortens your target timeline by 45 days.
            </StickyNote>

            <StickyNote
              variant="lavender"
              tag="Upcoming Due Date"
              title="Bescom Electricity Bill: ₹2,350"
              action={{
                label: 'Manage Subscriptions',
                onClick: () => navigate('/bills'),
              }}
            >
              Scheduled auto-payment on October 24. Sufficient cash flow cushion detected with zero risk of overdraft.
            </StickyNote>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-cream-100 border-y border-silver-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Architected for Precision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-charcoal mt-2">
              Features Designed for Real Financial Clarity
            </h2>
            <p className="text-sm text-espresso-muted mt-3">
              No generic charts or vague suggestions. Real financial calculations, constraint satisfaction, and explainable models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-2xl border border-silver-soft shadow-xs hover:border-gold-champagne/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gold-light/50 border border-gold-champagne/30 flex items-center justify-center text-gold-champagne mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-espresso-charcoal mb-2">
                Smart Budget Optimizer
              </h3>
              <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed">
                Reallocates your monthly income mathematically using 50/30/20 guidelines and user locks. Never invents money or causes deficits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-2xl border border-silver-soft shadow-xs hover:border-gold-champagne/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sage-soft border border-sage-border flex items-center justify-center text-sage-muted mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-espresso-charcoal mb-2">
                Month-End Forecasting
              </h3>
              <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed">
                Projects your exact month-end closing cash balance by accounting for scheduled bills, remaining pay cycles, and daily spending velocity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-2xl border border-silver-soft shadow-xs hover:border-gold-champagne/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blush-100 border border-blush-rose/30 flex items-center justify-center text-blush-dark mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-espresso-charcoal mb-2">
                Target Savings Sinking Funds
              </h3>
              <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed">
                Calculates required monthly contributions for emergencies, travel, or home down payments with automatic timeline feasibility warnings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-2xl border border-silver-soft shadow-xs hover:border-gold-champagne/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-lavender-soft border border-lavender-border flex items-center justify-center text-[#6B4F8B] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-espresso-charcoal mb-2">
                What-If Decision Simulator
              </h3>
              <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed">
                Test big purchases or new EMIs before swiping your card. View instant simulated health scores and risk indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
            Effortless Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-charcoal mt-2">
            How WealthWise Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-white border border-silver-soft">
            <div className="w-10 h-10 mx-auto rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-espresso-charcoal mb-4">
              1
            </div>
            <h3 className="font-serif font-bold text-base text-espresso-charcoal mb-2">
              Capture Income & Baseline
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Input your monthly net income and ongoing obligations. The system tags essential needs and discretionary wants.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-silver-soft">
            <div className="w-10 h-10 mx-auto rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-espresso-charcoal mb-4">
              2
            </div>
            <h3 className="font-serif font-bold text-base text-espresso-charcoal mb-2">
              Execute Smart Optimization
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Choose your strategy (Balanced, Aggressive Savings, Debt Paydown). The engine reallocates surplus without touching locked categories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-silver-soft">
            <div className="w-10 h-10 mx-auto rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-espresso-charcoal mb-4">
              3
            </div>
            <h3 className="font-serif font-bold text-base text-espresso-charcoal mb-2">
              Track & Compound
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Log transactions with one click, follow blush-pink sticky note insights, and hit your target savings milestones month after month.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowRight className="w-4 h-4" />}
            className="shadow-gold-glow"
          >
            Launch WealthWise Today
          </Button>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="border-t border-silver-soft bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-espresso-muted">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pearl-100 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-gold-champagne text-base">
              W
            </div>
            <div>
              <span className="font-serif font-bold text-base text-espresso-charcoal block">
                WealthWise
              </span>
              <span className="text-[11px] text-espresso-light">
                Smart Monthly Budget Optimizer · INR (₹)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-espresso-charcoal hover:underline">
              Dashboard
            </button>
            <button onClick={() => navigate('/optimizer')} className="hover:text-espresso-charcoal hover:underline">
              Smart Optimizer
            </button>
            <button onClick={() => navigate('/budget-planner')} className="hover:text-espresso-charcoal hover:underline">
              Budget Planner
            </button>
            <button onClick={() => navigate('/reports')} className="hover:text-espresso-charcoal hover:underline">
              Export Reports
            </button>
          </div>

          <div className="text-[11px] text-espresso-light">
            © 2026 WealthWise. All financial data calculated locally. Private & Secure.
          </div>
        </div>
      </footer>
    </div>
  );
};
