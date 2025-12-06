import axios from 'axios';
import { DELETE_A_COMPUTER_API_URL } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

// Type for expected error response from the API
interface ApiError {
  message?: string;
}

/**
 * Delete a Computer by ID.
 * Backend endpoint: DELETE /computers/{id}
 */
export const deleteComputer = async (computerId: string): Promise<void> => {
  // 1. Validation
  if (!computerId || computerId.trim() === '') {
    throw new Error('Computer ID is required to delete a computer.');
  }

  const auth = getAuthData();
  const token = auth?.accessToken;

  if (!token) {
    throw new Error('No access token found. Please log in.');
  }

  // 2. URL Construction
  // Assumes DELETE_A_COMPUTER_API_URL points to "http://.../computers"
  const url = `${DELETE_A_COMPUTER_API_URL}/${computerId}`;

  try {
    // 3. API Call
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Handle status codes manually
    });

    // 4. Response Handling
    if (response.status === 200 || response.status === 204) {
      return; // Success
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('Forbidden. You do not have permission to delete computers.');
    }

    if (response.status === 404) {
      throw new Error(`Computer with ID "${computerId}" not found.`);
    }

    if (response.status === 409) {
      // Handle conflict if the computer is currently part of an active booking
      const msg = (response.data as ApiError)?.message || 'Cannot delete computer. It may have active bookings.';
      throw new Error(msg);
    }

    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    const serverMsg = (response.data as ApiError)?.message || response.statusText || `Delete failed (status ${response.status}).`;
    throw new Error(serverMsg);

  } catch (err: unknown) {
    // 5. Network/Unexpected Error Handling
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as ApiError)?.message ||
        err.message ||
        'Network error while deleting computer.';
      throw new Error(message);
    }
    if (err instanceof Error) throw err;
    throw new Error('Unexpected error while deleting computer.');
  }
};