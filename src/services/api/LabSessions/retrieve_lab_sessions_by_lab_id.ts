import axios from 'axios';
import { RETRIEVE_LAB_SESSIONS_BY_LAB_ID_API_URL } from '../apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

// Define the shape of a Lab Session object (Frontend DTO)
export interface LabSessionDto {
  sessionId: string;
  labId: string;
  sessionName: string; // or 'moduleName' depending on your entity
  startTime: string;   // ISO Date string
  endTime: string;     // ISO Date string
  dayOfWeek?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for Error handling
interface ApiError {
  message?: string;
}

/**
 * Retrieve all sessions for a specific lab.
 * Backend endpoint: GET /lab-sessions/lab/{labId}
 */
export const retrieveLabSessionsByLabId = async (
  labId: string
): Promise<LabSessionDto[]> => {
  try {
    // 1. Validation
    if (!labId || labId.trim() === '') {
      throw new Error('Lab ID is required to retrieve sessions.');
    }

    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    // 2. Construct URL
    // Assumption: RETRIEVE_LAB_SESSIONS_BY_LAB_ID_API_URL points to '.../lab-sessions'
    // The controller endpoint is @Get('lab/:labId'), so we append /lab/{labId}
    const API_URL = `${RETRIEVE_LAB_SESSIONS_BY_LAB_ID_API_URL}/lab/${labId}`;

    // 3. API Call
    const response = await axios.get<unknown>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Prevent Axios from throwing on 404/500 automatically
    });

    // 4. Success Handling (HTTP 200)
    if (response.status === 200) {
      const data = response.data;
      let sessions: LabSessionDto[] = [];

      // Handle raw array vs wrapped object responses
      if (Array.isArray(data)) {
        sessions = data;
      } else if (
        data &&
        typeof data === 'object' &&
        'data' in data &&
        Array.isArray((data as { data: unknown }).data)
      ) {
        // Some APIs wrap results in a { data: [...] } object
        sessions = (data as { data: LabSessionDto[] }).data;
      }

      // Filter out invalid entries to be safe
      return sessions.filter(
        (session) => !!(session?.sessionId && session?.labId)
      );
    }

    // 5. Error Handling
    if (response.status === 404) {
      // Option A: Return empty array if you prefer not to show an error for empty labs
      // return []; 
      
      // Option B: Throw error (Matches your Computer Service style)
      throw new Error(`No sessions found for Lab ID: ${labId}`);
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error('Your session has expired. Please log in again.');
    }

    const errorMessage =
      (response.data as ApiError)?.message ||
      `Failed to retrieve sessions (HTTP ${response.status})`;

    throw new Error(errorMessage);

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as ApiError)?.message ||
        error.message ||
        'Network error occurred';
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'An unexpected error occurred while retrieving lab sessions.'
    );
  }
};