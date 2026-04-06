export const API_BASE_URL = 'https://msl.v2.zhsdev.top/api';

// 不需要认证的公开接口列表
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/send-email-code',
  '/auth/geetest-config',
  '/about/donors',
  '/donation/create',
  '/donation/status',
];

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(publicEndpoint => endpoint.startsWith(publicEndpoint));
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized or 403 Forbidden
    // 但不要对公开接口进行跳转
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined' && !isPublicEndpoint) {
      localStorage.removeItem('token');
      window.location.href = '/dashboard/login';
      return new Promise(() => {}); // Stop execution
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}
