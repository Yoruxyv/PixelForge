import PropTypes from 'prop-types';

/**
 * Renders the application footer containing copyright and legal links.
 * @param {Object} props - The component props.
 * @param {Function} props.openModal - Handler to open specific legal documents in the modal.
 * @returns {JSX.Element}
 */
export default function Footer({ openModal }) {
  return (
    <footer className="w-full border-t border-pf-editorial-line bg-pf-editorial-footer">
      <div className="mx-auto flex max-w-pf-workspace flex-col items-center justify-between gap-4 px-pf-gutter py-5 text-sm text-pf-editorial-muted sm:flex-row">
        <p>© 2026 Pixel Forge. AI powered by Replicate.</p>

        <div className="flex items-center gap-5 font-medium">
          <button type="button" onClick={() => openModal('privacy')} className="transition-colors hover:text-pf-editorial-ink">Privacy</button>
          <button type="button" onClick={() => openModal('terms')} className="transition-colors hover:text-pf-editorial-ink">Terms</button>
          <button type="button" onClick={() => openModal('security')} className="transition-colors hover:text-pf-editorial-ink">Security</button>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  openModal: PropTypes.func.isRequired,
};
