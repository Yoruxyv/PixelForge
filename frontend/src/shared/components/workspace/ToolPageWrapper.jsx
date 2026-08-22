import PropTypes from 'prop-types';

/**
 * Standard layout wrapper for tool pages to enforce consistent dimensions and spacing.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - The inner content to wrap.
 * @returns {JSX.Element} The ToolPageWrapper component.
 */
export default function ToolPageWrapper({ children }) {
  return (
    <section className="flex flex-1 bg-pf-editorial-base text-pf-editorial-ink">
      <section className="mx-auto w-full max-w-pf-workspace px-pf-gutter pb-16 pt-6 lg:pt-10">
        {children}
      </section>
    </section>
  );
}

ToolPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
