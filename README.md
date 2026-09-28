# Bestam

> A personal budget and financial stability app. Built for one user, designed to feel like a premium native app on iPhone.

**Live:** [bestam.vercel.app](https://bestam.vercel.app)

Bestam answers one question every day: **how much can I safely spend?** Everything else in the app exists to make that number accurate and to help you reach your goals.

---

## Principles

- **Personal only.** One user, one account. Public sign-ups are disabled.
- **One hero number.** Safe-to-Spend is the first thing you see.
- **Two-tap capture.** Adding an expense must be faster than not tracking it.
- **Small connected files.** One job per file, grouped by feature.
- **Calm and futuristic.** Dark, glassy, large numbers, restrained motion.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, Radix / shadcn-style components, lucide-react |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| Hosting | Vercel |
| App type | PWA (Add to Home Screen on iPhone) |
| Charts | Recharts *(to add in Phase 4)* |
| AI review | Claude API *(to add in Phase 5)* |

---

## Features

### Signature features

1. **Safe-to-Spend hero.** A single glowing number and a fluid ring for today and the month.
   `balance − upcoming fixed bills − planned cart items − goal reserves`, divided by days left in the month.
2. **Fast capture.** Amount, category, done. Later: iPhone Shortcut / Action Button and natural-language entry ("coffee 25").
3. **What-if simulator.** Slide a category up or down and watch goal dates and runway move in real time.
4. **Weekly AI review.** A short, honest Sunday summary: where you drifted, what improved, one suggestion.

### Foundation

- **Income:** primary salary plus other sources, with a "Received" button that timestamps the money.
- **Expenses:** custom categories with icons and colors, grouped into Essentials / Lifestyle / Growth / Other. Planned vs actual.
- **Recurring items:** rent, subscriptions and salary repeat automatically and feed the forecast.
- **Shopping cart:** items with estimated price. Marking one as bought creates the expense. Planned items reduce Safe-to-Spend.
- **Goals:** three types to start, more later (see below). Each can influence Safe-to-Spend.
- **Insights:** spending by category, balance over time, budget vs actual, runway.
- **Currency:** MAD by default. Each transaction stores its amount, currency and optional rate.

### Goal types

| Type | Phase | What it does |
|---|---|---|
| Savings Target | 3 | Amount by date. Calculates the required monthly contribution. |
| Emergency Fund | 3 | X months of expenses. Shows months of runway. |
| Spending Cap | 3 | Limit per category per month. Live progress. |
| Debt Payoff | later | Remaining balance and projected payoff date. |
| Milestone | later | One-time purchase, can link to a cart item. |
| Habit | later | e.g. reduce dining by 20%. |

### Default categories

- **Essentials:** Housing, Utilities, Groceries, Transport, Insurance, Health
- **Lifestyle:** Dining Out, Entertainment, Subscriptions, Shopping, Fitness
- **Growth:** Education, Side Project, Savings Transfers, Investments, Debt Payments
- **Other:** Gifts & Donations, Travel, Misc

### Deliberately not included

Multi-user roles, sharing, bank sync, heavy export options, receipt photos and cart templates (maybe later).

---

## App screens

| Screen | Contents |
|---|---|
| Dashboard | Safe-to-Spend ring, pinned goal, quick actions, mini trend |
| Money | Income, Expenses, Shopping Cart |
| Goals | All goals, create / edit, projections, what-if simulator |
| Insights | Charts, filters, weekly AI review |
| Settings | Categories, salary defaults, accent color |

---

## Project structure

```
bestam/
├── README.md
├── .env.example
├── docs/
│   ├── features.md          # detailed feature spec
│   ├── roadmap.md           # phases and checklist
│   ├── database.md          # tables and relations
│   └── design.md            # colors, typography, motion
├── supabase/
│   └── migrations/          # one small SQL file per table
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/
├── app/                     # routes only, pages stay tiny
│   ├── layout.tsx
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx       # bottom navigation shell
│       ├── page.tsx         # Dashboard
│       ├── money/
│       ├── goals/
│       ├── insights/
│       └── settings/
├── features/                # one folder per feature
│   ├── income/
│   ├── expenses/
│   ├── cart/
│   ├── goals/
│   ├── insights/
│   └── categories/
├── components/
│   ├── ui/                  # primitives
│   ├── layout/              # BottomNav, PageHeader
│   └── shared/              # MoneyText, ProgressRing, GlassCard
└── lib/
    ├── supabase/            # client.ts, server.ts, middleware.ts
    ├── calc/                # safe-to-spend.ts, runway.ts, forecast.ts
    ├── format.ts
    └── utils.ts
```

### File conventions

- **`app/`** only defines routes and composes components. Keep pages under about 50 lines.
- **`features/<name>/`** always has the same shape:
  - `queries.ts` reads data
  - `actions.ts` writes data
  - `types.ts` describes data
  - `components/` displays data
- **`lib/calc/`** holds all money math as pure functions with no UI or database calls, so each formula lives in exactly one place.

---

## Roadmap

- [ ] **Phase 0: Foundation.** Secure `.env`, restructure folders, real README, PWA manifest, lock down sign-ups.
- [ ] **Phase 1: Core tracking.** Auth (passkey / Face ID), categories, income, expenses, dashboard balance.
- [ ] **Phase 2: Planning.** Shopping cart, recurring items, Safe-to-Spend.
- [ ] **Phase 3: Goals.** Savings Target, Emergency Fund, Spending Cap, projections.
- [ ] **Phase 4: Insights.** Charts, runway view, what-if simulator, motion and haptics polish.
- [ ] **Phase 5: Smart.** Weekly AI review, natural-language capture, iPhone Shortcut, offline queue.

---

## Getting started

### Requirements

- Node.js 20+
- A Supabase project

### Setup

```bash
git clone https://github.com/Selbarins/bestam.git
cd bestam
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then run:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Supabase

1. Create your single user in the Supabase dashboard.
2. Disable public sign-ups under Authentication settings.
3. Apply the SQL files in `supabase/migrations/` in order.
4. Keep Row Level Security enabled on every table.

### Deploy

Push to `main`. Vercel builds and deploys automatically. Add the same environment variables in the Vercel project settings.

---

## Security

- `.env.local` is never committed. Only `.env.example` is tracked.
- Never expose the Supabase **service role** key to the client or the repo.
- Sign-ups are disabled, and every table is protected by Row Level Security.

---

## Design direction

Deep dark background, frosted glass panels, geometric typography, large confident numbers, progress shown as rings and fluid bars, and restrained motion. OLED-friendly dark mode by default. Accent color is still to be decided (electric cyan, soft violet or warm amber). Details will live in `docs/design.md`.

---

## License

Private personal project. All rights reserved.
