import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import AppModals from './AppModals';

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;
const originalMatchMedia = window.matchMedia;

const setReducedMotion = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

afterAll(() => {
  if (originalShowModal) {
    HTMLDialogElement.prototype.showModal = originalShowModal;
  } else {
    delete HTMLDialogElement.prototype.showModal;
  }

  if (originalClose) {
    HTMLDialogElement.prototype.close = originalClose;
  } else {
    delete HTMLDialogElement.prototype.close;
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: originalMatchMedia,
  });
});

describe('AppModals', () => {
  it('keeps the click-only backdrop out of the keyboard tab order', () => {
    setReducedMotion(false);

    render(
      <AppModals isOpen onClose={vi.fn()} title="Privacy">
        <p>Legal content</p>
      </AppModals>,
    );

    const closeButtons = screen.getAllByRole('button', {
      name: 'Close dialog',
    });

    expect(closeButtons[0]).toHaveAttribute('tabindex', '-1');
    expect(closeButtons[1]).not.toHaveAttribute('tabindex', '-1');
  });

  it('closes immediately when reduced motion is requested', () => {
    setReducedMotion(true);

    const { container, rerender } = render(
      <AppModals isOpen onClose={vi.fn()} title="Terms">
        <p>Legal content</p>
      </AppModals>,
    );

    const dialog = container.querySelector('dialog');
    expect(dialog).toHaveAttribute('open');

    rerender(
      <AppModals isOpen={false} onClose={vi.fn()} title="Terms">
        <p>Legal content</p>
      </AppModals>,
    );

    expect(dialog).not.toHaveAttribute('open');
  });
});
