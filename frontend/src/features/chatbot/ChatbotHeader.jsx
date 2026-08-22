import PropTypes from 'prop-types';

/**
 * Renders chatbot header with title, avatar, close, and search.
 * @param {Object} props - The component props.
 * @param {Object} props.img - Object containing image assets.
 * @param {string} props.query - The current search query string.
 * @param {Function} props.setQuery - Callback to update the search query.
 * @param {Function} props.setView - Callback to change the active view string (e.g., 'home', 'search').
 * @param {boolean} props.searchFocused - Whether the search input is currently focused.
 * @param {Function} props.setSearchFocused - Callback to update the search input focus state.
 * @param {Function} props.handleClose - Callback to close the chatbot modal.
 * @returns {JSX.Element}
 */
export default function ChatbotHeader({
  img,
  query,
  setQuery,
  setView,
  searchFocused,
  setSearchFocused,
  handleClose,
}) {
  return (
    <header className="relative shrink-0 border-b border-pf-editorial-line bg-pf-editorial-base p-4">
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <img
              src={img.chatbotIcon}
              alt="PixelForge Assistant"
              className="h-9 w-9 rounded-pf-control border border-pf-editorial-line object-cover opacity-80 saturate-50"
            />
          </div>
          <div className="min-w-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-pf-editorial-accent">Help desk</p>
            <h2 className="fw-display truncate text-sm font-bold leading-tight tracking-tight text-pf-editorial-ink">
              PixelForge Assistant
            </h2>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pf-control border border-pf-editorial-line bg-transparent text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink"
          aria-label="Close chatbot"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setSearchFocused(true);
            setView('search');
          }}
          onBlur={() => setSearchFocused(false)}
          placeholder="Ask anything about PixelForge..."
          className={`w-full rounded-pf-control border bg-pf-editorial-surface py-2.5 pl-10 pr-14 text-sm text-pf-editorial-ink outline-none transition-colors placeholder:text-pf-editorial-muted ${searchFocused ? 'border-pf-editorial-accent' : 'border-pf-editorial-line'}`}
        />
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pf-editorial-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.85-4.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setView('home');
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 border-l border-pf-editorial-line px-2.5 py-1 text-[10px] font-semibold text-pf-editorial-muted transition-colors hover:text-pf-editorial-ink"
          >
            Clear
          </button>
        )}
      </div>
    </header>
  );
}

ChatbotHeader.propTypes = {
  img: PropTypes.shape({
    chatbotIcon: PropTypes.string.isRequired,
  }).isRequired,
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  setView: PropTypes.func.isRequired,
  searchFocused: PropTypes.bool.isRequired,
  setSearchFocused: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};
