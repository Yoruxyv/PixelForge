import PropTypes from 'prop-types';
import WorkspaceLayout from './WorkspaceLayout';

/**
 * Shell component that structures the left and right panels of a tool workspace.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.leftHeader - The header content for the left panel.
 * @param {React.ReactNode} props.leftBody - The main body content for the left panel.
 * @param {React.ReactNode} props.leftFooter - The footer content for the left panel.
 * @param {React.ReactNode} props.rightHeader - The header content for the right panel.
 * @param {React.ReactNode} props.rightBody - The main body content for the right panel.
 * @param {string} [props.minHeight='min-h-96'] - Minimum height CSS class for the workspace.
 * @param {string} [props.rightBodyMinHeight='min-h-80'] - Minimum height CSS class for the preview body.
 * @param {boolean} [props.desktopViewportFit=false] - Keep loaded desktop actions visible while allowing one controls scroller.
 * @returns {JSX.Element}
 */
export default function ToolWorkspaceShell({
  leftHeader,
  leftBody,
  leftFooter,
  rightHeader,
  rightBody,
  minHeight = 'min-h-96',
  rightBodyMinHeight = 'min-h-80',
  desktopViewportFit = false,
}) {
  const desktopPanelClass = desktopViewportFit ? 'lg:min-h-0' : '';
  const desktopControlsClass = desktopViewportFit
    ? 'lg:overflow-x-hidden lg:overflow-y-auto lg:pr-2'
    : '';

  return (
    <WorkspaceLayout
      minHeight={minHeight}
      desktopViewportFit={desktopViewportFit}
      leftPanel={
        <div className={`flex h-full flex-col ${desktopPanelClass}`}>
          <div className="mb-6 shrink-0">{leftHeader}</div>
          <div
            className={`min-h-0 flex-1 ${desktopControlsClass}`}
          >
            {leftBody}
          </div>
          <div className="mt-auto shrink-0 border-t border-pf-editorial-line pt-5">
            {leftFooter}
          </div>
        </div>
      }
      rightPanel={
        <div
          className={`flex h-full w-full flex-col ${desktopPanelClass}`}
        >
          <div className="mb-4 shrink-0">{rightHeader}</div>
          <div
            className={`relative flex ${rightBodyMinHeight} flex-1 items-center justify-center overflow-hidden rounded-pf-control border border-pf-editorial-line bg-pf-editorial-footer p-2 text-pf-editorial-ink`}
          >
            {rightBody}
          </div>
        </div>
      }
    />
  );
}

ToolWorkspaceShell.propTypes = {
  leftHeader: PropTypes.node.isRequired,
  leftBody: PropTypes.node.isRequired,
  leftFooter: PropTypes.node.isRequired,
  rightHeader: PropTypes.node.isRequired,
  rightBody: PropTypes.node.isRequired,
  minHeight: PropTypes.string,
  rightBodyMinHeight: PropTypes.string,
  desktopViewportFit: PropTypes.bool,
};
