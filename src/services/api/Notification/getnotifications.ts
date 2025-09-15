import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { NOTIFICATION_API_URL_GET_NOTIFICATIONS } from '@/services/api/apiConfig';

/**
 * Defines the structure for a single notification object.
 */
export interface Notification {
  id: string;
  isRead: boolean;
  message: string;
  createdAt: string; // ISO 8601 string
}

/**
 * Fetches an array of notifications from the backend API using axios.
 * The function includes the JWT token from local storage in the Authorization header.
 * @returns A promise that resolves to an array of Notification objects.
 */
export const getNotifications = async (): Promise<Notification[]> => {
  // Replace with your actual API endpoint
  const apiUrl = NOTIFICATION_API_URL_GET_NOTIFICATIONS;

  try {
    // Retrieve the JWT token from localStorage
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      console.error('No access token found. User is not authenticated.');
      return [];
    }
    
    // Make the API call using axios
    const response = await axios.get<Notification[]>(apiUrl, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
    });

    return response.data;

  } catch (error) {
    // Axios throws an error for non-2xx status codes, so we can catch it here.
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching notifications: ${error.response?.status} ${error.response?.statusText}`, error.response?.data);
    } else {
      console.error('An unexpected error occurred while fetching notifications:', error);
    }
    return [];
  }
};
