/**
 * Mobile Authentication Helper
 * Handles authentication for mobile API requests
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AuthResult {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    name?: string;
    role?: string;
  };
  error?: string;
}

/**
 * Authenticate mobile user from request
 * Supports both session-based and token-based auth
 */
export async function authenticateMobileUser(request: Request): Promise<AuthResult> {
  try {
    // Try session-based authentication first
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      return {
        success: true,
        user: {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name || undefined,
          role: session.user.role || undefined,
        },
      };
    }

    // Try token-based authentication (for mobile apps)
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // TODO: Implement JWT token verification
      // For now, return unauthorized
      return {
        success: false,
        error: 'Token authentication not yet implemented',
      };
    }

    return {
      success: false,
      error: 'Non autorisé - Authentification requise',
    };

  } catch (error) {
    console.error('Mobile authentication error:', error);
    return {
      success: false,
      error: 'Erreur d\'authentification',
    };
  }
}

/**
 * Verify API key for server-to-server requests
 */
export async function verifyApiKey(request: Request): Promise<AuthResult> {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API key manquante',
    };
  }

  // TODO: Implement API key verification against database
  // For now, check against environment variable
  if (apiKey === process.env.API_SECRET_KEY) {
    return {
      success: true,
      user: {
        userId: 'system',
        email: 'system@internal',
        role: 'SYSTEM',
      },
    };
  }

  return {
    success: false,
    error: 'API key invalide',
  };
}

/**
 * Check if user has required role
 */
export function hasRole(authResult: AuthResult, requiredRole: string): boolean {
  if (!authResult.success || !authResult.user) {
    return false;
  }

  const userRole = authResult.user.role || 'USER';
  const roleHierarchy = ['USER', 'BUSINESS_OWNER', 'ADMIN', 'SYSTEM'];
  
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}

