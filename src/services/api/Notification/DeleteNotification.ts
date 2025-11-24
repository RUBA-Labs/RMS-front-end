import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { NOTIFICATION_API_URL_DELETE_NOTIFICATION_BY_ID } from '@/services/api/apiConfig';

/**
 * Deletes a specific notification by its ID.
 * Sends a DELETE request to the backend API.
 * * @param notificationId - The unique ID of the notification to delete.
 * @returns A Promise that resolves when the deletion is successful.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  console.log(`Preparing to delete Notification ID: ${notificationId}`);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Dynamic URL Construction
    const url = NOTIFICATION_API_URL_DELETE_NOTIFICATION_BY_ID(notificationId);
    console.log(`Sending DELETE request to URL: ${url}`);

    // 3. Axios Request with Manual Header Injection
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`Successfully deleted notification ${notificationId}`);

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to delete notification.';
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
      console.error('Error deleting notification:', (error as Error).message);
      throw error;
    }
  }
};