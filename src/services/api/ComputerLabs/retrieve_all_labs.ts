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

    const response = await axios.get(RETRIEVE_ALL_COMPUTER_LABS_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      // backend may return array directly or wrap it in a data property
      const raw: unknown = response.data;
      const items: ApiLab[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : (raw as any)?.labs && Array.isArray((raw as any).labs)
        ? (raw as any).labs
        : [];

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
      (response.data as any)?.message || response.statusText || "Failed to retrieve labs.";
    throw new Error(serverMessage);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as any)?.message || error.message || "Failed to retrieve labs.";
      if (error.response?.status === 401) removeAuthData();
      throw new Error(message);
    }
    throw error;
  }
};