# Design

## Mood
Quiet luxury. Calm, refined, precise. Soft ivory surfaces, muted sage accent, generous spacing, restrained motion.

## Colors (HSL)
- Background: `40 33% 98%` (warm ivory)
- Foreground: `30 10% 12%` (deep warm charcoal)
- Card: `40 30% 99%`
- Primary (accent): `152 25% 38%` (muted sage)
- Primary foreground: `40 33% 98%`
- Muted: `40 18% 94%`
- Muted foreground: `30 8% 45%`
- Accent (soft highlight): `152 20% 92%`
- Border: `40 15% 90%`
- Ring: same as primary

## Typography
- Single family: **DM Sans** (400–700)
- Large numbers: `text-5xl` / `text-3xl`, `font-semibold`, `tabular-nums`, `tracking-tight`
- No serif

## Motion & interaction
- Hover: soft border tint toward primary, light shadow
- Active: `scale-[0.98]`
- Focus: primary-tinted border + subtle shadow
- Selected chips: primary border + accent background
- Transitions: `duration-150`–`duration-300`, prefer opacity/transform/shadow

## Components language
- Rounded-2xl cards, soft borders, minimal chrome
- Bottom navigation (blur + safe-area)
- Large focused amount inputs
- Category chips as radio pills
- Primary filled buttons, outline secondary
