import axios from 'axios';
import { UPDATE_A_COMPUTER_LAB_API_URL } from '@/services/api/apiConfig';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';

export interface UpdateLabPayload {
  description?: string;
  location?: string;
  computersAvailable?: number;
  computersWorking?: number;
  computersDisable?: number;
}

export interface UpdateLabResponse {
  labId?: string;
  id?: string;
  description?: string;
  location?: string;
  computersAvailable?: number;
  computersWorking?: number;
  computers?: unknown[];
}

// Type for expected error response from the API
interface ApiError {
  message?: string;
}

export const updateLab = async (
  labId: string,
  payload: UpdateLabPayload
): Promise<UpdateLabResponse> => {
  if (!labId || labId.trim() === '') {
    throw new Error('labId is required to update a lab.');
  }

  const auth = getAuthData();
  const token = auth?.accessToken;
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }

  const url = `${UPDATE_A_COMPUTER_LAB_API_URL}/${labId}`;

  try {
    const response = await axios.patch<UpdateLabResponse>(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      return response.data;
    }

    if (response.status === 400) {
      const msg = (response.data as ApiError)?.message || 'Bad request. Invalid data.';
      throw new Error(msg);
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error('Unauthorized. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('Forbidden. You do not have permission to update this lab.');
    }

    if (response.status === 404) {
      throw new Error(`Lab with ID "${labId}" not found.`);
    }

    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    const serverMsg = (response.data as ApiError)?.message || response.statusText || `Update failed (status ${response.status}).`;
    throw new Error(serverMsg);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const message =
        (err.response?.data as ApiError)?.message ||
        err.message ||
        'Network error while updating lab.';
      throw new Error(message);
    }
    if (err instanceof Error) throw err;
    throw new Error('Unexpected error while updating lab.');
  }
};