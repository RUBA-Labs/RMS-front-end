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

/**
 * Retrieve all computers assigned to a specific lab by Lab ID.
 * Backend endpoint: GET /computers/lab/{labId}
 * Calls backend method: ComputersService.findByLabId(labId)
 */
export const retrieveComputersFromLab = async (
  labId: string
): Promise<ComputerDto[]> => {
  try {
    // Validate labId
    if (!labId || labId.trim() === "") {
      throw new Error("Lab ID is required to retrieve computers.");
    }

    // Get authentication token
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    // Construct API URL: GET /computers/lab/{labId}
    const API_URL = `${RETRIEVE_ALL_COMPUTERS_OF_A_LAB_API_URL}/lab/${labId}`;

    console.log(`[retrieveComputersFromLab] Fetching computers for Lab ID: ${labId}`);
    console.log(`[retrieveComputersFromLab] API URL: ${API_URL}`);

    // Make API request
    const response = await axios.get<ComputerDto[]>(
      API_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true, // Handle all status codes
      }
    );

    console.log(`[retrieveComputersFromLab] Response Status: ${response.status}`);
    console.log(
      `[retrieveComputersFromLab] Response Data:`,
      JSON.stringify(response.data)
    );

    // Handle success response (200 OK)
    if (response.status === 200) {
      const data = response.data;

      // Parse response - handle both array and nested object formats
      let computers: ComputerDto[] = [];

      if (Array.isArray(data)) {
        computers = data;
      } else if (
        data &&
        typeof data === "object" &&
        (data as any)?.computers &&
        Array.isArray((data as any).computers)
      ) {
        computers = (data as any).computers;
      }

      // Validate each computer
      const validComputers = computers.filter((computer) => {
        const isValid = !!(computer?.computerId && computer?.labId);
        if (!isValid) {
          console.warn(
            `[retrieveComputersFromLab] Invalid computer data:`,
            computer
          );
        }
        return isValid;
      });

      console.log(
        `[retrieveComputersFromLab] Successfully retrieved ${validComputers.length} computers for Lab ${labId}`
      );
      return validComputers;
    }else {
        return [];
    }

    // Handle 400 Bad Request
    if (response.status === 400) {
      const errorMessage =
        (response.data as any)?.message ||
        "Bad request - Invalid Lab ID format";
      console.error(`[retrieveComputersFromLab] 400 Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error("[retrieveComputersFromLab] 401 Unauthorized");
      removeAuthData();
      throw new Error("Your session has expired. Please log in again.");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error("[retrieveComputersFromLab] 403 Forbidden");
      throw new Error(
        "You do not have permission to access this lab's computers."
      );
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      const errorMessage =
        (response.data as any)?.message ||
        `No computers found for Lab ID "${labId}"`;
      console.error(`[retrieveComputersFromLab] 404 Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle 500 Server Error
    if (response.status === 500) {
      console.error("[retrieveComputersFromLab] 500 Server Error");
      throw new Error("Server error. Please try again later.");
    }

    // Handle other errors
    const serverMessage =
      (response.data as any)?.message ||
      response.statusText ||
      `Failed to retrieve computers (HTTP ${response.status})`;

    console.error(
      `[retrieveComputersFromLab] Error: ${serverMessage} (Status: ${response.status})`
    );
    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        "Network error occurred";
      console.error(`[retrieveComputersFromLab] Axios Error: ${message}`);
      throw new Error(message);
    }

    if (error instanceof Error) {
      console.error(`[retrieveComputersFromLab] Error: ${error.message}`);
      throw error;
    }

    console.error("[retrieveComputersFromLab] Unknown error occurred");
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

    console.log("[retrieveAllComputers] Fetching all computers with URL:", API_BASE_URL);

    const response = await axios.get<ComputerDto[] | RetrieveComputersResponse>(
      API_BASE_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    console.log("[retrieveAllComputers] Response status:", response.status);
    console.log("[retrieveAllComputers] Response data:", JSON.stringify(response.data));

    if (response.status === 200) {
      const data = response.data;

      let computers: ComputerDto[] = [];

      if (Array.isArray(data)) {
        computers = data;
      } else if (
        data &&
        typeof data === "object" &&
        (data as any)?.computers &&
        Array.isArray((data as any).computers)
      ) {
        computers = (data as any).computers;
      }

      const validComputers = computers.filter(
        (computer) => computer?.computerId
      );
      console.log(
        `[retrieveAllComputers] Successfully retrieved ${validComputers.length} computers across all labs`
      );
      return validComputers;
    }

    if (response.status === 401) {
      removeAuthData();
      throw new Error("Unauthorized. Please log in again.");
    }

    if (response.status === 500) {
      throw new Error("Server error. Please try again later.");
    }

    const serverMessage =
      (response.data as any)?.message ||
      response.statusText ||
      `Failed to retrieve computers (Status: ${response.status}).`;

    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as any)?.message ||
        error.message ||
        "Failed to retrieve computers.";
      console.error("[retrieveAllComputers] Axios error:", message);
      throw new Error(message);
    }

    if (error instanceof Error) {
      console.error("[retrieveAllComputers] Error:", error.message);
      throw error;
    }

    const unexpectedError =
      "An unexpected error occurred while retrieving computers.";
    console.error("[retrieveAllComputers] Unexpected error:", unexpectedError);
    throw new Error(unexpectedError);
  }
};