/**
 * Shared style tokens for the FAQ chatbot UI.
 *
 * Centralizes repeated Tailwind class groups so chatbot components remain easier
 * to read and update.
 */

export const WIDGET_STYLES = `
  .fw { font-family: var(--font-sans); }
  .fw-display { font-family: var(--font-display); }

  .fw-scroll::-webkit-scrollbar { width: 3px; }
  .fw-scroll::-webkit-scrollbar-track { background: transparent; }
  .fw-scroll::-webkit-scrollbar-thumb { background: var(--color-pf-editorial-line); }
  .fw-scroll:hover::-webkit-scrollbar-thumb { background: var(--color-pf-editorial-accent); }

  @keyframes fw-dot-pop {
    0%, 100% { transform: translateY(0px); opacity: 0.6; }
    50% { transform: translateY(-5px); opacity: 1; }
  }

  .fw-dot { animation: fw-dot-pop 0.85s ease-in-out infinite; }
  .fw-dot:nth-child(2) { animation-delay: 0.17s; }
  .fw-dot:nth-child(3) { animation-delay: 0.34s; }

`;
