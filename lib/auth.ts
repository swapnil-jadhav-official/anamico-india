import { db } from './db';
import * as schema from '../drizzle/schema';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sendVerificationRequest } from './otp';
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
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST as string,
        port: parseInt(process.env.EMAIL_SERVER_PORT as string),
        auth: {
          user: process.env.EMAIL_SERVER_USER as string,
          pass: process.env.EMAIL_SERVER_PASSWORD as string,
        },
      },
      from: process.env.EMAIL_FROM as string,
      sendVerificationRequest,
    }),
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

        // Attach isNewUser flag to the user object for propagation
        if (user) {
          (user as any).isNewUser = isNewUser;
        }

        const token = await db.query.verificationToken.findFirst({
          where: (vt, { eq }) => eq(vt.identifier, credentials.email),
        });

        if (!token) {
          return null;
        }

        const hashedOtp = crypto.createHash('sha256').update(credentials.otp).digest('hex');

        if (token.token !== hashedOtp) {
          return null;
        }

        if (new Date() > new Date(token.expires)) {
          return null;
        }

        await db.delete(schema.verificationToken).where(eq(schema.verificationToken.identifier, credentials.email));

        return user;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.isNewUser = token.isNewUser;

        const userInDb = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.id, token.sub as string),
        });

        if (userInDb) {
          session.user.phone = userInDb.phone;
          session.user.address = userInDb.address;
          session.user.role = userInDb.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.isNewUser = (user as any).isNewUser;
        token.role = (user as any).role; // Add role to the token
      }

      // Refresh role from database if not present in token
      if (token.sub && !token.role) {
        const userInDb = await db.query.user.findFirst({
          where: (u, { eq }) => eq(u.id, token.sub as string),
        });
        if (userInDb) {
          token.role = userInDb.role;
        }
      }

      return token;
    },
  },
};
