## Core Features (Must Have)
- [ ] **"Looking for -1" Feature**:
    - [ ] Add `is_looking_for_members` flag to Groups.
    - [ ] Algorithm to find groups near me that need 1 person.
- [ ] **Recommendation Engine**:
    - [ ] Match users to groups based on `interests`.
    - [ ] Simple scoring: +1 for matching interest, +1 for same location.
- [ ] **Rating System**:
    - [ ] POST `/ratings/` to limit bad actors.
    - [ ] Simple average score calculation on User profile.

## UX / API Improvements
- [ ] **Activity List**: Endpoint to get list of valid activities (Badminton, Basketball, etc.) to ensure consistent data.
- [ ] **Search**: Filter groups by Activity and Location.