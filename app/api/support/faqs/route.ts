import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { faq } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

// GET - Fetch all active FAQs (public) or all FAQs (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const session = await getServerSession(authConfig);
    const isAdmin = session?.user?.role === 'admin';

    let query = db.select().from(faq);

    // Filter conditions
    const conditions = [];

    if (category) {
      conditions.push(eq(faq.category, category));
    }

    // Only show active FAQs to non-admin users
    if (!isAdmin || !includeInactive) {
      conditions.push(eq(faq.isActive, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const faqs = await query.orderBy(faq.displayOrder, faq.createdAt);

    return NextResponse.json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST - Create new FAQ (Admin only)
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
    const { question, answer, category, displayOrder, isActive } = data;

    // Validation
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faqId = nanoid();

    await db.insert(faq).values({
      id: faqId,
      question,
      answer,
      category: category || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      faqId,
      message: 'FAQ created successfully',
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ (Admin only)
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
    const { id, question, answer, category, displayOrder, isActive } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // Check if FAQ exists
    const existingFaq = await db.select().from(faq).where(eq(faq.id, id)).limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Update FAQ
    await db
      .update(faq)
      .set({
        question: question || existingFaq[0].question,
        answer: answer || existingFaq[0].answer,
        category: category !== undefined ? category : existingFaq[0].category,
        displayOrder: displayOrder !== undefined ? displayOrder : existingFaq[0].displayOrder,
        isActive: isActive !== undefined ? isActive : existingFaq[0].isActive,
      })
      .where(eq(faq.id, id));

    return NextResponse.json({
      success: true,
      message: 'FAQ updated successfully',
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ (Admin only)
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
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // Check if FAQ exists
    const existingFaq = await db.select().from(faq).where(eq(faq.id, id)).limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Delete FAQ
    await db.delete(faq).where(eq(faq.id, id));

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
