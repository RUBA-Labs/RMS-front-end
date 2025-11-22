// This file centralizes your API configuration, making it easy to change
// the base URL without modifying every file that makes a request.

/**
 * The base URL for your API.
 * Replace 'https://api.example.com' with your actual API endpoint.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

//user module in the backend
export const USER_API_URL_CREATE_USER = `${API_BASE_URL}user`;
export const USER_API_URL_SEARCH_BY_ROLE = `${API_BASE_URL}user/search-by-role$`;
export const USER_API_URL_GET_USER_PAGE_BY_PAGE =`${API_BASE_URL}user/paged`;

//Password Reset
export const PASSWORD_RESET_API_URL_SEND_OTP = `${API_BASE_URL}password-reset/request`;
export const PASSWORD_RESET_API_URL_VERIFY_OTP = `${API_BASE_URL}password-reset/reset`;

//notification module in the backend
export const NOTIFICATION_API_URL_GET_NOTIFICATIONS = `${API_BASE_URL}notification`;
export const NOTIFICATION_API_URL_MARK_AS_READ = (notificationId: string) => `${API_BASE_URL}notification/${notificationId}/read`;
export const NOTIFICATION_API_URL_MARK_AS_UNREAD = (notificationId: string) => `${API_BASE_URL}notification/${notificationId}/unread`;
export const NOTIFICATION_API_URL_GET_FULL_NOTIFICATION_BY_ID = (notificationId: string) => `${API_BASE_URL}notification/${notificationId}`;


//user profile module in the backend
export const USER_PROFILE_API_URL_GET_USER_DATA = `${API_BASE_URL}user-profile`;
export const USER_PROFILE_API_URL_CHANGE_PASSWORD = `${API_BASE_URL}user-profile/change-password`;
export const USER_PROFILE_API_URL_UPDATE_PROFILE = `${API_BASE_URL}user-profile`;

//computer labs module in the backend
export const CREATE_A_NEW_COMPUTER_LAB_API_URL = `${API_BASE_URL}computer-labs`;
export const RETRIEVE_ALL_COMPUTER_LABS_API_URL = `${API_BASE_URL}computer-labs`;
export const UPDATE_A_COMPUTER_LAB_API_URL = `${API_BASE_URL}computer-labs`;

//exam claims module in the backend
export const EXAM_CLAIMS_API_URL_CREATE_EXAM_CLAIM = `${API_BASE_URL}exam-claims`;
export const ADD_CLAIMS = `${API_BASE_URL}exam-claims/add-item`;
export const RETRIEVE_ALL_MY_EXAM_CLAIMS_API_URL = `${API_BASE_URL}exam-claims/my-items`;
export const RETRIEVE_ALL_EXAM_CLAIMS_API_URL = `${API_BASE_URL}exam-claims/items`;
export const UPDATE_STATUS_CLAIM_API_URL_BY_ID = (claimId: number) => `${API_BASE_URL}exam-claims/item/${claimId}/status`;
export const DELETE_EXAM_CLAIM_ITEM_API_URL_BY_ID = (claimId: number) => `${API_BASE_URL}exam-claims/item/${claimId}`;


//computer module in the backend
export const CREATE_A_NEW_COMPUTER_API_URL = `${API_BASE_URL}computers`;
export const RETRIEVE_ALL_COMPUTERS_OF_A_LAB_API_URL = `${API_BASE_URL}computers`;

//Announcements
export const CREATE_ANNOUNCEMENT_API_URL = `${API_BASE_URL}announcements`;

