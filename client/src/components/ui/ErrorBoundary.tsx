import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('WealthWise Display Error:', error, errorInfo);

    // Asynchronously log display errors to backend for telemetry/monitoring
    try {
      fetch('http://localhost:5000/api/auth/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Safe silence if backend offline
      });
    } catch {
      // ignore
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleReturnHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred.';

      return (
        <div className="min-h-screen bg-pearl-100 flex items-center justify-center p-4 text-espresso-charcoal selection:bg-blush-100">
          <div className="max-w-md w-full bg-white border border-silver-soft rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-blush-rose to-gold-champagne" />

            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center text-rose-600 mb-3 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-espresso-charcoal mb-1">
              {this.props.fallbackTitle || 'Display Issue Encountered'}
            </h2>

            <p className="text-xs text-espresso-muted mb-4">
              {this.props.fallbackMessage || 'WealthWise caught an unexpected display error before it affected your data.'}
            </p>

            {/* Dynamic Error Reason Display (Requirement 4) */}
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/70 rounded-2xl text-left mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Actual Error Reason:
                </span>
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="text-[10px] font-semibold text-rose-800 hover:underline flex items-center gap-0.5"
                >
                  {this.state.showDetails ? (
                    <>
                      <span>Hide Stack</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Inspect Details</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono font-semibold text-rose-900 mt-1 break-words">
                {errorMessage}
              </p>

              {this.state.showDetails && (
                <div className="mt-2.5 pt-2 border-t border-rose-200/60 max-h-36 overflow-y-auto font-mono text-[10px] text-rose-800/90 whitespace-pre-wrap leading-tight bg-white/70 p-2 rounded-xl">
                  {this.state.error?.stack || 'No stack trace available.'}
                </div>
              )}
            </div>

            {/* Actions: Retry & Return Home (Requirement 4) */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full py-2.5 px-4 bg-espresso-charcoal hover:bg-espresso-deep text-pearl-50 rounded-xl text-xs font-semibold shadow-soft hover:shadow-blush-glow transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Action</span>
              </button>

              <button
                type="button"
                onClick={this.handleReturnHome}
                className="w-full py-2.5 px-4 bg-white hover:bg-cream-100 border border-silver-soft rounded-xl text-xs font-semibold text-espresso-charcoal transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5 text-espresso-muted" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
