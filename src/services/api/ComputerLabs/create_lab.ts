import axios from 'axios';

import { CREATE_A_NEW_COMPUTER_LAB_API_URL } from '@/services/api/apiConfig';

import { getAuthData } from '@/services/api/Auth/auth';

export interface CreateLabPayload {
  description: string;
  location: string;
  computersAvailable: number;
  computersWorking: number;
  computersDisable: number;
}

export interface CreateLabResponse {
  labId: string;
  description: string;
  location: string;
  computersAvailable: number;
  computersWorking: number;
  computersDisable: number;
  createdAt?: string;
}

/**
 * Create a new computer lab on the backend.
 * Adds JWT from getAuthData() to the Authorization header.
 * Resolves with the created lab object when the backend returns 201.
 */
export const createLab = async (
  payload: CreateLabPayload
): Promise<CreateLabResponse> => {
  try {
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    const response = await axios.post<CreateLabResponse>(
      CREATE_A_NEW_COMPUTER_LAB_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // we'll handle status manually
      }
    );

    if (response.status === 201) {
      return response.data;
    }

    // Extract message if available
    const serverMessage =
      (response.data as { message?: string })?.message ||
      response.statusText ||
      'Failed to create computer lab.';

    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        'Failed to create computer lab.';
      throw new Error(message);
    }
    throw error;
  }
};
