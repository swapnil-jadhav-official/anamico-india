import { db } from './db';
import * as schema from '../drizzle/schema';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { sendEmail } from './email';
import { generateWelcomeEmail } from './email-templates';

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  // Note: adapter removed - not needed for JWT strategy
  // EmailProvider removed - using custom OTP CredentialsProvider instead
  providers: [
    CredentialsProvider({
      id: 'password',
      name: 'Password',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const userFound = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.email, credentials.email),
        });

        if (!userFound) {
          return null;
        }

        // Direct comparison as per user's instruction (security risk)
        if (userFound.password === credentials.password) {
          return userFound;
        } else {
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: "Email", type: "text" },
        otp: {  label: "OTP", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.otp) {
          return null;
        }

        let user = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.email, credentials.email),
        });

        let isNewUser = false;
        if (!user) {
          const newUserId = crypto.randomUUID();
          await db.insert(schema.user).values({
            id: newUserId,
            email: credentials.email,
            emailVerified: new Date(),
          });

          // Query the newly created user
          user = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, newUserId),
          });

          isNewUser = true;

          // Send welcome email to new users
          if (user) {
            try {
              const emailContent = generateWelcomeEmail(
                user.name || credentials.email.split('@')[0],
                credentials.email
              );
              await sendEmail({
                to: credentials.email,
                subject: 'Welcome to Anamico India! 🎉',
                html: emailContent.html,
                text: emailContent.text,
              });
              console.log(`✅ Welcome email sent to ${credentials.email}`);
            } catch (emailError) {
              console.error('❌ Failed to send welcome email:', emailError);
            }
          }
        }

        // Ensure user exists
        if (!user) {
          console.error('Failed to create or find user');
          return null;
        }

        // Attach isNewUser flag to the user object for propagation
        (user as any).isNewUser = isNewUser;

        const token = await db.query.verificationToken.findFirst({
          where: (vt, { eq }) => eq(vt.identifier, credentials.email),
        });

        if (!token) {
          console.error('No OTP token found for:', credentials.email);
          return null;
        }

        const hashedOtp = crypto.createHash('sha256').update(credentials.otp).digest('hex');

        if (token.token !== hashedOtp) {
          console.error('Invalid OTP for:', credentials.email);
          return null;
        }

        if (new Date() > new Date(token.expires)) {
          console.error('Expired OTP for:', credentials.email);
          return null;
        }

        await db.delete(schema.verificationToken).where(eq(schema.verificationToken.identifier, credentials.email));

        console.log('✅ OTP authentication successful for:', credentials.email);
        return user;
      }
    }),
    CredentialsProvider({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.phone) {
          return null;
        }

        const cleanedPhone = credentials.phone.replace(/\D/g, '');

        // Find user by phone number
        const user = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.phone, cleanedPhone),
        });

        if (!user) {
          console.error('No user found for phone:', cleanedPhone);
          return null;
        }

        console.log('✅ Phone authentication successful for:', cleanedPhone);
        return user;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.sub as string;
          session.user.isNewUser = token.isNewUser;
          session.user.role = token.role as string;
          session.user.phone = token.phone as string;
          session.user.address = token.address as string;
          session.user.name = token.name as string;
          session.user.email = token.email as string;
        }
      } catch (error) {
        console.error('Error in session callback:', error);
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      try {
        // When user first signs in
        if (user) {
          token.sub = user.id;
          token.isNewUser = (user as any).isNewUser || false;
          token.role = (user as any).role || 'user';
          token.phone = (user as any).phone || null;
          token.address = (user as any).address || null;
          token.name = (user as any).name || null;
          token.email = (user as any).email || null;
          return token;
        }

        // Only refresh from database if trigger is 'update' or role is missing
        if (token.sub && (!token.role || trigger === 'update')) {
          const userInDb = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.id, token.sub as string),
          });

          if (userInDb) {
            token.role = userInDb.role || 'user';
            token.phone = userInDb.phone || null;
            token.address = userInDb.address || null;
            token.name = userInDb.name || null;
            token.email = userInDb.email || null;
          }
        }
      } catch (error) {
        console.error('Error in jwt callback:', error);
      }

      return token;
    },
  },
};
