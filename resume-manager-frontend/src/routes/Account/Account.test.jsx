import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppContext, UserContext } from '../../contexts.jsx';
import Account from './Account.jsx';

// ==================================================

vi.mock('react-router-dom');

// ==================================================

describe('Account', () => {
  const formData = Object.freeze({
    oldPassword: 'old',
    newPassword: 'new',
  });

  const mockUpdateAccount = vi.fn();
  const mockAddAlert = vi.fn();
  const mockClearAlerts = vi.fn();
  const mockNavigate = vi.fn();

  const appContextValues = Object.freeze({
    addAlert: mockAddAlert,
    clearAlerts: mockClearAlerts,
  });
  const userContextValues = Object.freeze({ updateAccount: mockUpdateAccount });

  beforeEach(() => {
    vi.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders.', () => {
    render(<Account />);
  });

  it('matches snapshot.', () => {
    const { asFragment } = render(<Account />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the correct text.', () => {
    // Act
    const { getByText } = render(<Account />);

    // Assert
    expect(getByText('Account')).toBeVisible();
    expect(getByText('Old Password')).toBeVisible();
    expect(getByText('New Password')).toBeVisible();
    expect(getByText('Repeat New Password')).toBeVisible();
  });

  it('can update form data.', async () => {
    // Arrange
    const { user, oldPasswordInput, newPasswordInput, repeatNewPasswordInput } =
      setupTest();

    // Act
    await user.click(oldPasswordInput);
    await user.keyboard(formData.oldPassword);
    await user.click(newPasswordInput);
    await user.keyboard(formData.newPassword);
    await user.click(repeatNewPasswordInput);
    await user.keyboard(formData.newPassword);

    // Assert
    expect(oldPasswordInput).toHaveValue(formData.oldPassword);
    expect(newPasswordInput).toHaveValue(formData.newPassword);
    expect(repeatNewPasswordInput).toHaveValue(formData.newPassword);

    expect(mockUpdateAccount).not.toHaveBeenCalled();
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('can submit form data.', async () => {
    // Arrange
    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      repeatNewPasswordInput,
      submitBtn,
    } = setupTest();

    await user.click(oldPasswordInput);
    await user.keyboard(formData.oldPassword);
    await user.click(newPasswordInput);
    await user.keyboard(formData.newPassword);
    await user.click(repeatNewPasswordInput);
    await user.keyboard(formData.newPassword);

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockUpdateAccount).toHaveBeenCalledExactlyOnceWith(formData);
    expect(mockAddAlert).not.toHaveBeenCalled();
    expect(mockClearAlerts).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/document');
  });

  it('displays an alert if password and repeated password do not match.', async () => {
    // Arrange
    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      repeatNewPasswordInput,
      submitBtn,
    } = setupTest();

    await user.click(oldPasswordInput);
    await user.keyboard(formData.oldPassword);
    await user.click(newPasswordInput);
    await user.keyboard(formData.newPassword);
    await user.click(repeatNewPasswordInput);
    await user.keyboard('otherPassword');

    // Act
    await user.click(submitBtn);

    // Assert
    expect(mockUpdateAccount).not.toHaveBeenCalled();
    expect(mockAddAlert).toHaveBeenCalledOnce();
    expect(mockClearAlerts).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it(
    'displays an alert if there is an issue when ' +
      'updating the account in the back-end.',
    async () => {
      // Arrange
      mockUpdateAccount.mockRejectedValue(['error']);

      const {
        user,
        oldPasswordInput,
        newPasswordInput,
        repeatNewPasswordInput,
        submitBtn,
      } = setupTest();

      await user.click(oldPasswordInput);
      await user.keyboard(formData.oldPassword);
      await user.click(newPasswordInput);
      await user.keyboard(formData.newPassword);
      await user.click(repeatNewPasswordInput);
      await user.keyboard(formData.newPassword);

      // Act
      await user.click(submitBtn);

      // Assert
      expect(mockUpdateAccount).toHaveBeenCalledExactlyOnceWith(formData);
      expect(mockAddAlert).toHaveBeenCalled();
      expect(mockClearAlerts).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  // --------------------------------------------------

  function setupTest() {
    const user = userEvent.setup();

    const { getByLabelText, getByText } = render(
      <AppContext.Provider value={appContextValues}>
        <UserContext.Provider value={userContextValues}>
          <Account />
        </UserContext.Provider>
      </AppContext.Provider>
    );

    const oldPasswordInput = getByLabelText('Old Password');
    const newPasswordInput = getByLabelText('New Password');
    const repeatNewPasswordInput = getByLabelText('Repeat New Password');
    const submitBtn = getByText('Submit');

    return {
      user,
      oldPasswordInput,
      newPasswordInput,
      repeatNewPasswordInput,
      submitBtn,
    };
  }
});
