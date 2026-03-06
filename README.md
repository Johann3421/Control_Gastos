This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# FlowTrack

> **Cada sol importa. Cada decisión cuenta.**

FlowTrack is a personal finance web application built with Next.js 16, Tailwind CSS v4, PostgreSQL + Prisma ORM, NextAuth v5, and Recharts. Track income, expenses, savings, investments, set budgets, manage saving goals, and visualize your financial health.

---

## ✨ Features

- **Dashboard** — Balance hero, summary cards (income/expense/savings/investments), 6-month spending chart, category donut, wallet cards, recent transactions, budget alerts, goal progress
- **Transactions** — Grouped-by-day list, advanced filters (type, category, wallet, search), create/edit/delete, CSV export/import
- **Analytics** — Income vs expenses bar chart, net flow line chart, category distribution pie, spending breakdown table
- **Budgets** — Per-category monthly/weekly/yearly budgets with real-time usage tracking
- **Saving Goals** — Track progress toward financial goals with deposit history
- **Recurring Transactions** — Manage periodic expenses/income with frequency settings
- **Wallets** — Multiple accounts (checking, savings, cash, credit, investment, crypto)
- **Settings** — Currency, theme (light/dark/system), date format, month start day
- **Authentication** — Email/password credentials + Google OAuth (NextAuth v5)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Server Components) |
| Styling | Tailwind CSS v4 (CSS-based `@theme`) |
| Animations | Framer Motion |
| Database | PostgreSQL + Prisma ORM v7 |
| Auth | NextAuth v5 beta |
| State | Zustand with persist middleware |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Dates | date-fns with Spanish locale |
| CSV | PapaParse |
| Notifications | Sonner |
| Icons | Lucide React |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Edit `.env`:

```env
# Database — PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/flowtrack?schema=public"

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
AUTH_SECRET="your-auth-secret-here"

# Google OAuth (optional — get from console.cloud.google.com)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Seed Demo Data (optional)

```bash
npx prisma db seed
```

Demo credentials:
- **Email:** `demo@flowtrack.app`
- **Password:** `Demo123!`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login + Register pages
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── analytics/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── recurring/
│   │   ├── wallets/
│   │   └── settings/
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable primitives
│   ├── layout/          # Sidebar, TopBar, FAB
│   ├── dashboard/       # Dashboard widgets
│   ├── transactions/    # Transaction components
│   ├── analytics/       # Chart components
│   ├── budgets/
│   ├── goals/
│   ├── recurring/
│   └── wallets/
├── lib/                 # Utilities & server logic
├── store/               # Zustand stores
├── providers/           # React providers
└── types/               # TypeScript types
```

---

## 📜 Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint
npx prisma migrate dev   # Create & apply migration
npx prisma generate      # Generate Prisma client
npx prisma db seed       # Seed demo data
npx prisma studio        # Database GUI
```

---

## 🔐 Security

- Passwords hashed with bcrypt (12 salt rounds)
- Sessions via JWT (NextAuth v5)
- All API routes validate session ownership before data access
- Input validation with Zod on all API endpoints

---

## Getting Started (Next.js default)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
