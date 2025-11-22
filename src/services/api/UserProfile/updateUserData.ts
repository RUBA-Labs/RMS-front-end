// updateUserData.ts

import axios from 'axios';
// Import removeAuthData for handling 401 errors, just like in your getUserData.ts
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { USER_PROFILE_API_URL_UPDATE_PROFILE } from '@/services/api/apiConfig';

/**
 * Defines the structure for the complete user object returned from the API.
 * This is based on the response body you provided.
 */
export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Defines the structure for the data sent in the PATCH request body.
 * All fields are optional to allow for partial updates.
 */
export interface UpdateUserDataInput {
  fullName?: string;
  department?: string;
  phone?: string;
}

// Define the constant for the API URL
const UPDATE_PROFILE_URL = USER_PROFILE_API_URL_UPDATE_PROFILE;

/**
 * Sends a PATCH request to update the user's profile data.
 * It sends the new data in the request body and includes the JWT token
 * in the Authorization header.
 *
 * @param dataToUpdate An object containing the user fields to update.
 * @returns A Promise that resolves with the updated User object.
 * @throws An error if the request fails (e.g., no token, network error, unauthorized).
 */
export const updateUserData = async (
  dataToUpdate: UpdateUserDataInput
): Promise<User> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // Send a PATCH request with the URL, data, and auth headers
    const response = await axios.patch(UPDATE_PROFILE_URL, dataToUpdate, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Return the updated user data from the response
    return response.data as User;
  } catch (error: unknown) {
    // Reuse the same robust error handling from your getUserData.ts
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // If unauthorized, clear local auth data
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      // Throw a specific error message from the API or a fallback
      const errorMessage =
        error.response?.data?.message || 'Failed to update user data.';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      // Handle non-Axios errors
      console.error('Error updating user data:', (error as Error).message);
      throw error;
    }
  }
};