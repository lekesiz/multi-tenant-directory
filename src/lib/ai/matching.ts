import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface Lead {
  id: string;
  tenantId: number;
  categoryId?: number | null;
  category?: { frenchName: string; googleCategory: string } | null;
  postalCode: string;
  phone: string;
  email?: string | null;
  note?: string | null;
  budgetBand?: string | null;
  timeWindow?: string | null;
  createdAt: Date;
}

export interface Company {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  categories: string[];
  googleCategory?: string | null;
  companyScore?: {
    qualityScore: number;
    priceIndex: number;
    responseSLA: number;
    acceptanceRate: number;
    certifications: string[];
  };
  reviews?: Array<{
    rating: number;
    comment?: string;
  }>;
  ownerships?: Array<{
    owner: {
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  }>;
}

export interface MatchResult {
  company: Company;
  score: number;
  reasons: string[];
  explanation: string;
}

/**
 * Ana AI eşleştirme fonksiyonu
 * Lead'i en uygun firmalarla eşleştirir
 */
export async function matchLeadToCompanies(
  lead: Lead,
  tenantId: number
): Promise<MatchResult[]> {
  try {
    logger.info(`Starting AI matching for lead ${lead.id}`);

    // 1. Uygun firmaları bul
    const eligibleCompanies = await findEligibleCompanies(lead, tenantId);
    
    if (eligibleCompanies.length === 0) {
      logger.warn(`No eligible companies found for lead ${lead.id}`);
      return [];
    }

    // 2. Her firma için skor hesapla
    const matchResults = await Promise.all(
      eligibleCompanies.map(async (company) => {
        const score = await calculateMatchScore(lead, company);
        return score;
      })
    );

    // 3. Skorlara göre sırala ve en iyi 5'i al
    const topMatches = matchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    logger.info(`Lead ${lead.id} matched with ${topMatches.length} companies`);
    return topMatches;

  } catch (error) {
    logger.error('Error in AI matching:', error);
    throw error;
  }
}

/**
 * Lead için uygun firmaları bulur
 */
async function findEligibleCompanies(lead: Lead, tenantId: number): Promise<Company[]> {
  const whereClause: any = {
    isActive: true,
    tenantId: tenantId,
  };

  // Kategori filtresi
  if (lead.category?.googleCategory) {
    whereClause.categories = {
      has: lead.category.googleCategory
    };
  }

  // Posta kodu yakınlığı (basit implementasyon)
  if (lead.postalCode) {
    // İlk 2 hanesi aynı olan posta kodları (yaklaşık 50km yarıçap)
    const postalPrefix = lead.postalCode.substring(0, 2);
    whereClause.postalCode = {
      startsWith: postalPrefix
    };
  }

  const companies = await prisma.company.findMany({
    where: whereClause,
    include: {
      companyScore: true,
      ownerships: {
        include: {
          owner: true
        }
      }
    }
  });

  return companies.map(company => ({
    id: company.id,
    name: company.name,
    description: null, // Company model doesn't have description field
    address: company.address,
    postalCode: company.postalCode,
    phone: company.phone,
    email: company.email,
    website: company.website,
    categories: company.categories,
    googleCategory: company.googlePlaceId, // Using googlePlaceId instead
    companyScore: company.companyScore ? {
      qualityScore: company.companyScore.qualityScore,
      priceIndex: company.companyScore.priceIndex,
      responseSLA: company.companyScore.responseSLA,
      acceptanceRate: company.companyScore.acceptanceRate,
      certifications: company.companyScore.certifications
    } : undefined,
    ownerships: company.ownerships?.map(o => ({
      owner: {
        email: o.owner.email,
        firstName: o.owner.firstName,
        lastName: o.owner.lastName
      }
    }))
  }));
}

/**
 * Lead ve firma arasındaki eşleştirme skorunu hesaplar
 */
async function calculateMatchScore(lead: Lead, company: Company): Promise<MatchResult> {
  const reasons: string[] = [];
  let totalScore = 0;

  // 1. Kalite Skoru (40% ağırlık)
  const qualityScore = calculateQualityScore(company, reasons);
  totalScore += qualityScore * 0.4;

  // 2. Yanıt Süresi (25% ağırlık)
  const responseScore = calculateResponseScore(company, lead, reasons);
  totalScore += responseScore * 0.25;

  // 3. Fiyat Rekabeti (20% ağırlık)
  const priceScore = calculatePriceScore(company, lead, reasons);
  totalScore += priceScore * 0.2;

  // 4. Sertifikalar ve Uzmanlık (15% ağırlık)
  const certificationScore = calculateCertificationScore(company, lead, reasons);
  totalScore += certificationScore * 0.15;

  // Skorları 0-100 aralığına normalize et
  const normalizedScore = Math.min(100, Math.max(0, totalScore));

  return {
    company,
    score: normalizedScore,
    reasons,
    explanation: generateExplanation(company, normalizedScore, reasons)
  };
}

/**
 * Kalite skorunu hesaplar (0-100)
 */
function calculateQualityScore(company: Company, reasons: string[]): number {
  let score = 50; // Base score

  // Company score varsa kullan
  if (company.companyScore) {
    score = company.companyScore.qualityScore;
    reasons.push(`Kalite skoru: ${score.toFixed(1)}/100`);
  } else {
    // Fallback: temel kalite göstergeleri
    if (company.description && company.description.length > 50) {
      score += 10;
      reasons.push('Detaylı açıklama mevcut');
    }
    if (company.website) {
      score += 10;
      reasons.push('Web sitesi mevcut');
    }
    if (company.email) {
      score += 5;
      reasons.push('Email iletişim');
    }
  }

  return Math.min(100, score);
}

/**
 * Yanıt süresi skorunu hesaplar (0-100)
 */
function calculateResponseScore(company: Company, lead: Lead, reasons: string[]): number {
  let score = 50; // Base score

  if (company.companyScore) {
    const responseSLA = company.companyScore.responseSLA;
    
    // SLA'ya göre skor hesapla (dakika cinsinden)
    if (responseSLA <= 60) { // 1 saat içinde
      score = 100;
      reasons.push('Çok hızlı yanıt (1 saat içinde)');
    } else if (responseSLA <= 240) { // 4 saat içinde
      score = 80;
      reasons.push('Hızlı yanıt (4 saat içinde)');
    } else if (responseSLA <= 1440) { // 24 saat içinde
      score = 60;
      reasons.push('Normal yanıt süresi (24 saat içinde)');
    } else {
      score = 30;
      reasons.push('Yavaş yanıt süresi');
    }
  } else {
    // Fallback: temel iletişim bilgileri
    if (company.phone) {
      score += 20;
      reasons.push('Telefon iletişim mevcut');
    }
    if (company.email) {
      score += 10;
      reasons.push('Email iletişim mevcut');
    }
  }

  return Math.min(100, score);
}

/**
 * Fiyat rekabeti skorunu hesaplar (0-100)
 */
function calculatePriceScore(company: Company, lead: Lead, reasons: string[]): number {
  let score = 50; // Base score

  if (company.companyScore) {
    const priceIndex = company.companyScore.priceIndex;
    
    // Lead'in bütçe tercihine göre skor ayarla
    if (lead.budgetBand === 'low') {
      // Düşük bütçe için düşük fiyatlı firmalar tercih edilir
      score = Math.max(0, 100 - priceIndex);
      reasons.push(`Düşük fiyatlı seçenek (${priceIndex.toFixed(1)}/100)`);
    } else if (lead.budgetBand === 'high') {
      // Yüksek bütçe için kaliteli firmalar tercih edilir
      score = priceIndex;
      reasons.push(`Premium seçenek (${priceIndex.toFixed(1)}/100)`);
    } else {
      // Orta bütçe için dengeli fiyat
      score = Math.max(0, 100 - Math.abs(50 - priceIndex));
      reasons.push(`Dengeli fiyat (${priceIndex.toFixed(1)}/100)`);
    }
  } else {
    // Fallback: temel bilgiler
    score = 50;
    reasons.push('Fiyat bilgisi mevcut değil');
  }

  return Math.min(100, score);
}

/**
 * Sertifika ve uzmanlık skorunu hesaplar (0-100)
 */
function calculateCertificationScore(company: Company, lead: Lead, reasons: string[]): number {
  let score = 0;

  if (company.companyScore?.certifications) {
    const certifications = company.companyScore.certifications;
    
    // Her sertifika için puan ver
    certifications.forEach(cert => {
      switch (cert) {
        case 'RGE':
          score += 25;
          reasons.push('RGE sertifikası (enerji verimliliği)');
          break;
        case 'QUALIBAT':
          score += 20;
          reasons.push('QUALIBAT sertifikası (inşaat)');
          break;
        case 'QUALITENR':
          score += 20;
          reasons.push('QUALITENR sertifikası (enerji)');
          break;
        case 'RC_PRO':
          score += 15;
          reasons.push('RC_PRO sigortası');
          break;
        case 'DECENNALE':
          score += 15;
          reasons.push('Décennale sigortası');
          break;
        default:
          score += 5;
          reasons.push(`${cert} sertifikası`);
      }
    });
  }

  // Kategori uzmanlığı
  if (lead.category?.googleCategory && company.categories.includes(lead.category.googleCategory)) {
    score += 10;
    reasons.push('Kategori uzmanlığı');
  }

  return Math.min(100, score);
}

/**
 * Eşleştirme açıklaması oluşturur
 */
function generateExplanation(company: Company, score: number, reasons: string[]): string {
  const scoreLevel = score >= 80 ? 'Mükemmel' : score >= 60 ? 'İyi' : score >= 40 ? 'Orta' : 'Düşük';
  
  return `${company.name} ile ${scoreLevel} eşleşme (${score.toFixed(1)}/100). ${reasons.slice(0, 3).join(', ')}.`;
}

/**
 * Placeholder fonksiyon - API endpoint'inde kullanılır
 */
export function generateCompanyMatchScore(lead: Lead, company: Company): number {
  // Bu fonksiyon artık kullanılmıyor, calculateMatchScore kullanılıyor
  // Geriye uyumluluk için bırakıldı
  return 50; // Default score
}
