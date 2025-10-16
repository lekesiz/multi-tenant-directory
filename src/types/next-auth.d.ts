import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      type?: string;
      emailVerified?: Date | null;
      companies?: Array<{
        id: string;
        name: string;
        slug: string;
        role: string;
        company: {
          id: string;
          name: string;
          slug: string;
          city: string;
        };
      }>;
    };
    businessOwner?: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    type?: string;
    emailVerified?: Date | null;
    companies?: any[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role?: string;
    type?: string;
    emailVerified?: Date | null;
    companies?: any[];
  }
}

