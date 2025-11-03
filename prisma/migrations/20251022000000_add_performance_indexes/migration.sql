-- Database Performance Optimization Migration
-- Date: 2025-10-22
-- Purpose: Add missing indexes for common query patterns

-- 1. Full-text search index for company names
-- Improves search performance by 10-50x
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm 
ON companies USING gin (name gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Array search index for categories
-- Improves category filtering performance
CREATE INDEX IF NOT EXISTS idx_companies_categories_gin 
ON companies USING gin (categories);

-- 3. Composite index for active companies by city and rating
-- Optimizes homepage and city pages
CREATE INDEX IF NOT EXISTS idx_companies_city_active_rating 
ON companies (city, is_active, rating DESC NULLS LAST)
WHERE is_active = true;

-- 4. Composite index for featured companies
-- Optimizes featured listings
CREATE INDEX IF NOT EXISTS idx_companies_featured_active 
ON companies (is_featured, featured_until, rating DESC)
WHERE is_featured = true AND is_active = true;

-- 5. Partial index for active subscriptions
-- Optimizes subscription queries
CREATE INDEX IF NOT EXISTS idx_companies_active_subscriptions 
ON companies (subscription_status, subscription_end)
WHERE subscription_status IN ('active', 'trialing');

-- 6. Composite index for company content visibility
-- Already exists but ensure it's optimal
-- @@index([domainId, isVisible, priority(sort: Desc)])

-- 7. Index for review aggregation queries
CREATE INDEX IF NOT EXISTS idx_reviews_company_rating_date 
ON reviews (company_id, rating, review_date DESC)
WHERE is_approved = true AND is_active = true;

-- 8. Partial index for pending reviews (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_reviews_pending_approval 
ON reviews (created_at DESC)
WHERE is_approved = false;

-- 9. Index for analytics queries (if CompanyAnalytics exists)
-- This will be added when we see the full schema

-- 10. Composite index for geo-spatial queries (future optimization)
-- Note: This requires PostGIS extension
-- CREATE INDEX IF NOT EXISTS idx_companies_location_gist 
-- ON companies USING gist (ll_to_earth(latitude, longitude));

-- Statistics update
-- Force PostgreSQL to update table statistics for better query planning
ANALYZE companies;
ANALYZE reviews;
ANALYZE company_content;
ANALYZE domains;

-- Vacuum to reclaim space and update statistics
VACUUM ANALYZE companies;
VACUUM ANALYZE reviews;

