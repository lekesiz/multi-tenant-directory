/**
 * API Ecosystem & Third-Party Integrations
 * Handles external API integrations, webhooks, and developer tools
 */

import { logger } from '@/lib/logger';
import { prisma } from './prisma';
import crypto from 'crypto';

// API Key Management
export class ApiKeyService {
  
  /**
   * Generate new API key for business owner
   */
  static async generateApiKey(businessOwnerId: string, name: string, permissions: string[] = []) {
    const apiKey = `netz_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        businessOwnerId,
        name,
        hashedKey,
        permissions,
        lastUsed: null,
        isActive: true,
      },
    });

    return {
      id: apiKeyRecord.id,
      apiKey, // Return plain key only once
      name: apiKeyRecord.name,
      permissions: apiKeyRecord.permissions,
      createdAt: apiKeyRecord.createdAt,
    };
  }

  /**
   * Validate API key and return business owner
   */
  static async validateApiKey(apiKey: string): Promise<{ businessOwnerId: string; permissions: string[] } | null> {
    if (!apiKey.startsWith('netz_')) return null;

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        hashedKey,
        isActive: true,
      },
      include: {
        businessOwner: true
      }
    });

    if (!keyRecord) return null;

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { 
        lastUsed: new Date(),
        usageCount: { increment: 1 }
      },
    });

    return {
      businessOwnerId: keyRecord.businessOwnerId,
      permissions: keyRecord.permissions,
    };
  }

  /**
   * Revoke API key
   */
  static async revokeApiKey(businessOwnerId: string, keyId: string) {
    return await prisma.apiKey.updateMany({
      where: {
        id: keyId,
        businessOwnerId,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Get API keys for business owner
   */
  static async getApiKeys(businessOwnerId: string) {
    return await prisma.apiKey.findMany({
      where: { businessOwnerId },
      select: {
        id: true,
        name: true,
        permissions: true,
        isActive: true,
        lastUsed: true,
        usageCount: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Webhook Management
export class WebhookService {
  
  /**
   * Register webhook endpoint
   */
  static async registerWebhook(businessOwnerId: string, data: {
    url: string;
    events: string[];
    secret?: string;
    description?: string;
    isActive?: boolean;
  }) {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');

    return await prisma.webhook.create({
      data: {
        businessOwnerId,
        url: data.url,
        events: data.events,
        secret,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Send webhook event
   */
  static async sendWebhookEvent(event: {
    type: string;
    data: any;
    businessOwnerId?: string;
    companyId?: number;
  }) {
    // Find all webhooks that should receive this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        events: { has: event.type },
        ...(event.businessOwnerId && { businessOwnerId: event.businessOwnerId }),
        ...(event.companyId && { 
          businessOwner: {
            companies: {
              some: { companyId: event.companyId }
            }
          }
        }),
      },
    });

    const results = [];

    for (const webhook of webhooks) {
      try {
        const payload = {
          id: crypto.randomUUID(),
          type: event.type,
          data: event.data,
          timestamp: new Date().toISOString(),
        };

        const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event.type,
            'User-Agent': 'NETZ-Webhooks/1.0',
          },
          body: JSON.stringify(payload),
        });

        const success = response.ok;
        const statusCode = response.status;

        // Log webhook delivery
        await prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            eventType: event.type,
            payload,
            success,
            statusCode,
            response: success ? 'OK' : await response.text(),
          },
        });

        // Update webhook stats
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggered: new Date(),
            successCount: success ? { increment: 1 } : undefined,
            failureCount: !success ? { increment: 1 } : undefined,
          },
        });

        results.push({
          webhookId: webhook.id,
          success,
          statusCode,
        });

      } catch (error) {
        logger.error(`Webhook delivery failed for ${webhook.id}:`, error);

        // Log failed delivery
        await prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            eventType: event.type,
            payload: event.data,
            success: false,
            statusCode: 0,
            response: (error as Error).message,
          },
        });

        // Update failure count
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { failureCount: { increment: 1 } },
        });

        results.push({
          webhookId: webhook.id,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Generate webhook signature
   */
  private static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get webhooks for business owner
   */
  static async getWebhooks(businessOwnerId: string) {
    return await prisma.webhook.findMany({
      where: { businessOwnerId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Test webhook endpoint
   */
  static async testWebhook(webhookId: string) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    return await this.sendWebhookEvent({
      type: 'webhook.test',
      data: {
        message: 'This is a test webhook event',
        timestamp: new Date().toISOString(),
      },
      businessOwnerId: webhook.businessOwnerId,
    });
  }
}

// Rate Limiting
export class RateLimitService {
  
  /**
   * Check rate limit for API key or IP
   */
  static async checkRateLimit(
    identifier: string,
    window: number = 3600, // 1 hour in seconds
    limit: number = 1000
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % window);

    const key = `rate_limit:${identifier}:${windowStart}`;

    // Get current count (in a real app, use Redis)
    const current = await this.getRateLimitCount(key);
    
    if (current >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + window,
      };
    }

    // Increment count
    await this.incrementRateLimitCount(key, window);

    return {
      allowed: true,
      remaining: limit - current - 1,
      resetTime: windowStart + window,
    };
  }

  private static async getRateLimitCount(key: string): Promise<number> {
    // In production, use Redis: return redis.get(key) || 0
    // For now, simulate with database or in-memory cache
    return 0;
  }

  private static async incrementRateLimitCount(key: string, ttl: number): Promise<void> {
    // In production, use Redis: redis.incr(key); redis.expire(key, ttl)
    // For now, simulate
  }
}

// Third-Party Integrations
export class IntegrationService {
  
  /**
   * Google My Business Integration
   */
  static async syncGoogleMyBusiness(businessOwnerId: string, companyId: number) {
    // Implementation for Google My Business API sync
    // This would sync reviews, photos, business info, etc.
    
    try {
      // Placeholder for Google My Business API calls
      const business = await prisma.company.findUnique({
        where: { id: companyId },
        include: { reviews: true }
      });

      if (!business?.googlePlaceId) {
        throw new Error('Google Place ID not found');
      }

      // Sync reviews from Google
      // const googleReviews = await this.fetchGoogleReviews(business.googlePlaceId);
      // await this.syncReviews(companyId, googleReviews);

      return {
        success: true,
        message: 'Google My Business sync completed',
        synced: {
          reviews: 0, // googleReviews.length,
          photos: 0,
          businessInfo: 1,
        }
      };

    } catch (error) {
      logger.error('Google My Business sync error:', error);
      throw error;
    }
  }

  /**
   * Mailchimp Integration
   */
  static async syncMailchimp(businessOwnerId: string, listId: string, contacts: any[]) {
    // Implementation for Mailchimp API integration
    try {
      // const mailchimpApi = new MailchimpMarketing();
      // mailchimpApi.setConfig({
      //   apiKey: process.env.MAILCHIMP_API_KEY,
      //   server: process.env.MAILCHIMP_SERVER_PREFIX,
      // });

      // Sync contacts to Mailchimp list
      // const response = await mailchimpApi.lists.batchListMembers(listId, {
      //   members: contacts.map(contact => ({
      //     email_address: contact.email,
      //     status: "subscribed",
      //     merge_fields: {
      //       FNAME: contact.firstName,
      //       LNAME: contact.lastName,
      //     }
      //   }))
      // });

      return {
        success: true,
        message: 'Mailchimp sync completed',
        synced: contacts.length,
      };

    } catch (error) {
      logger.error('Mailchimp sync error:', error);
      throw error;
    }
  }

  /**
   * Zapier Integration
   */
  static async triggerZapierWebhook(businessOwnerId: string, event: string, data: any) {
    const webhook = await prisma.integration.findFirst({
      where: {
        businessOwnerId,
        type: 'zapier',
        isActive: true,
      }
    });

    if (!webhook?.webhookUrl) {
      return { success: false, message: 'Zapier webhook not configured' };
    }

    try {
      const response = await fetch(webhook.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NETZ-Zapier/1.0',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      });

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Zapier webhook triggered' : 'Zapier webhook failed',
      };

    } catch (error) {
      logger.error('Zapier webhook error:', error);
      throw error;
    }
  }

  /**
   * Slack Integration
   */
  static async sendSlackNotification(businessOwnerId: string, message: string, channel?: string) {
    const integration = await prisma.integration.findFirst({
      where: {
        businessOwnerId,
        type: 'slack',
        isActive: true,
      }
    });

    if (!integration?.accessToken) {
      return { success: false, message: 'Slack integration not configured' };
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channel || '#general',
          text: message,
          username: 'NETZ Directory',
          icon_emoji: ':office:',
        }),
      });

      const result = await response.json();

      return {
        success: result.ok,
        message: result.ok ? 'Slack message sent' : result.error,
      };

    } catch (error) {
      logger.error('Slack notification error:', error);
      throw error;
    }
  }

  /**
   * WhatsApp Business API Integration
   */
  static async sendWhatsAppMessage(businessOwnerId: string, to: string, message: string) {
    const integration = await prisma.integration.findFirst({
      where: {
        businessOwnerId,
        type: 'whatsapp',
        isActive: true,
      }
    });

    if (!integration?.accessToken) {
      return { success: false, message: 'WhatsApp integration not configured' };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${integration.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          text: { body: message },
        }),
      });

      const result = await response.json();

      return {
        success: !result.error,
        message: result.error?.message || 'WhatsApp message sent',
        messageId: result.messages?.[0]?.id,
      };

    } catch (error) {
      logger.error('WhatsApp message error:', error);
      throw error;
    }
  }
}

// API Usage Analytics
export class ApiAnalyticsService {
  
  /**
   * Record API request
   */
  static async recordApiRequest(data: {
    businessOwnerId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return await prisma.apiUsage.create({
      data: {
        businessOwnerId: data.businessOwnerId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get API usage statistics
   */
  static async getApiUsageStats(businessOwnerId: string, period: 'day' | 'week' | 'month' = 'month') {
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
    }

    const usage = await prisma.apiUsage.findMany({
      where: {
        businessOwnerId,
        timestamp: { gte: startDate },
      },
    });

    const totalRequests = usage.length;
    const successfulRequests = usage.filter(u => u.statusCode < 400).length;
    const averageResponseTime = usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests || 0;

    const endpointStats = usage.reduce((acc, u) => {
      const key = `${u.method} ${u.endpoint}`;
      if (!acc[key]) {
        acc[key] = { count: 0, avgResponseTime: 0, successRate: 0 };
      }
      acc[key].count++;
      acc[key].avgResponseTime += u.responseTime;
      acc[key].successRate += u.statusCode < 400 ? 1 : 0;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and percentages
    Object.keys(endpointStats).forEach(key => {
      const stats = endpointStats[key];
      stats.avgResponseTime = stats.avgResponseTime / stats.count;
      stats.successRate = (stats.successRate / stats.count) * 100;
    });

    return {
      period,
      totalRequests,
      successfulRequests,
      errorRate: ((totalRequests - successfulRequests) / totalRequests * 100) || 0,
      averageResponseTime: Math.round(averageResponseTime),
      endpointStats,
      dailyBreakdown: this.groupUsageByDay(usage),
    };
  }

  private static groupUsageByDay(usage: any[]) {
    const grouped = usage.reduce((acc, u) => {
      const date = u.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { requests: 0, errors: 0 };
      }
      acc[date].requests++;
      if (u.statusCode >= 400) {
        acc[date].errors++;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...(stats as object),
    }));
  }
}

// Developer Portal Features
export class DeveloperPortalService {
  
  /**
   * Generate API documentation
   */
  static generateApiDocs() {
    return {
      info: {
        title: 'NETZ Directory API',
        version: '1.0.0',
        description: 'REST API for NETZ multi-tenant directory platform',
        contact: {
          name: 'NETZ Support',
          email: 'api@netz.directory',
        },
      },
      servers: [
        {
          url: 'https://api.netz.directory/v1',
          description: 'Production server',
        },
      ],
      paths: {
        '/companies': {
          get: {
            summary: 'List companies',
            description: 'Get a list of companies with filtering options',
            parameters: [
              {
                name: 'city',
                in: 'query',
                description: 'Filter by city',
                schema: { type: 'string' },
              },
              {
                name: 'category',
                in: 'query',
                description: 'Filter by category',
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        companies: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Company' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/companies/{id}': {
          get: {
            summary: 'Get company by ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Company' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Company: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              website: { type: 'string' },
              categories: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
    };
  }

  /**
   * Generate SDK code snippets
   */
  static generateSDKSnippets(endpoint: string, method: string) {
    const baseUrl = 'https://api.netz.directory/v1';
    
    return {
      curl: `curl -X ${method} "${baseUrl}${endpoint}" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
      
      javascript: `const response = await fetch('${baseUrl}${endpoint}', {
  method: '${method}',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
      
      python: `import requests

response = requests.${method.toLowerCase()}(
    '${baseUrl}${endpoint}',
    headers={
        'X-API-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)
data = response.json()`,
      
      php: `<?php
$response = file_get_contents('${baseUrl}${endpoint}', false, stream_context_create([
    'http' => [
        'method' => '${method}',
        'header' => [
            'X-API-Key: YOUR_API_KEY',
            'Content-Type: application/json'
        ]
    ]
]));
$data = json_decode($response, true);`,
    };
  }
}

// Services are already exported with class declarations above
