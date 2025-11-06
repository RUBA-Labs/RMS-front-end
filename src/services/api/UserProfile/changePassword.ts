import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { USER_PROFILE_API_URL_CHANGE_PASSWORD } from '@/services/api/apiConfig';

// Defines the structure for the change password request body.
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Sends a PATCH request to change the user's password.
 * @param oldPassword The user's current password.
 * @param newPassword The new password to set.
 * @returns A promise that resolves with the success message from the API.
 * @throws An error if the request fails.
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<string> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const url = USER_PROFILE_API_URL_CHANGE_PASSWORD;

    const data: ChangePasswordRequest = {
      oldPassword,
      newPassword,
    };

    const response = await axios.patch(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle success response
    if (response.data && typeof response.data.message === 'string') {
      return response.data.message;
    }
    if (typeof response.data === 'string') {
        return response.data;
    }
    return "Password changed successfully."; // Fallback success message

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      
      let errorMessage = 'Failed to change password.';
      const errorData = error.response?.data;

      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error changing password:', (error as Error).message);
      throw error;
    }
  }
};