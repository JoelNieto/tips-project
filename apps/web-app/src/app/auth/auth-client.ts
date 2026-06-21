import { createAuthClient } from 'better-auth/client';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export interface AuthUserUpdate {
  name?: string;
  image?: string | null;
  locale?: string;
}

let _client: ReturnType<typeof createAuthClient> | null = null;

export function getAuthClient() {
  if (!_client) {
    _client = createAuthClient({
      baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      plugins: [
        inferAdditionalFields({
          user: {
            locale: {
              type: 'string',
              required: false,
            },
            role: {
              type: 'string',
              required: false,
            },
          },
        }),
      ],
    });
  }
  return _client;
}

/** updateUser with locale; client types omit additionalFields on this endpoint. */
export function updateAuthUser(data: AuthUserUpdate) {
  return getAuthClient().updateUser(data as never);
}
