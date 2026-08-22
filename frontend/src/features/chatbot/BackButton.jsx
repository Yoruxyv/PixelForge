import PropTypes from 'prop-types';

/**
 * Renders reusable back button.
 * @param {Object} props - The component props.
 * @param {Function} props.onClick - Callback function triggered when the back button is clicked.
 * @returns {JSX.Element}
 */
export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-pf-editorial-muted transition-colors hover:text-pf-editorial-accent"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
