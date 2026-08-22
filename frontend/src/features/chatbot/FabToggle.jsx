import PropTypes from 'prop-types';

/** Restrained launcher for optional in-product help. */
export default function FabToggle({ isOpen, setIsOpen }) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen((open) => !open)}
      className={`flex h-11 w-11 items-center justify-center rounded-pf-control border shadow-pf-card transition-colors ${isOpen ? 'border-pf-editorial-accent bg-pf-editorial-accent-soft text-pf-editorial-ink' : 'border-pf-editorial-line bg-pf-editorial-surface text-pf-editorial-ink hover:border-pf-editorial-muted hover:bg-pf-editorial-raised'}`}
      aria-label={isOpen ? 'Close help' : 'Open help'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 11.5a8.5 8.5 0 01-12.93 7.24L3 20l1.26-4.07A8.5 8.5 0 1121 11.5z" />
        </svg>
      )}
    </button>
  );
}

FabToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};
