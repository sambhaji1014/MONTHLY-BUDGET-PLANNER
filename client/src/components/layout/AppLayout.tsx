import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../../context/FinanceContext';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { SimulateDecisionModal } from '../modals/SimulateDecisionModal';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Sparkles,
  TrendingUp,
  Target,
  CalendarDays,
  Bot,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Menu,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Home,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const {
    userProfile,
    dashboardMode,
    setDashboardMode,
    resetAllData,
    signOut,
    monthlyIncome,
    restorationNotice,
    dismissRestorationNotice,
  } = useFinance();

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation items categorized by mode
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Budget Planner', path: '/budget-planner', icon: PieChart },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Bills & Subscriptions', path: '/bills', icon: CalendarDays },
    { name: 'Smart Optimizer', path: '/optimizer', icon: Sparkles, badge: 'Smart', isAdvanced: true },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp, isAdvanced: true },
    { name: 'AI Finance Assistant', path: '/ai-assistant', icon: Bot, isAdvanced: true },
    { name: 'Reports & Export', path: '/reports', icon: FileSpreadsheet, isAdvanced: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getInitials = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') return 'WW';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0]?.slice(0, 2)?.toUpperCase() || 'WW';
  };

  const getRouteMeta = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return { section: 'Executive Journal', title: 'Dashboard', badge: 'Overview' };
      case '/budget-planner':
        return { section: 'Allocations', title: 'Zero-Based Budget Planner', badge: 'Envelopes' };
      case '/transactions':
        return { section: 'Ledger Records', title: 'Transactions Audit', badge: 'INR (₹)' };
      case '/goals':
        return { section: 'Milestones', title: 'Sinking Funds & Goals', badge: 'Compounding' };
      case '/bills':
        return { section: 'Commitments', title: 'Bills & Subscriptions', badge: 'Schedule' };
      case '/optimizer':
        return { section: 'Algorithm Engine', title: 'Smart Budget Optimizer', badge: 'Solver' };
      case '/analytics':
        return { section: 'Financial Health', title: 'Deep Analytics', badge: 'Diagnostic' };
      case '/ai-assistant':
        return { section: 'Private Advisory', title: 'AI Finance Assistant', badge: 'Grounded' };
      case '/reports':
        return { section: 'Compliance & Tax', title: 'Formal Reports & CSV', badge: 'Audit Ready' };
      case '/settings':
        return { section: 'Preferences', title: 'Account Settings', badge: 'System' };
      default:
        return { section: 'Journal', title: 'WealthWise', badge: 'Personal' };
    }
  };

  const currentMeta = getRouteMeta(location.pathname);

  const handleSignOut = () => {
    setUserDropdownOpen(false);
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pearl-100 flex flex-col md:flex-row antialiased text-espresso-charcoal selection:bg-blush-100 selection:text-espresso-charcoal">
      {/* First-time Onboarding Wizard if user is not onboarded yet */}
      {!userProfile.isOnboarded && <OnboardingWizard />}

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-espresso-deep/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Mobile Header with Breadcrumb and Avatar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-silver-soft sticky top-0 z-40">
        <div className="flex items-center gap-2.5" onClick={() => navigate('/dashboard')} role="button">
          <div className="w-8 h-8 rounded-xl bg-pearl-100 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-gold-champagne text-base shadow-sm">
            W
          </div>
          <div>
            <span className="font-serif font-bold text-base text-espresso-charcoal tracking-tight block leading-none">
              WealthWise
            </span>
            <span className="text-[10px] text-espresso-light truncate max-w-[120px] block mt-0.5">
              {currentMeta.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher on mobile */}
          <button
            onClick={() => setDashboardMode(dashboardMode === 'beginner' ? 'advanced' : 'beginner')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              dashboardMode === 'advanced'
                ? 'bg-cream-200 border-gold-champagne text-gold-dark'
                : 'bg-pearl-50 border-silver-soft text-espresso-muted'
            }`}
            aria-label="Toggle Dashboard Mode"
          >
            {dashboardMode === 'beginner' ? 'Simple' : 'Advanced'}
          </button>

          <Button
            size="sm"
            variant="blush"
            onClick={() => setIsAddTxOpen(true)}
            className="text-xs px-2.5 py-1.5"
            icon={<PlusCircle className="w-3.5 h-3.5 text-blush-deep" />}
            aria-label="Add Transaction"
          >
            Add
          </Button>

          {/* User Avatar Menu Trigger on mobile */}
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-8 h-8 rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center text-xs font-serif font-bold text-espresso-charcoal shadow-xs"
            aria-label="User Account Menu"
          >
            {getInitials(userProfile?.name)}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-espresso-muted hover:text-espresso-charcoal hover:bg-silver-soft min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label={sidebarOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop & Tablet Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-pearl-50 border-r border-silver-brushed/40 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-silver-soft flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              navigate('/dashboard');
              setSidebarOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-gold-champagne/40 shadow-sm flex items-center justify-center font-serif font-bold text-gold-champagne text-xl group-hover:border-gold-champagne transition-colors">
              W
            </div>
            <div>
              <div className="font-serif font-bold text-xl text-espresso-charcoal leading-tight">
                WealthWise
              </div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-gold-dark flex items-center gap-1.5">
                <span>Smart Budget Optimizer</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg text-espresso-muted hover:text-espresso-charcoal min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add CTA inside sidebar with luxury blush gradient */}
        <div className="px-5 pt-5 pb-3">
          <button
            onClick={() => {
              setIsAddTxOpen(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold-champagne hover:bg-gold-hover text-espresso-deep font-semibold text-xs tracking-wide shadow-sm hover:shadow-gold-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense or Income (₹)
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cream-200 text-espresso-charcoal font-semibold shadow-xs border border-gold-champagne/40'
                      : 'text-espresso-muted hover:text-espresso-charcoal hover:bg-silver-soft/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-4 h-4 text-gold-champagne"
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-blush-100 text-blush-deep px-1.5 py-0.5 rounded border border-blush-rose/40">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Dynamic User Profile & Sign Out button */}
        <div className="p-4 border-t border-silver-soft bg-pearl-100/60 space-y-3">
          <div className="flex items-center justify-between text-xs text-espresso-muted px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-sage-muted"></span>
              Currency: INR (₹)
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset all saved financial records and return to the onboarding setup?')) {
                  resetAllData();
                }
              }}
              title="Reset data and return to setup"
              className="hover:text-espresso-charcoal flex items-center gap-1 text-[11px] text-espresso-light hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* User Card with Quick Profile View */}
          <div className="p-3 bg-white rounded-xl border border-silver-soft flex items-center justify-between gap-3 shadow-2xs">
            <div
              onClick={() => {
                navigate('/settings');
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center font-serif font-bold text-xs text-espresso-charcoal flex-shrink-0">
                {getInitials(userProfile?.name)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-espresso-charcoal truncate">
                  {userProfile?.name || 'My Budget'}
                </div>
                <div className="text-[10px] text-espresso-light truncate">
                  {dashboardMode === 'beginner' ? 'Simple Mode' : 'Advanced Mode'}
                </div>
              </div>
            </div>

            {/* Direct Sign Out Button in Sidebar */}
            <button
              onClick={handleSignOut}
              title="Sign Out of WealthWise"
              className="p-1.5 rounded-lg text-espresso-muted hover:text-expense-muted hover:bg-expense-soft/60 transition-colors flex items-center gap-1 text-xs"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Navbar with Rich Hierarchical Breadcrumbs & User Avatar Dropdown */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/70 backdrop-blur-md border-b border-silver-soft/80 sticky top-0 z-30">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-espresso-light hover:text-espresso-charcoal transition-colors group"
            >
              <Home className="w-3.5 h-3.5 text-gold-champagne group-hover:scale-110 transition-transform" />
              <span>WealthWise</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-silver-brushed flex-shrink-0" />
            <span className="text-espresso-muted font-medium">{currentMeta.section}</span>
            <ChevronRight className="w-3.5 h-3.5 text-silver-brushed flex-shrink-0" />
            <span className="font-semibold text-espresso-charcoal bg-pearl-200/60 px-2 py-0.5 rounded-md border border-silver-soft">
              {currentMeta.title}
            </span>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Beginner / Advanced Mode Switcher */}
            <div className="flex items-center p-1 bg-pearl-50 rounded-xl border border-silver-border">
              <button
                type="button"
                onClick={() => setDashboardMode('beginner')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dashboardMode === 'beginner'
                    ? 'bg-cream-200 text-espresso-charcoal shadow-xs border border-gold-champagne/40'
                    : 'text-espresso-muted hover:text-espresso-charcoal'
                }`}
              >
                🌱 Simple Mode
              </button>
              <button
                type="button"
                onClick={() => setDashboardMode('advanced')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dashboardMode === 'advanced'
                    ? 'bg-gold-champagne text-espresso-deep shadow-xs font-bold'
                    : 'text-espresso-muted hover:text-espresso-charcoal'
                }`}
              >
                ⚡ Advanced Mode
              </button>
            </div>

            {dashboardMode === 'advanced' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSimulateOpen(true)}
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              >
                Simulate Move
              </Button>
            )}

            <Button
              variant="blush"
              size="sm"
              onClick={() => setIsAddTxOpen(true)}
              icon={<PlusCircle className="w-4 h-4 text-blush-deep" />}
              className="shadow-sticky-pink"
            >
              Add Entry
            </Button>

            {/* User Avatar with Accessible Dropdown Menu (Requirement 1) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-silver-soft/60 border border-silver-soft/80 transition-all focus:outline-none focus:ring-2 focus:ring-gold-champagne/40"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cream-100 to-blush-100 border border-gold-champagne/50 flex items-center justify-center font-serif font-bold text-xs text-espresso-charcoal shadow-xs">
                  {getInitials(userProfile?.name)}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-semibold text-espresso-charcoal leading-none">
                    {userProfile?.name || 'Friend'}
                  </div>
                  <div className="text-[10px] text-espresso-light mt-0.5">
                    {userProfile?.email || 'Private Member'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-espresso-muted transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Panel */}
              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white border border-silver-brushed/60 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-3 border-b border-silver-soft">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-espresso-charcoal">
                        {userProfile?.name || 'My Wealth Journal'}
                      </div>
                      <Badge variant={userProfile?.isGuest ? 'silver' : userProfile?.isNewUser ? 'blush' : 'gold'} size="sm">
                        {userProfile?.isGuest ? 'Guest Sandbox' : userProfile?.isNewUser ? 'New Member' : 'Returning User'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-espresso-muted truncate mt-0.5">
                      {userProfile?.email || 'Active Session'}
                    </div>
                    {userProfile.phone && (
                      <div className="text-[10px] text-espresso-light mt-0.5">
                        📞 {userProfile.phone} {userProfile.dateOfBirth ? `• 🎂 ${userProfile.dateOfBirth}` : ''}
                      </div>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pearl-100 border border-gold-champagne/30 text-[10px] font-semibold text-gold-dark">
                      <Wallet className="w-3 h-3" />
                      Take-Home: ₹{monthlyIncome.toLocaleString('en-IN')}/mo
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      role="menuitem"
                      onClick={() => {
                        navigate('/dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-espresso-charcoal hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gold-champagne" />
                      <span>Executive Dashboard</span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        navigate('/budget-planner');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-espresso-charcoal hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                    >
                      <PieChart className="w-4 h-4 text-blush-rose" />
                      <span>Budget Allocations</span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        navigate('/settings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-espresso-charcoal hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-espresso-muted" />
                      <span>Preferences & Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-silver-soft my-1"></div>

                  <div className="px-2 py-1">
                    <button
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-expense-muted hover:bg-expense-soft/70 rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {/* Friendly Restoration Notice Banner (Requirement 5 & 6) */}
          {restorationNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cream-100 via-blush-soft/40 to-cream-50 border border-gold-champagne/50 shadow-soft flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cream-200 border border-gold-champagne/40 flex items-center justify-center text-gold-dark shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-espresso-charcoal">
                    {userProfile.isGuest ? 'Sandbox Exploration Active' : 'Session & Data Restored'}
                  </h4>
                  <p className="text-[11px] text-espresso-muted mt-0.5">
                    {restorationNotice}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissRestorationNotice}
                className="text-espresso-muted hover:text-espresso-charcoal p-1.5 text-xs font-semibold rounded-lg hover:bg-cream-200/60"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-silver-soft py-2 px-3 z-40 flex items-center justify-around shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-gold-dark font-bold' : 'text-espresso-muted'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/budget-planner"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-gold-dark font-bold' : 'text-espresso-muted'
            }`
          }
        >
          <PieChart className="w-4 h-4" />
          Budget
        </NavLink>
        <button
          onClick={() => setIsAddTxOpen(true)}
          className="-mt-5 w-11 h-11 rounded-full bg-gradient-to-r from-gold-champagne to-blush-rose text-espresso-deep flex items-center justify-center shadow-gold-glow border-2 border-white"
          aria-label="Add transaction"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-gold-dark font-bold' : 'text-espresso-muted'
            }`
          }
        >
          <ReceiptText className="w-4 h-4" />
          Entries
        </NavLink>
        <NavLink
          to="/goals"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-gold-dark font-bold' : 'text-espresso-muted'
            }`
          }
        >
          <Target className="w-4 h-4" />
          Goals
        </NavLink>
      </div>

      {/* Modals */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <SimulateDecisionModal isOpen={isSimulateOpen} onClose={() => setIsSimulateOpen(false)} />
    </div>
  );
};
