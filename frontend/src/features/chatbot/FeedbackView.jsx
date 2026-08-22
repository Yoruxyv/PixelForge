import FeedbackForm from '@/features/feedback';
import PropTypes from 'prop-types';

/**
 * Renders the feedback view with a back button and form.
 * @param {Object} props - Component props.
 * @param {Function} props.handleBack - Function to navigate back to the home view.
 */
export default function FeedbackView({ handleBack }) {
  return (
    <div className="flex h-full flex-col text-pf-editorial-ink animate-fade-in">
      <button 
        onClick={handleBack}
        className="mb-4 flex w-fit items-center gap-1.5 text-sm font-medium text-pf-editorial-muted transition-colors hover:text-pf-editorial-accent"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>

      <div className="mb-4">
        <h3 className="mb-1 text-lg font-bold">Contact support</h3>
        <p className="text-xs leading-relaxed text-pf-editorial-muted">
          Have a bug to report or a feature request? Send us a message directly.
        </p>
      </div>

      <div className="border-t border-pf-editorial-line pt-4">
        <FeedbackForm />
      </div>
    </div>
  );
}


FeedbackView.propTypes = {  
    handleBack: PropTypes.func.isRequired,
};
