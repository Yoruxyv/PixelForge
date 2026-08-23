import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navbar from './NavBar';

const renderNavbar = ({
  theme = 'light',
  themePreference = 'system',
  onThemeChange = vi.fn(),
} = {}) =>
  render(
    <MemoryRouter>
      <Navbar
        theme={theme}
        themePreference={themePreference}
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

describe('Navbar theme menu', () => {
  const getThemeTrigger = () => getTrigger('System');

  it('opens on desktop mouse hover and stays open while entering the menu', () => {
    vi.useFakeTimers();
    renderNavbar();
    const trigger = getThemeTrigger();
    const region = getDropdownRegion(trigger);
    const menu = getMenu(trigger);

    hover(region);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    leave(region);
    hover(menu);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAttribute('aria-hidden', 'false');
  });

  it('closes after leaving the desktop theme trigger and menu region', () => {
    vi.useFakeTimers();
    renderNavbar();
    const trigger = getThemeTrigger();
    const region = getDropdownRegion(trigger);

    hover(region);
    leave(region);

    act(() => {
      vi.advanceTimersByTime(110);
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps click toggle and second-click close behavior', () => {
    renderNavbar();
    const trigger = getThemeTrigger();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the desktop theme trigger', () => {
    renderNavbar();
    const trigger = getThemeTrigger();

    fireEvent.click(trigger);
    const darkOption = screen.getByRole('button', { name: 'Dark', exact: true });
    darkOption.focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it.each([
    ['Light', 'light'],
    ['Dark', 'dark'],
    ['System', 'system'],
  ])('selects %s and closes the desktop theme menu', (label, value) => {
    const onThemeChange = vi.fn();
    renderNavbar({ onThemeChange });
    const trigger = getThemeTrigger();

    fireEvent.click(trigger);
    fireEvent.click(
      within(getMenu(trigger)).getByRole('button', {
        name: label,
        exact: true,
      }),
    );

    expect(onThemeChange).toHaveBeenCalledWith(value);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps mobile theme selection click-driven without hover', () => {
    const onThemeChange = vi.fn();
    renderNavbar({ onThemeChange });

    fireEvent.click(
      screen.getByRole('button', { name: 'Open tool menu' }),
    );

    const mobileNavigation = document.getElementById('mobile-navigation');
    const themeDetails = mobileNavigation.querySelector('details');
    const summary = themeDetails.querySelector('summary');

    fireEvent.click(summary);
    fireEvent.click(
      within(themeDetails).getByRole('button', { name: 'Dark' }),
    );

    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(themeDetails).not.toHaveAttribute('open');
  });
});
