# PaperClue — Research Operating System (Frontend)

Next.js frontend for the PaperClue AI demo: upload a paper, explore it as a network, and run AI-powered research tools. All AI calls go through Supabase edge functions — the frontend never talks to the Anthropic API directly and never sees the service_role key.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in the Supabase URL + publishable key
npm run dev
```

## Tools

| Tool | Edge function | Status |
|---|---|---|
| Mind Map | `mind-map` | ✅ Live — topic → keyword map, rendered as an interactive canvas |
| Paper Insights | `paper-insights` | ✅ Live — attach a paper, get a scored readiness review |
| Proofreader | `proofreading` | ✅ Live — document split into sections client-side (5 req/min limit) |
| Journal Formatting | `journal-formatting` | ⏳ Backend returns "not implemented yet" |
| Research Chat | — | ⏳ Waiting on a conversational edge function |

## Architecture notes

- **Auth**: Supabase email/password. Guests are modeled as "no session or anonymous session" (`isGuest` in `src/lib/auth-context.tsx`). Password policy is 12+ characters; public sign-ups require email confirmation.
- **Document parsing** happens entirely in the browser (`src/lib/parse-file.ts`, pdfjs + mammoth). Raw text is sent to edge functions in memory only and never persisted, per the security design.
- **`mind-map` contract** (verified live): `{ topic: string }` → `{ keywords: [{ keyword, description }] }`. The backend integration PDF's `ai-proxy` name and `{ prompt }` shape are stale.
- **AI responses** render as sanitized markdown (`react-markdown`, no raw HTML).
- `/debug/mind-map` is a temporary API probe page for the mind-map function — remove before production.

## Security rules (from the backend integration guide)

- Never call `api.anthropic.com` from frontend code.
- Never put the `service_role` key or DB connection string anywhere in this repo.
- Route every AI call through the edge functions with the user's session JWT.
