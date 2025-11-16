import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rdServiceRegistration, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * GET /api/admin/rd-service
 * Fetch all RD service registrations (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (users.length === 0 || users[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all RD service registrations
    const registrations = await db
      .select()
      .from(rdServiceRegistration)
      .orderBy(rdServiceRegistration.createdAt);

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching RD service registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/rd-service/[id]
 * Update RD service registration (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (users.length === 0 || users[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { registrationId, status, adminNotes } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Update registration
    await db
      .update(rdServiceRegistration)
      .set({
        status: status || undefined,
        adminNotes: adminNotes || undefined,
      })
      .where(eq(rdServiceRegistration.id, registrationId));

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
    });
  } catch (error) {
    console.error('Error updating RD service registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
