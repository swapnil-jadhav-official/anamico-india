import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { generateRoleChangeEmail, generateProfileUpdateEmail } from '@/lib/email-templates';

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

    // Get existing user data before update
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id));

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = existingUser.role;
    const updatedFields: string[] = [];

    // Track what fields are being updated
    if (name && name !== existingUser.name) updatedFields.push('Name');
    if (phone && phone !== existingUser.phone) updatedFields.push('Phone');
    if (address && address !== existingUser.address) updatedFields.push('Address');
    if (role && role !== existingUser.role) updatedFields.push('Role');

    const updatedUser = await db
      .update(user)
      .set({
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        role: role || undefined,
      })
      .where(eq(user.id, id));

    // Send email notifications
    if (existingUser.email) {
      try {
        // If role changed, send role change email
        if (role && role !== oldRole) {
          const emailContent = generateRoleChangeEmail(
            name || existingUser.name || 'User',
            existingUser.email,
            oldRole || 'user',
            role
          );

          await sendEmail({
            to: existingUser.email,
            subject: 'Account Role Updated - Anamico India',
            html: emailContent.html,
            text: emailContent.text,
          });

          console.log(`✅ Role change email sent to ${existingUser.email}`);
        }
        // If other fields changed (but not role), send profile update email
        else if (updatedFields.length > 0) {
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
        }
      } catch (emailError) {
        console.error('❌ Failed to send user update email:', emailError);
        // Don't fail the request if email fails
      }
    }

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
