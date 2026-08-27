import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navbar from './NavBar';

const renderNavbar = ({
  theme = 'dark',
  onThemeChange = vi.fn(),
} = {}) =>
  render(
    <MemoryRouter>
      <Navbar
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </MemoryRouter>,
  );

const getTrigger = (name) => screen.getByRole('button', { name });

const getMenu = (trigger) =>
  document.getElementById(trigger.getAttribute('aria-controls'));

const getDropdownRegion = (trigger) => trigger.parentElement;

const hover = (element) =>
  fireEvent.pointerEnter(element, { pointerType: 'mouse' });

const leave = (element) =>
  fireEvent.pointerLeave(element, { pointerType: 'mouse' });

afterEach(() => {
  vi.useRealTimers();
});

describe('Navbar desktop dropdown interactions', () => {
  it('opens a dropdown on mouse hover', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    hover(getDropdownRegion(aiTrigger));

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(getMenu(aiTrigger)).toHaveAttribute('aria-hidden', 'false');
  });

  it('keeps the dropdown open when the pointer enters it during the close grace period', () => {
    vi.useFakeTimers();
    renderNavbar();
    const aiTrigger = getTrigger('AI');
    const region = getDropdownRegion(aiTrigger);
    const menu = getMenu(aiTrigger);

    hover(region);
    leave(region);
    hover(menu);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes after leaving the trigger and dropdown region', () => {
    vi.useFakeTimers();
    renderNavbar();
    const aiTrigger = getTrigger('AI');
    const region = getDropdownRegion(aiTrigger);

    hover(region);
    leave(region);

    act(() => {
      vi.advanceTimersByTime(110);
    });

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a dropdown when its trigger is clicked', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    fireEvent.click(aiTrigger);

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open dropdown when the same trigger is clicked again', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    fireEvent.click(aiTrigger);
    fireEvent.click(aiTrigger);

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('switches directly to another dropdown when its trigger is hovered', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');
    const editTrigger = getTrigger('Edit');

    hover(getDropdownRegion(aiTrigger));
    hover(getDropdownRegion(editTrigger));

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(editTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the active dropdown on an outside pointer press', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    fireEvent.click(aiTrigger);
    fireEvent.pointerDown(document.body);

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the active trigger', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    fireEvent.click(aiTrigger);
    const firstItem = screen.getByRole('link', { name: /Upscale Image/ });
    firstItem.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(aiTrigger).toHaveFocus();
  });

  it('toggles through native Enter and Space button activation', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    aiTrigger.focus();

    fireEvent.keyDown(aiTrigger, { key: 'Enter' });
    fireEvent.click(aiTrigger, { detail: 0 });
    expect(aiTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(aiTrigger, { key: ' ' });
    fireEvent.keyUp(aiTrigger, { key: ' ' });
    fireEvent.click(aiTrigger, { detail: 0 });
    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the active dropdown when a menu item is activated', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');

    fireEvent.click(aiTrigger);
    fireEvent.click(screen.getByRole('link', { name: /Upscale Image/ }));

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps aria-expanded synchronized with the real active menu', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');
    const optimizeTrigger = getTrigger('Optimize');

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(optimizeTrigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(aiTrigger);

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(optimizeTrigger).toHaveAttribute('aria-expanded', 'false');

    hover(getDropdownRegion(optimizeTrigger));

    expect(aiTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(optimizeTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps closed dropdown items out of the tab order', () => {
    renderNavbar();
    const aiTrigger = getTrigger('AI');
    const menu = getMenu(aiTrigger);
    const firstItem = menu.querySelector('a');

    expect(firstItem).toHaveAttribute('tabindex', '-1');

    fireEvent.click(aiTrigger);

    expect(firstItem).not.toHaveAttribute('tabindex');
  });
});

describe('Navbar mobile navigation', () => {
  it('opens and closes with synchronized accessible state', () => {
    renderNavbar();

    const openButton = getTrigger('Open tool menu');
    const mobileNavigation = document.getElementById('mobile-navigation');

    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
    expect(mobileNavigation).toHaveAttribute('inert');

    fireEvent.click(openButton);

    const closeButton = getTrigger('Close tool menu');
    expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileNavigation).toHaveClass('is-open');
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'false');
    expect(mobileNavigation).not.toHaveAttribute('inert');

    fireEvent.click(closeButton);

    expect(getTrigger('Open tool menu')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(mobileNavigation).not.toHaveClass('is-open');
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
    expect(mobileNavigation).toHaveAttribute('inert');
  });

  it('closes when a mobile navigation destination is activated', () => {
    renderNavbar();
    fireEvent.click(getTrigger('Open tool menu'));

    const mobileNavigation = document.getElementById('mobile-navigation');
    fireEvent.click(
      within(mobileNavigation).getByRole('link', {
        name: 'Color Palette',
        exact: true,
      }),
    );

    expect(getTrigger('Open tool menu')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
  });

  it('stays open after a rapid open, close, and open sequence', () => {
    renderNavbar();

    fireEvent.click(getTrigger('Open tool menu'));
    fireEvent.click(getTrigger('Close tool menu'));
    fireEvent.click(getTrigger('Open tool menu'));

    expect(getTrigger('Close tool menu')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.getElementById('mobile-navigation')).toHaveClass('is-open');
  });
});

describe('Navbar theme toggle', () => {
  it('shows the dark state and toggles directly to light', () => {
    const onThemeChange = vi.fn();
    renderNavbar({ onThemeChange });

    const toggle = getTrigger('Switch to light theme');
    expect(toggle).toHaveTextContent('Dark');
    expect(toggle.querySelectorAll('[data-theme-icon]')).toHaveLength(2);
    expect(toggle.querySelector('[data-theme-icon="moon"]')).toHaveClass(
      'is-visible',
    );
    expect(toggle.querySelector('[data-theme-icon="sun"]')).not.toHaveClass(
      'is-visible',
    );
    expect(toggle.querySelector('[data-theme-icon="moon"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(toggle.querySelector('[data-theme-icon="sun"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    fireEvent.click(toggle);

    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  it('shows the light state and toggles directly to dark', () => {
    const onThemeChange = vi.fn();
    renderNavbar({ theme: 'light', onThemeChange });

    const toggle = getTrigger('Switch to dark theme');
    expect(toggle).toHaveTextContent('Light');
    expect(toggle.querySelector('[data-theme-icon="sun"]')).toHaveClass(
      'is-visible',
    );
    expect(toggle.querySelector('[data-theme-icon="moon"]')).not.toHaveClass(
      'is-visible',
    );

    fireEvent.click(toggle);

    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('uses a native button without theme-menu ARIA or System UI', () => {
    renderNavbar();

    const toggle = getTrigger('Switch to light theme');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).not.toHaveAttribute('aria-expanded');
    expect(toggle).not.toHaveAttribute('aria-haspopup');
    expect(toggle).not.toHaveAttribute('aria-controls');
    expect(document.getElementById('desktop-theme-menu')).not.toBeInTheDocument();
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  it('uses the same direct toggle in mobile navigation', () => {
    const onThemeChange = vi.fn();
    renderNavbar({ onThemeChange });

    fireEvent.click(
      screen.getByRole('button', { name: 'Open tool menu' }),
    );

    const mobileNavigation = document.getElementById('mobile-navigation');
    const toggle = within(mobileNavigation).getByRole('button', {
      name: 'Switch to light theme',
    });

    expect(mobileNavigation.querySelector('details')).not.toBeInTheDocument();
    fireEvent.click(toggle);

    expect(onThemeChange).toHaveBeenCalledWith('light');
  });
});
