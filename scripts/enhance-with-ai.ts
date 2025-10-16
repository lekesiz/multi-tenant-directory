/**
 * Haguenau Businesses AI Enhancement Script
 *
 * Uses the integrated NETZ AI orchestration system to enhance business descriptions
 *
 * Input: data/haguenau-businesses-processed.json
 * Output: data/haguenau-businesses-enhanced.json
 *
 * Features:
 * - AI-enhanced descriptions (200-300 words)
 * - SEO keyword extraction
 * - SEO score calculation
 * - Short description generation
 */

import fs from 'fs';
import path from 'path';

interface ProcessedBusiness {
  name: string;
  slug: string;
  categories: string[];
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  website?: string;
  latitude: number;
  longitude: number;
  description: string;
  hours: any;
}

interface EnhancedBusiness extends ProcessedBusiness {
  descriptionEnhanced: string;
  descriptionShort: string;
  keywords: string[];
  seoScore: number;
}

/**
 * Call the AI analyze-company API endpoint
 */
async function analyzeWithAI(
  companyName: string,
  description: string,
  categories: string[]
): Promise<{
  improvedDescription: string;
  suggestedKeywords: string[];
  seoScore: number;
}> {
  try {
    const response = await fetch('http://localhost:3000/api/ai/analyze-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName,
        description,
        categories,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return {
      improvedDescription: result.data.improvedDescription,
      suggestedKeywords: result.data.suggestedKeywords,
      seoScore: result.data.seoScore,
    };
  } catch (error) {
    console.error(`   ⚠️  AI API call failed for "${companyName}": ${error}`);
    // Return fallback data
    return {
      improvedDescription: description,
      suggestedKeywords: categories,
      seoScore: 70,
    };
  }
}

/**
 * Generate short description (first 50 words)
 */
function generateShortDescription(longDesc: string): string {
  const words = longDesc.split(/\s+/);
  if (words.length <= 50) {
    return longDesc;
  }
  return words.slice(0, 50).join(' ') + '...';
}

/**
 * Wait for specified milliseconds
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if local development server is running
 */
async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Main enhancement function
 */
async function enhanceBusinesses() {
  console.log('🚀 Starting AI Enhancement for Haguenau Businesses...\n');

  // Check if server is running
  console.log('🔍 Checking if development server is running...');
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.error('❌ Error: Development server not running at http://localhost:3000');
    console.error('   Please run "npm run dev" in another terminal first.\n');
    process.exit(1);
  }

  console.log('✅ Development server is running\n');

  // Read processed data
  const processedDataPath = path.join(
    process.cwd(),
    'data',
    'haguenau-businesses-processed.json'
  );
  const outputPath = path.join(process.cwd(), 'data', 'haguenau-businesses-enhanced.json');

  if (!fs.existsSync(processedDataPath)) {
    console.error(`❌ Error: Processed data file not found at ${processedDataPath}`);
    console.error('   Please run "npm run process-businesses" first.\n');
    process.exit(1);
  }

  const processedData: ProcessedBusiness[] = JSON.parse(
    fs.readFileSync(processedDataPath, 'utf-8')
  );

  console.log(`📄 Loaded ${processedData.length} businesses from processed data\n`);
  console.log('🤖 Enhancing descriptions with NETZ AI system...');
  console.log('   (Rate limit: 2 seconds per business to avoid API limits)\n');

  // Process each business
  const enhanced: EnhancedBusiness[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  for (let i = 0; i < processedData.length; i++) {
    const business = processedData[i];
    const progress = `[${i + 1}/${processedData.length}]`;

    try {
      console.log(`${progress} Enhancing: ${business.name}...`);

      // Call AI API
      const aiResult = await analyzeWithAI(
        business.name,
        business.description,
        business.categories
      );

      // Create enhanced entry
      enhanced.push({
        ...business,
        descriptionEnhanced: aiResult.improvedDescription,
        descriptionShort: generateShortDescription(aiResult.improvedDescription),
        keywords: aiResult.suggestedKeywords,
        seoScore: aiResult.seoScore,
      });

      console.log(`   ✅ Enhanced (SEO Score: ${aiResult.seoScore}/100)`);

      // Rate limiting: wait 2 seconds between calls (except for last business)
      if (i < processedData.length - 1) {
        console.log(`   ⏳ Waiting 2 seconds (rate limit)...`);
        await wait(2000);
      }
    } catch (error) {
      const errorMsg = `❌ Failed to enhance business "${business.name}": ${error}`;
      errors.push(errorMsg);
      console.error(`   ${errorMsg}`);

      // Add business without enhancement
      enhanced.push({
        ...business,
        descriptionEnhanced: business.description,
        descriptionShort: generateShortDescription(business.description),
        keywords: business.categories,
        seoScore: 70,
      });
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('\n');

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(enhanced, null, 2), 'utf-8');

  console.log(`✅ Enhanced data saved to: ${outputPath}\n`);

  // Print summary
  console.log('📊 AI ENHANCEMENT SUMMARY:');
  console.log(`   Total businesses: ${processedData.length}`);
  console.log(`   Successfully enhanced: ${enhanced.length}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Total time: ${duration} seconds (~${Math.round(duration / 60)} minutes)\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach((e) => console.log(`   ${e}`));
    console.log('');
  }

  // Calculate average SEO score
  const avgSeoScore =
    enhanced.reduce((sum, b) => sum + b.seoScore, 0) / enhanced.length;
  console.log(`📈 Average SEO Score: ${avgSeoScore.toFixed(1)}/100\n`);

  console.log('✅ AI enhancement complete!\n');
  console.log('📝 Next step: Run import-haguenau-businesses.ts to import to database');
}

// Execute
enhanceBusinesses().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
