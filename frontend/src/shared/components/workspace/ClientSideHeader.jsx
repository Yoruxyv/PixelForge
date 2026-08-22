import PropTypes from 'prop-types';

/**
 * Identifies a browser-side workflow without competing with the image stage.
 * @returns {JSX.Element}
 */
export default function ClientSideHeader({
  category = 'Local workflow',
  title = 'Browser image tool',
  description = 'Process this image privately in your browser.',
}) {
  return (
    <header className="border-b border-pf-editorial-line pb-5">
      <div className="mb-3 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-pf-editorial-accent">
        <span className="h-px w-6 bg-pf-editorial-accent" aria-hidden="true" />
        {category} · client-side
      </div>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-pf-editorial-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-pf-editorial-muted">
        {description}
      </p>
    </header>
  );
}

ClientSideHeader.propTypes = {
  category: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
};
