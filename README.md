# Optimark CMS Backend

NestJS API service for the Optimark Headless CMS. Powers bilingual article management, Cloudflare R2 media storage with WebP optimization, E-E-A-T author profiles, comment moderation, and on-demand ISR cache revalidation to the Landing Page.

---

## Tech Stack

- **Runtime**: Node.js 20+ (Alpine/Slim)
- **Framework**: NestJS 11
- **Database ORM**: Prisma 7 with PostgreSQL (`optimark_cms` isolated schema)
- **Storage**: AWS SDK v3 for Cloudflare R2 / S3
- **Image Processing**: Sharp (automatic WebP conversion & compression)
- **Authentication**: Passport JWT with bcryptjs
- **Package Manager**: pnpm

---

## Architecture & Data Flow

```text
┌─────────────────┐       REST / JSON       ┌──────────────────────┐
│  CMS Frontend   │ ──────────────────────> │  CMS Backend (3001)  │
│  (Next.js 3002) │ <────────────────────── │      (NestJS)        │
└─────────────────┘                         └──────────┬───────────┘
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                           ▼                           ▼                           ▼
                 ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
                 │    PostgreSQL     │       │   Cloudflare R2   │       │   Landing Page    │
                 │  (Schema: cms)    │       │  (WebP Media CDN) │       │ (ISR Revalidate)  │
                 └───────────────────┘       └───────────────────┘       └───────────────────┘
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | HTTP port for the API server |
| `NODE_ENV` | No | `development` | Environment mode (`development` / `production`) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db?schema=optimark_cms` |
| `JWT_SECRET` | **Yes** | — | Secret string for signing JWT tokens |
| `ADMIN_EMAIL` | No | `admin@optimark.ai` | Default admin email auto-seeded on first run |
| `ADMIN_PASSWORD` | No | `AdminOptimark2026!` | Initial password for the admin account |
| `ADMIN_NAME` | No | `Admin Optimark` | Full name of the initial admin user |
| `CORS_ORIGIN` | No | `*` / request origin | Comma-separated allowed origins (e.g. `https://cms.optimark.ai,https://optimark.ai`) |
| `R2_ENDPOINT` | **Yes** | — | Cloudflare R2 S3 endpoint (`https://<account_id>.r2.cloudflarestorage.com`) |
| `R2_ACCESS_KEY` | **Yes** | — | Cloudflare R2 Access Key ID |
| `R2_SECRET_KEY` | **Yes** | — | Cloudflare R2 Secret Access Key |
| `R2_BUCKET` | **Yes** | `optimark-cms-media` | Target bucket name in Cloudflare R2 |
| `R2_PUBLIC_URL` | **Yes** | `https://media.optimark.ai` | Public CDN URL serving the bucket assets |
| `LANDING_PAGE_REVALIDATE_URL` | No | `http://localhost:3000/api/revalidate` | Landing page webhook URL to invalidate ISR cache |
| `REVALIDATE_SECRET` | No | `optimark_cms_revalidate_secret_2026` | Shared secret header matching landing page |
| `PUBLIC_SITE_URL` | No | `https://optimark.ai` | Canonical domain used for sitemap generation |

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your local PostgreSQL and R2 credentials

# 3. Generate Prisma client & sync schema
pnpm prisma generate
pnpm prisma db push

# 4. (Optional) Run initial seed data
node prisma/seed.mjs

# 5. Start dev server
pnpm run start:dev
```

Server starts at `http://localhost:3001/api`.

---

## Production Deployment (Docker)

The included `Dockerfile` handles everything automatically on startup:
1. Compiles the TypeScript application with caching.
2. Runs `npx prisma db push --accept-data-loss` to sync database tables on the specified schema.
3. Runs `node prisma/seed.mjs` (idempotent, skips if data already exists).
4. Boots the production server (`node dist/main`).

```bash
# Build image
docker build -t optimark-cms-backend:latest .

# Run container
docker run -d \
  --name optimark-cms-backend \
  -p 3001:3001 \
  --env-file .env \
  optimark-cms-backend:latest
```

---

## Key API Endpoints

### Public Endpoints (Consumed by Landing Page)
- `GET /api/public/articles` - List published articles (bilingual, filters by category/tag/locale)
- `GET /api/public/articles/:slug` - Single article details with related posts & author E-E-A-T
- `GET /api/public/categories` - List all active categories
- `GET /api/public/tags` - List all tags
- `GET /api/public/people` - Authors and reviewers profiles
- `POST /api/public/comments` - Submit comment (with honeypot & time-gate protection)
- `GET /api/public/comments?articleId=...` - Fetch approved comments
- `GET /api/public/sitemap.xml` - Dynamic XML sitemap of all articles

### Protected Endpoints (Consumed by CMS Frontend, requires Bearer JWT)
- `POST /api/auth/login` - Authenticate admin / editor / author
- `GET /api/auth/profile` - Current user session info
- `POST /api/auth/change-password` - Update account password
- `GET /api/articles` / `POST /api/articles` / `PUT /api/articles/:id` - Full CMS CRUD
- `POST /api/media/upload` - Direct file upload with Sharp WebP optimization
- `GET /api/media` - Media asset browser and alt text management
- `GET /api/comments` / `PATCH /api/comments/:id/status` - Comment moderation queue
