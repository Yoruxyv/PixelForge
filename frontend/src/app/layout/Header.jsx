import PropTypes from 'prop-types';

/** Compact identity block for the active image tool. */
export default function Header({ title, category, subtitle = '' }) {
  return (
    <header className="border-b border-pf-editorial-line pb-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-pf-editorial-accent">
        {category}
      </p>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end sm:gap-8">
        <h1 className="text-3xl font-black tracking-tight text-pf-editorial-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl text-sm leading-6 text-pf-editorial-muted sm:text-right">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
