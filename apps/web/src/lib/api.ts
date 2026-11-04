const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '' : process.env.API_URL || 'http://localhost:4000');

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('ginie_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Attempt silent token refresh on 401
  if (
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/otp') &&
    !path.includes('/auth/refresh') &&
    !path.includes('/auth/register') &&
    !path.includes('/auth/exit-impersonation')
  ) {
    const refreshToken = localStorage.getItem('ginie_refresh_token');
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data?.accessToken) {
              localStorage.setItem('ginie_token', data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem('ginie_refresh_token', data.refreshToken);
              }
              onTokenRefreshed(data.accessToken);
              headers['Authorization'] = `Bearer ${data.accessToken}`;
              response = await fetch(url, {
                ...options,
                headers,
              });
            }
          }
        } catch (err) {
          console.warn('Silent session renewal error:', err);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Wait for active refresh to finish
        const retryToken = await new Promise<string>((resolve) => {
          addRefreshSubscriber((newToken) => resolve(newToken));
        });
        headers['Authorization'] = `Bearer ${retryToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== 'undefined' &&
      !path.includes('/auth/exit-impersonation')
    ) {
      localStorage.removeItem('ginie_token');
      localStorage.removeItem('ginie_refresh_token');
      localStorage.removeItem('ginie_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || 'Something went wrong. Please check your internet and try again.');
  }

  return data;
}

export const api = {
  get: <T = any>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: any) =>
    apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(path: string, body?: any) =>
    apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
