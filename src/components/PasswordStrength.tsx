'use client';

import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
  suggestions: string[];
}

/**
 * Calculate password strength based on multiple criteria:
 * - Length (minimum 8 characters)
 * - Uppercase letters
 * - Lowercase letters
 * - Numbers
 * - Special characters
 * - Common patterns (repeated characters, sequences)
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Très faible',
      color: 'bg-gray-300',
      percentage: 0,
      suggestions: ['Saisissez un mot de passe'],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length check (0-2 points)
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length < 8) {
    suggestions.push('Utilisez au moins 8 caractères');
  }

  // Character variety checks (0-4 points)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasLowercase) score += 0.5;
  if (hasUppercase) score += 0.5;
  if (hasNumbers) score += 0.5;
  if (hasSpecialChars) score += 1;

  // Add suggestions for missing character types
  if (!hasUppercase) suggestions.push('Ajoutez des lettres majuscules');
  if (!hasLowercase) suggestions.push('Ajoutez des lettres minuscules');
  if (!hasNumbers) suggestions.push('Ajoutez des chiffres');
  if (!hasSpecialChars) suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');

  // Penalty for common patterns
  const hasRepeatedChars = /(.)\1{2,}/.test(password); // aaa, 111, etc.
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);

  if (hasRepeatedChars) {
    score -= 0.5;
    suggestions.push('Évitez les caractères répétés');
  }
  if (hasSequentialChars) {
    score -= 0.5;
    suggestions.push('Évitez les séquences (abc, 123)');
  }

  // Common weak passwords
  const commonPasswords = ['password', 'motdepasse', '12345678', 'qwerty', 'azerty', 'admin'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score = 0;
    suggestions.push('Ce mot de passe est trop commun');
  }

  // Cap score between 0 and 4
  score = Math.max(0, Math.min(4, score));

  // Determine label and color
  let label: string;
  let color: string;
  let percentage: number;

  if (score === 0) {
    label = 'Très faible';
    color = 'bg-red-500';
    percentage = 20;
  } else if (score < 2) {
    label = 'Faible';
    color = 'bg-orange-500';
    percentage = 40;
  } else if (score < 3) {
    label = 'Moyen';
    color = 'bg-yellow-500';
    percentage = 60;
  } else if (score < 4) {
    label = 'Fort';
    color = 'bg-blue-500';
    percentage = 80;
  } else {
    label = 'Très fort';
    color = 'bg-green-500';
    percentage = 100;
    suggestions.length = 0; // Clear suggestions for perfect password
  }

  return {
    score,
    label,
    color,
    percentage,
    suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
  };
}

export default function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium transition-colors duration-300 ${
            strength.score === 0
              ? 'text-red-600'
              : strength.score < 2
              ? 'text-orange-600'
              : strength.score < 3
              ? 'text-yellow-600'
              : strength.score < 4
              ? 'text-blue-600'
              : 'text-green-600'
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-1">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
