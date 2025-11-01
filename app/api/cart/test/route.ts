import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cartItem } from '@/drizzle/schema';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    return NextResponse.json({
      authenticated: !!session?.user?.id,
      userId: session?.user?.id,
      userName: session?.user?.name,
      totalCartItems: await db.select().from(cartItem),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
