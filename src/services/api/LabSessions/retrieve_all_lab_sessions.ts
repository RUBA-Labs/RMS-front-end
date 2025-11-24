import axios from 'axios';

// Assuming this is the correct API URL from your configuration
import { RETRIEVE_ALL_LAB_SESSIONS_API_URL } from '../apiConfig'; 

// Assuming this path is correct for retrieving the JWT
import { getAuthData } from '@/services/api/Auth/auth'; 

// --- 1. Interfaces ---

/**
 * Interface defining the data structure for the nested Computer Lab object
 * within the Lab Session response.
 */
export interface ComputerLabDto {
  labId: string;
  description: string;
  location: string;
  computersAvailable: number;
  computersWorking: number;
  computersDisable: number;
}

/**
 * Interface defining the data structure for a single Lab Session object 
 * expected from the backend's GET /sessions endpoint.
 * * NOTE: The original `labId` is kept, and the nested `computerLab` object is added.
 */
export interface LabSessionDto {
  sessionId: string;
  labId: string;
  sessionName: string;
  description: string;
  lecturer: string;
  // Date and Time are returned as string formats by the API
  sessionDate: string; // e.g., "YYYY-MM-DD"
  sessionTime: string; // e.g., "HH:MM:SS"
  createdAt?: string;
  updatedAt?: string;
  
  // NEW: Field to match the nested object in the backend response
  computerLab: ComputerLabDto; 
}

// --- 2. Function Definition ---

/**
 * Retrieves all scheduled computer lab sessions from the backend via an authenticated GET request.
 * * @returns A Promise that resolves with an array of LabSessionDto objects.
 * @throws An Error if authentication fails or the API returns a non-200 status.
 * * NOTE: The function body remains unchanged as the Axios call is generic over LabSessionDto[], 
 * automatically handling the new structure based on the updated interface.
 */
export const retrieveAllLabSessions = async (): Promise<LabSessionDto[]> => {
  try {
    // 1. Get Authentication Token
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error('Authentication failed: No access token found. Please log in.');
    }

    // 2. Execute GET Request
    const response = await axios.get<LabSessionDto[]>(
      RETRIEVE_ALL_LAB_SESSIONS_API_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Manually handle all status codes
        validateStatus: () => true, 
      }
    );

    // 3. Success Handling (HTTP 200 OK)
    if (response.status === 200) {

        console.log('Retrieved Lab Sessions:', response.data);
      // Return the array of lab session data
      return response.data;
    }

    // 4. API Error Handling (Non-200 Status)
    const serverMessage =
      (response.data as { message?: string })?.message ||
      response.statusText ||
      `Failed to retrieve lab sessions. Status: ${response.status}`;

    throw new Error(serverMessage);

  } catch (error: unknown) {
    // 5. Network/Axios Error Handling
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Network error or failed to connect to the session API.';
      throw new Error(message);
    }
    
    // Re-throw other errors (like the authentication error)
    throw error;
  }
};