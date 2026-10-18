import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  Wallet,
  User,
  Bell,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    monthlyIncome,
    setMonthlyIncome,
    userProfile,
    setUserProfile,
    dashboardMode,
    setDashboardMode,
    resetAllData,
    loadDemoData,
  } = useFinance();

  const [incomeInput, setIncomeInput] = useState(monthlyIncome ? monthlyIncome.toString() : '65000');
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(incomeInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyIncome(val);
    }

    setUserProfile((prev) => ({
      ...prev,
      name: name.trim() || 'Friend',
      email: email.trim(),
      monthlyIncome: !isNaN(val) && val > 0 ? val : prev.monthlyIncome,
    }));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-silver-soft/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
            Preferences & Settings
          </span>
          <span className="text-silver-brushed">•</span>
          <span className="text-xs text-espresso-light">Personal Profile & Privacy</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
          Manage your personal details, baseline monthly income, interface mode, and local data.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-sage-soft text-sage-muted border border-sage-border rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Profile and settings updated successfully!
        </div>
      )}

      {/* Mode Switcher Preference */}
      <Card className="p-6">
        <CardHeader
          title="Dashboard View Mode"
          subtitle="Choose how detailed you want your budget dashboard to be"
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div
              onClick={() => setDashboardMode('beginner')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                dashboardMode === 'beginner'
                  ? 'bg-cream-200 border-gold-champagne shadow-xs'
                  : 'bg-white border-silver-soft hover:border-gold-champagne/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-sm text-espresso-charcoal">
                  🌱 Simple Mode
                </span>
                {dashboardMode === 'beginner' && (
                  <Badge variant="gold" size="sm">Active</Badge>
                )}
              </div>
              <p className="text-xs text-espresso-muted leading-relaxed">
                Clean, non-intimidating views with simple language (Income, Spending, Savings) and easy-to-read charts.
              </p>
            </div>

            <div
              onClick={() => setDashboardMode('advanced')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                dashboardMode === 'advanced'
                  ? 'bg-cream-200 border-gold-champagne shadow-xs'
                  : 'bg-white border-silver-soft hover:border-gold-champagne/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif font-bold text-sm text-espresso-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-champagne" /> ⚡ Advanced Mode
                </span>
                {dashboardMode === 'advanced' && (
                  <Badge variant="gold" size="sm">Active</Badge>
                )}
              </div>
              <p className="text-xs text-espresso-muted leading-relaxed">
                Detailed financial engineering tools: Smart budget optimization, What-If decision simulator, and forecast trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile & Monthly Income Form */}
      <Card className="p-6">
        <CardHeader
          title="Profile & Income Setup"
          subtitle="Your information is stored privately on your device"
        />
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-espresso-charcoal">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya or Rahul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pearl-50 border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-espresso-charcoal">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pearl-50 border border-silver-border rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-espresso-charcoal">
                Net Monthly Take-Home Income (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-muted font-serif text-base">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-pearl-50 border border-silver-border rounded-xl text-espresso-charcoal text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                />
              </div>
              <span className="text-[11px] text-espresso-light mt-1 block">
                Current monthly baseline: {formatINR(monthlyIncome)}
              </span>
            </div>

            <Button type="submit" variant="blush" size="md" className="shadow-soft hover:shadow-md">
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Member Profile & Stored Identity Details */}
      <Card className="p-6">
        <CardHeader
          title="Member Identity & Database Record"
          subtitle="Stored user record and authentication profile"
        />
        <CardContent className="space-y-3 text-xs text-espresso-charcoal">
          <div className="flex items-center justify-between py-2 border-b border-silver-soft">
            <span className="font-medium">Member Status</span>
            <Badge variant={userProfile?.isNewUser ? 'blush' : 'gold'}>
              {userProfile?.isNewUser ? 'First-Time Sign-In (isNewUser: true)' : 'Returning Member (isNewUser: false)'}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-silver-soft">
            <span className="font-medium">Registered Name</span>
            <span className="font-bold text-espresso-charcoal">{userProfile?.name || 'Sambhaji Jadhav'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-silver-soft">
            <span className="font-medium">Email Address</span>
            <span className="font-mono text-espresso-charcoal">{userProfile?.email || 'sambhaji.jadhav@example.com'}</span>
          </div>
          {userProfile.phone && (
            <div className="flex items-center justify-between py-2 border-b border-silver-soft">
              <span className="font-medium">Contact Phone</span>
              <span className="font-mono text-espresso-charcoal">{userProfile.phone}</span>
            </div>
          )}
          {userProfile.dateOfBirth && (
            <div className="flex items-center justify-between py-2 border-b border-silver-soft">
              <span className="font-medium">Date of Birth (DOB)</span>
              <span className="text-espresso-charcoal">{userProfile.dateOfBirth}</span>
            </div>
          )}
          {userProfile.preferences && (
            <div className="flex items-center justify-between py-2 border-b border-silver-soft">
              <span className="font-medium">Planning Style</span>
              <span className="text-gold-dark font-semibold">
                {userProfile.preferences.riskTolerance.toUpperCase()} • {userProfile.preferences.monthlySavingsTargetPercent}% Savings Target
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency & Formatting */}
      <Card className="p-6">
        <CardHeader
          title="Currency & Regional Standard"
          subtitle="Default Indian Rupee standard format"
        />
        <CardContent className="space-y-3 text-xs text-espresso-charcoal">
          <div className="flex items-center justify-between py-2 border-b border-silver-soft">
            <span className="font-medium">Primary Currency</span>
            <Badge variant="gold">INR — Indian Rupee (₹)</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-silver-soft">
            <span className="font-medium">Number Format</span>
            <span className="text-espresso-muted">Indian Lakhs & Crores (e.g. ₹65,000)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-medium">Privacy Status</span>
            <span className="text-sage-muted font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Client-Side Private Storage
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Data Management & Demo Options */}
      <Card className="p-6">
        <CardHeader
          title="Setup & Data Management"
          subtitle="Re-run the first-visit wizard or reset your stored records"
        />
        <CardContent className="space-y-4">
          <p className="text-xs text-espresso-muted leading-relaxed">
            Want to reconfigure your income, fixed expenses, and savings goals from scratch? Or explore with sample demonstration data?
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUserProfile((prev) => ({ ...prev, isOnboarded: false }));
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Re-run Onboarding Setup
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (window.confirm('Load sample portfolio with demonstration numbers?')) {
                  loadDemoData();
                  setIncomeInput('120000');
                }
              }}
              icon={<Sparkles className="w-4 h-4 text-gold-champagne" />}
            >
              Load Demo Data
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Clear all your local budget data and start fresh?')) {
                  resetAllData();
                  setIncomeInput('65000');
                  setName('');
                  setEmail('');
                }
              }}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Clear All & Start Fresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
