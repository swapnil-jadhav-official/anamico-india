import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  const newUser = await db.insert(users).values({ name, email }).returning();
  return NextResponse.json(newUser);
}

export async function PUT(req: NextRequest) {
  const { id, name, email } = await req.json();
  const updatedUser = await db.update(users).set({ name, email }).where(eq(users.id, id)).returning();
  return NextResponse.json(updatedUser);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();
  return NextResponse.json(deletedUser);
}
