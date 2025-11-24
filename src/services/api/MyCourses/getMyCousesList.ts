import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { GET_MY_COURSES_API_URL } from '@/services/api/apiConfig';

// Define the shape of the course object based on your backend response
export interface MyCourse {
  id: number;
  course_code: string;
  course_name: string;
  user_id: number;
}

/**
 * Fetches the list of courses the user has already registered for (My Courses).
 * Returns a promise that resolves to an array of MyCourse objects.
 */
export const getMyCoursesList = async (): Promise<MyCourse[]> => {
  console.log("---------------------------------------------------------");
  console.log("[DEBUG] getMyCoursesList: Function initiated");

  try {
    // 1. Retrieve authentication data
    const authData = getAuthData();
    
    // 2. Extract the JWT token safely using 'accessToken'
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      console.warn("[DEBUG] CRITICAL: No 'accessToken' found in authData. User might need to log in.");
    } else {
      console.log("[DEBUG] Access Token extracted successfully.");
    }

    console.log("[DEBUG] Target API URL:", GET_MY_COURSES_API_URL);

    // 3. Make the Request
    const response = await axios.get<MyCourse[]>(GET_MY_COURSES_API_URL, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    // 4. Log Success Response
    console.log("[DEBUG] API Response Status:", response.status);
    console.log("[DEBUG] My Courses Data received (Item count):", Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    return response.data;

  } catch (error) {
    console.error("---------------------------------------------------------");
    console.error("[DEBUG] GET MY COURSES REQUEST FAILED");
    
    if (axios.isAxiosError(error)) {
      console.error("[DEBUG] HTTP Status:", error.response?.status);
      console.error("[DEBUG] Response Data:", error.response?.data);
      
      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        console.warn('[DEBUG] 401 Unauthorized detected. Clearing local auth data.');
        removeAuthData();
      }
    } else {
      console.error("[DEBUG] Unknown Error:", error);
    }
    
    console.error("---------------------------------------------------------");
    throw error;
  }
};

