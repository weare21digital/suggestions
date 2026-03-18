# @21digital/suggestions

A reusable suggestions/feedback system for React + Next.js apps. Features a floating 💡 FAB with glow/jiggle animations, a modal with submit and history tabs, admin reply management, and a store-agnostic backend service.

## Quick Start

### 1. Install

```bash
# From git (monorepo local package)
pnpm add @21digital/suggestions@file:../packages/suggestions
```

### 2. Add Prisma Model

Copy `prisma/schema-snippet.prisma` into your schema and run migration.

### 3. Implement the Store

```typescript
import type { SuggestionStore } from '@21digital/suggestions';
import { prisma } from '@/lib/prisma';

export const suggestionStore: SuggestionStore = {
  async create(data) {
    return prisma.suggestion.create({ data });
  },
  async findMostRecentOpen(userId) {
    return prisma.suggestion.findFirst({
      where: { userId, status: 'open' },
      orderBy: { createdAt: 'desc' },
    });
  },
  async findByUser(userId) {
    return prisma.suggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },
  async findById(id) {
    return prisma.suggestion.findUnique({ where: { id } });
  },
  async update(id, data) {
    return prisma.suggestion.update({ where: { id }, data });
  },
  async findAll({ status, search, page, limit }) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [suggestions, totalCount] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.suggestion.count({ where }),
    ]);
    return {
      suggestions: suggestions.map((s) => ({
        ...s,
        userEmail: s.user?.email || 'Anonymous',
      })),
      totalCount,
    };
  },
};
```

### 4. Create the Service

```typescript
import { SuggestionService } from '@21digital/suggestions';
import { suggestionStore } from './suggestion-store';

export const suggestionService = new SuggestionService(suggestionStore, {
  rateLimitHours: 1,
  onNewSuggestion: (suggestion, email) => {
    // Send notification email
  },
  onStatusChange: (suggestion, oldStatus, newStatus) => {
    if (newStatus === 'implemented') {
      // Send "implemented" notification
    }
  },
});
```

### 5. Create API Routes

```typescript
// app/api/suggestions/route.ts
import { createSuggestionsHandler } from '@21digital/suggestions/server/suggestions-handler';
import { suggestionService } from '@/lib/suggestion-service';
import { getServerSession } from 'next-auth';

const handler = createSuggestionsHandler(suggestionService, {
  getUser: async (request) => {
    const session = await getServerSession();
    if (!session?.user) return null;
    return { id: session.user.id, email: session.user.email };
  },
});

export const GET = handler.GET;
export const POST = handler.POST;
```

```typescript
// app/api/admin/suggestions/route.ts
import { createAdminSuggestionsHandler } from '@21digital/suggestions/server/admin-suggestions-handler';
import { suggestionService } from '@/lib/suggestion-service';

const handler = createAdminSuggestionsHandler(suggestionService, {
  getAdmin: async (request) => {
    const session = await getServerSession();
    if (!session?.user?.isAdmin) return null;
    return { id: session.user.id };
  },
});

export const GET = handler.GET;
export const PUT = handler.PUT;
```

### 6. Add FAB to Layout

```tsx
import { SuggestionsFab } from '@21digital/suggestions/client';

export default function Layout({ children }) {
  const session = useSession();
  return (
    <>
      {children}
      <SuggestionsFab
        isAuthenticated={!!session?.user}
        userId={session?.user?.id}
        isAdmin={session?.user?.isAdmin}
        primaryColor="#0d9488"        // teal
        secondaryColor="#0f766e"
        glowColor="rgba(13, 148, 136, 0.4)"
      />
    </>
  );
}
```

## Theming

All colors are configurable via props:

| Prop | Default | Description |
|------|---------|-------------|
| `primaryColor` | `#0d9488` (teal) | Main accent color |
| `secondaryColor` | `#0f766e` | FAB gradient end |
| `glowColor` | `rgba(13, 148, 136, 0.4)` | FAB glow/shadow |

For the original bitcoinstandard-app orange theme:
```tsx
<SuggestionsFab
  primaryColor="#f97316"
  secondaryColor="#ea580c"
  glowColor="rgba(249, 115, 22, 0.4)"
/>
```

## i18n

Pass custom labels via the `labels` prop:
```tsx
<SuggestionsFab
  labels={{
    fabTitle: 'Имаш идея?',
    submitNew: 'Изпрати нова',
    mySuggestions: 'Моите предложения',
  }}
/>
```

## Development

Ships TypeScript source, compiles to JS via `prepare` hook on install.

- **Consumers:** just `npm install` — compilation is automatic (the `prepare` script runs `tsc`)
- **To develop:** edit source files, then run `npm run build`
- **`dist/` is gitignored** — never committed, built fresh on every install

### Plugin pattern

All `@21digital/*` plugins follow this convention:
- Source: `.ts` / `.tsx` files
- Compiled output: `dist/*.js` + `dist/*.d.ts`
- `package.json` exports point to `dist/` (not source)
- `prepare` hook ensures auto-compilation on `npm install`
- `tsconfig.json` with `outDir: "dist"`

When creating new plugins, follow this same pattern to avoid Turbopack/bundler compatibility issues.

## Architecture

```
suggestions/
├── client/          # React components (use client)
│   ├── SuggestionsFab.tsx      # Floating 💡 button
│   ├── SuggestionsModal.tsx    # Modal with tabs
│   ├── SubmitForm.tsx          # Submit form
│   ├── MySuggestions.tsx       # User's suggestion list
│   └── admin/
│       └── SuggestionReplyModal.tsx  # Admin reply UI
├── server/          # Next.js route handler factories
│   ├── suggestions-handler.ts
│   └── admin-suggestions-handler.ts
├── lib/
│   ├── types.ts                # All types + SuggestionStore interface
│   ├── suggestion-service.ts   # Business logic (store-agnostic)
│   └── parse-replies.ts        # Reply string parser
└── prisma/
    └── schema-snippet.prisma   # Copy into your schema
```

## Features

- 💡 Floating FAB with glow + jiggle animation
- 📝 Modal with Submit / My Suggestions tabs
- 🏷️ Type picker (suggestion vs bug)
- ⏱️ Configurable rate limiting
- 📊 Status state machine: open → reviewing → planned → implemented → declined
- 💬 Admin reply thread with timestamps
- 🎨 Fully themeable (colors via props)
- 🌐 i18n via labels prop
- 🔌 Store-agnostic (implement SuggestionStore with any ORM)
- 🔒 Auth via props (no framework lock-in)
