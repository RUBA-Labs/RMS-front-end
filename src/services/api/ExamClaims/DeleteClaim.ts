import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { DELETE_EXAM_CLAIM_ITEM_API_URL_BY_ID } from '@/services/api/apiConfig';

/**
 * Deletes a specific exam claim item by its ID.
 * Sends a DELETE request to the backend API.
 * * @param claimId - The unique ID of the exam claim to delete.
 * @returns A Promise that resolves when the deletion is successful.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const deleteExamClaimItem = async (claimId: number): Promise<void> => {
  console.log(`Preparing to delete Exam Claim Item ID: ${claimId}`);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Dynamic URL Construction
    const url = DELETE_EXAM_CLAIM_ITEM_API_URL_BY_ID(claimId);
    console.log(`Sending DELETE request to URL: ${url}`);

    // 3. Axios Request with Manual Header Injection
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`Successfully deleted claim item ${claimId}`);

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Extract error message safely
      let errorMessage = 'Failed to delete exam claim.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
             errorMessage = error.response.data;
        } else if (typeof error.response.data.message === 'string') {
             errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
             errorMessage = error.response.data.message.join(', ');
        } else {
             errorMessage = JSON.stringify(error.response.data);
        }
      }

      console.error('API request failed details:', {
        status: error.response?.status,
        url: error.config?.url,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    } else {
      console.error('Error deleting exam claim:', (error as Error).message);
      throw error;
    }
  }
};