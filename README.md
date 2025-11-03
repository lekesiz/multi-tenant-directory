# 🏢 Multi-Tenant Directory Platform

**Modern, scalable, and SEO-optimized local business directory platform** with multi-tenant architecture. One codebase serving **21 domains** with domain-specific content, AI-powered features, and comprehensive business management tools.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lekesiz/multi-tenant-directory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748)](https://www.prisma.io/)

---

## 🌟 Live Demo

**Production Sites:**
- 🇫🇷 [haguenau.pro](https://haguenau.pro) - Primary domain
- 🇫🇷 [bas-rhin.pro](https://bas-rhin.pro) - Secondary domain
- 📚 [API Documentation](https://haguenau.pro/docs) - Interactive Swagger UI

**21 Active Domains:**
hoerdt.pro, mutzig.pro, schiltigheim.pro, illkirch.pro, lingolsheim.pro, bischheim.pro, bischwiller.pro, hoenheim.pro, ostwald.pro, obernai.pro, erstein.pro, mundolsheim.pro, geispolsheim.pro, saverne.pro, selestat.pro, molsheim.pro, souffelweyersheim.pro, wissembourg.pro, brumath.pro, reichstett.pro, strasbourg.pro

---

## ✨ Key Features

### 🏗️ Architecture
- ✅ **Multi-Tenant Architecture** - 21 domains, single codebase
- ✅ **Domain-Specific Content** - Customized SEO and content per domain
- ✅ **Scalable Infrastructure** - Vercel Edge deployment with ISR
- ✅ **Type-Safe** - Full TypeScript coverage

### 🤖 AI & Automation
- ✅ **AI-Powered Descriptions** - Automatic business description generation
- ✅ **Sentiment Analysis** - Review sentiment classification
- ✅ **Smart Search** - AI-enhanced search with suggestions
- ✅ **SEO Content Generation** - Automated meta descriptions and keywords
- ✅ **Cover Image Generation** - AI-generated business cover images

### 👔 Business Management
- ✅ **Business Owner Dashboard** - Comprehensive management panel
- ✅ **Activity System** - Create and manage blog-style posts (NEW! v2.1.0)
  - 📢 Announcements, 📅 Events, 🎁 Offers, 🔄 Updates, 📖 Stories, 📰 News
  - AI-powered content generation with Gemini
  - Image generation with Gemini Nano
  - Video generation with Veo 3
  - Social media sharing (Facebook, Twitter, LinkedIn, Instagram)
  - Publishing and scheduling
  - Engagement metrics tracking
- ✅ **Review Management** - Reply, verify, and moderate reviews
- ✅ **Analytics Dashboard** - Real-time business metrics
- ✅ **Photo Gallery** - Multi-photo upload with primary selection
- ✅ **Business Hours** - Regular and special hours management
- ✅ **Email Preferences** - Customizable notification settings

### 📊 Admin Panel
- ✅ **Company Management** - Full CRUD operations
- ✅ **User Management** - Admin and business owner roles
- ✅ **Category Management** - Hierarchical category system with subcategories
  - Parent-child category relationships
  - Manual slug editing with auto-generation
  - Multi-language support (FR/EN/DE)
  - Icon and color customization
  - Google Place Types mapping
- ✅ **Lead Management** - View, search, and export leads to CSV
- ✅ **Review Moderation** - Approve, reject, and sync reviews
- ✅ **Domain SEO** - Per-domain SEO configuration
- ✅ **Bulk Operations** - Mass review sync and updates

### 🔍 Search & Discovery
- ✅ **Advanced Search** - Full-text search with filters
- ✅ **Autocomplete** - Real-time search suggestions
- ✅ **Category Filtering** - Multi-level category navigation
- ✅ **Location-Based** - Geolocation search support
- ✅ **Featured Listings** - Promoted business placement

### 💳 Subscription & Billing
- ✅ **Stripe Integration** - Secure payment processing
- ✅ **Subscription Plans** - Basic, Pro, Enterprise tiers
- ✅ **Billing Portal** - Self-service subscription management
- ✅ **Webhook Handling** - Automated subscription lifecycle
- ✅ **Featured Listing Purchase** - Premium placement options

### 📱 Mobile & API
- ✅ **Mobile-Optimized** - Responsive design for all devices
- ✅ **Progressive Web App** - PWA support with offline mode
- ✅ **REST API** - 119 documented endpoints
- ✅ **API Documentation** - Interactive Swagger UI at `/docs`
- ✅ **Developer Tools** - API keys and webhook management

### 🔐 Authentication & Security
- ✅ **NextAuth.js** - Secure authentication
- ✅ **Google OAuth** - Social login integration
- ✅ **Role-Based Access** - Admin, business owner, user roles
- ✅ **Email Verification** - Secure email confirmation
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **CSRF Protection** - Security token validation

### 📈 SEO & Analytics
- ✅ **Dynamic Sitemap** - Auto-generated XML sitemap
- ✅ **Structured Data** - JSON-LD schema markup
- ✅ **Meta Tags** - Dynamic Open Graph and Twitter Cards
- ✅ **Web Vitals** - Core Web Vitals monitoring
- ✅ **Analytics Integration** - Custom event tracking
- ✅ **Google Maps** - Business location integration

### 🎨 UI/UX
- ✅ **Modern Design** - Clean and professional interface
- ✅ **Rich Text Editor** - TipTap WYSIWYG editor with improved text visibility
- ✅ **SafeHTML Component** - Improved text readability with proper contrast
- ✅ **Dark Mode** - System-based theme switching
- ✅ **Animations** - Smooth transitions and interactions
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Internationalization** - Multi-language support ready

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 22.x)
- PostgreSQL database (or Neon serverless)
- pnpm (recommended) or npm
- Vercel account (for deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/lekesiz/multi-tenant-directory.git
cd multi-tenant-directory

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Setup database
npx prisma db push
npx prisma db seed

# Start development server
pnpm dev
```

Open browser: http://localhost:3000

### Environment Variables

Create `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 📚 API Documentation

### Interactive Documentation

Visit **[https://haguenau.pro/docs](https://haguenau.pro/docs)** for interactive API documentation powered by Swagger UI.

### API Overview

**119 Documented Endpoints** across 24 categories:

- **Admin API** (18 endpoints) - User, category, review, company management
- **AI/ML API** (15 endpoints) - Chat, sentiment analysis, content generation
- **Business Management** (12 endpoints) - Profile, hours, photos, reviews
- **Companies API** (9 endpoints) - CRUD operations, search, analytics
- **Mobile API** (7 endpoints) - Mobile auth, config, notifications
- **E-commerce API** (7 endpoints) - Products, cart, orders
- **Marketing API** (7 endpoints) - Campaigns, referrals, segmentation
- **Billing API** (7 endpoints) - Stripe checkout, subscriptions, webhooks
- **Reviews API** (5 endpoints) - Submit, vote, report, sync
- **Bookings API** (5 endpoints) - Reservations, availability
- **Developer API** (5 endpoints) - API keys, webhooks
- **Domains API** (5 endpoints) - Domain management, SEO
- **Analytics API** (4 endpoints) - Metrics, web vitals, insights
- **Profiles API** (4 endpoints) - Public business profiles
- **Subscriptions API** (4 endpoints) - Subscription lifecycle
- **Media API** (3 endpoints) - File upload, photo management
- **Search API** (2 endpoints) - Advanced search, suggestions
- **Google Maps API** (2 endpoints) - Place search, details
- **Dashboard API** (2 endpoints) - Layout, widgets
- **Cron Jobs API** (2 endpoints) - Scheduled tasks
- **Authentication API** (2 endpoints) - User and business owner signup
- **API v1** (2 endpoints) - Versioned API endpoints
- **Contact API** (1 endpoint) - Contact form
- **System API** (1 endpoint) - Health check

### Authentication

**Bearer Token (JWT):**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://haguenau.pro/api/companies
```

**API Key:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://haguenau.pro/api/companies
```

### Rate Limits

- **Public endpoints:** 100 requests / 15 minutes
- **Authenticated endpoints:** 1000 requests / 15 minutes

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **React 19** - UI library

### Database & ORM
- **PostgreSQL** - Relational database
- **Prisma 6.17** - Next-generation ORM
- **Neon** - Serverless PostgreSQL

### Authentication
- **NextAuth.js 5** - Authentication library
- **Google OAuth** - Social login provider
- **JWT** - Token-based authentication

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS
- **Heroicons** - Beautiful SVG icons
- **Headless UI** - Unstyled accessible components

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### API & Documentation
- **OpenAPI 3.0** - API specification
- **Swagger UI** - Interactive documentation
- **swagger-jsdoc** - JSDoc to OpenAPI converter

### Payment & Billing
- **Stripe** - Payment processing
- **Stripe Checkout** - Hosted payment pages
- **Stripe Webhooks** - Event handling

### Image & Media
- **Cloudinary** - Image hosting and optimization
- **Sharp** - Image processing
- **QR Code** - QR code generation

### Email
- **Resend** - Transactional email service
- **React Email** - Email templates

### Analytics & Monitoring
- **Vercel Analytics** - Web vitals and performance
- **Custom Analytics** - Event tracking system

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

### Deployment
- **Vercel** - Hosting and deployment
- **Edge Runtime** - Global edge network
- **ISR** - Incremental Static Regeneration

---

## 📁 Project Structure

```
multi-tenant-directory/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (119 endpoints)
│   │   │   ├── admin/            # Admin API
│   │   │   ├── ai/               # AI/ML API
│   │   │   ├── business/         # Business management
│   │   │   ├── companies/        # Companies CRUD
│   │   │   ├── mobile/           # Mobile API
│   │   │   └── ...
│   │   ├── docs/                 # API documentation (Swagger UI)
│   │   ├── admin/                # Admin panel pages
│   │   ├── business/             # Business owner dashboard
│   │   └── [domain]/             # Multi-tenant pages
│   ├── components/               # React components
│   │   ├── admin/                # Admin components
│   │   ├── business/             # Business components
│   │   ├── dashboard/            # Dashboard components
│   │   └── ui/                   # Reusable UI components
│   ├── lib/                      # Utility libraries
│   │   ├── auth.ts               # Authentication logic
│   │   ├── db.ts                 # Database client
│   │   ├── email.ts              # Email service
│   │   ├── logger.ts             # Logging utility
│   │   ├── multi-tenant-core.ts  # Multi-tenant logic
│   │   ├── swagger.ts            # OpenAPI configuration
│   │   └── ...
│   ├── types/                    # TypeScript type definitions
│   └── middleware.ts             # Next.js middleware
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── docs/
│   └── api-examples.ts           # API JSDoc annotations
├── public/                       # Static assets
├── .env.local.example            # Environment variables template
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🔑 Admin Access

### Admin Login

- **URL:** http://localhost:3000/admin/login
- **Credentials:** Defined in `.env.local`
  - `ADMIN_EMAIL`: Admin email address
  - `ADMIN_PASSWORD`: Admin password (minimum 8 characters)

### Admin Features

- **Dashboard:** Overview of platform statistics
- **Companies:** Manage all business listings
- **Categories:** Create and organize categories
- **Reviews:** Moderate and sync reviews
- **Users:** Manage admin and business owner accounts
- **Domains:** Configure SEO per domain
- **Settings:** Platform-wide configuration

---

## 👔 Business Owner Dashboard

### Access

- **URL:** http://localhost:3000/business/dashboard
- **Signup:** http://localhost:3000/business/signup

### Features

- **Profile Management:** Edit business information
- **Review Management:** Reply to and verify reviews
- **Analytics:** View business metrics and insights
- **Photo Gallery:** Upload and manage business photos
- **Business Hours:** Set regular and special hours
- **Subscription:** Manage billing and subscription
- **Email Preferences:** Configure notifications

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lekesiz/multi-tenant-directory)

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

Configure the following in Vercel dashboard:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Production URL (e.g., https://haguenau.pro)
- `NEXTAUTH_SECRET` - Secure random string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed
```

---

## 📊 Database Schema

### Main Tables

- **Company** - Business listings
- **Category** - Business categories
- **Review** - Customer reviews
- **User** - Platform users
- **BusinessOwner** - Business owner accounts
- **CompanyOwnership** - Company-owner relationships
- **Subscription** - Subscription plans
- **Domain** - Multi-tenant domain configuration
- **Photo** - Business photos
- **BusinessHours** - Operating hours
- **CompanyAnalytics** - Business metrics

### Relationships

```
Company 1---* Review
Company *---* Category
Company 1---* CompanyOwnership
Company 1---* Photo
Company 1---1 BusinessHours
Company 1---1 CompanyAnalytics
BusinessOwner 1---* CompanyOwnership
BusinessOwner 1---1 Subscription
Domain 1---* Company
```

---

## 🧪 Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests (when available)
pnpm test
```

---

## 📖 Documentation

### Wiki

Visit the [GitHub Wiki](https://github.com/lekesiz/multi-tenant-directory/wiki) for detailed documentation:

- Architecture Overview
- Multi-Tenant Implementation
- API Integration Guide
- Deployment Guide
- Troubleshooting

### API Documentation

Interactive API documentation available at:
- **Production:** https://haguenau.pro/docs
- **Local:** http://localhost:3000/docs

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for API endpoints
- Update documentation for new features

---

## 🐛 Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/lekesiz/multi-tenant-directory/issues) with:

- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a complete list of changes.

### Recent Updates (November 2025)
- ✅ **Subcategory Management** - Create and edit subcategories with full validation
- ✅ **Improved Slugify** - Proper handling of French characters and underscores
- ✅ **Manual Slug Editing** - Allow custom slug editing in category forms
- ✅ **Rich Text Improvements** - Enhanced visibility and text contrast in TipTap editor
- ✅ **Leads CSV Export** - Export leads with search functionality
- ✅ **Lead Search** - Advanced filtering by postal code and category
- ✅ **SafeHTML Enhancement** - Improved text readability in rendered HTML

### v2.0.0 (October 2025)
- ✅ Complete API documentation (119 endpoints)
- ✅ Swagger UI integration
- ✅ AI-powered features (15 endpoints)
- ✅ Business owner dashboard
- ✅ Subscription system with Stripe
- ✅ Review management system
- ✅ Photo gallery with upload
- ✅ Business hours management
- ✅ Email preferences
- ✅ Mobile API (7 endpoints)
- ✅ Developer tools (API keys, webhooks)

### v1.0.0 (September 2025)
- ✅ Initial release
- ✅ Multi-tenant architecture (21 domains)
- ✅ Admin panel
- ✅ Google OAuth integration
- ✅ Basic CRUD operations
- ✅ SEO optimization

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Vercel** - Excellent hosting platform
- **Prisma** - Best ORM for TypeScript
- **Stripe** - Reliable payment processing
- **OpenAPI Initiative** - API documentation standard

---

## 📞 Contact & Support

- **Website:** https://haguenau.pro
- **API Docs:** https://haguenau.pro/docs
- **GitHub:** https://github.com/lekesiz/multi-tenant-directory
- **Issues:** https://github.com/lekesiz/multi-tenant-directory/issues
- **Email:** support@haguenau.pro

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Made with ❤️ by NETZ Informatique**

*Empowering local businesses with modern technology*

