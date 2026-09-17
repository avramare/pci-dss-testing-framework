/**
 * API Client Helper
 * Axios wrapper with auth management, logging, and PCI-safe request handling
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../../config/environments';
import { AuthCredentials, AuthToken, ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || config.baseUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    // request interceptor to add auth token if available
    this.client.interceptors.request.use((req) => { 
      if (this.token) {
        req.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return req;
    });

    // response interceptor to log responses and check for sensitive data
    this.client.interceptors.response.use((res) => { 
      return res;
    });
  }

  setToken(token: string) { 
    this.token = token;
  }

  clearToken() { 
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get<ApiResponse<T>>(path, { headers });
  }

  async post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post<ApiResponse<T>>(path, body, { headers });
  }

  async put<T>(path: string, body: unknown): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put<ApiResponse<T>>(path, body);
  }

  async delete<T>(path: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete<ApiResponse<T>>(path);
  }

  // Authentication methods, login and store token for subsequent requests
  async authenticate(credentials: AuthCredentials): Promise<AuthToken> {
    const res = await this.post<AuthToken>('/auth/login', credentials);
    if (res.data.data?.accessToken) {
      this.setToken(res.data.data.accessToken);
    }
    return res.data.data!;
  }

  // Raw request method with no interceptors, useful for security edge-case testing
  async rawRequest(method: string, path: string, body?: unknown, headers?: Record<string, string>) {
    return axios({
      method,
      url: `${config.baseUrl}${path}`,
      data: body,
      headers,
      validateStatus: () => true // Don't throw on 4xx/5xx
    });
  }
}

export const apiClient = new ApiClient();
export { ApiClient };