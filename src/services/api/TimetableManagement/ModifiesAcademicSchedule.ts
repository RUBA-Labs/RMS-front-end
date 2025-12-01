import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { UPDATE_TIME_SLOT_BY_ID_API_URL } from '@/services/api/apiConfig';

/**
 * Data Transfer Object for updating an academic schedule.
 * Time format: HH:MM:SS
 */
export interface UpdateScheduleDto {
  room_id: number;
  course_code: string;
  day_of_week: string; // e.g., "Monday"
  start_time: string;
  end_time: string;
}

/**
 * Updates a specific academic schedule time slot by its ID.
 * Sends a PATCH request to the backend API with the new details.
 * * @param id - The unique ID of the schedule/time slot to update.
 * @param data - The new schedule details (room, course, day, time).
 * @returns A Promise that resolves when the update is successful.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const modifyAcademicSchedule = async (id: number, data: UpdateScheduleDto): Promise<void> => {
  console.log(`Preparing to modify schedule ID: ${id}`, data);

  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    // 2. Dynamic URL Construction
    const url = UPDATE_TIME_SLOT_BY_ID_API_URL(id);

    // 3. Axios Request
    // Changed from PUT to PATCH to fix the 404 "Cannot PUT" error
    await axios.patch(
      url,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Schedule ID ${id} updated successfully.`);

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      // Robust Error Parsing
      let errorMessage = 'Failed to update schedule.';
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
      console.error('Error modifying schedule:', (error as Error).message);
      throw error;
    }
  }
};