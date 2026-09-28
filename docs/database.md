# Database

All tables use Row Level Security. Single-user app.

## Live tables
### `categories`
- `id`, `user_id`, `name`, `bucket` (essentials | lifestyle | growth | other)
- `icon`, `color`, `sort_order`, `created_at`
- Seeded with default list (Housing, Groceries, Dining Out, etc.)

### `income`
- `id`, `user_id`, `name`, `amount`, `currency` (default MAD)
- `rate_to_mad`, `is_salary`, `expected_on`, `received_at`, `created_at`
- Balance only counts rows where `received_at` is set

### `expenses`
- `id`, `user_id`, `category_id`, `amount`, `currency`
- `rate_to_mad`, `note`, `status` (planned | actual), `spent_on`, `created_at`
- Balance only counts `status = 'actual'`

## Planned later
- `profiles`
- `cart_items`
- `recurring_items`
- `goals`
- `goal_contributions`

## Conventions
- Every table has `user_id` → `auth.users`
- Amounts stored as `numeric(12,2)`
- Always store `currency` (default `'MAD'`) + `rate_to_mad`
- RLS: `auth.uid() = user_id` on all policies
- Migrations live in `lib/supabase/migrations/`
