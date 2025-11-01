import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const users = await db.select().from(user);

    // Transform users data (exclude sensitive info from response)
    const transformedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.name || 'N/A',
      email: u.email,
      phone: u.phone || 'N/A',
      role: u.role || 'user',
      emailVerified: u.emailVerified,
      image: u.image,
      address: u.address,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, phone, address, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await db
      .update(user)
      .set({
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        role: role || undefined,
      })
      .where(eq(user.id, id));

    return NextResponse.json(
      { message: 'User updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await db.delete(user).where(eq(user.id, id));

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
