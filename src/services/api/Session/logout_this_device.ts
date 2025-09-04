import axios from 'axios';
import { SESSION_API_URL_LOGOUT_THIS_DEVICE } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

/**
 * A function to handle the logout request for the current device.
 * It sends a DELETE request with the user's JWT token in the Authorization header.
 * @returns A Promise that resolves with a success message on successful logout.
 * @throws An error if the request fails (e.g., network error, unauthorized).
 */
export const logoutThisDevice = async () => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // Construct the full API endpoint URL for the logout route
    const url = SESSION_API_URL_LOGOUT_THIS_DEVICE

    // Send the DELETE request with the Authorization header
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // On success, clear the local storage data
    removeAuthData();
    return response.data;

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // If the token is invalid (401 Unauthorized), remove the invalid data from storage
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to logout.';
      console.error('Logout request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error during logout request:', (error as Error).message);
      throw error;
    }
  }
};
