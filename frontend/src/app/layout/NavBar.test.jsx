import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Navbar from './NavBar';

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
