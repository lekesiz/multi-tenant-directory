# 🚀 Deployment Guide - Directory Platform

**Version:** 1.0.0
**Last Updated:** 16 Octobre 2025
**Target:** Production Deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Docker Deployment](#docker-deployment)
5. [Traditional VPS Deployment](#traditional-vps-deployment)
6. [Database Setup](#database-setup)
7. [Domain Configuration](#domain-configuration)
8. [Environment Variables](#environment-variables)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Post-Deployment](#post-deployment)
11. [Monitoring & Logging](#monitoring--logging)
12. [Backup & Recovery](#backup--recovery)
13. [Scaling](#scaling)
14. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Vercel** | Easy | Free-$20/mo | Most users, fastest setup |
| **Docker** | Medium | Variable | Custom infrastructure |
| **VPS** | Hard | $5-50/mo | Full control |

**Recommended:** Vercel for simplicity and performance.

---

## Prerequisites

### Required

- ✅ GitHub account (for Vercel deployment)
- ✅ Domain name (e.g., haguenau.pro)
- ✅ PostgreSQL database
- ✅ Node.js 20+ (for local build testing)
- ✅ Environment variables configured

### Optional

- Google Maps API key
- Cloudinary account (image hosting)
- SendGrid account (email)
- Sentry account (error tracking)

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

**1.1 Push to GitHub:**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**1.2 Verify Build Locally:**

```bash
npm run build
```

Ensure no errors. Fix any issues before deploying.

### Step 2: Create Vercel Project

**2.1 Sign Up/Login:**
- Visit [vercel.com](https://vercel.com)
- Sign up or log in with GitHub

**2.2 Import Repository:**
1. Click "Add New Project"
2. Select your GitHub repository
3. Click "Import"

**2.3 Configure Project:**

```yaml
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**2.4 Set Environment Variables:**

Click "Environment Variables" and add all variables from your `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
NEXTAUTH_SECRET=your-secret-32-chars-minimum
NEXTAUTH_URL=https://your-domain.com

# APIs
GOOGLE_MAPS_API_KEY=your-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
SENDGRID_API_KEY=your-key
FROM_EMAIL=noreply@your-domain.com

# Admin
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=secure-password-here
```

**Important:** Use production values, not development values!

### Step 3: Deploy

**3.1 Deploy:**
- Click "Deploy"
- Wait for build to complete (2-5 minutes)
- You'll get a `.vercel.app` URL

**3.2 Test Deployment:**
- Visit the Vercel URL
- Test homepage loads
- Test search functionality
- Test database connection

### Step 4: Add Custom Domain

**4.1 Add Domain to Vercel:**
1. Project Settings → Domains
2. Enter your domain: `haguenau.pro`
3. Click "Add"

**4.2 Configure DNS:**

Add these records to your DNS provider:

**For root domain (haguenau.pro):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**4.3 Wait for DNS Propagation:**
- Usually takes 5-60 minutes
- Check status in Vercel dashboard

**4.4 SSL Certificate:**
- Vercel automatically provisions SSL
- Wait for "Ready" status
- Test HTTPS access

### Step 5: Database Migrations

**5.1 Connect to Database:**

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

**5.2 Verify:**
- Check tables exist
- Verify seed data loaded
- Test application connection

### Step 6: Multi-Tenant Configuration

**6.1 Add Additional Domains:**

For each tenant domain (e.g., strasbourg.directory):
1. Add domain in Vercel
2. Configure DNS
3. Wait for SSL provisioning
4. Add domain to database:

```sql
INSERT INTO "Domain" (name, subdomain, "isActive")
VALUES ('strasbourg.directory', 'strasbourg', true);
```

**6.2 Test Each Domain:**
- Visit each domain
- Verify correct content shows
- Test search and filters

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Base image
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=directory
      - POSTGRES_PASSWORD=secure-password
      - POSTGRES_DB=directory_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build image
docker-compose build

# Run containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Stop
docker-compose down
```

---

## Traditional VPS Deployment

### Step 1: Server Setup

**1.1 Choose VPS Provider:**
- DigitalOcean, Linode, Vultr, OVH
- Minimum: 2GB RAM, 2 CPU cores, 50GB SSD

**1.2 Initial Server Setup:**

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### Step 2: PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE directory_prod;
CREATE USER directory_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE directory_prod TO directory_user;
\q
```

### Step 3: Deploy Application

**3.1 Clone Repository:**

```bash
# Create app directory
mkdir -p /var/www/directory
cd /var/www/directory

# Clone repo
git clone https://github.com/your-org/repo.git .

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate
```

**3.2 Create .env.production:**

```bash
nano .env.production
```

Add all environment variables (same as Vercel).

**3.3 Build Application:**

```bash
npm run build
```

**3.4 Setup PM2:**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'directory',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Nginx Configuration

Create `/etc/nginx/sites-available/directory`:

```nginx
server {
    listen 80;
    server_name haguenau.pro www.haguenau.pro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/directory /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5: SSL with Let's Encrypt

```bash
# Get SSL certificate
certbot --nginx -d haguenau.pro -d www.haguenau.pro

# Test auto-renewal
certbot renew --dry-run
```

### Step 6: Database Migrations

```bash
cd /var/www/directory
export DATABASE_URL="postgresql://directory_user:password@localhost:5432/directory_prod"
npx prisma migrate deploy
npx prisma db seed
```

---

## Database Setup

### Vercel Postgres (Recommended)

**1. Create Database:**
- Go to Vercel Dashboard → Storage
- Create new Postgres database
- Copy connection strings

**2. Configure:**
- Add `POSTGRES_URL` to environment variables
- Use `POSTGRES_URL_NON_POOLING` for migrations

### External Database Providers

**Supabase:**
1. Create project at supabase.com
2. Get connection string from Settings → Database
3. Use in `DATABASE_URL`

**Neon:**
1. Create project at neon.tech
2. Copy connection string
3. Add to environment variables

**Railway:**
1. Create PostgreSQL service
2. Copy `DATABASE_URL`
3. Configure in application

### Database Security

```bash
# Use SSL connection
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# Limit connections
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5"
```

---

## Environment Variables

### Production Checklist

**Required:**
- [ ] `DATABASE_URL` - Production database
- [ ] `NEXTAUTH_SECRET` - 32+ character random string
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `ADMIN_EMAIL` - Admin account email
- [ ] `ADMIN_PASSWORD` - Strong admin password

**Optional but Recommended:**
- [ ] `GOOGLE_MAPS_API_KEY` - For maps
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Images
- [ ] `CLOUDINARY_API_KEY` - Image uploads
- [ ] `CLOUDINARY_API_SECRET` - Image security
- [ ] `SENDGRID_API_KEY` - Email notifications
- [ ] `FROM_EMAIL` - Sender email address

**Security:**
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `RATE_LIMIT_ENABLED=true` - Enable rate limiting

### Generating Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong password
openssl rand -base64 24
```

---

## Post-Deployment

### Verification Checklist

**Functionality:**
- [ ] Homepage loads correctly
- [ ] Search works
- [ ] Company pages display
- [ ] Reviews can be submitted
- [ ] Admin login works
- [ ] Business owner login works
- [ ] Email notifications sent (if configured)
- [ ] Images upload correctly
- [ ] Maps display properly

**Performance:**
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] All images optimized

**SEO:**
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Robots.txt correct (/robots.txt)
- [ ] Meta tags present
- [ ] Structured data valid

**Security:**
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Admin area protected

### Initial Data Setup

**1. Create Admin User:**

```bash
# Via CLI
npx prisma db seed

# Or manually via database
INSERT INTO "User" (email, name, password, role)
VALUES ('admin@domain.com', 'Admin', '$2a$10$...', 'ADMIN');
```

**2. Add Domains:**

```sql
INSERT INTO "Domain" (name, subdomain, "isActive", "createdAt", "updatedAt")
VALUES
  ('haguenau.pro', 'haguenau', true, NOW(), NOW()),
  ('strasbourg.directory', 'strasbourg', true, NOW(), NOW());
```

**3. Import Companies:**

```bash
# If you have import scripts
npm run import:process
npm run import:db
```

---

## Monitoring & Logging

### Vercel Analytics

**Built-in Analytics:**
- Real-time visitor tracking
- Page views and unique visitors
- Performance metrics
- Top pages

**Enable:**
- Project Settings → Analytics → Enable

### Error Tracking with Sentry

**1. Setup Sentry:**

```bash
npm install @sentry/nextjs
```

**2. Configure:**

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**3. Add to Environment:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Uptime Monitoring

**Tools:**
- UptimeRobot (free, 5-minute checks)
- Pingdom
- StatusCake
- Better Uptime

**Setup:**
1. Create account
2. Add your domain
3. Set check interval
4. Configure alerts (email, SMS)

### Log Management

**Vercel Logs:**
- Real-time logs in dashboard
- Filter by type (error, info, warn)
- Search functionality

**External Logging:**
- Logtail
- Papertrail
- Datadog

---

## Backup & Recovery

### Database Backups

**Automated Backups (Vercel Postgres):**
- Daily automatic backups
- 7-day retention
- One-click restore

**Manual Backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20251016.sql
```

**Backup Strategy:**
- Daily automated backups
- Weekly manual backups
- Monthly archives
- Store off-site (S3, Backblaze)

### Application Backup

**GitHub as Backup:**
- Code always on GitHub
- Tag releases: `v1.0.0`
- Protect main branch

**Environment Variables:**
- Document all variables
- Store securely (1Password, Bitwarden)
- Never commit to Git

---

## Scaling

### Horizontal Scaling

**Vercel:**
- Automatic scaling
- No configuration needed
- Handles traffic spikes

**Docker/VPS:**
- Use load balancer (Nginx, HAProxy)
- Multiple application instances
- Shared database

### Database Scaling

**Connection Pooling:**

```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

**Read Replicas:**
- Primary for writes
- Replicas for reads
- Configure in Prisma

**Caching:**

```typescript
// Redis cache
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Cache company data
await redis.set(`company:${id}`, company, { ex: 3600 });
```

### CDN Configuration

**Vercel Edge Network:**
- Automatic global CDN
- 65+ edge locations
- No configuration needed

**Cloudflare (Optional):**
- Add domain to Cloudflare
- Enable caching rules
- Configure page rules

---

## Troubleshooting

### Build Failures

**Error: Out of memory**
```
Solution: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Error: Module not found**
```
Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Runtime Errors

**Error: Database connection failed**
```
Check:
- DATABASE_URL correct
- Database accessible
- SSL mode set correctly
- Connection limits not exceeded
```

**Error: NEXTAUTH_SECRET missing**
```
Solution: Add to environment variables
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Performance Issues

**Slow page loads:**
1. Check database queries (add indexes)
2. Enable caching
3. Optimize images
4. Use CDN

**High memory usage:**
1. Check for memory leaks
2. Optimize React components
3. Reduce bundle size
4. Use code splitting

---

## Additional Resources

- **[Environment Variables Guide](ENVIRONMENT_VARIABLES.md)** - Complete variable reference
- **[Developer Guide](../guides/DEVELOPER_GUIDE.md)** - Development setup
- **[API Documentation](../api/API_REFERENCE.md)** - API endpoints
- **[Monitoring Guide](MONITORING.md)** - Advanced monitoring

### Support

**Issues:**
- GitHub Issues: github.com/your-org/repo/issues
- Email: support@your-domain.com

**Documentation:**
- Vercel: vercel.com/docs
- Next.js: nextjs.org/docs
- Prisma: prisma.io/docs

---

**Last Updated:** 16 Octobre 2025
**Version:** 1.0.0
