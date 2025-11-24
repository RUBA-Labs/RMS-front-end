import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { CREATE_A_NEW_CONFLICTS_API_URL } from '@/services/api/apiConfig';

/**
 * Interface representing a single available slot option.
 * Date format: YYYY-MM-DD
 * Time format: HH:MM:SS
 */
export interface AvailableSlot {
  date: string;
  time: string;
}

/**
 * Data Transfer Object for creating a conflict request.
 */
export interface CreateConflictRequestDto {
  course_code: string;
  original_date: string; // YYYY-MM-DD
  original_time: string; // HH:MM:SS
  available_slots: AvailableSlot[];
  reason_description: string;
}

/**
 * Sends a POST request to submit a new conflict/reschedule request.
 * * @param data - The conflict details including original time and proposed slots.
 * @returns A Promise that resolves when the request is successfully created.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const createConflictRequest = async (data: CreateConflictRequestDto): Promise<void> => {
  console.log('Preparing to create conflict request:', data);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Axios Request
    const response = await axios.post(
      CREATE_A_NEW_CONFLICTS_API_URL,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Conflict request created successfully:', response.data);

  } catch (error: unknown) {
    // 3. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing (Handling nested NestJS errors)
      let errorMessage = 'Failed to create conflict request.';
      const responseData = error.response?.data;
      
      if (responseData) {
        if (typeof responseData === 'string') {
             errorMessage = responseData;
        } 
        // Standard NestJS string message
        else if (typeof responseData.message === 'string') {
             errorMessage = responseData.message;
        } 
        // Standard NestJS array of messages
        else if (Array.isArray(responseData.message)) {
             errorMessage = responseData.message.join(', ');
        }
        // Nested error object structure (common in your specific backend setup)
        else if (responseData.message && Array.isArray(responseData.message.message)) {
             errorMessage = responseData.message.message.join(', ');
        }
        else {
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
      console.error('Error creating conflict request:', (error as Error).message);
      throw error;
    }
  }
};