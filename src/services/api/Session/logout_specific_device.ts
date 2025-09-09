import axios from 'axios';
import { SESSION_API_URL_LOGOUT_SPECIFIC_DEVICE } from '@/services/api/apiConfig';
import { getAuthData } from '@/services/api/Auth/auth';

/**
 * Logs out from a list of specific devices by making a DELETE request for each device.
 * @param selectedDevices An array of device IDs to be logged out.
 */
export async function logoutSpecificDevices(selectedDevices: string[]): Promise<void> {
  const authData = getAuthData();
  const accessToken = authData?.accessToken;

  if (!accessToken) {
    console.error("Access token not found. Unable to sign out of devices.");
    throw new Error("Access token is missing.");
  }

  if (selectedDevices.length === 0) {
    return;
  }

  for (const deviceId of selectedDevices) {
    try {
      await axios.delete(SESSION_API_URL_LOGOUT_SPECIFIC_DEVICE(deviceId), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error(`An error occurred while signing out of device with ID: ${deviceId}`, error);
    }
  }

}
