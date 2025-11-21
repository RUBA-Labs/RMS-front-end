import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; 
import { RETRIEVE_ALL_MY_EXAM_CLAIMS_API_URL } from '@/services/api/apiConfig';

// --- Interfaces ---

/**
 * Interface representing a single exam claim item from the list.
 * Keys match the exact JSON structure provided by the backend.
 */
export interface ExamClaimItem {
  id: number;
  "Exam Name/Code": string; // Key contains spaces/special chars
  "Exam Date": string;      // Key contains spaces
  Venue: string;
  Amount: string;
  Status: string;
  claimId: number;
}

/**
 * The response is simply an array of these items.
 */
export type GetCurrentUserClaimsResponse = ExamClaimItem[];

// Define the constant for the API URL
const GET_MY_CLAIMS_URL = RETRIEVE_ALL_MY_EXAM_CLAIMS_API_URL;

// --- Service Function ---

/**
 * Sends a GET request to retrieve all exam claims for the currently logged-in user.
 * It includes the user's JWT token in the Authorization header.
 *
 * @returns A Promise that resolves with an array of ExamClaimItem objects.
 * @throws An error if the request fails (e.g., no token, network error, unauthorized).
 */
export const getCurrentUserClaims = async (): Promise<GetCurrentUserClaimsResponse> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      // If no token is found locally, clear stale data and throw
      removeAuthData(); 
      throw new Error('No authentication token found. Please log in again.');
    }

    // Send a GET request with the URL and auth headers
    const response = await axios.get(GET_MY_CLAIMS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Including the JWT token
        'Content-Type': 'application/json',
      },
    });

    // Return the data (array of claims) from the response
    return response.data as GetCurrentUserClaimsResponse;

  } catch (error: unknown) {
    // Robust error handling pattern matching your Create service
    if (axios.isAxiosError(error)) {
      
      const apiErrorData = error.response?.data as { message?: string | { message?: string } };
      let specificErrorMessage: string | undefined;

      // Check for 401 status and handle session expiration
      if (error.response?.status === 401) {
        // If unauthorized, clear local auth data and log
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
        
        // Handle the nested message structure: response.data.message.message
        if (apiErrorData && typeof apiErrorData.message === 'object' && apiErrorData.message.message) {
            specificErrorMessage = apiErrorData.message.message;
        } else {
            // Fallback for 401 if nested message is not present
            specificErrorMessage = 'Unauthorized'; 
        }
      }
      
      // Handle standard NestJS error structure (or other generic error messages)
      if (!specificErrorMessage && apiErrorData && typeof apiErrorData.message === 'string') {
        specificErrorMessage = apiErrorData.message;
      }
      
      // Fallback message if no specific message could be extracted
      const errorMessage = specificErrorMessage || 'Failed to retrieve exam claims.';
      
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);

    } else {
      // Handle non-Axios errors (e.g., network issues)
      console.error('Error retrieving exam claims:', (error as Error).message);
      throw error;
    }
  }
};