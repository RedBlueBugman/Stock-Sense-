import { toast } from 'sonner';

export const showSuccess = (message: string) => {
  toast.success(message, { duration: 3000, position: 'top-right' });
};

export const showError = (message: string) => {
  toast.error(message, { duration: 4000, position: 'top-right' });
};

export const showLoading = (message: string) => {
  return toast.loading(message, { position: 'top-right' });
};

export const updateToast = (id: string | number, message: string, type: 'success' | 'error') => {
  toast[type](message, { id });
};
