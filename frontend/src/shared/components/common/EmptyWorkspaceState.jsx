/**
 * Reusable empty-state component for tool workspaces.
 *
 * Displays a consistent placeholder when no image or result is currently active
 * inside a workspace panel.
 */

/**
 * Render a reusable empty state for workspace panels.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function EmptyWorkspaceState() {
  return (
    <div className="px-4 text-center opacity-60">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pf-control border border-current/20 bg-current/5">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium">Preview appears here</p>
    </div>
  );
}
