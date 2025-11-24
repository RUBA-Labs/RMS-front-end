import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { TIME_TABLE_API_URL_FILTERED_DAY_OF_THE_WEEK_AND_START_TIME } from '@/services/api/apiConfig';

/**
 * Interface representing a single schedule item from the filtered timetable response.
 */
export interface FilteredScheduleItem {
  s_id: number; // Strictly mapping 's_id' from backend
  s_course_code: string;
  s_start_time: string;
  s_end_time: string;
  r_location_code: string;
  r_room_name: string;
}

/**
 * Fetches the timetable schedule filtered by a specific day of the week and start time.
 * * @param day - The day of the week (e.g., "Monday", "Tuesday").
 * @param time - The start time to filter by (format "HH:MM:SS", e.g., "08:00:00").
 * @returns A Promise that resolves with an array of FilteredScheduleItem objects.
 * @throws Error if authentication fails or the API request encounters an error.
 */
export const getFilteredTimetable = async (day: string, time: string): Promise<FilteredScheduleItem[]> => {
  console.log(`Fetching timetable for Day: ${day}, Time: ${time}`);

  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await axios.get(
      TIME_TABLE_API_URL_FILTERED_DAY_OF_THE_WEEK_AND_START_TIME,
      {
        params: {
          day: day,
          time: time,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Strictly map s_id from the response item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule: FilteredScheduleItem[] = response.data.map((item: any) => ({
        s_id: item.s_id, // Direct mapping of the original ID
        s_course_code: item.s_course_code,
        s_start_time: item.s_start_time,
        s_end_time: item.s_end_time,
        r_location_code: item.r_location_code,
        r_room_name: item.r_room_name,
    }));
    
    console.log(`Successfully fetched ${schedule.length} schedule items.`);
    return schedule;

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }

      let errorMessage = 'Failed to fetch filtered timetable.';
      const responseData = error.response?.data;
      
      if (responseData) {
        if (typeof responseData === 'string') errorMessage = responseData;
        else if (typeof responseData.message === 'string') errorMessage = responseData.message;
        else if (Array.isArray(responseData.message)) errorMessage = responseData.message.join(', ');
        else errorMessage = JSON.stringify(responseData);
      }

      console.error('API request failed details:', {
        status: error.response?.status,
        url: error.config?.url,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching filtered timetable:', (error as Error).message);
      throw error;
    }
  }
};