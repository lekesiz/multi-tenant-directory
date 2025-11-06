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

## [2.1.1] - 2025-11-06

### Added
- **Business Hours System Overhaul**
  - Multiple time slots per day support (e.g., 09:00-12:00, 14:00-18:00)
  - Timezone support (default: Europe/Paris)
  - Backward compatibility with legacy single-shift format
  - Data normalization for both old and new formats
  - Clean data payload before API submission

### Changed
- **Company Profile Page**
  - Removed rating display (★ 5.0, X avis) from company name header
  - Rating information remains in reviews section to avoid duplication

### Fixed
- **Business Hours Management**
  - Fixed HTTP method (changed from POST to PUT)
  - Added missing timezone field in API payload
  - Fixed visitor-side display component to support multiple shifts
  - Improved data validation and error handling
  - Fixed "Invalid business hours data" error

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
  - Improved text visibility and contrast
  - SafeHTML component for secure content rendering

- **Activity System (Blog-Style Posts)**
  - Create and manage business activities
  - Multiple activity types: Announcements, Events, Offers, Updates, Stories, News
  - AI-powered content generation with Gemini
  - Image generation with Gemini Nano
  - Video generation with Veo 3
  - Social media sharing (Facebook, Twitter, LinkedIn, Instagram)
  - Publishing and scheduling capabilities
  - Engagement metrics tracking

### Changed
- Enhanced category management UI with better parent-child relationship display
- Improved text readability across all rich text components
- Updated admin panel with new category and leads management features

### Fixed
- Text contrast issues in rich text editor
- Cursor visibility in input fields
- Build configuration for Vercel deployment

## [2.0.0] - 2025-10-22

### Added
- **Multi-Tenant Architecture**
  - 22 active domains with single codebase
  - Domain-specific content and SEO
  - Dynamic routing based on host domain

- **Business Owner Dashboard**
  - Comprehensive management panel
  - Review management with reply functionality
  - Analytics dashboard with real-time metrics
  - Photo gallery with multi-upload support
  - Business hours management
  - Email notification preferences

- **Admin Panel**
  - Full company CRUD operations
  - User management (admin and business owner roles)
  - Category management with hierarchical structure
  - Lead management with search and export
  - Review moderation (approve, reject, sync)
  - Domain SEO configuration
  - Bulk operations support

- **AI Features**
  - AI-powered business descriptions
  - Sentiment analysis for reviews
  - Smart search with suggestions
  - SEO content generation
  - Cover image generation

- **Subscription & Billing**
  - Stripe integration
  - Multiple subscription tiers (Basic, Pro, Enterprise)
  - Self-service billing portal
  - Automated subscription lifecycle
  - Featured listing purchase

- **API & Documentation**
  - 119 documented REST API endpoints
  - Interactive Swagger UI at /docs
  - API key management
  - Webhook support
  - Rate limiting

- **SEO & Analytics**
  - Dynamic sitemap generation
  - Structured data (JSON-LD)
  - Meta tags (Open Graph, Twitter Cards)
  - Core Web Vitals monitoring
  - Google Maps integration

### Changed
- Migrated from Pages Router to App Router (Next.js 15)
- Updated authentication to NextAuth.js v5
- Improved mobile responsiveness
- Enhanced accessibility (WCAG 2.1 AA)

### Fixed
- Build errors related to Next.js 15 params handling
- Authentication import issues
- Database migration conflicts
- Vercel deployment configuration

## [1.0.0] - 2025-09-15

### Added
- Initial release
- Basic company directory functionality
- Simple search and filtering
- Contact form
- Admin panel for company management

---

For more details on each release, see the [commit history](https://github.com/lekesiz/multi-tenant-directory/commits/main).
