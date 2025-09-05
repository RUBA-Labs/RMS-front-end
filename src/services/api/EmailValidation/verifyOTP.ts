import axios from 'axios';
import { EMAIL_VALIDATION_API_URL_VERIFY_OTP } from "@/services/api/apiConfig";
import { log } from 'console';

// Defines the structure for user data stored in local storage.
type UserData = {
  name: string;
  email: string;
  password?: string;
};

// Defines the expected structure for a successful API response.
type VerifyOtpResponse = {
  message: string;
};

// Function to verify the OTP with the backend.
export const verifyOtp = async (otp: string): Promise<VerifyOtpResponse> => {
  try {
    // Retrieve data from local storage.
    const signupDataString = localStorage.getItem('signupData');
    const secret = localStorage.getItem('otpSecret');

    if (!signupDataString || !secret) {
      throw new Error('Required user data or OTP secret is missing from local storage.');
    }

    const userData: UserData = JSON.parse(signupDataString);
    const email = userData.email;

    // Construct the request body.
    const requestBody = {
      email: email,
      otp: otp,
      secret: secret,
    };

    console.log('Request Body:', requestBody);
    

    // Send the POST request using Axios.
    const response = await axios.post<VerifyOtpResponse>(EMAIL_VALIDATION_API_URL_VERIFY_OTP, requestBody);

    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    if (axios.isAxiosError(error) && error.response) {
      // Throw an error with the message from the backend.
      throw new Error(error.response.data.message || 'Failed to verify OTP.');
    }
    // Throw a generic error for other issues.
    throw new Error('An unexpected error occurred.');
  }
};
