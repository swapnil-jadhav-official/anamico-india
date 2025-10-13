import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import * as schema from '../drizzle/schema';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sendVerificationRequest } from './otp';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db, schema),
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
          const newUserArray = await db.insert(schema.user).values({
            id: crypto.randomUUID(),
            email: credentials.email,
            emailVerified: new Date(),
          });
          // Drizzle insert returns an array of inserted values, take the first one
          user = newUserArray[0];
          isNewUser = true;
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
      return token;
    },
  },
};
