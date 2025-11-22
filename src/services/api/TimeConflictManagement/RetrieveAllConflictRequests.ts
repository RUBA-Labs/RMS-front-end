import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { RETRIEVE_ALL_CONFLICTS_API_URL } from '@/services/api/apiConfig';

/**
 * Interface for the user who created the request.
 */
export interface RequestByUser {
  id: number;
  email: string;
  role: string;
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the alternative time slots proposed in the request.
 */
export interface ConflictAvailableSlot {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  time_conflict_id: number;
}

/**
 * Main Interface representing a Conflict Request item from the backend.
 */
export interface ConflictRequestItem {
  id: number;
  course_code: string;
  original_date: string;
  original_time: string;
  reason_description: string;
  is_viewed: boolean; // Added to match backend response
  request_create_user_id: number;
  requestByUser: RequestByUser;
  availableSlots: ConflictAvailableSlot[];
}

/**
 * Fetches all conflict requests from the backend.
 * Authenticates using the Bearer token.
 * * @returns A Promise that resolves with an array of ConflictRequestItem objects.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const getAllConflictRequests = async (): Promise<ConflictRequestItem[]> => {
  console.log('Fetching all conflict requests...');

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
      RETRIEVE_ALL_CONFLICTS_API_URL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. Data Transformation / Validation (Optional)
    const requests: ConflictRequestItem[] = response.data;
    
    console.log(`Successfully fetched ${requests.length} conflict requests.`);
    return requests;

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to fetch conflict requests.';
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
      console.error('Error fetching conflict requests:', (error as Error).message);
      throw error;
    }
  }
};