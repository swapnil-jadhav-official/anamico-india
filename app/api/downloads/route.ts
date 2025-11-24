import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { downloadFile } from '@/drizzle/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// GET - Fetch all active download files (public) or all files (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const session = await getServerSession(authConfig);
    const isAdmin = session?.user?.role === 'admin';

    let query = db.select().from(downloadFile);

    // Filter conditions
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(eq(downloadFile.category, category));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(downloadFile.title, searchTerm),
          like(downloadFile.description, searchTerm),
          like(downloadFile.fileName, searchTerm),
          like(downloadFile.tags, searchTerm)
        )
      );
    }

    // Only show active files to non-admin users
    if (!isAdmin || !includeInactive) {
      conditions.push(eq(downloadFile.isActive, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const files = await query.orderBy(
      desc(downloadFile.isFeatured),
      downloadFile.displayOrder,
      desc(downloadFile.createdAt)
    );

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('Error fetching download files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch download files' },
      { status: 500 }
    );
  }
}

// POST - Create new download file (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const {
      title,
      description,
      category,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      version,
      thumbnailUrl,
      systemRequirements,
      tags,
      isActive,
      isFeatured,
      displayOrder,
    } = data;

    // Validation
    if (!title || !category || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'Title, category, file name, and file URL are required' },
        { status: 400 }
      );
    }

    const fileId = nanoid();

    await db.insert(downloadFile).values({
      id: fileId,
      title,
      description: description || null,
      category,
      fileName,
      fileUrl,
      fileSize: fileSize || null,
      fileType: fileType || null,
      version: version || null,
      thumbnailUrl: thumbnailUrl || null,
      systemRequirements: systemRequirements || null,
      tags: tags ? JSON.stringify(tags) : null,
      downloadCount: 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      displayOrder: displayOrder || 0,
    });

    return NextResponse.json({
      success: true,
      fileId,
      message: 'Download file created successfully',
    });
  } catch (error) {
    console.error('Error creating download file:', error);
    return NextResponse.json(
      { error: 'Failed to create download file' },
      { status: 500 }
    );
  }
}

// PUT - Update download file (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Check if file exists
    const existingFile = await db
      .select()
      .from(downloadFile)
      .where(eq(downloadFile.id, id))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Prepare update data
    const updateValues: any = {};

    if (updateData.title !== undefined) updateValues.title = updateData.title;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.category !== undefined)
      updateValues.category = updateData.category;
    if (updateData.fileName !== undefined)
      updateValues.fileName = updateData.fileName;
    if (updateData.fileUrl !== undefined)
      updateValues.fileUrl = updateData.fileUrl;
    if (updateData.fileSize !== undefined)
      updateValues.fileSize = updateData.fileSize;
    if (updateData.fileType !== undefined)
      updateValues.fileType = updateData.fileType;
    if (updateData.version !== undefined)
      updateValues.version = updateData.version;
    if (updateData.thumbnailUrl !== undefined)
      updateValues.thumbnailUrl = updateData.thumbnailUrl;
    if (updateData.systemRequirements !== undefined)
      updateValues.systemRequirements = updateData.systemRequirements;
    if (updateData.tags !== undefined)
      updateValues.tags = JSON.stringify(updateData.tags);
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;
    if (updateData.isFeatured !== undefined)
      updateValues.isFeatured = updateData.isFeatured;
    if (updateData.displayOrder !== undefined)
      updateValues.displayOrder = updateData.displayOrder;

    // Update file
    await db.update(downloadFile).set(updateValues).where(eq(downloadFile.id, id));

    return NextResponse.json({
      success: true,
      message: 'Download file updated successfully',
    });
  } catch (error) {
    console.error('Error updating download file:', error);
    return NextResponse.json(
      { error: 'Failed to update download file' },
      { status: 500 }
    );
  }
}

// DELETE - Delete download file (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Check if file exists
    const existingFile = await db
      .select()
      .from(downloadFile)
      .where(eq(downloadFile.id, id))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete file
    await db.delete(downloadFile).where(eq(downloadFile.id, id));

    return NextResponse.json({
      success: true,
      message: 'Download file deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting download file:', error);
    return NextResponse.json(
      { error: 'Failed to delete download file' },
      { status: 500 }
    );
  }
}
