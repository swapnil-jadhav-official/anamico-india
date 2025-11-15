import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { generateProfileUpdateEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  const { id, name, phone, address, password } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Get existing user data before update
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id));

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedFields: string[] = [];
    const updateData: { name?: string; phone?: string; address?: string; password?: string } = {};

    if (name && name !== existingUser.name) {
      updateData.name = name;
      updatedFields.push('Name');
    }
    if (phone && phone !== existingUser.phone) {
      updateData.phone = phone;
      updatedFields.push('Phone');
    }
    if (address && address !== existingUser.address) {
      updateData.address = address;
      updatedFields.push('Address');
    }
    if (password) {
      updateData.password = password;
      updatedFields.push('Password');
    }

    await db.update(user).set(updateData).where(eq(user.id, id));

    // Send email notification if any fields were updated
    if (updatedFields.length > 0 && existingUser.email) {
      try {
        const emailContent = generateProfileUpdateEmail(
          name || existingUser.name || 'User',
          existingUser.email,
          updatedFields
        );

        await sendEmail({
          to: existingUser.email,
          subject: 'Profile Updated - Anamico India',
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log(`✅ Profile update email sent to ${existingUser.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send profile update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Failed to update user details' }, { status: 500 });
  }
}
