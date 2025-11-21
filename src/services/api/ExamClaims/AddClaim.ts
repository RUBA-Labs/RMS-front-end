import axios from 'axios';
// Assuming removeAuthData is available in this scope for 401 handling
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; 
import { ADD_CLAIMS } from '@/services/api/apiConfig';

// --- Interfaces ---

/**
 * Defines the mandatory data structure for the POST request body.
 */
export interface AddClaimRequest {
  examName: string;
  examDate: string;
  venue: string;
  amount: number;
  claimId: number; // ID of the parent exam claim this entry belongs to
}

/**
 * Defines the expected structure for the successful response object (HTTP 201),
 * typically including server-generated fields.
 */
export interface AddClaimResponse extends AddClaimRequest {
  id: number; // Unique ID for this specific claim item
  createdAt: string;
  updatedAt: string;
}

// Define the constant for the API URL
const ADD_CLAIMS_URL = ADD_CLAIMS;

// --- Service Function ---

/**
 * Sends a POST request to add a new claim item (e.g., an exam detail) to a main claim.
 * It includes the user's JWT token in the Authorization header.
 *
 * @param claimItemData The object containing all required details for the claim item.
 * @returns A Promise that resolves with the created AddClaimResponse object.
 * @throws An error if the request fails (e.g., no token, network error, unauthorized).
 */
export const addClaim = async (
  claimItemData: AddClaimRequest
): Promise<AddClaimResponse> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      // If no token is found locally, clear stale data and throw
      removeAuthData(); 
      throw new Error('No authentication token found. Please log in again.');
    }

    // Send a POST request with the URL, data body, and auth headers
    const response = await axios.post(ADD_CLAIMS_URL, claimItemData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Including the JWT token
        'Content-Type': 'application/json', // Explicitly setting content type
      },
    });

    // Return the newly created claim item data from the response
    return response.data as AddClaimResponse;

  } catch (error: unknown) {
    // Robust error handling pattern for API calls
    if (axios.isAxiosError(error)) {
      
      const apiErrorData = error.response?.data as any;
      let specificErrorMessage: string | undefined;

      // Check for 401 status and handle session expiration (similar to CreateExamClaim.ts)
      if (error.response?.status === 401) {
        // If unauthorized, clear local auth data and log
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
        
        // Handle the nested message structure often seen in NestJS 401 errors
        if (apiErrorData && typeof apiErrorData.message === 'object' && apiErrorData.message.message) {
            specificErrorMessage = apiErrorData.message.message;
        } else {
            // Fallback for 401
            specificErrorMessage = 'Unauthorized'; 
        }
      }
      
      // Handle standard NestJS error structure (or other generic error messages)
      if (!specificErrorMessage && apiErrorData && typeof apiErrorData.message === 'string') {
        specificErrorMessage = apiErrorData.message;
      }
      
      // Fallback message if no specific message could be extracted
      const errorMessage = specificErrorMessage || 'Failed to add claim item.';
      
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);

    } else {
      // Handle non-Axios errors (e.g., network issues)
      console.error('Error adding claim item:', (error as Error).message);
      throw error;
    }
  }
};

