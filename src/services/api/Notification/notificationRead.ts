import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { NOTIFICATION_API_URL_MARK_AS_READ } from '@/services/api/apiConfig';

/**
 * Sends a POST request to the backend to mark a specific notification as read.
 * @param notificationId The ID of the notification to mark as read.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  
  try {
    // Retrieve the JWT token from localStorage
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      console.error('No access token found. User is not authenticated.');
      return;
    }
    
    // Construct the full API URL
    const endpoint = NOTIFICATION_API_URL_MARK_AS_READ(notificationId);

    // Make the API call using axios
    await axios.post(endpoint, {}, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
    });

    console.log(`Notification with ID ${notificationId} marked as read successfully.`);

  } catch (error) {
    // Axios throws an error for non-2xx status codes
    if (axios.isAxiosError(error)) {
      console.error(`Error marking notification ${notificationId} as read: ${error.response?.status} ${error.response?.statusText}`, error.response?.data);
    } else {
      console.error('An unexpected error occurred while marking notification as read:', error);
    }
  }
};
