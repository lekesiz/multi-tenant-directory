-- Enable Row-Level Security for multi-tenant isolation
-- This ensures that each tenant (domain) can only access their own data

-- Enable RLS on tenant-sensitive tables
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS domains ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy for companies
-- Companies are accessible if they have content visible on the current tenant domain
CREATE POLICY IF NOT EXISTS tenant_companies ON companies
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM company_content cc 
      JOIN domains d ON cc.domain_id = d.id 
      WHERE cc.company_id = companies.id 
      AND d.name = current_setting('app.current_tenant', true)
      AND cc.is_visible = true
    )
  );

-- Create tenant isolation policy for company_content
-- Content is only accessible for the current tenant domain
CREATE POLICY IF NOT EXISTS tenant_company_content ON company_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM domains d
      WHERE d.id = company_content.domain_id
      AND d.name = current_setting('app.current_tenant', true)
    )
  );

-- Create tenant isolation policy for reviews
-- Reviews are accessible if the company is visible on current tenant domain
CREATE POLICY IF NOT EXISTS tenant_reviews ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      JOIN company_content cc ON c.id = cc.company_id
      JOIN domains d ON cc.domain_id = d.id
      WHERE c.id = reviews.company_id
      AND d.name = current_setting('app.current_tenant', true)
      AND cc.is_visible = true
    )
  );

-- Admin bypass policy - admins can access all data
-- This allows admin panel to work across all tenants
CREATE POLICY IF NOT EXISTS admin_bypass_companies ON companies
  FOR ALL
  TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY IF NOT EXISTS admin_bypass_company_content ON company_content
  FOR ALL
  TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY IF NOT EXISTS admin_bypass_reviews ON reviews
  FOR ALL
  TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');

-- Domain table is always accessible for reference
CREATE POLICY IF NOT EXISTS public_domains ON domains
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin can modify domains
CREATE POLICY IF NOT EXISTS admin_domains ON domains
  FOR ALL
  TO authenticated
  USING (current_setting('app.user_role', true) = 'admin');