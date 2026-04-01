import { AxiosError } from 'axios';

interface ErrorResponse {
  detail: string;
}
/**
 * Lấy error message từ axios error
 */
export function getErrorMessage(error: unknown): string {
    const axiosError = error as AxiosError<ErrorResponse>;
    return axiosError?.response?.data?.detail || axiosError?.message || 'Đã xảy ra lỗi';
}

/**
 * Format date ISO → DD/MM/YYYY HH:mm
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}