import axios from 'axios';
import { getAuthData, AuthData } from '@/services/api/Auth/auth';
import { DEVELOPER_API_URL_GET_TABLE_DATA } from '@/services/api/apiConfig';

export const getTableData = async (tableName: string): Promise<any> => {
  try {
    const authData: AuthData | null = getAuthData();
    if (!authData || !authData.accessToken) {
      throw new Error('User is not authenticated.');
    }

    const endpoint = DEVELOPER_API_URL_GET_TABLE_DATA(tableName);

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || `Error fetching table data: ${error.response?.status} ${error.response?.statusText}`;
      console.error(errorMsg, error.response?.data);
      throw new Error(errorMsg);
    } else {
      console.error('An unexpected error occurred while fetching table data:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
};
