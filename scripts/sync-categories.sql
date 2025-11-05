-- Script to synchronize company categories from categories array to company_categories junction table
-- This script will populate the company_categories table based on the categories array in the companies table

DO $$
DECLARE
    company_record RECORD;
    category_slug TEXT;
    category_record RECORD;
    position INT;
BEGIN
    RAISE NOTICE 'Starting company categories synchronization...';
    
    -- Loop through all companies that have categories
    FOR company_record IN 
        SELECT id, name, categories 
        FROM companies 
        WHERE array_length(categories, 1) > 0
    LOOP
        RAISE NOTICE 'Processing company: % (ID: %)', company_record.name, company_record.id;
        RAISE NOTICE '  Categories: %', array_to_string(company_record.categories, ', ');
        
        position := 0;
        
        -- Loop through each category slug in the array
        FOREACH category_slug IN ARRAY company_record.categories
        LOOP
            -- Find the category by slug
            SELECT id, namefr INTO category_record
            FROM categories
            WHERE slug = category_slug;
            
            IF FOUND THEN
                -- Check if the association already exists
                IF NOT EXISTS (
                    SELECT 1 FROM company_categories 
                    WHERE companyid = company_record.id 
                    AND categoryid = category_record.id
                ) THEN
                    -- Insert the association
                    INSERT INTO company_categories (companyid, categoryid, isprimary, createdat)
                    VALUES (
                        company_record.id,
                        category_record.id,
                        position = 0, -- First category is primary
                        NOW()
                    );
                    RAISE NOTICE '    ✓ Added category: % (ID: %)', category_record.namefr, category_record.id;
                ELSE
                    RAISE NOTICE '    - Already exists: % (ID: %)', category_record.namefr, category_record.id;
                END IF;
            ELSE
                RAISE NOTICE '    ✗ Category not found: %', category_slug;
            END IF;
            
            position := position + 1;
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Synchronization completed!';
END $$;

-- Show summary
SELECT 
    'Total companies with categories' as metric,
    COUNT(*) as count
FROM companies 
WHERE array_length(categories, 1) > 0

UNION ALL

SELECT 
    'Total company-category associations' as metric,
    COUNT(*) as count
FROM company_categories;
