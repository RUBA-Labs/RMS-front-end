import axios from "axios";
import { RETRIEVE_ALL_COMPUTERS_OF_A_LAB_API_URL } from "@/services/api/apiConfig";
import { getAuthData, removeAuthData } from "@/services/api/Auth/auth";

export type ComputerStatus = "functional" | "faulty";

export interface ComputerDto {
  computerId: string;
  labId: string;
  name: string;
  status: ComputerStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RetrieveComputersResponse {
  computers: ComputerDto[];
  total: number;
  labId: string;
}

// Type for expected error response from the API
interface ApiError {
  message?: string;
}

/**
 * Retrieve all computers assigned to a specific lab by Lab ID.
 * Backend endpoint: GET /computers/lab/{labId}
 * Calls backend method: ComputersService.findByLabId(labId)
 */
export const retrieveComputersFromLab = async (
  labId: string
): Promise<ComputerDto[]> => {
  try {
    if (!labId || labId.trim() === "") {
      throw new Error("Lab ID is required to retrieve computers.");
    }

    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const API_URL = `${RETRIEVE_ALL_COMPUTERS_OF_A_LAB_API_URL}/lab/${labId}`;

    const response = await axios.get<unknown>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Handle all status codes
    });

    if (response.status === 200) {
      const data = response.data;
      let computers: ComputerDto[] = [];

      if (Array.isArray(data)) {
        computers = data;
      } else if (
        data &&
        typeof data === "object" &&
        "computers" in data &&
        Array.isArray((data as { computers: unknown }).computers)
      ) {
        computers = (data as { computers: ComputerDto[] }).computers;
      }

      return computers.filter((computer) => !!(computer?.computerId && computer?.labId));
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error("Your session has expired. Please log in again.");
    }

    const errorMessage =
      (response.data as ApiError)?.message ||
      `Failed to retrieve computers (HTTP ${response.status})`;
      
    throw new Error(errorMessage);

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as ApiError)?.message || error.message || "Network error occurred";
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while retrieving computers from the lab."
    );
  }
};

/**
 * Retrieve all computers across all labs
 */
export const retrieveAllComputers = async (): Promise<ComputerDto[]> => {
  try {
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const API_BASE_URL = RETRIEVE_ALL_COMPUTERS_OF_A_LAB_API_URL.replace("/lab", "");

    const response = await axios.get<unknown>(
      API_BASE_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 200) {
      const data = response.data;
      let computers: ComputerDto[] = [];

      if (Array.isArray(data)) {
        computers = data;
      } else if (
        data &&
        typeof data === "object" &&
        "computers" in data &&
        Array.isArray((data as { computers: unknown }).computers)
      ) {
        computers = (data as { computers: ComputerDto[] }).computers;
      }
      
      return computers.filter(
        (computer) => computer?.computerId
      );
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error("Unauthorized. Please log in again.");
    }

    const serverMessage =
      (response.data as ApiError)?.message ||
      response.statusText ||
      `Failed to retrieve computers (Status: ${response.status}).`;

    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as ApiError)?.message ||
        error.message ||
        "Failed to retrieve computers.";
      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected error occurred while retrieving computers."
    );
  }
};