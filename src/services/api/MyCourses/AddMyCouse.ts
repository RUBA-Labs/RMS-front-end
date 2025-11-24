import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { MY_COURSE_API_URL_ADD_MY_COURSE } from '@/services/api/apiConfig';

// Define the structure for a single course
export interface CourseInput {
  course_code: string;
  course_name?: string | null; // Optional or can be null
}

// Define the structure of the body payload
export interface AddMyCoursePayload {
  courses: CourseInput[];
}

/**
 * Sends a POST request to add courses to the user's list.
 * @param courses - An array of course objects containing code and name.
 */
export const addMyCourse = async (courses: CourseInput[]) => {
  console.log("---------------------------------------------------------");
  console.log("[DEBUG] addMyCourse: Function initiated");

  try {
    // 1. Retrieve authentication data
    const authData = getAuthData();
    console.log("[DEBUG] Raw authData retrieved.");

    // 2. Extract the JWT token safely using the correct property 'accessToken'
    // FIX: Changed from .token to .accessToken to match your working auth structure
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      console.warn("[DEBUG] CRITICAL: No 'accessToken' found in authData.");
      // throw new Error('No authentication token found.');
    } else {
      console.log("[DEBUG] Access Token extracted successfully.");
    }

    // 3. Construct the payload wrapper
    const payload: AddMyCoursePayload = {
      courses: courses
    };
    
    console.log("[DEBUG] Payload being sent:", JSON.stringify(payload, null, 2));
    console.log("[DEBUG] Target API URL:", MY_COURSE_API_URL_ADD_MY_COURSE);

    // 4. Send the POST request
    const response = await axios.post(MY_COURSE_API_URL_ADD_MY_COURSE, payload, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    console.log("[DEBUG] API Response Status:", response.status);
    return response.data;

  } catch (error) {
    console.error("---------------------------------------------------------");
    console.error("[DEBUG] ADD COURSE REQUEST FAILED");
    
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
    throw error; // Re-throw so the UI can show an error message
  }
};