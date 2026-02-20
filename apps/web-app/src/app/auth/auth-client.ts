import { createAuthClient } from 'better-auth/client';

let _client: ReturnType<typeof createAuthClient> | null = null;

export function getAuthClient() {
  if (!_client) {
    _client = createAuthClient({
      baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    });
  }
  return _client;
}
