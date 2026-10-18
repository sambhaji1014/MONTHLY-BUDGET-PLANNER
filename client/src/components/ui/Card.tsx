import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`luxury-card ${interactive ? 'luxury-card-interactive cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-silver-soft/80 ${className}`}>
      <div>
        <h3 className="font-serif text-lg md:text-xl font-semibold text-espresso-charcoal leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs md:text-sm text-espresso-muted mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};
