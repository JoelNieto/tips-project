import { RenderMode, ServerRoute } from '@angular/ssr';

/** All app routes are client-rendered; avoids prerender params for :id segments. */
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
    path: '**',
    renderMode: RenderMode.Client,
  },
];
