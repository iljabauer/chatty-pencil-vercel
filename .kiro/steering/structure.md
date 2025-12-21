# Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/chat/route.ts         # AI chat endpoint (streaming)
│   ├── page.tsx                  # Main chat interface
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ai-elements/              # Vercel AI Elements (PREFER these)
│   │   ├── conversation.tsx      # Chat container with scroll
│   │   ├── message.tsx           # Message display
│   │   ├── prompt-input.tsx      # Input with attachments
│   │   ├── reasoning.tsx         # AI reasoning display
│   │   └── ...                   # Other AI UI components
│   ├── ui/                       # Radix-based primitives
│   └── ToggleCanvasButton.tsx    # Canvas toggle component
│
├── lib/
│   ├── canvas-plugin.ts          # Canvas plugin re-exports
│   ├── useCanvasPlugin.ts        # React hook for canvas
│   ├── api-config.ts             # API URL/key configuration
│   ├── binary-utils.ts           # Base64/blob utilities
│   └── utils.ts                  # General utilities (cn)
│
├── capacitor-canvas-plugin/      # Native iOS plugin
│   ├── src/                      # TypeScript definitions
│   ├── ios/Sources/              # Swift implementation
│   └── dist/                     # Built plugin
│
├── ios/                          # iOS app (Capacitor)
│   └── App/
│       ├── App.xcworkspace       # USE THIS for builds
│       └── App/public/           # Bundled web assets
│
├── public/                       # Static assets
└── out/                          # Static export output
```

## Key Patterns

### Canvas Integration
- `useCanvasPlugin` hook manages canvas state and callbacks
- Canvas returns `CanvasResult` with action type and optional image data
- Images sent as base64 data URLs in message parts

### API Route
- Single endpoint: `POST /api/chat`
- Supports both JSON and multipart/form-data
- Protected by `x-api-key` header
- Returns UI message stream with sources/reasoning

### Component Hierarchy
- `Conversation` > `Message` > `MessageContent` > `MessageResponse`
- `PromptInput` > `PromptInputBody` > `PromptInputTextarea`
- Always check `ai-elements/` first for UI needs
