import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { verifyOAuthToken, clearLastSignOutReceipt, UserRecord } from '../services/authService';
import { RefreshCw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useFinance();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('OAuth Provider');
  const [retryKey, setRetryKey] = useState<number>(0);

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider') || 'google';
    const errorParam = searchParams.get('error');
    const queryName = searchParams.get('name');
    const queryEmail = searchParams.get('email');

    setProviderName(provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple ID' : 'OAuth Provider');

    if (errorParam) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(errorParam));
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token received from identity provider.');
      return;
    }

    setStatus('verifying');
    setErrorMessage(null);

    // Verify token with backend asynchronously (Task 1 & Task 2)
    const processToken = async () => {
      try {
        const result = await verifyOAuthToken(token);

        if (result.success && (result.user || result.name)) {
          clearLastSignOutReceipt();

          // Task 1 & Task 3: Ensure user.name is strictly defined before login/render
          const resolvedName =
            result.name?.trim() ||
            result.user?.name?.trim() ||
            queryName?.trim() ||
            (result.email ? result.email.split('@')[0] : 'Member');

          const safeUser: UserRecord = {
            ...(result.user || {}),
            id: result.user?.id || `usr_oauth_${Date.now()}`,
            name: resolvedName,
            email: result.email || result.user?.email || queryEmail || '',
            preferences: result.preferences || result.user?.preferences || {
              currency: 'INR',
              theme: 'luxury',
              notificationAlerts: true,
              riskTolerance: 'growth',
              monthlySavingsTargetPercent: 25,
              monthlyIncome: 120000,
              primarySavingsGoal: 'Wealth Compounding',
              allocationStyle: 'growth',
            },
            isNewUser: result.user?.isNewUser ?? false,
            createdAt: result.user?.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          // Store in context & state
          loginUser(safeUser);
          setStatus('success');

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#C5A15B', '#FAF7F0', '#D99AA6'],
            });
          } catch {
            // ignore
          }

          // Brief delay for success animation before navigating to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Authentication token could not be verified by the server.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Unexpected network error during token exchange.');
      }
    };

    processToken();
  }, [searchParams, loginUser, navigate, retryKey]);

  return (
    <div className="min-h-screen bg-pearl-100 flex items-center justify-center p-4 selection:bg-blush-100">
      <div className="max-w-md w-full bg-white border border-silver-soft rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-champagne via-blush-rose to-gold-dark" />

        <div className="w-12 h-12 rounded-2xl bg-pearl-50 border border-gold-champagne/40 mx-auto flex items-center justify-center font-serif font-bold text-gold-champagne text-2xl shadow-sm mb-4">
          W
        </div>

        {status === 'verifying' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-cream-100 text-gold-dark mx-auto flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-espresso-charcoal">
              Authenticating with {providerName}
            </h2>

            <p className="text-xs text-espresso-muted leading-relaxed">
              Exchanging secure credentials and preparing your private budget journal...
            </p>

            <div className="p-3 bg-pearl-50 rounded-xl border border-silver-soft text-[11px] text-espresso-light flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-champagne" />
              <span>Verifying signed JWT cryptographic signature</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-sage-soft text-sage-muted mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-sage-muted" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-espresso-charcoal">
              Signed In Successfully!
            </h2>

            <p className="text-xs text-espresso-muted leading-relaxed">
              Verified with {providerName}. Redirecting to your dashboard...
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage-soft/60 text-sage-muted rounded-full text-xs font-semibold">
              <span>Opening Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-rose-600" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-espresso-charcoal">
              Sign-In Failed
            </h2>

            <p className="text-xs text-espresso-muted">
              We encountered an issue during {providerName} authorization.
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-mono text-rose-800 text-left break-words">
              {errorMessage}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="w-full py-2.5 px-4 bg-espresso-charcoal hover:bg-espresso-deep text-pearl-50 rounded-xl text-xs font-semibold shadow-soft hover:shadow-blush-glow transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-cream-100 hover:bg-cream-200 border border-silver-soft rounded-xl text-xs font-semibold text-espresso-charcoal transition-all"
              >
                Return to Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 bg-white hover:bg-cream-100 border border-silver-soft rounded-xl text-xs font-semibold text-espresso-charcoal transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5 text-espresso-muted" />
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
