import axios from 'axios';
import { SESSION_API_URL_GET_USER_SESSIONS } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

/**
 * Defines the structure for a user session object.
 */
export interface UserSession {
  id: string;
  jwtToken: string;
  userAgent: string;
  ipAddress: string;
  isRevoked: boolean;
  createdAt: string;
  lastUsedAt: string;
  deviceName: string;
}

/**
 * Fetches all active sessions (devices) for the logged-in user.
 * It sends a GET request to the /session endpoint and processes the data
 * to extract a more readable device name.
 * @returns A Promise that resolves with an array of UserSession objects.
 * @throws An error if the request fails (e.g., network error, unauthorized).
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const url = SESSION_API_URL_GET_USER_SESSIONS;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const sessions = response.data.map((session: UserSession) => {
      // Regex to find content inside the first set of parentheses
      const match = session.userAgent.match(/\(([^)]+)\)/);
      const deviceName = match ? match[1] : 'Unknown Device';

      return {
        ...session,
        deviceName,
      };
    });

    return sessions;

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      const errorMessage = error.response?.data?.message || 'Failed to fetch sessions.';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching user sessions:', (error as Error).message);
      throw error;
    }
  }
};
