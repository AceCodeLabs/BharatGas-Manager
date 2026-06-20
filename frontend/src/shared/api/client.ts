import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'bharatgas_token';
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await apiClient.request<T>({
      url: path,
      ...options,
      headers,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 401) clearToken();

      const data = error.response.data as { error?: string } | null;
      throw new ApiError(data?.error || 'Request failed', error.response.status);
    }

    throw new ApiError(error instanceof Error ? error.message : 'Request failed', 0);
  }
}
