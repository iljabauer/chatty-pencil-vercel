# Chatty Pencil

A handwriting-first ChatGPT experience for iPad that transforms natural drawing and writing into AI conversations.

## Core Concept
- Primary input via Apple Pencil on a fullscreen canvas (PencilKit)
- Drawings/handwriting converted to PNG and sent to AI as images
- Streaming AI text responses via Vercel AI SDK
- Keyboard input available as secondary option

## Key Features
- Native Apple Pencil support with low-latency drawing
- Canvas state preservation when minimizing (unsaved content indicator)
- Image attachments displayed as thumbnails in chat
- New conversation resets both messages and canvas state

## Target Platform
- iPad-focused iOS app (built with Capacitor)
- Web interface for development/testing
