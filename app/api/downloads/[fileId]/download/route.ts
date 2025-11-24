import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { downloadFile } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

// POST - Increment download count
export async function POST(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // Check if file exists
    const file = await db
      .select()
      .from(downloadFile)
      .where(eq(downloadFile.id, fileId))
      .limit(1);

    if (file.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Increment download count
    await db
      .update(downloadFile)
      .set({
        downloadCount: sql`${downloadFile.downloadCount} + 1`,
      })
      .where(eq(downloadFile.id, fileId));

    return NextResponse.json({
      success: true,
      message: 'Download count incremented',
    });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
