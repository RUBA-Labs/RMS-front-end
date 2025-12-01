import axios from 'axios';

// Assuming this is the correct API URL from your configuration
import { CREATE_LAB_SESSION_API_URL } from '../apiConfig'; 

// Assuming this path is correct for retrieving the JWT
import { getAuthData } from '@/services/api/Auth/auth'; 

/**
 * Interface defining the payload/body required to create a new lab session.
 */
export interface CreateLabSessionPayload {
  sessionName: string;
  sessionDate: string; // e.g., "YYYY-MM-DD"
  sessionTime: string; // e.g., "HH:MM:SS"
  description: string;
  lecturer: string;
  labId: string; // ID of the lab this session belongs to
}

/**
 * Interface defining the response object returned by the backend upon successful creation.
 * The backend typically returns all submitted fields plus a unique ID and timestamps.
 */
export interface CreateLabSessionResponse {
  sessionId: string; // The unique ID generated for the session
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  description: string;
  lecturer: string;
  labId: string;
  createdAt?: string; // Optional creation timestamp
}

/**
 * Creates a new computer lab session on the backend via a POST request.
 * Adds the JWT from getAuthData() to the Authorization header.
 * * @param payload The session details (name, date, time, description, etc.).
 * @returns A Promise that resolves with the created session object (CreateLabSessionResponse).
 * @throws An Error if authentication fails or the API returns a non-201 status.
 */
export const createLabSession = async (
  payload: CreateLabSessionPayload
): Promise<CreateLabSessionResponse> => {
  try {
    // 1. Get Authentication Token
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    // 2. Execute POST Request
    const response = await axios.post<CreateLabSessionResponse>(
      CREATE_LAB_SESSION_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Manually handle all status codes
        validateStatus: () => true, 
      }
    );

    // 3. Success Handling (HTTP 201 Created)
    if (response.status === 201) {
      return response.data;
    }

    // 4. API Error Handling (Non-201 Status)
    const serverMessage =
      (response.data as { message?: string })?.message ||
      response.statusText ||
      'Failed to create lab session.';

    throw new Error(serverMessage);

  } catch (error: unknown) {
    // 5. Network/Axios Error Handling
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Failed to create lab session due to an unexpected error.';
      throw new Error(message);
    }
    
    // Re-throw other errors (like the 'No access token found' error)
    throw error;
  }
};