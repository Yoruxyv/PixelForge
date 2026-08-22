import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Core two-column layout component with staggered framer-motion entry animations.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.leftPanel - The entire content for the left column.
 * @param {React.ReactNode} props.rightPanel - The entire content for the right column.
 * @param {string} [props.minHeight='min-h-96'] - Minimum height CSS class for the container.
 * @returns {JSX.Element}
 */
export default function WorkspaceLayout({ leftPanel, rightPanel, minHeight = 'min-h-96' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex w-full ${minHeight} flex-col overflow-hidden rounded-pf-card border border-pf-line-inverse bg-pf-canvas`}
    >
      <div className="grid w-full flex-1 grid-cols-1 divide-y divide-pf-line-strong lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:divide-x lg:divide-y-0">
        <div className="flex flex-col gap-6 bg-pf-canvas p-pf-panel text-pf-ink">
          {leftPanel}
        </div>
        <div className="flex flex-col bg-pf-surface-subtle p-pf-panel text-pf-ink">
          {rightPanel}
        </div>
      </div>
    </motion.div>
  );
}

WorkspaceLayout.propTypes = {
  leftPanel: PropTypes.node.isRequired,
  rightPanel: PropTypes.node.isRequired,
  minHeight: PropTypes.string,
};
