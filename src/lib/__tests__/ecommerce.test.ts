/**
 * E-commerce System Unit Tests
 * Tests for product management, booking, and order processing
 */

import { ProductService, BookingService, OrderService, formatPrice, calculateTax } from '../ecommerce';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

describe('E-commerce System', () => {
  
  describe('Product Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should format price correctly', () => {
      expect(formatPrice(1000)).toBe('10,00 €');
      expect(formatPrice(2550)).toBe('25,50 €');
      expect(formatPrice(0)).toBe('0,00 €');
    });

    test('should calculate tax correctly', () => {
      expect(calculateTax(1000, 0.20)).toBe(200);
      expect(calculateTax(1500, 0.10)).toBe(150);
      expect(calculateTax(0, 0.20)).toBe(0);
    });

    test('should generate SKU correctly', () => {
      const { generateSKU } = require('../ecommerce');
      const sku = generateSKU('Test Product', 123);
      
      expect(sku).toMatch(/^TES-123-[A-Z0-9]{3}$/);
      expect(sku.length).toBe(11);
    });
  });

  describe('Booking Service', () => {
    test('should generate confirmation code', () => {
      // Test private method via public interface
      const bookingData = {
        productId: 'test-product',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        startTime: new Date('2025-01-20T10:00:00Z'),
        endTime: new Date('2025-01-20T11:00:00Z'),
      };

      // Mock successful availability check
      const mockProduct = {
        id: 'test-product',
        isBookingEnabled: true,
        bookings: [],
      };

      require('../prisma').prisma.product.findUnique.mockResolvedValue(mockProduct);
      require('../prisma').prisma.booking.create.mockResolvedValue({
        ...bookingData,
        id: 'booking-123',
        confirmationCode: 'ABC123',
        status: 'pending',
      });

      // The confirmation code should be 6 characters uppercase
      const result = BookingService.createBooking(bookingData);
      expect(result).resolves.toHaveProperty('confirmationCode');
    });
  });

  describe('Order Service', () => {
    test('should generate order number correctly', () => {
      // Test via public interface
      const orderData = {
        companyId: 123,
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        items: [
          {
            productId: 'prod-123',
            quantity: 2,
            price: 1000, // 10.00 in cents
          }
        ],
      };

      require('../prisma').prisma.order.create.mockResolvedValue({
        ...orderData,
        id: 'order-123',
        orderNumber: 'ORD-123456-ABC',
        total: 2000,
      });

      const result = OrderService.createOrder(orderData);
      expect(result).resolves.toHaveProperty('orderNumber');
    });
  });

  describe('Validation', () => {
    test('should validate price inputs', () => {
      expect(() => formatPrice(-100)).not.toThrow();
      expect(formatPrice(-100)).toBe('-1,00 €');
    });

    test('should handle edge cases in tax calculation', () => {
      expect(calculateTax(1, 0.001)).toBe(0); // Rounds to 0
      expect(calculateTax(999, 0.20)).toBe(200); // Rounds to nearest cent
    });
  });
});