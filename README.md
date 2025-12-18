# Chatty Pencil

A handwriting-first ChatGPT experience for iPad that transforms natural drawing and writing into AI conversations. Draw, sketch, or write with Apple Pencil, then get AI responses in real-time.

## ✨ Features

- **Native Apple Pencil Support**: Fullscreen canvas with PencilKit integration for smooth, low-latency drawing
- **Handwriting-First Input**: Canvas button as the primary input method, with keyboard as secondary option
- **Visual Conversations**: Submit drawings as images and receive streaming AI text responses
- **Smart State Management**: Preserves unsaved canvas content when switching between input modes
- **Seamless Integration**: Built with Vercel's AI Elements for consistent chat UI patterns

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Xcode 14+ (for iOS development)
- iOS device or simulator with Apple Pencil support

### Installation

```bash
# Clone and install dependencies
npm install

# Install iOS dependencies
npx cap sync ios

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

### iOS Development

```bash
# Open in Xcode
npx cap open ios

# Build and run on device/simulator
```

## 🎨 How It Works

1. **Open Canvas**: Tap the canvas button to open a fullscreen drawing surface
2. **Draw & Write**: Use Apple Pencil or touch to create handwritten content
3. **Submit**: Tap submit to send your drawing as a chat message
4. **AI Response**: Receive streaming text responses from the AI
5. **Continue**: Switch between canvas and keyboard input as needed

## 🏗️ Architecture

### Core Components

- **Canvas Plugin** (`capacitor-canvas-plugin/`): Native iOS plugin with PencilKit integration
- **useCanvasPlugin Hook** (`lib/useCanvasPlugin.ts`): React state management for canvas interactions
- **ToggleCanvasButton** (`components/ToggleCanvasButton.tsx`): UI component with unsaved content indicators
- **AI Elements Integration** (`app/page.tsx`): Chat interface using Vercel's AI SDK and UI components

### Key Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Mobile**: Capacitor 7 for native iOS integration
- **Canvas**: PencilKit (iOS) for Apple Pencil support
- **AI**: Vercel AI SDK with streaming responses
- **UI**: Vercel AI Elements, Tailwind CSS, Radix UI

## 📱 Canvas Plugin API

The native canvas plugin provides three core methods:

```typescript
// Open fullscreen canvas
const result = await Canvas.openCanvas({ backgroundColor: 'white' });

// Check for unsaved content
const { hasContent } = await Canvas.hasContent();

// Clear preserved state
await Canvas.clearCanvas();
```

### Canvas Results

```typescript
interface CanvasResult {
  action: 'submitted' | 'minimized' | 'cancelled';
  imageData?: string; // Base64 PNG (when submitted)
  hasContent: boolean; // Whether canvas has strokes
}
```

## ⚙️ Environment Configuration

The application requires several environment variables for proper operation. Copy `.env.example` to `.env.local` and configure the following:

### Required Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `PROVIDER_API_KEY` | Server | Authentication with AI provider (OpenAI, Anthropic, etc.) |
| `API_SECRET_KEY` | Server | Protects the `/api/chat` endpoint from unauthorized access |
| `NEXT_PUBLIC_API_KEY` | Client (build-time) | API key sent by iOS app to authenticate with backend |
| `NEXT_PUBLIC_API_URL` | Client (build-time) | Production API base URL (e.g., `https://api.example.com`) |

### Security Notes

- `API_SECRET_KEY` and `NEXT_PUBLIC_API_KEY` must match for authentication to work
- Use a strong, randomly generated string for `API_SECRET_KEY`
- `NEXT_PUBLIC_*` variables are embedded in the client build and visible to users
- For production deployment, ensure all variables are properly configured

### Development vs Production

- **Development**: `NEXT_PUBLIC_API_URL` can be empty (uses same-origin requests)
- **Production**: `NEXT_PUBLIC_API_URL` should point to your deployed backend URL

## 🔧 Development

### Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and hooks
├── capacitor-canvas-plugin/ # Native iOS plugin
├── .kiro/specs/           # Feature specifications
└── ios/                   # iOS app bundle
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
npx cap sync ios     # Sync native dependencies
npx cap open ios     # Open in Xcode
```

### Testing

The project includes property-based tests for canvas functionality:

- PNG export validation
- State preservation on minimize/reopen
- Empty canvas submission prevention
- Content clearing verification

## 📋 Requirements Status

Based on the [specification](.kiro/specs/handwriting-canvas/requirements.md), current implementation status:

- ✅ **Canvas Drawing**: Fullscreen canvas with Apple Pencil support
- ✅ **Image Submission**: Convert drawings to PNG and send as chat messages
- ✅ **Canvas Clearing**: Clear canvas state and strokes
- ✅ **State Preservation**: Maintain drawings when minimizing canvas
- ✅ **Toggle Interface**: Canvas button with unsaved content indicators
- ✅ **Plugin Integration**: Native iOS plugin with React hooks
- 🚧 **Canvas-First Input**: Primary canvas button implementation in progress
- 🚧 **Message Display**: Image thumbnails in chat history
- 🚧 **Auto-scroll**: Conversation scroll management
- 🚧 **New Conversation**: Reset functionality

## 🤝 Contributing

1. Check the [implementation plan](.kiro/specs/handwriting-canvas/tasks.md) for current progress
2. Review [requirements](.kiro/specs/handwriting-canvas/requirements.md) for feature specifications
3. Follow the existing code patterns and TypeScript conventions
4. Test on actual iOS devices with Apple Pencil when possible

## 📄 License

This project is part of a larger handwriting-focused chat application. See individual component licenses for details.

---

Built with ❤️ for natural, intuitive AI conversations through handwriting and drawing.
