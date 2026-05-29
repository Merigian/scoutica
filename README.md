# Scoutica

La piattaforma italiana per lo scouting professionale nel mondo della moda.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix-based)
- **ORM:** Prisma v6
- **Database:** PostgreSQL (Neon Serverless)
- **Auth:** Auth.js v5 (NextAuth) — Email + Password + Google OAuth
- **Payments:** Stripe (Subscriptions + One-time)
- **Storage:** Cloudflare R2
- **i18n:** next-intl (Italian + English)
- **Email:** Resend + React Email

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/             # Next.js App Router pages
├── components/      # React components (UI, layout, forms, shared)
├── lib/             # Utilities, auth config, clients
├── server/          # Server actions, queries, business logic
├── hooks/           # Client-side React hooks
├── types/           # TypeScript type definitions
├── config/          # App configuration (plans, regions, enums)
└── messages/        # i18n message files (it.json, en.json)
```
