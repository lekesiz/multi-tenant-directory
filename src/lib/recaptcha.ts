/**
 * Google reCAPTCHA v3 Helper Functions
 *
 * reCAPTCHA v3 returns a score (0.0 - 1.0) based on user interactions
 * 1.0 = very likely a human
 * 0.0 = very likely a bot
 *
 * Recommended threshold: 0.5
 */

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify reCAPTCHA token on the server side
 * @param token - The reCAPTCHA token from the client
 * @param remoteip - Optional: The user's IP address
 * @returns Verification result with score
 */
export async function verifyRecaptchaToken(
  token: string,
  remoteip?: string
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY is not configured');
    // In development or if not configured, allow the request
    return {
      success: true,
      score: 1.0,
      action: 'submit',
    };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result: RecaptchaVerificationResult = await response.json();

    return result;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      'error-codes': ['network-error'],
    };
  }
}

/**
 * Check if a reCAPTCHA score meets the threshold
 * @param score - The score from reCAPTCHA (0.0 - 1.0)
 * @param threshold - Minimum acceptable score (default: 0.5)
 * @returns true if score meets or exceeds threshold
 */
export function isScoreAcceptable(score: number | undefined, threshold: number = 0.5): boolean {
  if (score === undefined) {
    return false;
  }
  return score >= threshold;
}

/**
 * Get user-friendly message based on reCAPTCHA score
 * @param score - The score from reCAPTCHA
 * @returns Human-readable message
 */
export function getScoreMessage(score: number | undefined): string {
  if (score === undefined) {
    return 'Impossible de vérifier votre identité';
  }

  if (score >= 0.7) {
    return 'Vérification réussie';
  } else if (score >= 0.5) {
    return 'Vérification acceptée';
  } else if (score >= 0.3) {
    return 'Activité suspecte détectée';
  } else {
    return 'Vérification échouée - comportement de bot détecté';
  }
}

/**
 * Middleware helper to extract and verify reCAPTCHA token from request
 * @param token - reCAPTCHA token from client
 * @param expectedAction - Expected action name (e.g., 'register', 'login')
 * @param minScore - Minimum acceptable score (default: 0.5)
 * @returns Object with success status and optional error message
 */
export async function validateRecaptcha(
  token: string | null | undefined,
  expectedAction?: string,
  minScore: number = 0.5
): Promise<{ valid: boolean; error?: string; score?: number }> {
  // If reCAPTCHA is not configured, allow the request (development mode)
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return { valid: true, score: 1.0 };
  }

  if (!token) {
    return {
      valid: false,
      error: 'Token reCAPTCHA manquant',
    };
  }

  const result = await verifyRecaptchaToken(token);

  if (!result.success) {
    return {
      valid: false,
      error: 'Vérification reCAPTCHA échouée',
    };
  }

  // Check action if provided
  if (expectedAction && result.action !== expectedAction) {
    return {
      valid: false,
      error: 'Action reCAPTCHA invalide',
    };
  }

  // Check score
  if (!isScoreAcceptable(result.score, minScore)) {
    return {
      valid: false,
      error: `Score reCAPTCHA trop bas (${result.score?.toFixed(2)})`,
      score: result.score,
    };
  }

  return {
    valid: true,
    score: result.score,
  };
}
