/**
 * E-commerce & Booking Integration System
 * Handles product management, booking, inventory, and order processing
 */

import { prisma } from './prisma';

// Product Types
export type ProductType = 'physical' | 'digital' | 'service' | 'booking';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// Product Management Service
export class ProductService {
  
  /**
   * Create new product
   */
  static async createProduct(companyId: number, data: {
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    type: ProductType;
    sku?: string;
    status: ProductStatus;
    images?: string[];
    specifications?: Record<string, any>;
    isBookingEnabled?: boolean;
    bookingDuration?: number; // in minutes
    maxAdvanceBooking?: number; // days in advance
    allowOnlineBooking?: boolean;
    inventoryTracked?: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    categories?: string[];
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string;
  }) {
    return await prisma.product.create({
      data: {
        companyId,
        ...data,
        images: data.images || [],
        specifications: data.specifications || {},
        categories: data.categories || [],
        tags: data.tags || [],
      },
    });
  }

  /**
   * Update product
   */
  static async updateProduct(productId: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    compareAtPrice: number;
    status: ProductStatus;
    images: string[];
    specifications: Record<string, any>;
    stockQuantity: number;
    lowStockThreshold: number;
    categories: string[];
    tags: string[];
  }>) {
    return await prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  /**
   * Get products for company
   */
  static async getCompanyProducts(companyId: number, filters?: {
    type?: ProductType;
    status?: ProductStatus;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { companyId };

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.categories = { has: filters.category };
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        company: {
          select: { name: true, slug: true }
        },
        variants: true,
        bookings: {
          where: { status: { in: ['confirmed', 'pending'] } },
          select: { id: true, startTime: true, endTime: true }
        },
        orders: {
          select: { id: true, quantity: true, status: true }
        },
      },
    });
  }

  /**
   * Check product availability for booking
   */
  static async checkAvailability(productId: string, startTime: Date, endTime: Date) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bookings: {
          where: {
            status: { in: ['confirmed', 'pending'] },
            OR: [
              { startTime: { lte: endTime }, endTime: { gte: startTime } }
            ]
          }
        }
      }
    });

    if (!product) throw new Error('Product not found');
    if (!product.isBookingEnabled) throw new Error('Booking not enabled for this product');

    // Check if time slot conflicts with existing bookings
    const hasConflict = product.bookings.length > 0;
    
    return {
      available: !hasConflict,
      conflicts: product.bookings,
      product,
    };
  }

  /**
   * Update inventory
   */
  static async updateInventory(productId: string, quantity: number, operation: 'increase' | 'decrease') {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, inventoryTracked: true, lowStockThreshold: true }
    });

    if (!product?.inventoryTracked) {
      throw new Error('Inventory tracking not enabled for this product');
    }

    const newQuantity = operation === 'increase' 
      ? (product.stockQuantity || 0) + quantity
      : (product.stockQuantity || 0) - quantity;

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stockQuantity: newQuantity,
        status: newQuantity === 0 ? 'out_of_stock' : 'active'
      },
    });

    // Check for low stock alert
    if (product.lowStockThreshold && newQuantity <= product.lowStockThreshold) {
      await this.createLowStockAlert(productId, newQuantity);
    }

    return updatedProduct;
  }

  /**
   * Create low stock alert
   */
  private static async createLowStockAlert(productId: string, currentStock: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { company: { include: { ownerships: true } } }
    });

    if (!product) return;

    // Create notification for business owners
    for (const ownership of product.company.ownerships) {
      await prisma.notification.create({
        data: {
          recipientId: ownership.ownerId,
          type: 'low_stock_alert',
          title: 'Stock faible',
          message: `Le produit "${product.name}" n'a plus que ${currentStock} unité(s) en stock.`,
          companyId: product.companyId,
          data: {
            productId,
            productName: product.name,
            currentStock,
            threshold: product.lowStockThreshold
          }
        }
      });
    }
  }
}

// Booking Management Service
export class BookingService {
  
  /**
   * Create new booking
   */
  static async createBooking(data: {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
    price?: number;
    paymentStatus?: 'pending' | 'paid' | 'failed';
  }) {
    // Check availability first
    const availability = await ProductService.checkAvailability(
      data.productId, 
      data.startTime, 
      data.endTime
    );

    if (!availability.available) {
      throw new Error('Time slot not available');
    }

    const booking = await prisma.booking.create({
      data: {
        ...data,
        status: 'pending',
        confirmationCode: this.generateConfirmationCode(),
      },
      include: {
        product: {
          include: { company: true }
        }
      }
    });

    // Send confirmation notification
    await this.sendBookingNotification(booking.id, 'created');

    return booking;
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        ...(notes && { notes })
      },
      include: {
        product: { include: { company: true } }
      }
    });

    await this.sendBookingNotification(bookingId, 'status_updated');
    return booking;
  }

  /**
   * Get bookings for company
   */
  static async getCompanyBookings(companyId: number, filters?: {
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    productId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      product: { companyId }
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.startDate) where.startTime = { gte: filters.startDate };
    if (filters?.endDate) where.endTime = { lte: filters.endDate };

    return await prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        product: {
          select: { name: true, type: true }
        }
      }
    });
  }

  /**
   * Generate confirmation code
   */
  private static generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Send booking notification
   */
  private static async sendBookingNotification(bookingId: string, type: 'created' | 'status_updated') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            company: {
              include: { ownerships: true }
            }
          }
        }
      }
    });

    if (!booking) return;

    const message = type === 'created' 
      ? `Nouvelle réservation pour ${booking.product.name}`
      : `Réservation ${booking.confirmationCode} mise à jour`;

    // Notify business owners
    for (const ownership of booking.product.company.ownerships) {
      await prisma.notification.create({
        data: {
          recipientId: ownership.ownerId,
          type: 'booking_notification',
          title: 'Nouvelle réservation',
          message,
          companyId: booking.product.companyId,
          data: {
            bookingId,
            confirmationCode: booking.confirmationCode,
            customerName: booking.customerName,
            startTime: booking.startTime,
            endTime: booking.endTime
          }
        }
      });
    }
  }

  /**
   * Get available time slots
   */
  static async getAvailableSlots(productId: string, date: Date, duration: number = 60) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bookings: {
          where: {
            status: { in: ['confirmed', 'pending'] },
            startTime: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        }
      }
    });

    if (!product?.isBookingEnabled) {
      throw new Error('Booking not enabled for this product');
    }

    const businessHours = {
      start: 9, // 9 AM
      end: 17,  // 5 PM
    };

    const slots = [];
    const slotDuration = duration; // minutes

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Check if slot conflicts with existing bookings
        const hasConflict = product.bookings.some(booking => 
          booking.startTime < slotEnd && booking.endTime > slotStart
        );

        if (!hasConflict) {
          slots.push({
            startTime: slotStart,
            endTime: slotEnd,
            available: true
          });
        }
      }
    }

    return slots;
  }
}

// Order Management Service
export class OrderService {
  
  /**
   * Create new order
   */
  static async createOrder(data: {
    companyId: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    shippingAddress?: Record<string, any>;
    billingAddress?: Record<string, any>;
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price: number;
    }>;
    shippingCost?: number;
    taxAmount?: number;
    discountAmount?: number;
    couponCode?: string;
    notes?: string;
  }) {
    const orderNumber = this.generateOrderNumber();
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + (data.shippingCost || 0) + (data.taxAmount || 0) - (data.discountAmount || 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        companyId: data.companyId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress || {},
        billingAddress: data.billingAddress || {},
        subtotal,
        shippingCost: data.shippingCost || 0,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        total,
        couponCode: data.couponCode,
        notes: data.notes,
        status: 'pending',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, sku: true } },
            variant: { select: { name: true, sku: true } }
          }
        }
      }
    });

    // Update inventory for physical products
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { type: true, inventoryTracked: true }
      });

      if (product?.type === 'physical' && product.inventoryTracked) {
        await ProductService.updateInventory(item.productId, item.quantity, 'decrease');
      }
    }

    await this.sendOrderNotification(order.id, 'created');
    return order;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() })
      },
      include: {
        items: { include: { product: true } }
      }
    });

    await this.sendOrderNotification(orderId, 'status_updated');
    return order;
  }

  /**
   * Get orders for company
   */
  static async getCompanyOrders(companyId: number, filters?: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    customerEmail?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { companyId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerEmail) where.customerEmail = filters.customerEmail;
    if (filters?.startDate) where.createdAt = { gte: filters.startDate };
    if (filters?.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };

    return await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        items: {
          include: {
            product: { select: { name: true, type: true } },
            variant: { select: { name: true } }
          }
        }
      }
    });
  }

  /**
   * Generate order number
   */
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Send order notification
   */
  private static async sendOrderNotification(orderId: string, type: 'created' | 'status_updated') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: { include: { ownerships: true } }
      }
    });

    if (!order) return;

    const message = type === 'created' 
      ? `Nouvelle commande ${order.orderNumber}`
      : `Commande ${order.orderNumber} mise à jour`;

    // Notify business owners
    for (const ownership of order.company.ownerships) {
      await prisma.notification.create({
        data: {
          recipientId: ownership.ownerId,
          type: 'order_notification',
          title: 'Nouvelle commande',
          message,
          companyId: order.companyId,
          data: {
            orderId,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
            status: order.status
          }
        }
      });
    }
  }
}

// Analytics Service for E-commerce
export class EcommerceAnalytics {
  
  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(companyId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate },
        status: { not: 'cancelled' }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    const bookings = await prisma.booking.findMany({
      where: {
        product: { companyId },
        createdAt: { gte: startDate },
        status: { in: ['confirmed', 'completed'] }
      },
      include: { product: true }
    });

    return {
      sales: {
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      },
      bookings: {
        totalBookings: bookings.length,
        totalBookingRevenue: bookings.reduce((sum, booking) => sum + (booking.price || 0), 0),
      },
      topProducts: await this.getTopProducts(companyId, startDate),
      recentOrders: orders.slice(0, 10),
      recentBookings: bookings.slice(0, 10),
    };
  }

  /**
   * Get top selling products
   */
  private static async getTopProducts(companyId: number, startDate: Date) {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          companyId,
          createdAt: { gte: startDate },
          status: { not: 'cancelled' }
        }
      },
      include: { product: true }
    });

    const productSales = orderItems.reduce((acc, item) => {
      const productId = item.productId;
      if (!acc[productId]) {
        acc[productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      acc[productId].totalQuantity += item.quantity;
      acc[productId].totalRevenue += item.total;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }
}

// Cart Management
export class CartService {
  
  /**
   * Add item to cart
   */
  static async addToCart(sessionId: string, item: {
    productId: string;
    variantId?: string;
    quantity: number;
  }) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        productId: item.productId,
        variantId: item.variantId
      }
    });

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity }
      });
    }

    return await prisma.cartItem.create({
      data: {
        sessionId,
        ...item
      }
    });
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(sessionId: string, itemId: string) {
    return await prisma.cartItem.delete({
      where: { 
        id: itemId,
        sessionId
      }
    });
  }

  /**
   * Get cart contents
   */
  static async getCart(sessionId: string) {
    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      include: {
        product: true,
        variant: true
      }
    });

    const total = items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    return {
      items,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  /**
   * Clear cart
   */
  static async clearCart(sessionId: string) {
    return await prisma.cartItem.deleteMany({
      where: { sessionId }
    });
  }
}

// Services are already exported with class declarations above

// Helper functions
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price / 100);
};

export const calculateTax = (amount: number, taxRate: number = 0.20): number => {
  return Math.round(amount * taxRate);
};

export const generateSKU = (productName: string, companyId: number): string => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const suffix = companyId.toString().padStart(3, '0');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${suffix}-${random}`;
};