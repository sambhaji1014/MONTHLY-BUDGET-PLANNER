import React from 'react';
import { Sparkles, Pin } from 'lucide-react';

export interface StickyNoteProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'pink' | 'lavender' | 'gold';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  tag?: string;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  title,
  children,
  variant = 'pink',
  action,
  className = '',
  tag,
}) => {
  const styles = {
    pink: 'sticky-note-pink text-espresso-charcoal',
    lavender: 'sticky-note-lavender text-espresso-charcoal',
    gold: 'sticky-note-gold text-espresso-charcoal',
  };

  const tagStyles = {
    pink: 'bg-blush-rose/20 text-[#8C3C4E]',
    lavender: 'bg-[#C0A8E0]/30 text-[#543574]',
    gold: 'bg-gold-champagne/25 text-[#73531A]',
  };

  const pinColors = {
    pink: 'text-blush-rose',
    lavender: 'text-[#A080C0]',
    gold: 'text-gold-champagne',
  };

  return (
    <div className={`relative p-5 transition-all duration-300 hover:-translate-y-0.5 ${styles[variant]} ${className}`}>
      {/* Decorative luxury pin icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pin className={`w-3.5 h-3.5 transform -rotate-45 ${pinColors[variant]}`} />
          {tag && (
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagStyles[variant]}`}>
              {tag}
            </span>
          )}
        </div>
        <Sparkles className={`w-3.5 h-3.5 opacity-60 ${pinColors[variant]}`} />
      </div>

      {title && (
        <h4 className="font-serif font-semibold text-espresso-charcoal text-base mb-1.5 leading-snug">
          {title}
        </h4>
      )}

      <div className="text-sm text-espresso-charcoal/90 leading-relaxed font-normal">
        {children}
      </div>

      {action && (
        <div className="mt-4 pt-3 border-t border-espresso-charcoal/10 flex justify-end">
          <button
            onClick={action.onClick}
            className="text-xs font-semibold text-espresso-charcoal hover:underline inline-flex items-center gap-1 group"
          >
            <span>{action.label}</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      )}
    </div>
  );
};
