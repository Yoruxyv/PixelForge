/**
 * Route-aware global page header.
 *
 * Selects header metadata based on the current location and displays the title,
 * subtitle, and supporting copy for top-level PixelForge pages.
 */

import { useLocation } from 'react-router-dom';
import Header from './Header';
import { headerConfig } from '../navigation/headerConfig';

/**
 * Render the route-specific global header content.
 *
 * @returns {JSX.Element} Rendered UI.
 */
export default function GlobalHeader() {
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  const currentConfig = headerConfig[location.pathname] || headerConfig['*'];

  return (
    <div className="mx-auto w-full max-w-pf-workspace px-pf-gutter pt-6">
      <Header {...currentConfig} />
    </div>
  );
}
