import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { USER_API_URL_SEARCH_BY_ROLE } from '@/services/api/apiConfig';

/**
 * Interface for a single User object returned from the API.
 */
export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  // Note: The password field is included in the example but usually
  // it's not good practice to send passwords to the frontend.
  // We'll include it here to match your example, but you might want to remove it
  // from the backend response.
  password?: string; 
}

/**
 * Interface for the API response structure when searching users.
 */
export interface SearchUsersResponse {
  users: User[];
  haveMoreUsers: boolean;
}

/**
 * Fetches a paginated list of users from the backend based on their role.
 *
 * @param role The user role to search for (e.g., 'developer').
 * @param page The page number for pagination (e.g., 1).
 * @returns A promise that resolves to the SearchUsersResponse object.
 * @throws An error if the request fails or if the user is not authenticated.
 */
export const searchUsersByRole = async (role: string, page: number): Promise<SearchUsersResponse> => {
  
  try {
    // 1. Get authentication data
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      console.error('No access token found. User is not authenticated.');
      // Throw an error to be caught by the calling function (e.g., in a React component)
      throw new Error('User is not authenticated.');
    }

    // 2. Get the API endpoint URL
    const endpoint = USER_API_URL_SEARCH_BY_ROLE;

    // 3. Make the GET request with query parameters and headers
    const response = await axios.get<SearchUsersResponse>(endpoint, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
      params: {
        role: role,
        page: page,
      },
    });

    // 4. Return the data from the response
    // Axios wraps the response data in a 'data' property
    return response.data;

  } catch (error) {
    // 5. Handle errors
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || `Error fetching users: ${error.response?.status} ${error.response?.statusText}`;
      console.error(errorMsg, error.response?.data);
      throw new Error(errorMsg);
    } else {
      console.error('An unexpected error occurred while fetching users:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
};