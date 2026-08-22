import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { bytesToMB } from '@/shared/lib/fileUtils';

/**
 * Displays a styled summary card for a successfully staged file.
 * @param {Object} props - The component props.
 * @param {File} props.file - The active File object stored in state.
 * @returns {JSX.Element | null}
 */
export default function WorkspaceFileSummary({ file }) {
  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-3 flex flex-col"
      >
        <div className="flex items-center gap-3 overflow-hidden border-y border-pf-editorial-line py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pf-control border border-pf-editorial-line text-pf-editorial-accent">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-pf-editorial-ink">
              {file.name}
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-editorial-muted">
              {bytesToMB(file.size)} MB
            </span>
          </div>

          <div className="flex h-6 w-6 shrink-0 items-center justify-center text-pf-success" aria-label="Image ready">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

WorkspaceFileSummary.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    size: PropTypes.number,
  }),
};
