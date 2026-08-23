import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./layout/NavBar', () => ({
  default: () => <nav>Navigation</nav>,
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
