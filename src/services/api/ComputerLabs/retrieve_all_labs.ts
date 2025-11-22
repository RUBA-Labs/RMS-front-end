import axios from "axios";
import { RETRIEVE_ALL_COMPUTER_LABS_API_URL } from "@/services/api/apiConfig";
import { getAuthData, removeAuthData } from "@/services/api/Auth/auth";

/**
 * API shape for a lab returned by backend.
 */
interface ApiLab {
  labId: string;
  description: string;
  location: string;
  computersAvailable: number;
  computersWorking: number;
  computersDisable: number;
  computers?: unknown[]; // optional, backend may include detailed computers
  createdAt?: string;
}

/**
 * Frontend Lab shape used in LabManagement.tsx
 */
export interface LabDto {
  id: string;
  name: string;
  location: string;
  capacity: number;
  computers: unknown[];
  computersWorking: number;
  computersDisable: number;
  createdAt?: string;
}

// Type for expected error response from the API
interface ApiError {
  message?: string;
}

/**
 * Retrieve all labs from backend, attach JWT and map to frontend shape.
 */
export const retrieveAllLabs = async (): Promise<LabDto[]> => {
  try {
    const auth = getAuthData();
    const token = auth?.accessToken;

    if (!token) {
      removeAuthData();
      throw new Error("No access token found. Please log in.");
    }

    const response = await axios.get<unknown>(RETRIEVE_ALL_COMPUTER_LABS_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const raw = response.data;
      let items: ApiLab[] = [];

      if (Array.isArray(raw)) {
        items = raw;
      } else if (typeof raw === "object" && raw !== null) {
        if ("data" in raw && Array.isArray((raw as { data: unknown }).data)) {
          items = (raw as { data: ApiLab[] }).data;
        } else if ("labs" in raw && Array.isArray((raw as { labs: unknown }).labs)) {
          items = (raw as { labs: ApiLab[] }).labs;
        }
      }

      const mapped = items.map<LabDto>((lab) => ({
        id: lab.labId,
        name: lab.description,
        location: lab.location,
        capacity: lab.computersAvailable,
        computersWorking: lab.computersWorking ?? 0,
        computersDisable: lab.computersDisable ?? Math.max(0, (lab.computersAvailable ?? 0) - (lab.computersWorking ?? 0)),
        computers: lab.computers ?? [],
        createdAt: lab.createdAt,
      }));

      return mapped;
    }

    // handle unauthorized explicitly
    if (response.status === 401) {
      removeAuthData();
      throw new Error("Unauthorized. Please log in again.");
    }

    const serverMessage =
      (response.data as ApiError)?.message || response.statusText || "Failed to retrieve labs.";
    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as ApiError)?.message || error.message || "Failed to retrieve labs.";
      if (error.response?.status === 401) removeAuthData();
      throw new Error(message);
    }
    throw error;
  }
};