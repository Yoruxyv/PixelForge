import PropTypes from 'prop-types';

/**
 * Toggles the configuration view between Text Watermarks and Image Logo Watermarks.
 * @param {Object} props - The component props.
 * @param {string} props.activeTab - The currently selected tab ('text' or 'image').
 * @param {Function} props.setActiveTab - State setter to switch the active tab.
 * @returns {JSX.Element}
 */
export default function WatermarkModeTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border border-pf-editorial-line bg-pf-editorial-base p-1">
      <button
        type="button"
        onClick={() => setActiveTab('text')}
        aria-pressed={activeTab === 'text'}
        className={`flex-1 rounded-pf-control px-3 py-2 text-xs font-semibold transition-colors ${
          activeTab === 'text' ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent' : 'text-pf-editorial-muted hover:text-pf-editorial-ink'
        }`}
      >
        Text Overlay
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('image')}
        aria-pressed={activeTab === 'image'}
        className={`flex-1 rounded-pf-control px-3 py-2 text-xs font-semibold transition-colors ${
          activeTab === 'image' ? 'bg-pf-editorial-accent-soft text-pf-editorial-accent' : 'text-pf-editorial-muted hover:text-pf-editorial-ink'
        }`}
      >
        Image Logo
      </button>
    </div>
  );
}

WatermarkModeTabs.propTypes = {
  activeTab: PropTypes.oneOf(['text', 'image']).isRequired,
  setActiveTab: PropTypes.func.isRequired,
};
