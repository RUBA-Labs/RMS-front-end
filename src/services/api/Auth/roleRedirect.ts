import { Role } from "@/services/api/Auth/roles";

/**
 * Determines the correct dashboard path based on the user's role.
 * This centralizes the role-based redirection logic for easy maintenance.
 * @param role - The user's role from the API response.
 * @returns The string path to the user's dashboard.
 */
export const getDashboardPathByRole = (role: string): string => {
  switch (role) {
    case Role.ADMIN:
    case Role.TIME_TABLE_ADMIN:
    case Role.EXAM_CLAIMS_ADMIN:
    case Role.LAB_ALLOCATION_ADMIN:
    case Role.DEVELOPER:
    case Role.USER:
      return `/${role}`;
    case Role.STUDENT:
    case Role.FIRST_YEAR_STUDENT:
      return '/student';
    case Role.ACADEMIC:
      return '/academic';
    case Role.NON_ACADEMIC:
      return '/non-academic';
    default:
      return '/dashboard';
  }
};
