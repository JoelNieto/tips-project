# Railway Deployment

One Railway **project** with two **environments**: `staging` and `production`.

Each environment has two **services**:

| Service | Dockerfile | Public | Health check |
|---------|------------|--------|--------------|
| `web-server` | `Dockerfile.web-server` | No | `/api/health` |
| `web-app` | `Dockerfile.web-app` | Yes | `/health` |

The web-app Docker build uses `NG_BUILD_PARTIAL_SSR=1` (via `nx run web-app:build:deploy`) to skip build-time route extraction. All app routes use client rendering, so extraction is unnecessary and often fails in CI with an opaque `undefined` error.

## Staging environment

### 1. Create services

1. New Project → connect GitHub repo `tips-project`
2. Add environment **staging**
3. Create service **web-server**:
   - Settings → Build → Dockerfile path: `Dockerfile.web-server`
   - Networking → disable public networking (private only)
4. Create service **web-app**:
   - Dockerfile path: `Dockerfile.web-app`
   - Networking → enable public networking
   - Generate domain or add custom domain (e.g. `staging.yourdomain.com`)

### 2. web-server variables (staging)

```env
DATABASE_URL=<neon-staging-branch-connection-string>
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://<staging-public-domain>
TRUSTED_ORIGINS=https://<staging-public-domain>
NODE_ENV=production
PORT=3000
```

Set **`PORT=3000` explicitly** on `web-server`. Railway injects a runtime `PORT` inside the container, but that value is **not** available in the dashboard reference picker (`${{web-server.PORT}}` will be empty unless you define it yourself). This app listens on `process.env.PORT || 3000`, so use `3000`.

### 3. web-app variables (staging)

On **web-app**, set (must be `http://`, not `https://`):

```env
API_URL=http://${{web-server.RAILWAY_PRIVATE_DOMAIN}}:3000
NODE_ENV=production
```

Use a **literal `:3000`** (not `${{web-server.PORT}}`) unless you defined `PORT=3000` on web-server and the reference resolves in the dashboard preview. Wrong or empty port produces `http://….railway.internal:` and the proxy returns 500.

**Verify after deploy:** open **web-app → Deploy logs** and look for:

```text
[web-app] API proxy target: http://...
```

If `/api/health` returns 502 JSON with `"error":"Bad Gateway"`, the target is wrong or **web-server** is not reachable — check **web-server** is running and listening (deploy log should show `Application is running on: http://0.0.0.0:3000/api`).

Alternative without references:

```env
API_URL=http://web-server.railway.internal:3000
```

Use the private hostname from **web-server → Settings → Networking** (service name + `.railway.internal`).

### 4. Deploy triggers

- Service settings → Source → Branch: `staging`
- Enable auto-deploy on push

## Production environment

Duplicate the staging setup in the **production** environment:

| Setting | Production value |
|---------|------------------|
| Git branch | `main` |
| `DATABASE_URL` | Neon **main** branch connection string |
| `BETTER_AUTH_URL` / `TRUSTED_ORIGINS` | Production public URL |
| Custom domain | e.g. `app.yourdomain.com` |

## Service config files

Optional per-service root in Railway dashboard (paste from repo):

- [web-server.railway.json](./web-server.railway.json)
- [web-app.railway.json](./web-app.railway.json)

## GitHub secrets (for CI migrations)

Add these under **Settings → Environments** (recommended), not only repo-level secrets:

| Environment | Secret name | Value |
|-------------|-------------|-------|
| `staging` | `DATABASE_URL` | Neon **staging** branch connection string |
| `production` | `DATABASE_URL` | Neon **main** branch connection string |

Optional per environment: `STAGING_URL` / `PRODUCTION_URL` for deploy smoke tests.

Repo-level aliases `DATABASE_URL_STAGING` and `DATABASE_URL_PRODUCTION` are also supported by the deploy workflow.

**Railway build note:** `DATABASE_URL` is only required on the **web-server** service at **runtime** (migrations on start). Docker build uses a placeholder for `prisma generate`; you do not need `DATABASE_URL` as a Railway build variable unless you customize the Dockerfile.

## Smoke test checklist

After deploy:

1. `GET https://<domain>/health` → `{"status":"ok"}`
2. `GET https://<domain>/api/health` → `{"status":"ok"}`
3. Sign up / sign in
4. GraphQL from dashboard
5. `/survey/invite/<token>` public route
