# Production Monitoring Setup Guide

## 🚀 Overview

This guide explains how to set up comprehensive monitoring for the NETZ Directory platform in production.

## 📊 Monitoring Components

### 1. Error Tracking
- **Automatic error capture** for all API routes
- **Custom error reporting** for critical business logic
- **Error categorization** by severity levels
- **Database storage** for error analytics

### 2. Performance Monitoring
- **API response time tracking**
- **Database query performance**
- **Stripe operation monitoring**
- **Performance alerts** for slow operations

### 3. Health Checks
- **System health endpoint**: `/api/health`
- **Database connectivity checks**
- **External service availability**
- **Automated health monitoring**

### 4. Application Metrics
- **User activity tracking**
- **Business metrics** (subscriptions, orders, bookings)
- **API usage analytics**
- **Custom dashboard data**

## 🛠️ Setup Instructions

### 1. Database Migration

Run the monitoring models migration:

```bash
npx prisma db push
```

This adds the following tables:
- `error_logs` - Error tracking and reporting
- `performance_metrics` - Performance monitoring
- `health_check_logs` - System health history

### 2. Environment Variables

Add to your `.env.production`:

```bash
# Monitoring Configuration
ENABLE_MONITORING=true
ERROR_REPORTING_LEVEL=medium  # low, medium, high, critical

# External Monitoring Services (Optional)
SENTRY_DSN=https://your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Health Check Configuration
HEALTH_CHECK_INTERVAL=300000  # 5 minutes in milliseconds
```

### 3. Using the Monitoring System

#### Automatic Monitoring

All API routes are automatically monitored when you use the monitoring middleware:

```typescript
import { withMonitoring } from '@/middleware/monitoring';

export const GET = withMonitoring(async (request: NextRequest) => {
  // Your API logic here
  // Errors and performance are automatically tracked
});
```

#### Manual Error Tracking

For business-critical operations:

```typescript
import { ErrorTracker } from '@/lib/monitoring';

try {
  await criticalOperation();
} catch (error) {
  await ErrorTracker.reportError(error, {
    operation: 'payment_processing',
    userId: 'user-123',
    severity: 'critical',
  });
  throw error;
}
```

#### Performance Tracking

For custom operations:

```typescript
import { trackOperation } from '@/middleware/monitoring';

const result = await trackOperation(
  'complex_calculation',
  async () => {
    return await performComplexCalculation();
  },
  { userId: 'user-123', dataset: 'large' }
);
```

#### Payment Error Tracking

Special handling for Stripe errors:

```typescript
import { ErrorTracker } from '@/lib/monitoring';

try {
  await stripe.subscriptions.create(params);
} catch (error) {
  await ErrorTracker.reportPaymentError(error, {
    businessOwnerId: 'user-123',
    planId: 'pro',
    amount: 4999,
  });
  throw error;
}
```

## 🔍 Monitoring Endpoints

### Health Check
```
GET /api/health
```

Response format:
```json
{
  "status": "healthy",
  "checks": [
    {
      "service": "database",
      "status": "healthy",
      "responseTime": 45,
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "service": "stripe",
      "status": "healthy",
      "responseTime": 120,
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Monitoring Dashboard Data
```
GET /api/monitoring/dashboard?timeframe=day
```

Response format:
```json
{
  "errorCount": 12,
  "avgResponseTime": 145,
  "totalRequests": 1250,
  "errorRate": 0.96,
  "timeframe": "day",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 📈 Monitoring Dashboard

### Key Metrics to Track

1. **Error Rate**: < 1% target
2. **Response Time**: < 200ms average
3. **Database Queries**: < 100ms average
4. **Stripe Operations**: < 2s average
5. **System Uptime**: > 99.9% target

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 2% | > 5% |
| Response Time | > 500ms | > 2s |
| Database Latency | > 200ms | > 1s |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 85% | > 95% |

## 🚨 Alerting Setup

### Email Alerts

Configure email notifications for critical errors:

```typescript
// In your monitoring configuration
const alertConfig = {
  email: {
    recipients: ['admin@yourdomain.com', 'dev@yourdomain.com'],
    criticalErrors: true,
    performanceAlerts: true,
    healthCheckFailures: true,
  }
};
```

### Slack Integration

Send alerts to Slack channels:

```typescript
// Slack webhook integration
const slackAlert = {
  webhookUrl: 'https://hooks.slack.com/services/...',
  channel: '#alerts',
  username: 'NETZ Monitor',
};
```

### PagerDuty Integration

For 24/7 incident management:

```typescript
// PagerDuty integration
const pagerDutyConfig = {
  integrationKey: 'your-pagerduty-key',
  escalationPolicy: 'critical-incidents',
};
```

## 📊 External Monitoring Services

### Recommended Services

1. **Sentry** - Error tracking and performance monitoring
2. **DataDog** - Infrastructure and application monitoring
3. **New Relic** - Full-stack observability
4. **Uptime Robot** - Website uptime monitoring
5. **LogRocket** - Session replay and error tracking

### Integration Examples

#### Sentry Setup

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### DataDog Setup

```typescript
// datadog integration
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.eu',
  service: 'netz-directory',
  env: process.env.NODE_ENV,
});
```

## 🔧 Performance Optimization

### Database Query Optimization

Monitor slow queries:

```typescript
import { PerformanceMonitor } from '@/lib/monitoring';

const startTime = Date.now();
const result = await prisma.company.findMany({
  where: { city: 'Haguenau' },
  include: { reviews: true }
});

await PerformanceMonitor.trackDbQuery(
  'companies.findMany.with.reviews',
  startTime,
  true,
  result.length
);
```

### API Response Time Optimization

Track API performance:

```typescript
// Automatic tracking with middleware
export const GET = withMonitoring(async (request) => {
  // Your API logic - automatically tracked
});
```

### Memory and Resource Monitoring

```typescript
// Memory usage tracking
const memoryUsage = process.memoryUsage();
await PerformanceMonitor.trackApiPerformance(
  'memory_usage',
  Date.now(),
  true,
  {
    rss: memoryUsage.rss,
    heapUsed: memoryUsage.heapUsed,
    heapTotal: memoryUsage.heapTotal,
  }
);
```

## 📅 Maintenance Tasks

### Daily Tasks
- [ ] Review error logs and patterns
- [ ] Check system health dashboard
- [ ] Monitor response time trends
- [ ] Review critical alerts

### Weekly Tasks
- [ ] Analyze performance trends
- [ ] Review and clean old logs
- [ ] Update monitoring thresholds
- [ ] Test alert systems

### Monthly Tasks
- [ ] Generate monitoring reports
- [ ] Review and optimize slow queries
- [ ] Update monitoring documentation
- [ ] Plan performance improvements

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] All monitoring environment variables configured
- [ ] Database migrations applied
- [ ] Health check endpoint responding
- [ ] Error tracking functional
- [ ] Performance monitoring active
- [ ] Alert systems configured
- [ ] Dashboard access configured
- [ ] Backup monitoring systems tested

## 📞 Support and Troubleshooting

### Common Issues

1. **High error rates**: Check database connectivity and external services
2. **Slow response times**: Investigate database queries and caching
3. **Memory leaks**: Monitor heap usage and garbage collection
4. **Database timeouts**: Optimize queries and connection pooling

### Getting Help

- **Documentation**: Check monitoring logs and dashboards
- **Health Check**: Visit `/api/health` for system status
- **Error Logs**: Review error patterns in monitoring dashboard
- **Performance Data**: Analyze trends in performance metrics

---

✅ **Your production monitoring system is now ready!** 

Monitor your application's health, performance, and errors with comprehensive tracking and alerting.