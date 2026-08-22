import PropTypes from 'prop-types';

/**
 * Standard layout wrapper for tool pages to enforce consistent dimensions and spacing.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - The inner content to wrap.
 * @returns {JSX.Element} The ToolPageWrapper component.
 */
export default function ToolPageWrapper({ children }) {
  return (
    <section className="mx-auto w-full max-w-pf-workspace flex-1 px-pf-gutter pb-16 pt-5">
      {children}
    </section>
  );
}

ToolPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
