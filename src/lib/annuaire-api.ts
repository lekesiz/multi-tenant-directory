import { logger } from '@/lib/logger';

/**
 * Annuaire des Entreprises API Client
 * Official French government business directory
 * API: https://recherche-entreprises.api.gouv.fr/
 */

// Base API URL
const ANNUAIRE_API_BASE = 'https://recherche-entreprises.api.gouv.fr';

// Types for API responses
export interface AnnuaireCompany {
  siren: string;
  nom_complet: string;
  nom_raison_sociale: string;
  sigle?: string;
  nombre_etablissements: number;
  siege: AnnuaireEtablissement;
  dirigeants?: AnnuaireDirigeant[];
  date_creation?: string;
  date_creation_formate?: string;
  tranche_effectif_salarie?: string;
  categorie_entreprise?: string;
  nature_juridique?: string;
  section_activite_principale?: string;
  activite_principale?: string;
  matching_etablissements?: AnnuaireEtablissement[];
}

export interface AnnuaireEtablissement {
  siret: string;
  siege_pm: boolean;
  etat_administratif: string;
  date_creation?: string;
  enseigne?: string;
  activite_principale?: string;
  libelle_activite_principale?: string;
  tranche_effectif_salarie?: string;
  date_debut_activite?: string;
  etat_administratif_unite_legale?: string;

  // Address fields
  geo_adresse?: string;
  latitude?: number;
  longitude?: number;
  code_postal?: string;
  commune?: string;
  libelle_commune?: string;
  code_commune?: string;
  cedex?: string;

  // Contact
  liste_idcc?: number[];
  liste_rge?: string[];
  liste_uai?: string[];
}

export interface AnnuaireDirigeant {
  nom: string;
  prenoms?: string;
  annee_de_naissance?: string;
  nationalite?: string;
  date_mise_a_jour?: string;
  qualite?: string;
}

export interface AnnuaireSearchResponse {
  results: AnnuaireCompany[];
  total_results: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Search companies by SIRET number
 */
export async function searchBySiret(siret: string): Promise<AnnuaireCompany | null> {
  try {
    // Validate SIRET format (14 digits)
    const cleanSiret = siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(cleanSiret)) {
      logger.error('Invalid SIRET format', { siret });
      throw new Error('SIRET doit contenir exactement 14 chiffres');
    }

    const url = `${ANNUAIRE_API_BASE}/search?q=${cleanSiret}&page=1&per_page=1`;

    logger.info('Searching Annuaire API by SIRET', { siret: cleanSiret });

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error('Annuaire API request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: AnnuaireSearchResponse = await response.json();

    if (data.results.length === 0) {
      logger.info('No company found for SIRET', { siret: cleanSiret });
      return null;
    }

    logger.info('Company found via SIRET', {
      siret: cleanSiret,
      siren: data.results[0].siren,
      name: data.results[0].nom_complet,
    });

    return data.results[0];
  } catch (error) {
    logger.error('Error searching by SIRET', { error, siret });
    throw error;
  }
}

/**
 * Search companies by SIREN number
 */
export async function searchBySiren(siren: string): Promise<AnnuaireCompany | null> {
  try {
    // Validate SIREN format (9 digits)
    const cleanSiren = siren.replace(/\s/g, '');
    if (!/^\d{9}$/.test(cleanSiren)) {
      logger.error('Invalid SIREN format', { siren });
      throw new Error('SIREN doit contenir exactement 9 chiffres');
    }

    const url = `${ANNUAIRE_API_BASE}/search?q=${cleanSiren}&page=1&per_page=1`;

    logger.info('Searching Annuaire API by SIREN', { siren: cleanSiren });

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error('Annuaire API request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: AnnuaireSearchResponse = await response.json();

    if (data.results.length === 0) {
      logger.info('No company found for SIREN', { siren: cleanSiren });
      return null;
    }

    logger.info('Company found via SIREN', {
      siren: cleanSiren,
      name: data.results[0].nom_complet,
      nbEtablissements: data.results[0].nombre_etablissements,
    });

    return data.results[0];
  } catch (error) {
    logger.error('Error searching by SIREN', { error, siren });
    throw error;
  }
}

/**
 * Search companies by name and optional city
 */
export async function searchByName(
  name: string,
  city?: string,
  page: number = 1,
  perPage: number = 10
): Promise<AnnuaireSearchResponse> {
  try {
    let query = name;
    if (city) {
      query += ` ${city}`;
    }

    const url = `${ANNUAIRE_API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;

    logger.info('Searching Annuaire API by name', { name, city, page, perPage });

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error('Annuaire API request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data: AnnuaireSearchResponse = await response.json();

    logger.info('Search results from Annuaire API', {
      query,
      totalResults: data.total_results,
      resultsCount: data.results.length,
    });

    return data;
  } catch (error) {
    logger.error('Error searching by name', { error, name, city });
    throw error;
  }
}

/**
 * Extract company data from Annuaire response and format for our database
 */
export function extractCompanyData(company: AnnuaireCompany) {
  const siege = company.siege;

  return {
    // Official government data
    siren: company.siren,
    siret: siege.siret,
    legalForm: company.nature_juridique || null,
    legalStatus: siege.etat_administratif || null,
    nafCode: company.activite_principale || null,
    employeeCount: parseEmployeeRange(company.tranche_effectif_salarie),
    foundingDate: company.date_creation ? new Date(company.date_creation) : null,
    isVerified: true,
    lastVerifiedAt: new Date(),

    // Basic company info
    name: company.nom_complet || company.nom_raison_sociale,

    // Address
    address: siege.geo_adresse || null,
    city: siege.libelle_commune || siege.commune || null,
    postalCode: siege.code_postal || null,
    latitude: siege.latitude || null,
    longitude: siege.longitude || null,

    // Activity
    categories: siege.libelle_activite_principale ? [siege.libelle_activite_principale] : [],
  };
}

/**
 * Parse employee range string to approximate number
 */
function parseEmployeeRange(range?: string): number | null {
  if (!range) return null;

  // Employee ranges from INSEE:
  // NN: Non employeur
  // 00: 0 salarié
  // 01: 1 ou 2 salariés
  // 02: 3 à 5 salariés
  // 03: 6 à 9 salariés
  // 11: 10 à 19 salariés
  // 12: 20 à 49 salariés
  // 21: 50 à 99 salariés
  // 22: 100 à 199 salariés
  // 31: 200 à 249 salariés
  // 32: 250 à 499 salariés
  // 41: 500 à 999 salariés
  // 42: 1 000 à 1 999 salariés
  // 51: 2 000 à 4 999 salariés
  // 52: 5 000 à 9 999 salariés
  // 53: 10 000 salariés et plus

  const rangeMap: { [key: string]: number } = {
    'NN': 0,
    '00': 0,
    '01': 1,
    '02': 4,
    '03': 7,
    '11': 14,
    '12': 34,
    '21': 74,
    '22': 149,
    '31': 224,
    '32': 374,
    '41': 749,
    '42': 1499,
    '51': 3499,
    '52': 7499,
    '53': 10000,
  };

  return rangeMap[range] || null;
}

/**
 * Get human-readable legal form
 */
export function formatLegalForm(code?: string): string {
  if (!code) return 'Non spécifié';

  const legalForms: { [key: string]: string } = {
    '5499': 'SARL',
    '5710': 'SAS',
    '5720': 'SASU',
    '5202': 'EURL',
    '1000': 'Entrepreneur individuel',
    '5510': 'SA',
    '6220': 'GIE',
    '5770': 'SELAS',
    '9220': 'Association',
  };

  return legalForms[code] || code;
}
