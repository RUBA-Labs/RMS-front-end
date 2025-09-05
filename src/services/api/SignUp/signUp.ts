// Defines the structure for user data to ensure type safety.
type UserData = {
  name: string;
  email: string;
  password?: string; // Password is optional for scenarios where it might not be needed.
};

// Function to save user data to local storage.
export const saveUserData = (userData: UserData) => {
  try {
    // Stringify the user data object and save it to local storage.
    localStorage.setItem('signupData', JSON.stringify(userData));
    console.log('User data saved to local storage.');
  } catch (error) {
    console.error('Failed to save data to local storage:', error);
  }
};
