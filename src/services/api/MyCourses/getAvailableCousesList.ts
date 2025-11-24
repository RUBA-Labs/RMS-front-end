import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { GET_AVAILABLE_COURSES_API_URL } from '@/services/api/apiConfig';

// Define the shape of the course object based on your backend response
export interface AvailableCourse {
  id: number;
  course_code: string;
}

/**
 * Fetches the list of available courses from the backend.
 * Returns a promise that resolves to an array of AvailableCourse objects.
 */
export const getAvailableCoursesList = async (): Promise<AvailableCourse[]> => {
  console.log("---------------------------------------------------------");
  console.log("[DEBUG] getAvailableCoursesList: Function initiated");
  
  try {
    // 1. Retrieve authentication data
    const authData = getAuthData();
    
    // DEBUG: Log the structure to be sure
    console.log("[DEBUG] Raw authData structure:", JSON.stringify(authData, null, 2)); 

    // 2. Extract the JWT token safely using the correct property 'accessToken'
    // MATCHING YOUR WORKING REFERENCE CODE HERE
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      console.warn("[DEBUG] CRITICAL: No 'accessToken' found in authData. Please log in again.");
      // Optional: Force logout if token is missing
      // removeAuthData();
      // throw new Error('No authentication token found.');
    } else {
      console.log("[DEBUG] Access Token extracted successfully. Length:", accessToken.length);
    }

    console.log("[DEBUG] Target API URL:", GET_AVAILABLE_COURSES_API_URL);

    // 3. Make the Request with the Token in the Header
    console.log("[DEBUG] Sending Axios GET request...");
    
    const response = await axios.get<AvailableCourse[]>(GET_AVAILABLE_COURSES_API_URL, {
      headers: {
        // Use the extracted accessToken here
        Authorization: accessToken ? `Bearer ${accessToken}` : '', 
        'Content-Type': 'application/json',
      },
    });

    // 4. Log Success Response
    console.log("[DEBUG] API Response Status:", response.status);
    console.log("[DEBUG] Data received (Item count):", Array.isArray(response.data) ? response.data.length : 'Not an array');

    return response.data;

  } catch (error) {
    console.error("---------------------------------------------------------");
    console.error("[DEBUG] API REQUEST FAILED");
    
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