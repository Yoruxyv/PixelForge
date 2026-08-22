import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Renders chatbot home view.
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.FAQ_DATA - Array containing FAQ categories and questions.
 * @param {Array<Object>} props.QUICK_ACTIONS - Array of quick action objects containing id, text, and type.
 * @param {Object} props.CAT_ACCENT - Mapping of category IDs to their specific styling configuration.
 * @param {Function} props.openFromQuickAction - Callback executed when a quick action is clicked.
 * @param {Function} props.openCategory - Callback executed when an FAQ category is clicked.
 * @returns {JSX.Element}
 */
export default function HomeView({ FAQ_DATA, QUICK_ACTIONS, CAT_ACCENT, openFromQuickAction, openCategory }) {
  return (
    <div className="space-y-5">
      <div className="border-b border-pf-editorial-line pb-4">
        <p className="text-sm font-semibold text-pf-editorial-ink">How can we help?</p>
        <p className="mt-1 max-w-72 text-xs leading-relaxed text-pf-editorial-muted">
          Need help with PixelForge? Ask anything, pick a topic, or use a quick action below.
        </p>
      </div>

      <div>
        <p className="mb-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-pf-editorial-muted">Quick actions</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => openFromQuickAction(action)}
              className="rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-2.5 py-1.5 text-left text-[11px] font-medium text-pf-editorial-muted transition-colors hover:border-pf-editorial-accent hover:text-pf-editorial-ink active:bg-pf-editorial-accent-soft"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border-y border-pf-editorial-line bg-pf-editorial-line">
        {FAQ_DATA.map((cat, i) => {
          const accent = CAT_ACCENT[cat.id] ?? CAT_ACCENT['getting-started'];
          return (
            <motion.button
              key={cat.id}
              onClick={() => openCategory(cat)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-pf-editorial-surface p-3 text-left transition-colors hover:bg-pf-editorial-raised active:bg-pf-editorial-accent-soft"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pf-control border border-pf-editorial-line text-sm grayscale-[35%]"
                  style={{ background: accent.bg }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-pf-editorial-ink">{cat.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-pf-editorial-muted">{cat.description}</p>
                </div>
                <span className="text-pf-editorial-muted" aria-hidden="true">→</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

HomeView.propTypes = {
  FAQ_DATA: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  QUICK_ACTIONS: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      target: PropTypes.string,
    })
  ).isRequired,
  CAT_ACCENT: PropTypes.objectOf(
    PropTypes.shape({
      bg: PropTypes.string.isRequired,
      glow: PropTypes.string.isRequired,
    })
  ).isRequired,
  openFromQuickAction: PropTypes.func.isRequired,
  openCategory: PropTypes.func.isRequired,
};
