import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@env';

// Determine base API URL from environment variables
const getBaseUrl = (): string => {
  if (!API_BASE_URL) {
    throw new Error('CRITICAL CONFIG ERROR: API_BASE_URL environment variable is missing.');
  }
  return API_BASE_URL;
};

// Extend Axios request configuration types to support retry tracking metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000;

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // Increased to 60 seconds for Render spin-up
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * Dynamically retrieves session token from persistent auth store and attaches as Bearer header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { useAuthStore } = require('../../stores/authStore');
    const token = useAuthStore.getState().sessionToken;
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Implements auto-retry loop with exponential backoff for server/network/timeout errors,
 * and session clearance on authentication failures (401).
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as ExtendedAxiosRequestConfig;
    if (!config) {
      return Promise.reject(error);
    }

    // 1. Session Expiry Handling
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Unauthorized request detected. Clearing auth store session.');
      }
      const { useAuthStore } = require('../../stores/authStore');
      await useAuthStore.getState().signOut();
      return Promise.reject(error);
    }

    // 2. Determine if the error is retryable (network issues, timeouts, or server-side 5xx errors)
    const isNetworkError = !error.response;
    const isTimeout = error.code === 'ECONNABORTED';
    const isServerError = error.response && error.response.status >= 500;

    if (isNetworkError || isTimeout || isServerError) {
      config._retryCount = config._retryCount ?? 0;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = RETRY_DELAY_BASE_MS * Math.pow(2, config._retryCount - 1);

        if (process.env.NODE_ENV !== 'test') {
          console.log(
            `API request failed: ${error.message}. Retrying request (${config._retryCount}/${MAX_RETRIES}) in ${delay}ms...`
          );
        }

        // Wait for the backoff duration
        await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));

        // Re-execute request with updated config
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);
