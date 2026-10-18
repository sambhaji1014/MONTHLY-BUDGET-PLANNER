import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'red' | 'gold' | 'blush' | 'rose' | 'lavender' | 'silver';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'silver',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  const variantStyles = {
    sage: 'bg-sage-soft text-sage-muted border border-sage-border/60',
    red: 'bg-expense-soft text-expense-muted border border-expense-border/60',
    gold: 'bg-gold-light/60 text-gold-dark border border-gold-champagne/40',
    blush: 'bg-blush-100/90 text-blush-deep border border-blush-rose/50 font-semibold',
    rose: 'bg-blush-deep text-white border border-blush-dark font-semibold shadow-xs',
    lavender: 'bg-lavender-soft text-[#6B4F8B] border border-lavender-border/60',
    silver: 'bg-silver-soft text-espresso-muted border border-silver-border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
