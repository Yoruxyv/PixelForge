import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { THEME_STORAGE_KEY } from './theme';

const navbarProps = vi.hoisted(() => ({ current: null }));

vi.mock('./layout/NavBar', () => ({
  default: (props) => {
    navbarProps.current = props;
    return <nav>Navigation</nav>;
  },
}));

vi.mock('./layout/GlobalHeader', () => ({
  default: () => <div>Global header</div>,
}));

vi.mock('./layout/Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('@/features/chatbot/FaqChatbotWidget', () => ({
  default: () => null,
}));

vi.mock('@/shared/components/common/AppModals', () => ({
  default: () => null,
}));

vi.mock('./routing/routes', () => ({
  default: [],
}));

vi.mock('./layout/legalModalData', () => ({
  legalModalData: {
    privacy: {
      title: 'Privacy',
      content: null,
    },
  },
}));

beforeEach(() => {
  localStorage.clear();
  navbarProps.current = null;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('App accessibility shell', () => {
  it('provides a keyboard skip link to the main content region', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: 'Skip to content' });
    const main = screen.getByRole('main');

    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });
});

describe('App theme behavior', () => {
  it('defaults to dark and persists a direct toggle', () => {
    render(<App />);

    expect(document.querySelector('[data-theme]')).toHaveAttribute(
      'data-theme',
      'dark',
    );

    navbarProps.current.onThemeChange('light');

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('migrates system once without subscribing to OS theme changes', () => {
    const addEventListener = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener,
      removeEventListener: vi.fn(),
    });
    localStorage.setItem(THEME_STORAGE_KEY, 'system');

    render(<App />);

    expect(document.querySelector('[data-theme]')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(addEventListener).not.toHaveBeenCalled();
  });
});
