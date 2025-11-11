import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { USER_API_URL_GET_USER_PAGE_BY_PAGE } from '@/services/api/apiConfig';

/**
 * Interface for a single User object.
 * (This should be identical to the User interface in SearchUsersByRole.ts)
 */
export interface User {
  id: number;
  email: string;
  role: string; // The API returns a general string for role
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  password?: string; // Included to match example, but often omitted
}

/**
 * Interface for the API response structure when fetching paginated users.
 */
export interface PaginatedUsersResponse {
  users: User[];
  haveMoreUsers: boolean;
}

/**
 * Retrieves a paginated list of all users from the backend.
 *
 * @param page The page number to retrieve (e.g., 1).
 * @returns A promise that resolves to the PaginatedUsersResponse object.
 * @throws An error if the request fails or if the user is not authenticated.
 */
export const retrieveUsersByPage = async (page: number): Promise<PaginatedUsersResponse> => {
  
  try {
    // 1. Get authentication data
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      console.error('No access token found. User is not authenticated.');
      throw new Error('User is not authenticated.');
    }

    // 2. Get the API endpoint URL
    const endpoint = USER_API_URL_GET_USER_PAGE_BY_PAGE;

    // 3. Make the GET request with query parameters and headers
    const response = await axios.get<PaginatedUsersResponse>(endpoint, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
      params: {
        page: page, // Add the 'page' number as a query parameter
      },
    });

    // 4. Return the data from the response
    return response.data;

  } catch (error) {
    // 5. Handle errors
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || `Error fetching paginated users: ${error.response?.status} ${error.response?.statusText}`;
      console.error(errorMsg, error.response?.data);
      throw new Error(errorMsg);
    } else {
      console.error('An unexpected error occurred while fetching paginated users:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
};

