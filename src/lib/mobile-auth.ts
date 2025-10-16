/**
 * Mobile Authentication Middleware
 * Handles JWT token authentication for React Native app
 */

import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export interface MobileAuthResult {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    type: string;
  };
  error?: string;
}

/**
 * Authenticate mobile user from JWT token in Authorization header
 */
export async function authenticateMobileUser(request: Request): Promise<MobileAuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token d\'authentification manquant ou invalide',
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists and is active
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        isEmailVerified: true,
      },
    });

    if (!businessOwner) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    // Check if subscription is active (optional, based on business rules)
    if (businessOwner.subscriptionStatus === 'suspended') {
      return {
        success: false,
        error: 'Abonnement suspendu',
      };
    }

    return {
      success: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
      },
    };

  } catch (error) {
    console.error('Mobile auth error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: 'Token invalide ou expiré',
      };
    }
    
    return {
      success: false,
      error: 'Erreur d\'authentification',
    };
  }
}

/**
 * Middleware wrapper for protected mobile routes
 */
export function withMobileAuth(handler: Function) {
  return async (request: Request, context?: any) => {
    const authResult = await authenticateMobileUser(request);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Add user info to request context
    (request as any).user = authResult.user;
    
    return handler(request, context);
  };
}

/**
 * Extract user ID from authenticated request
 */
export function getUserFromRequest(request: Request): string | null {
  return (request as any).user?.userId || null;
}