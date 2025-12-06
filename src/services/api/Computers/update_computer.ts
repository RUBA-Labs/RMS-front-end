import axios from 'axios';
import { UPDATE_A_COMPUTER_API_URL } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

// Define strict types for Status to match your backend Logic
export type ComputerStatus = 'functional' | 'faulty';

export interface UpdateComputerPayload {
  labId?: string;       // Optional: Include if moving the computer to a new lab
  name?: string;        // Optional: e.g. "Lab-A-PC-01"
  status?: ComputerStatus; 
  description?: string; // Optional: e.g. "Dell OptiPlex 7010..."
}

export interface UpdateComputerResponse {
  computerId: string;
  labId: string;
  name: string;
  status: ComputerStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for expected error response from the API
interface ApiError {
  message?: string;
}

/**
 * Update a computer's details (Status, Name, Description, or Lab Location)
 * Backend endpoint: PATCH /computers/{computerId}
 */
export const updateComputer = async (
  computerId: string,
  payload: UpdateComputerPayload
): Promise<UpdateComputerResponse> => {
  // 1. Validation
  if (!computerId || computerId.trim() === '') {
    throw new Error('computerId is required to update a computer.');
  }

  const auth = getAuthData();
  const token = auth?.accessToken;
  
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }

  // 2. URL Construction
  // Assumes UPDATE_A_COMPUTER_API_URL points to "http://.../computers"
  const url = `${UPDATE_A_COMPUTER_API_URL}/${computerId}`;

  try {
    // 3. API Call
    const response = await axios.patch<UpdateComputerResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Handle status codes manually
    });

    // 4. Response Handling
    if (response.status === 200) {
      return response.data;
    }

    if (response.status === 400) {
      const msg = (response.data as ApiError)?.message || 'Bad request. Check your input data.';
      throw new Error(msg);
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('Forbidden. You do not have permission to update computers.');
    }

    if (response.status === 404) {
      throw new Error(`Computer with ID "${computerId}" not found.`);
    }

    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    const serverMsg = (response.data as ApiError)?.message || response.statusText || `Update failed (status ${response.status}).`;
    throw new Error(serverMsg);

  } catch (err: unknown) {
    // 5. Network/Unexpected Error Handling
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as ApiError)?.message ||
        err.message ||
        'Network error while updating computer.';
      throw new Error(message);
    }
    if (err instanceof Error) throw err;
    throw new Error('Unexpected error while updating computer.');
  }
};