# Reborn Dolls — Full-Stack E-Commerce Platform

A premium direct-to-consumer e-commerce platform for collectible reborn dolls. Built as a Turborepo monorepo with a Next.js storefront and a separate Next.js admin dashboard.

---

## Architecture

```
reborn-dolls/
├── apps/
│   ├── web/          # Public storefront + customer portal (port 3000)
│   └── admin/        # Standalone admin dashboard (port 3001)
├── packages/
│   ├── ui/           # Shared design system components
│   ├── db/           # Prisma schema + migrations
│   ├── config/       # Shared Tailwind config with brand tokens
│   └── types/        # Shared TypeScript types
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS with custom brand tokens |
| Database | PostgreSQL (Render) |
| ORM | Prisma |
| Auth | JWT (jose) + httpOnly cookies |
| Email | Resend |
| Images | Cloudinary |
| Product Scraper | Browserless API |
| State | Zustand (cart, wishlist, auth, UI) |

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (create a free one on [Render](https://render.com))
- [Resend](https://resend.com) account for emails
- [Cloudinary](https://cloudinary.com) account for images
- [Browserless](https://browserless.io) account (optional, for product scraper)

### 2. Clone & Install

```bash
git clone <your-repo>
cd reborn-dolls
npm install
```

### 3. Environment Variables

Copy the example env files and fill in your values:

```bash
# For the storefront
cp apps/web/.env.local.example apps/web/.env.local

# For the admin
cp apps/admin/.env.local.example apps/admin/.env.local
```

**Required variables:**
```
DATABASE_URL         # PostgreSQL connection string from Render
JWT_SECRET           # Strong random secret (openssl rand -base64 32)
RESEND_API_KEY       # From resend.com
CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET  # From cloudinary.com
```

**Optional:**
```
BROWSERLESS_TOKEN    # From browserless.io (for product scraper)
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
cd packages/db && npx prisma db push

# Seed with mock products and admin user
npm run db:seed
```

**Default admin credentials:**
```
Email:    admin@reborndolls.com
Password: Admin@123456
```
⚠️ Change this immediately after first login via the Settings page.

### 5. Run Development Servers

```bash
# Both apps simultaneously
npm run dev

# Or individually:
cd apps/web   && npm run dev   # http://localhost:3000
cd apps/admin && npm run dev   # http://localhost:3001
```

---

## Key Features

### Storefront (apps/web)
- Full product catalog with filtering, sorting, search
- Product detail pages with image gallery and zoom
- Cart (Zustand, persisted) + checkout flow
- Customer account portal (orders, wishlist, addresses)
- Blog, About, Contact, FAQ, policy pages
- Auth (register, login, forgot/reset password)
- Email notifications via Resend

### Admin Dashboard (apps/admin)
- Secure login (admin/super_admin roles only)
- Dashboard with revenue, order stats, low-stock alerts
- Product management (create, edit, publish/draft/archive)
- **Product scraper** — import products from any URL via Browserless
- Order management with status pipeline and tracking
- Customer management
- Live chat inbox (polls every 5 seconds, no additional WebSocket server needed)
- Blog/CMS
- Analytics overview
- Store settings

### Product Scraper
The scraper uses Browserless to headlessly render any product listing page and extract titles, descriptions, prices, and images. Products are imported as **DRAFT** so you can review and edit before publishing.

1. Go to Admin → Import Products
2. Paste the URL of a product listing page
3. Select a category
4. Click Scrape — review extracted products
5. Select items and click Import
6. Go to Products → edit each draft → publish when ready

---

## Deployment

### Storefront → Vercel
1. Connect your repo to Vercel
2. Set root directory to `apps/web`
3. Add all env variables from `.env.local.example`
4. Deploy

### Admin → Vercel (separate project)
1. Create a new Vercel project
2. Set root directory to `apps/admin`
3. Add env variables from `apps/admin/.env.local.example`
4. Deploy

### Database → Render
1. Create a PostgreSQL instance on Render
2. Copy the External Database URL
3. Set as `DATABASE_URL` in both apps
4. Run `npx prisma db push` to apply schema
5. Run the seed script

---

## Order Flow (No Payment Integration)

Orders are placed by customers and:
1. Admin receives an email via Resend with full order details
2. A notification appears in the admin dashboard
3. Admin contacts customer via their email to arrange payment
4. Admin updates order status in dashboard as it progresses
5. Customers receive status update emails at each stage

---

## Development Notes

- Prisma client lives in `packages/db` — always run `npm run db:generate` after schema changes
- Tailwind brand tokens are in `packages/config/tailwind.config.ts`
- Shared components are in `packages/ui/src`
- The admin uses a separate JWT cookie (`reborn_admin_session`) from the storefront (`reborn_session`)
