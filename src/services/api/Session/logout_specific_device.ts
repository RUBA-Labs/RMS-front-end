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
    console.log("No devices selected for logout. Skipping API calls.");
    return;
  }

  console.log(`Attempting to sign out from the following devices: ${selectedDevices.join(', ')}`);

  for (const deviceId of selectedDevices) {
    try {
      await axios.delete(SESSION_API_URL_LOGOUT_SPECIFIC_DEVICE(deviceId), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log(`Successfully signed out of device with ID: ${deviceId}`);
    } catch (error) {
      console.error(`An error occurred while signing out of device with ID: ${deviceId}`, error);
    }
  }

  console.log("Finished attempting to sign out from all specified devices.");
}
