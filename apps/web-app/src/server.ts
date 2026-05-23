import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Express, type RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { setDefaultResultOrder } from 'node:dns';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Railway private DNS may resolve to IPv6; prefer IPv4 when connecting to .railway.internal
setDefaultResultOrder('ipv4first');

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

let app: Express | undefined;
let apiProxy: RequestHandler | undefined;

function getApiTarget(): string {
  return (process.env['API_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');
}

function getApiProxy(): RequestHandler {
  if (!apiProxy) {
    const target = getApiTarget();
    console.log(`[web-app] Proxy /api -> ${target}`);
    apiProxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter: '/api',
      on: {
        error: (err, _req, res) => {
          console.error('[web-app] API proxy error:', err.message);
          if (
            res &&
            'writeHead' in res &&
            !res.headersSent &&
            typeof res.writeHead === 'function'
          ) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Bad Gateway',
                message: err.message,
                target,
              }),
            );
          }
        },
      },
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

  expressApp.use((req, res, next) => {
    Promise.resolve(getApiProxy()(req, res, next)).catch(next);
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

  expressApp.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[web-app] Unhandled error:', message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message });
      }
    },
  );

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
  const port = Number(process.env['PORT']) || 4000;
  const host = process.env['HOST'] ?? '0.0.0.0';
  lazyApp.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
    console.log(`[web-app] API proxy target: ${getApiTarget()}`);
    try {
      getApiProxy();
    } catch (err: unknown) {
      console.error('[web-app] Failed to initialize API proxy:', err);
    }
  });
}

export const reqHandler = createNodeRequestHandler(lazyApp);
