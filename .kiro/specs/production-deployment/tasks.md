# Implementation Plan

- [ ] 1. Add API key validation to chat route
  - [ ] 1.1 Create `validateApiKey` function in `app/api/chat/route.ts`
    - Read `API_SECRET_KEY` from environment
    - Compare with `x-api-key` header from request
    - Return boolean indicating validity
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 1.2 Add authentication check to POST handler
    - Call `validateApiKey` at start of handler
    - Return 401 with `{ error: 'Unauthorized' }` if invalid
    - _Requirements: 1.1, 1.2_
  - [ ]* 1.3 Write property test for missing API key
    - **Property 1: Missing API key returns 401**
    - **Validates: Requirements 1.1**
  - [ ]* 1.4 Write property test for invalid API key
    - **Property 2: Invalid API key returns 401**
    - **Validates: Requirements 1.2**

- [ ] 2. Configure frontend to send API key
  - [ ] 2.1 Create `lib/api-config.ts` with API configuration
    - Export `API_BASE_URL` from `NEXT_PUBLIC_API_URL`
    - Export `API_KEY` from `NEXT_PUBLIC_API_KEY`
    - _Requirements: 2.3_
  - [ ] 2.2 Update `useChat` hook in `app/page.tsx` to include API key header
    - Import `API_KEY` from api-config
    - Add `headers: { 'x-api-key': API_KEY }` to useChat options
    - _Requirements: 2.3_

- [ ] 3. Configure Capacitor for production builds
  - [ ] 3.1 Update `capacitor.config.ts` for environment-aware configuration
    - Remove `server.url` for production builds (bundle static files)
    - Keep `server.url` only for development builds
    - _Requirements: 2.1_

- [ ] 4. Configure Next.js for API-only production mode
  - [ ] 4.1 Update `next.config.ts` to disable static file serving in production
    - Configure Next.js to only serve API routes
    - Static files are bundled in iOS app, not served by Next.js
    - _Requirements: 2.1_

- [ ] 5. Create environment documentation
  - [ ] 5.1 Create `.env.example` file
    - Add `PROVIDER_API_KEY` placeholder
    - Add `API_SECRET_KEY` placeholder
    - Add `NEXT_PUBLIC_API_KEY` placeholder
    - Add `NEXT_PUBLIC_API_URL` placeholder
    - Include comments explaining each variable
    - _Requirements: 3.1, 3.2_

- [ ] 6. Checkpoint - Verify implementation
  - Ensure all tests pass, ask the user if questions arise.
