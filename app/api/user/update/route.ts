import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { id, name, phone, address, password } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const updateData: { name?: string; phone?: string; address?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (password) updateData.password = password;

    await db.update(user).set(updateData).where(eq(user.id, id));

    return NextResponse.json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Failed to update user details' }, { status: 500 });
  }
}
