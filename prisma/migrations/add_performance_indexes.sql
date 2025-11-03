-- Performance Indexes Migration
-- Created: 2025-01-06
-- Purpose: Add recommended indexes for query optimization

-- Company lookups by slug (most common)
CREATE INDEX IF NOT EXISTS idx_company_slug ON "companies" (slug);

-- Company lookups by Google Place ID
CREATE INDEX IF NOT EXISTS idx_company_google_place_id ON "companies" ("googlePlaceId");

-- Company active status filter
CREATE INDEX IF NOT EXISTS idx_company_active ON "companies" ("isActive");

-- Company city filter (used in search)
CREATE INDEX IF NOT EXISTS idx_company_city ON "companies" (city);

-- Company rating sort
CREATE INDEX IF NOT EXISTS idx_company_rating ON "companies" (rating DESC);

-- Company review count sort
CREATE INDEX IF NOT EXISTS idx_company_review_count ON "companies" ("reviewCount" DESC);

-- Company last sync time
CREATE INDEX IF NOT EXISTS idx_company_last_synced ON "companies" ("lastSyncedAt");

-- CompanyContent domain lookups (used on every page)
CREATE INDEX IF NOT EXISTS idx_company_content_domain ON "company_content" ("domainId", "isVisible");

-- CompanyContent company lookups
CREATE INDEX IF NOT EXISTS idx_company_content_company ON "company_content" ("companyId");

-- Review lookups by company
CREATE INDEX IF NOT EXISTS idx_review_company ON "reviews" ("companyId", "isActive", "isApproved");

-- Review source filter
CREATE INDEX IF NOT EXISTS idx_review_source ON "reviews" (source);

-- BusinessHours company lookup
CREATE INDEX IF NOT EXISTS idx_business_hours_company ON "business_hours" ("companyId");

-- Category lookups
CREATE INDEX IF NOT EXISTS idx_category_slug ON "categories" (slug);
CREATE INDEX IF NOT EXISTS idx_category_active ON "categories" ("isActive");
CREATE INDEX IF NOT EXISTS idx_category_parent ON "categories" ("parentId");

-- CompanyCategory lookups
CREATE INDEX IF NOT EXISTS idx_company_category_company ON "company_categories" ("companyId");
CREATE INDEX IF NOT EXISTS idx_company_category_category ON "company_categories" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_company_category_primary ON "company_categories" ("isPrimary");

-- Domain lookups by name
CREATE INDEX IF NOT EXISTS idx_domain_name ON "domains" (name);
