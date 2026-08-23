import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import logoIcon from '@/assets/PixelForgeNav.png';
import { NavLinks } from '../navigation/navConfig';

const Icon = ({ d, className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

Icon.propTypes = { d: PropTypes.string.isRequired, className: PropTypes.string };

const ToolLink = ({ item, onClick, tabIndex }) => (
  <NavLink
    to={item.to}
    onClick={onClick}
    tabIndex={tabIndex}
    className={({ isActive }) =>
      `group flex items-center gap-3 rounded-pf-control px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? 'bg-pf-editorial-accent-soft text-pf-editorial-ink'
          : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
      }`
    }
  >
    <Icon d={item.icon} className="h-4.5 w-4.5 shrink-0" />
    <span className="min-w-0 flex-1 font-semibold">{item.label}</span>
    {item.isAi && <span className="text-[10px] font-bold uppercase tracking-wider">AI</span>}
  </NavLink>
);

ToolLink.propTypes = {
  item: PropTypes.shape({
    to: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isAi: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
};

const CLOSE_GRACE_MS = 100;

const NavDropdown = ({
  category,
  menuKey,
  isOpen,
  alignRight = false,
  onOpen,
  onScheduleClose,
  onToggle,
  onClose,
  triggerRef,
}) => {
  const menuId = `desktop-menu-${menuKey}`;
  const triggerId = `${menuId}-trigger`;

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse') {
      onOpen(menuKey);
    }
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType === 'mouse') {
      onScheduleClose();
    }
  };

  return (
    <div
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => onToggle(menuKey)}
        className="flex items-center gap-1.5 rounded-pf-control px-2 py-2 text-sm font-semibold text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink"
      >
        {category.title}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        id={menuId}
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        onPointerEnter={handlePointerEnter}
        className={`absolute top-full z-20 w-68 pt-2 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-[3px] opacity-0'
        } ${alignRight ? 'right-0' : 'left-0'}`}
      >
        <div className="rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface p-2 shadow-pf-float">
          {category.items.map((item) => (
            <ToolLink
              key={item.id}
              item={item}
              onClick={onClose}
              tabIndex={isOpen ? undefined : -1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

NavDropdown.propTypes = {
  category: PropTypes.object.isRequired,
  menuKey: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  alignRight: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
  onScheduleClose: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  triggerRef: PropTypes.func.isRequired,
};

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const ThemeGlyph = ({ value }) => {
  if (value === 'system') {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1" /><path d="M8 21h8M12 17v4" /></svg>;
  }

  if (value === 'dark') {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>;
  }

  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></svg>;
};

ThemeGlyph.propTypes = {
  value: PropTypes.oneOf(['system', 'dark', 'light']).isRequired,
};

const ThemeControl = ({
  theme,
  value,
  onChange,
  className = '',
  inline = false,
  isOpen = false,
  onOpen,
  onScheduleClose,
  onToggle,
  onClose,
  triggerRef,
}) => {
  const openedByHoverRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      openedByHoverRef.current = false;
    }
  }, [isOpen]);

  const selectedLabel =
    themeOptions.find((option) => option.value === value)?.label ?? 'System';

  const renderOptions = ({ desktop = false } = {}) =>
    themeOptions.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={(event) => {
          onChange(option.value);
          if (desktop) {
            onClose?.();
          } else {
            event.currentTarget.closest('details')?.removeAttribute('open');
          }
        }}
        aria-pressed={value === option.value}
        tabIndex={desktop && !isOpen ? -1 : undefined}
        className={`grid w-full grid-cols-[1rem_1.25rem_1fr] items-center gap-2 rounded-[6px] px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
          value === option.value
            ? 'bg-pf-editorial-accent-soft text-pf-editorial-ink'
            : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
        }`}
      >
        <span className="text-pf-editorial-accent" aria-hidden="true">
          {value === option.value ? '✓' : ''}
        </span>
        <ThemeGlyph value={option.value} />
        {option.label}
      </button>
    ));

  if (inline) {
    return (
      <details className={`group/theme relative ${className}`}>
        <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-pf-control px-2 py-2 text-xs font-bold uppercase tracking-[0.1em] text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <ThemeGlyph value={value === 'system' ? theme : value} />
            <span>{selectedLabel}</span>
          </span>
          <svg className="h-3 w-3 transition-transform group-open/theme:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
        </summary>
        <div className="relative mt-2 w-full rounded-[8px] border border-pf-editorial-line bg-pf-editorial-surface p-1.5">
          {renderOptions()}
        </div>
      </details>
    );
  }

  const menuKey = 'theme';
  const menuId = 'desktop-theme-menu';
  const triggerId = `${menuId}-trigger`;

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse') {
      if (!isOpen) {
        openedByHoverRef.current = true;
      }
      onOpen?.(menuKey);
    }
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType === 'mouse') {
      onScheduleClose?.();
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => {
          if (isOpen && openedByHoverRef.current) {
            openedByHoverRef.current = false;
            onOpen?.(menuKey);
            return;
          }
          onToggle?.(menuKey);
        }}
        className="flex items-center gap-2 rounded-pf-control px-2 py-2 text-xs font-bold uppercase tracking-[0.1em] text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink"
      >
        <ThemeGlyph value={value === 'system' ? theme : value} />
        <span>{selectedLabel}</span>
        <svg
          className={`h-3 w-3 transition-transform duration-150 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>

      <div
        id={menuId}
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') {
            openedByHoverRef.current = false;
            onOpen?.(menuKey);
          }
        }}
        className={`absolute right-0 top-full z-30 min-w-40 pt-2 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-[3px] opacity-0'
        }`}
      >
        <div className="rounded-[8px] border border-pf-editorial-line bg-pf-editorial-surface p-1.5 shadow-pf-float">
          {renderOptions({ desktop: true })}
        </div>
      </div>
    </div>
  );
};

ThemeControl.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  value: PropTypes.oneOf(['system', 'dark', 'light']).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  inline: PropTypes.bool,
  isOpen: PropTypes.bool,
  onOpen: PropTypes.func,
  onScheduleClose: PropTypes.func,
  onToggle: PropTypes.func,
  onClose: PropTypes.func,
  triggerRef: PropTypes.func,
};

/** Persistent product navigation for PixelForge tools. */
export default function Navbar({ theme, themePreference, onThemeChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const closeTimerRef = useRef(null);
  const desktopMenusRef = useRef(null);
  const triggerRefs = useRef({});
  const categories = Object.values(NavLinks).map((category) => ({
    ...category,
    menuKey: category.title.toLowerCase(),
  }));

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(
    (menuKey) => {
      clearCloseTimer();
      setActiveMenu(menuKey);
    },
    [clearCloseTimer],
  );

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setActiveMenu(null);
  }, [clearCloseTimer]);

  const toggleMenu = useCallback(
    (menuKey) => {
      clearCloseTimer();
      setActiveMenu((current) => (current === menuKey ? null : menuKey));
    },
    [clearCloseTimer],
  );

  const scheduleCloseMenu = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setActiveMenu(null);
    }, CLOSE_GRACE_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (activeMenu === null) {
      return undefined;
    }

    const handleOutsidePointerDown = (event) => {
      if (!desktopMenusRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      const trigger = triggerRefs.current[activeMenu];
      closeMenu();
      trigger?.focus();
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeMenu, closeMenu]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-pf-editorial-line bg-pf-editorial-base/95 backdrop-blur-lg" aria-label="Primary navigation">
      <div className="mx-auto flex h-16 max-w-pf-workspace items-center justify-between px-pf-gutter">
        <Link to="/" className="flex items-center gap-2.5" aria-label="PixelForge home">
          <img src={logoIcon} alt="" className="h-8 w-10 object-contain" />
          <span className="text-lg font-black tracking-tight text-pf-editorial-ink">PixelForge</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <div ref={desktopMenusRef} className="flex items-center gap-2">
            {categories.map((category, index) => (
              <NavDropdown
                key={category.menuKey}
                category={category}
                menuKey={category.menuKey}
                isOpen={activeMenu === category.menuKey}
                alignRight={index === categories.length - 1}
                onOpen={openMenu}
                onScheduleClose={scheduleCloseMenu}
                onToggle={toggleMenu}
                onClose={closeMenu}
                triggerRef={(node) => {
                  triggerRefs.current[category.menuKey] = node;
                }}
              />
            ))}
            <ThemeControl
              theme={theme}
              value={themePreference}
              onChange={onThemeChange}
              className="ml-2 border-l border-pf-editorial-line pl-4"
              isOpen={activeMenu === 'theme'}
              onOpen={openMenu}
              onScheduleClose={scheduleCloseMenu}
              onToggle={toggleMenu}
              onClose={closeMenu}
              triggerRef={(node) => {
                triggerRefs.current.theme = node;
              }}
            />
          </div>
          <a href="https://github.com/Yoruxyv/PixelForge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-pf-editorial-muted transition-colors hover:text-pf-editorial-ink">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .7a11.6 11.6 0 0 0-3.67 22.6c.58.1.8-.25.8-.56v-2.23c-3.25.7-3.94-1.38-3.94-1.38-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.04 1.8 2.74 1.28 3.41.98.1-.76.41-1.28.74-1.58-2.6-.3-5.33-1.3-5.33-5.74 0-1.27.45-2.3 1.2-3.12-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.19 1.2A11.1 11.1 0 0 1 12 6.27c.99 0 1.97.13 2.9.39 2.21-1.51 3.19-1.2 3.19-1.2.63 1.6.23 2.78.11 3.08.75.82 1.2 1.85 1.2 3.12 0 4.46-2.74 5.44-5.34 5.73.42.37.79 1.09.79 2.2v3.15c0 .31.21.67.8.56A11.6 11.6 0 0 0 12 .7Z" />
            </svg>
            GitHub
          </a>
        </div>

        <button
          type="button"
          className="rounded-pf-control p-2 text-pf-editorial-muted transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-ink lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMobileMenuOpen ? 'Close tool menu' : 'Open tool menu'}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-pf-editorial-line bg-pf-editorial-base px-pf-gutter py-5 lg:hidden">
          <div className="mx-auto grid max-w-pf-workspace gap-6 sm:grid-cols-2">
            {categories.map((category) => (
              <section key={category.title} aria-labelledby={`mobile-${category.title}`}>
                <h2 id={`mobile-${category.title}`} className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-pf-editorial-muted">{category.title}</h2>
                {category.items.map((item) => <ToolLink key={item.id} item={item} onClick={() => setIsMobileMenuOpen(false)} />)}
              </section>
            ))}
          </div>
          <ThemeControl theme={theme} value={themePreference} onChange={onThemeChange} className="mt-5 border-t border-pf-editorial-line px-3 pt-5" inline />
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  themePreference: PropTypes.oneOf(['system', 'dark', 'light']).isRequired,
  onThemeChange: PropTypes.func.isRequired,
};
