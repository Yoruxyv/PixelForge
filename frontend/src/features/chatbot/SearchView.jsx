import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import BackButton from './BackButton';

/**
 * Renders search results view.
 * @param {Object} props - The component props.
 * @param {string} props.query - The current active search query string.
 * @param {Function} props.setQuery - Callback to update the search query state.
 * @param {Array<Object>} props.filteredResults - Array of questions matching the current search query.
 * @param {Function} props.handleBack - Callback to return to the previous view.
 * @param {Function} props.startAnswerFlow - Callback to initiate the answer animation sequence.
 * @returns {JSX.Element}
 */
export default function SearchView({ query, setQuery, filteredResults, handleBack, startAnswerFlow }) {
  let content;

  if (!query) {
    content = (
      <div className="border-y border-pf-editorial-line bg-pf-editorial-base p-3.5 text-sm text-pf-editorial-muted">
        Start typing to search FAQs…
      </div>
    );
  } else if (filteredResults.length === 0) {
    content = (
      <div className="border-y border-pf-editorial-line bg-pf-editorial-base p-4">
        <p className="text-sm text-pf-editorial-muted">No matches. Try:</p>
        <div className="flex gap-2 mt-2.5 flex-wrap">
          {['upscale', 'background', 'privacy'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-pf-control border border-pf-editorial-line bg-pf-editorial-surface px-2.5 py-1 text-xs text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-ink"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    content = filteredResults.map((item, idx) => (
      <motion.button
        key={`${item.q}-${idx}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        onClick={() => startAnswerFlow(item)}
        className="w-full border-b border-pf-editorial-line bg-pf-editorial-surface p-3.5 text-left transition-colors hover:bg-pf-editorial-raised"
      >
        <p className="mb-1 text-[11px] text-pf-editorial-muted">{item.icon} {item.category}</p>
        <p className="text-sm font-medium text-pf-editorial-ink">{item.q}</p>
      </motion.button>
    ));
  }

  return (
    <div className="space-y-2.5">
      <BackButton onClick={handleBack} />
      {content}
    </div>
  );
}

SearchView.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  filteredResults: PropTypes.arrayOf(
    PropTypes.shape({
      q: PropTypes.string.isRequired,
      category: PropTypes.string,
      icon: PropTypes.string,
    })
  ).isRequired,
  handleBack: PropTypes.func.isRequired,
  startAnswerFlow: PropTypes.func.isRequired,
};
