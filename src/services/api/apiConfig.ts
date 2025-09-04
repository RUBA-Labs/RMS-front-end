// This file centralizes your API configuration, making it easy to change
// the base URL without modifying every file that makes a request.

/**
 * The base URL for your API.
 * Replace 'https://api.example.com' with your actual API endpoint.
 */
export const API_BASE_URL = 'http://localhost:3001/';

//auth module in the backend
export const AUTH_API_URL = {login:`${API_BASE_URL}auth/login`};