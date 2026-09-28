#!/usr/bin/env bash
# Creates the Bestam folder structure with empty placeholder files.
# Safe to run: it never overwrites an existing file.
# Run from the repo root:  bash scaffold.sh

set -e

touch_safe() {
  mkdir -p "$(dirname "$1")"
  [ -e "$1" ] || : > "$1"
}

# docs and database
for f in features roadmap database design; do touch_safe "docs/$f.md"; done
touch_safe "supabase/migrations/.gitkeep"

# PWA
touch_safe "public/manifest.json"
touch_safe "public/icons/.gitkeep"

# routes
touch_safe "app/(auth)/login/page.tsx"
touch_safe "app/(app)/layout.tsx"
touch_safe "app/(app)/page.tsx"
touch_safe "app/(app)/money/page.tsx"
touch_safe "app/(app)/money/income/page.tsx"
touch_safe "app/(app)/money/expenses/page.tsx"
touch_safe "app/(app)/money/cart/page.tsx"
touch_safe "app/(app)/goals/page.tsx"
touch_safe "app/(app)/goals/[id]/page.tsx"
touch_safe "app/(app)/insights/page.tsx"
touch_safe "app/(app)/settings/page.tsx"

# features (same shape each)
for feature in income expenses cart goals insights categories; do
  touch_safe "features/$feature/queries.ts"
  touch_safe "features/$feature/actions.ts"
  touch_safe "features/$feature/types.ts"
  touch_safe "features/$feature/components/.gitkeep"
done
touch_safe "features/goals/projections.ts"

# shared components
touch_safe "components/layout/BottomNav.tsx"
touch_safe "components/layout/PageHeader.tsx"
touch_safe "components/shared/MoneyText.tsx"
touch_safe "components/shared/ProgressRing.tsx"
touch_safe "components/shared/GlassCard.tsx"

# lib
touch_safe "lib/calc/safe-to-spend.ts"
touch_safe "lib/calc/runway.ts"
touch_safe "lib/calc/forecast.ts"
touch_safe "lib/format.ts"

# env example
if [ ! -e .env.example ]; then
  cat > .env.example <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF
fi

echo "Done. Structure created."
