import { isPlatformServer } from '@angular/common';
import {
  HttpHeaders,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloLink } from '@apollo/client/link';
import { SetContextLink } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { appRoutes } from './app.routes';

/** Shared browser + server providers (safe during build-time route extraction). */
export const baseAppConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const platformId = inject(PLATFORM_ID);
      const apiBase = isPlatformServer(platformId)
        ? (process.env['API_URL'] ?? 'http://localhost:3000')
        : '';
      const graphqlUri = apiBase
        ? `${apiBase.replace(/\/$/, '')}/api/graphql`
        : '/api/graphql';

      const headers = new SetContextLink(() => ({
        headers: new HttpHeaders({
          Accept: 'application/json, charset=utf-8',
        }),
      }));

      return {
        link: ApolloLink.from([
          headers,
          httpLink.create({
            uri: graphqlUri,
            withCredentials: true,
          }),
        ]),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
          },
        },
      };
    }),
  ],
};
