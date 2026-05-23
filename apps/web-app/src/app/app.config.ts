import { isPlatformServer } from '@angular/common';
import {
  HttpHeaders,
} from '@angular/common/http';
import {
  importProvidersFrom,
  inject,
  mergeApplicationConfig,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { DialogModule } from '@angular/cdk/dialog';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloLink } from '@apollo/client/link';
import { SetContextLink } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { baseAppConfig } from './app.config.base';

export const appConfig = mergeApplicationConfig(baseAppConfig, {
  providers: [
    importProvidersFrom(DialogModule),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
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
});
