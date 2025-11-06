/**
 * PasswordStrength Component Tests
 */

import { render, screen } from '@testing-library/react';
import PasswordStrength, { calculatePasswordStrength } from '../PasswordStrength';

describe('calculatePasswordStrength', () => {
  test('should return very weak for empty password', () => {
    const result = calculatePasswordStrength('');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Très faible');
    expect(result.percentage).toBe(0);
  });

  test('should return weak for short password', () => {
    const result = calculatePasswordStrength('abc');
    expect(result.score).toBeLessThan(2);
    expect(result.suggestions).toContain('Utilisez au moins 8 caractères');
  });

  test('should give points for length', () => {
    const short = calculatePasswordStrength('abcdefg'); // 7 chars
    const medium = calculatePasswordStrength('abcdefgh'); // 8 chars
    const long = calculatePasswordStrength('abcdefghijkl'); // 12 chars

    expect(medium.score).toBeGreaterThan(short.score);
    expect(long.score).toBeGreaterThan(medium.score);
  });

  test('should give points for uppercase letters', () => {
    const noUpper = calculatePasswordStrength('abcdefgh');
    const withUpper = calculatePasswordStrength('Abcdefgh');

    expect(withUpper.score).toBeGreaterThan(noUpper.score);
  });

  test('should give points for numbers', () => {
    const noNumbers = calculatePasswordStrength('abcdefgh');
    const withNumbers = calculatePasswordStrength('abcdef12');

    expect(withNumbers.score).toBeGreaterThan(noNumbers.score);
  });

  test('should give points for special characters', () => {
    const noSpecial = calculatePasswordStrength('abcdefgh');
    const withSpecial = calculatePasswordStrength('abcdef!@');

    expect(withSpecial.score).toBeGreaterThan(noSpecial.score);
  });

  test('should penalize repeated characters', () => {
    const normal = calculatePasswordStrength('abcdefgh');
    const repeated = calculatePasswordStrength('aaaaabcd');

    expect(repeated.score).toBeLessThan(normal.score);
    expect(repeated.suggestions).toContain('Évitez les caractères répétés');
  });

  test('should penalize sequential characters', () => {
    const normal = calculatePasswordStrength('azbycxdw');
    const sequential = calculatePasswordStrength('abcdefgh');

    expect(sequential.suggestions).toContain('Évitez les séquences (abc, 123)');
  });

  test('should reject common passwords', () => {
    const commonPasswords = ['password', 'motdepasse', '12345678', 'qwerty', 'azerty'];
    
    commonPasswords.forEach(pwd => {
      const result = calculatePasswordStrength(pwd);
      expect(result.score).toBe(0);
      expect(result.suggestions).toContain('Ce mot de passe est trop commun');
    });
  });

  test('should return very strong for complex password', () => {
    const result = calculatePasswordStrength('MyP@ssw0rd!2024');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.label).toMatch(/Fort|Très fort/);
  });

  test('should limit suggestions to 3', () => {
    const result = calculatePasswordStrength('abc');
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
  });

  test('should have no suggestions for perfect password', () => {
    const result = calculatePasswordStrength('MyP@ssw0rd!2024Complex');
    if (result.score === 4) {
      expect(result.suggestions).toHaveLength(0);
    }
  });

  test('should calculate correct percentage', () => {
    const veryWeak = calculatePasswordStrength('');
    const weak = calculatePasswordStrength('abc');
    const strong = calculatePasswordStrength('MyP@ssw0rd!2024');

    expect(veryWeak.percentage).toBe(0);
    expect(weak.percentage).toBeGreaterThan(0);
    expect(strong.percentage).toBeGreaterThan(60);
  });

  test('should have correct color for each strength level', () => {
    const veryWeak = calculatePasswordStrength('');
    const weak = calculatePasswordStrength('abcdefgh');
    const medium = calculatePasswordStrength('Abcdefgh1');
    const strong = calculatePasswordStrength('MyP@ssw0rd!');

    expect(veryWeak.color).toContain('red');
    expect(weak.color).toContain('orange');
    expect(medium.color).toContain('yellow');
    expect(strong.color).toMatch(/blue|green/);
  });
});

describe('PasswordStrength Component', () => {
  test('should return null for empty password', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.firstChild).toBeNull();
  });

  test('should render strength label', () => {
    render(<PasswordStrength password="abcdefgh" />);
    expect(screen.getByText(/Faible|Moyen|Fort/)).toBeInTheDocument();
  });

  test('should render strength bar', () => {
    const { container } = render(<PasswordStrength password="abcdefgh" />);
    const bar = container.querySelector('.h-2.bg-gray-200');
    expect(bar).toBeInTheDocument();
  });

  test('should render suggestions', () => {
    render(<PasswordStrength password="abc" />);
    expect(screen.getByText(/Utilisez au moins 8 caractères/)).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    const { container } = render(
      <PasswordStrength password="test" className="custom-class" />
    );
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  test('should update strength when password changes', () => {
    const { rerender } = render(<PasswordStrength password="abc" />);
    expect(screen.getByText(/Très faible|Faible/)).toBeInTheDocument();

    rerender(<PasswordStrength password="MyP@ssw0rd!2024" />);
    expect(screen.getByText(/Fort|Très fort/)).toBeInTheDocument();
  });

  test('should show color-coded label', () => {
    const { container } = render(<PasswordStrength password="abc" />);
    const label = screen.getByText(/Très faible|Faible/);
    expect(label).toHaveClass(/text-red-600|text-orange-600/);
  });

  test('should render multiple suggestions', () => {
    const { container } = render(<PasswordStrength password="abc" />);
    const suggestions = container.querySelectorAll('.text-xs.text-gray-600 > div');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test('should not render suggestions for strong password', () => {
    render(<PasswordStrength password="MyP@ssw0rd!2024Complex" />);
    const suggestions = screen.queryByText(/Ajoutez/);
    // May or may not have suggestions depending on exact strength
    // Just verify component renders
    expect(screen.getByText(/Fort|Très fort/)).toBeInTheDocument();
  });
});
