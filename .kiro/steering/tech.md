# Tech Stack

## Frontend
- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4

## Mobile
- Capacitor 7 for native iOS integration
- PencilKit (iOS) for Apple Pencil canvas
- Custom Capacitor plugin: `capacitor-canvas-plugin/`

## AI Integration
- Vercel AI SDK (`ai` package)
- `@ai-sdk/react` for React hooks (`useChat`)
- `@ai-sdk/openai-compatible` for provider abstraction

## UI Components
- Vercel AI Elements (`components/ai-elements/`) - PREFERRED for chat UI
- Radix UI primitives (`components/ui/`)
- Lucide React icons

## Key Libraries
- `zod` for validation
- `shiki` for syntax highlighting
- `streamdown` for markdown streaming
- `class-variance-authority` + `tailwind-merge` for styling

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Build
npm run build            # Production build
npm run lint             # ESLint

# iOS Development
npx cap sync ios         # Sync web assets to iOS
npx cap open ios         # Open in Xcode

# Canvas Plugin (auto-runs on npm install via postinstall)
cd capacitor-canvas-plugin && npm run build
```

## Environment Variables
- `PROVIDER_API_KEY` - AI provider authentication (server)
- `API_SECRET_KEY` - Protects `/api/chat` endpoint (server)
- `NEXT_PUBLIC_API_KEY` - Client API key (must match API_SECRET_KEY)
- `NEXT_PUBLIC_API_URL` - Production API base URL
- `API_ONLY_MODE` - Set `true` for API-only deployment

## Build Modes
- Default: Static export (`output: "export"`) for iOS app bundling
- API-only: Server mode for separate backend deployment
