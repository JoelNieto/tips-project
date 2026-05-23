import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Express, type RequestHandler } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

let app: Express | undefined;
let apiProxy: RequestHandler | undefined;

async function getApiProxy(): Promise<RequestHandler> {
  if (!apiProxy) {
    const { createProxyMiddleware } = await import('http-proxy-middleware');
    const apiUrl = process.env['API_URL'] ?? 'http://localhost:3000';
    apiProxy = createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
    });
  }
  return apiProxy;
}

function buildApp(): Express {
  const expressApp = express();
  const angularApp = new AngularNodeAppEngine();

  expressApp.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  expressApp.use('/api', (req, res, next) => {
    void getApiProxy()
      .then((proxy) => proxy(req, res, next))
      .catch(next);
  });

  expressApp.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );

  expressApp.use('/**', (req, res, next) => {
    angularApp
      .handle(req)
      .then((response) =>
        response ? writeResponseToNodeResponse(response, res) : next(),
      )
      .catch(next);
  });

  return expressApp;
}

function getApp(): Express {
  app ??= buildApp();
  return app;
}

const lazyApp = express();
lazyApp.use((req, res, next) => {
  getApp()(req, res, next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  lazyApp.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(lazyApp);
