# Week Navigation - Implementation TODO

## User Requirements
1. Users need to view past weeks to see their picks and results
2. Users should be able to make picks for future weeks
3. Admin can view/edit any week (past, present, future)
4. Current week should be indicated clearly

## Implementation Steps

### Phase 1: Basic Week Navigation UI
- Add Previous/Next week buttons to picks page header
- Add "Week X of 18" indicator
- Disable previous button on Week 1
- Disable next button on Week 18
- Add "Current Week" badge when viewing current week

### Phase 2: API Updates
- Update /api/games/current-week to accept week parameter
- Return current week number along with requested week
- Validate week range (1-18)

### Phase 3: Lock Logic
- Past weeks: Show picks but disable editing
- Current week: Lock based on first game time
- Future weeks: Allow editing until that week starts
- Admin: Can always edit any week

### Phase 4: Admin Week Navigation
- Add same week navigation to admin picks page
- Allow admin to select any week
- Show which weeks have picks

## Files to Modify
- /src/components/picks-interface.tsx
- /src/components/admin-picks-management.tsx
- /src/app/api/games/current-week/route.ts
- /src/app/api/admin/picks/route.ts

## Current Status
- Started implementation but created errors
- Need to carefully refactor without breaking existing code
- Priority: HIGH - Users need this feature

## Testing Plan
1. Navigate to Week 1, verify can't go earlier
2. Navigate to Week 18, verify can't go later
3. Make picks in future week, save, navigate away, come back
4. View past week, verify can't edit
5. Admin can edit any week
