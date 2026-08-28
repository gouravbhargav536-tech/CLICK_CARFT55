/**
 * Centralized API helper for safe request handling.
 * Does NOT override window.fetch or globalThis.fetch.
 */

export async function apiRequest(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, options);
}
