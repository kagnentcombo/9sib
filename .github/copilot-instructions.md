# 9Sib Exam App - AI Coding Agent Instructions

## Project Overview
Next.js 15 exam preparation app with premium subscription features. Users take quizzes on various subjects (ความสามารถทั่วไป, คณิตศาสตร์, คอมพิวเตอร์, ภาษาไทย, ภาษาอังกฤษ, สังคม/กฎหมาย), view analytics, and access premium content via Omise payment gateway.

## Tech Stack
- **Framework**: Next.js 15.4.6 (App Router) + React 19 + TypeScript
- **Database**: SQLite via Prisma ORM (custom output: `src/generated/prisma`)
- **Auth**: NextAuth.js v4 with Google provider (JWT strategy)
- **Payment**: Omise SDK for Thai payment processing
- **Styling**: Tailwind CSS v4

## Architecture

### Data Flow Pattern
1. **Raw Question Data** → stored as `RawQuestion[]` in `src/data/subjects/{subject}/{set}.ts`
2. **Topic Tagging** → auto-inferred via `ensureTopicsOnRaw()` in `src/lib/topicTagger.ts`
3. **Adapter Layer** → `toUIQuestions()` in `src/data/adapters.ts` converts to UI-friendly `Question` type
4. **Quiz Component** → `src/components/Quiz.tsx` (client-side) renders and manages state
5. **Analytics** → `analyzeSet()` in `src/lib/analytics.tsx` processes answers, returns `AnalysisResult`
6. **History** → saved to localStorage via `src/lib/history.tsx` as `AttemptRecord[]`

### Key Conventions

#### Prisma Custom Output
Prisma client generated to `src/generated/prisma` (not default `node_modules/.prisma/client`):
```typescript
// Always import from:
import { PrismaClient } from "@/generated/prisma";

// Singleton instance in src/lib/prisma.ts
export const prisma = global.prisma || new PrismaClient();
```

#### Authentication Pattern
- **Server Components**: Use `getServerSession(authOptions)` from `next-auth`
- **Client Components**: Use `useSession()` from `next-auth/react`
- **API Routes**: Call `getServerSession(authOptions)` for auth checks
- Session extended with custom fields: `session.user.id`, `session.user.isPremium`
- JWT callback in `src/lib/auth.ts` syncs `isPremium` status from DB on every request

#### Premium Feature Gating
- **Development**: Set `MOCK_UNLOCK_ALL = true` in `src/lib/config.ts` to bypass checks
- **Production**: Check `isPremium` flag and `premiumExpiresAt` from User model
- **UI Pattern**: Use `<PremiumProtectedFeature>` wrapper or inline checks in Quiz component
- **Payment Flow**: 
  1. Client calls `/api/checkout/premium` with Omise token
  2. API creates Omise charge + Payment record
  3. Webhook at `/api/webhooks/omise` updates User.isPremium on success

#### Question Data Structure
```typescript
// Raw format in data files
RawQuestion {
  id: string;
  text?: string;
  image?: string;
  topics?: string[]; // Auto-tagged if missing
  choices: RawChoice[];
  correctKey: "A" | "B" | "C" | "D";
  explanation?: string | string[]; // Premium content
}

// UI format (converted by adapter)
Question extends RawQuestion // Same structure, topics guaranteed
```

### Database Schema
- **User**: Auth + premium subscription (isPremium, premiumExpiresAt, omiseCustomerId)
- **Payment**: Transaction history (omiseChargeId, amount, status)
- **ExamSet**: Placeholder (not actively used - questions stored in TypeScript files)

### Critical Workflows

#### Adding New Questions
1. Create/edit file: `src/data/subjects/{subject}/{set}.ts`
2. Export `RawQuestion[]` array (e.g., `generalAllRaw`, `mathAllRaw`)
3. Questions auto-tagged by `topicTagger.ts` based on text patterns
4. No DB migration needed - questions are static TypeScript data
5. **Subject slugs**: general, thai, it, social_law, english, math (defined in `src/lib/subjects.tsx`)
6. **Currently implemented**: general, math (law folder exists but empty)

#### Running Development
```bash
npm run dev  # Starts Next.js with Turbopack
```
- Database: SQLite file (check `DATABASE_URL` in `.env`)
- Run `npx prisma migrate dev` after schema changes
- Run `npx prisma studio` to view/edit data

#### Premium Subscription Flow
1. User clicks upgrade → `/premium` page (client component)
2. Omise.js collects card → sends token to `/api/checkout/premium`
3. API creates charge, stores Payment record
4. Omise webhook (`/api/webhooks/omise`) confirms payment
5. User.isPremium updated, JWT refreshed on next request

### File Organization
- **Quiz Logic**: `src/components/Quiz.tsx` (500+ lines, handles state, submission, review mode)
- **API Routes**: `src/app/api/` (auth, checkout, webhooks, admin)
- **Question Sets**: `src/data/subjects/{general,math,law}/` (currently implemented subjects)
- **Subject Config**: `src/lib/subjects.tsx` (defines 6 subjects: general, thai, it, social_law, english, math)
- **Server Components**: `src/app/**/page.tsx` (most pages)
- **Client Components**: `src/components/*.tsx` (interactive UI)

### Common Pitfalls
1. **Prisma Import**: Never use `@prisma/client` - always `@/generated/prisma`
2. **Circular Imports**: Avoid importing from `@/data` inside `src/data/index.ts`
3. **NextAuth Session**: JWT contains `isPremium`, but refresh only happens on page load
4. **Omise Webhooks**: Must verify signature using `OMISE_WEBHOOK_SECRET`
5. **Image Paths**: Configure `next.config.ts` remotePatterns for external images

### Testing Premium Features Locally
Set `MOCK_UNLOCK_ALL = true` in `src/lib/config.ts` to unlock all premium explanations without payment. Remember to set back to `false` before production deployment.
