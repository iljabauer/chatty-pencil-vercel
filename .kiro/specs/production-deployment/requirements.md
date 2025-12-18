# Requirements Document

## Introduction

This feature prepares the application for beta deployment with ~100 users. The focus is on simple API protection using a baked-in API key in the iOS app and configuring the production API URL.

## Glossary

- **API_Key**: A secret string used to authenticate requests from the iOS app to the backend
- **Chat_API**: The `/api/chat` endpoint that handles AI chat requests
- **iOS_App**: The native iOS application that communicates with the Chat_API
- **Production_URL**: The deployed backend URL where the Chat_API is hosted

## Requirements

### Requirement 1

**User Story:** As a developer, I want the API route protected with a simple API key, so that only the iOS app can access the chat functionality.

#### Acceptance Criteria

1. WHEN a request is made to the Chat_API without an `x-api-key` header THEN the Chat_API SHALL return a 401 Unauthorized response
2. WHEN a request is made to the Chat_API with an incorrect API_Key THEN the Chat_API SHALL return a 401 Unauthorized response
3. WHEN a request is made to the Chat_API with the correct API_Key THEN the Chat_API SHALL process the request normally
4. THE Chat_API SHALL read the expected API_Key from the `API_SECRET_KEY` environment variable

### Requirement 2

**User Story:** As a developer, I want the iOS app configured with the production API URL and API key, so that it can communicate with the deployed backend.

#### Acceptance Criteria

1. THE iOS_App SHALL have the Production_URL baked into the app configuration
2. THE iOS_App SHALL have the API_Key baked into the app configuration
3. THE iOS_App SHALL include the API_Key in the `x-api-key` header for all Chat_API requests

### Requirement 3

**User Story:** As a developer, I want environment variable documentation, so that deployment is straightforward.

#### Acceptance Criteria

1. THE system SHALL provide an `.env.example` file documenting all required environment variables
2. THE `.env.example` file SHALL include placeholder values for `PROVIDER_API_KEY`, `API_SECRET_KEY`, and `PRODUCTION_URL`
