import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'blush' | 'rose' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-champagne/40 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-gold-champagne hover:bg-gold-hover text-espresso-deep shadow-sm hover:shadow-gold-glow active:scale-[0.98]',
    secondary: 'bg-silver-soft hover:bg-silver-tint text-espresso-charcoal border border-silver-border active:scale-[0.98]',
    outline: 'border border-gold-champagne/60 text-espresso-charcoal hover:bg-gold-light/40 active:scale-[0.98]',
    ghost: 'text-espresso-muted hover:text-espresso-charcoal hover:bg-silver-soft/60 active:scale-[0.98]',
    blush: 'bg-gradient-to-r from-blush-50 via-blush-100 to-blush-200 hover:from-blush-100 hover:to-blush-rose/30 text-espresso-charcoal border border-blush-rose/40 shadow-xs hover:shadow-sticky-pink active:scale-[0.98]',
    rose: 'bg-gradient-to-r from-[#C46D7E] to-[#9B3B52] hover:from-[#B55E6F] hover:to-[#873145] text-white font-semibold shadow-sm hover:shadow-sticky-pink active:scale-[0.98]',
    danger: 'bg-expense-soft hover:bg-expense-soft/80 text-expense-muted border border-expense-border active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
