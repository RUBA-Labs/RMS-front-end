import axios from 'axios';

import { USER_API_URL_CREATE_USER } from '@/services/api/apiConfig';

// Defines the API endpoint for user creation.
// NOTE: Please replace this with your actual backend URL.
const USER_CREATION_API_URL = USER_API_URL_CREATE_USER;

// Defines the structure of the data to be sent in the request body.
type UserCreationData = {
  email: string;
  password: string;
  fullName: string;
  developerSecret: string;
  department: string;
  phone: string;
};

// Defines the updated structure for the successful API response.
type UserCreationResponse = {
  id: number;
  email: string;
  fullName: string;
};

/**
 * Creates a new user by sending a POST request to the backend.
 * This function retrieves the user's details (email, password, fullName)
 * from local storage.
 * @returns {Promise<UserCreationResponse>} A promise that resolves with the API response on success.
 * @throws {Error} Throws an error if the data is missing from local storage or the API request fails.
 */
export const createUser = async (): Promise<UserCreationResponse> => {
  try {
    // Retrieve and parse user data from local storage.
    const storedData = localStorage.getItem('signupData');
    // console.log("Retrieved signupData from local storage:", storedData);
    if (!storedData) {
      throw new Error("User data not found in local storage.");
    }
    const { email, password, fullName } = JSON.parse(storedData);
    // console.log("Parsed user data:", { email, password, fullName});


    // Prepare the payload with hardcoded values for unspecified fields.
    const payload: UserCreationData = {
      email,
      password,
      fullName,
      developerSecret: "not set yet",
      department: "not set yet",
      phone: "not set yet",
    };

    // Send the POST request to the backend using Axios.
    const response = await axios.post<UserCreationResponse>(
      USER_CREATION_API_URL,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle Axios errors with a more specific message from the response.
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create user.');
    }
    // Handle other errors (e.g., JSON parse error, data not found).
    throw new Error('An unexpected error occurred while creating the user.');
  }
};
