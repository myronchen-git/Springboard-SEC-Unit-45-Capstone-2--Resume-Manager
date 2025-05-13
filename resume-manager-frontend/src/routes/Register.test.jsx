import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppContext, UserContext } from '../contexts.jsx';
import Register from './Register.jsx';

// ==================================================

vi.mock('react-router-dom');

// ==================================================

describe('Register', () => {
  const formData = Object.freeze({
    username: 'user1',
    password: '12345',
  });

  const mockRegisterUser = vi.fn();
  const mockAddAlert = vi.fn();
  const mockClearAlerts = vi.fn();
  const mockNavigate = vi.fn();

  const appContextValues = Object.freeze({
    addAlert: mockAddAlert,
    clearAlerts: mockClearAlerts,
  });
  const userContextValues = Object.freeze({ registerUser: mockRegisterUser });

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders.', () => {
    render(<Register />);
  });

  it('matches snapshot.', () => {
    const { asFragment } = render(<Register />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the correct text.', () => {
    // Act
    const { getByText } = render(<Register />);

    // Assert
    expect(getByText('Register')).toBeVisible();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Password')).toBeVisible();
    expect(getByText('Repeat Password')).toBeVisible();
  });

  it('can update form data.', async () => {
    // Arrange
    const { user, usernameInput, passwordInput, repeatPasswordInput } =
      setupTest();

    // Act
    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);
    await user.click(repeatPasswordInput);
    await user.keyboard(formData.password);

    // Assert
    expect(usernameInput).toHaveValue(formData.username);
    expect(passwordInput).toHaveValue(formData.password);
    expect(repeatPasswordInput).toHaveValue(formData.password);

    expect(mockRegisterUser).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('can submit form data.', async () => {
    // Arrange
    const {
      user,
      usernameInput,
      passwordInput,
      repeatPasswordInput,
      submitBtn,
    } = setupTest();

    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);
    await user.click(repeatPasswordInput);
    await user.keyboard(formData.password);

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockRegisterUser).toHaveBeenCalledExactlyOnceWith(formData);
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
    expect(mockRegisterUser).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays an alert if password and repeated password do not match.', async () => {
    // Arrange
    const {
      user,
      usernameInput,
      passwordInput,
      repeatPasswordInput,
      submitBtn,
    } = setupTest();

    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);
    await user.click(repeatPasswordInput);
    await user.keyboard('otherPassword');

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockRegisterUser).not.toHaveBeenCalled();
    expect(mockAddAlert).toHaveBeenCalledOnce();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays an alert if there is an issue registering in the back-end.', async () => {
    // Arrange
    mockRegisterUser.mockRejectedValue(['error']);

    const {
      user,
      usernameInput,
      passwordInput,
      repeatPasswordInput,
      submitBtn,
    } = setupTest();

    await user.click(usernameInput);
    await user.keyboard(formData.username);
    await user.click(passwordInput);
    await user.keyboard(formData.password);
    await user.click(repeatPasswordInput);
    await user.keyboard(formData.password);

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockRegisterUser).toHaveBeenCalledExactlyOnceWith(formData);
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
          <Register />
        </UserContext.Provider>
      </AppContext.Provider>
    );

    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const repeatPasswordInput = getByLabelText('Repeat Password');
    const submitBtn = getByText('Submit');
    const cancelBtn = getByText('Cancel');

    return {
      user,
      usernameInput,
      passwordInput,
      repeatPasswordInput,
      submitBtn,
      cancelBtn,
    };
  }
});
