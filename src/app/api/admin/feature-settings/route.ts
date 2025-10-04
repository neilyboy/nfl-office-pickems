import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

/**
 * GET - Get feature settings
 */
export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Get global feature settings
    const settings = await prisma.featureSettings.findFirst();
    
    // If no settings exist, create defaults
    if (!settings) {
      const newSettings = await prisma.featureSettings.create({
        data: {
          id: 1,
          randomPickerEnabled: true,
          upsetAlertsEnabled: true,
          powerRankingsEnabled: true,
          matchupSimulatorEnabled: true,
        },
      });
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching feature settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT - Update feature settings (Admin only)
 */
export async function PUT(request: Request) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { randomPickerEnabled, upsetAlertsEnabled, powerRankingsEnabled, matchupSimulatorEnabled } = body;

    const settings = await prisma.featureSettings.upsert({
      where: { id: 1 },
      update: {
        randomPickerEnabled,
        upsetAlertsEnabled,
        powerRankingsEnabled,
        matchupSimulatorEnabled,
      },
      create: {
        id: 1,
        randomPickerEnabled,
        upsetAlertsEnabled,
        powerRankingsEnabled,
        matchupSimulatorEnabled,
      },
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating feature settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
