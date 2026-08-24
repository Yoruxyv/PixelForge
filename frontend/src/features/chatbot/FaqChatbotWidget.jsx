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
      className="fw fixed bottom-[calc(var(--pf-assistant-inset)+env(safe-area-inset-bottom))] right-[calc(var(--pf-assistant-inset)+env(safe-area-inset-right))] z-[var(--pf-z-toast)] flex flex-col items-end text-pf-editorial-ink [--pf-assistant-inset:0.75rem] sm:[--pf-assistant-inset:1.25rem]"
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
