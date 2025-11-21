import axios from 'axios';
// Assuming removeAuthData is available in this scope for 401 handling
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; 
import { EXAM_CLAIMS_API_URL_CREATE_EXAM_CLAIM } from '@/services/api/apiConfig';

// --- Interfaces ---

/**
 * Defines the mandatory data structure for the POST request body.
 */
export interface CreateExamClaimRequest {
  name: string;
  faculty: string;
  position: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
}

/**
 * Interface for the nested 'user' object in the response.
 */
interface ClaimUser {
  id: number;
}

/**
 * Defines the expected structure for the successful response object (HTTP 201),
 * based on the provided JSON body.
 */
export interface ExamClaimResponse extends CreateExamClaimRequest {
  id: number;
  user: ClaimUser; // Updated to match the nested user object in the response
  createdAt: string;
  updatedAt: string;
  // Note: The 'status' field was removed as it was not present in your 201 response example.
}

// Define the constant for the API URL
const CREATE_CLAIM_URL = EXAM_CLAIMS_API_URL_CREATE_EXAM_CLAIM;

// --- Service Function ---

/**
 * Sends a POST request to create a new exam claim record.
 * It includes the user's JWT token in the Authorization header.
 *
 * @param claimData The object containing all required exam claim details.
 * @returns A Promise that resolves with the created ExamClaimResponse object.
 * @throws An error if the request fails (e.g., no token, network error, unauthorized).
 */
export const createExamClaim = async (
  claimData: CreateExamClaimRequest
): Promise<ExamClaimResponse> => {
  try {
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      // If no token is found locally, clear stale data and throw
      removeAuthData(); 
      throw new Error('No authentication token found. Please log in again.');
    }

    // Send a POST request with the URL, data body, and auth headers
    const response = await axios.post(CREATE_CLAIM_URL, claimData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Including the JWT token
        'Content-Type': 'application/json', // Explicitly setting content type
      },
    });

    // Return the newly created exam claim data from the response
    return response.data as ExamClaimResponse;

  } catch (error: unknown) {
    // Robust error handling pattern for API calls
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
      const errorMessage = specificErrorMessage || 'Failed to create exam claim.';
      
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);

    } else {
      // Handle non-Axios errors (e.g., network issues)
      console.error('Error creating exam claim:', (error as Error).message);
      throw error;
    }
  }
};