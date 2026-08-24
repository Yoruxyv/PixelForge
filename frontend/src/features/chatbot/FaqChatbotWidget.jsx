import { lazy, Suspense, useState } from 'react';
import FabToggle from './FabToggle';

const FaqChatbotPanel = lazy(() => import('./FaqChatbotPanel'));

/** Loads the optional support panel only after the launcher is used. */
export default function FaqChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRequestedPanel, setHasRequestedPanel] = useState(false);

  const toggleOpen = () => {
    if (!isOpen) setHasRequestedPanel(true);
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="fw fixed right-4 z-[var(--pf-z-toast)] flex flex-col items-end text-pf-editorial-ink [--footer-safe-offset:6.75rem] sm:right-5 sm:[--footer-safe-offset:4.5rem]"
      style={{
        bottom:
          'calc(var(--footer-safe-offset, 16px) + env(safe-area-inset-bottom))',
      }}
    >
      {hasRequestedPanel && (
        <Suspense fallback={null}>
          <FaqChatbotPanel isOpen={isOpen} setIsOpen={setIsOpen} />
        </Suspense>
      )}

      <FabToggle isOpen={isOpen} onToggle={toggleOpen} />
    </div>
  );
}
