   # Bestam

> A private, free, solo personal-finance app.
>
> **Bestam answers one question every day: _How much can I safely spend?_**

Bestam is built for **one person and one financial life**. It is a PWA that feels like a calm, premium native app: ivory surfaces, sage accents, one big number.

It is deliberately **not** a SaaS, a bank aggregator, or a social product. That constraint is a feature: it keeps the architecture small and the app fast.

---

## Table of contents

1. [Principles](#1-principles)
2. [Current status](#2-current-status)
3. [The core model: Safe-to-Spend v2](#3-the-core-model-safe-to-spend-v2)
4. [Signature features](#4-signature-features)
5. [Made for Morocco](#5-made-for-morocco)
6. [AI policy and the cheap-AI plan](#6-ai-policy-and-the-cheap-ai-plan)
7. [Design system: quiet luxury (light only)](#7-design-system-quiet-luxury-light-only)
8. [Roadmap](#8-roadmap)
9. [Architecture](#9-architecture)
10. [Security and privacy](#10-security-and-privacy)
11. [Testing](#11-testing)
12. [Getting started](#12-getting-started)
13. [Deliberately not included](#13-deliberately-not-included)
14. [Success criteria](#14-success-criteria)

---

## 1. Principles

**Solo only.** One account, one user. No teams, sharing, roles, public sign-up, or multi-tenant design. Every "what if we add users" idea is rejected by default.

**Free forever.** No subscriptions, ads, affiliate links, data selling, or required paid APIs. Core functionality works with zero paid services. Hosting and AI free tiers can change on their own; Bestam must keep working if they do.

**One hero number.** Safe-to-Spend. Everything else exists to make that number more accurate, more trusted, or easier to act on.

**Decisions over dashboards.** Charts explain the past. Bestam helps with the present and the next few weeks.

**Fast capture.** Logging an expense must be faster than deciding not to. Target: *amount → category → done*, under five seconds.

**Trust before intelligence.** Do not build clever features on top of a number you can't trust. Tests come before forecasts, and forecasts come before AI.

**Calm, never judgmental.** Explain consequences, don't scold.
Not "You overspent." → "You're spending faster than planned."
Not "Bad purchase." → "This moves your laptop goal by 12 days."

---

## 2. Current status

_Snapshot of the repo as of 29 Sep 2026. Update this section as things ship._

| Area | Status |
|---|---|
| Next.js 15 + Supabase + Vercel PWA shell, bottom nav | ✅ Done |
| Login-only auth with proxy guard | ✅ Done |
| RLS on all 6 tables, `numeric(12,2)` money columns | ✅ Done |
| Categories, income (with "received"), expenses (planned/actual) | ✅ Done |
| Edit/delete transactions | ✅ Done |
| Goals (savings, emergency, cap) with projections | ✅ Done |
| Shopping cart, recurring items | ✅ Done (v1) |
| Safe-to-Spend | 🟡 **v1 only** (monthly formula, no buffer, no timeline) |
| Charts, weekly review, NL capture, offline queue, iPhone capture API | 🟡 Built early, unhardened |
| `forecast.ts`, `runway.ts` | ⬜ Empty stubs |
| Automated tests | ⬜ None |
| Public sign-ups disabled | ⬜ Manual step still pending |

**Where the risk is:** intelligence features were built before the trust foundation. The next phases fix that ordering (see [Roadmap](#8-roadmap)).

---

## 3. The core model: Safe-to-Spend v2

### Why v1 isn't enough

v1 is roughly `(received − actual − planned − cart − recurring − goal reserves) ÷ days left in month`. Known gaps:

- No safety buffer
- Recurring bills are subtracted in full even if already paid this month
- Tied to the calendar month, not your pay cycle
- No way to correct drift against your real bank balance
- Floating-point arithmetic for money

### v2: timeline-based

Model the **balance day by day** from today until the next expected income (or a chosen horizon), then find the tightest point.

```text
1. Start with today's real available balance (per account)
2. Lay out known future events on a day-by-day timeline:
     + expected income
     − recurring bills (only unpaid occurrences)
     − planned purchases and cart items marked "planned"
     − goal contributions due
     − sinking-fund contributions
3. Find the LOWEST projected balance before the next income
4. discretionary = lowest projected balance − minimum safety buffer
5. Safe-to-Spend (per day) = max(0, discretionary) ÷ days until next income
```

Why this shape is better:

- A rent payment on the 5th correctly limits spending *before* the 5th, not just "this month".
- Salary arriving on the 2nd of next month doesn't inflate today's number.
- "Can I afford this?" and "What if…?" become the same function with an extra event injected.
- The cashflow timeline is a by-product, not a separate feature.

### Rules

- All money math lives in **`lib/calc/`** as pure, deterministic functions.
- No React, Supabase, or AI imports inside `lib/calc/`.
- **Integer minor units** (centimes) or a decimal library. Never raw float sums.
- Periods run **payday to payday**, not calendar months.
- Every displayed number must be explainable: tapping the hero number shows its breakdown.

### Trust tools (mandatory for v2)

- **Reconcile:** type your real balance and Bestam records a signed adjustment transaction. This is the most important trust feature.
- **Accounts:** at minimum Bank, Cash, and Savings. Savings is excluded from Safe-to-Spend by default.
- **Overspend behavior:** if the number reaches zero, say so calmly and show when it recovers.

---

## 4. Signature features

### 4.1 Safe-to-Spend
The home screen: one large number, "today" and "until payday" views, a short explanation line, and upcoming commitments underneath.

### 4.2 Can I afford this?
Enter a name and an amount. Bestam re-runs the timeline with the purchase injected and shows the consequences:

```text
New headphones · 899 MAD

Safe-to-Spend     327 → 281 /day
Lowest balance    4,200 → 3,301 MAD  (buffer: 3,000)
Laptop goal       +4 days later
```

States: Comfortable · Possible, with impact · Requires adjustment · Conflicts with a goal · Breaches the safety buffer.
Actions: Confirm · Cancel · Adjust amount · Move to a later date. Nothing is saved until you confirm.

### 4.3 Cashflow timeline
A vertical list of upcoming events (income, bills, goal contributions, planned purchases) with the projected balance after each and the lowest point marked. No chart required.

### 4.4 What-if scenarios
Sandbox changes that never touch real data: save 1,000 MAD more per month, drop a subscription, change salary, move a purchase. Show before/after for Safe-to-Spend, goal dates, and runway.

### 4.5 Goals that affect daily life
Types: Savings target · Emergency fund · Spending cap · Debt payoff · Milestone · Habit.
Goals reserve money in the timeline, so today's spending visibly affects future dates. Priority ordering shows conflicts: "Vacation is competing with your emergency fund." Bestam explains conflicts and never decides for you.

### 4.6 Runway
How many months you'd last without income, with two views: essentials only and current lifestyle. It uses real spending history once enough exists.

### 4.7 Spending pace and monthly projection
"You've used 46% of flexible spending with 63% of the period left." Projection = actual pace + known commitments.

### 4.8 What changed?
Deterministic month-over-month deltas by category, with the top contributing transactions listed as the reason. **No AI needed.**

### 4.9 Monthly ritual
- **Start:** review the plan (expected income, fixed costs, goal contributions, flexible budget).
- **End:** reconcile (missing income, untracked spending, changed bills), then decide what to do with the surplus: roll over, add to a goal, or keep as buffer.

### 4.10 Expense capture that stays out of the way
Manual entry is always the baseline. Faster paths (optional): typed shortcuts like `coffee 25`, an iPhone Shortcut / Action Button hitting `/api/capture`, and an offline queue. Undo is always one tap away.

---

## 5. Made for Morocco

Small features that make Bestam fit real local money habits. All optional, none required for the core.

- **MAD first.** MAD is the default; foreign amounts store `currency`, `original_amount`, and `rate_to_mad`.
- **Cash wallet.** Cash is a first-class account. Cash spending is often untracked, so a quick "set my cash on hand" reconcile helps.
- **Sinking funds for lumpy costs.** Ramadan and Eid, back-to-school, car tax and insurance, annual subscriptions, and travel. Bestam divides each cost across the months before it's due and reserves that amount in the timeline, so big dates stop surprising you.
- **Daret (rotating savings circle).** A simple tracker: monthly contribution, your payout month, and the payout as a future income event on the timeline.
- **Irregular income.** Freelance or side income can be marked "expected" with a confidence level, and the conservative timeline ignores unconfirmed items.

---

## 6. AI policy and the cheap-AI plan

### Rules

1. **Core works with no AI.** Every number and every screen functions without a key.
2. **AI never calculates.** All figures come from `lib/calc/`. AI may only *phrase* or *parse*.
3. **Deterministic first, AI as fallback.** Try rules, regex, and learned keywords first; call a model only when they fail.
4. **Send aggregates, not diaries.** Prompts contain totals and percentages, never raw notes, merchant names, or account balances.
5. **Opt-in, inspectable.** A Settings toggle (default **off**) and a "show exactly what will be sent" preview.
6. **Cache and cap.** One review per period, stored in the DB. Hard daily cap on calls.
7. **Free tier only.** If limits change or the key is missing, the app silently uses the rule-based text.

### Where AI is worth using (and where it isn't)

| Function | Use AI? | Approach | Approx. tokens / call |
|---|---|---|---|
| Safe-to-Spend, what-if, forecast, runway, what-changed | **No** | Deterministic | 0 |
| Expense text parsing (`coffee 25`) | Rarely | Regex first; AI **only** if it fails or is ambiguous | ~80 in / 40 out |
| Category suggestion | Rarely | Learn `note → category` from your history first; AI only for unseen words | ~60 in / 10 out |
| Weekly / monthly review wording | **Yes** | Rule-based facts → AI rewrites in 3 sentences, cached per period | ~200 in / 120 out |
| Natural-language questions ("how much on dining in Aug?") | Later | AI converts to a **structured query** that deterministic code runs; AI never sees the answer data unless needed to phrase it | ~150 in / 80 out |

Total expected usage: **a few hundred tokens per week**, which is effectively zero cost even on paid pricing.

### Provider choice

**Primary: Groq free tier, `llama-3.1-8b-instant`.**
Why: it is the cheapest capable option (about $0.05 / $0.08 per 1M input/output tokens if you ever exceed free limits), the free tier requires no credit card, it offers a high daily request allowance for small prompts, and the repo already has a Groq integration in `lib/calc/ai-review.ts`. Groq also states it does not retain inference data by default. Verify current limits and data terms in the Groq console before enabling.

**Fallback: Cloudflare Workers AI free allocation.** Also positioned as non-training for customer content; a good second provider behind the same interface.

**Avoid for financial data: Gemini's free tier.** Its generous quota is attractive, but Google's free tier may use your prompts to improve its products. That conflicts with this project's privacy principle. If you ever use it, send only anonymized aggregates.

**Avoid as a default: OpenRouter `:free` models.** The daily free request cap is small, and "free" does not guarantee no data retention.

> Free-tier limits and terms change often. Treat every number above as "verify before relying on it".

### Implementation shape

```text
lib/ai/
  provider.ts        // interface: complete(prompt, {maxTokens}) → string | null
  groq.ts            // primary
  cloudflare.ts      // optional fallback
  budget.ts          // daily call cap + per-feature token caps
  redact.ts          // builds the aggregate-only payload
lib/calc/weekly-review.ts   // deterministic facts (source of truth)
```

- One `AiProvider` interface, so swapping providers is a config change.
- `max_tokens` capped per feature (parse: 40, category: 10, review: 150).
- `temperature ≤ 0.3` for parsing, `0.4` for prose.
- On any error, timeout, or missing key: return the rule-based lines. Never block the UI.
- Store the generated review with a hash of its input facts; regenerate only when facts change.
- Never send: raw notes, merchant names, account balances, goal names (use "Goal A"), or anything that identifies you.

---

## 7. Design system: quiet luxury (light only)

**Decision: Bestam is a light-only, ivory + sage app.** Dark mode and the "futuristic glass" direction are dropped. One well-tuned theme is better than two average ones.

**Mood:** Calm · Precise · Personal · Refined.

### Palette (HSL tokens already in `globals.css`)

| Token | Value | Use |
|---|---|---|
| `--background` | `40 33% 98%` | Warm ivory page |
| `--foreground` | `30 10% 12%` | Warm charcoal text |
| `--card` | `40 30% 99%` | Card surface |
| `--primary` | `152 25% 38%` | Muted sage, actions and progress |
| `--accent` | `152 20% 92%` | Soft sage highlight |
| `--muted` | `40 18% 94%` | Quiet fills |
| `--muted-foreground` | `30 8% 45%` | Secondary text |
| `--border` | `40 15% 90%` | Hairlines |

Add two semantic tokens and use them sparingly: **caution** (warm amber) and **negative** (muted terracotta). Avoid saturated red.

### Type and layout

- One family: **DM Sans** (400–700). No serif.
- Big numbers: `tabular-nums`, `font-semibold`, `tracking-tight`.
- `rounded-2xl` cards, soft borders, generous spacing, minimal chrome.
- Bottom navigation with blur and safe-area padding.
- Motion: 150–300 ms, opacity/transform/shadow only. `active:scale-[0.98]`.
- Progress as rings or slim bars, never gamified.

### Cleanup that follows from this decision

- Remove `darkMode: ["class"]`, `theme-switcher.tsx`, and any `dark:` classes.
- Remove the unused `serif` font entry.
- Remove leftover Supabase-template files: `hero.tsx`, `deploy-button.tsx`, `tutorial/*`, `next-logo.tsx`, `supabase-logo.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx` (unless reset is wanted), and `scaffold.sh`.
- Keep the `theme-color` meta as ivory (`#faf8f5`).

Avoid: heavy gradients, neon, glassmorphism, red everywhere, dense tables, corporate-bank styling, gamification.

---

## 8. Roadmap

Ordered by **dependency and trust**, not by how impressive a feature sounds.

> **Rule:** Do not build advanced intelligence on unreliable financial data.

### Phase 0: Hygiene and trust foundation `P0` ← **next**

- [ ] Disable public sign-ups in Supabase (dashboard), then delete sign-up UI
- [ ] Remove template leftovers (see [Design cleanup](#cleanup-that-follows-from-this-decision))
- [ ] Move migrations to `supabase/migrations/` (match docs) and keep them in order
- [ ] Add Vitest and tests for every function in `lib/calc/`
- [ ] Switch money math to integer minor units (or a decimal lib)
- [ ] Move all financial sums out of `page.tsx` into `lib/calc/`
- [ ] Fill or delete empty files (`queries.ts`, `types.ts`, `forecast.ts`, `runway.ts`)
- [ ] Harden `/api/capture` (constant-time token compare, basic rate limit, no `listUsers` on every call: store the owner id in an env var)
- [ ] Remove `.env.local` from history if it ever contained anything sensitive; rotate keys if a service-role key was ever exposed
- [ ] CSV export of all data (backup)
- [ ] Error, loading, and empty states on every screen

**Done when:** a calculation bug can't reach the UI unnoticed, and nobody else can create an account.

### Phase 1: Core tracking `P0`

- [x] Income with "received"
- [x] Expenses with planned/actual
- [x] Categories (custom + seeded)
- [x] Edit / delete
- [ ] Undo last action
- [ ] Accounts: Bank / Cash / Savings
- [ ] **Reconcile balance** (adjustment transaction)
- [ ] Split transactions (defer if it slows the core)

### Phase 2: Planning engine `P0`

- [x] Shopping cart (v1)
- [x] Recurring items (v1)
- [ ] Mark each recurring occurrence paid / skipped
- [ ] Minimum safety buffer setting
- [ ] Pay-cycle periods (payday to payday)
- [ ] Sinking funds
- [ ] Expected vs received income

### Phase 3: Safe-to-Spend v2 `P0`

- [ ] Timeline-based calculation in `lib/calc/safe-to-spend.ts`
- [ ] "Explain this number" breakdown sheet
- [ ] Today / until-payday toggle
- [ ] Buffer protection and calm zero-state
- [ ] Full test suite for edge cases (month boundaries, late income, negative balance, foreign currency)

**Done when:** you trust the number enough to skip checking your bank app.

### Phase 4: Goals and stability `P1`

- [x] Savings target, emergency fund, spending cap (v1)
- [ ] Goals reserve money in the timeline
- [ ] Deadline projection using real surplus
- [ ] Runway (essentials vs lifestyle)
- [ ] Priority ordering and conflict detection

### Phase 5: Decision engine `P1`

- [ ] Can I afford this?
- [ ] Purchase impact preview
- [ ] What-if scenarios (sandbox, no writes)
- [ ] Cart "planned" items reduce Safe-to-Spend

### Phase 6: Cashflow and forecasting `P1`

- [ ] Cashflow timeline screen
- [ ] Lowest projected balance
- [ ] Spending pace and monthly projection
- [ ] Conservative vs expected projection (only with enough history)

### Phase 7: Insights `P2`

- [x] Category and monthly charts (v1)
- [ ] What changed? (deterministic)
- [ ] Unusual spending detection
- [ ] Subscription overview (informational)
- [ ] Budget vs actual

### Phase 8: Monthly ritual `P2`

- [ ] Month-start plan review
- [ ] Month-end reconciliation and surplus allocation
- [ ] Monthly summary

### Phase 9: Capture and automation `P2`

- [x] Basic text parser (`coffee 25`)
- [x] iPhone capture endpoint (needs hardening in Phase 0)
- [x] Offline queue (needs conflict/duplicate handling)
- [ ] Learn note → category from history
- [ ] iPhone Shortcut and Action Button guide in `docs/`

### Phase 10: Optional AI `P3`

- [x] Weekly review polish via Groq (needs the rules in [section 6](#6-ai-policy-and-the-cheap-ai-plan))
- [ ] Provider interface, budget caps, and redaction layer
- [ ] Opt-in toggle with "what will be sent" preview
- [ ] Cache reviews per period
- [ ] AI fallback for unparsed expense text
- [ ] Natural-language questions to structured queries

### Extras (any time, after Phase 3)

- [ ] Daret tracker
- [ ] Lightweight multi-currency helpers
- [ ] Data import (CSV) for history

### Do not delay the core for

AI, bank sync, receipt scanning, fancy charts, investment tracking, advanced exports, or complex automation.

The first excellent version needs only: **income · expenses · recurring · planned purchases · goals · cashflow · Safe-to-Spend**.

---

## 9. Architecture

```text
bestam/
├── README.md
├── .env.example
├── docs/                    features · roadmap · database · design
├── supabase/migrations/     ordered SQL, RLS on every table
├── public/                  manifest + icons
├── app/
│   ├── layout.tsx
│   ├── (auth)/login/
│   ├── (app)/               dashboard · money · goals · insights · settings
│   └── api/capture/         optional iPhone Shortcut endpoint
├── features/<name>/         queries.ts · actions.ts · types.ts · components/
├── components/              ui · layout · shared
└── lib/
    ├── calc/                pure money logic (tested)
    ├── ai/                  optional, opt-in
    ├── nl/                  text parsing
    ├── offline/             capture queue
    ├── supabase/
    └── format.ts
```

**Layering rules**

- `app/`: routes only; pages stay small and compose feature components.
- `features/`: data access and UI for one domain. Fetch in `queries.ts`, mutate in `actions.ts`.
- `lib/calc/`: pure functions. Deterministic, testable, independent of React, Supabase, and AI.
- No page or component computes financial totals itself.

**Navigation (five tabs, no more)**

| Tab | Contents |
|---|---|
| Home | Safe-to-Spend, upcoming, pace, pinned goal, quick add |
| Money | Income, expenses, cart, recurring, timeline |
| Goals | Goals, projections, what-if |
| Insights | What changed, trends, monthly summary, runway |
| Settings | Categories, accounts, buffer, pay cycle, AI toggle, export |

**Stack**

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn-style primitives, DM Sans |
| Backend | Supabase (Postgres, Auth, RLS) |
| Hosting | Vercel (or any Next.js host) |
| Charts | Recharts (kept minimal) |
| Tests | Vitest |
| AI | Optional, Groq free tier behind an interface |

Keep it boring where reliability matters.

---

## 10. Security and privacy

Security outranks feature velocity.

- Sign-ups **disabled**; only the owner's account exists.
- RLS enabled on **every** table with `user_id = auth.uid()` policies.
- `.env.local` never committed. The service-role key never reaches the client and is used only in `/api/capture`.
- `/api/capture` uses a long random token, constant-time comparison, and rate limiting; the owner id comes from an env var.
- No sensitive data in logs.
- AI is off by default; prompts contain aggregates only (see [section 6](#6-ai-policy-and-the-cheap-ai-plan)).
- No bank credentials, no bank sync, no third-party analytics.
- Owner-accessible backups: CSV export now; scheduled Supabase backup or dump documented in `docs/`.

---

## 11. Testing

Every calculation in `lib/calc/` has automated tests before it ships. Financial code without tests is a guess.

Minimum coverage: Safe-to-Spend, cashflow timeline, recurring occurrences, goal contribution and deadline, runway, spending pace, scenarios, safety buffer, currency conversion, reconcile adjustments.

First test to write:

```text
Given
  Balance 10,000 · Upcoming bills 2,000 · Goal reserve 1,000
  Planned purchases 500 · Safety buffer 1,500
Then
  Discretionary = 10,000 − 2,000 − 1,000 − 500 − 1,500 = 5,000
```

Edge cases worth pinning down early: last day of month, payday late or missing, bill due tomorrow, negative balance, foreign-currency expense, bill paid early, buffer larger than balance.

---

## 12. Getting started

**Requirements:** Node.js 20+, a Supabase project, a Vercel project (optional).

```bash
git clone https://github.com/Selbarins/bestam.git
cd bestam
npm install
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: iPhone Shortcut capture
# CAPTURE_TOKEN=long-random-secret
# SUPABASE_SERVICE_ROLE_KEY=server-only
# OWNER_USER_ID=your-user-uuid

# Optional: free AI polish (off unless set AND enabled in Settings)
# GROQ_API_KEY=
```

```bash
npm run dev      # http://localhost:3000
npm test         # once Vitest is added
```

**Supabase setup**

1. Create your one user.
2. **Disable public sign-ups** (Authentication → Providers → Email).
3. Apply migrations in order.
4. Confirm RLS is enabled on every table.
5. Never expose the service-role key to the browser.

**Install as an app (iPhone):** open the site in Safari → Share → *Add to Home Screen*.

---

## 13. Deliberately not included

Multi-user accounts · teams · sharing · social features · bank sync · brokerage · crypto tracking · marketplaces · ads · affiliate links · subscriptions · dependence on receipt photos · complex accounting · tax preparation · financial advice · product recommendations · dark mode.

Bestam stays a focused personal planning tool.

---

## 14. Success criteria

1. **I trust the number.** Safe-to-Spend is accurate enough to use daily.
2. **Tracking is effortless.** Adding an expense takes seconds.
3. **Decisions are clearer.** I can see what a purchase will do before I make it.
4. **The future is legible.** I know when money gets tight, and why.
5. **Goals feel connected.** Today's spending visibly affects future dates.
6. **The app stays calm.** It never makes me feel judged.

---

## In one sentence

> **Bestam is a private, free, solo financial companion that tells you what you can safely spend today and shows what each decision does to your future.**

---

## License

Private personal project. All rights reserved.
