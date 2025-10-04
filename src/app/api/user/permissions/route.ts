import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';

/**
 * GET - Get current user's feature permissions
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get global settings
    const globalSettings = await prisma.featureSettings.findFirst();
    
    // Get user permissions
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        canUseRandomPicker: true,
        canSeeUpsetAlerts: true,
        canSeePowerRankings: true,
        canUseMatchupSim: true,
      },
    });

    if (!user || !globalSettings) {
      // Default to all enabled if no settings found
      return NextResponse.json({
        permissions: {
          randomPicker: true,
          upsetAlerts: true,
          powerRankings: true,
          matchupSimulator: true,
        },
      });
    }

    // Combine global and user permissions (both must be true)
    const permissions = {
      randomPicker: globalSettings.randomPickerEnabled && user.canUseRandomPicker,
      upsetAlerts: globalSettings.upsetAlertsEnabled && user.canSeeUpsetAlerts,
      powerRankings: globalSettings.powerRankingsEnabled && user.canSeePowerRankings,
      matchupSimulator: globalSettings.matchupSimulatorEnabled && user.canUseMatchupSim,
    };

    return NextResponse.json({ permissions });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    // Default to all enabled on error
    return NextResponse.json({
      permissions: {
        randomPicker: true,
        upsetAlerts: true,
        powerRankings: true,
        matchupSimulator: true,
      },
    });
  }
}
