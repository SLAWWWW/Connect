# Frontend Implementation Plan

This document outlines the step-by-step plan to implement the frontend features and connect them to the backend API.

## Phase 1: Setup Demo User (Hardcoded)
The user requested to skip full auth and use a hardcoded demo user.

- [x] **Demo User Setup**:
  - Define a constant `DEMO_USER_ID` (e.g., `community-compass-demo-user`).
  - **Auto-Creation**: On app startup (`App.tsx`), check if this user exists. If not, create it (`POST /api/v1/users/`) with generic data (Name: "Demo User", Interests: ["Coding", "Hiking"], etc.).
  - **API Client**: Update `src/lib/api.ts` to always inject `x-user-id: DEMO_USER_ID` in headers.

## Phase 2: User Dashboard & Profile
- [x] **Home Page Update**:
  - Show "Welcome, Demo User" (or whatever name was created).
- [x] **Profile View**:
  - Fetch user details using `GET /api/v1/users/{DEMO_USER_ID}`.
  - Display name, email, interests, location.
  - Show "Likes" count.

## Phase 3: Groups & Community
- [x] **Group List**:
  - Page: `/groups`
  - Fetch all groups: `GET /api/v1/groups/`.
  - Display as cards (Name, Description, Activity, Members/Max).
- [x] **Recommended Groups**:
  - Section on Home or Groups page: "Recommended for You".
  - Fetch: `GET /api/v1/groups/recommended` (requires `x-user-id`).
- [x] **Create Group**:
  - Modal or Page: "Start a Community".
  - Form: Name, Description, Activity, Location, Max Members.
  - Submit: `POST /api/v1/groups/`.
- [x] **Group Details & Actions**:
  - View Group Details (modal or expanded card).
  - **Join**: `POST /api/v1/groups/{id}/join`.
  - **Leave**: `POST /api/v1/groups/{id}/leave`.
  - Refresh list after action.

## Phase 4: Social Interactions
- [ ] **User Directory** (Optional):
  - List other users.
  - **Like User**: `POST /api/v1/users/{id}/like`.
  - **Unlike**: `POST /api/v1/users/{id}/unlike`.

## Technical Tasks
- [x] Update `api.ts` with typed response interfaces matching Backend Pydantic models.
- [x] Add `react-query` (optional but recommended) or simple `useEffect` hooks for data fetching.
- [x] Add UI components for Forms, Cards, and Modals (using existing `shadcn/ui` components).
