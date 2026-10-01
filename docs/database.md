# Database

All tables use Row Level Security. Single-user app.

## Live tables

### `categories`
- `id`, `user_id`, `name`, `bucket` (essentials | lifestyle | growth | other)
- `icon`, `color`, `sort_order`, `created_at`
- Seeded with default list (Housing, Groceries, Dining Out, etc.)

### `accounts`
- `id`, `user_id`, `name`, `type` (bank | cash | savings)
- `include_in_safe_to_spend` (default true; savings = false)
- `sort_order`, `created_at`
- Unique per `(user_id, type)` — three defaults seeded

### `income`
- `id`, `user_id`, `name`, `amount`, `currency` (default MAD)
- `rate_to_mad`, `is_salary`, `expected_on`, `received_at`, `created_at`
- `account_id` (optional FK → accounts)
- Balance only counts rows where `received_at` is set

### `expenses`
- `id`, `user_id`, `category_id`, `amount`, `currency`
- `rate_to_mad`, `note`, `status` (planned | actual), `spent_on`, `created_at`
- `account_id` (optional FK → accounts)
- Balance only counts `status = 'actual'`

### `adjustments`
- `id`, `user_id`, `account_id`, `amount` (signed), `note`, `adjusted_on`, `created_at`
- Used by Reconcile: real balance − book balance = adjustment

### Other live tables
- `goals`, `cart_items`, `recurring_items` (see their migration files)

## Balance rule

Per account (and overall for Safe-to-Spend accounts):

Reconcile records one adjustment so `book_balance` equals the number you typed.

## Conventions
- Every table has `user_id` → `auth.users`
- Amounts stored as `numeric(12,2)`
- Always store `currency` (default `'MAD'`) + `rate_to_mad`
- RLS: `auth.uid() = user_id` on all policies
- Migrations live in `lib/supabase/migrations/` (ordered `001_…`, `002_…`, …)
