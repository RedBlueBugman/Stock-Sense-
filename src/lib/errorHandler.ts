import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  error?: {
    message?: string;
    code?: string;
    details?: any;
  };
  message?: string;
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;
    const msg = data?.error?.message || data?.message;

    switch (error.response?.status) {
      case 400:
        return msg || 'Invalid request payload';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return msg || 'A record with this identifier already exists.';
      case 422:
        return 'Validation error. Please verify form inputs.';
      case 429:
        return 'Too many requests. Please slow down and try again.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return msg || 'An unexpected error occurred.';
    }
  }

  return 'An unexpected error occurred.';
};
