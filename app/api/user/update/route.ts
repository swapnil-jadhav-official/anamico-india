import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { id, name, phone, address } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await db.update(user).set({
      name,
      phone,
      address,
    }).where(eq(user.id, id));

    return NextResponse.json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Failed to update user details' }, { status: 500 });
  }
}
