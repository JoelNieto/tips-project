import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { baseAppConfig } from './app.config.base';
import { serverRoutes } from './app.routes.server';

/**
 * Server bootstrap config — must not import browser-only providers
 * (hydration, DialogModule, global error listeners). Those break the
 * build-time route-extraction worker with opaque "undefined" errors.
 */
const serverConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(baseAppConfig, serverConfig);
