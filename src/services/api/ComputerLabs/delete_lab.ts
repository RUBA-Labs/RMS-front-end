import axios, { AxiosResponse } from "axios";
import { DELETE_A_COMPUTER_LAB_API_URL } from "@/services/api/apiConfig";
import { getAuthData, removeAuthData } from "@/services/api/Auth/auth";

// 1. Interface for a successful deletion response
export interface DeleteLabResponse {
  message?: string;
  labId?: string;
  id?: string;
  success?: boolean;
}

// 2. Interface for a common error payload (usually containing a 'message')
// This prevents the need for 'as any' when checking error messages from the backend.
export interface ApiErrorResponse {
  message?: string;
  // Add other common error properties if they exist (e.g., 'statusCode', 'errors')
}

// 3. Define a Union Type for the Axios response data when we handle all statuses (200, 400, 404, etc.)
// The data could be a successful response OR an error response.
type LabDeleteResult = DeleteLabResponse | ApiErrorResponse;

/**
 * Delete a computer lab by its ID
 * Backend endpoint: DELETE /computer-labs/{id}
 * Backend method: ComputerLabsService.remove(id)
 * Requires roles: ADMIN, DEVELOPER, LAB_ALLOCATION_ADMIN
 */
export const deleteLab = async (labId: string): Promise<DeleteLabResponse> => {
  try {
    // Validate labId
    if (!labId || labId.trim() === "") {
      throw new Error("Lab ID is required to delete a lab.");
    }

    // Get authentication token
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    // Construct API URL: DELETE /computer-labs/{id}
    const url = `${DELETE_A_COMPUTER_LAB_API_URL}/${labId}`;

    console.log(`[deleteLab] Deleting lab with ID: ${labId}`);
    console.log(`[deleteLab] API URL: ${url}`);

    // Make DELETE request
    // IMPORTANT: We use the Union Type (LabDeleteResult) here because validateStatus: () => true
    // means the response body could be either a success or a server-defined error object.
    const response: AxiosResponse<LabDeleteResult> = await axios.delete<
      LabDeleteResult
    >(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Handle all status codes
    });

    console.log(`[deleteLab] Response Status: ${response.status}`);
    console.log(`[deleteLab] Response Data:`, JSON.stringify(response.data));

    // Handle success response (200 OK)
    if (response.status === 200) {
      // Cast the data safely to the success type as we confirmed status 200
      const data = response.data as DeleteLabResponse;
      console.log(
        `[deleteLab] Lab with ID "${labId}" has been successfully deleted.`
      );
      return data || { success: true, labId, message: "Lab deleted successfully." };
    }

    // --- Error Handling ---
    // Safely extract the error message using the ApiErrorResponse type
    const errorData = response.data as ApiErrorResponse;
    const serverMessage = errorData.message || response.statusText;


    // Handle 400 Bad Request
    if (response.status === 400) {
      const errorMessage = errorData.message || "Bad request - Invalid Lab ID format";
      console.error(`[deleteLab] 400 Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error("[deleteLab] 401 Unauthorized");
      removeAuthData();
      throw new Error("Your session has expired. Please log in again.");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error("[deleteLab] 403 Forbidden");
      throw new Error(
        "You do not have permission to delete this lab. Required role: ADMIN, DEVELOPER, or LAB_ALLOCATION_ADMIN."
      );
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      const errorMessage = errorData.message || `Lab with ID "${labId}" not found.`;
      console.error(`[deleteLab] 404 Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle 500 Server Error
    if (response.status === 500) {
      console.error("[deleteLab] 500 Server Error");
      throw new Error("Server error. Please try again later.");
    }

    // Handle other errors (General catch-all for non-2xx statuses)
    const fallbackMessage =
      serverMessage ||
      `Failed to delete lab (HTTP ${response.status})`;

    console.error(
      `[deleteLab] Error: ${fallbackMessage} (Status: ${response.status})`
    );
    throw new Error(fallbackMessage);

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Use the ApiErrorResponse interface for the error response data
      const errorData = error.response?.data as ApiErrorResponse;
      
      const message =
        errorData?.message ||
        error.message ||
        "Network error occurred";
        
      console.error(`[deleteLab] Axios Error: ${message}`);
      throw new Error(message);
    }

    if (error instanceof Error) {
      console.error(`[deleteLab] Error: ${error.message}`);
      throw error;
    }

    console.error("[deleteLab] Unknown error occurred");
    throw new Error(
      "An unexpected error occurred while deleting the lab."
    );
  }
};