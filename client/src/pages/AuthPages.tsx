import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useFinance } from '../context/FinanceContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import {
  signInWithPassword,
  signInWithOAuth,
  requestOTP,
  verifyOTPCode,
  registerFirstTimeUser,
  loginAsGuest,
  getLastSignOutReceipt,
  clearLastSignOutReceipt,
  UserPreferences,
  SignOutReceipt,
} from '../services/authService';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Compass,
  KeyRound,
  Smartphone,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup';

interface AuthPortalProps {
  initialTab?: AuthTab;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ initialTab = 'signin' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useFinance();

  // Tab mode: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<AuthTab>(() => {
    try {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'signup' || tabParam === 'signin') {
        return tabParam;
      }
    } catch {
      // ignore
    }
    return initialTab;
  });

  // Sign-in states
  const [signInEmail, setSignInEmail] = useState(() => {
    try {
      return searchParams.get('email') || '';
    } catch {
      return '';
    }
  });
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Alternative OTP sign-in mode
  const [useOtpMode, setUseOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Sign-up states
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState(() => {
    try {
      return searchParams.get('email') || '';
    } catch {
      return '';
    }
  });
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpIncome, setSignUpIncome] = useState<number | ''>('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // OAuth Interactive Dialog Modal
  const [oauthModal, setOauthModal] = useState<'google' | 'apple' | null>(null);
  const [googleEmailChoice, setGoogleEmailChoice] = useState('sambhaji.jadhav@gmail.com');
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [useCustomGoogleEmail, setUseCustomGoogleEmail] = useState(false);
  const [appleEmailType, setAppleEmailType] = useState<'share' | 'hide'>('share');

  // Sign-out receipt for confirming data preservation
  const [signOutReceipt, setSignOutReceipt] = useState<SignOutReceipt | null>(null);

  useEffect(() => {
    try {
      const receipt = getLastSignOutReceipt();
      if (receipt) {
        setSignOutReceipt(receipt);
        if (!signInEmail && receipt.userEmail) {
          setSignInEmail(receipt.userEmail);
        }
      }
      const queryEmail = searchParams.get('email');
      if (queryEmail) {
        setSignInEmail(queryEmail);
        setSignUpEmail(queryEmail);
      }
    } catch {
      // safe fallback
    }
  }, [searchParams]);

  // Handle Tab Change
  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMsg(null);
    setInfoMsg(null);
    if (tab === 'signup' && signInEmail && !signUpEmail) {
      setSignUpEmail(signInEmail);
    } else if (tab === 'signin' && signUpEmail && !signInEmail) {
      setSignInEmail(signUpEmail);
    }
  };

  // Sign In with Email & Password
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = signInEmail.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address to continue.');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signInWithPassword(cleanEmail, signInPassword);
      if (result.success && result.user) {
        clearLastSignOutReceipt();
        loginUser(result.user);
        navigate('/dashboard');
      } else {
        const rawError = result.error || '';
        if (rawError.toLowerCase().includes('not found') || rawError.toLowerCase().includes('no account')) {
          setErrorMsg('No account found for this email address. Would you like to create an account?');
        } else {
          setErrorMsg('The email address or password you entered is incorrect. Please verify your credentials and try again.');
        }
      }
    } catch {
      setErrorMsg('We are temporarily unable to connect to the authentication service. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open OAuth Dialog
  const handleOpenOAuthModal = (provider: 'google' | 'apple') => {
    setErrorMsg(null);
    setInfoMsg(null);
    setOauthModal(provider);
  };

  // Confirm and Execute OAuth Authentication
  const handleConfirmOAuth = async () => {
    if (!oauthModal) return;
    const provider = oauthModal;
    setOauthLoading(provider);
    setIsSubmitting(true);
    setErrorMsg(null);

    let chosenEmail = '';
    let chosenName = '';

    if (provider === 'google') {
      chosenEmail = useCustomGoogleEmail
        ? googleCustomEmail.trim() || 'user@gmail.com'
        : googleEmailChoice;
      chosenName = chosenEmail.split('@')[0].replace('.', ' ') || 'Google User';
    } else {
      chosenEmail = appleEmailType === 'hide'
        ? `user.${Math.random().toString(36).substring(2, 8)}@privaterelay.appleid.com`
        : 'sambhaji.jadhav@icloud.com';
      chosenName = 'Apple Member';
    }

    try {
      const result = await signInWithOAuth(provider, { email: chosenEmail, name: chosenName });
      if (result.success && result.user) {
        setOauthModal(null);
        clearLastSignOutReceipt();
        loginUser(result.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(result.error || `Unable to complete ${provider} sign-in.`);
      }
    } catch {
      setErrorMsg(`We encountered an unexpected connection issue with ${provider}. Please try with email/password.`);
    } finally {
      setOauthLoading(null);
      setIsSubmitting(false);
    }
  };

  // Request OTP for passwordless sign in
  const handleRequestOTP = async () => {
    const cleanEmail = signInEmail.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address first.');
      return;
    }

    setErrorMsg(null);
    setOtpNotice('Dispatching verification code to your registered contact...');
    try {
      const result = await requestOTP(cleanEmail);
      if (result.success) {
        setOtpSent(true);
        setOtpNotice(result.message || 'Verification code dispatched. Please check your email or SMS.');
        if (result.testOtp) {
          setOtpCode(result.testOtp);
        }
      } else {
        setErrorMsg(result.error || 'Unable to generate verification code. Please check your email.');
      }
    } catch {
      setErrorMsg('Service temporarily unavailable. Please try signing in with your password.');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await verifyOTPCode(signInEmail.trim(), otpCode.trim());
      if (result.success && result.user) {
        clearLastSignOutReceipt();
        loginUser(result.user);
        navigate('/dashboard');
      } else {
        setErrorMsg('The verification code is incorrect or expired. Please request a new code.');
      }
    } catch {
      setErrorMsg('Verification failed due to a network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register First-Time User
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const preferences: UserPreferences = {
        currency: 'INR',
        theme: 'luxury',
        notificationAlerts: true,
        riskTolerance: 'growth',
        monthlySavingsTargetPercent: 20,
        monthlyIncome: typeof signUpIncome === 'number' ? signUpIncome : 0,
        primarySavingsGoal: 'Wealth Preservation & Growth',
        allocationStyle: 'growth',
      };

      const result = await registerFirstTimeUser({
        name: cleanName,
        email: cleanEmail,
        password: signUpPassword,
        preferences,
        monthlyIncome: typeof signUpIncome === 'number' ? signUpIncome : 0,
      });

      if (result.success && result.user) {
        clearLastSignOutReceipt();
        loginUser(result.user);
        navigate('/dashboard');
      } else {
        const rawError = result.error || '';
        if (rawError.toLowerCase().includes('already exists')) {
          setErrorMsg('An account with this email address already exists. Please sign in instead.');
        } else {
          setErrorMsg('We could not create your account. Please verify your details and try again.');
        }
      }
    } catch {
      setErrorMsg('We encountered a temporary connection issue. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Guest Sandbox Entry (Isolated from real user accounts)
  const handleContinueAsGuest = () => {
    const guest = loginAsGuest();
    loginUser(guest);
    navigate('/dashboard');
  };

  // Calculate password strength indicator
  const passwordStrength = (() => {
    if (!signUpPassword) return { score: 0, label: '', color: 'bg-silver-border' };
    let score = 0;
    if (signUpPassword.length >= 6) score += 1;
    if (signUpPassword.length >= 10) score += 1;
    if (/[0-9]/.test(signUpPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signUpPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-400' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-gold-champagne' };
    return { score: 4, label: 'Strong', color: 'bg-sage-muted' };
  })();

  return (
    <div className="min-h-screen bg-pearl-100 flex items-center justify-center p-4 selection:bg-blush-100 py-10">
      <div className="max-w-md w-full bg-white border border-silver-brushed/60 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
        {/* Luxury Top Accent Bar with Subtle Pink Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-champagne via-blush-rose to-gold-dark" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blush-50 text-blush-deep border border-blush-rose/30">
              WealthWise Private Access
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pearl-50 border border-gold-champagne/40 mx-auto flex items-center justify-center font-serif font-bold text-gold-champagne text-2xl shadow-sm mb-3">
            W
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-charcoal tracking-tight">
            {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
            {activeTab === 'signin'
              ? 'Access your private monthly budget and financial plan'
              : 'Start your personal budget journal with zero bank linking'}
          </p>
        </div>

        {/* Primary Segmented Tabs: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-pearl-100 rounded-2xl border border-silver-soft mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-espresso-charcoal shadow-sm border border-gold-champagne/30 ring-1 ring-blush-rose/20'
                : 'text-espresso-muted hover:text-espresso-charcoal'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-gold-dark" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-espresso-charcoal shadow-sm border border-blush-rose/40 ring-1 ring-blush-rose/20'
                : 'text-espresso-muted hover:text-espresso-charcoal'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blush-deep" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Sign-Out Confirmation Notice */}
        {signOutReceipt && activeTab === 'signin' && signOutReceipt.userEmail && (
          <div className="mb-5 p-3.5 bg-gradient-to-r from-cream-100 to-pearl-50 border border-gold-champagne/40 rounded-2xl text-xs text-espresso-charcoal animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gold-champagne shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-espresso-charcoal">
                  Session Closed Securely
                </span>
                <p className="text-[11px] text-espresso-muted mt-0.5">
                  Your records for <span className="font-semibold text-espresso-charcoal">{signOutReceipt.userEmail}</span> are saved and ready to restore.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User-Friendly Error Alert (Never exposes backend details) */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {errorMsg.includes('create an account') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="inline-flex items-center gap-1 font-bold text-rose-900 underline hover:text-espresso-charcoal transition-colors"
                  >
                    Switch to Create Account with {signInEmail} →
                  </button>
                </div>
              )}
              {errorMsg.includes('already exists') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange('signin')}
                    className="inline-flex items-center gap-1 font-bold text-rose-900 underline hover:text-espresso-charcoal transition-colors"
                  >
                    Switch to Sign In →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informative Alert */}
        {infoMsg && (
          <div className="mb-5 p-3.5 bg-sage-soft border border-sage-muted/30 rounded-2xl text-xs text-sage-muted flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">{infoMsg}</span>
          </div>
        )}

        {/* ================================================================ */}
        {/* OAUTH BUTTONS (GOOGLE & APPLE) - INTERACTIVE LINKING             */}
        {/* ================================================================ */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={() => handleOpenOAuthModal('google')}
            disabled={oauthLoading !== null || isSubmitting}
            className="w-full py-2.5 px-4 bg-white hover:bg-cream-100/70 border border-silver-soft hover:border-gold-champagne/40 rounded-xl text-xs font-semibold text-espresso-charcoal flex items-center justify-center gap-2.5 transition-all shadow-xs hover:shadow-soft"
          >
            {oauthLoading === 'google' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-espresso-muted" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenOAuthModal('apple')}
            disabled={oauthLoading !== null || isSubmitting}
            className="w-full py-2.5 px-4 bg-white hover:bg-cream-100/70 border border-silver-soft hover:border-gold-champagne/40 rounded-xl text-xs font-semibold text-espresso-charcoal flex items-center justify-center gap-2.5 transition-all shadow-xs hover:shadow-soft"
          >
            {oauthLoading === 'apple' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-espresso-muted" />
            ) : (
              <svg className="w-4 h-4 fill-current text-espresso-charcoal shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.01-.5 2.63-1.24" />
              </svg>
            )}
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-silver-soft" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-espresso-light">
            <span className="bg-white px-3 font-medium">or continue with email</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: SIGN IN FORM                                              */}
        {/* ================================================================ */}
        {activeTab === 'signin' && (
          <div>
            {!useOtpMode ? (
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseOtpMode(true)}
                      className="text-[11px] font-semibold text-blush-deep hover:text-espresso-charcoal hover:underline"
                    >
                      Sign in with OTP
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso-light hover:text-blush-rose transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-espresso-muted hover:text-espresso-charcoal">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-silver-border text-gold-dark accent-gold-champagne focus:ring-blush-rose/30"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit button directly inside form */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full shadow-soft hover:shadow-blush-glow mt-2 flex items-center justify-center gap-2 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to WealthWise</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Alternative OTP Sign In */
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-pearl-50 rounded-xl border border-silver-soft flex items-center justify-between">
                  <span className="text-xs text-espresso-charcoal truncate">{signInEmail || 'No email specified'}</span>
                  <button
                    type="button"
                    onClick={() => setUseOtpMode(false)}
                    className="text-[11px] font-semibold text-gold-dark hover:underline"
                  >
                    Use Password
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      className="text-[11px] font-semibold text-gold-dark hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> {otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-pearl-50/70 border border-silver-border rounded-xl text-sm font-mono tracking-widest text-center text-espresso-charcoal font-bold focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                  />
                  {otpNotice && (
                    <span className="text-[11px] text-espresso-muted mt-1.5 block">
                      {otpNotice}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !otpCode}
                  className="w-full shadow-soft hover:shadow-blush-glow mt-2 flex items-center justify-center gap-2 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Access Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: CREATE ACCOUNT (SIGN UP FORM)                             */}
        {/* ================================================================ */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sambhaji Jadhav"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-espresso-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso-light hover:text-blush-rose transition-colors"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {signUpPassword && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-pearl-200 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= level ? passwordStrength.color : 'bg-silver-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-espresso-muted">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-charcoal mb-1">
                Monthly Net Income (₹) <span className="text-espresso-light font-normal text-[10px]">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 85000"
                value={signUpIncome}
                onChange={(e) => setSignUpIncome(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-pearl-50/70 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder:text-espresso-light/60 focus:outline-none focus:border-blush-rose focus:ring-2 focus:ring-blush-rose/25 transition-all"
              />
              <span className="text-[10px] text-espresso-light mt-1 block">
                You can configure your exact expenses in the step-by-step wizard.
              </span>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-espresso-muted">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-silver-border text-gold-dark accent-gold-champagne focus:ring-blush-rose/30"
                />
                <span>
                  I agree to keep my financial records private and follow WealthWise terms.
                </span>
              </label>
            </div>

            {/* Submit button directly inside form */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full shadow-soft hover:shadow-blush-glow mt-2 flex items-center justify-center gap-2 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* ================================================================ */}
        {/* OPTIONAL GUEST / DEMO MODE (CLEARLY SEPARATED)                   */}
        {/* ================================================================ */}
        <div className="mt-7 pt-5 border-t border-silver-soft/80">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-100/70 via-pearl-50 to-blush-soft/20 border border-silver-soft/80 text-center relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-espresso-charcoal">
                <Compass className="w-4 h-4 text-gold-champagne" />
                <span>Guest Sandbox Mode</span>
              </div>
              <Badge variant="silver" size="sm" className="text-[9px] bg-white text-espresso-muted border-silver-soft">
                Local Session Only
              </Badge>
            </div>

            <p className="text-[11px] text-espresso-muted text-left leading-relaxed mb-3">
              Want to test the app without signing up? Explore all 13 financial views and budget simulations with preloaded sample data in an isolated browser sandbox.
            </p>

            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-2 px-3 bg-white hover:bg-cream-100 border border-silver-border rounded-xl text-xs font-semibold text-espresso-charcoal hover:text-gold-dark flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Explore as Guest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <span className="text-[11px] text-espresso-light">
            {activeTab === 'signin' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className="font-semibold text-blush-deep hover:text-espresso-charcoal hover:underline"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-semibold text-blush-deep hover:text-espresso-charcoal hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* INTERACTIVE OAUTH MODAL DIALOG (GOOGLE & APPLE)                  */}
      {/* ================================================================ */}
      {oauthModal && (
        <div className="fixed inset-0 z-50 bg-espresso-deep/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-silver-soft relative">
            <button
              type="button"
              onClick={() => setOauthModal(null)}
              className="absolute right-4 top-4 text-espresso-muted hover:text-espresso-charcoal p-1 rounded-full hover:bg-pearl-100"
            >
              <X className="w-4 h-4" />
            </button>

            {oauthModal === 'google' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pearl-50 border border-silver-soft flex items-center justify-center shadow-xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-espresso-charcoal">Sign in with Google</h3>
                    <p className="text-xs text-espresso-muted">to continue to WealthWise Financial Journal</p>
                  </div>
                </div>

                <div className="py-2 space-y-2">
                  <span className="text-xs font-semibold text-espresso-charcoal block">Choose an account</span>

                  {/* Preloaded Account Card */}
                  <div
                    onClick={() => setUseCustomGoogleEmail(false)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      !useCustomGoogleEmail
                        ? 'bg-cream-100/70 border-gold-champagne/60 ring-1 ring-gold-champagne/30'
                        : 'bg-pearl-50 border-silver-soft hover:bg-cream-100/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold-champagne/20 text-gold-dark font-serif font-bold flex items-center justify-center text-sm">
                        SJ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-espresso-charcoal">Sambhaji Jadhav</div>
                        <div className="text-[11px] text-espresso-muted">{googleEmailChoice}</div>
                      </div>
                    </div>
                    {!useCustomGoogleEmail && <Check className="w-4 h-4 text-gold-dark" />}
                  </div>

                  {/* Custom Google Email Option */}
                  <div
                    onClick={() => setUseCustomGoogleEmail(true)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      useCustomGoogleEmail
                        ? 'bg-cream-100/70 border-gold-champagne/60 ring-1 ring-gold-champagne/30'
                        : 'bg-pearl-50 border-silver-soft hover:bg-cream-100/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-espresso-charcoal">Use another Google account</span>
                      {useCustomGoogleEmail && <Check className="w-4 h-4 text-gold-dark" />}
                    </div>
                    {useCustomGoogleEmail && (
                      <input
                        type="email"
                        autoFocus
                        placeholder="yourname@gmail.com"
                        value={googleCustomEmail}
                        onChange={(e) => setGoogleCustomEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-silver-border rounded-xl text-xs text-espresso-charcoal focus:outline-none focus:ring-2 focus:ring-gold-champagne/30"
                      />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-espresso-light leading-relaxed">
                  To continue, Google will share your name, email address, and language preference with WealthWise. See our Privacy Policy.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-silver-soft">
                  <button
                    type="button"
                    onClick={() => setOauthModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-espresso-muted hover:text-espresso-charcoal"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (window.location.href = 'http://localhost:5000/auth/google')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-pearl-100 hover:bg-cream-200 text-espresso-charcoal border border-silver-soft transition-all"
                      title="Initiate full backend OAuth flow"
                    >
                      OAuth Server Flow (/auth/google)
                    </button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      onClick={handleConfirmOAuth}
                      className="shadow-soft"
                    >
                      {isSubmitting ? 'Authenticating...' : 'Instant Sign In →'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Apple Sign-In Dialog */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.01-.5 2.63-1.24" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-espresso-charcoal">Sign in with Apple ID</h3>
                    <p className="text-xs text-espresso-muted">Use your Apple ID for WealthWise</p>
                  </div>
                </div>

                <div className="py-2 space-y-2.5">
                  <span className="text-xs font-semibold text-espresso-charcoal block">Email Privacy Option</span>

                  <label className="p-3 rounded-2xl border border-silver-soft flex items-center justify-between cursor-pointer hover:bg-pearl-50">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="appleEmail"
                        checked={appleEmailType === 'share'}
                        onChange={() => setAppleEmailType('share')}
                        className="text-gold-dark accent-gold-champagne"
                      />
                      <div>
                        <div className="text-xs font-bold text-espresso-charcoal">Share My Email</div>
                        <div className="text-[11px] text-espresso-muted">sambhaji.jadhav@icloud.com</div>
                      </div>
                    </div>
                  </label>

                  <label className="p-3 rounded-2xl border border-silver-soft flex items-center justify-between cursor-pointer hover:bg-pearl-50">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="appleEmail"
                        checked={appleEmailType === 'hide'}
                        onChange={() => setAppleEmailType('hide')}
                        className="text-gold-dark accent-gold-champagne"
                      />
                      <div>
                        <div className="text-xs font-bold text-espresso-charcoal">Hide My Email</div>
                        <div className="text-[11px] text-espresso-muted">Creates an anonymous relay address</div>
                      </div>
                    </div>
                  </label>
                </div>

                <p className="text-[11px] text-espresso-light leading-relaxed">
                  WealthWise will authenticate your identity securely without storing biometric data.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-silver-soft">
                  <button
                    type="button"
                    onClick={() => setOauthModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-espresso-muted hover:text-espresso-charcoal"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (window.location.href = 'http://localhost:5000/auth/apple')}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-pearl-100 hover:bg-cream-200 text-espresso-charcoal border border-silver-soft transition-all"
                      title="Initiate full backend Apple OAuth flow"
                    >
                      OAuth Server Flow (/auth/apple)
                    </button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      onClick={handleConfirmOAuth}
                      className="shadow-soft"
                    >
                      {isSubmitting ? 'Authenticating...' : 'Authorize Touch ID →'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LoginPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Sign-In Unavailable" fallbackMessage="Unable to render the sign-in form. Please refresh or return to homepage.">
      <AuthPortal initialTab="signin" />
    </ErrorBoundary>
  );
};

export const SignUpPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Registration Unavailable" fallbackMessage="Unable to render the registration form. Please refresh or return to homepage.">
      <AuthPortal initialTab="signup" />
    </ErrorBoundary>
  );
};

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary fallbackTitle="Onboarding Setup" fallbackMessage="Unable to load onboarding steps. Please reload or sign in.">
      <div className="min-h-screen bg-pearl-100 flex items-center justify-center p-4">
        <OnboardingWizard onComplete={() => navigate('/dashboard')} />
      </div>
    </ErrorBoundary>
  );
};
