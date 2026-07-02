# Akiko Home — Storefront (Next.js 14)

## Skills to use

- **Always use the `ecommerce-storefront` skill** for any storefront work: product pages, cart, checkout, navigation, filtering, image galleries, variant selectors.
- Follow conversion-optimised patterns: loading skeletons, async button states (spinner), server components where possible.

## Stack

- Next.js 14, TypeScript, Tailwind CSS
- `@medusajs/js-sdk` v0.0.1 (pinned — upgrade to 2.13.6 when needed)
- Medusa backend at `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
- Deployed on Vercel → `akikohome.in`

## Key rules

- All standard cart/checkout calls go through `sdk.store.cart.*` — do not use raw fetch for these.
- Direct `fetch()` is intentional for custom modules (banners, testimonials, reviews, return-requests, shiprocket) and the shipping-options list (`cache: "no-store"` to bypass ETag 304 stale data). Calculated shipping options call `POST /store/shipping-options/{id}/calculate` natively — provider's `calculatePrice` uses real cart item weights.
- `completeCart()` calls `/store/carts/:id/complete-sync` (custom route) — not the standard Medusa complete endpoint.
- `INDIA_REGION_ID` and `SALES_CHANNEL_ID` are hardcoded constants in `medusa-api.ts` — single-region store.
- Prices display in rupees as-is (no ÷100). Medusa v2 uses major units.
- See backend `PLAN.md` for full architecture and phase history.
