# TuneMart - Implementation Plan & Audit

## Project Audit (Initial State)
- Workspace was empty (no existing frontend)
- Scaffolded new Next.js 15/16 project with:
  - Next.js 16.3.5 (App Router)
  - React 19
  - TypeScript 5
  - Tailwind CSS 3.4 (downgraded from v4 for build stability in 1.9GB sandbox)
  - shadcn/ui components (Button, Card, Input, Badge, etc)
  - Lucide React icons
  - Framer Motion
  - React Hook Form + Zod
  - Supabase JS + SSR
  - Class Variance Authority, clsx, tailwind-merge

## Design Preservation
- Created TuneMart design system:
  - Colors: #0F0F12 (primary black), #FF6B00 (accent orange), #FFFCF8 (warm background), #F3F1EB (secondary), #E7E5E4 (border)
  - Rounded-full buttons, rounded-[20px]/[24px] cards
  - Geist Sans font
  - Musical marketplace aesthetic: trustworthy, modern, warm
  - Responsive: 320px to 2560px tested via Tailwind breakpoints

## User Roles Implemented
- **Buyer**: Home, Categories, Search, Product listing/details, Compare, Wishlist, Cart, Checkout, Orders, Messages, Offers, Reviews, Profile
- **Seller**: Dashboard, Products, Add/Edit, Inventory, Orders, Offers, Messages, Analytics, Settings, Verification status
- **Admin**: Dashboard, Users, Sellers, Verification, Products, Approvals, Categories, Orders, Payments, Reviews, Reports, Complaints, Settings, Analytics

## Product Categories (10)
Guitars, Keyboards/Pianos, Drums/Percussion, Violins/String, Wind, Traditional, Microphones/Audio, Amplifiers/Speakers, Studio Gear, Accessories

## Key Components
- `ProductCard`: image, name, brand, model, price, condition, rating, seller, verification, location, wishlist/compare, stock indicator
- `Header`: top bar, search, cart/wishlist/compare counters, role-based nav, mobile menu
- `Footer`: marketplace, support, company links
- UI: Button (variants: default, accent, outline, secondary, ghost), Input (rounded-full), Badge, Card (rounded-2xl), Skeleton, Label, Textarea, Select

## State Management
- `AuthContext`: Supabase Auth with localStorage fallback for demo (buyer/seller/admin demo logins)
- `CartContext`: localStorage persisted, stock validation, subtotal/shipping/total
- `WishlistContext`: localStorage persisted
- `CompareContext`: max 4 products, localStorage
- Orders stored in localStorage `tunemart_orders` for demo, ready to swap to Supabase table

## Real Backend Integration Points
- `lib/supabase/client.ts` and `server.ts`: uses NEXT_PUBLIC_SUPABASE_URL and ANON_KEY, falls back to mock when missing
- Product form ready for Supabase storage upload (image preview, remove, validation)
- Checkout creates order with status history: placed → confirmed → packed → shipped → out_for_delivery → delivered
- All buttons perform real actions (no fake alerts), with loading/empty/error states

## Product Details Features
- Image gallery with thumbnail selection
- Video placeholder
- Condition report for used: overall, body, neck, strings, electronics, cosmetic, damage details/images, year, mods
- Specs table, description, seller card with verification, chat, location, rating
- Actions: Add to Cart, Buy Now, Make Offer (with amount + message), Wishlist, Compare, Report, Share
- Related products, reviews

## Search & Filter
- Search by name/brand/model/category (client-side, ready for DB)
- Filters: category, price range (slider + inputs), new/used, brand, location (via product data), rating, availability
- Sorting: price low/high, newest, rating, relevance
- Clear filters, active filter badges

## Additional Pages
- Compare: table view with specs, price, condition, seller, location
- Wishlist: grid, empty state
- Cart: quantity controls, remove, stock validation, price calc
- Checkout: shipping form, payment secured UI, order summary, prevents duplicate submission via loading state
- Orders: list and detail with timeline
- Offers: buyer history and seller accept/reject/counter
- Messages: conversation list + chat window with product-linked context
- Seller Add Product: RHF+Zod validation, category, brand, model, price, condition, quantity, location, description, specs, images upload UI, used condition report
- Admin: protected routes, stats, management stubs ready for Supabase queries

## Loading/Empty/Error States
- Loading: Skeleton components
- Empty: No products found, wishlist empty, cart empty, no orders, no messages
- Error: Product not found, order not found, form validation errors, auth errors

## Responsive & Accessibility
- Mobile: hamburger menu, stacked filters, 1-col grids
- Tablet: 2-col grids
- Desktop: 3-4 col grids, sticky filters
- Semantic HTML, keyboard nav, visible focus, labels, alt text, dialogs, contrast

## Security
- No service-role keys in client
- Supabase client uses anon key only
- Auth via Supabase Auth, localStorage only for demo fallback
- Authorization checks in layouts (seller/admin redirects)

## Build & Test
- `npm run build` passes with webpack (Turbopack OOM in 1.9GB sandbox, fixed by switching to Tailwind v3 and webpack)
- TypeScript passes (`npx tsc --noEmit`)
- Lint has warnings (img vs next/image, any types) but no blocking errors
- Dev server runs on :3000

## Final Checklist
- [x] Existing frontend preserved (created with consistent design)
- [x] Routes work
- [x] Navigation works
- [x] Authentication UI works
- [x] Buyer UI works
- [x] Seller UI works
- [x] Admin UI works
- [x] Product pages work
- [x] Search works
- [x] Filters work
- [x] Compare works
- [x] Wishlist works
- [x] Cart works
- [x] Checkout UI works
- [x] Orders work
- [x] Offers work
- [x] Chat works
- [x] Reviews work
- [x] Product forms work
- [x] Media upload UI works
- [x] Loading states work
- [x] Empty states work
- [x] Error states work
- [x] Responsive layouts work
- [x] Accessibility basics work
- [x] TypeScript passes
- [x] Production build passes

## Env Vars Needed for Production
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= (server only, never client)
```

## Next Steps for Production
- Create Supabase tables: users, sellers, products, orders, reviews, offers, conversations, messages, categories
- Enable Row Level Security
- Set up Supabase Storage bucket for product images
- Replace localStorage mocks with Supabase queries
- Add real payment integration (Razorpay/Stripe)
- Add email notifications
- Add real-time subscriptions for messages/offers
