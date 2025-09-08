
import axios from 'axios';
import { AUTH_API_URL } from '@/services/api/apiConfig';

/**
 * A function to handle the login POST request using Axios.
 * Axios simplifies the process with a cleaner API and automatic JSON parsing.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A Promise that resolves with the API response data on success.
 * @throws An error if the request fails (e.g., network error, bad credentials).
 */
export const loginPost = async (email: string, password: string) => {
  // Construct the full API endpoint URL for the login route
  const url = AUTH_API_URL.login;

  // The 'data' object below will be automatically converted into a JSON body
  // by Axios, matching the format you specified: { "email": "...", "password": "..." }
  const data = {
    email,
    password
  };

  try {
    const response = await axios.post(url, data);

    return response.data;
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    if (axios.isAxiosError(error)) {
      // Check for the nested message property from the specific backend error format
      const backendMessage = error.response?.data?.message?.message || error.response?.data?.message;
      const errorMessage = backendMessage || 'Login failed with an unexpected error.';
      
      console.error('Login request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      // For non-Axios errors, check if it has a message property
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Error during login request:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};
