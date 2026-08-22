import { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a modal dialog for displaying legal information (Privacy, Terms, etc.).
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is currently open.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @returns {JSX.Element}
 */
export default function AppModals({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => {
        dialog.dataset.state = 'open';
      });
    } else if (dialog.open) {
      dialog.dataset.state = 'closing';
      const timer = setTimeout(() => {
        if (dialog.open) dialog.close();
        delete dialog.dataset.state;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-0 p-0 border-0 bg-transparent max-w-none max-h-none w-screen h-screen fixed inset-0 z-100"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="legal-backdrop absolute inset-0"
        />

        <div
          className="legal-panel relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface shadow-pf-float"
        >
          <div className="flex items-center justify-between border-b border-pf-editorial-line px-6 py-4">
            <h2 id={titleId} className="text-xl font-bold text-pf-editorial-ink">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-pf-control p-2 text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-pf-editorial-muted">
            {children}
          </div>

          <div className="flex justify-end border-t border-pf-editorial-line bg-pf-editorial-raised px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-pf-control bg-pf-editorial-ink px-5 py-2 font-bold text-pf-editorial-base transition-colors hover:bg-pf-editorial-accent"
            >
              Got it
            </button>
          </div>
        </div>
      </div>

      <style>{`
        dialog::backdrop { background: transparent; }

        .legal-backdrop {
          background: rgba(15, 23, 42, 0);
          backdrop-filter: blur(0px);
          transition: background 300ms ease, backdrop-filter 300ms ease;
        }

        .legal-panel {
          opacity: 0;
          transform: translateY(32px) scale(0.95);
          transition: opacity 300ms ease, transform 300ms ease;
        }

        dialog[data-state="open"] .legal-backdrop {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
        }

        dialog[data-state="open"] .legal-panel {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        dialog[data-state="closing"] .legal-backdrop {
          background: rgba(15, 23, 42, 0);
          backdrop-filter: blur(0px);
        }

        dialog[data-state="closing"] .legal-panel {
          opacity: 0;
          transform: translateY(32px) scale(0.95);
        }
      `}</style>
    </dialog>
  );
}

AppModals.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
