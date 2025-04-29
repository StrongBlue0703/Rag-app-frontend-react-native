import { getApiUrl } from '../config/api';
import { getToken } from './tokenStorage';
import axios, { AxiosRequestConfig, CancelToken, AxiosProgressEvent } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  status: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const apiUrl = getApiUrl();
  return fetch(`${apiUrl}${url}`, {
    ...options,
    headers,
  });
}

export async function get<T = any>(url: string): Promise<ApiResponse<T>> {
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return { data, status: response.status };
}

export async function post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { data, status: response.status };
}

export async function put<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { data, status: response.status };
}

export async function del<T = any>(url: string): Promise<ApiResponse<T>> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });
  const data = await response.json();
  return { data, status: response.status };
}

export async function upload<T = any>(
  url: string,
  formData: FormData,
  config?: {
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    cancelToken?: CancelToken;
  }
): Promise<ApiResponse<T>> {
  const token = await getToken();
  const apiUrl = getApiUrl();

  const axiosConfig: AxiosRequestConfig = {
    method: 'POST',
    url: `${apiUrl}${url}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    onUploadProgress: config?.onUploadProgress,
    cancelToken: config?.cancelToken,
  };

  try {
    const response = await axios(axiosConfig);
    return { data: response.data, status: response.status };
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error('Upload canceled');
    }
    throw error;
  }
}

export function getCancelTokenSource() {
  return axios.CancelToken.source();
}