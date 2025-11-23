import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { GET_ALL_LOCATIONS_ROOM_API_URL } from '@/services/api/apiConfig';

/**
 * Interface representing a Room object from the backend.
 */
export interface Room {
  room_id: number;
  location_code: string;
  room_name: string;
}

/**
 * Fetches all available rooms/locations from the backend.
 * Authenticates using the Bearer token.
 * * @returns A Promise that resolves with an array of Room objects.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const getAllRooms = async (): Promise<Room[]> => {
  console.log('Fetching all rooms...');

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
      GET_ALL_LOCATIONS_ROOM_API_URL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. Data Transformation / Validation (Optional)
    const rooms: Room[] = response.data;
    
    console.log(`Successfully fetched ${rooms.length} rooms.`);
    return rooms;

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to fetch rooms.';
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
      console.error('Error fetching rooms:', (error as Error).message);
      throw error;
    }
  }
};