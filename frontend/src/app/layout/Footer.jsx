import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const footerLinkClass =
  'inline-flex min-h-9 items-center text-sm text-pf-editorial-muted transition-colors hover:text-pf-editorial-ink focus-visible:text-pf-editorial-ink';

const legalButtonClass =
  'min-h-11 text-left text-sm text-pf-editorial-muted transition-colors hover:text-pf-editorial-ink focus-visible:text-pf-editorial-ink';

/**
 * Renders the application footer containing copyright and legal links.
 * @param {Object} props - The component props.
 * @param {Function} props.openModal - Handler to open specific legal documents in the modal.
 * @returns {JSX.Element}
 */
export default function Footer({ openModal }) {
  return (
    <footer className="pf-theme-surface w-full border-t border-pf-editorial-line bg-pf-editorial-footer">
      <div className="mx-auto max-w-pf-workspace px-pf-gutter py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4 lg:grid-cols-12 lg:gap-x-10">
          <div className="col-span-2 sm:col-span-4 lg:col-span-5">
            <Link
              to="/"
              className="text-xl font-black tracking-[-0.03em] text-pf-editorial-ink"
            >
              PixelForge
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-pf-editorial-muted">
              An open-source image workstation for focused AI processing and
              browser-based editing.
            </p>
          </div>

          <nav aria-label="Product" className="lg:col-span-2">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-accent">
              Product
            </h2>
            <ul>
              <li>
                <Link to="/" className={footerLinkClass}>Home</Link>
              </li>
              <li>
                <a href="/#tools" className={footerLinkClass}>Tools ↑</a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="lg:col-span-3">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-accent">
              Legal
            </h2>
            <ul>
              {[
                ['privacy', 'Privacy'],
                ['terms', 'Terms'],
                ['security', 'Security'],
                ['storage', 'Cookies & Storage'],
              ].map(([type, label]) => (
                <li key={type}>
                  <button
                    type="button"
                    onClick={() => openModal(type)}
                    className={legalButtonClass}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Project" className="lg:col-span-2">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-accent">
              Project
            </h2>
            <ul>
              <li>
                <a
                  href="https://github.com/Yoruxyv/PixelForge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  GitHub <span className="ml-1" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Yoruxyv/PixelForge/blob/master/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  MIT License <span className="ml-1" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-9 border-t border-pf-editorial-line pr-16 pt-5 text-xs leading-5 text-pf-editorial-muted sm:pr-0">
          © 2026 PixelForge. AI features powered by Replicate.
        </p>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  openModal: PropTypes.func.isRequired,
};
