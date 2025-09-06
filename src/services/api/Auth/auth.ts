/**
 * Defines the structure for the authentication data stored in localStorage.
 */
interface AuthData {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

// A constant key to use for localStorage to avoid typos
const AUTH_STORAGE_KEY = 'auth_data';

/**
 * Saves the authentication data to localStorage.
 * @param data The object containing the access token and user information.
 */
export const saveAuthData = (data: AuthData): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(AUTH_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

/**
 * Retrieves the authentication data from localStorage.
 * @returns The AuthData object or null if no data is found or an error occurs.
 */
export const getAuthData = (): AuthData | null => {
  try {
    const serializedData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Failed to retrieve auth data from localStorage:', error);
    return null;
  }
};

/**
 * Removes the authentication data from localStorage, effectively logging the user out.
 */
export const removeAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove auth data from localStorage:', error);
  }
};
