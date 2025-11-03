/**
 * OpenAPI / Swagger Configuration
 * 
 * Generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Tenant Directory API',
      version: '1.0.0',
      description: `
# Multi-Tenant Directory API Documentation

Welcome to the Multi-Tenant Directory API documentation. This API provides comprehensive endpoints for managing businesses, reviews, subscriptions, and more across multiple domains.

## Features

- 🏢 **Business Management**: CRUD operations for companies and listings
- ⭐ **Review System**: Submit, moderate, and sync reviews with Google
- 💳 **Subscription Management**: Stripe-powered subscription handling
- 🔐 **Authentication**: Secure JWT-based authentication for business owners and admins
- 🌐 **Multi-Tenant**: Support for multiple domains with isolated data
- 📊 **Analytics**: Track views, clicks, and engagement metrics
- 🤖 **AI Features**: AI-powered content generation and analysis

## Authentication

Most endpoints require authentication. Include your JWT token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Public endpoints**: 100 requests per 15 minutes
- **Authenticated endpoints**: 1000 requests per 15 minutes

## Error Handling

All errors follow a standardized format:

\`\`\`json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2025-10-21T12:00:00.000Z"
  }
}
\`\`\`

## Support

For questions or issues, contact: support@example.com
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://haguenau.pro',
        description: 'Production server (Haguenau)',
      },
      {
        url: 'https://bas-rhin.pro',
        description: 'Production server (Bas-Rhin)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for external integrations',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found',
                },
                code: {
                  type: 'string',
                  example: 'NOT_FOUND',
                },
                statusCode: {
                  type: 'integer',
                  example: 404,
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-10-21T12:00:00.000Z',
                },
              },
            },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Restaurant Le Gourmet',
            },
            slug: {
              type: 'string',
              example: 'restaurant-le-gourmet',
            },
            description: {
              type: 'string',
              example: 'Fine dining French restaurant',
            },
            address: {
              type: 'string',
              example: '123 Rue Principale',
            },
            city: {
              type: 'string',
              example: 'Haguenau',
            },
            postalCode: {
              type: 'string',
              example: '67500',
            },
            phone: {
              type: 'string',
              example: '+33 3 88 12 34 56',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@legourmet.fr',
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://legourmet.fr',
            },
            rating: {
              type: 'number',
              format: 'float',
              example: 4.5,
            },
            reviewCount: {
              type: 'integer',
              example: 123,
            },
            categories: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['restaurant', 'food'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            companyId: {
              type: 'integer',
              example: 1,
            },
            authorName: {
              type: 'string',
              example: 'Jean Dupont',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            comment: {
              type: 'string',
              example: 'Excellent restaurant!',
            },
            verified: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Companies',
        description: 'Business listing management',
      },
      {
        name: 'Reviews',
        description: 'Review submission and management',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription and payment management',
      },
      {
        name: 'Admin',
        description: 'Admin-only endpoints (requires admin authentication)',
      },
      {
        name: 'Business Management',
        description: 'Business owner profile and management',
      },
      {
        name: 'Search',
        description: 'Search and filtering endpoints',
      },
      {
        name: 'Contact',
        description: 'Contact form and inquiries',
      },
      {
        name: 'System',
        description: 'System health and monitoring',
      },
    ],
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.tsx',
    './docs/api-examples.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

