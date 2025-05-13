import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppContext, UserContext } from '../contexts.jsx';
import Signin from './Signin.jsx';

// ==================================================

vi.mock('react-router-dom');

// ==================================================

describe('Signin', () => {
  const formData = Object.freeze({
    username: 'user1',
    password: '12345',
  });

  const mockSigninUser = vi.fn();
  const mockAddAlert = vi.fn();
  const mockClearAlerts = vi.fn();
  const mockNavigate = vi.fn();

  const appContextValues = Object.freeze({
    addAlert: mockAddAlert,
    clearAlerts: mockClearAlerts,
  });
  const userContextValues = Object.freeze({ signinUser: mockSigninUser });

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders.', () => {
    render(<Signin />);
  });

  it('matches snapshot.', () => {
    const { asFragment } = render(<Signin />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the correct text.', () => {
    // Act
    const { getByText } = render(<Signin />);

    // Assert
    expect(getByText('Signin')).toBeVisible();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Password')).toBeVisible();
  });

  it('can update form data.', async () => {
    // Arrange
    const { user, usernameInput, passwordInput } = setupTest();

    // Act
    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);

    // Assert
    expect(usernameInput).toHaveValue(formData.username);
    expect(passwordInput).toHaveValue(formData.password);

    expect(mockSigninUser).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('can submit form data.', async () => {
    // Arrange
    const { user, usernameInput, passwordInput, submitBtn } = setupTest();

    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockSigninUser).toHaveBeenCalledExactlyOnceWith(formData);
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/document');
  });

  it('can cancel form data.', async () => {
    // Arrange
    const { user, cancelBtn } = setupTest();

    // Act
    await user.click(cancelBtn);

    // Assert
    expect(mockSigninUser).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays an alert if there is an issue signing in in the back-end.', async () => {
    // Arrange
    mockSigninUser.mockRejectedValue(['error']);

    const { user, usernameInput, passwordInput, submitBtn } = setupTest();

    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockSigninUser).toHaveBeenCalledExactlyOnceWith(formData);
    expect(mockAddAlert).toHaveBeenCalled();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --------------------------------------------------

  function setupTest() {
    const user = userEvent.setup();

    const { getByLabelText, getByText } = render(
      <AppContext.Provider value={appContextValues}>
        <UserContext.Provider value={userContextValues}>
          <Signin />
        </UserContext.Provider>
      </AppContext.Provider>
    );

    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const submitBtn = getByText('Submit');
    const cancelBtn = getByText('Cancel');

    return {
      user,
      usernameInput,
      passwordInput,
      submitBtn,
      cancelBtn,
    };
  }
});
