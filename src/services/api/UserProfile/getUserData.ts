import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; // Assuming auth.ts is in the same directory
import { USER_PROFILE_API_URL_GET_USER_DATA } from '@/services/api/apiConfig';
/**
 * Defines the structure for the user object.
 */
export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  department: string;
  phone: string;
}


const USER_API_URL = USER_PROFILE_API_URL_GET_USER_DATA;

/**
 * Fetches the currently logged-in user's data from the backend.
 * It sends a GET request with the JWT token in the Authorization header.
 * @returns A Promise that resolves with a User object.
 * @throws An error if the request fails (e.g., no token, network error, unauthorized).
 */
export const getUserData = async (): Promise<User> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.get(USER_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data as User;

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      const errorMessage = error.response?.data?.message || 'Failed to fetch user data.';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching user data:', (error as Error).message);
      throw error;
    }
  }
};

export const displayName  = async () => (await getUserData()).fullName;
