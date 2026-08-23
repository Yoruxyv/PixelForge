import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navbar from './NavBar';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar
        theme="light"
        themePreference="system"
        onThemeChange={vi.fn()}
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
  it('selects a theme and closes the menu', () => {
    const onThemeChange = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <Navbar
          theme="light"
          themePreference="system"
          onThemeChange={onThemeChange}
        />
      </MemoryRouter>,
    );

    fireEvent.click(container.querySelector('summary'));
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));

    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });
});
