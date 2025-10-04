# 🎯 Feature Permissions System Setup

## What This Adds

Admin control over Phase 8 features:
- ✅ **Global Enable/Disable** - Turn features off for everyone
- ✅ **Per-User Permissions** - Control who can access each feature
- ✅ **4 Features Controlled**:
  - Random Pick Generator
  - Upset Alerts
  - Power Rankings  
  - Matchup Simulator

## Installation Steps

### 1. Apply Database Migration

Run this command to add the new permission fields to your database:

```bash
npx prisma migrate dev --name add_feature_permissions
```

This will:
- Add `FeatureSettings` table for global toggles
- Add permission fields to `User` table:
  - `canUseRandomPicker`
  - `canSeeUpsetAlerts`
  - `canSeePowerRankings`
  - `canUseMatchupSim`

### 2. Generate Prisma Client

After the migration, regenerate the Prisma client:

```bash
npx prisma generate
```

### 3. Restart Your Dev Server

```bash
npm run dev
```

## How To Use

### Admin Panel

1. Go to **Admin Dashboard**
2. Look for **"Feature Permissions"** section (needs to be added to admin page)
3. You'll see:
   - **Global Settings** - Enable/disable features for everyone
   - **User Permissions** - Control individual user access

### Global Settings

Toggle each feature on/off globally:
- 🎲 **Random Pick Generator** - Auto-fill picks with 5 strategies
- 🚨 **Upset Alerts** - AI-powered upset predictions
- 🏆 **Power Rankings** - Live weekly rankings
- ⚔️ **Matchup Simulator** - Head-to-head predictor

### Per-User Control

For each user, toggle which features they can see:
- If global setting is OFF, user can't access it (even if their permission is ON)
- If global setting is ON, user can only access if their permission is ON
- Both must be TRUE for the feature to show

## API Endpoints

### Get Current User Permissions
```
GET /api/user/permissions
```

Returns what the current user can access.

### Admin: Get Feature Settings
```
GET /api/admin/feature-settings
```

Returns global feature toggles.

### Admin: Update Feature Settings
```
PUT /api/admin/feature-settings
Body: {
  randomPickerEnabled: boolean,
  upsetAlertsEnabled: boolean,
  powerRankingsEnabled: boolean,
  matchupSimulatorEnabled: boolean
}
```

### Admin: Get All User Permissions
```
GET /api/admin/user-permissions
```

### Admin: Update User Permissions
```
PUT /api/admin/user-permissions
Body: {
  userId: number,
  permissions: {
    canUseRandomPicker: boolean,
    canSeeUpsetAlerts: boolean,
    canSeePowerRankings: boolean,
    canUseMatchupSim: boolean
  }
}
```

## Default Behavior

- All features default to **ENABLED** for everyone
- New users get all permissions set to **TRUE**
- If database tables don't exist yet, features show for everyone (safe fallback)

## Integration

The picks interface already checks permissions before showing:
- Random Pick Generator
- Upset Alerts

Still needs integration:
- Power Rankings (add to stats page)
- Matchup Simulator (add to stats page)

## Admin UI Component

Already created:  
`src/components/admin/feature-permissions.tsx`

Add this to your admin dashboard:

```tsx
import { FeaturePermissions } from '@/components/admin/feature-permissions';

// In your admin page:
<FeaturePermissions />
```

## Troubleshooting

### "Property 'featureSettings' does not exist"

Run: `npx prisma generate`

### "canUseRandomPicker does not exist"

Run: `npx prisma migrate dev`

### Features still showing when disabled

Check that both global AND user permissions are considered:
```typescript
const canShow = globalSettings.featureEnabled && user.canUseFeature;
```

## Perfect Use Cases

- **Competitive Balance**: Disable Random Picker to keep it skill-based
- **New Users**: Give veterans upset alerts, make rookies figure it out
- **VIP Features**: Power Rankings only for paid members
- **Testing**: Enable features for specific users before full rollout

Enjoy granular control over your awesome features! 🎮
