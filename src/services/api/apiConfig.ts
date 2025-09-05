// This file centralizes your API configuration, making it easy to change
// the base URL without modifying every file that makes a request.

/**
 * The base URL for your API.
 * Replace 'https://api.example.com' with your actual API endpoint.
 */
export const API_BASE_URL = 'http://localhost:3001/';

//auth module in the backend
export const AUTH_API_URL = {login:`${API_BASE_URL}auth/login`};

// session module in the backend
export const SESSION_API_URL_IS_VALID = `${API_BASE_URL}session/is-valid`;
export const SESSION_API_URL_LOGOUT_THIS_DEVICE = `${API_BASE_URL}session/logout-from-this-device/logout`;
export const SESSION_API_URL_LOGOUT_ALL_DEVICES = `${API_BASE_URL}session`;
export const SESSION_API_URL_GET_USER_SESSIONS = `${API_BASE_URL}session`;
export const SESSION_API_URL_LOGOUT_SPECIFIC_DEVICE = (deviceId: string) => `${API_BASE_URL}session/${deviceId}`;


// email validation module in the backend
export const EMAIL_VALIDATION_API_URL_SEND_OTP = `${API_BASE_URL}email-validation/send-otp`;
export const EMAIL_VALIDATION_API_URL_VERIFY_OTP = `${API_BASE_URL}email-validation/verify-otp`;