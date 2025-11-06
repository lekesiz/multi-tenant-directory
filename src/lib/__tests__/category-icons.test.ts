/**
 * Category Icons Tests
 */

import { getCategoryIcon, categoryIcons } from '../category-icons';

describe('Category Icons', () => {
  describe('categoryIcons', () => {
    test('should have icons for common categories', () => {
      expect(categoryIcons.Restaurant).toBe('🍽️');
      expect(categoryIcons.Boulangerie).toBe('🥖');
      expect(categoryIcons.Pharmacie).toBe('💊');
      expect(categoryIcons.Garage).toBe('🚗');
    });

    test('should have icons for Google Places categories', () => {
      expect(categoryIcons.establishment).toBe('🏢');
      expect(categoryIcons.point_of_interest).toBe('📍');
      expect(categoryIcons.bakery).toBe('🥖');
      expect(categoryIcons.car_repair).toBe('🔧');
    });

    test('should have icons for health categories', () => {
      expect(categoryIcons.Médecin).toBe('🩺');
      expect(categoryIcons.Dentiste).toBe('🦷');
      expect(categoryIcons.Vétérinaire).toBe('🐾');
      expect(categoryIcons.Optique).toBe('👓');
    });

    test('should have icons for service categories', () => {
      expect(categoryIcons.Coiffure).toBe('💇');
      expect(categoryIcons.Beauté).toBe('💄');
      expect(categoryIcons.Plomberie).toBe('🔧');
      expect(categoryIcons.Électricité).toBe('⚡');
    });

    test('should have icons for IT categories', () => {
      expect(categoryIcons.Informatique).toBe('💻');
      expect(categoryIcons['Agence Web']).toBe('🌐');
      expect(categoryIcons.Développement).toBe('👨‍💻');
    });

    test('should have icons for leisure categories', () => {
      expect(categoryIcons.Sport).toBe('⚽');
      expect(categoryIcons.Fitness).toBe('💪');
      expect(categoryIcons.Yoga).toBe('🧘');
      expect(categoryIcons.Musique).toBe('🎵');
    });

    test('should have icons for education categories', () => {
      expect(categoryIcons.École).toBe('🎒');
      expect(categoryIcons.Formation).toBe('🎓');
      expect(categoryIcons.Crèche).toBe('👶');
    });

    test('should have icons for professional services', () => {
      expect(categoryIcons.Avocat).toBe('⚖️');
      expect(categoryIcons.Notaire).toBe('📜');
      expect(categoryIcons.Comptabilité).toBe('🧮');
      expect(categoryIcons.Assurance).toBe('🛡️');
    });
  });

  describe('getCategoryIcon', () => {
    test('should return correct icon for existing category', () => {
      expect(getCategoryIcon('Restaurant')).toBe('🍽️');
      expect(getCategoryIcon('Boulangerie')).toBe('🥖');
      expect(getCategoryIcon('Pharmacie')).toBe('💊');
    });

    test('should return default icon for non-existing category', () => {
      expect(getCategoryIcon('NonExistentCategory')).toBe('📍');
      expect(getCategoryIcon('RandomCategory')).toBe('📍');
      expect(getCategoryIcon('')).toBe('📍');
    });

    test('should handle case-sensitive category names', () => {
      expect(getCategoryIcon('Restaurant')).toBe('🍽️');
      expect(getCategoryIcon('restaurant')).toBe('📍'); // Different case
    });

    test('should return icon for all food categories', () => {
      expect(getCategoryIcon('Restaurant')).toBe('🍽️');
      expect(getCategoryIcon('Boulangerie')).toBe('🥖');
      expect(getCategoryIcon('Pâtisserie')).toBe('🍰');
      expect(getCategoryIcon('Pizzeria')).toBe('🍕');
      expect(getCategoryIcon('Café')).toBe('☕');
      expect(getCategoryIcon('Bar')).toBe('🍺');
    });

    test('should return icon for all health categories', () => {
      expect(getCategoryIcon('Pharmacie')).toBe('💊');
      expect(getCategoryIcon('Médecin')).toBe('🩺');
      expect(getCategoryIcon('Dentiste')).toBe('🦷');
      expect(getCategoryIcon('Kinésithérapie')).toBe('🏥');
    });

    test('should return icon for all service categories', () => {
      expect(getCategoryIcon('Garage')).toBe('🚗');
      expect(getCategoryIcon('Coiffure')).toBe('💇');
      expect(getCategoryIcon('Beauté')).toBe('💄');
      expect(getCategoryIcon('Fleuriste')).toBe('🌸');
    });

    test('should return icon for Google Places categories', () => {
      expect(getCategoryIcon('establishment')).toBe('🏢');
      expect(getCategoryIcon('point_of_interest')).toBe('📍');
      expect(getCategoryIcon('general_contractor')).toBe('🏗️');
      expect(getCategoryIcon('electronics_store')).toBe('📱');
    });

    test('should handle special characters in category names', () => {
      expect(getCategoryIcon('Agence Web')).toBe('🌐');
      expect(getCategoryIcon('Pâtisserie')).toBe('🍰');
      expect(getCategoryIcon('Kinésithérapie')).toBe('🏥');
    });

    test('should return default icon for undefined', () => {
      expect(getCategoryIcon(undefined as any)).toBe('📍');
    });

    test('should return default icon for null', () => {
      expect(getCategoryIcon(null as any)).toBe('📍');
    });

    test('should return default icon for number', () => {
      expect(getCategoryIcon(123 as any)).toBe('📍');
    });

    test('should return default icon for object', () => {
      expect(getCategoryIcon({} as any)).toBe('📍');
    });
  });
});
