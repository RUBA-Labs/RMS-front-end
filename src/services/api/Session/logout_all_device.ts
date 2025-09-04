import axios from 'axios';
import { SESSION_API_URL_LOGOUT_ALL_DEVICES } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

/**
 * Logs out from all active sessions (devices) for the logged-in user.
 * It sends a DELETE request to the /session/all endpoint.
 * @throws An error if the request fails (e.g., network error, unauthorized).
 */
export async function logoutAllDevices(): Promise<void> {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const url = SESSION_API_URL_LOGOUT_ALL_DEVICES;

    await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Successfully signed out of all devices.');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      const errorMessage = error.response?.data?.message || 'Failed to sign out from all devices.';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('An unknown error occurred while signing out:', (error as Error).message);
      throw error;
    }
  }
}
