import axios from "axios";
import { CREATE_A_NEW_COMPUTER_API_URL } from "@/services/api/apiConfig";
import { getAuthData } from "@/services/api/Auth/auth";

export type ComputerStatus = "functional" | "faulty" | "in-use";

export interface CreateComputerPayload {
  labId: string;
  name: string;
  status: ComputerStatus;
  description?: string;
}

export interface CreateComputerResponse {
  computerId: string;
  labId: string;
  name: string;
  status: ComputerStatus;
  description?: string;
  createdAt?: string;
}

/**
 * Create a new computer and attach it to a lab (labId required).
 * Ensures JWT is attached and returns created computer including labId so
 * the frontend can associate the computer with the correct lab panel.
 */
export const createComputer = async (
  payload: CreateComputerPayload
): Promise<CreateComputerResponse> => {
  try {
    // Validate required fields
    if (!payload?.labId) {
      throw new Error("labId is required to create a computer.");
    }

    if (!payload?.name || payload.name.trim() === "") {
      throw new Error("Computer name is required.");
    }

    if (!payload?.status) {
      throw new Error("Computer status is required.");
    }

    
    const auth = getAuthData();
    const token = auth?.accessToken;
    
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await axios.post<CreateComputerResponse>(
      CREATE_A_NEW_COMPUTER_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true, // handle statuses manually
      }
    );

    console.log(JSON.stringify(response))

    // Success response - status 201 (Created)
    if (response.status === 201) {
      const data = response.data;
      
      // Validate response has required fields
      if (!data.computerId) {
        throw new Error("Server response missing computerId");
      }

      return {
        ...data,
        labId: data.labId ?? payload.labId, // fallback to request payload if omitted
      };
    }

    // Handle error responses
    if (response.status === 400) {
      const errorMessage = (response.data as any)?.message || "Bad request";
      throw new Error(errorMessage);
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.");
    }

    if (response.status === 404) {
      const errorMessage = (response.data as any)?.message || "Lab not found";
      throw new Error(errorMessage);
    }

    const serverMessage =
      (response.data as any)?.message ||
      response.statusText ||
      "Failed to create computer.";

    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        "Failed to create computer.";
      throw new Error(message);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("An unexpected error occurred while creating the computer.");
  }
};