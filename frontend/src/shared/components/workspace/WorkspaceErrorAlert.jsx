import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Displays a consistent animated error alert block for workspace screens.
 * @param {Object} props - The component props.
 * @param {string|null} [props.error] - The error message string to display.
 * @param {string} [props.className='mb-2'] - Additional custom Tailwind classes.
 * @returns {JSX.Element | null}
 */
export default function WorkspaceErrorAlert({ error, className = 'mb-2' }) {
  return (
    <AnimatePresence>
      {error ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`${className} overflow-hidden`}
        >
          <div className="rounded-pf-control border border-pf-danger/40 bg-pf-danger-soft px-4 py-3 text-sm font-medium text-pf-danger" role="alert">
            {error}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

WorkspaceErrorAlert.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string,
};
