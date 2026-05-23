import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'survey/invite/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client,
  },
  {
    // Prerender on `**` breaks route extraction (redirects + dynamic :id routes).
    // SSR shell still serves these via Express; pages render in the browser.
    path: '**',
    renderMode: RenderMode.Client,
  },
];
