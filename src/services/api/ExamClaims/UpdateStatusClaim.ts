import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { UPDATE_STATUS_CLAIM_API_URL_BY_ID } from '@/services/api/apiConfig';

/**
 * strict type definition for the allowed status values.
 */
export type ClaimStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Updates the status of a specific exam claim item.
 * Sends a PATCH request with the new status in the body.
 * * @param claimId - The ID of the claim to update.
 * @param newStatus - The new status string ('PENDING', 'APPROVED', 'REJECTED').
 * @returns A Promise that resolves when the update is successful.
 */
export const updateStatusClaim = async (claimId: number, newStatus: ClaimStatusType): Promise<void> => {
  // Debug log to verify the ID being received
  console.log(`Preparing to update Claim Item ID: ${claimId} to status: ${newStatus}`);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Dynamic URL Construction
    const url = UPDATE_STATUS_CLAIM_API_URL_BY_ID(claimId);
    
    // Debug log to verify the exact URL being called
    console.log(`Sending PATCH request to URL: ${url}`);

    // 3. Axios Request with Manual Header Injection
    await axios.patch(
      url,
      { newStatus }, // Request Body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Extract error message safely, handling cases where message is an object or array
      let errorMessage = 'Failed to update claim status.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
             errorMessage = error.response.data;
        } else if (typeof error.response.data.message === 'string') {
             errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
             // NestJS often returns array of errors
             errorMessage = error.response.data.message.join(', ');
        } else {
             // Fallback for objects
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
      console.error('Error updating claim status:', (error as Error).message);
      throw error;
    }
  }
};