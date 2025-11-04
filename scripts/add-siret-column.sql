-- Add siret column to companies table
-- SIRET is a 14-digit establishment identifier (SIREN + 5 digits) used in France

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'siret'
  ) THEN
    ALTER TABLE companies ADD COLUMN siret VARCHAR(14) UNIQUE;
    COMMENT ON COLUMN companies.siret IS '14-digit establishment identifier (SIREN + 5 digits)';
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_companies_siret ON companies(siret);
    
    RAISE NOTICE 'Column siret added successfully to companies table';
  ELSE
    RAISE NOTICE 'Column siret already exists in companies table';
  END IF;
END $$;
