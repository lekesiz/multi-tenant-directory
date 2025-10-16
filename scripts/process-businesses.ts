/**
 * Haguenau Businesses Data Processing Script
 *
 * Processes raw Gemini AI data into structured format ready for database import
 *
 * Input: data/haguenau-businesses-raw.json
 * Output: data/haguenau-businesses-processed.json
 *
 * Tasks:
 * - Parse and split addresses
 * - Generate unique slugs
 * - Standardize categories
 * - Parse opening hours into structured format
 * - Validate GPS coordinates
 * - Clean phone numbers
 */

import fs from 'fs';
import path from 'path';

interface RawBusiness {
  name: string;
  category: string;
  address: string;
  phone: string;
  website?: string;
  latitude: number;
  longitude: number;
  hours: string;
  description: string;
}

interface HoursStructure {
  monday: { open: boolean; openTime?: string; closeTime?: string };
  tuesday: { open: boolean; openTime?: string; closeTime?: string };
  wednesday: { open: boolean; openTime?: string; closeTime?: string };
  thursday: { open: boolean; openTime?: string; closeTime?: string };
  friday: { open: boolean; openTime?: string; closeTime?: string };
  saturday: { open: boolean; openTime?: string; closeTime?: string };
  sunday: { open: boolean; openTime?: string; closeTime?: string };
}

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
  hours: HoursStructure;
}

/**
 * Generate URL-safe slug from business name
 */
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD') // Decompose accents
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 60) + '-haguenau' // Add city suffix
  );
}

/**
 * Parse address into components
 */
function parseAddress(fullAddress: string): {
  street: string;
  city: string;
  postalCode: string;
} {
  // Format: "15 Grand Rue, 67500 Haguenau"
  // or: "Zone Commerciale du Taubenhof, Rue Georges Cuvier, 67500 Haguenau"

  const parts = fullAddress.split(',').map((s) => s.trim());

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]; // "67500 Haguenau"
    const streetParts = parts.slice(0, -1); // Everything before last comma

    // Extract postal code and city from last part
    const postalCodeMatch = lastPart.match(/(\d{5})\s+(.+)/);
    if (postalCodeMatch) {
      return {
        street: streetParts.join(', '),
        postalCode: postalCodeMatch[1],
        city: postalCodeMatch[2],
      };
    }
  }

  // Fallback
  return {
    street: fullAddress,
    city: 'Haguenau',
    postalCode: '67500',
  };
}

/**
 * Parse categories from hyphenated string
 */
function parseCategories(categoryString: string): string[] {
  // Split on hyphen and clean
  return categoryString
    .split('-')
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Normalize time format (6h30 -> 06:30)
 */
function normalizeTime(time: string): string {
  const match = time.match(/(\d{1,2})h(\d{2})/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return `${hours}:${minutes}`;
  }
  return time;
}

/**
 * Parse French day name to English
 */
function parseDayName(dayFr: string): string | null {
  const dayMap: Record<string, string> = {
    lundi: 'monday',
    mardi: 'tuesday',
    mercredi: 'wednesday',
    jeudi: 'thursday',
    vendredi: 'friday',
    samedi: 'saturday',
    dimanche: 'sunday',
  };
  return dayMap[dayFr.toLowerCase()] || null;
}

/**
 * Parse opening hours into structured format
 *
 * Examples:
 * - "Mardi-Samedi: 6h30-18h30, Dimanche: 7h-12h30, Lundi: Fermé"
 * - "Lundi-Vendredi: 8h00-12h00, 14h00-18h00, Samedi: 9h00-12h00, Dimanche: Fermé"
 * - "Ouvert tous les jours"
 * - "Sur rendez-vous"
 * - "Ouvert 24h/24"
 */
function parseHours(hoursString: string): HoursStructure {
  const defaultHours: HoursStructure = {
    monday: { open: false },
    tuesday: { open: false },
    wednesday: { open: false },
    thursday: { open: false },
    friday: { open: false },
    saturday: { open: false },
    sunday: { open: false },
  };

  // Special cases
  if (hoursString.includes('Ouvert tous les jours')) {
    return {
      monday: { open: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
      friday: { open: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { open: true, openTime: '09:00', closeTime: '18:00' },
      sunday: { open: true, openTime: '09:00', closeTime: '18:00' },
    };
  }

  if (hoursString.includes('Sur rendez-vous') || hoursString.includes('Sur RDV')) {
    return {
      monday: { open: true },
      tuesday: { open: true },
      wednesday: { open: true },
      thursday: { open: true },
      friday: { open: true },
      saturday: { open: false },
      sunday: { open: false },
    };
  }

  if (hoursString.includes('24h/24') || hoursString.includes('24/7')) {
    return {
      monday: { open: true, openTime: '00:00', closeTime: '23:59' },
      tuesday: { open: true, openTime: '00:00', closeTime: '23:59' },
      wednesday: { open: true, openTime: '00:00', closeTime: '23:59' },
      thursday: { open: true, openTime: '00:00', closeTime: '23:59' },
      friday: { open: true, openTime: '00:00', closeTime: '23:59' },
      saturday: { open: true, openTime: '00:00', closeTime: '23:59' },
      sunday: { open: true, openTime: '00:00', closeTime: '23:59' },
    };
  }

  // Parse segments (split by comma)
  const segments = hoursString.split(',').map((s) => s.trim());

  segments.forEach((segment) => {
    // Match patterns like "Mardi-Samedi: 6h30-18h30"
    const rangeMatch = segment.match(/([A-Za-zé]+)-([A-Za-zé]+):\s*(.+)/);
    if (rangeMatch) {
      const startDay = parseDayName(rangeMatch[1]);
      const endDay = parseDayName(rangeMatch[2]);
      const times = rangeMatch[3];

      if (startDay && endDay) {
        const daysOrder = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ];
        const startIdx = daysOrder.indexOf(startDay);
        const endIdx = daysOrder.indexOf(endDay);

        // Parse times (could be "6h30-18h30" or "8h00-12h00, 14h00-18h00")
        const timeMatch = times.match(/(\d{1,2}h\d{2})-(\d{1,2}h\d{2})/);
        if (timeMatch) {
          const openTime = normalizeTime(timeMatch[1]);
          const closeTime = normalizeTime(timeMatch[2]);

          // Apply to range
          for (let i = startIdx; i <= endIdx; i++) {
            const day = daysOrder[i] as keyof HoursStructure;
            defaultHours[day] = { open: true, openTime, closeTime };
          }
        }
      }
    }

    // Match single day like "Lundi: Fermé" or "Dimanche: 7h-12h30"
    const singleDayMatch = segment.match(/([A-Za-zé]+):\s*(.+)/);
    if (singleDayMatch) {
      const dayName = parseDayName(singleDayMatch[1]);
      const times = singleDayMatch[2];

      if (dayName) {
        if (times.toLowerCase().includes('fermé')) {
          defaultHours[dayName as keyof HoursStructure] = { open: false };
        } else {
          const timeMatch = times.match(/(\d{1,2}h\d{2})-(\d{1,2}h\d{2})/);
          if (timeMatch) {
            const openTime = normalizeTime(timeMatch[1]);
            const closeTime = normalizeTime(timeMatch[2]);
            defaultHours[dayName as keyof HoursStructure] = {
              open: true,
              openTime,
              closeTime,
            };
          }
        }
      }
    }
  });

  return defaultHours;
}

/**
 * Validate GPS coordinates for Haguenau bounds
 */
function validateCoordinates(lat: number, lng: number): boolean {
  // Haguenau bounds (approximate)
  const HAGUENAU_LAT_MIN = 48.78;
  const HAGUENAU_LAT_MAX = 48.85;
  const HAGUENAU_LNG_MIN = 7.75;
  const HAGUENAU_LNG_MAX = 7.82;

  return (
    lat >= HAGUENAU_LAT_MIN &&
    lat <= HAGUENAU_LAT_MAX &&
    lng >= HAGUENAU_LNG_MIN &&
    lng <= HAGUENAU_LNG_MAX
  );
}

/**
 * Main processing function
 */
async function processBusinesses() {
  console.log('🚀 Starting Haguenau Businesses Data Processing...\n');

  // Read raw data
  const rawDataPath = path.join(process.cwd(), 'data', 'haguenau-businesses-raw.json');
  const outputPath = path.join(process.cwd(), 'data', 'haguenau-businesses-processed.json');

  if (!fs.existsSync(rawDataPath)) {
    console.error(`❌ Error: Raw data file not found at ${rawDataPath}`);
    process.exit(1);
  }

  const rawData: RawBusiness[] = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

  console.log(`📄 Loaded ${rawData.length} businesses from raw data\n`);

  // Process each business
  const processed: ProcessedBusiness[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rawData.forEach((business, index) => {
    try {
      // Parse address
      const addressParts = parseAddress(business.address);

      // Generate slug
      const slug = generateSlug(business.name);

      // Parse categories
      const categories = parseCategories(business.category);

      // Parse hours
      const hours = parseHours(business.hours);

      // Validate coordinates
      if (!validateCoordinates(business.latitude, business.longitude)) {
        warnings.push(
          `⚠️  Business #${index + 1} "${business.name}" has coordinates outside Haguenau bounds: ${business.latitude}, ${business.longitude}`
        );
      }

      // Create processed entry
      processed.push({
        name: business.name,
        slug,
        categories,
        address: addressParts.street,
        city: addressParts.city,
        postalCode: addressParts.postalCode,
        phone: business.phone || '',
        website: business.website || undefined,
        latitude: business.latitude,
        longitude: business.longitude,
        description: business.description,
        hours,
      });

      console.log(`✅ [${index + 1}/${rawData.length}] Processed: ${business.name}`);
    } catch (error) {
      const errorMsg = `❌ Failed to process business #${index + 1} "${business.name}": ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  });

  console.log('\n');

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2), 'utf-8');

  console.log(`✅ Processed data saved to: ${outputPath}\n`);

  // Print summary
  console.log('📊 PROCESSING SUMMARY:');
  console.log(`   Total businesses: ${rawData.length}`);
  console.log(`   Successfully processed: ${processed.length}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach((e) => console.log(`   ${e}`));
    console.log('');
    process.exit(1);
  }

  console.log('✅ Data processing complete!\n');
  console.log('📝 Next step: Run enhance-with-ai.ts to improve descriptions');
}

// Execute
processBusinesses().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
