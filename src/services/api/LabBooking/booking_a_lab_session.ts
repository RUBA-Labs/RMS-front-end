import axios from 'axios';
import { CREATE_A_LAB_BOOKING_API_URL } from '../apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; // Added removeAuthData

// --- 1. Type Definitions ---

/**
 * Interface defining the payload required to book a computer in a lab session.
 * NOTE: This is the simplified payload based on your request.
 */
export interface LabBookingPayload {
  labSessionId: string;
  computerId: string;
  // NOTE: Depending on your backend, you might need to add studentId, date, and time here
  // as seen in the previous iteration of this file.
}

/**
 * Interface defining the response object returned by the backend on success.
 * (Adjust this based on your actual success response structure if needed)
 */
export interface LabBookingResponse {
  bookingId: string;
  labSessionId: string;
  computerId: string;
  // Add other properties if returned by the API (e.g., studentId, createdAt)
  [key: string]: any; 
}

// Type for expected error response from the API (for consistency)
interface ApiError {
  message?: string;
}


// --- 2. API Call Function ---

/**
 * Creates a new lab booking for a specific computer in a session.
 * Sends a POST request with JWT authentication.
 *
 * @param payload Information about the booking (labSessionId, computerId)
 * @returns Promise<LabBookingResponse>
 * @throws Error if the API returns a non-201 response or authentication fails.
 */
export const createLabBooking = async (
  payload: LabBookingPayload
): Promise<LabBookingResponse> => {
  try {
    // 1. Retrieve user token
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      removeAuthData();
      throw new Error('No access token found. Please log in.');
    }

    // 2. Perform POST request to create booking
    const response = await axios.post<unknown>( // Use unknown to manually check status
      CREATE_A_LAB_BOOKING_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Allows manual error handling of 4xx/5xx responses
      }
    );

    // 3. Handle success response (usually HTTP 201 Created for a POST)
    if (response.status === 201 || response.status === 200) {
      return response.data as LabBookingResponse;
    }

    // 4. Handle Unauthorized (HTTP 401) explicitly
    if (response.status === 401) {
      removeAuthData();
      throw new Error('Unauthorized. Please log in again.');
    }

    // 5. Handle other API error statuses (e.g., 400 Bad Request, 409 Conflict)
    const serverMessage =
      (response.data as ApiError)?.message ||
      response.statusText ||
      'Failed to create lab booking.';

    throw new Error(serverMessage);

  } catch (error: unknown) {
    // 6. Handle Axios or network errors
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as ApiError)?.message ||
        error.message ||
        'Failed to create lab booking due to an unexpected error.';
      
      if (error.response?.status === 401) {
          removeAuthData();
      }
      throw new Error(message);
    }

    // Re-throw other unhandled errors
    throw error;
  }
};