import axios from 'axios';
import { EMAIL_VALIDATION_API_URL_SEND_OTP } from "@/services/api/apiConfig";

// Defines the structure for the API response.
type OtpResponse = {
  message: string;
  secret: string;
};

// Function to send a request to the backend to send an OTP to the provided email using Axios.
export const reqSendTheOtp = async (email: string): Promise<OtpResponse> => {
  try {
    const response = await axios.post<OtpResponse>(EMAIL_VALIDATION_API_URL_SEND_OTP, {
      email: email,
    });

    const { data } = response;
    
    // Save the secret temporarily to local storage.
    localStorage.setItem('otpSecret', data.secret);

    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to send OTP.');
    }
    throw new Error('An unexpected error occurred.');
  }
};