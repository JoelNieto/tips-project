import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AuthService } from './auth/auth.service';
import { LocaleService } from './i18n/locale.service';
import { DEFAULT_LOCALE } from './i18n/supported-locales';
import { appRoutes } from './app.routes';

/** Shared browser + server providers (safe during build-time route extraction). */
export const baseAppConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTranslateService({
      fallbackLang: DEFAULT_LOCALE,
      lang: DEFAULT_LOCALE,
    }),
    provideTranslateHttpLoader({
      prefix: './i18n/',
      suffix: '.json',
    }),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      const locale = inject(LocaleService);
      return auth.waitUntilReady().then(() => locale.init());
    }),
  ],
};
