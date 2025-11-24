import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { DELETE_MY_COURSE_API_URL } from '@/services/api/apiConfig';

/**
 * Sends a DELETE request to remove a specific course from the user's list.
 * @param courseId - The ID of the course to delete.
 */
export const deleteMyCourse = async (courseId: number) => {
  console.log("---------------------------------------------------------");
  console.log(`[DEBUG] deleteMyCourse: Function initiated for Course ID: ${courseId}`);

  try {
    // 1. Retrieve authentication data
    const authData = getAuthData();

    // 2. Extract the JWT token safely using 'accessToken'
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      console.warn("[DEBUG] CRITICAL: No 'accessToken' found in authData.");
      // throw new Error('No authentication token found.');
    } else {
      console.log("[DEBUG] Access Token extracted successfully.");
    }

    // 3. Construct the URL
    // Since DELETE_MY_COURSE_API_URL is a function, we call it with the ID
    const targetUrl = DELETE_MY_COURSE_API_URL(courseId);
    console.log("[DEBUG] Target API URL:", targetUrl);

    // 4. Send the DELETE request
    const response = await axios.delete(targetUrl, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    console.log("[DEBUG] API Response Status:", response.status);
    console.log("[DEBUG] Course deleted successfully.");
    
    return response.data;

  } catch (error) {
    console.error("---------------------------------------------------------");
    console.error("[DEBUG] DELETE COURSE REQUEST FAILED");
    
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