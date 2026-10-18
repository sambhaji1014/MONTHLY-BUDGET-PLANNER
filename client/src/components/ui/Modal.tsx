import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-espresso-deep/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200" />
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <Dialog.Content className={`relative w-full ${maxStyles[maxWidth]} bg-pearl-50 border border-silver-brushed/50 rounded-2xl p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200 focus:outline-none`}>
            <div className="flex items-start justify-between pb-4 border-b border-silver-soft">
              <div>
                <Dialog.Title className="font-serif text-xl font-bold text-espresso-charcoal">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-espresso-muted hover:text-espresso-charcoal hover:bg-silver-soft transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-5">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
