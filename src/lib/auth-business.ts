import { logger } from '@/lib/logger';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authBusinessOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'business-credentials',
      name: 'Business Owner Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = loginSchema.safeParse(credentials);
          
          if (!validatedFields.success) {
            logger.error('Validation error:', validatedFields.error);
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find business owner
          const businessOwner = await prisma.businessOwner.findUnique({
            where: { email },
            include: {
              companies: {
                include: {
                  company: true,
                },
              },
            },
          });

          if (!businessOwner) {
            logger.error('Business owner not found:', email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, businessOwner.password);

          if (!isPasswordValid) {
            logger.error('Invalid password for:', email);
            return null;
          }

          // Return user data for session
          return {
            id: businessOwner.id,
            email: businessOwner.email,
            name: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || businessOwner.email,
            role: 'business_owner',
            emailVerified: businessOwner.emailVerified,
            companies: businessOwner.companies.map(co => ({
              id: co.companyId,
              name: co.company.name,
              role: co.role,
              verified: co.verified,
            })),
          };
        } catch (error) {
          logger.error('Business auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/business/login',
    error: '/business/login?error=credentials',
    newUser: '/business/onboarding',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = 'business_owner';
        token.emailVerified = (user as any).emailVerified;
        token.companies = (user as any).companies;
      }

      // Handle session updates (e.g., after email verification)
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.companies = token.companies as any[];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      if (url.includes('/business/login')) {
        return '/business/dashboard';
      }
      
      // Redirect to base URL if external
      if (!url.startsWith(baseUrl)) {
        return baseUrl;
      }
      
      return url;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Type augmentation for TypeScript
// Type declarations moved to src/types/next-auth.d.ts to avoid conflicts