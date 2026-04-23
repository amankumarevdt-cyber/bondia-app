import axios from 'axios';
import { getToken } from '../utils/storage';
import { getApiBaseUrl } from '../constants/config';

let _onUnauthorized = null;
let _didAutoLogout = false;

export const setUnauthorizedHandler = (handler) => {
  _onUnauthorized = handler;
};

// Temporary debug logs (dev-only)
const DEBUG_API = typeof __DEV__ === 'boolean' ? __DEV__ : true;

function isProbablyHtml(payload, contentType) {
  if (contentType && String(contentType).toLowerCase().includes('text/html')) return true;
  if (typeof payload !== 'string') return false;
  const s = payload.trim().slice(0, 200).toLowerCase();
  return (
    s.startsWith('<!doctype html') ||
    s.startsWith('<html') ||
    s.includes('<head') ||
    s.includes('<body')
  );
}

function buildErrorMessage(error) {
  // Timeout
  if (error?.code === 'ECONNABORTED') {
    return 'Network timeout. Please check your connection and try again.';
  }

  // No response means network/DNS/CORS (web) issues
  if (!error?.response) {
    return 'Network error. Please check your internet connection.';
  }

  const status = error.response.status;
  const data = error.response.data;

  if (status === 404) return 'API route not found (404). Please verify BASE_URL and endpoints.';
  if (status === 419) return 'CSRF token mismatch (419). Backend must support token-based mobile auth.';
  if (status === 401) return 'Unauthorized (401). Your session may have expired. Please login again.';

  if (data && typeof data === 'object') {
    const msg =
      data.message ||
      data.error ||
      data?.data?.message ||
      data?.data?.error;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }

  return `Request failed (${status}). Please try again.`;
}

function redact(data) {
  if (!data || typeof data !== 'object') return data;
  // Shallow clone is enough for our payloads; avoid logging credentials.
  const out = Array.isArray(data) ? [...data] : { ...data };
  if ('password' in out) out.password = '***';
  return out;
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 25000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Force JSON-only intent (helps some backends choose the right response)
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

    if (DEBUG_API) {
      const method = (config.method || 'GET').toUpperCase();
      const url = `${config.baseURL || ''}${config.url || ''}`;
      const safeHeaders = {
        Accept: config.headers?.Accept,
        'Content-Type': config.headers?.['Content-Type'],
        Authorization: token ? 'Bearer ***' : undefined,
      };
      // eslint-disable-next-line no-console
      console.log('[API]', method, url, { headers: safeHeaders, data: redact(config.data) });
    }
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => {
    const contentType = response.headers?.['content-type'];
    if (isProbablyHtml(response.data, contentType)) {
      const err = new Error(
        'Server returned HTML instead of JSON. Check API base path/endpoints.',
      );
      err.code = 'E_HTML_RESPONSE';
      err.response = response;
      throw err;
    }

    if (DEBUG_API) {
      // eslint-disable-next-line no-console
      console.log('[API]', 'RES', response.status, response.config?.url, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (DEBUG_API) {
      // eslint-disable-next-line no-console
      console.log('[API]', 'ERR', status || error.code || 'UNKNOWN', error?.config?.url, {
        message: error?.message,
        data: error?.response?.data,
      });
    }

    // Auto logout once on 401 (prevents loops when logout endpoint also 401s)
    if (status === 401 && _onUnauthorized && !_didAutoLogout) {
      _didAutoLogout = true;
      try {
        _onUnauthorized();
      } finally {
        setTimeout(() => {
          _didAutoLogout = false;
        }, 1500);
      }
    }

    const msg = buildErrorMessage(error);
    const wrapped = new Error(msg);
    wrapped.code = error.code || status || 'E_API';
    wrapped.status = status;
    wrapped.original = error;
    wrapped.response = error.response;
    return Promise.reject(wrapped);
  },
);

export default client;
