import axios from 'axios';
import {PASSWORD_RESET_API_URL_SEND_OTP} from '@/services/api/apiConfig';

// Defines the API endpoint for password reset requests.
const PASSWORD_RESET_API_URL = PASSWORD_RESET_API_URL_SEND_OTP;

// Defines the structure of the data to be sent in the request body.
type PasswordResetRequest = {
  email: string;
};

// Defines the expected structure of the successful API response.
type PasswordResetResponse = {
  secret: string;
};

/**
 * Initiates a password reset process by sending the user's email to the backend.
 * The function then saves the email, the returned secret, and the new password
 * to local storage for the next step of the password reset process.
 * @param {string} email - The email of the user requesting a password reset.
 * @param {string} newPassword - The new password chosen by the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the request is successful.
 * @throws {Error} Throws an error if the API request fails or the response is invalid.
 */
export const requestPasswordReset = async (
  email: string,
  newPassword: string
): Promise<boolean> => {
  try {
    // Prepare the payload with the user's email.
    const payload: PasswordResetRequest = { email };

    // Send the POST request to the backend using Axios.
    const response = await axios.post<PasswordResetResponse>(
      PASSWORD_RESET_API_URL,
      payload
    );

    // Get the secret from the response data.
    const { secret } = response.data;
    if (!secret) {
      throw new Error("Secret not received from the server.");
    }

    // Prepare the data to be stored in local storage.
    const dataToStore = {
      email,
      secret,
      newPassword,
    };

    // Save the data to local storage. Use JSON.stringify() to save the object.
    localStorage.setItem('passwordResetData', JSON.stringify(dataToStore));

    return true;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to request password reset.');
    }
    throw new Error('An unexpected error occurred.');
  }
};
