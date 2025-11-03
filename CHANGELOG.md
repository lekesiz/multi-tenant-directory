# Changelog

All notable changes to the Multi-Tenant Business Directory Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Subcategory creation and editing functionality with full validation
- Manual slug editing capability in category forms
- CSV export functionality for leads
- Advanced search in leads management (by postal code and category)
- Multi-language category support (French, English, German)

### Changed
- Improved slugify function to properly handle French characters and underscores
- Enhanced text visibility in RichTextEditor component
- Improved text readability in SafeHTML component with better contrast
- Updated category management UI to display parent-child relationships

### Fixed
- Cursor visibility improvements in all input fields
- Slug generation now correctly handles special characters
- Text contrast issues in rich text editor
- Build configuration for Vercel deployment

## [2.1.0] - 2025-11-03

### Added
- **Category Management Enhancements**
  - Hierarchical category system with parent-child relationships
  - Create and edit subcategories with validation
  - Manual slug editing with automatic generation fallback
  - Icon and color customization per category
  - Google Place Types mapping
  - Multi-language support (FR/EN/DE)
  - Display order customization

- **Leads Management**
  - Search functionality by postal code
  - Filter by category
  - CSV export with all lead data
  - Status tracking (new, qualified, assigned, won, lost, spam)
  - GDPR consent tracking

- **Rich Text Editing**
  - TipTap WYSIWYG editor integration
  - Image support in company descriptions
  - Link insertion
  - Improved text visibility and contrast
  - Better SafeHTML rendering

### Changed
- Upgraded to Next.js 15.5.4
- Improved database query performance with better indexing
- Enhanced slugify utility to handle French accents properly
- Updated Prisma to version 6.18.0

### Fixed
- Text readability issues in rich text content
- Slug generation for categories with special characters
- Build errors with standalone output mode
- Cursor visibility in input fields
- Email validation in leads API

## [2.0.0] - 2025-10-21

### Added
- **API Documentation**
  - 119 documented API endpoints
  - Interactive Swagger UI at `/docs`
  - Complete JSDoc annotations
  - Request/response examples
  - Authentication documentation

- **AI-Powered Features**
  - AI chat endpoint for business queries
  - Sentiment analysis for reviews
  - Automatic description generation
  - SEO keyword suggestions
  - Cover image generation

- **Business Owner Dashboard**
  - Complete profile management interface
  - Review management with reply functionality
  - Analytics dashboard with metrics
  - Photo gallery management
  - Business hours configuration
  - Email notification preferences

- **Subscription System**
  - Stripe integration for payments
  - Multiple subscription tiers (Free, Basic, Pro, Premium)
  - 14-day free trial period
  - Billing portal for self-service management
  - Webhook handling for subscription lifecycle

- **Review System**
  - Google Reviews integration
  - Review reply functionality
  - Review moderation (approve/reject)
  - Helpful vote system
  - Review reporting mechanism
  - Review verification

- **Mobile API**
  - 7 mobile-specific endpoints
  - Mobile authentication
  - Mobile configuration
  - Push notification support
  - Mobile-optimized responses

- **Developer Tools**
  - API key management
  - Webhook configuration
  - API usage tracking
  - Rate limiting
  - Developer account system

### Changed
- Complete rewrite of authentication system with NextAuth.js
- Improved multi-tenant routing logic
- Enhanced security with CSRF protection
- Better error handling and logging
- Optimized database queries with proper indexing

### Security
- Added rate limiting on all API endpoints
- Implemented CSRF token validation
- Enhanced input validation with Zod schemas
- Added SQL injection prevention
- Improved session management

## [1.5.0] - 2025-10-15

### Added
- Advanced search filters in company directory
- Split shifts support for business hours
- Automatic Google business hours synchronization
- Comprehensive validation for company API endpoints
- Performance optimizations with database indexes

### Fixed
- Build errors with lazy initialization of external services
- Prisma file tracing for Vercel deployment
- Duplicate WHERE clause in companies API
- TypeScript errors in dashboard components

## [1.0.0] - 2025-09-15

### Added
- **Multi-Tenant Architecture**
  - 21 active domains (haguenau.pro, bas-rhin.pro, etc.)
  - Domain-based tenant isolation
  - Custom branding per domain
  - Separate content per tenant

- **Company Management**
  - Complete CRUD operations for companies
  - Google Places integration
  - Category assignment
  - Photo gallery
  - Business hours management
  - Location-based search

- **Admin Dashboard**
  - Company management interface
  - User management (admin and business owners)
  - Category management
  - Domain configuration
  - Review moderation
  - Analytics overview

- **Authentication**
  - NextAuth integration
  - Google OAuth login
  - Email/password authentication
  - Role-based access control (RBAC)
  - Session management

- **SEO Optimization**
  - Dynamic sitemap generation
  - Schema.org structured data
  - Meta tags optimization
  - Open Graph tags
  - Twitter Cards
  - AI crawling policy endpoint

- **Search & Discovery**
  - Full-text search
  - Category filtering
  - Location-based search
  - Featured listings
  - Autocomplete suggestions

### Technical
- Next.js 15 with App Router
- TypeScript strict mode
- Prisma ORM with PostgreSQL
- Tailwind CSS for styling
- Vercel deployment with Edge Runtime
- Neon PostgreSQL database

## Development Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(categories): add subcategory creation functionality
fix(slugify): improve French character handling
docs(readme): update setup instructions
```

### Version Numbering

- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, minor improvements

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md with changes
3. Create git tag: `git tag -a v2.1.0 -m "Version 2.1.0"`
4. Push changes: `git push origin main --tags`
5. Deploy to production via Vercel

## Links

- [GitHub Repository](https://github.com/yourusername/multi-tenant-directory)
- [Production Site](https://haguenau.pro)
- [API Documentation](https://haguenau.pro/docs)
- [Issue Tracker](https://github.com/yourusername/multi-tenant-directory/issues)

---

**Note**: This changelog is maintained manually. For a complete list of all commits, see the [Git commit history](https://github.com/yourusername/multi-tenant-directory/commits/main).
