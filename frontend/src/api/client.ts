import { User } from '../types';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onAuthFailureCallback: (() => void) | null = null;
let onUserUpdateCallback: ((user: User) => void) | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const setOnAuthFailure = (callback: () => void): void => {
  onAuthFailureCallback = callback;
};

export const setOnUserUpdate = (callback: (user: User) => void): void => {
  onUserUpdateCallback = callback;
};

const triggerAuthFailure = (): void => {
  setAccessToken(null);
  if (onAuthFailureCallback) {
    onAuthFailureCallback();
  } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.pathname = '/login';
  }
};

/**
 * Triggers /api/auth/refresh.
 * Shares a single in-flight refresh promise across concurrent requests.
 */
export async function requestTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        triggerAuthFailure();
        return null;
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      if (data.user && onUserUpdateCallback) {
        onUserUpdateCallback(data.user);
      }
      return data.accessToken as string;
    } catch (error) {
      triggerAuthFailure();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Central fetch wrapper used by ALL API calls.
 * - Adds credentials: "include"
 * - Adds Authorization: Bearer <accessToken>
 * - On 401 with code === "TOKEN_EXPIRED", calls /api/auth/refresh once
 *   (sharing a single in-flight promise), and retries the original request once.
 * - If refresh fails, clears state and redirects to login.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const options: RequestInit = {
    ...init,
    credentials: 'include',
  };

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  options.headers = headers;

  let response = await fetch(input, options);

  // Check if we should attempt token refresh on 401 TOKEN_EXPIRED
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  const isAuthRoute = url.includes('/api/auth/refresh') || url.includes('/api/auth/login');

  if (response.status === 401 && !isAuthRoute) {
    let isExpired = false;
    try {
      const cloned = response.clone();
      const body = await cloned.json();
      if (body && body.code === 'TOKEN_EXPIRED') {
        isExpired = true;
      }
    } catch {
      // Body is not JSON
    }

    if (isExpired) {
      const newToken = await requestTokenRefresh();
      if (newToken) {
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        options.headers = retryHeaders;
        response = await fetch(input, options);
      }
    }
  }

  return response;
}
