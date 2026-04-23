# Anytime Trainers Web App

A mobile-first booking marketplace connecting youth soccer players and parents with private trainers for 1-on-1 training sessions.

Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui-style components.

## Quick Start (Windows)

Open PowerShell and navigate to this folder:

```
cd C:\Users\enmci\anytime-trainers-web
```

Install dependencies:

```
npm install --legacy-peer-deps
```

Run the dev server:

```
npm run dev
```

Open your browser to **http://localhost:3000**

## What's included in this V1

- ✅ Landing page (hero, how it works, featured trainers, testimonials, CTA)
- ✅ Browse trainers page (`/trainers`) with search + filters (city, price, specialty)
- ✅ Trainer detail page (`/trainers/[id]`) with bio, reviews, availability, booking CTA
- ✅ How It Works page (`/how-it-works`) with 3-step detail and FAQ
- ✅ For Trainers page (`/for-trainers`) recruiting page with 85% payout messaging
- ✅ Responsive navbar with mobile menu
- ✅ Footer with social links
- ✅ 8 mock NC-based trainers with realistic data, reviews, availability
- ✅ Mobile-first design (looks great at 375px, 768px, 1024px+)
- ✅ Touch-friendly UI (prepped for future Capacitor native wrap)

## View on your phone

While `npm run dev` is running, find your PC's IP:

```
ipconfig
```

Look for "IPv4 Address" (something like `192.168.1.45`).

On your phone (same WiFi), open Safari and go to:
`http://192.168.1.45:3000`

On iPhone, tap the Share button → "Add to Home Screen" to install it as a PWA-like app.

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          Marketing pages (public)
│   │   ├── layout.tsx        Navbar + Footer wrapper
│   │   ├── page.tsx          Landing page
│   │   ├── trainers/
│   │   │   ├── page.tsx      Browse trainers
│   │   │   └── [id]/page.tsx Trainer detail
│   │   ├── how-it-works/page.tsx
│   │   └── for-trainers/page.tsx
│   ├── layout.tsx            Root layout
│   └── globals.css
├── components/
│   ├── ui/                   Base components (Button, Card, etc)
│   ├── marketing/            Marketing page components
│   └── trainers/             Trainer page components
└── lib/
    ├── mock-data.ts          8 trainers + testimonials
    ├── types.ts              TypeScript types
    ├── api.ts                Mock API functions
    └── utils.ts              Helpers (cn, formatPrice, etc)
```

## Design System

- Primary color: `#0A7C3A` (field green)
- Accent color: `#F5A623` (ball orange)
- Font: Inter (from Google Fonts)
- Border radius: 0.75rem base
- Touch targets: minimum 44x44px throughout

## Next Phases (not built yet)

- Phase 2: Real database (Neon Postgres + Drizzle ORM)
- Phase 3: Authentication (NextAuth - Google + email)
- Phase 4: Trainer onboarding + profile creation
- Phase 5: Availability management + booking flow
- Phase 6: Stripe Connect for trainer payouts
- Phase 7: Reviews + messaging system
- Phase 8: Email notifications (Resend + GHL)
- Phase 9: Capacitor wrapper for iOS + Android app stores

## Tech Stack

- **Next.js 14.2** (App Router, React Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** (for styling)
- **Radix UI** (accessible primitives)
- **Lucide React** (icons)
- **class-variance-authority** (component variants)
- **Inter font** (via next/font)

## Deploy to Vercel

When you're ready:

```
npm install -g vercel
vercel
```

Follow the prompts. Your app will be live in ~2 minutes.

## License

Private - Anytime Soccer Training
