import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import HomePage from './HomePage.jsx';

// ==================================================

describe('HomePage', () => {
  it('renders.', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  });

  it('matches snapshot.', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the correct text.', () => {
    // Act
    const { getByText } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(getByText('Resume Manager')).toBeVisible();
    expect(getByText('Register', { exact: false })).toBeVisible();
    expect(getByText('Sign In', { exact: false })).toBeVisible();
  });
});
