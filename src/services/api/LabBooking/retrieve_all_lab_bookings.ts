import axios, { AxiosResponse } from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth'; // Added removeAuthData for 401 handling
import { RETRIEVE_ALL_LAB_BOOKINGS_API_URL_BY_ID } from '../apiConfig'; // The URL function

// --- 1. Type Definitions for the API Response ---

/**
 * Interface for a single computer booking detail object.
 */
export interface BookingDetail {
  computerId: string;
  computerName: string;
  isBooked: boolean;
  bookedByUserId: string | null;
  bookingId: string | null;
}

/**
 * Interface for the entire Lab Session Booking Status response (API Shape).
 */
export interface LabBookingStatusResponse {
  labSessionId: string;
  labSessionName: string;
  labId: string;
  bookingDetails: BookingDetail[];
}

// Type for expected error response from the API (for consistency)
interface ApiError {
  message?: string;
}

// --- 2. API Call Function ---

/**
 * Retrieves the booking status for all computers in a specific lab session,
 * attaching JWT for authorization.
 *
 * @param labSessionId The ID of the lab session to retrieve bookings for.
 * @returns A promise that resolves to the LabBookingStatusResponse data.
 */
export const retrieveAllLabBookings = async (
  labSessionId: string
): Promise<LabBookingStatusResponse> => {
  const apiUrl = RETRIEVE_ALL_LAB_BOOKINGS_API_URL_BY_ID(labSessionId);

  try {
    // 1. Get and check the authorization token
    const auth = getAuthData();
    const token = auth?.accessToken; // Assuming your auth service uses 'accessToken'

    if (!token) {
      removeAuthData(); // Clear potentially expired/bad auth data
      throw new Error('No access token found. Please log in.');
    }

    // 2. Perform the GET request
    // validateStatus: () => true allows us to handle 4xx/5xx responses in the try block
    const response: AxiosResponse<unknown> = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    // 3. Handle successful response (HTTP 200)
    if (response.status === 200) {
      // We assume the response.data directly matches the LabBookingStatusResponse shape
      // as per your provided JSON example.
      return response.data as LabBookingStatusResponse;
    }

    // 4. Handle Unauthorized (HTTP 401) explicitly
    if (response.status === 401) {
      removeAuthData();
      throw new Error('Unauthorized. Please log in again.');
    }

    // 5. Handle other error statuses (e.g., 400, 404, 500)
    const serverMessage =
      (response.data as ApiError)?.message || response.statusText || `Failed to retrieve lab bookings for session ${labSessionId}.`;

    throw new Error(serverMessage);

  } catch (error: unknown) {
    // 6. Handle network errors or errors thrown above
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as ApiError)?.message || error.message || 'Failed to retrieve lab bookings.';

      // If it was a 401 response and we fell into the catch block
      if (error.response?.status === 401) {
        removeAuthData();
      }
      throw new Error(message);
    }
    // Re-throw non-Axios errors (like the "No access token found" error)
    throw error;
  }
};