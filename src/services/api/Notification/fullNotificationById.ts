import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { NOTIFICATION_API_URL_GET_FULL_NOTIFICATION_BY_ID } from '@/services/api/apiConfig';

/**
 * Defines the structure for a full notification object, including a description.
 */
export interface FullNotification {
  id: string;
  isRead: boolean;
  message: string;
  description: string;
  createdAt: string; // ISO 8601 string
}

/**
 * Fetches the full details of a single notification from the backend API.
 * The function includes the JWT token from local storage in the Authorization header.
 * @param notificationId The ID of the notification to fetch.
 * @returns A promise that resolves to a FullNotification object or null if an error occurs.
 */
export const getFullNotificationById = async (notificationId: string): Promise<FullNotification | null> => {

  try {
    // Retrieve the JWT token from localStorage
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      console.error('No access token found. User is not authenticated.');
      return null;
    }
    
    // Construct the full API URL
    const endpoint = NOTIFICATION_API_URL_GET_FULL_NOTIFICATION_BY_ID(notificationId);

    // Make the API call using axios
    const response = await axios.get<FullNotification>(endpoint, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
    });

    return response.data;

  } catch (error) {
    // Axios throws an error for non-2xx status codes, so we can catch it here.
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching full notification details: ${error.response?.status} ${error.response?.statusText}`, error.response?.data);
    } else {
      console.error('An unexpected error occurred while fetching full notification details:', error);
    }
    return null;
  }
};
