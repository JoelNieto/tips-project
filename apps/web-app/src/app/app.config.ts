import { importProvidersFrom, mergeApplicationConfig } from '@angular/core';
import { DialogModule } from '@angular/cdk/dialog';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

import { baseAppConfig } from './app.config.base';

export const appConfig = mergeApplicationConfig(baseAppConfig, {
  providers: [
    importProvidersFrom(DialogModule),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
  ],
});
