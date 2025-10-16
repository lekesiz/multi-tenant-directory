import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // First, check if user is an admin in users table
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.passwordHash) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (isPasswordValid) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name || user.email,
              role: user.role,
              type: 'user', // Distinguish from business owner
            };
          }
        }

        // If not found in users table, check business_owners table
        const owner = await prisma.businessOwner.findUnique({
          where: { email: credentials.email },
        });

        if (owner) {
          const isPasswordValid = await bcrypt.compare(credentials.password, owner.password);

          if (isPasswordValid) {
            return {
              id: owner.id,
              email: owner.email,
              name: owner.firstName && owner.lastName
                ? `${owner.firstName} ${owner.lastName}`
                : owner.email,
              role: 'BUSINESS_OWNER',
              type: 'businessOwner', // Distinguish from admin user
            };
          }
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.type = token.type as string;
      }
      
      // Set businessOwner for backwards compatibility with API routes
      if (token.type === 'businessOwner') {
        session.businessOwner = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After login, redirect based on user type
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

