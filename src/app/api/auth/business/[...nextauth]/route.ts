import NextAuth from 'next-auth';
import { authBusinessOptions } from '@/lib/auth-business';

const handler = NextAuth(authBusinessOptions);

export { handler as GET, handler as POST };