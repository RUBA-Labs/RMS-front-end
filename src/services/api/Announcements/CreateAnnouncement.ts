import axios from 'axios';
import { CREATE_ANNOUNCEMENT_API_URL } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

/**
 * Data Transfer Object for creating an announcement.
 */
export interface CreateAnnouncementDto {
  title: string;
  message: string;
  selectedViewer: string; // e.g., "developer", "student", "all"
}

/**
 * Sends a POST request to create a new system announcement.
 * * @param data - The announcement details (title, message, viewer).
 * @returns A Promise that resolves when the announcement is successfully created.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const createAnnouncement = async (data: CreateAnnouncementDto): Promise<void> => {
  console.log('Preparing to create announcement:', data);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Axios Request with Manual Header Injection
    // Method: POST
    // URL: CREATE_ANNOUNCEMENT_API_URL
    const response = await axios.post(
      CREATE_ANNOUNCEMENT_API_URL,
      data, // Request Body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Announcement created successfully:', response.data);

  } catch (error: unknown) {
    // 3. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Extract error message safely
      let errorMessage = 'Failed to create announcement.';
      
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
      console.error('Error creating announcement:', (error as Error).message);
      throw error;
    }
  }
};