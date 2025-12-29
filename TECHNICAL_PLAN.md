# Loumi - Technical Implementation Plan

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI SDK**: Vercel AI SDK (unified provider abstraction)
- **Database**: PostgreSQL (self-hosted) + Drizzle ORM
- **Auth**: Auth.js v5 (Email + Google + GitHub)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (client) + React Query (server)
- **Local Storage**: IndexedDB (Dexie.js) for Sovereign tier

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (chat)/
│   │   ├── page.tsx                    # Main chat interface
│   │   ├── c/[conversationId]/page.tsx # Specific conversation
│   │   └── layout.tsx                  # Sidebar + header
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── privacy/page.tsx
│   │   └── billing/page.tsx
│   ├── api/
│   │   ├── chat/route.ts               # Main chat endpoint
│   │   ├── conversations/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── message-bubble.tsx
│   │   ├── chat-input.tsx
│   │   ├── model-selector.tsx
│   │   ├── thinking-display.tsx        # Chain-of-thought UI
│   │   └── web-search-results.tsx
│   ├── sidebar/
│   │   ├── conversation-sidebar.tsx
│   │   ├── conversation-item.tsx
│   │   └── folder-tree.tsx
│   ├── privacy/
│   │   ├── audit-trail.tsx
│   │   ├── pii-indicator.tsx
│   │   └── tier-badge.tsx
│   └── ui/                             # shadcn components
├── lib/
│   ├── ai/
│   │   ├── providers.ts                # Model registry
│   │   ├── tools/
│   │   │   ├── web-search.ts
│   │   │   └── index.ts
│   │   └── middleware/
│   │       ├── pii-sanitizer.ts
│   │       └── privacy-router.ts
│   ├── db/
│   │   ├── schema.ts                   # Drizzle schema
│   │   ├── index.ts
│   │   └── queries/
│   │       ├── conversations.ts
│   │       ├── messages.ts
│   │       └── audit-logs.ts
│   ├── auth/
│   │   └── config.ts                   # Auth.js config
│   ├── privacy/
│   │   ├── pii-detector.ts
│   │   ├── anonymizer.ts
│   │   └── encryption.ts
│   ├── local-storage/
│   │   └── sovereign-db.ts             # IndexedDB for Sovereign tier
│   └── utils/
│       └── index.ts
├── hooks/
│   ├── use-chat-stream.ts
│   ├── use-conversations.ts
│   ├── use-privacy-tier.ts
│   └── use-local-storage.ts
├── stores/
│   ├── chat-store.ts
│   └── ui-store.ts
└── types/
    ├── chat.ts
    ├── privacy.ts
    └── models.ts
```

---

## Phase 1: Foundation (Core Infrastructure)

### 1.1 Project Setup
- Initialize Next.js 16 with TypeScript
- Configure Tailwind CSS + shadcn/ui
- Set up Drizzle ORM with PostgreSQL
- Configure Auth.js v5 with providers

### 1.2 Database Schema

```typescript
// src/lib/db/schema.ts
// Core tables: users, conversations, messages, audit_logs, subscriptions
```

**Tables:**
- `users`: id, email, name, privacy_tier, created_at
- `conversations`: id, user_id, title, model, folder_id, pinned, archived, created_at
- `messages`: id, conversation_id, role, content, model, tokens_used, created_at
- `audit_logs`: id, user_id, action, provider, tokens, pii_detected, timestamp
- `folders`: id, user_id, name, parent_id
- `subscriptions`: id, user_id, tier, stripe_customer_id, status

### 1.3 Authentication
- Auth.js v5 with Email magic link + Google + GitHub
- Middleware for protected routes
- Session handling with privacy tier info

---

## Phase 2: AI Integration

### 2.1 Model Registry

```typescript
// src/lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const models = {
  // OpenAI
  'gpt-4o': { provider: openai, id: 'gpt-4o', name: 'GPT-4o' },
  'gpt-4-turbo': { provider: openai, id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  'o1': { provider: openai, id: 'o1', name: 'O1' },
  // Anthropic
  'claude-opus-4': { provider: anthropic, id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
  'claude-sonnet-4': { provider: anthropic, id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  'claude-haiku-3.5': { provider: anthropic, id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5' },
  // Google
  'gemini-2-flash': { provider: google, id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  'gemini-1.5-pro': { provider: google, id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  'gemini-1.5-flash': { provider: google, id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
} as const;
```

### 2.2 Chat API Route

```typescript
// src/app/api/chat/route.ts
import { streamText } from 'ai';
import { getModel } from '@/lib/ai/providers';
import { sanitizePII } from '@/lib/privacy/pii-detector';
import { routeByPrivacyTier } from '@/lib/ai/middleware/privacy-router';
import { webSearchTool } from '@/lib/ai/tools/web-search';

export async function POST(req: Request) {
  const { messages, modelId, conversationId, enableWebSearch, enableThinking } = await req.json();
  const session = await auth();

  // Privacy tier routing
  const { sanitizedMessages, piiMap } = await sanitizePII(messages, session.user.privacyTier);

  // Build tools array
  const tools = enableWebSearch ? { webSearch: webSearchTool } : {};

  // Stream response with optional thinking
  const result = await streamText({
    model: getModel(modelId),
    messages: sanitizedMessages,
    tools,
    experimental_thinking: enableThinking ? { enabled: true } : undefined,
    onFinish: async ({ usage }) => {
      // Log to audit trail based on privacy tier
      await logAuditEntry({ ... });
    }
  });

  return result.toDataStreamResponse();
}
```

### 2.3 Web Search Tool

```typescript
// src/lib/ai/tools/web-search.ts
import { tool } from 'ai';
import { z } from 'zod';

export const webSearchTool = tool({
  description: 'Search the web for current information',
  parameters: z.object({
    query: z.string().describe('Search query'),
  }),
  execute: async ({ query }) => {
    // Use Tavily API
    const results = await fetch(`https://api.tavily.com/search`, {
      method: 'POST',
      body: JSON.stringify({ query, max_results: 5 }),
    });
    return results.json();
  },
});
```

### 2.4 Thinking Mode Display

```typescript
// src/components/chat/thinking-display.tsx
// Collapsible component showing chain-of-thought reasoning
// Uses experimental_thinking from Vercel AI SDK
// Shows spinner while thinking, then collapsed "View reasoning" button
```

---

## Phase 3: Chat Interface

### 3.1 Main Chat Component

```typescript
// src/components/chat/chat-interface.tsx
// - Model selector dropdown (9 models grouped by provider)
// - Toggle for web search (magnifying glass icon)
// - Toggle for thinking mode (brain icon)
// - Streaming message display
// - Auto-scroll with user override
```

### 3.2 Message Display
- User messages: right-aligned, blue background
- AI messages: left-aligned, gray background
- Thinking blocks: collapsible, muted styling
- Web search results: card layout with source links
- Code blocks: syntax highlighting + copy button

### 3.3 Conversation Sidebar
- Folder structure (drag & drop)
- Search across all conversations
- Pin/archive actions
- New conversation button
- Model indicator per conversation

---

## Phase 4: Privacy Layer

### 4.1 PII Detection & Sanitization

```typescript
// src/lib/privacy/pii-detector.ts
const PII_PATTERNS = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  apiKey: /\b(sk-|pk_|api[_-]?key)[a-zA-Z0-9]{20,}\b/gi,
};

export function detectAndSanitize(text: string, tier: PrivacyTier) {
  // Returns { sanitizedText, piiMap } for later restoration
}
```

### 4.2 Privacy Tier Router

```typescript
// src/lib/ai/middleware/privacy-router.ts
export async function routeByPrivacyTier(tier: PrivacyTier, data: MessageData) {
  switch (tier) {
    case 'community':
      // Store everything, log for monetization
      return { store: 'server', anonymize: false };
    case 'private':
      // Anonymize PII, use pooled credentials
      return { store: 'server', anonymize: true, poolCredentials: true };
    case 'sovereign':
      // Store only locally, E2E encrypt
      return { store: 'local', anonymize: true, encrypt: true };
  }
}
```

### 4.3 Sovereign Tier Local Storage

```typescript
// src/lib/local-storage/sovereign-db.ts
import Dexie from 'dexie';

class SovereignDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;

  constructor() {
    super('loumi-sovereign');
    this.version(1).stores({
      conversations: '++id, title, model, createdAt',
      messages: '++id, conversationId, role, content, createdAt',
    });
  }
}

// E2E encryption with user-derived key
export async function encryptAndStore(data: any, userKey: CryptoKey) { ... }
export async function decryptAndRetrieve(id: string, userKey: CryptoKey) { ... }
```

### 4.4 Audit Trail

```typescript
// src/lib/db/queries/audit-logs.ts
// Log every API request with:
// - Provider, model, token count
// - PII detected (types only, not content)
// - Timestamp, credential pool ID (for Private tier)
```

---

## Phase 5: Conversation Management

### 5.1 CRUD Operations
- Create conversation (auto-title from first message)
- Update title, folder, pin status
- Archive / soft delete
- Search across messages (full-text search in Postgres)

### 5.2 Cross-Model Memory
- Store conversation history independent of model
- When switching models mid-conversation:
  - Summarize context if token limit exceeded
  - Pass full history to new model
  - Preserve message attribution (which model said what)

### 5.3 Export Formats
- Markdown
- JSON
- PDF (using react-pdf)

---

## Phase 6: Settings & Billing

### 6.1 Privacy Settings Page
- Current tier display with upgrade/downgrade
- Audit trail viewer
- PII detection sensitivity toggles
- Data export/delete controls

### 6.2 Stripe Integration
- Three subscription products (Community, Private, Sovereign)
- Customer portal for management
- Webhook handling for subscription changes

---

## Implementation Order

1. **Foundation** (Phase 1)
   - `src/app/layout.tsx`, `globals.css`
   - `src/lib/db/schema.ts`, `src/lib/db/index.ts`
   - `src/lib/auth/config.ts`
   - Auth routes and middleware

2. **AI Core** (Phase 2)
   - `src/lib/ai/providers.ts`
   - `src/app/api/chat/route.ts`
   - `src/lib/ai/tools/web-search.ts`

3. **Chat UI** (Phase 3)
   - `src/components/chat/chat-interface.tsx`
   - `src/components/chat/message-list.tsx`
   - `src/components/chat/model-selector.tsx`
   - `src/components/chat/thinking-display.tsx`
   - `src/components/sidebar/conversation-sidebar.tsx`

4. **Privacy** (Phase 4)
   - `src/lib/privacy/pii-detector.ts`
   - `src/lib/ai/middleware/privacy-router.ts`
   - `src/lib/local-storage/sovereign-db.ts`
   - `src/components/privacy/audit-trail.tsx`

5. **Conversation Management** (Phase 5)
   - `src/lib/db/queries/conversations.ts`
   - `src/hooks/use-conversations.ts`
   - Folder/archive/pin features

6. **Settings & Billing** (Phase 6)
   - `src/app/settings/*`
   - Stripe webhook handlers

---

## Key Architectural Decisions

### SOLID Principles Applied
- **S**: Each file has single responsibility (pii-detector only detects PII)
- **O**: Model registry open for extension, closed for modification
- **L**: All AI providers implement same interface via Vercel AI SDK
- **I**: Small, focused interfaces (e.g., MessageProps vs ConversationProps)
- **D**: Components depend on abstractions (useChat hook, not direct API calls)

### DRY Implementation
- Shared `use-chat-stream` hook for all chat pages
- Centralized model configuration in `providers.ts`
- Reusable UI components via shadcn/ui
- Common privacy middleware for all API routes

### KISS Patterns
- Use Vercel AI SDK's built-in streaming instead of custom WebSocket
- Leverage Drizzle's type-safe queries instead of raw SQL
- Client-side state with Zustand (simpler than Redux)
- IndexedDB via Dexie (simpler than raw IndexedDB API)

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Web Search
TAVILY_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```
