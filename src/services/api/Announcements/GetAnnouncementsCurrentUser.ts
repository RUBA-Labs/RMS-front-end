import axios from 'axios';
import { RETRIEVE_MY_ANNOUNCEMENTS_API_URL } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

/**
 * Interface representing the creator of the announcement (User).
 */
export interface Creator {
  id: number;
  email: string;
  role: string; // e.g., "developer"
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface representing an Announcement item.
 */
export interface Announcement {
  id: number;
  title: string;
  message: string;
  selectedViewer: string; // e.g., "developer", "ALL"
  creator: Creator;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches announcements targeting the current user.
 * Sends a GET request to the backend API.
 * * @returns A Promise that resolves with an array of Announcement objects.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const getAnnouncementsCurrentUser = async (): Promise<Announcement[]> => {
  console.log('Fetching announcements for current user...');

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Axios Request
    const response = await axios.get(
      RETRIEVE_MY_ANNOUNCEMENTS_API_URL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. Data Transformation (Optional validation can be added here)
    const announcements: Announcement[] = response.data;
    
    console.log(`Successfully fetched ${announcements.length} announcements.`);
    return announcements;

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to fetch announcements.';
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
      console.error('Error fetching announcements:', (error as Error).message);
      throw error;
    }
  }
};