import axios from 'axios';
import {PASSWORD_RESET_API_URL_VERIFY_OTP} from '@/services/api/apiConfig';

// Defines the API endpoint for password reset verification.
const VERIFY_PASSWORD_RESET_API_URL = PASSWORD_RESET_API_URL_VERIFY_OTP;

// Defines the structure of the data to be sent in the request body.
type PasswordResetVerificationRequest = {
  email: string;
  otp: string;
  secret: string;
  newPassword: string;
};

/**
 * Verifies the OTP and completes the password reset process.
 * It retrieves the user's email, the secret from the initial request,
 * and the new password from local storage to send to the backend.
 * @param {string} otp - The 6-digit OTP entered by the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the verification is successful.
 * @throws {Error} Throws an error if any data is missing or if the API request fails.
 */
export const verifyPasswordResetOtp = async (otp: string): Promise<boolean> => {
  try {
    // Retrieve the necessary data from local storage.
    const storedData = localStorage.getItem('passwordResetData');
    if (!storedData) {
      throw new Error("Password reset data not found in local storage. Please restart the process.");
    }
    const { email, secret, newPassword } = JSON.parse(storedData);

    // Check if all required data is present.
    if (!email || !secret || !newPassword || !otp) {
      throw new Error("Missing required information for password reset.");
    }

    // Construct the request body with all the necessary data.
    const payload: PasswordResetVerificationRequest = {
      email,
      otp,
      secret,
      newPassword,
    };

    // Send the POST request to the backend using Axios.
    const response = await axios.post(
      VERIFY_PASSWORD_RESET_API_URL,
      payload
    );

    // Assuming a successful response does not return a specific body,
    // we check for a 2xx status code.
    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      throw new Error(response.statusText || "Verification failed with an unknown error.");
    }

  } catch (error) {
    console.error("Error verifying password reset OTP:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to verify OTP.');
    }
    throw new Error('An unexpected error occurred during password reset.');
  }
};
