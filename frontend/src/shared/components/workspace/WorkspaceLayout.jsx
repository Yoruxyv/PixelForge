import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Core two-column layout for browser-side image workspaces.
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
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={`flex w-full ${minHeight} flex-col overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface`}
    >
      <div className="grid w-full flex-1 grid-cols-1 divide-y divide-pf-editorial-line lg:grid-cols-[minmax(19rem,0.68fr)_minmax(0,1.32fr)] lg:divide-x lg:divide-y-0">
        <aside className="flex flex-col gap-6 bg-pf-editorial-surface p-pf-panel text-pf-editorial-ink">
          {leftPanel}
        </aside>
        <section className="flex min-w-0 flex-col bg-pf-editorial-base p-pf-panel text-pf-editorial-ink">
          {rightPanel}
        </section>
      </div>
    </motion.div>
  );
}

WorkspaceLayout.propTypes = {
  leftPanel: PropTypes.node.isRequired,
  rightPanel: PropTypes.node.isRequired,
  minHeight: PropTypes.string,
};
