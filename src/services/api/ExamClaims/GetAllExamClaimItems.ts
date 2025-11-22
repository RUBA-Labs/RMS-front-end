import axios from 'axios';
import { getAuthData, removeAuthData } from '@/services/api/Auth/auth';
import { RETRIEVE_ALL_EXAM_CLAIMS_API_URL } from '@/services/api/apiConfig';

// --- Interfaces ---

export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  department: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamClaimParentDetails {
  id: number;
  name: string;
  faculty: string;
  position: string;
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimStatus {
  id: number;
  status: string; // e.g., "PENDING", "APPROVED"
  createdAt: string;
  updatedAt: string;
}

export interface ExamClaimItem {
  id: number;
  examName: string;
  examDate: string;
  venue: string;
  amount: string;
  examClaim: ExamClaimParentDetails;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

// --- API Service Function ---

/**
 * Fetches all exam claim items from the backend.
 * Authenticates using the Bearer token and handles 401 errors automatically.
 * * @returns A Promise that resolves with an array of ExamClaimItem objects.
 * @throws An error if the request fails or the session is invalid.
 */
export const getAllExamClaimItems = async (): Promise<ExamClaimItem[]> => {
  try {
    // 1. Strict Authentication Guard
    const authData = getAuthData();
    const accessToken = authData?.accessToken;

    if (!accessToken) {
      removeAuthData();
      throw new Error('No authentication token found. Please log in again.');
    }

    const url = RETRIEVE_ALL_EXAM_CLAIMS_API_URL;

    // 2. Axios Request with Manual Header Injection
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 3. Data Transformation / Type Mapping
    // We map the response to ensure it strictly matches our interface structure.
    const claims: ExamClaimItem[] = response.data.map((item: ExamClaimItem) => ({
      id: item.id,
      examName: item.examName,
      examDate: item.examDate,
      venue: item.venue,
      amount: item.amount,
      examClaim: item.examClaim,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return claims;

  } catch (error: unknown) {
    // 4. Standardized Error Handling
    if (axios.isAxiosError(error)) {
      // Auto-Logout on 401 Unauthorized
      if (error.response?.status === 401) {
        removeAuthData();
        console.error('Session expired or unauthorized. Clearing local data.');
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch exam claim items.';
      console.error('API request failed:', errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error('Error fetching exam claims:', (error as Error).message);
      throw error;
    }
  }
};