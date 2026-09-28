# Database

All tables use Row Level Security. Single-user app.

## Planned tables (Phase 1+)
- `profiles` (one row)
- `categories`
- `income_sources`
- `income_entries`
- `expenses`
- `cart_items`
- `recurring_items`
- `goals`
- `goal_contributions` (later)

## Conventions
- Every table has `user_id` → `auth.users`
- Amounts stored as `numeric`
- Always store `currency` (default `'MAD'`)
- Soft deletes preferred over hard deletes where useful
