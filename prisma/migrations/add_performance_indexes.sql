-- Performance optimization indexes for multi-tenant directory platform
-- Focus on most frequent queries and multi-tenant patterns

-- ===========================================
-- DOMAIN TABLE INDEXES
-- ===========================================

-- Primary query: find domain by name (every request)
CREATE INDEX IF NOT EXISTS idx_domains_name_active ON domains(name) WHERE is_active = true;

-- Admin queries
CREATE INDEX IF NOT EXISTS idx_domains_is_active ON domains(is_active);
CREATE INDEX IF NOT EXISTS idx_domains_created_at ON domains(created_at DESC);

-- ===========================================
-- COMPANY TABLE INDEXES  
-- ===========================================

-- Public searches: active companies by city
CREATE INDEX IF NOT EXISTS idx_companies_city_search ON companies(city) WHERE city IS NOT NULL;

-- Slug lookup (individual company pages)
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Google Places integration
CREATE INDEX IF NOT EXISTS idx_companies_google_place_id ON companies(google_place_id) WHERE google_place_id IS NOT NULL;

-- Location-based searches
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Category searches (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_companies_categories_gin ON companies USING gin(categories);

-- Search by rating (high-rated companies first)
CREATE INDEX IF NOT EXISTS idx_companies_rating_desc ON companies(rating DESC NULLS LAST) WHERE rating IS NOT NULL;

-- Admin sorting
CREATE INDEX IF NOT EXISTS idx_companies_created_at_desc ON companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_updated_at_desc ON companies(updated_at DESC);

-- Company name search (case insensitive)
CREATE INDEX IF NOT EXISTS idx_companies_name_text ON companies USING gin(to_tsvector('french', name));

-- ===========================================
-- COMPANY_CONTENT TABLE INDEXES (CRITICAL FOR MULTI-TENANT)
-- ===========================================

-- Most critical: tenant isolation by domain
CREATE INDEX IF NOT EXISTS idx_company_content_domain_visible ON company_content(domain_id, is_visible);

-- Individual company content lookup
CREATE INDEX IF NOT EXISTS idx_company_content_company_domain ON company_content(company_id, domain_id);

-- Featured/promoted content
CREATE INDEX IF NOT EXISTS idx_company_content_priority_featured ON company_content(domain_id, priority DESC, featured_until) 
  WHERE is_visible = true AND (featured_until IS NULL OR featured_until > NOW());

-- Admin content management
CREATE INDEX IF NOT EXISTS idx_company_content_updated_at ON company_content(updated_at DESC);

-- ===========================================
-- REVIEW TABLE INDEXES
-- ===========================================

-- Company reviews lookup (most frequent)
CREATE INDEX IF NOT EXISTS idx_reviews_company_approved ON reviews(company_id, is_approved, review_date DESC);

-- Review moderation
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved_date ON reviews(is_approved, created_at DESC);

-- Source-based queries
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);

-- Rating-based sorting
CREATE INDEX IF NOT EXISTS idx_reviews_rating_date ON reviews(company_id, rating DESC, review_date DESC);

-- ===========================================
-- USER TABLE INDEXES
-- ===========================================

-- Authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Role-based access
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===========================================
-- LEGAL_PAGE TABLE INDEXES
-- ===========================================

-- Public page lookup
CREATE INDEX IF NOT EXISTS idx_legal_pages_slug_active ON legal_pages(slug, is_active);

-- Domain-specific legal pages
CREATE INDEX IF NOT EXISTS idx_legal_pages_domain_active ON legal_pages(domain_id, is_active) WHERE domain_id IS NOT NULL;

-- Global legal pages (null domain_id)
CREATE INDEX IF NOT EXISTS idx_legal_pages_global_active ON legal_pages(is_active) WHERE domain_id IS NULL;

-- ===========================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ===========================================

-- Tenant + visible companies with content
CREATE INDEX IF NOT EXISTS idx_tenant_companies_visible ON company_content(domain_id, is_visible, company_id)
  INCLUDE (custom_description, meta_title, priority);

-- Location + category search
CREATE INDEX IF NOT EXISTS idx_companies_location_category ON companies(city, categories) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Company content with priority and dates
CREATE INDEX IF NOT EXISTS idx_company_content_domain_priority_date ON company_content(domain_id, is_visible, priority DESC, created_at DESC);

-- ===========================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- ===========================================

-- Only index visible content (saves space)
CREATE INDEX IF NOT EXISTS idx_company_content_visible_only ON company_content(domain_id, company_id, priority DESC) 
  WHERE is_visible = true;

-- Only index approved reviews (saves space)
CREATE INDEX IF NOT EXISTS idx_reviews_approved_only ON reviews(company_id, review_date DESC, rating DESC) 
  WHERE is_approved = true;

-- Only index companies with location data
CREATE INDEX IF NOT EXISTS idx_companies_with_location ON companies(city, rating DESC) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ===========================================
-- ANALYZE TABLES AFTER INDEX CREATION
-- ===========================================

ANALYZE domains;
ANALYZE companies;  
ANALYZE company_content;
ANALYZE reviews;
ANALYZE users;
ANALYZE legal_pages;