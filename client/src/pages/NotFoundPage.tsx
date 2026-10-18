import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pearl-100 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-silver-soft rounded-3xl p-8 sm:p-10 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-cream-200 border border-gold-champagne/40 mx-auto flex items-center justify-center text-gold-champagne mb-4">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
          404 Error
        </span>
        <h1 className="font-serif text-3xl font-bold text-espresso-charcoal mt-1 mb-2">
          Page Not Located
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed mb-6">
          The financial ledger entry or path you requested does not exist in this ledger journal.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/dashboard')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="shadow-gold-glow"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
