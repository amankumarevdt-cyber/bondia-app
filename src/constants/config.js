/**
 * API configuration
 *
 * Goals:
 * - Make base URL switching easy (root domain vs /api vs custom)
 * - Allow per-endpoint overrides if backend routes are inconsistent
 * - Keep existing UI/screens unchanged (only networking layer uses this)
 */

/**
 * Root domain (no trailing slash).
 * Example: https://example.com
 */
export const API_DOMAIN = 'https://olive-alpaca-121063.hostingersite.com';

/**
 * Base path prepended to all default endpoints.
 * Common values:
 * - '' (root domain)
 * - '/api'
 * - '/public/api'
 */
export const API_BASE_PATH = '/api';

/**
 * If true, requests are made against `${API_DOMAIN}${API_BASE_PATH}`.
 * If false, requests are made against `${API_DOMAIN}`.
 */
export const USE_API_BASE_PATH = true;

/**
 * Optional per-endpoint overrides.
 * Use these when only some endpoints live under a different prefix.
 *
 * - Keep values as paths beginning with '/'.
 * - If `null`, defaults will be used.
 */
export const ENDPOINT_OVERRIDES = {
  login: null,
  logout: null,
  dashboard: null,
  orders: null,
  parties: null,
  items: null,
};

export const ENDPOINTS = {
  login: '/login',
  logout: '/logout',
  dashboard: '/dashboard',
  orders: '/orders',
  parties: '/parties',
  items: '/items',
};

function normalizePath(p) {
  if (!p) return '';
  return p.startsWith('/') ? p : `/${p}`;
}

function stripTrailingSlash(s) {
  return s?.endsWith('/') ? s.slice(0, -1) : s;
}

export function getApiBaseUrl() {
  const domain = stripTrailingSlash(API_DOMAIN);
  const base = USE_API_BASE_PATH ? normalizePath(API_BASE_PATH) : '';
  return `${domain}${base}`;
}

export function getEndpointPath(key) {
  const override = ENDPOINT_OVERRIDES?.[key];
  if (typeof override === 'string' && override.trim()) return normalizePath(override.trim());
  return normalizePath(ENDPOINTS[key]);
}

/**
 * Backwards compatible export (used by older code).
 * Prefer `getApiBaseUrl()` for new code.
 */
export const BASE_URL = getApiBaseUrl();

export const STORAGE_KEYS = {
  TOKEN: '@bondia_token',
  USER: '@bondia_user',
};