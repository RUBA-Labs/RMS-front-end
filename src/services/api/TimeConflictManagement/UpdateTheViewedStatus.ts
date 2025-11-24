import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { VIEW_STATUS_CONFLICT_API_URL_BY_ID } from '@/services/api/apiConfig';

/**
 * Updates the status of a conflict request to "Viewed".
 * Sends a POST request to the backend API using the conflict ID.
 * * @param id - The unique ID of the conflict request.
 * @returns A Promise that resolves when the status update is successful.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const updateConflictViewStatus = async (id: number): Promise<void> => {
  console.log(`Marking conflict request ${id} as viewed...`);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Dynamic URL Construction
    const url = VIEW_STATUS_CONFLICT_API_URL_BY_ID(id);

    // 3. Axios Request
    // Sending { is_viewed: true } as the body
    await axios.post(
      url,
      { is_viewed: true }, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Conflict request ${id} successfully marked as viewed.`);

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to update view status.';
      const responseData = error.response?.data;
      
      if (responseData) {
        if (typeof responseData === 'string') {
             errorMessage = responseData;
        } else if (typeof responseData.message === 'string') {
             errorMessage = responseData.message;
        } else if (Array.isArray(responseData.message)) {
             errorMessage = responseData.message.join(', ');
        } else {
             errorMessage = JSON.stringify(responseData);
        }
      }

      console.error('API request failed details:', {
        status: error.response?.status,
        url: error.config?.url,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    } else {
      console.error('Error updating conflict view status:', (error as Error).message);
      throw error;
    }
  }
};