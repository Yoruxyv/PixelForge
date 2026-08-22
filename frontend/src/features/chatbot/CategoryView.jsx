import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import BackButton from './BackButton';

/**
 * Renders category questions view.
 * @param {Object} props - The component props.
 * @param {Object} props.activeCategory - The currently selected category object.
 * @param {string} props.activeCategory.id - Category ID.
 * @param {string} props.activeCategory.title - Category title.
 * @param {string} props.activeCategory.description - Category description.
 * @param {string} props.activeCategory.icon - Category icon.
 * @param {Array<Object>} props.activeCategory.questions - Array of questions belonging to this category.
 * @param {Object} props.CAT_ACCENT - Mapping of category IDs to their specific styling configuration.
 * @param {Function} props.handleBack - Callback to return to the home view.
 * @param {Function} props.startAnswerFlow - Callback to initiate the answer animation sequence.
 * @returns {JSX.Element}
 */
export default function CategoryView({ activeCategory, CAT_ACCENT, handleBack, startAnswerFlow }) {
  const accent = CAT_ACCENT[activeCategory.id] ?? CAT_ACCENT['getting-started'];

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} />

      <div className="flex items-center gap-3 border-b border-pf-editorial-line pb-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pf-control border border-pf-editorial-line text-sm grayscale-[35%]"
          style={{ background: accent.bg }}
        >
          {activeCategory.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-pf-editorial-ink">{activeCategory.title}</p>
          <p className="mt-0.5 text-[11px] text-pf-editorial-muted">{activeCategory.description}</p>
        </div>
      </div>

      <div className="overflow-hidden border-y border-pf-editorial-line bg-pf-editorial-line">
        {activeCategory.questions.map((qa, idx) => (
          <motion.button
            key={qa.id || qa.q}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, ease: 'easeOut' }}
            onClick={() => startAnswerFlow(qa)}
            className="flex w-full items-center justify-between gap-3 bg-pf-editorial-surface p-3.5 text-left text-sm text-pf-editorial-ink transition-colors hover:bg-pf-editorial-raised"
          >
            {qa.q}<span className="text-pf-editorial-muted" aria-hidden="true">→</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

CategoryView.propTypes = {
  activeCategory: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        q: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  CAT_ACCENT: PropTypes.objectOf(
    PropTypes.shape({
      bg: PropTypes.string.isRequired,
      glow: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleBack: PropTypes.func.isRequired,
  startAnswerFlow: PropTypes.func.isRequired,
};
