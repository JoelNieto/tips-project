import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

/** Shared browser + server providers (safe during build-time route extraction). */
export const baseAppConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
};
